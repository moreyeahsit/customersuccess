import type { Playbook } from '@/types/customer'

const DEFAULT_PLAYBOOKS: Playbook[] = [
  {
    level: 1,
    name: 'Onboarding',
    tasks: [
      'Conduct Kickoff',
      'Setup Teams',
      'User Training',
      'Collect Stakeholders',
      'Upload Documentation',
      'Weekly Check-in',
    ],
  },
  {
    level: 2,
    name: 'Stabilization',
    tasks: ['Adoption Review', 'Executive Meeting', 'Usage Report', 'Feedback Collection', 'Success Plan'],
  },
  {
    level: 3,
    name: 'Adoption',
    tasks: ['Automation Suggestions', 'New Module Demo', 'Quarterly Review', 'ROI Presentation'],
  },
  {
    level: 4,
    name: 'Optimization',
    tasks: ['Identify Upsell', 'Case Study', 'Webinar Invite', 'Executive Workshop'],
  },
  {
    level: 5,
    name: 'Expansion',
    tasks: ['Strategic Planning', 'Multi-year Roadmap', 'Product Advisory Board', 'Co-marketing', 'Referral Program'],
  },
  {
    level: 6,
    name: 'Strategic Partner',
    tasks: ['Executive Business Review', 'Joint Roadmap Planning', 'Reference Program', 'Advisory Board Seat'],
  },
]

export let PLAYBOOKS: Playbook[] = DEFAULT_PLAYBOOKS

export function setLivePlaybooks(playbooks: Playbook[]) {
  PLAYBOOKS = playbooks
}

export function resetToSamplePlaybooks() {
  PLAYBOOKS = DEFAULT_PLAYBOOKS
}

export function playbookForLevel(level: number): Playbook {
  return PLAYBOOKS.find((p) => p.level === level) ?? PLAYBOOKS[0]
}
