import { setLiveCustomerData, resetToSampleCustomerData } from '@/data/customers'
import { setLivePlaybooks, resetToSamplePlaybooks } from '@/data/playbooks'
import { setLiveAiTaskRules, resetToSampleAiTaskRules } from '@/data/aiTaskRules'
import type { ParsedWorkbookData } from './parseWorkbook'

export function applyParsedData(data: ParsedWorkbookData) {
  setLiveCustomerData({ customers: data.customers, tasks: data.tasks, testimonials: data.testimonials })
  setLivePlaybooks(data.playbooks)
  setLiveAiTaskRules(data.aiTaskRules)
}

export function resetToSampleData() {
  resetToSampleCustomerData()
  resetToSamplePlaybooks()
  resetToSampleAiTaskRules()
}
