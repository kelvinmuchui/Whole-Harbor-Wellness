/**
 * Partner Ecosystem Type Definitions
 */

export type PartnerStatus =
  | 'NEW'
  | 'UNDER REVIEW'
  | 'APPROVED'
  | 'DECLINED'
  | 'NEEDS INFORMATION'
  | 'PENDING'
  | 'SUSPENDED'
  | 'REJECTED';

export interface Partner {
  id: string; // Database Primary Key UUID
  partnerId: string; // Immutable formatted ID, e.g. WH-P-000001
  name: string; // Display name
  businessName?: string;
  slug: string; // Unique URL slug, e.g. /partner/apex-performance
  contactPerson: string;
  email: string;
  phone?: string;
  description: string;
  logoUrl?: string;
  website?: string;
  category: string; // Business type: e.g. Yoga Studio, Fitness Studio, Wellness Practice
  address?: string;
  location?: string;
  populationServed?: string;
  memberBaseSize?: string;
  currentWellnessServices?: string;
  whyPartner?: string;
  marketingStrategy?: string;
  promotionPlan?: string;
  agreedToTerms?: boolean;
  agreedAt?: string;
  adminNotes?: string;
  status: PartnerStatus;
  commissionRate: number; // e.g. 0.25 (25%)
  memberDiscountRate: number; // e.g. 0.15 (15%)
  ownerUid?: string;
  featuredProducts?: string[];
  createdAt: string;
  updatedAt?: string;
  deletedAt?: string | null;
}

export interface PartnerEarning {
  id: string;
  partnerId: string;
  partnerSlug: string;
  orderId: string;
  orderNumber: string;
  customerName: string;
  grossSales: number;
  eligibleSales: number;
  commissionRate: number;
  earningAmount: number;
  status: 'PENDING' | 'APPROVED' | 'PAID' | 'CANCELLED';
  payoutBatchId?: string;
  paidAt?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ReferralSession {
  partnerId: string;
  partnerSlug: string;
  partnerName: string;
  discountRate: number;
  commissionRate: number;
  timestamp: number;
  referralSource?: string;
  visitorSessionId?: string;
}
