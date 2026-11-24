/**
 * API Standard Request/Response & Error Type Definitions
 */

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: {
    page?: number;
    pageSize?: number;
    total?: number;
    timestamp: string;
  };
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, string[]> | unknown;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ContactInquiry {
  id: string;
  name: string;
  email: string;
  phone?: string;
  orderNumber?: string;
  department: string;
  message: string;
  source: 'contact_page' | 'about_page' | 'programs_page' | 'portal';
  status: 'NEW' | 'IN_PROGRESS' | 'RESOLVED';
  userId?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface AnalyticsEvent {
  id: string;
  eventType: 'page_view' | 'product_view' | 'partner_visit' | 'add_to_cart' | 'checkout_completed' | 'search';
  path: string;
  label?: string;
  partnerSlug?: string;
  userId?: string;
  value?: number;
  timestamp: string;
}

