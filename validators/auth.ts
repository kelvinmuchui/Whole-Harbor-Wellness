import { z } from 'zod';
import { USER_ROLES } from '../config/constants.ts';

export const RegisterUserSchema = z.object({
  email: z.string().trim().email({ message: 'A valid email address is required' }).max(255),
  name: z.string().trim().min(2, { message: 'Name must be at least 2 characters' }).max(100),
  password: z
    .string()
    .min(8, { message: 'Password must be at least 8 characters long' })
    .regex(/[A-Z]/, { message: 'Password must contain at least one uppercase letter' })
    .regex(/[a-z]/, { message: 'Password must contain at least one lowercase letter' })
    .regex(/[0-9]/, { message: 'Password must contain at least one numeric digit' }),
  role: z.enum([
    USER_ROLES.CUSTOMER,
    USER_ROLES.PARTNER_OWNER,
    USER_ROLES.PARTNER_STAFF,
    USER_ROLES.ADMIN,
    USER_ROLES.SALES_ADMIN
  ]).default(USER_ROLES.CUSTOMER),
  phone: z.string().optional()
});

export const LoginSchema = z.object({
  email: z.string().trim().email({ message: 'Valid email is required' }),
  password: z.string().min(1, { message: 'Password is required' })
});

export const PasswordResetRequestSchema = z.object({
  email: z.string().trim().email({ message: 'Valid email is required' })
});

export const PasswordResetConfirmSchema = z.object({
  token: z.string().min(16, { message: 'Valid reset token is required' }),
  newPassword: z.string().min(8, { message: 'Password must be at least 8 characters' })
});

export type RegisterUserInput = z.infer<typeof RegisterUserSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
export type PasswordResetRequestInput = z.infer<typeof PasswordResetRequestSchema>;
export type PasswordResetConfirmInput = z.infer<typeof PasswordResetConfirmSchema>;
