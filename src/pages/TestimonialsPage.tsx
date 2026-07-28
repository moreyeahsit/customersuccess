import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Video, Star, Sparkles } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardHeader } from '@/components/ui/Card'
import { StatTile } from '@/components/ui/StatTile'
import { Pill } from '@/components/ui/HealthBadge'
import { ALL_TESTIMONIALS, CUSTOMERS, getCustomer } from '@/data/customers'
import { referenceCustomers } from '@/lib/analytics'
import { formatDate } from '@/lib/format'
import type { TestimonialType } from '@/types/customer'

export function TestimonialsPage() {
  const navigate = useNavigate()
  const [filterType, setFilterType] = useState<'All' | TestimonialType>('All')

  const refs = referenceCustomers()
  const videoCount = ALL_TESTIMONIALS.filter((t) => t.type === 'Video').length
  const reviewCount = ALL_TESTIMONIALS.length - videoCount
  const customerIdsWithTestimonials = new Set(ALL_TESTIMONIALS.map((t) => t.customerId))
  const highNpsNoTestimonial = CUSTOMERS.filter((c) => c.nps >= 9 && !customerIdsWithTestimonials.has(c.id))
  const opportunities = CUSTOMERS.filter((c) => c.nps >= 8 && !customerIdsWithTestimonials.has(c.id)).sort(
    (a, b) => b.nps - a.nps,
  )

  const types = Array.from(new Set(ALL_TESTIMONIALS.map((t) => t.type)))
  const filtered = filterType === 'All' ? ALL_TESTIMONIALS : ALL_TESTIMONIALS.filter((t) => t.type === filterType)

  return (
    <div>
      <PageHeader
        title="Testimonial Center"
        subtitle={`${ALL_TESTIMONIALS.length} testimonials collected · ${refs.length} reference customers`}
      />

      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatTile label="Total Testimonials" value={String(ALL_TESTIMONIALS.length)} icon={Star} />
        <StatTile label="Reference Customers" value={String(refs.length)} icon={Star} sub="testimonial-ready" />
        <StatTile label="Video vs Written/Review" value={`${videoCount} / ${reviewCount}`} icon={Video} />
        <StatTile
          label="NPS ≥ 9, No Testimonial"
          value={String(highNpsNoTestimonial.length)}
          icon={Sparkles}
          sub="AI outreach opportunity"
        />
      </div>

      <Card className="mb-6">
        <CardHeader
          title="All Testimonials"
          subtitle={`${filtered.length} shown`}
          action={
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as 'All' | TestimonialType)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-brand-500 focus:outline-none"
            >
              <option value="All">All Types</option>
              {types.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          }
        />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((t) => {
            const customer = getCustomer(t.customerId)
            return (
              <div key={t.id} className="flex flex-col rounded-lg border border-slate-100 p-4">
                <div className="mb-2 flex items-center gap-2">
                  {t.type === 'Video' ? (
                    <Video className="h-3.5 w-3.5 text-brand-600" />
                  ) : (
                    <Star className="h-3.5 w-3.5 text-warn-500" />
                  )}
                  <span className="text-xs font-medium text-slate-500">{t.type}</span>
                  {t.isReferenceCustomer && <Pill tone="good">Reference</Pill>}
                </div>
                <p className="flex-1 text-sm italic text-slate-700">&ldquo;{t.quote}&rdquo;</p>
                <div className="mt-3 text-xs text-slate-500">
                  {t.author}, {t.role} · {formatDate(t.date)}
                </div>
                {customer && (
                  <button
                    onClick={() => navigate(`/customers/${customer.id}`)}
                    className="mt-2 self-start text-xs font-medium text-brand-600 hover:underline"
                  >
                    {customer.name}
                  </button>
                )}
              </div>
            )
          })}
          {filtered.length === 0 && <p className="text-sm text-slate-400">No testimonials of this type.</p>}
        </div>
      </Card>

      <Card>
        <CardHeader title="Testimonial Opportunities" subtitle="High-NPS customers without a testimonial yet" />
        <div className="space-y-2">
          {opportunities.map((c) => (
            <div key={c.id} className="flex items-center justify-between rounded-lg border border-slate-100 p-3">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-sm font-semibold text-brand-700">
                  {c.logoInitial}
                </div>
                <div>
                  <button
                    onClick={() => navigate(`/customers/${c.id}`)}
                    className="text-sm font-medium text-slate-800 hover:underline"
                  >
                    {c.name}
                  </button>
                  <div className="text-xs text-slate-500">NPS {c.nps}</div>
                </div>
              </div>
              <button className="rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-700">
                Request Testimonial
              </button>
            </div>
          ))}
          {opportunities.length === 0 && <p className="text-sm text-slate-400">No outstanding opportunities right now.</p>}
        </div>
      </Card>
    </div>
  )
}
