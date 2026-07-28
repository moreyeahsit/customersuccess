import {
  LayoutDashboard,
  Users,
  CheckSquare,
  BookOpen,
  RefreshCw,
  HeartPulse,
  Route,
  MessageSquareQuote,
  Presentation,
  BarChart3,
  Table2,
  Sparkles,
  Settings,
  type LucideIcon,
} from 'lucide-react'

export interface NavItem {
  label: string
  path: string
  icon: LucideIcon
}

export const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', path: '/', icon: LayoutDashboard },
  { label: 'Customers', path: '/customers', icon: Users },
  { label: 'Tasks', path: '/tasks', icon: CheckSquare },
  { label: 'Playbooks', path: '/playbooks', icon: BookOpen },
  { label: 'Renewals', path: '/renewals', icon: RefreshCw },
  { label: 'Health Center', path: '/health-center', icon: HeartPulse },
  { label: 'Customer Journey', path: '/journey', icon: Route },
  { label: 'Testimonials', path: '/testimonials', icon: MessageSquareQuote },
  { label: 'QBR', path: '/qbr', icon: Presentation },
  { label: 'Reports', path: '/reports', icon: BarChart3 },
  { label: 'Pivot Report', path: '/financial-pivot', icon: Table2 },
  { label: 'AI Copilot', path: '/copilot', icon: Sparkles },
  { label: 'Administration', path: '/admin', icon: Settings },
]
