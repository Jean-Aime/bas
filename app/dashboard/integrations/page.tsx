'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Globe, ShoppingBag, Calendar, Building2, CreditCard, Mail, CheckCircle2, Clock } from 'lucide-react';
import {
  getAllConnectorMetadata,
  getConnectorsByCategory,
  type ConnectorMetadata,
  type ConnectorType,
} from '@/lib/connectors/registry';

const ICONS: Record<string, typeof MessageSquare> = {
  MessageSquare,
  Globe,
  ShoppingBag,
  Calendar,
  Building2,
  CreditCard,
  Mail,
};

const CATEGORY_LABEL: Record<ConnectorMetadata['category'], string> = {
  channels: 'Channels',
  commerce: 'Commerce',
  website: 'Website',
  booking: 'Booking',
  business: 'Business',
  payments: 'Payments',
};

function ConnectedNote({ type }: { type: ConnectorType }) {
  if (type === 'webchat') {
    return <p className="mt-3 text-xs text-muted-foreground">Built into BAS — open the customer chat from the sidebar.</p>;
  }
  if (type === 'website') {
    return <p className="mt-3 text-xs text-muted-foreground">Import your website URL from the Knowledge page.</p>;
  }
  return null;
}

export default function IntegrationsPage() {
  const connectors = getAllConnectorMetadata();
  const categories = Object.keys(CATEGORY_LABEL) as ConnectorMetadata['category'][];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Integrations</h1>
        <p className="text-muted-foreground">Connect external systems and platforms</p>
      </div>

      {categories.map((category) => {
        const items = getConnectorsByCategory(category);
        if (items.length === 0) return null;
        return (
          <div key={category} className="space-y-3">
            <h2 className="text-lg font-semibold">{CATEGORY_LABEL[category]}</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((item) => {
                const Icon = ICONS[item.icon] || MessageSquare;
                const connected = item.status === 'connected';
                return (
                  <Card key={item.type} className={connected ? 'border-primary/30' : ''}>
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                          <Icon className="h-5 w-5 text-primary" />
                        </div>
                        {connected ? (
                          <Badge><CheckCircle2 className="mr-1 h-3 w-3" /> Connected</Badge>
                        ) : (
                          <Badge variant="secondary"><Clock className="mr-1 h-3 w-3" /> Coming Soon</Badge>
                        )}
                      </div>
                      <p className="mt-3 font-medium">{item.displayName}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
                      <ConnectedNote type={item.type} />
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}