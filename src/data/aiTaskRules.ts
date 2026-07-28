export interface AiTaskRule {
  trigger: string
  generatedTask: string
}

const DEFAULT_AI_TASK_RULES: AiTaskRule[] = [
  { trigger: "Customer hasn't logged in for 14 days", generatedTask: 'Schedule adoption meeting' },
  { trigger: 'Support tickets increased 40%', generatedTask: 'Review customer pain points' },
  { trigger: 'Profit margin below 20%', generatedTask: 'Review project profitability' },
  { trigger: 'Renewal in 90 days', generatedTask: 'Prepare renewal strategy' },
  { trigger: 'Executive sponsor changed', generatedTask: 'Reconnect with new leadership' },
  { trigger: 'Low meeting attendance', generatedTask: 'Book executive alignment' },
  { trigger: 'Customer completed implementation', generatedTask: 'Collect testimonial' },
  { trigger: 'Project closed successfully', generatedTask: 'Create case study' },
]

export let AI_TASK_RULES: AiTaskRule[] = DEFAULT_AI_TASK_RULES

export function setLiveAiTaskRules(rules: AiTaskRule[]) {
  AI_TASK_RULES = rules
}

export function resetToSampleAiTaskRules() {
  AI_TASK_RULES = DEFAULT_AI_TASK_RULES
}
