'use client';

import { useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase/client';

/**
 * Realtime notifications hook. Subscribes to INSERT and UPDATE events on the
 * `notifications` table scoped to (business_id, user_id) and invokes `onChange`
 * so consumers refetch through the notifications service.
 *
 * Falls back silently when realtime is unavailable — callers keep their
 * polling/interval as a safety net, so worst case is delayed updates, never
 * a broken UI.
 */

export interface UseNotificationsRealtimeOptions {
  businessId: string | undefined;
  userId: string | undefined;
  enabled?: boolean;
  onChange: () => void;
}

export function useNotificationsRealtime({ businessId, userId, enabled = true, onChange }: UseNotificationsRealtimeOptions) {
  // Keep the callback stable without making consumers wrap it in useCallback.
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    if (!enabled || !businessId || !userId) return;

    const channel = supabase
      .channel(`notifications:${businessId}:${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `business_id=eq.${businessId},user_id=eq.${userId}`,
        },
        () => onChangeRef.current()
      )
      .subscribe((status) => {
        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          // Realtime unavailable — consumer's polling keeps the UI fresh.
          if (process.env.NODE_ENV === 'development') {
            console.warn('[notifications] realtime unavailable, relying on polling');
          }
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [businessId, userId, enabled]);
}
