import { Store, Scissors, Hotel, UtensilsCrossed, Heart, Briefcase, Building2 } from 'lucide-react';

export const BUSINESS_TYPES = [
  { value: 'clothing_store', label: 'Clothing Store', icon: Store },
  { value: 'salon', label: 'Salon / Beauty', icon: Scissors },
  { value: 'hotel', label: 'Hotel / Hospitality', icon: Hotel },
  { value: 'restaurant', label: 'Restaurant', icon: UtensilsCrossed },
  { value: 'ngo', label: 'NGO / Non-profit', icon: Heart },
  { value: 'professional', label: 'Professional Services', icon: Briefcase },
  { value: 'general', label: 'Other Business', icon: Building2 },
];

export const PLATFORM_OPTIONS = [
  { value: 'website', label: 'Website' },
  { value: 'ecommerce', label: 'E-commerce (Shopify, WooCommerce)' },
  { value: 'whatsapp', label: 'WhatsApp Business' },
  { value: 'booking', label: 'Booking System' },
  { value: 'social_media', label: 'Social Media' },
  { value: 'none', label: 'No digital platform' },
];