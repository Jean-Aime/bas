'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useBusiness } from '@/lib/auth/business-context';
import { cn } from '@/lib/utils';
import { Zap, LayoutDashboard, MessageSquare, Users, Package, Wrench, ShoppingCart, Calendar, Inbox, Workflow, BookOpen, Plug, BarChart3, Settings } from 'lucide-react';

const navItems = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/conversations', label: 'Conversations', icon: MessageSquare },
  { href: '/dashboard/customers', label: 'Customers', icon: Users },
  { href: '/dashboard/products', label: 'Products', icon: Package },
  { href: '/dashboard/services', label: 'Services', icon: Wrench },
  { href: '/dashboard/orders', label: 'Orders', icon: ShoppingCart },
  { href: '/dashboard/bookings', label: 'Bookings', icon: Calendar },
  { href: '/dashboard/requests', label: 'Requests', icon: Inbox },
  { href: '/dashboard/automation', label: 'Automation', icon: Workflow },
  { href: '/dashboard/knowledge', label: 'Knowledge', icon: BookOpen },
  { href: '/dashboard/integrations', label: 'Integrations', icon: Plug },
  { href: '/dashboard/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
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
            <p className="text-xs font-medium text-muted-foreground truncate">{currentBusiness?.name || 'Business'}</p>
          </div>
          <ul className="space-y-1">
            {navItems.map((item) => {
              const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
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
