'use client';

import { useEffect, useState } from 'react';
import { useBusiness } from '@/lib/auth/business-context';
import { useAuth } from '@/lib/auth/context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, UserPlus, Shield, Trash2, Users, UserCog } from 'lucide-react';
import { toast } from 'sonner';

interface TeamMember {
  id: string;
  user_id: string;
  role: string;
  email: string;
  created_at: string;
}

const ROLE_LABELS: Record<string, string> = {
  platform_admin: 'Platform Admin',
  business_owner: 'Business Owner',
  business_admin: 'Business Admin',
  staff: 'Staff',
  automation_manager: 'Automation Manager',
};

export function TeamTab() {
  const { currentBusiness } = useBusiness();
  const { user } = useAuth();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [inviteForm, setInviteForm] = useState({ email: '', role: 'staff' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentBusiness) loadTeam();
  }, [currentBusiness]);

  const loadTeam = async () => {
    if (!currentBusiness) return;
    const response = await fetch(`/api/team?businessId=${currentBusiness.id}`);
    const data = await response.json();
    if (response.ok) setMembers((data.members || []) as TeamMember[]);
  };

  const inviteMember = async () => {
    if (!currentBusiness || !inviteForm.email.trim()) return;
    setLoading(true);
    try {
      const response = await fetch('/api/team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessId: currentBusiness.id, email: inviteForm.email.trim(), role: inviteForm.role }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to add member');
      toast.success(`Added ${inviteForm.email.trim()} as ${ROLE_LABELS[inviteForm.role] || inviteForm.role}`);
      setInviteForm({ email: '', role: 'staff' });
      loadTeam();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to add member');
    } finally {
      setLoading(false);
    }
  };

  const changeRole = async (member: TeamMember, role: string) => {
    const response = await fetch('/api/team', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: member.id, role }),
    });
    const data = await response.json();
    if (!response.ok) { toast.error(data.error || 'Failed to update role'); return; }
    toast.success(`Role updated to ${ROLE_LABELS[role] || role}`);
    loadTeam();
  };

  const removeMember = async (member: TeamMember) => {
    const response = await fetch(`/api/team?id=${member.id}`, { method: 'DELETE' });
    const data = await response.json();
    if (!response.ok) { toast.error(data.error || 'Failed to remove member'); return; }
    toast.success('Member removed');
    loadTeam();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2"><UserCog className="h-5 w-5" /> Team Members</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
          <p className="text-sm font-medium flex items-center gap-2"><UserPlus className="h-4 w-4 text-primary" /> Add team member</p>
          <p className="text-xs text-muted-foreground mt-1">The user must already have a BAS account. They will appear in your team instantly.</p>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <Input
              type="email"
              placeholder="staff@business.com"
              value={inviteForm.email}
              onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
              className="flex-1"
            />
            <Select value={inviteForm.role} onValueChange={(role) => setInviteForm({ ...inviteForm, role })}>
              <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="staff">Staff</SelectItem>
                <SelectItem value="business_admin">Business Admin</SelectItem>
                <SelectItem value="automation_manager">Automation Manager</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={inviteMember} disabled={loading || !inviteForm.email.trim()}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserPlus className="mr-2 h-4 w-4" />}
              Add
            </Button>
          </div>
        </div>

        {members.length === 0 ? (
          <div className="flex flex-col items-center py-10 text-center">
            <Users className="h-10 w-10 text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">No team members yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {members.map((member) => (
              <div key={member.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                    <Shield className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{member.email}</p>
                    <p className="text-xs text-muted-foreground">Joined {new Date(member.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {member.email === user?.email ? (
                    <Badge>{ROLE_LABELS[member.role] || member.role} (you)</Badge>
                  ) : member.role === 'business_owner' ? (
                    <Badge variant="outline">Business Owner</Badge>
                  ) : (
                    <>
                      <Select value={member.role} onValueChange={(role) => changeRole(member, role)}>
                        <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="business_admin">Business Admin</SelectItem>
                          <SelectItem value="automation_manager">Automation Manager</SelectItem>
                          <SelectItem value="staff">Staff</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button variant="ghost" size="icon" onClick={() => removeMember(member)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}