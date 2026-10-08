'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth/context';
import { useBusiness } from '@/lib/auth/business-context';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { NotificationsBell } from '@/components/dashboard/notifications-bell';
import { DashboardSidebar } from '@/components/dashboard/sidebar';
import {
  Menu, LogOut, Plus, ChevronDown,
  Settings, ExternalLink, Check,
} from 'lucide-react';
import Link from 'next/link';

export function DashboardTopbar() {
  const { user, signOut } = useAuth();
  const { businesses, currentBusiness, switchBusiness } = useBusiness();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  const initials = user?.email?.slice(0, 2).toUpperCase() ?? 'U';

  // Derive page title from pathname
  const pageTitle = (() => {
    const seg = pathname.split('/').filter(Boolean);
    if (seg.length === 1) return 'Dashboard';
    const last = seg[seg.length - 1];
    return last.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  })();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-chrome-border bg-chrome px-4 text-chrome-fg lg:px-7 lg:pl-[calc(var(--sidebar-width)+1.75rem)]">
      {/* Left: context */}
      <div className="flex min-w-0 items-center gap-3">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9 text-chrome-fg hover:bg-chrome-hover hover:text-chrome-fg lg:hidden">
              <Menu className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[var(--sidebar-width)] border-0 bg-chrome p-0 text-chrome-fg">
            <DashboardSidebar />
          </SheetContent>
        </Sheet>

        <div className="flex min-w-0 items-baseline gap-2.5">
          <h1 className="truncate text-[15px] font-semibold tracking-tight text-chrome-fg">{pageTitle}</h1>
          <span className="hidden h-1 w-1 rounded-full bg-chrome-fg/30 sm:block" />
          <span className="hidden truncate text-xs text-chrome-muted sm:block">
            {currentBusiness?.name ?? ''}
          </span>
        </div>
      </div>

      {/* Right: controls */}
      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-9 gap-2 border border-chrome-fg/15 bg-chrome-hover px-3 text-xs font-medium text-chrome-muted hover:border-chrome-fg/30 hover:bg-chrome-hover hover:text-chrome-fg"
            >
              <span className="flex h-5 w-5 shrink-0 items-center justify-center brand-fill rounded text-[9px] font-bold text-white">
                {(currentBusiness?.name ?? 'B').slice(0, 1).toUpperCase()}
              </span>
              <span className="hidden max-w-[140px] truncate sm:inline">{currentBusiness?.name ?? 'Business'}</span>
              <ChevronDown className="h-3 w-3 opacity-60" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-60">
            <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">Switch business</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {businesses.map((biz) => (
              <DropdownMenuItem key={biz.id} onClick={() => switchBusiness(biz.id)} className="gap-2">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center brand-fill rounded-md">
                  <span className="text-[10px] font-bold text-white">{biz.name[0]}</span>
                </div>
                <span className="truncate text-sm">{biz.name}</span>
                {biz.id === currentBusiness?.id && <Check className="ml-auto h-3.5 w-3.5 shrink-0 text-primary" />}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push('/onboarding')} className="gap-2 text-primary">
              <Plus className="h-3.5 w-3.5" />
              <span className="text-sm">Add new business</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Link href="/chat" target="_blank">
          <Button variant="ghost" size="sm" className="hidden h-9 gap-1.5 px-3 text-xs font-medium text-chrome-muted hover:bg-chrome-hover hover:text-chrome-fg sm:flex">
            <ExternalLink className="h-3.5 w-3.5" />
            <span>Preview chat</span>
          </Button>
        </Link>

        <NotificationsBell />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
              <Avatar className="h-7 w-7 ring-2 ring-chrome-fg/20 ring-offset-1 ring-offset-chrome">
                <AvatarFallback className="border-0 brand-fill text-[10px] font-bold text-white">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuLabel className="font-normal">
              <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push('/dashboard/settings')} className="gap-2">
              <Settings className="h-3.5 w-3.5" />
              <span className="text-sm">Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut} className="gap-2 text-destructive focus:text-destructive">
              <LogOut className="h-3.5 w-3.5" />
              <span className="text-sm">Sign out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
