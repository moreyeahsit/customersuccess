const GRAPH_BASE = 'https://graph.microsoft.com/v1.0'

/**
 * Encodes a SharePoint/OneDrive sharing URL into the "shares" API's expected
 * format: base64 the URL, make it URL-safe, strip padding, prefix with "u!".
 * https://learn.microsoft.com/en-us/graph/api/shares-get
 */
function encodeSharingUrl(shareUrl: string): string {
  const base64 = btoa(unescape(encodeURIComponent(shareUrl)))
  const urlSafe = base64.replace(/=+$/, '').replace(/\//g, '_').replace(/\+/g, '-')
  return `u!${urlSafe}`
}

async function graphFetch(path: string, accessToken: string): Promise<Response> {
  const res = await fetch(`${GRAPH_BASE}${path}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: 'no-store',
  })
  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`Microsoft Graph request failed (${res.status} ${res.statusText}): ${path}\n${body.slice(0, 300)}`)
  }
  return res
}

interface DriveItemResponse {
  id: string
  name: string
  parentReference?: { driveId?: string }
  '@microsoft.graph.downloadUrl'?: string
}

/** Resolves a sharing link to its driveItem, then downloads the file's raw bytes. */
export async function downloadSharedWorkbook(shareUrl: string, accessToken: string): Promise<ArrayBuffer> {
  const encoded = encodeSharingUrl(shareUrl)
  const itemRes = await graphFetch(`/shares/${encoded}/driveItem?$select=id,name,parentReference`, accessToken)
  const item = (await itemRes.json()) as DriveItemResponse

  // Prefer the pre-authenticated download URL Graph hands back — it's a direct,
  // CORS-enabled link to blob storage, so this avoids proxying the whole file
  // through a second authenticated Graph call.
  const withDownloadUrl = await graphFetch(
    `/shares/${encoded}/driveItem?$select=@microsoft.graph.downloadUrl`,
    accessToken,
  )
  const { '@microsoft.graph.downloadUrl': downloadUrl } = (await withDownloadUrl.json()) as DriveItemResponse

  if (downloadUrl) {
    const fileRes = await fetch(downloadUrl, { cache: 'no-store' })
    if (fileRes.ok) return fileRes.arrayBuffer()
  }

  // Fallback: fetch content directly through Graph (requires the bearer token).
  const driveId = item.parentReference?.driveId
  const contentPath = driveId ? `/drives/${driveId}/items/${item.id}/content` : `/shares/${encoded}/driveItem/content`
  const contentRes = await graphFetch(contentPath, accessToken)
  return contentRes.arrayBuffer()
}
