import { cn } from '@/lib/utils';

/**
 * Hand-drawn SVG illustration set. Pure vector, no network images — renders
 * identically offline, adapts to dark mode via currentColor tokens, and adds
 * zero asset weight to the bundle.
 */

/** Abstract automation network — glowing nodes connected by animated paths. */
export function NetworkIllustration({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 400 260" fill="none" className={cn('h-auto w-full', className)} aria-hidden>
      <defs>
        <linearGradient id="net-line" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.1" />
          <stop offset="50%" stopColor="currentColor" stopOpacity="0.5" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.1" />
        </linearGradient>
      </defs>
      {/* Connections */}
      <path d="M70 130 L165 70" stroke="url(#net-line)" strokeWidth="1.5" className="animate-dash" />
      <path d="M70 130 L165 190" stroke="url(#net-line)" strokeWidth="1.5" className="animate-dash" style={{ animationDelay: '0.4s' }} />
      <path d="M195 62 L290 110" stroke="url(#net-line)" strokeWidth="1.5" className="animate-dash" style={{ animationDelay: '0.8s' }} />
      <path d="M195 198 L290 130" stroke="url(#net-line)" strokeWidth="1.5" className="animate-dash" style={{ animationDelay: '1.2s' }} />
      <path d="M295 120 L350 120" stroke="url(#net-line)" strokeWidth="1.5" className="animate-dash" style={{ animationDelay: '1.6s' }} />
      {/* Nodes */}
      <g className="animate-float">
        <circle cx="70" cy="130" r="26" className="fill-primary/10" />
        <circle cx="70" cy="130" r="10" className="fill-primary" />
      </g>
      <g className="animate-float" style={{ animationDelay: '0.6s' }}>
        <circle cx="180" cy="65" r="20" className="fill-info/10" />
        <circle cx="180" cy="65" r="7" className="fill-info" />
      </g>
      <g className="animate-float" style={{ animationDelay: '1.1s' }}>
        <circle cx="180" cy="195" r="20" className="fill-success/10" />
        <circle cx="180" cy="195" r="7" className="fill-success" />
      </g>
      <g className="animate-float" style={{ animationDelay: '1.7s' }}>
        <circle cx="295" cy="120" r="24" className="fill-primary/15" />
        <circle cx="295" cy="120" r="9" className="fill-primary" />
        <circle cx="295" cy="120" r="16" className="stroke-primary/40" strokeWidth="1.5" strokeDasharray="4 3" />
      </g>
      {/* Output pulse */}
      <circle cx="352" cy="120" r="4" className="fill-success animate-pulse-soft" />
    </svg>
  );
}

/** Chat conversation illustration — customer and AI bubbles with typing dots. */
export function ChatIllustration({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 400 280" fill="none" className={cn('h-auto w-full', className)} aria-hidden>
      {/* Customer bubble */}
      <g>
        <rect x="40" y="40" width="180" height="52" rx="14" className="fill-secondary" />
        <circle cx="66" cy="66" r="12" className="fill-primary/15" />
        <path d="M61 66 a5 5 0 0 1 10 0" className="stroke-primary" strokeWidth="2" strokeLinecap="round" fill="none" />
        <rect x="88" y="54" width="110" height="7" rx="3.5" className="fill-foreground/70" />
        <rect x="88" y="68" width="70" height="7" rx="3.5" className="fill-foreground/30" />
      </g>
      {/* Connector */}
      <path d="M130 100 v18" className="stroke-border" strokeWidth="1.5" strokeDasharray="3 4" />
      {/* AI bubble */}
      <g>
        <rect x="150" y="124" width="210" height="64" rx="14" className="fill-primary" />
        <circle cx="176" cy="150" r="12" className="fill-white/20" />
        <path d="M170 156 l4 -8 4 5 4 -6 4 9" className="stroke-white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <rect x="196" y="138" width="140" height="7" rx="3.5" className="fill-white/80" />
        <rect x="196" y="152" width="95" height="7" rx="3.5" className="fill-white/50" />
        <rect x="196" y="166" width="60" height="7" rx="3.5" className="fill-white/30" />
      </g>
      {/* Typing indicator */}
      <g>
        <rect x="150" y="204" width="76" height="34" rx="12" className="fill-secondary" />
        <circle cx="172" cy="221" r="3.5" className="fill-muted-foreground animate-pulse-soft" />
        <circle cx="188" cy="221" r="3.5" className="fill-muted-foreground animate-pulse-soft" style={{ animationDelay: '0.3s' }} />
        <circle cx="204" cy="221" r="3.5" className="fill-muted-foreground animate-pulse-soft" style={{ animationDelay: '0.6s' }} />
      </g>
      {/* Automation chip */}
      <g>
        <rect x="40" y="204" width="86" height="30" rx="15" className="fill-success/10" />
        <path d="M56 219 l5 -7 5 4 5 -8" className="stroke-success" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <rect x="76" y="216" width="40" height="6" rx="3" className="fill-success/50" />
      </g>
    </svg>
  );
}

/** Dashboard analytics illustration — layered bar chart with trend line. */
export function ChartIllustration({ className }: { className?: string }) {
  const bars = [42, 68, 54, 90, 72, 110, 96];
  return (
    <svg viewBox="0 0 400 260" fill="none" className={cn('h-auto w-full', className)} aria-hidden>
      {/* Grid */}
      {[60, 110, 160, 210].map((y) => (
        <line key={y} x1="40" y1={y} x2="360" y2={y} className="stroke-border" strokeWidth="1" strokeDasharray="2 6" />
      ))}
      {/* Bars */}
      {bars.map((h, i) => (
        <rect
          key={i}
          x={56 + i * 42}
          y={215 - h}
          width="26"
          height={h}
          rx="6"
          className={cn('animate-fade-in', i === 5 ? 'fill-primary' : 'fill-primary/25')}
          style={{ animationDelay: `${i * 0.08}s` }}
        />
      ))}
      {/* Trend line */}
      <path
        d="M69 180 L111 155 L153 165 L195 130 L237 145 L279 112 L321 122"
        className="stroke-success"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="321" cy="122" r="5" className="fill-success" />
      <circle cx="321" cy="122" r="10" className="fill-success/20 animate-pulse-soft" />
    </svg>
  );
}

/** Workflow pipeline illustration — trigger → nodes → result with animated flow. */
export function WorkflowIllustration({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 400 200" fill="none" className={cn('h-auto w-full', className)} aria-hidden>
      {/* Trigger */}
      <rect x="20" y="76" width="80" height="48" rx="12" className="fill-primary/10" />
      <circle cx="46" cy="100" r="9" className="fill-primary" />
      <rect x="60" y="90" width="30" height="6" rx="3" className="fill-primary/50" />
      <rect x="60" y="101" width="20" height="5" rx="2.5" className="fill-primary/30" />
      {/* Connectors */}
      <path d="M104 100 h30" className="stroke-border animate-dash" strokeWidth="2" />
      <path d="M186 100 h30" className="stroke-border animate-dash" strokeWidth="2" style={{ animationDelay: '0.5s' }} />
      <path d="M268 100 h30" className="stroke-border animate-dash" strokeWidth="2" style={{ animationDelay: '1s' }} />
      {/* Steps */}
      <rect x="138" y="72" width="44" height="56" rx="10" className="fill-info/10" />
      <rect x="148" y="84" width="24" height="6" rx="3" className="fill-info/60" />
      <rect x="148" y="96" width="16" height="5" rx="2.5" className="fill-info/35" />
      <rect x="148" y="106" width="20" height="5" rx="2.5" className="fill-info/35" />
      <rect x="220" y="72" width="44" height="56" rx="10" className="fill-warning/10" />
      <circle cx="242" cy="94" r="8" className="fill-warning/60" />
      <rect x="230" y="108" width="24" height="5" rx="2.5" className="fill-warning/40" />
      {/* Result */}
      <rect x="302" y="72" width="78" height="56" rx="12" className="fill-success/10" />
      <path d="M322 100 l7 7 12 -14" className="stroke-success" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <rect x="316" y="112" width="48" height="5" rx="2.5" className="fill-success/40" />
    </svg>
  );
}

/** Knowledge base illustration — stacked documents with indexed highlights. */
export function KnowledgeIllustration({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 400 260" fill="none" className={cn('h-auto w-full', className)} aria-hidden>
      {/* Back doc */}
      <rect x="120" y="30" width="160" height="190" rx="12" className="fill-secondary" transform="rotate(4 200 125)" />
      {/* Mid doc */}
      <rect x="110" y="26" width="160" height="190" rx="12" className="fill-card stroke-border" strokeWidth="1.5" transform="rotate(-2 190 120)" />
      {/* Front doc */}
      <rect x="100" y="34" width="160" height="190" rx="12" className="fill-card stroke-border" strokeWidth="1.5" />
      {/* Text lines */}
      <rect x="118" y="58" width="90" height="8" rx="4" className="fill-foreground/70" />
      <rect x="118" y="76" width="124" height="6" rx="3" className="fill-foreground/25" />
      <rect x="118" y="90" width="110" height="6" rx="3" className="fill-foreground/25" />
      {/* Highlighted answer block */}
      <rect x="112" y="108" width="136" height="34" rx="8" className="fill-primary/10" />
      <rect x="118" y="116" width="100" height="6" rx="3" className="fill-primary/60" />
      <rect x="118" y="128" width="80" height="6" rx="3" className="fill-primary/40" />
      <rect x="118" y="156" width="124" height="6" rx="3" className="fill-foreground/25" />
      <rect x="118" y="170" width="95" height="6" rx="3" className="fill-foreground/25" />
      {/* Search spark */}
      <g className="animate-float">
        <circle cx="272" cy="52" r="18" className="fill-primary" />
        <path d="M265 52 l5 5 9 -11" className="stroke-white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </g>
    </svg>
  );
}
