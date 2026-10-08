'use client';

import { SiteLayout } from '@/components/public/site-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Clock } from 'lucide-react';
import { getAllConnectorMetadata } from '@/lib/connectors/registry';

export default function PublicIntegrationsPage() {
  const connectors = getAllConnectorMetadata();

  return (
    <SiteLayout>
      <section className="bg-background py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Integrations</h1>
            <p className="mt-4 text-lg text-slate-600">
              Connect BAS to the systems you already use — or none at all. We only list what actually works.
            </p>
          </div>

          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {connectors.map((c) => (
              <Card key={c.type} className="border-slate-200">
                <CardHeader>
                  <div className="flex items-center justify-between gap-2">
                    <CardTitle className="text-lg">{c.displayName}</CardTitle>
                    {c.status === 'connected' ? (
                      <Badge className="bg-success/10 text-success"><CheckCircle2 className="mr-1 h-3 w-3" /> Built in</Badge>
                    ) : (
                      <Badge variant="outline"><Clock className="mr-1 h-3 w-3" /> Coming soon</Badge>
                    )}
                  </div>
                  <CardDescription className="mt-2">{c.description}</CardDescription>
                </CardHeader>
                <CardContent className="text-xs text-slate-500">
                  {c.status === 'connected' ? 'Available now' : 'Not connected — on the roadmap'}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}