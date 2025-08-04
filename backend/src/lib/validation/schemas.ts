import { z } from 'zod'
import { UserRole } from '@/generated/prisma'

// Common schemas
export const idSchema = z.object({
  id: z.string().cuid('Invalid ID format')
})

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(1000).default(10),
})

export const sortSchema = z.object({
  sort: z.string().optional(),
  order: z.enum(['asc', 'desc']).default('asc'),
})

// Auth schemas
export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  role: z.nativeEnum(UserRole).default('VIEWER'),
})

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string().min(1, 'Confirm password is required'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

// User schemas
export const updateUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  role: z.nativeEnum(UserRole).optional(),
  isActive: z.boolean().optional(),
})

// Domain schemas
export const createDomainSchema = z.object({
  name: z.string().min(3, 'Domain name must be at least 3 characters'),
  registrar: z.string().optional(),
  status: z.enum(['ACTIVE', 'EXPIRED', 'SUSPENDED', 'TRANSFERRED', 'DELETED']).default('ACTIVE'),
  registeredAt: z.string().datetime({ message: "Invalid datetime format for registeredAt" }).optional().or(z.literal('')),
  expiresAt: z.string().datetime({ message: "Invalid datetime format for expiresAt" }).optional().or(z.literal('')),
  nameservers: z.array(z.string()).optional(),
  notes: z.string().optional(),
  hostingId: z.string().cuid({ message: "Invalid CUID format for hostingId" }).optional().or(z.literal('')).nullable(),
  isMainDomain: z.boolean().default(false),
})

export const updateDomainSchema = z.object({
  registrar: z.string().optional(),
  status: z.enum(['ACTIVE', 'EXPIRED', 'SUSPENDED', 'TRANSFERRED', 'DELETED']).optional(),
  registeredAt: z.string().datetime().optional(),
  expiresAt: z.string().datetime().optional(),
  nameservers: z.array(z.string()).optional(),
  notes: z.string().optional(),
  isMainDomain: z.boolean().optional(),
  hostingId: z.string().cuid({ message: "Invalid CUID format for hostingId" }).nullable().optional(),
  vpsId: z.string().cuid({ message: "Invalid CUID format for vpsId" }).nullable().optional(),
  domainHosting: z.string().nullable().optional(),
})

// Hosting schemas
export const createHostingSchema = z.object({
  name: z.string().min(3, 'Hosting name must be at least 3 characters').optional(),
  provider: z.string().min(2, 'Provider name must be at least 2 characters'),
  status: z.enum(['ACTIVE', 'SUSPENDED', 'EXPIRED', 'CANCELLED', 'EXPIRING_SOON']).default('ACTIVE'),
  planName: z.string().optional(),
  resources: z.record(z.string(), z.union([z.string(), z.number()])).optional(),
  cpanelUrl: z.string().url('Invalid cPanel URL').optional().or(z.literal('')),
  username: z.string().optional(),
  password: z.string().optional(),
  createdAt: z.string().datetime().optional(),
  expiresAt: z.string().datetime().optional(),
  notes: z.string().optional(),
  domainIds: z.array(z.string()).optional(),
})

export const updateHostingSchema = z.object({
  name: z.string().min(3, 'Hosting name must be at least 3 characters').optional(),
  provider: z.string().min(2, 'Provider name must be at least 2 characters').optional(),
  status: z.enum(['ACTIVE', 'SUSPENDED', 'EXPIRED', 'CANCELLED', 'EXPIRING_SOON']).optional(),
  planName: z.string().optional(),
  resources: z.record(z.string(), z.union([z.string(), z.number()])).optional(),
  cpanelUrl: z.string().url('Invalid cPanel URL').optional().or(z.literal('')),
  username: z.string().optional(),
  password: z.string().optional(),
  createdAt: z.string().datetime().optional(),
  expiresAt: z.string().datetime().optional(),
  notes: z.string().optional(),
  domainIds: z.array(z.string()).optional(),
})

// Settings schemas
export const updateSettingSchema = z.object({
  value: z.string().min(1, 'Setting value is required'),
  type: z.enum(['string', 'number', 'boolean', 'json']).optional(),
  category: z.string().optional(),
})

// VPS schemas
export const createVpsSchema = z.object({
  name: z.string().min(3, 'VPS name must be at least 3 characters'),
  provider: z.string().min(2, 'Provider name must be at least 2 characters'),
  status: z.enum(['ACTIVE', 'SUSPENDED', 'STOPPED', 'EXPIRED', 'CANCELLED']).optional(),
  ipAddress: z.string().regex(/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/, 'Invalid IP address').optional(),
  specs: z.record(z.string(), z.union([z.string(), z.number()])).optional(), // CPU, RAM, Storage, etc.
  sshPort: z.number().int().positive().default(22),
  sshKey: z.string().optional(),
  username: z.string().optional(),
  password: z.string().optional(),
  cpanelUrl: z.string().url('Invalid control panel URL').optional().or(z.literal('')),
  expiresAt: z.string().datetime().optional().or(z.literal('')),
  notes: z.string().optional(),
  domainIds: z.array(z.string()).optional(),
})

export const updateVpsSchema = z.object({
  name: z.string().min(3, 'VPS name must be at least 3 characters').optional(),
  provider: z.string().min(2, 'Provider name must be at least 2 characters').optional(),
  status: z.enum(['ACTIVE', 'SUSPENDED', 'STOPPED', 'EXPIRED', 'CANCELLED']).optional(),
  ipAddress: z.string().regex(/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/, 'Invalid IP address').optional(),
  specs: z.record(z.string(), z.union([z.string(), z.number()])).optional(),
  sshPort: z.number().int().positive().optional(),
  sshKey: z.string().optional(),
  username: z.string().optional(),
  password: z.string().optional().nullable(),
  cpanelUrl: z.string().url('Invalid control panel URL').optional().or(z.literal('')),
  expiresAt: z.string().datetime().optional(),
  notes: z.string().optional(),
  domainIds: z.array(z.string()).optional(),
})

// Website schemas
export const createWebsiteSchema = z.object({
  name: z.string().min(3, 'Website name must be at least 3 characters'),
  url: z.string().url('Invalid URL format').optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'MAINTENANCE', 'SUSPENDED']).default('ACTIVE'),
  cms: z.string().optional(),
  cmsVersion: z.string().optional(),
  phpVersion: z.string().optional(),
  sslStatus: z.enum(['NONE', 'ACTIVE', 'EXPIRED', 'PENDING']).default('NONE'),
  sslExpiry: z.string().datetime().optional(),
  backupStatus: z.string().optional(),
  lastBackup: z.string().datetime().optional(),
  notes: z.string().optional(),
  username: z.string().optional(),
  password: z.string().optional(),
  domainId: z.string().optional(),
  hostingId: z.string().optional().nullable(),
  vpsId: z.string().optional().nullable(),
})

export const updateWebsiteSchema = z.object({
  name: z.string().min(3, 'Website name must be at least 3 characters').optional(),
  url: z.string().url('Invalid URL format').optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'MAINTENANCE', 'SUSPENDED']).optional(),
  cms: z.string().optional(),
  cmsVersion: z.string().optional(),
  phpVersion: z.string().optional(),
  sslStatus: z.enum(['NONE', 'ACTIVE', 'EXPIRED', 'PENDING']).optional(),
  sslExpiry: z.string().datetime().optional(),
  backupStatus: z.string().optional(),
  lastBackup: z.string().datetime().optional(),
  notes: z.string().optional(),
  username: z.string().optional(),
  password: z.string().optional(),
  domainId: z.string().optional(),
  hostingId: z.string().optional().nullable(),
  vpsId: z.string().optional().nullable(),
}) 