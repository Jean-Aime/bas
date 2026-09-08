'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth/context';
import { useBusiness } from '@/lib/auth/business-context';
import { supabase } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { NotificationsBell } from '@/components/dashboard/notifications-bell';
import { Zap, Menu, LogOut, User as UserIcon, Building2, Plus, ChevronDown, Settings } from 'lucide-react';
import Link from 'next/link';

export function DashboardTopbar() {
  const { user, signOut } = useAuth();
  const { businesses, currentBusiness, switchBusiness, refreshBusinesses } = useBusiness();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  const initials = user?.email?.substring(0, 2).toUpperCase() || 'U';

  const navItems = [
    { href: '/dashboard', label: 'Overview' },
    { href: '/dashboard/conversations', label: 'Conversations' },
    { href: '/dashboard/customers', label: 'Customers' },
    { href: '/dashboard/products', label: 'Products' },
    { href: '/dashboard/services', label: 'Services' },
    { href: '/dashboard/orders', label: 'Orders' },
    { href: '/dashboard/bookings', label: 'Bookings' },
    { href: '/dashboard/requests', label: 'Requests' },
    { href: '/dashboard/automation', label: 'Automation' },
    { href: '/dashboard/knowledge', label: 'Knowledge' },
    { href: '/dashboard/integrations', label: 'Integrations' },
    { href: '/dashboard/analytics', label: 'Analytics' },
    { href: '/dashboard/settings', label: 'Settings' },
  ];

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-white px-4 lg:px-8 lg:pl-72">
        <div className="flex items-center gap-3">
          {/* Mobile menu */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <div className="flex h-16 items-center gap-2 border-b px-6">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Zap className="h-4 w-4" />
                </div>
                <span className="font-bold">BAS</span>
              </div>
              <nav className="p-3">
                <ul className="space-y-1">
                  {navItems.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            </SheetContent>
          </Sheet>

          {/* Business switcher */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2 px-2">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span className="hidden font-medium sm:inline">{currentBusiness?.name || 'Business'}</span>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-64">
              <DropdownMenuLabel>Your Businesses</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {businesses.map((biz) => (
                <DropdownMenuItem
                  key={biz.id}
                  onClick={() => switchBusiness(biz.id)}
                  className={biz.id === currentBusiness?.id ? 'bg-primary/5' : ''}
                >
                  <Building2 className="mr-2 h-4 w-4" />
                  <span className="truncate">{biz.name}</span>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push('/onboarding')}>
                <Plus className="mr-2 h-4 w-4" />
                Add New Business
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/chat" target="_blank">
            <Button variant="outline" size="sm" className="hidden sm:flex">
              Open Customer Chat
            </Button>
          </Link>
          <NotificationsBell />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2 px-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs">{initials}</AvatarFallback>
                </Avatar>
                <span className="hidden text-sm font-medium sm:inline">{user?.email}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>{user?.email}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push('/dashboard/settings')}>
                <Settings className="mr-2 h-4 w-4" />
                Settings
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
