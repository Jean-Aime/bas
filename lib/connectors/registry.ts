import type { ConnectorMetadata, ConnectorType } from './types';

/**
 * Single source of truth for the integrations catalog. Only web chat and
 * website import are actually implemented today; every other entry is honestly
 * labeled "coming soon" instead of registering no-op stubs as connected.
 */
const CONNECTOR_CATALOG: ConnectorMetadata[] = [
  { type: 'webchat', displayName: 'Web Chat', description: 'Built-in customer chat widget', icon: 'MessageSquare', category: 'channels', status: 'connected' },
  { type: 'whatsapp', displayName: 'WhatsApp', description: 'WhatsApp Business API integration', icon: 'MessageSquare', category: 'channels', status: 'coming_soon' },
  { type: 'email', displayName: 'Email', description: 'Email-based customer support', icon: 'Mail', category: 'channels', status: 'coming_soon' },
  { type: 'shopify', displayName: 'Shopify', description: 'Sync products and orders from Shopify', icon: 'ShoppingBag', category: 'commerce', status: 'coming_soon' },
  { type: 'woocommerce', displayName: 'WooCommerce', description: 'Connect your WooCommerce store', icon: 'ShoppingBag', category: 'commerce', status: 'coming_soon' },
  { type: 'wordpress', displayName: 'WordPress', description: 'Import content from WordPress sites', icon: 'Globe', category: 'website', status: 'coming_soon' },
  { type: 'website', displayName: 'Custom Website', description: 'Import content from any website URL', icon: 'Globe', category: 'website', status: 'connected' },
  { type: 'calendar', displayName: 'Calendar', description: 'Google Calendar integration for bookings', icon: 'Calendar', category: 'booking', status: 'coming_soon' },
  { type: 'booking_system', displayName: 'Booking System', description: 'External booking system connector', icon: 'Calendar', category: 'booking', status: 'coming_soon' },
  { type: 'crm', displayName: 'CRM', description: 'Sync customers with your CRM', icon: 'Building2', category: 'business', status: 'coming_soon' },
  { type: 'custom_api', displayName: 'Custom API', description: 'Connect any external API', icon: 'Building2', category: 'business', status: 'coming_soon' },
  { type: 'payment', displayName: 'Payment Provider', description: 'Accept payments through your chat', icon: 'CreditCard', category: 'payments', status: 'coming_soon' },
];

export function getAllConnectorMetadata(): ConnectorMetadata[] {
  return CONNECTOR_CATALOG;
}

export function getConnectorsByCategory(category: ConnectorMetadata['category']): ConnectorMetadata[] {
  return CONNECTOR_CATALOG.filter((c) => c.category === category);
}

export type { ConnectorMetadata, ConnectorType };