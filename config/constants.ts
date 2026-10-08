/**
 * WHOLE HARBOR WELLNESS — SYSTEM ARCHITECTURAL CONSTANTS
 * Core business logic thresholds and immutable identifiers
 */

export const APP_METADATA = {
  name: 'Whole Harbor Wellness',
  tagline: 'Wellness Should Be Personal.',
  description: 'Clinical-grade holistic wellness platform, high-purity metabolic support kits, physician-supervised longevity protocols, and turnkey partner ecosystem.',
  version: '1.0.0-module1',
  supportEmail: 'concierge@wholeharborwellness.com'
} as const;

export const USER_ROLES = {
  CUSTOMER: 'CUSTOMER',
  PARTNER_OWNER: 'PARTNER_OWNER',
  PARTNER_STAFF: 'PARTNER_STAFF',
  ADMIN: 'ADMIN',
  SALES_ADMIN: 'SALES_ADMIN'
} as const;

export const PARTNER_CONSTANTS = {
  ID_PREFIX: 'WH-P-',
  ID_PADDING_LENGTH: 6, // WH-P-000001
  DEFAULT_COMMISSION_RATE: 0.25, // 25% revenue share
  DEFAULT_MEMBER_DISCOUNT_RATE: 0.15, // 15% patient VIP discount
  ATTRIBUTION_WINDOW_DAYS: 30, // 30-day cookie / session window
  COOKIE_NAME: 'wh_partner_ref',
  RESERVED_SLUGS: [
    'admin',
    'api',
    'app',
    'auth',
    'login',
    'register',
    'signup',
    'checkout',
    'cart',
    'shop',
    'wellness-programs',
    'approach',
    'partners',
    'learn',
    'about',
    'terms',
    'privacy',
    'settings',
    'portal'
  ]
} as const;

export const VOLUME_DISCOUNT_TIERS = [
  { minKits: 6, discountRate: 0.12, label: '12% Multi-Kit Volume Savings' },
  { minKits: 4, discountRate: 0.08, label: '8% Multi-Kit Volume Savings' },
  { minKits: 2, discountRate: 0.05, label: '5% Multi-Kit Volume Savings' }
] as const;

export const ORDER_CONSTANTS = {
  ORDER_NUMBER_PREFIX: 'WH-ORD-',
  TRACKING_PREFIX: 'WH-EXP-CC-',
  FREE_SHIPPING_THRESHOLD: 500.00,
  STANDARD_COLD_CHAIN_SHIPPING_FEE: 15.00,
  ESTIMATED_TAX_RATE: 0.0825 // 8.25%
} as const;

export const ERROR_CODES = {
  UNAUTHENTICATED: 'UNAUTHENTICATED',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
  PARTNER_SLUG_TAKEN: 'PARTNER_SLUG_TAKEN',
  PARTNER_SUSPENDED: 'PARTNER_SUSPENDED'
} as const;
