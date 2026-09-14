'use client';

import { createContext, useContext, useEffect, useRef, useState, ReactNode, useCallback } from 'react';
import { useAuth } from '@/lib/auth/context';
import { supabase } from '@/lib/supabase/client';
import type { Business, Membership } from '@/lib/types';

interface BusinessContextValue {
  businesses: Business[];
  currentBusiness: Business | null;
  membership: Membership | null;
  loading: boolean;
  /** Set when memberships could not be fetched — a retryable transport/auth
   *  failure, NOT the same as "this user has no business". */
  error: string | null;
  switchBusiness: (businessId: string) => void;
  refreshBusinesses: () => Promise<void>;
}

const BusinessContext = createContext<BusinessContextValue>({
  businesses: [],
  currentBusiness: null,
  membership: null,
  loading: true,
  error: null,
  switchBusiness: () => {},
  refreshBusinesses: async () => {},
});

export function BusinessProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [currentBusiness, setCurrentBusiness] = useState<Business | null>(null);
  const [membership, setMembership] = useState<Membership | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // The user the in-flight fetch belongs to, so a late response can never write
  // state for a different signed-in user.
  const fetchedFor = useRef<string | null>(null);

  const loadBusinesses = useCallback(async () => {
    const uid = user?.id ?? null;
    fetchedFor.current = uid;

    if (!user) {
      setBusinesses([]);
      setCurrentBusiness(null);
      setMembership(null);
      setError(null);
      setLoading(false);
      return;
    }

    // Re-raise loading on every fetch (including when the user changes) so
    // consumers gating on it — e.g. the dashboard layout guard — never act on
    // stale "no business" state while memberships are still resolving.
    setLoading(true);

    const { data: memberships, error: fetchError } = await supabase
      .from('memberships')
      .select('*, businesses(*)')
      .eq('user_id', user.id);

    if (fetchedFor.current !== uid) return;

    // A failed query says nothing about whether this user has a business. Keep
    // whatever was already resolved and surface a retryable error, rather than
    // clearing state and letting the guard treat it as "no business".
    if (fetchError) {
      setError(fetchError.message || 'Could not load your business.');
      setLoading(false);
      return;
    }

    setError(null);

    if (memberships && memberships.length > 0) {
      const bizList = memberships.map((m: Record<string, unknown>) => m.businesses) as Business[];
      const memberList = memberships.map((m: Record<string, unknown>) => ({
        id: m.id as string,
        user_id: m.user_id as string,
        business_id: m.business_id as string,
        role: m.role as Membership['role'],
        created_at: m.created_at as string,
      })) as Membership[];

      setBusinesses(bizList);

      const stored = typeof window !== 'undefined' ? localStorage.getItem('bas_current_business_id') : null;
      const storedBiz = stored ? bizList.find((b) => b.id === stored) : null;
      const target = storedBiz || bizList[0];

      setCurrentBusiness(target);
      const member = memberList.find((m) => m.business_id === target.id);
      setMembership(member || null);
    } else {
      setBusinesses([]);
      setCurrentBusiness(null);
      setMembership(null);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    loadBusinesses();
  }, [loadBusinesses]);

  const switchBusiness = (businessId: string) => {
    const biz = businesses.find((b) => b.id === businessId);
    if (biz) {
      setCurrentBusiness(biz);
      if (typeof window !== 'undefined') {
        localStorage.setItem('bas_current_business_id', businessId);
      }
    }
  };

  const refreshBusinesses = async () => {
    await loadBusinesses();
  };

  return (
    <BusinessContext.Provider
      value={{ businesses, currentBusiness, membership, loading, error, switchBusiness, refreshBusinesses }}
    >
      {children}
    </BusinessContext.Provider>
  );
}

export function useBusiness() {
  return useContext(BusinessContext);
}
