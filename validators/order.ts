import { z } from 'zod';

export const ShippingAddressSchema = z.object({
  fullName: z.string().trim().min(2, { message: 'Full recipient name is required' }),
  addressLine1: z.string().trim().min(3, { message: 'Street address is required' }),
  addressLine2: z.string().trim().optional(),
  city: z.string().trim().min(2, { message: 'City is required' }),
  state: z.string().trim().min(2, { message: 'State / Province is required' }),
  postalCode: z.string().trim().min(3, { message: 'Postal code is required' }),
  country: z.string().trim().default('United States'),
  phone: z.string().trim().optional()
});

export const OrderItemSchema = z.object({
  productId: z.string().min(1),
  productName: z.string().min(1),
  productSlug: z.string().min(1),
  strengthLabel: z.string().min(1),
  vialsCount: z.number().int().positive(),
  unitPrice: z.number().positive(),
  quantity: z.number().int().positive().max(100),
  imageUrl: z.string().url().or(z.literal(''))
});

export const CreateOrderSchema = z.object({
  customerName: z.string().trim().min(2),
  customerEmail: z.string().trim().email(),
  shippingAddress: ShippingAddressSchema,
  items: z.array(OrderItemSchema).min(1, { message: 'Order must contain at least one formulation' }),
  partnerSlug: z.string().optional(),
  referralSessionId: z.string().optional(),
  clinicalAcknowledgment: z.literal(true, {
    message: 'Clinical acknowledgment of protocol guidelines is required'
  })
});

export const UpdateOrderStatusSchema = z.object({
  orderId: z.string().min(1),
  status: z.enum([
    'PENDING',
    'CONFIRMED',
    'PROCESSING',
    'SHIPPED',
    'COMPLETED',
    'CANCELLED',
    'REFUNDED'
  ]),
  trackingNumber: z.string().optional(),
  notes: z.string().optional()
});

export type ShippingAddressInput = z.infer<typeof ShippingAddressSchema>;
export type OrderItemInput = z.infer<typeof OrderItemSchema>;
export type CreateOrderInput = z.infer<typeof CreateOrderSchema>;
export type UpdateOrderStatusInput = z.infer<typeof UpdateOrderStatusSchema>;
