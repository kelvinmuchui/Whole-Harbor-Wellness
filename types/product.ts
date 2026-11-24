/**
 * Product & Wellness Program Type Definitions
 */

export type ProductCategoryType = 
  | 'metabolic' 
  | 'cellular' 
  | 'recovery' 
  | 'longevity' 
  | 'stacks';

export type ProductStatus =
  | 'ACTIVE'
  | 'DISABLED'
  | 'UNAVAILABLE'
  | 'DRAFT'
  | 'ARCHIVED'
  | 'OUT_OF_STOCK';

export interface ProductStrength {
  label: string; // e.g. "10mg (1 Vial)" or "10mg (10-Vial Kit)"
  vialsCount: number; // e.g. 1 for individual vial, 10 for kit
  price: number;
  pricePerVial?: number;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  slug: string;
  category: ProductCategoryType;
  categoryLabel: string;
  shortDescription: string;
  description: string;
  price: number;
  wholesalePrice?: number;
  salePrice?: number;
  imageUrl: string;
  galleryImages?: string[];
  stockQuantity: number;
  status: ProductStatus;
  featured: boolean;
  isStack?: boolean;
  stackItems?: string[];
  strengths: ProductStrength[];
  wholesaleStrengths?: ProductStrength[];
  lotNumber?: string;
  purity?: string; // e.g. ">99.4% HPLC"
  coaUrl?: string;
  disclosures?: string;
  educationalMaterial?: string;
  createdAt: string;
  updatedAt?: string;
  deletedAt?: string | null;
}

export interface WellnessProgram {
  id: string;
  name: string;
  slug: string;
  duration: string; // e.g. "12 Weeks"
  category: string;
  tag: string; // e.g. "Physician Guided"
  shortDescription: string;
  fullDescription: string;
  priceMonthly: number;
  imageUrl?: string;
  eligibility?: string;
  ctaLabel?: string;
  ctaLink?: string;
  publishedAt?: string;
  features: string[];
  status: 'ACTIVE' | 'DRAFT' | 'ARCHIVED';
  featured: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface EducationalArticle {
  id: string;
  title: string;
  slug: string;
  category: string;
  readTime: string;
  summary: string;
  content: string;
  imageUrl: string;
  author: string;
  tags?: string[];
  seoTitle?: string;
  seoDescription?: string;
  publishedAt?: string;
  status: 'PUBLISHED' | 'DRAFT' | 'ARCHIVED';
  createdAt: string;
  updatedAt?: string;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  orderIndex: number;
  status?: 'PUBLISHED' | 'DRAFT';
  createdAt?: string;
  updatedAt?: string;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  organization: string;
  quote: string;
  rating: number;
  imageUrl?: string;
  category?: string;
  consentConfirmed?: boolean;
  status?: 'PUBLISHED' | 'DRAFT';
  verified: boolean;
  featured: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CmsPageSection {
  title: string;
  body: string;
  badge?: string;
}

export interface CmsPageContent {
  id: string;
  slug: string; // e.g. 'privacy', 'terms', 'coa-verification', 'cold-chain', 'our-approach', 'storefront-promo'
  title: string;
  subtitle?: string;
  category: 'Legal & Compliance' | 'Storefront & Approach' | 'Promotions' | 'Custom Page';
  body: string;
  ctaLabel?: string;
  ctaPath?: string;
  seoTitle?: string;
  seoDescription?: string;
  sections?: CmsPageSection[];
  status: 'PUBLISHED' | 'DRAFT';
  updatedAt: string;
  createdAt: string;
}

export interface MediaAsset {
  id: string;
  title: string;
  url: string;
  category: 'Brand & Hero' | 'Products' | 'Learn Studio' | 'Uploaded';
  mimeType?: string;
  isBuiltIn?: boolean;
  createdAt: string;
  updatedAt?: string;
}
