import { readFileSync } from 'node:fs'
import { parseWorkbook } from '../src/excel/parseWorkbook'
import { CUSTOMERS, ALL_TASKS, ALL_TESTIMONIALS } from '../src/data/customers'
import { PLAYBOOKS } from '../src/data/playbooks'
import { AI_TASK_RULES } from '../src/data/aiTaskRules'

const nodeBuf = readFileSync('excel-template/QuikitCS_Data.xlsx')
const arrayBuffer = nodeBuf.buffer.slice(nodeBuf.byteOffset, nodeBuf.byteOffset + nodeBuf.byteLength)

const parsed = parseWorkbook(arrayBuffer)

let failures = 0
function check(label: string, cond: boolean) {
  console.log(`${cond ? 'PASS' : 'FAIL'} — ${label}`)
  if (!cond) failures++
}

check('customer count matches', parsed.customers.length === CUSTOMERS.length)
check('task count matches', parsed.tasks.length === ALL_TASKS.length)
check('testimonial count matches', parsed.testimonials.length === ALL_TESTIMONIALS.length)
check('playbook count matches', parsed.playbooks.length === PLAYBOOKS.length)
check('ai rule count matches', parsed.aiTaskRules.length === AI_TASK_RULES.length)

const acme = parsed.customers.find((c) => c.id === 'acme-corp')
const acmeOrig = CUSTOMERS.find((c) => c.id === 'acme-corp')!
check('acme found', !!acme)
if (acme) {
  check('acme.name matches', acme.name === acmeOrig.name)
  check('acme.healthScore matches', acme.healthScore === acmeOrig.healthScore)
  check('acme.readinessScore matches', acme.readinessScore === acmeOrig.readinessScore)
  check('acme.contractValue matches', acme.contractValue === acmeOrig.contractValue)
  check('acme.customerSince matches', acme.customerSince === acmeOrig.customerSince)
  check('acme.renewalDate matches', acme.renewalDate === acmeOrig.renewalDate)
  check('acme.hasReferenceAgreement matches', acme.hasReferenceAgreement === acmeOrig.hasReferenceAgreement)
  check('acme.techStack matches', JSON.stringify(acme.techStack) === JSON.stringify(acmeOrig.techStack))
  check('acme.healthIndicators count matches', acme.healthIndicators.length === acmeOrig.healthIndicators.length)
  check('acme.readinessDimensions count matches', acme.readinessDimensions.length === acmeOrig.readinessDimensions.length)
  check('acme.financials count matches', acme.financials.length === acmeOrig.financials.length)
  check('acme.financials[0] revenue matches', acme.financials[0].recurringRevenue === acmeOrig.financials[0].recurringRevenue)
  check('acme.ltv.predictedLtv matches', acme.ltv.predictedLtv === acmeOrig.ltv.predictedLtv)
  check('acme.ltv.ltvTrend count matches', acme.ltv.ltvTrend.length === acmeOrig.ltv.ltvTrend.length)
  check('acme.journey count matches', acme.journey.length === acmeOrig.journey.length)
  check('acme.journey[8].status matches (current)', acme.journey[8].status === acmeOrig.journey[8].status)
  check('acme.contacts count matches', acme.contacts.length === acmeOrig.contacts.length)
  check('acme.expansionProducts count matches', acme.expansionProducts.length === acmeOrig.expansionProducts.length)
  check('acme.qbrs count matches', acme.qbrs.length === acmeOrig.qbrs.length)
}

const acmeTasks = parsed.tasks.filter((t) => t.customerId === 'acme-corp')
check('acme has AI-sourced tasks with reasons', acmeTasks.some((t) => t.source === 'AI' && !!t.reason))

console.log(failures === 0 ? '\nALL CHECKS PASSED' : `\n${failures} CHECK(S) FAILED`)
process.exit(failures === 0 ? 0 : 1)
