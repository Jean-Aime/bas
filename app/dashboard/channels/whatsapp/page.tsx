'use client';

import { NotConnected } from '@/components/ui/page-states';

export default function WhatsAppConfigPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">WhatsApp</h1>
        <p className="text-muted-foreground">Reach customers where they already chat.</p>
      </div>
      <NotConnected
        title="Not connected"
        description="The WhatsApp connector is planned but not implemented in the prototype. No credentials are requested until it is ready."
        requirements={[
          'WhatsApp Business API approval (Meta)',
          'Connector development for inbound and outbound messages',
          'Media handling and template messages',
        ]}
      />
    </div>
  );
}