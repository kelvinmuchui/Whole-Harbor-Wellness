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
    mode: 'test',
    supportEmail: 'concierge@wholeharborwellness.com',
    version: '1.0.0'
  },

  database: {
    provider: 'firestore_test',
    connectionString: 'test://firestore-local-cache',
    schema: 'public',
    poolMin: 1,
    poolMax: 5
  },

  auth: {
    secretKey: 'test_session_key',
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
    emailProvider: 'test_mock',
    paymentProvider: 'test_simulator',
    storageProvider: 'test_assets',
    analyticsId: 'TEST_ANALYTICS_OFF'
  }
} as const;

export default STATIC_CONFIG;
