import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  company: z.string().optional(),
  location: z.string().optional(),
  role: z.enum(['producer', 'collector', 'recycler'])
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
});

export const updateProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  company: z.string().optional(),
  location: z.string().optional()
});

export const wasteValidationSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  quantity: z.number().positive('Quantity must be positive'),
  unit: z.string().min(1, 'Unit is required'),
  wasteType: z.enum(['organic', 'plastic', 'metal', 'electronic', 'paper', 'glass', 'other']),
  location: z.string().min(3, 'Location is required'),
  availability: z.enum(['immediate', 'scheduled']),
  scheduledDate: z.string().optional(),
  imageUrl: z.string().optional(),
  qrCode: z.string().optional()
});

export const wasteStatusSchema = z.object({
  status: z.enum(['available', 'pending', 'collected', 'processing', 'recycled']),
  notes: z.string().optional(),
  collectorId: z.string().optional(),
  recyclerId: z.string().optional()
});
