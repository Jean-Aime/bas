'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, Users, Workflow, Plug, Bot, ScrollText, HeartPulse, ArrowRight } from 'lucide-react';

const MODULES = [
  { href: '/admin/businesses', label: 'Businesses', desc: 'All tenant businesses on the platform', icon: Building2 },
  { href: '/admin/users', label: 'Users', desc: 'Platform users and accounts', icon: Users },
  { href: '/admin/workflows', label: 'Workflow templates', desc: 'Platform-wide automation templates', icon: Workflow },
  { href: '/admin/integrations', label: 'Integrations', desc: 'Connectors and their status', icon: Plug },
  { href: '/admin/ai', label: 'AI configuration', desc: 'Providers, models, and policies', icon: Bot },
  { href: '/admin/audit-logs', label: 'Audit logs', desc: 'Platform-wide audit trail', icon: ScrollText },
  { href: '/admin/health', label: 'Health', desc: 'Database, AI, and service status', icon: HeartPulse },
];

export default function AdminOverviewPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Platform administration</h1>
          <p className="text-muted-foreground">BAS is a SaaS platform — this area manages every business tenant.</p>
        </div>
        <Badge variant="outline">v0.1 · structure only</Badge>
      </div>

      <div className="rounded-xl border border-dashed bg-white p-6">
        <p className="text-sm text-muted-foreground">
          Platform administration is <span className="font-medium text-foreground">not implemented in the prototype</span>.
          These routes exist as the future production architecture for managing businesses, users, workflows,
          integrations, AI configuration, and system health. Access will require the <code className="rounded bg-muted px-1">platform_admin</code> role.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {MODULES.map((m) => (
          <Link key={m.href} href={m.href}>
            <Card className="h-full transition-shadow hover:shadow-md">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900 text-white">
                    <m.icon className="h-5 w-5" />
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </div>
                <p className="mt-3 font-semibold">{m.label}</p>
                <p className="mt-1 text-sm text-muted-foreground">{m.desc}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}