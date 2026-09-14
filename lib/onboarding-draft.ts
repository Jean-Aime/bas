const KEY = 'bas-onboarding-draft';

export interface OnboardingDraft {
  business: {
    name: string;
    type: string;
    country: string;
    city: string;
    email: string;
    phone: string;
    description: string;
    currency: string;
  };
  channels: { platforms: string[]; websiteUrl: string };
  hours: { open: string; close: string; closedWeekends: boolean };
  products: { name: string; price: string; description: string }[];
  services: { name: string; price: string; duration: string }[];
  knowledge: { question: string; answer: string }[];
  automation: string[];
}

export const EMPTY_DRAFT: OnboardingDraft = {
  business: { name: '', type: 'general', country: '', city: '', email: '', phone: '', description: '', currency: 'USD' },
  channels: { platforms: [], websiteUrl: '' },
  hours: { open: '09:00', close: '18:00', closedWeekends: true },
  products: [],
  services: [],
  knowledge: [],
  automation: [],
};

export function loadDraft(): OnboardingDraft {
  if (typeof window === 'undefined') return structuredClone(EMPTY_DRAFT);
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return structuredClone(EMPTY_DRAFT);
    return { ...structuredClone(EMPTY_DRAFT), ...JSON.parse(raw) };
  } catch {
    return structuredClone(EMPTY_DRAFT);
  }
}

export function saveDraft(draft: OnboardingDraft) {
  window.localStorage.setItem(KEY, JSON.stringify(draft));
}

export function clearDraft() {
  window.localStorage.removeItem(KEY);
}