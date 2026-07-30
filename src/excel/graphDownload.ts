const GRAPH_BASE = 'https://graph.microsoft.com/v1.0'

const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-cache, no-store, must-revalidate',
  Pragma: 'no-cache',
}

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
  // Bypass the browser's own HTTP cache (cache: 'no-store') AND ask any
  // intermediate proxy/CDN to skip its cache too (Cache-Control/Pragma
  // headers) — a stale copy of the workbook served from either layer would
  // silently hide edits made in Excel.
  const res = await fetch(`${GRAPH_BASE}${path}`, {
    headers: { Authorization: `Bearer ${accessToken}`, ...NO_CACHE_HEADERS },
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
}

/**
 * Resolves a sharing link to its driveItem, then downloads the file's raw
 * bytes via Graph's own /content endpoint — deliberately NOT the
 * @microsoft.graph.downloadUrl shortcut, which points at a CDN-backed blob
 * URL whose caching we don't control and can't force a bypass of. Going
 * through Graph directly on every sync is the only way to guarantee we're
 * not looking at a stale cached copy.
 */
export async function downloadSharedWorkbook(shareUrl: string, accessToken: string): Promise<ArrayBuffer> {
  const encoded = encodeSharingUrl(shareUrl)
  const itemRes = await graphFetch(`/shares/${encoded}/driveItem?$select=id,name,parentReference`, accessToken)
  const item = (await itemRes.json()) as DriveItemResponse

  const driveId = item.parentReference?.driveId
  const contentPath = driveId ? `/drives/${driveId}/items/${item.id}/content` : `/shares/${encoded}/driveItem/content`
  const contentRes = await graphFetch(contentPath, accessToken)
  return contentRes.arrayBuffer()
}
