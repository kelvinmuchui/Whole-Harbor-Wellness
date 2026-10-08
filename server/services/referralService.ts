/**
 * WHOLE HARBOR WELLNESS — REFERRAL ATTRIBUTION SERVICE
 * Manages 30-day attribution window, session association, and commission resolution
 */

import { PARTNER_CONSTANTS } from '../../config/constants.ts';
import { ReferralSession, Partner } from '../../types/partner.ts';

const THIRTY_DAYS_MS = PARTNER_CONSTANTS.ATTRIBUTION_WINDOW_DAYS * 24 * 60 * 60 * 1000;

/**
 * Creates an active referral session object when a user visits /partner/[slug]
 */
export function createReferralSession(
  partner: Partner, 
  visitorSessionId?: string, 
  source = 'partner_url'
): ReferralSession {
  return {
    partnerId: partner.id,
    partnerSlug: partner.slug,
    partnerName: partner.name,
    discountRate: Number(partner.memberDiscountRate) || PARTNER_CONSTANTS.DEFAULT_MEMBER_DISCOUNT_RATE,
    commissionRate: Number(partner.commissionRate) || PARTNER_CONSTANTS.DEFAULT_COMMISSION_RATE,
    timestamp: Date.now(),
    visitorSessionId,
    referralSource: `${source}:${partner.slug}`
  };
}

/**
 * Checks whether an existing referral session remains inside the valid attribution window
 */
export function isReferralSessionValid(session: ReferralSession | null | undefined): boolean {
  if (!session) return false;
  const elapsed = Date.now() - session.timestamp;
  return elapsed <= THIRTY_DAYS_MS;
}

/**
 * Computes partner commission and patient discount for an order
 */
export function calculateAttributedCommission(
  grossSubtotal: number, 
  session: ReferralSession | null | undefined
): {
  isAttributed: boolean;
  partnerId?: string;
  partnerSlug?: string;
  partnerName?: string;
  partnerDiscountAmount: number;
  partnerCommissionAmount: number;
} {
  if (!session || !isReferralSessionValid(session)) {
    return {
      isAttributed: false,
      partnerDiscountAmount: 0,
      partnerCommissionAmount: 0
    };
  }

  // Member discount applied to gross subtotal
  const discountAmount = Number((grossSubtotal * session.discountRate).toFixed(2));
  
  // Eligible sales amount is net subtotal after discount
  const eligibleAmount = Math.max(0, grossSubtotal - discountAmount);
  
  // Commission calculated on eligible sales
  const commissionAmount = Number((eligibleAmount * session.commissionRate).toFixed(2));

  return {
    isAttributed: true,
    partnerId: session.partnerId,
    partnerSlug: session.partnerSlug,
    partnerName: session.partnerName,
    partnerDiscountAmount: discountAmount,
    partnerCommissionAmount: commissionAmount
  };
}
