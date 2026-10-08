/**
 * WHOLE HARBOR WELLNESS — PARTNER BUSINESS SERVICE
 * Handles Partner ID generation, slug management, and onboarding logic
 */

import { PARTNER_CONSTANTS } from '../../config/constants.ts';
import { Partner, PartnerStatus } from '../../types/partner.ts';

/**
 * Formats a sequence number into an immutable, unique, human-readable Partner ID
 * e.g. 1 -> "WH-P-000001"
 */
export function formatPartnerId(sequenceNumber: number): string {
  const padded = sequenceNumber.toString().padStart(PARTNER_CONSTANTS.ID_PADDING_LENGTH, '0');
  return `${PARTNER_CONSTANTS.ID_PREFIX}${padded}`;
}

/**
 * Normalizes and sanitizes a requested business name into a URL slug
 */
export function generatePartnerSlug(businessName: string): string {
  return businessName
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Validates slug against collision with reserved routes and existing partners
 */
export function validateSlugAvailability(
  slug: string, 
  existingSlugs: string[]
): { valid: boolean; error?: string } {
  if (PARTNER_CONSTANTS.RESERVED_SLUGS.includes(slug as any)) {
    return {
      valid: false,
      error: `Slug "${slug}" conflicts with a reserved system route.`
    };
  }

  if (existingSlugs.map((s) => s.toLowerCase()).includes(slug.toLowerCase())) {
    return {
      valid: false,
      error: `Slug "${slug}" is already registered by another partner.`
    };
  }

  return { valid: true };
}

/**
 * Partner Status State Machine Validator
 */
export function canTransitionPartnerStatus(
  currentStatus: PartnerStatus, 
  newStatus: PartnerStatus
): boolean {
  if (currentStatus === newStatus) return true;

  switch (currentStatus) {
    case 'PENDING':
      return newStatus === 'APPROVED' || newStatus === 'REJECTED';
    case 'APPROVED':
      return newStatus === 'SUSPENDED';
    case 'SUSPENDED':
      return newStatus === 'APPROVED' || newStatus === 'REJECTED';
    case 'REJECTED':
      return newStatus === 'PENDING'; // Can be re-evaluated
    default:
      return false;
  }
}
