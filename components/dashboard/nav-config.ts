import {
  LayoutDashboard, MessageSquare, Users, Package, Wrench, ShoppingCart, Calendar, Inbox,
  Workflow, BookOpen, Globe, Radio, Bot, BarChart3, Bell, Activity, ScrollText, Users2,
  Plug, Settings, Code2, LifeBuoy, type LucideIcon,
} from 'lucide-react';

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export const NAV_GROUPS: { label: string; items: NavItem[] }[] = [
  {
    label: 'Main',
    items: [
      { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
      { href: '/dashboard/conversations', label: 'Conversations', icon: MessageSquare },
      { href: '/dashboard/customers', label: 'Customers', icon: Users },
      { href: '/dashboard/products', label: 'Products', icon: Package },
      { href: '/dashboard/services', label: 'Services', icon: Wrench },
      { href: '/dashboard/orders', label: 'Orders', icon: ShoppingCart },
      { href: '/dashboard/bookings', label: 'Bookings', icon: Calendar },
      { href: '/dashboard/calendar', label: 'Calendar', icon: Calendar },
      { href: '/dashboard/requests', label: 'Requests', icon: Inbox },
    ],
  },
  {
    label: 'Automation',
    items: [
      { href: '/dashboard/automation', label: 'Automation', icon: Workflow },
      { href: '/dashboard/automation/templates', label: 'Templates', icon: Workflow },
      { href: '/dashboard/knowledge', label: 'Knowledge', icon: BookOpen },
      { href: '/dashboard/website', label: 'Website', icon: Globe },
      { href: '/dashboard/channels', label: 'Channels', icon: Radio },
      { href: '/dashboard/ai', label: 'AI Assistant', icon: Bot },
    ],
  },
  {
    label: 'Insights',
    items: [
      { href: '/dashboard/analytics', label: 'Analytics', icon: BarChart3 },
      { href: '/dashboard/notifications', label: 'Notifications', icon: Bell },
      { href: '/dashboard/activity', label: 'Activity', icon: Activity },
      { href: '/dashboard/audit-logs', label: 'Audit Logs', icon: ScrollText },
    ],
  },
  {
    label: 'Team',
    items: [{ href: '/dashboard/team', label: 'Team', icon: Users2 }],
  },
  {
    label: 'System',
    items: [
      { href: '/dashboard/integrations', label: 'Integrations', icon: Plug },
      { href: '/dashboard/settings', label: 'Settings', icon: Settings },
      { href: '/dashboard/developer', label: 'Developer', icon: Code2 },
      { href: '/dashboard/help', label: 'Help', icon: LifeBuoy },
    ],
  },
];

/** True when a nav item should render as active for the given pathname. */
export function isNavActive(pathname: string, href: string): boolean {
  if (href === '/dashboard') return pathname === '/dashboard';
  return pathname === href || pathname.startsWith(href + '/');
}
