import { z } from 'zod';

export const ProductStrengthSchema = z.object({
  label: z.string().min(1, { message: 'Strength tier label is required' }),
  vialsCount: z.number().int().min(1),
  price: z.number().positive(),
  pricePerVial: z.number().positive().optional()
});

export const CreateProductSchema = z.object({
  sku: z.string().trim().min(3).max(30),
  name: z.string().trim().min(2).max(120),
  slug: z.string().trim().min(2).max(120).regex(/^[a-z0-9-]+$/),
  category: z.enum(['metabolic', 'cellular', 'recovery', 'longevity', 'stacks']),
  categoryLabel: z.string().min(2),
  shortDescription: z.string().trim().min(10).max(500),
  description: z.string().trim().min(20),
  price: z.number().positive(),
  salePrice: z.number().positive().optional(),
  stockQuantity: z.number().int().nonnegative().default(0),
  status: z.enum(['ACTIVE', 'DRAFT', 'ARCHIVED', 'OUT_OF_STOCK']).default('ACTIVE'),
  featured: z.boolean().default(false),
  purity: z.string().optional(),
  lotNumber: z.string().optional(),
  coaUrl: z.string().url().optional().or(z.literal('')),
  imageUrl: z.string().url().or(z.literal('')),
  strengths: z.array(ProductStrengthSchema).min(1)
});

export const UpdateProductStockSchema = z.object({
  productId: z.string().min(1),
  stockQuantity: z.number().int().nonnegative(),
  status: z.enum(['ACTIVE', 'DRAFT', 'ARCHIVED', 'OUT_OF_STOCK']).optional()
});

export type CreateProductInput = z.infer<typeof CreateProductSchema>;
export type UpdateProductStockInput = z.infer<typeof UpdateProductStockSchema>;
