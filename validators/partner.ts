import { z } from 'zod';
import { PARTNER_CONSTANTS } from '../config/constants.ts';

export const PartnerSlugSchema = z
  .string()
  .trim()
  .min(2, { message: 'Slug must be at least 2 characters' })
  .max(60, { message: 'Slug cannot exceed 60 characters' })
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'Slug must consist only of lowercase letters, numbers, and single hyphens'
  })
  .refine((slug) => !PARTNER_CONSTANTS.RESERVED_SLUGS.includes(slug as any), {
    message: 'This slug matches a reserved application route'
  });

export const PartnerRegistrationSchema = z.object({
  businessName: z.string().trim().min(2, { message: 'Business name is required' }).max(120),
  contactPerson: z.string().trim().min(2, { message: 'Contact person is required' }).max(100),
  email: z.string().trim().email({ message: 'Valid contact email is required' }),
  phone: z.string().trim().min(7, { message: 'Valid phone number is required' }).optional(),
  category: z.string().trim().min(2, { message: 'Practice category is required' }),
  description: z.string().trim().min(10, { message: 'Practice description must be at least 10 characters' }).max(1000),
  website: z.string().trim().url({ message: 'Must be a valid URL' }).optional().or(z.literal('')),
  address: z.string().trim().max(255).optional(),
  customSlug: PartnerSlugSchema.optional()
});

export const PartnerStatusUpdateSchema = z.object({
  partnerId: z.string().min(1),
  status: z.enum(['PENDING', 'APPROVED', 'SUSPENDED', 'REJECTED']),
  reason: z.string().optional()
});

export const PartnerRatesUpdateSchema = z.object({
  partnerId: z.string().min(1),
  commissionRate: z.number().min(0.05).max(0.50), // 5% to 50%
  memberDiscountRate: z.number().min(0.00).max(0.30) // 0% to 30%
});

export type PartnerRegistrationInput = z.infer<typeof PartnerRegistrationSchema>;
export type PartnerStatusUpdateInput = z.infer<typeof PartnerStatusUpdateSchema>;
export type PartnerRatesUpdateInput = z.infer<typeof PartnerRatesUpdateSchema>;
