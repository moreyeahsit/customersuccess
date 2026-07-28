import { Component, type ErrorInfo, type ReactNode } from 'react'
import { AlertTriangle } from 'lucide-react'

interface Props {
  children: ReactNode
  /** Render a card that fits inside the existing app shell instead of taking over the whole screen. */
  compact?: boolean
}

interface State {
  error: Error | null
}

function ErrorCard({ error }: { error: Error }) {
  return (
    <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
      <AlertTriangle className="mx-auto mb-3 h-8 w-8 text-bad-500" />
      <h1 className="text-lg font-semibold text-slate-800">Something went wrong</h1>
      <p className="mt-2 text-sm text-slate-500">
        This is often caused by incomplete data in the workbook — e.g. a customer row added to one sheet without a
        matching row in another (like Financials or Journey). Check that sheet against the customer that was most
        recently edited, or reload to try again.
      </p>
      <pre className="mt-4 max-h-32 overflow-auto rounded-lg bg-slate-100 p-3 text-left text-xs text-slate-600">
        {error.message}
      </pre>
      <button
        onClick={() => window.location.reload()}
        className="mt-6 w-full rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600"
      >
        Reload
      </button>
    </div>
  )
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Vantage crashed:', error, info.componentStack)
  }

  render() {
    if (!this.state.error) return this.props.children

    if (this.props.compact) {
      return (
        <div className="flex items-center justify-center py-16">
          <ErrorCard error={this.state.error} />
        </div>
      )
    }

    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50 p-6">
        <ErrorCard error={this.state.error} />
      </div>
    )
  }
}
