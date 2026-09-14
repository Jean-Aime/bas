'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useBusiness } from '@/lib/auth/business-context';
import { cn } from '@/lib/utils';
import {
  Zap, LayoutDashboard, MessageSquare, Users, Package, Wrench, ShoppingCart, Calendar, Inbox,
  Workflow, BookOpen, Globe, Radio, Bot, BarChart3, Bell, Activity, ScrollText, Users2,
  Plug, Settings, Code2, LifeBuoy,
} from 'lucide-react';

const NAV_GROUPS: { label: string; items: { href: string; label: string; icon: typeof Zap }[] }[] = [
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
    items: [
      { href: '/dashboard/team', label: 'Team', icon: Users2 },
    ],
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

export function DashboardSidebar() {
  const pathname = usePathname();
  const { currentBusiness } = useBusiness();

  return (
    <>
      {/* Mobile overlay handled by topbar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 flex-col border-r bg-white lg:flex">
        <div className="flex h-16 items-center gap-2 border-b px-6">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Zap className="h-4 w-4" />
          </div>
          <span className="font-bold">BAS</span>
        </div>
        <nav className="flex-1 overflow-y-auto p-3">
          <div className="mb-3 px-3">
            <p className="truncate text-xs font-medium text-muted-foreground">{currentBusiness?.name || 'Business'}</p>
          </div>
          {NAV_GROUPS.map((group) => (
            <div key={group.label} className="mb-4">
              <p className="mb-1 px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">{group.label}</p>
              <ul className="space-y-0.5">
                {group.items.map((item) => {
                  const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={cn(
                          'flex items-center gap-3 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
                          active ? 'bg-primary text-primary-foreground' : 'text-slate-600 hover:bg-slate-100'
                        )}
                      >
                        <item.icon className="h-4 w-4 shrink-0" />
                        <span className="truncate">{item.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
        <div className="border-t p-3">
          <Link
            href="/chat"
            target="_blank"
            className="flex items-center gap-3 rounded-lg bg-slate-100 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200"
          >
            <MessageSquare className="h-4 w-4 shrink-0" />
            <span>Open Customer Chat</span>
          </Link>
        </div>
      </aside>
    </>
  );
}