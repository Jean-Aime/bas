'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  BookOpen,
  Workflow,
  Settings,
  MessageSquare,
} from 'lucide-react';

interface Tab {
  href: string;
  label: string;
  icon: React.ElementType;
}

/* Primary product destinations — four tabs plus the reserved
   conversation action. Same ink chrome as the sidebar and topbar. */
const TABS: Tab[] = [
  { href: '/dashboard', label: 'Home', icon: LayoutDashboard },
  { href: '/dashboard/knowledge', label: 'Knowledge', icon: BookOpen },
  { href: '/dashboard/automation', label: 'Automation', icon: Workflow },
  { href: '/dashboard/settings', label: 'Account', icon: Settings },
];

export function MobileNav() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(href);

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-chrome-border bg-chrome pb-[env(safe-area-inset-bottom)] lg:hidden"
    >
      <div className="grid h-16 grid-cols-5 items-center">
        {TABS.map((tab) => {
          const active = isActive(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'relative flex h-full flex-col items-center justify-center gap-1 transition-colors',
                active ? 'text-chrome-fg' : 'text-chrome-muted'
              )}
            >
              {active && (
                <span
                  aria-hidden
                  className="absolute top-0 h-[2px] w-7 bg-chrome-active"
                />
              )}
              <tab.icon
                className={cn('h-[18px] w-[18px]', active && 'text-chrome-active')}
                strokeWidth={active ? 2.2 : 1.8}
              />
              <span
                className={cn(
                  'text-[10px] leading-none',
                  active ? 'font-semibold' : 'font-medium'
                )}
              >
                {tab.label}
              </span>
            </Link>
          );
        })}

        {/* Conversation — the highest-frequency action, raised in the
            right thumb zone, in the one reserved brand red. */}
        <div className="flex justify-center">
          <Link
            href="/dashboard/conversations"
            aria-label="Open conversations"
            className="press -mt-8 flex h-14 w-14 items-center justify-center rounded-full bg-brand text-brand-foreground shadow-[0_8px_20px_hsl(3_72%_50%/0.35)]"
          >
            <MessageSquare className="h-6 w-6" strokeWidth={2} />
          </Link>
        </div>
      </div>
    </nav>
  );
}
