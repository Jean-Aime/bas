'use client';

import { useAuth } from '@/lib/auth/context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function AccountTab() {
  const { user } = useAuth();

  return (
    <Card>
      <CardHeader><CardTitle className="text-lg">Account</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        <div><p className="text-sm text-muted-foreground">Email</p><p className="font-medium">{user?.email}</p></div>
        <div><p className="text-sm text-muted-foreground">User ID</p><p className="font-mono text-xs">{user?.id}</p></div>
      </CardContent>
    </Card>
  );
}