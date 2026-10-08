'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useBusiness } from '@/lib/auth/business-context';
import { cn } from '@/lib/utils';
import {
  Zap, LayoutDashboard, MessageSquare, Users, Package, Wrench,
  ShoppingCart, Calendar, Inbox, Workflow, BookOpen, Globe, Radio,
  Bot, BarChart3, Bell, Activity, ScrollText, Users2, Plug, Settings,
  Code2, LifeBuoy, ChevronRight,
} from 'lucide-react';
import { useState } from 'react';

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  badge?: string;
}

interface NavGroup {
  label: string;
  items: NavItem[];
  collapsible?: boolean;
}

const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Overview',
    items: [
      { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    ],
  },
  {
    label: 'Customers',
    items: [
      { href: '/dashboard/conversations', label: 'Conversations', icon: MessageSquare },
      { href: '/dashboard/customers', label: 'Customers', icon: Users },
    ],
  },
  {
    label: 'Catalog',
    items: [
      { href: '/dashboard/products', label: 'Products', icon: Package },
      { href: '/dashboard/services', label: 'Services', icon: Wrench },
    ],
  },
  {
    label: 'Operations',
    items: [
      { href: '/dashboard/orders', label: 'Orders', icon: ShoppingCart },
      { href: '/dashboard/bookings', label: 'Bookings', icon: Calendar },
      { href: '/dashboard/requests', label: 'Requests', icon: Inbox },
    ],
  },
  {
    label: 'Automation',
    items: [
      { href: '/dashboard/automation', label: 'Workflows', icon: Workflow },
      { href: '/dashboard/knowledge', label: 'Knowledge', icon: BookOpen },
      { href: '/dashboard/ai', label: 'AI Assistant', icon: Bot },
      { href: '/dashboard/channels', label: 'Channels', icon: Radio },
      { href: '/dashboard/website', label: 'Website', icon: Globe },
    ],
  },
  {
    label: 'Insights',
    collapsible: true,
    items: [
      { href: '/dashboard/analytics', label: 'Analytics', icon: BarChart3 },
      { href: '/dashboard/activity', label: 'Activity', icon: Activity },
      { href: '/dashboard/audit-logs', label: 'Audit Logs', icon: ScrollText },
      { href: '/dashboard/notifications', label: 'Notifications', icon: Bell },
    ],
  },
  {
    label: 'Workspace',
    collapsible: true,
    items: [
      { href: '/dashboard/team', label: 'Team', icon: Users2 },
      { href: '/dashboard/integrations', label: 'Integrations', icon: Plug },
      { href: '/dashboard/settings', label: 'Settings', icon: Settings },
      { href: '/dashboard/developer', label: 'Developer', icon: Code2 },
      { href: '/dashboard/help', label: 'Help', icon: LifeBuoy },
    ],
  },
];

function NavGroup({ group, pathname }: { group: NavGroup; pathname: string }) {
  const isAnyActive = group.items.some(
    (item) => pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
  );
  const [open, setOpen] = useState(!group.collapsible || isAnyActive);

  return (
    <div className="mb-2">
      {group.collapsible ? (
        <button
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          className="flex w-full items-center justify-between px-3 py-1.5 mb-0.5 group/label"
        >
          <span
            className="text-[10px] font-semibold uppercase transition-colors group-hover/label:text-white/50"
            style={{ letterSpacing: '0.14em', color: 'hsl(var(--sidebar-muted))' }}
          >
            {group.label}
          </span>
          <ChevronRight
            className={cn(
              'h-3 w-3 transition-transform duration-300 ease-out',
              open ? 'rotate-90' : 'rotate-0'
            )}
            style={{ color: 'hsl(var(--sidebar-muted))' }}
          />
        </button>
      ) : (
        <p
          className="px-3 py-1.5 mb-0.5 text-[10px] font-semibold uppercase"
          style={{ letterSpacing: '0.14em', color: 'hsl(var(--sidebar-muted))' }}
        >
          {group.label}
        </p>
      )}

      {open && (
        <ul className="space-y-0.5">
          {group.items.map((item) => {
            const active = pathname === item.href ||
              (item.href !== '/dashboard' && pathname.startsWith(item.href));
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn('sidebar-item', active && 'active')}
                >
                  {active && (
                    <span
                      aria-hidden
                      className="absolute left-0 top-1/2 h-4 w-[3px] -translate-y-1/2 rounded-r-full"
                      style={{ background: 'hsl(var(--sidebar-active))' }}
                    />
                  )}
                  <item.icon className="h-4 w-4 shrink-0 sidebar-icon transition-colors" />
                  <span className="truncate text-[13px]">{item.label}</span>
                  {item.badge && (
                    <span className="ml-auto flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-semibold"
                      style={{ background: 'hsl(var(--sidebar-active) / 0.18)', color: 'hsl(var(--sidebar-active))' }}>
                      {item.badge}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export function DashboardSidebar() {
  const pathname = usePathname();
  const { currentBusiness } = useBusiness();

  return (
    <aside
      className="fixed inset-y-0 left-0 z-40 hidden w-[var(--sidebar-width)] flex-col lg:flex"
      style={{ background: 'hsl(var(--sidebar-bg))' }}
    >
      {/* Brand */}
      <div
        className="flex h-16 items-center gap-2.5 px-5 shrink-0"
        style={{ borderBottom: '1px solid hsl(var(--sidebar-border))' }}
      >
        <div className="flex h-7 w-7 items-center justify-center rounded-lg brand-fill">
          <Zap className="h-3.5 w-3.5 text-white" strokeWidth={2.5} />
        </div>
        <span className="text-[13px] font-bold tracking-[0.12em]" style={{ color: 'hsl(var(--sidebar-fg))' }}>
          BAS
        </span>
        <span
          className="ml-auto rounded px-1.5 py-0.5 text-[9px] font-semibold uppercase"
          style={{ letterSpacing: '0.1em', background: 'hsl(var(--sidebar-active) / 0.14)', color: 'hsl(var(--sidebar-active))' }}
        >
          Beta
        </span>
      </div>

      {/* Active business */}
      {currentBusiness && (
        <div className="px-4 py-3.5 shrink-0" style={{ borderBottom: '1px solid hsl(var(--sidebar-border))' }}>
          <div className="flex items-center gap-2.5">
            <div
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-[11px] font-bold"
              style={{ background: 'hsl(var(--sidebar-active) / 0.16)', color: 'hsl(var(--sidebar-active))' }}
            >
              {currentBusiness.name.slice(0, 1).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p
                className="text-[9px] font-semibold uppercase leading-none mb-1"
                style={{ letterSpacing: '0.14em', color: 'hsl(var(--sidebar-muted))' }}
              >
                Workspace
              </p>
              <p className="truncate text-[13px] font-semibold leading-none" style={{ color: 'hsl(var(--sidebar-fg))' }}>
                {currentBusiness.name}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto scrollbar-thin py-3 px-2">
        {NAV_GROUPS.map((group) => (
          <NavGroup key={group.label} group={group} pathname={pathname} />
        ))}
      </nav>

      {/* Footer — open customer chat */}
      <div className="shrink-0 p-3" style={{ borderTop: '1px solid hsl(var(--sidebar-border))' }}>
        <Link
          href="/chat"
          target="_blank"
          className="press group flex items-center gap-2.5 rounded-md px-3 py-2.5 text-[13px] font-medium"
          style={{
            background: 'hsl(var(--sidebar-active) / 0.14)',
            color: 'hsl(var(--sidebar-active))',
            border: '1px solid hsl(var(--sidebar-active) / 0.3)',
          }}
        >
          <MessageSquare className="h-4 w-4 shrink-0" />
          <span>Open customer chat</span>
          <span className="ml-auto text-[11px] opacity-60 transition-transform duration-300 ease-out group-hover:translate-x-0.5">↗</span>
        </Link>
      </div>
    </aside>
  );
}
