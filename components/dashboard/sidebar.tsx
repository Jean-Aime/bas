'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useBusiness } from '@/lib/auth/business-context';
import { cn } from '@/lib/utils';
import { NAV_GROUPS, isNavActive } from '@/components/dashboard/nav-config';
import { Logo } from '@/components/ui/logo';
import {
  MessageSquare, ChevronsLeft, ChevronsRight, Building2, Plus, Check,
} from 'lucide-react';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
  DropdownMenuLabel, DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

const COLLAPSE_KEY = 'bas_sidebar_collapsed';

export function DashboardSidebar() {
  const pathname = usePathname();
  const { businesses, currentBusiness, switchBusiness } = useBusiness();
  const [collapsed, setCollapsed] = useState(false);

  // Restore collapse state and expose width to the layout via CSS var.
  useEffect(() => {
    const stored = localStorage.getItem(COLLAPSE_KEY) === '1';
    setCollapsed(stored);
  }, []);

  useEffect(() => {
    document.documentElement.style.setProperty('--sidebar-w', collapsed ? '4rem' : '15rem');
  }, [collapsed]);

  const toggleCollapse = () => {
    setCollapsed((c) => {
      localStorage.setItem(COLLAPSE_KEY, c ? '0' : '1');
      return !c;
    });
  };

  return (
    <aside
      className={cn(
        'fixed inset-y-0 left-0 z-40 hidden flex-col border-r bg-sidebar transition-[width] duration-200 ease-out lg:flex',
        collapsed ? 'w-16' : 'w-60'
      )}
    >
      {/* Brand */}
      <div className={cn('flex h-16 shrink-0 items-center border-b px-4', collapsed ? 'justify-center px-0' : 'gap-2.5')}>
        <Link href="/dashboard" className="flex items-center gap-2.5 overflow-hidden">
          <Logo />
          {!collapsed && <span className="text-lg font-bold tracking-tight">BAS</span>}
        </Link>
        <button
          type="button"
          onClick={toggleCollapse}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className={cn(
            'absolute -right-3 top-[52px] z-10 hidden h-6 w-6 items-center justify-center rounded-full border bg-card text-muted-foreground shadow-sm transition-colors hover:text-foreground lg:flex',
            collapsed && 'lg:hidden'
          )}
        >
          <ChevronsLeft className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Business selector */}
      {!collapsed && (
        <div className="border-b px-3 py-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="group flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left transition-colors hover:bg-secondary"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10">
                  <Building2 className="h-4 w-4 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold leading-tight">
                    {currentBusiness?.name || 'Business'}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {businesses.length > 1 ? `${businesses.length} workspaces` : 'Workspace'}
                  </p>
                </div>
                <ChevronsRight className="h-4 w-4 rotate-90 text-muted-foreground/60 transition-transform group-hover:translate-y-0.5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-64">
              <DropdownMenuLabel>Your businesses</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {businesses.map((biz) => (
                <DropdownMenuItem
                  key={biz.id}
                  onClick={() => switchBusiness(biz.id)}
                  className="gap-2.5"
                >
                  <div className="flex h-6 w-6 items-center justify-center rounded bg-primary/10">
                    <Building2 className="h-3 w-3 text-primary" />
                  </div>
                  <span className="flex-1 truncate">{biz.name}</span>
                  {biz.id === currentBusiness?.id && <Check className="h-4 w-4 text-primary" />}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/onboarding" className="gap-2.5">
                  <Plus className="h-4 w-4" /> Add new business
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
      {collapsed && (
        <div className="flex justify-center border-b py-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                aria-label="Switch business"
                className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10"
              >
                <Building2 className="h-4 w-4 text-primary" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-64">
              {businesses.map((biz) => (
                <DropdownMenuItem key={biz.id} onClick={() => switchBusiness(biz.id)} className="gap-2.5">
                  <Building2 className="h-4 w-4 text-primary" />
                  <span className="truncate">{biz.name}</span>
                  {biz.id === currentBusiness?.id && <Check className="ml-auto h-4 w-4 text-primary" />}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      {/* Navigation */}
      <nav className="scrollbar-thin flex-1 overflow-y-auto px-3 py-4">
        {NAV_GROUPS.map((group) => (
          <div key={group.label} className="mb-5 last:mb-0">
            {!collapsed && (
              <p className="mb-1.5 px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                {group.label}
              </p>
            )}
            {collapsed && <div className="mx-auto mb-2 h-px w-6 bg-border" />}
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const active = isNavActive(pathname, item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      title={collapsed ? item.label : undefined}
                      className={cn(
                        'group relative flex items-center rounded-md text-sm font-medium transition-all duration-150',
                        collapsed ? 'justify-center px-0 py-2' : 'gap-3 px-3 py-2',
                        active
                          ? 'bg-primary/10 text-primary'
                          : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                      )}
                    >
                      {active && (
                        <span className="absolute left-0 top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-full bg-primary" />
                      )}
                      <item.icon className={cn('h-4 w-4 shrink-0', active ? 'text-primary' : 'text-muted-foreground/80 group-hover:text-foreground')} />
                      {!collapsed && <span className="truncate">{item.label}</span>}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Bottom CTA */}
      <div className="border-t p-3">
        <Link
          href="/chat"
          target="_blank"
          className={cn(
            'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground',
            collapsed && 'justify-center px-0'
          )}
        >
          <MessageSquare className="h-4 w-4 shrink-0" />
          {!collapsed && <span>Open Customer Chat</span>}
        </Link>
        {!collapsed && (
          <button
            type="button"
            onClick={toggleCollapse}
            className="mt-1 flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <ChevronsLeft className="h-4 w-4 shrink-0" />
            <span>Collapse</span>
          </button>
        )}
      </div>
    </aside>
  );
}
