'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BusinessTab } from '@/components/dashboard/settings/business-tab';
import { HoursTab } from '@/components/dashboard/settings/hours-tab';
import { LocationsTab } from '@/components/dashboard/settings/locations-tab';
import { TeamTab } from '@/components/dashboard/settings/team-tab';
import { AuditTab } from '@/components/dashboard/settings/audit-tab';
import { AccountTab } from '@/components/dashboard/settings/account-tab';

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your business and account settings</p>
      </div>

      <Tabs defaultValue="business">
        <TabsList className="flex-wrap">
          <TabsTrigger value="business">Business</TabsTrigger>
          <TabsTrigger value="hours">Hours</TabsTrigger>
          <TabsTrigger value="locations">Locations</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
          <TabsTrigger value="audit">Audit Logs</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
        </TabsList>

        <TabsContent value="business" className="space-y-4"><BusinessTab /></TabsContent>
        <TabsContent value="hours" className="space-y-4"><HoursTab /></TabsContent>
        <TabsContent value="locations" className="space-y-4"><LocationsTab /></TabsContent>
        <TabsContent value="team" className="space-y-4"><TeamTab /></TabsContent>
        <TabsContent value="audit" className="space-y-4"><AuditTab /></TabsContent>
        <TabsContent value="account" className="space-y-4"><AccountTab /></TabsContent>
      </Tabs>
    </div>
  );
}