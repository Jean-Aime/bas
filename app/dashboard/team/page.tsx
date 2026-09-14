'use client';

import { TeamTab } from '@/components/dashboard/settings/team-tab';

export default function TeamPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Team</h1>
        <p className="text-muted-foreground">Manage team members and their roles for this business.</p>
      </div>
      <TeamTab />
    </div>
  );
}