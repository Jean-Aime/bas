'use client';

import { useEffect, useState, useMemo } from 'react';
import { useBusiness } from '@/lib/auth/business-context';
import { fetchConversations } from '@/lib/services/crm-service';
import { PageHeader } from '@/components/ui/page-header';
import { StatusBadge } from '@/components/ui/status-badge';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/page-states';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Bot, User, MessageSquare, Inbox } from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import type { Conversation } from '@/lib/types';
import { cn } from '@/lib/utils';

const CHANNEL_FILTERS = ['all', 'website', 'whatsapp', 'instagram', 'facebook'] as const;

export default function ConversationsPage() {
  const { currentBusiness } = useBusiness();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [channel, setChannel] = useState<string>('all');

  useEffect(() => { if (currentBusiness) loadConversations(); }, [currentBusiness]);

  const loadConversations = async () => {
    if (!currentBusiness) return;
    setLoading(true);
    const rows = await fetchConversations(currentBusiness.id);
    setConversations(rows);
    setLoading(false);
  };

  const filtered = useMemo(() => {
    return conversations.filter((c) => {
      const matchesChannel = channel === 'all' || c.channel === channel;
      const q = query.trim().toLowerCase();
      const matchesQuery =
        !q ||
        c.channel?.toLowerCase().includes(q) ||
        c.detected_intent?.toLowerCase().includes(q) ||
        c.status?.toLowerCase().includes(q);
      return matchesChannel && matchesQuery;
    });
  }, [conversations, query, channel]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Conversations"
        description="Customer conversations across all channels"
      />

      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search conversations…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-1 rounded-lg border border-border bg-card p-1">
          {CHANNEL_FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setChannel(f)}
              className={cn(
                'rounded-md px-2.5 py-1 text-xs font-medium capitalize transition-colors',
                channel === f
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {f === 'all' ? 'All' : f}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-card">
        {loading ? (
          <div className="space-y-3 p-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-9 w-9 rounded-full" />
                <Skeleton className="h-4 flex-1" />
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-4 w-24" />
              </div>
            ))}
          </div>
        ) : conversations.length === 0 ? (
          <EmptyState
            icon={MessageSquare}
            title="No conversations yet"
            description="When customers reach out through your connected channels, their conversations will appear here."
            actionHref="/chat"
            actionLabel="Open customer chat"
          />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={Inbox}
            title="No matches"
            description="No conversations match your search or filter. Try different terms."
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Channel</TableHead>
                <TableHead>Intent</TableHead>
                <TableHead>Confidence</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((c) => (
                <TableRow key={c.id} className="group">
                  <TableCell>
                    <Link
                      href={`/dashboard/conversations/${c.id}`}
                      className="flex items-center gap-2.5 font-medium transition-colors group-hover:text-primary"
                    >
                      <span
                        className={cn(
                          'flex h-8 w-8 items-center justify-center rounded-full',
                          c.is_handover ? 'bg-warning/10 text-warning' : 'bg-primary/10 text-primary'
                        )}
                      >
                        {c.is_handover ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                      </span>
                      <span className="capitalize">{c.channel}</span>
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{c.detected_intent || 'general'}</Badge>
                  </TableCell>
                  <TableCell>
                    {c.confidence ? (
                      <span className="text-sm tabular-nums">{(c.confidence * 100).toFixed(0)}%</span>
                    ) : (
                      <span className="text-sm text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={c.is_handover ? 'handover' : c.status} />
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(c.updated_at), { addSuffix: true })}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
