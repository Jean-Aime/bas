'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const ROLES = [
  { role: 'Business Owner', desc: 'Full control — business settings, integrations, automation, analytics, and team.' },
  { role: 'Business Admin', desc: 'Manages business configuration, catalog, and day-to-day operations.' },
  { role: 'Automation Manager', desc: 'Owns workflows and automation behavior for the business.' },
  { role: 'Staff', desc: 'Handles conversations, customers, and assigned operations.' },
  { role: 'Platform Admin', desc: 'Platform-wide administration — not a business role.' },
];

export default function TeamRolesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Roles and permissions</h1>
        <p className="text-muted-foreground">The RBAC model for BAS. Custom roles arrive in a later phase.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {ROLES.map((r) => (
          <Card key={r.role}>
            <CardHeader>
              <CardTitle className="text-base">{r.role}</CardTitle>
              <CardDescription>{r.desc}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
}