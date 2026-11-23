/**
 * WHOLE HARBOR WELLNESS — CENTRAL TEST VARIABLES
 * Reads Vite test-mode environment variables with immediate safe fallbacks
 * so local development, previews, and shared deployments run out of the box.
 */

const env = import.meta.env || {};

export const TEST_VARS = {
  appMode: env.VITE_APP_MODE || 'test',
  appUrl: env.VITE_APP_URL || 'http://localhost:3000',
  authMode: env.VITE_AUTH_MODE || 'test',
  paymentMode: env.VITE_PAYMENT_MODE || 'test',
  enableTestSeed: (env.VITE_ENABLE_TEST_SEED ?? 'true') !== 'false',

  auth: {
    mfaCode: env.VITE_TEST_MFA_CODE || '849201',
    fallbackMfaCode: '123456',
    adminEmail: env.VITE_TEST_ADMIN_EMAIL || 'admin@wholeharborwellness.com',
    demoPasswords: {
      admin: 'WhwTestAdmin!2026',
      partner: 'WhwTestPartner!2026',
      customer: 'WhwTestClient!2026'
    }
  },

  partner: {
    commissionRate: Number(env.VITE_PARTNER_COMMISSION_RATE || 0.25),
    memberDiscountRate: Number(env.VITE_MEMBER_DISCOUNT_RATE || 0.15),
    attributionWindowDays: Number(env.VITE_ATTRIBUTION_WINDOW_DAYS || 30)
  },

} as const;

export const demoModeEnabled =
  TEST_VARS.appMode === 'test' &&
  TEST_VARS.authMode === 'test' &&
  TEST_VARS.enableTestSeed;
