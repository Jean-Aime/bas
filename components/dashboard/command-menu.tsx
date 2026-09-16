'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  CommandDialog, CommandInput, CommandList, CommandEmpty,
  CommandGroup, CommandItem, CommandShortcut, CommandSeparator,
} from '@/components/ui/command';
import { NAV_GROUPS } from '@/components/dashboard/nav-config';
import { useBusiness } from '@/lib/auth/business-context';
import { searchBusinessData, type SearchResult } from '@/lib/services/crm-service';
import { Loader2, MessageSquare, Users, Workflow as WorkflowIcon, Zap, ExternalLink, ArrowRight, Search } from 'lucide-react';

const COMMAND_OPEN_EVENT = 'bas:command-menu:open';

/** Hook for components that need to open the global command menu. */
export function useCommandMenu() {
  return useCallback(() => {
    window.dispatchEvent(new CustomEvent(COMMAND_OPEN_EVENT));
  }, []);
}

const KIND_META: Record<SearchResult['kind'], { icon: typeof MessageSquare; label: string }> = {
  conversation: { icon: MessageSquare, label: 'Conversations' },
  customer: { icon: Users, label: 'Customers' },
  workflow: { icon: WorkflowIcon, label: 'Workflows' },
};

/**
 * Global command menu (⌘K / Ctrl+K). Navigation comes from NAV_GROUPS; typing
 * two or more characters also searches conversations, customers and workflows
 * via the CRM service (debounced 250ms).
 */
export function CommandMenu() {
  const router = useRouter();
  const { currentBusiness } = useBusiness();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.key === 'k' || e.key === 'K') && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    const openEvent = () => setOpen(true);
    document.addEventListener('keydown', down);
    window.addEventListener(COMMAND_OPEN_EVENT, openEvent);
    return () => {
      document.removeEventListener('keydown', down);
      window.removeEventListener(COMMAND_OPEN_EVENT, openEvent);
    };
  }, []);

  // Reset search state whenever the menu closes.
  useEffect(() => {
    if (!open) {
      setSearch('');
      setResults([]);
    }
  }, [open]);

  // Debounced data search.
  useEffect(() => {
    const q = search.trim();
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (q.length < 2 || !currentBusiness) {
      setResults([]);
      setSearching(false);
      return;
    }
    setSearching(true);
    debounceRef.current = setTimeout(async () => {
      const found = await searchBusinessData(currentBusiness.id, q);
      setResults(found);
      setSearching(false);
    }, 250);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [search, currentBusiness]);

  const run = useCallback((fn: () => void) => {
    setOpen(false);
    fn();
  }, []);

  const go = useCallback((href: string) => run(() => router.push(href)), [run, router]);

  const showDataGroups = search.trim().length >= 2;

  return (
    <CommandDialog open={open} onOpenChange={setOpen} aria-label="Command menu">
      <CommandInput
        placeholder="Search pages, conversations, customers, workflows…"
        value={search}
        onValueChange={setSearch}
      />
      <CommandList>
        <CommandEmpty>
          {searching ? (
            <span className="flex items-center justify-center gap-2 text-muted-foreground">
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> Searching…
            </span>
          ) : (
            'No results found.'
          )}
        </CommandEmpty>

        {/* Data results */}
        {showDataGroups && (
          <>
            {(['conversation', 'customer', 'workflow'] as const).map((kind) => {
              const items = results.filter((r) => r.kind === kind);
              if (items.length === 0) return null;
              const meta = KIND_META[kind];
              return (
                <CommandGroup key={kind} heading={meta.label}>
                  {items.map((r) => (
                    <CommandItem key={r.id} onSelect={() => go(r.href)}>
                      <meta.icon className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span className="truncate">{r.label}</span>
                      <span className="ml-2 hidden shrink-0 text-xs text-muted-foreground sm:inline">{r.sublabel}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              );
            })}
            {results.length > 0 && <CommandSeparator />}
          </>
        )}

        <CommandGroup heading="Quick actions">
          <CommandItem onSelect={() => go('/dashboard/conversations')}>
            <Zap className="mr-2 h-4 w-4 text-primary" />
            View latest conversations
          </CommandItem>
          <CommandItem onSelect={() => go('/dashboard/automation')}>
            <Zap className="mr-2 h-4 w-4 text-primary" />
            Manage automation
          </CommandItem>
          <CommandItem onSelect={() => go('/dashboard/analytics')}>
            <Zap className="mr-2 h-4 w-4 text-primary" />
            Open analytics
          </CommandItem>
          {currentBusiness && (
            <CommandItem onSelect={() => run(() => window.open('/chat', '_blank'))}>
              <ExternalLink className="mr-2 h-4 w-4 text-primary" />
              Open customer chat
              <CommandShortcut>New tab</CommandShortcut>
            </CommandItem>
          )}
        </CommandGroup>

        <CommandSeparator />

        {NAV_GROUPS.map((group) => (
          <CommandGroup key={group.label} heading={group.label}>
            {group.items.map((item) => (
              <CommandItem key={item.href} onSelect={() => go(item.href)}>
                <item.icon className="mr-2 h-4 w-4 text-muted-foreground" />
                {item.label}
                <CommandShortcut>
                  <ArrowRight className="h-3 w-3" />
                </CommandShortcut>
              </CommandItem>
            ))}
          </CommandGroup>
        ))}

        {searching && (
          <div className="flex items-center justify-center gap-2 py-3 text-xs text-muted-foreground">
            <Loader2 className="h-3 w-3 animate-spin" /> Searching…
          </div>
        )}
      </CommandList>
    </CommandDialog>
  );
}
