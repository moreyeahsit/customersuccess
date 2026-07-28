import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sparkles, Bot, User, Send } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/Card'
import { CUSTOMERS } from '@/data/customers'
import type { Customer } from '@/types/customer'
import { formatINR, formatDate } from '@/lib/format'
import { latestFinancials, sumFinancials } from '@/lib/derive'
import {
  customersAtRisk,
  expansionOpportunities,
  marginRanked,
  customersWithoutQbrThisQuarter,
  upcomingRenewals,
} from '@/lib/analytics'

interface CustomerRef {
  id: string
  name: string
  detail: string
}

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  text: string
  customers?: CustomerRef[]
}

const SUGGESTED_PROMPTS = [
  'Which customers are at highest churn risk?',
  'Which accounts have the highest expansion potential?',
  'Which customers have negative margins?',
  'Which customers require a QBR this month/quarter?',
  'Show customers with NPS below 7',
  "Predict next quarter's renewal revenue",
  'Generate an executive summary for Acme Corp',
  'Suggest actions to improve profitability for Stark Industries',
]

let msgCounter = 0
function nextId(): string {
  msgCounter += 1
  return `msg-${msgCounter}`
}

function resolveCustomer(text: string): Customer | undefined {
  const lower = text.toLowerCase()
  const byName = CUSTOMERS.find((c) => lower.includes(c.name.toLowerCase()))
  if (byName) return byName
  return CUSTOMERS.find((c) => lower.includes(c.id.replace(/-/g, ' ')))
}

function answerQuery(raw: string): { text: string; customers?: CustomerRef[] } {
  const q = raw.trim().toLowerCase()

  if (/churn risk|at risk/.test(q)) {
    const top = customersAtRisk().slice(0, 5)
    return {
      text: `Here are the ${top.length} customers with the highest churn risk, ranked by lowest health score:`,
      customers: top.map((c) => ({ id: c.id, name: c.name, detail: `Health ${c.healthScore}/100 · ${c.industry}` })),
    }
  }

  if (/expansion potential|expansion opportunit/.test(q)) {
    const top = expansionOpportunities().slice(0, 5)
    return {
      text: `The accounts with the highest expansion potential (blended readiness + upsell propensity) are:`,
      customers: top.map(({ customer, score }) => ({ id: customer.id, name: customer.name, detail: `${score}% propensity` })),
    }
  }

  if (/negative margin/.test(q)) {
    const negative = marginRanked().filter((m) => m.marginPct < 0)
    if (negative.length === 0) {
      return { text: 'No customers currently have a negative net margin in the mock dataset.' }
    }
    return {
      text: `${negative.length} customer${negative.length === 1 ? '' : 's'} currently show a negative net margin:`,
      customers: negative.map(({ customer, marginPct }) => ({ id: customer.id, name: customer.name, detail: `${marginPct.toFixed(1)}% margin` })),
    }
  }

  if (/qbr/.test(q)) {
    const list = customersWithoutQbrThisQuarter()
    if (list.length === 0) {
      return { text: 'Every customer already has a QBR scheduled or completed for this quarter.' }
    }
    return {
      text: `${list.length} customer${list.length === 1 ? '' : 's'} do not yet have a QBR scheduled or completed for this quarter:`,
      customers: list.map((c) => ({ id: c.id, name: c.name, detail: c.industry })),
    }
  }

  if (/nps below 7|nps.*below|low nps/.test(q)) {
    const list = CUSTOMERS.filter((c) => c.nps < 7).sort((a, b) => a.nps - b.nps)
    if (list.length === 0) {
      return { text: 'No customers currently have an NPS below 7.' }
    }
    return {
      text: `${list.length} customer${list.length === 1 ? '' : 's'} have an NPS below 7:`,
      customers: list.map((c) => ({ id: c.id, name: c.name, detail: `NPS ${c.nps}` })),
    }
  }

  if (/renewal revenue|predict.*renewal|next quarter.*renewal/.test(q)) {
    const renewals = upcomingRenewals(90)
    const total = renewals.reduce((sum, c) => sum + c.contractValue, 0)
    return {
      text: `Estimate: ${formatINR(total)} in contract value is up for renewal in the next 90 days, across ${renewals.length} customer${renewals.length === 1 ? '' : 's'}. This is a simple sum of contract values for accounts renewing in that window, not a probability-weighted forecast.`,
      customers: renewals.map((c) => ({ id: c.id, name: c.name, detail: `${formatINR(c.contractValue)} · renews ${formatDate(c.renewalDate)}` })),
    }
  }

  if (/executive summary/.test(q)) {
    const customer = resolveCustomer(raw)
    if (!customer) {
      return { text: "I couldn't match a customer name in that question — try naming one exactly, e.g. \"Generate an executive summary for Acme Corp\"." }
    }
    const fin = sumFinancials(latestFinancials(customer))
    return {
      text: `Executive summary for ${customer.name}: Health score ${customer.healthScore}/100, readiness ${customer.readinessScore}/100, NPS ${customer.nps}. Contract value is ${formatINR(customer.contractValue)} (${customer.plan} plan), renewing ${formatDate(customer.renewalDate)}. Latest quarter net margin is ${fin.marginPct.toFixed(1)}%. ${customer.hasReferenceAgreement ? 'This customer is reference-ready with an active testimonial agreement.' : 'This customer does not yet have a reference agreement in place.'}`,
      customers: [{ id: customer.id, name: customer.name, detail: `Open full 360° profile` }],
    }
  }

  if (/profitability|improve.*margin|suggest actions/.test(q)) {
    const customer = resolveCustomer(raw)
    if (!customer) {
      return { text: "I couldn't match a customer name in that question — try naming one exactly, e.g. \"Suggest actions to improve profitability for Stark Industries\"." }
    }
    const fin = sumFinancials(latestFinancials(customer))
    const suggestion =
      fin.marginPct < 15
        ? `Net margin is ${fin.marginPct.toFixed(1)}%, below the 15% healthy threshold. Consider reviewing delivery and support cost lines, evaluating whether project scope has crept beyond the original contract, and exploring a premium support tier or price adjustment at renewal.`
        : `Net margin is a healthy ${fin.marginPct.toFixed(1)}%. Delivery and support costs look well controlled relative to revenue — focus energy on retention and expansion instead of cost-cutting here.`
    return {
      text: `${customer.name}: ${suggestion}`,
      customers: [{ id: customer.id, name: customer.name, detail: 'Open Financials tab' }],
    }
  }

  return {
    text: "I don't have an answer for that yet — try one of the suggested questions below.",
  }
}

export function AiCopilotPage() {
  const navigate = useNavigate()
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: nextId(),
      role: 'assistant',
      text: "Hi, I'm the Vantage Copilot — a simulated assistant that answers questions by running deterministic queries over this prototype's mock customer data (no live AI model is called). Ask me about churn risk, expansion, margins, QBRs, NPS, renewals, or a specific account, or try one of the suggested questions below.",
    },
  ])
  const [input, setInput] = useState('')

  function submit(question: string) {
    const trimmed = question.trim()
    if (!trimmed) return
    const userMsg: ChatMessage = { id: nextId(), role: 'user', text: trimmed }
    const answer = answerQuery(trimmed)
    const assistantMsg: ChatMessage = { id: nextId(), role: 'assistant', text: answer.text, customers: answer.customers }
    setMessages((prev) => [...prev, userMsg, assistantMsg])
    setInput('')
  }

  return (
    <div>
      <PageHeader
        title="AI Copilot"
        subtitle="Ask questions over the customer portfolio — answered by local logic over mock data, not a live model"
      />

      <Card padded={false} className="flex flex-col overflow-hidden">
        <div className="flex flex-col gap-4 p-5" style={{ minHeight: 360, maxHeight: 520, overflowY: 'auto' }}>
          {messages.map((m) => (
            <div key={m.id} className={`flex items-start gap-2.5 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                  m.role === 'user' ? 'bg-brand-600 text-white' : 'bg-brand-50 text-brand-700'
                }`}
              >
                {m.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
              </div>
              <div className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm ${
                m.role === 'user' ? 'bg-brand-600 text-white' : 'border border-slate-200 bg-slate-50 text-slate-700'
              }`}>
                <p>{m.text}</p>
                {m.customers && m.customers.length > 0 && (
                  <div className="mt-2 space-y-1.5">
                    {m.customers.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => navigate(`/customers/${c.id}`)}
                        className="flex w-full items-center justify-between rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-left text-xs hover:bg-brand-50"
                      >
                        <span className="font-medium text-slate-800">{c.name}</span>
                        <span className="text-slate-500">{c.detail}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-slate-100 p-4">
          <div className="mb-3 flex flex-wrap gap-2">
            {SUGGESTED_PROMPTS.map((p) => (
              <button
                key={p}
                onClick={() => submit(p)}
                className="inline-flex items-center gap-1 rounded-full border border-brand-100 bg-brand-50 px-3 py-1.5 text-xs font-medium text-brand-700 hover:bg-brand-100"
              >
                <Sparkles className="h-3 w-3" /> {p}
              </button>
            ))}
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              submit(input)
            }}
            className="flex items-center gap-2"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about churn risk, expansion, margins, QBRs, NPS, renewals, or a customer name…"
              className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none placeholder:text-slate-400 focus:border-brand-500"
            />
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
            >
              <Send className="h-4 w-4" /> Send
            </button>
          </form>
        </div>
      </Card>
    </div>
  )
}
