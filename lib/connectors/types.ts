export type ConnectorType =
  | 'webchat'
  | 'website'
  | 'whatsapp'
  | 'email'
  | 'shopify'
  | 'woocommerce'
  | 'wordpress'
  | 'calendar'
  | 'booking_system'
  | 'crm'
  | 'payment'
  | 'delivery'
  | 'custom_api';

export type ConnectorStatus = 'connected' | 'disconnected' | 'error' | 'coming_soon';

export type ConnectorCategory = 'channels' | 'commerce' | 'website' | 'booking' | 'business' | 'payments';

export interface ConnectorMetadata {
  type: ConnectorType;
  displayName: string;
  description: string;
  icon: string;
  category: ConnectorCategory;
  status: ConnectorStatus;
}