/**
 * Product & Wellness Program Type Definitions
 */

export type ProductCategoryType = 
  | 'metabolic' 
  | 'cellular' 
  | 'recovery' 
  | 'longevity' 
  | 'stacks';

export type ProductStatus = 'ACTIVE' | 'DRAFT' | 'ARCHIVED' | 'OUT_OF_STOCK';

export interface ProductStrength {
  label: string; // e.g. "5mg (10 Vials)"
  vialsCount: number; // e.g. 10
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
  salePrice?: number;
  imageUrl: string;
  galleryImages?: string[];
  stockQuantity: number;
  status: ProductStatus;
  featured: boolean;
  isStack?: boolean;
  stackItems?: string[];
  strengths: ProductStrength[];
  lotNumber?: string;
  purity?: string; // e.g. ">99.4% HPLC"
  coaUrl?: string;
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
  createdAt?: string;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  organization: string;
  quote: string;
  rating: number;
  verified: boolean;
  featured: boolean;
  createdAt?: string;
}
