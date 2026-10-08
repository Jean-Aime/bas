'use client';

import { useEffect, useState } from 'react';
import { useBusiness } from '@/lib/auth/business-context';
import { supabase } from '@/lib/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MessageSquare, Loader2, Bot, User } from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import type { Conversation } from '@/lib/types';

export default function ConversationsPage() {
  const { currentBusiness } = useBusiness();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { if (currentBusiness) loadConversations(); }, [currentBusiness]);

  const loadConversations = async () => {
    if (!currentBusiness) return;
    setLoading(true);
    const { data } = await supabase
      .from('conversations')
      .select('*')
      .eq('business_id', currentBusiness.id)
      .order('updated_at', { ascending: false });
    setConversations((data || []) as Conversation[]);
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Conversations</h1>
        <p className="text-muted-foreground">Customer conversations across all channels</p>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
          ) : conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <MessageSquare className="h-10 w-10 text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground mb-4">No conversations yet.</p>
              <Link href="/chat" target="_blank" className="text-sm font-medium text-primary hover:underline">
                Test the customer chat to create one
              </Link>
            </div>
          ) : (
            <Table>
              <TableHeader><TableRow>
                <TableHead>Channel</TableHead><TableHead>Intent</TableHead><TableHead>Confidence</TableHead><TableHead>Status</TableHead><TableHead>Updated</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {conversations.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell>
                      <Link href={`/dashboard/conversations/${c.id}`} className="flex items-center gap-2 font-medium hover:text-primary">
                        {c.is_handover ? <User className="h-4 w-4 text-warning" /> : <Bot className="h-4 w-4 text-primary" />}
                        {c.channel}
                      </Link>
                    </TableCell>
                    <TableCell><Badge variant="outline">{c.detected_intent || 'general'}</Badge></TableCell>
                    <TableCell>{c.confidence ? `${(c.confidence * 100).toFixed(0)}%` : '—'}</TableCell>
                    <TableCell>
                      {c.is_handover ? <Badge variant="secondary">Handover</Badge> :
                       c.status === 'active' ? <Badge>Active</Badge> :
                       c.status === 'resolved' ? <Badge variant="outline">Resolved</Badge> :
                       <Badge variant="outline">{c.status}</Badge>}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">{formatDistanceToNow(new Date(c.updated_at), { addSuffix: true })}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
