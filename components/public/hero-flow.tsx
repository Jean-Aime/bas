'use client';

import { cn } from '@/lib/utils';
import {
  User, Bot, BookOpen, Workflow, ShoppingCart,
} from 'lucide-react';

const NODES = [
  { icon: User, label: 'Customer message', sub: '“Do you have size 42?”' },
  { icon: Bot, label: 'BAS AI', sub: 'Understands intent' },
  { icon: BookOpen, label: 'Business knowledge', sub: 'Products · policies' },
  { icon: Workflow, label: 'Workflow', sub: 'Availability → order' },
  { icon: ShoppingCart, label: 'Business action', sub: 'Order created' },
] as const;

/**
 * Hero visual: the BAS automation pipeline as a compact horizontal flow
 * with animated connector lines. Scales down to a vertical stack on mobile.
 */
export function HeroFlow() {
  return (
    <div className="relative mx-auto w-full max-w-4xl">
      <div className="flex flex-col items-stretch gap-3 md:flex-row md:items-center md:gap-0">
        {NODES.map((node, i) => {
          const Icon = node.icon;
          return (
            <div key={node.label} className="flex flex-col items-stretch gap-3 md:flex-1 md:flex-row md:items-center">
              <div
                className="card-highlight flex items-center gap-3 rounded-xl border bg-card/80 px-3.5 py-3 shadow-card backdrop-blur-sm md:flex-1 animate-fade-in-up"
                style={{ animationDelay: `${i * 120 + 300}ms` }}
              >
                <div className={cn(
                  'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
                  i === 1 ? 'bg-gradient-to-br from-primary to-info text-white' : 'bg-primary/10 text-primary'
                )}>
                  <Icon className="h-4.5 w-4.5" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold leading-tight">{node.label}</p>
                  <p className="truncate text-xs text-muted-foreground">{node.sub}</p>
                </div>
              </div>
              {i < NODES.length - 1 && (
                <div className="flex items-center justify-center md:px-1">
                  <svg width="28" height="12" viewBox="0 0 28 12" fill="none" className="rotate-90 md:rotate-0">
                    <line x1="0" y1="6" x2="22" y2="6" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 3" className="text-primary/50 animate-flow" />
                    <path d="M22 2.5L27 6L22 9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-primary/70" />
                  </svg>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
