/**
 * WHOLE HARBOR WELLNESS — STATIC SYSTEM CONFIGURATION
 * Static configuration replacing dynamic environment variables.
 * No external .env or environment configuration required.
 */

export const STATIC_CONFIG = {
  app: {
    name: 'Whole Harbor Wellness',
    tagline: 'Wellness Should Be Personal.',
    url: 'http://localhost:3000',
    mode: 'static_embedded',
    supportEmail: 'concierge@wholeharborwellness.com',
    version: '1.0.0'
  },

  database: {
    provider: 'postgresql',
    connectionString: 'postgresql://wh_user:wh_password@localhost:5432/whole_harbor_wellness?schema=public',
    schema: 'public',
    poolMin: 2,
    poolMax: 10
  },

  auth: {
    secretKey: 'wh_static_master_auth_secret_e9956964_210f_4326',
    sessionExpiryDays: 30,
    cookieName: 'wh_session_token',
    pbkdf2Iterations: 100000,
    hashAlgorithm: 'SHA-256'
  },

  partner: {
    idPrefix: 'WH-P-',
    idPaddingLength: 6,
    defaultCommissionRate: 0.25,      // 25% revenue share
    defaultMemberDiscountRate: 0.15,  // 15% patient VIP discount
    attributionWindowDays: 30,        // 30 days attribution period
    cookieName: 'wh_partner_ref'
  },

  orders: {
    orderNumberPrefix: 'WH-ORD-',
    trackingNumberPrefix: 'WH-EXP-CC-',
    freeShippingThreshold: 500.00,
    standardColdChainFee: 15.00,
    taxRate: 0.0825 // 8.25%
  },

  services: {
    emailProvider: 'static_mock',
    paymentProvider: 'static_simulator',
    storageProvider: 'static_assets',
    analyticsId: 'STATIC_ANALYTICS_OFF'
  }
} as const;

export default STATIC_CONFIG;
