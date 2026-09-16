'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth/context';
import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuShortcut,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { NotificationsBell } from '@/components/dashboard/notifications-bell';
import { DemoModeToggle } from '@/components/demo/demo-mode-toggle';
import { CommandMenu, useCommandMenu } from '@/components/dashboard/command-menu';
import { ThemeToggle } from '@/components/theme/theme-provider';
import { NAV_GROUPS, isNavActive } from '@/components/dashboard/nav-config';
import { Logo } from '@/components/ui/logo';
import { Menu, LogOut, Settings, ExternalLink, Search } from 'lucide-react';
import Link from 'next/link';

export function DashboardTopbar() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const openCommandMenu = useCommandMenu();

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  const initials = user?.email?.substring(0, 2).toUpperCase() || 'U';

  return (
    <>
    <CommandMenu />
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-md lg:pl-[var(--sidebar-w,15rem)]">
      <div className="flex items-center gap-2">
        {/* Mobile menu */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon-sm" className="lg:hidden" aria-label="Open navigation">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 overflow-y-auto p-0">
            <div className="flex h-16 items-center gap-2.5 border-b px-4">
              <Logo />
              <span className="text-lg font-bold tracking-tight">BAS</span>
            </div>
            <nav className="scrollbar-thin max-h-[calc(100vh-4rem)] overflow-y-auto p-3 pb-8">
              {NAV_GROUPS.map((group) => (
                <div key={group.label} className="mb-4">
                  <p className="mb-1.5 px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                    {group.label}
                  </p>
                  <ul className="space-y-0.5">
                    {group.items.map((item) => {
                      const active = isNavActive(pathname, item.href);
                      return (
                        <li key={item.href}>
                          <Link
                            href={item.href}
                            onClick={() => setMobileOpen(false)}
                            className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                              active
                                ? 'bg-primary/10 text-primary'
                                : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                            }`}
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
          </SheetContent>
        </Sheet>

        {/* Page context (desktop) */}
        <div className="hidden items-center gap-2 text-sm text-muted-foreground lg:flex">
          <span>Business</span>
          <span className="text-border">/</span>
          <span className="font-medium text-foreground">
            {NAV_GROUPS.flatMap((g) => g.items).find((i) => isNavActive(pathname, i.href))?.label ?? 'Overview'}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1.5">
        {/* Command menu trigger (⌘K) */}
        <button
          type="button"
          onClick={openCommandMenu}
          className="hidden h-8 items-center gap-2 rounded-md border bg-secondary/60 px-3 text-sm text-muted-foreground transition-colors hover:bg-secondary sm:flex"
          aria-label="Open command menu"
        >
          <Search className="h-3.5 w-3.5" />
          <span className="hidden md:inline">Search…</span>
          <kbd className="pointer-events-none hidden select-none items-center gap-0.5 rounded border bg-background px-1.5 font-mono text-[10px] font-medium text-muted-foreground md:inline-flex">
            ⌘K
          </kbd>
        </button>
        <Button variant="ghost" size="icon" className="sm:hidden" onClick={openCommandMenu} aria-label="Search">
          <Search className="h-5 w-5" />
        </Button>
        <Link href="/chat" target="_blank" className="hidden sm:block">
          <Button variant="outline" size="sm">
            Open Customer Chat <ExternalLink className="ml-2 h-3.5 w-3.5" />
          </Button>
        </Link>
        <DemoModeToggle />
        <ThemeToggle />
        <NotificationsBell />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-2 px-1.5">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-gradient-to-br from-primary to-info text-xs text-primary-foreground">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <span className="hidden max-w-[160px] truncate text-sm font-medium sm:inline">
                {user?.email}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="truncate">{user?.email}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push('/dashboard/settings')}>
              <Settings className="mr-2 h-4 w-4" />
              Settings
              <DropdownMenuShortcut>⌘,</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
    </>
  );
}
