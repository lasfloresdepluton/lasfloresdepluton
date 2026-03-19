import { z } from 'zod';

// ── Auth ─────────────────────────────────────────────────────────────────────
export const LoginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
});

export const RegisterSchema = LoginSchema.extend({
  full_name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  phone: z.string().optional(),
});

// ── Profile ───────────────────────────────────────────────────────────────────
export const ProfileUpdateSchema = z.object({
  full_name: z.string().min(2).optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  postal_code: z.string().length(4, 'Código postal inválido (4 dígitos)').optional(),
  city: z.string().optional(),
});

// ── Cart ──────────────────────────────────────────────────────────────────────
export const CartItemSchema = z.object({
  product_id: z.string().uuid(),
  variant_id: z.string().uuid().optional(),
  quantity: z.number().int().positive(),
  selected_fragrances: z.array(z.string().uuid()).optional(), // For packs
});

// ── Checkout ──────────────────────────────────────────────────────────────────
export const ShippingAddressSchema = z.object({
  full_name: z.string().min(2),
  address: z.string().min(5),
  postal_code: z.string().length(4),
  city: z.string().min(2),
  province: z.string().min(2),
  phone: z.string().min(8),
});

export const CheckoutSchema = z.object({
  shipping_address: ShippingAddressSchema,
  shipping_method: z.enum(['correo', 'moto', 'coordinar']),
});

// ── Admin ─────────────────────────────────────────────────────────────────────
export const ProductSchema = z.object({
  name: z.string().min(2),
  slug: z.string().regex(/^[a-z0-9-]+$/, 'Slug inválido (solo minúsculas, números y guiones)'),
  description: z.string().optional(),
  category_id: z.string().uuid().optional(),
  retail_price: z.number().positive(),
  wholesale_price: z.number().positive(),
  wholesale_min_qty: z.number().int().positive().default(1),
  is_pack: z.boolean().default(false),
  pack_slots: z.number().int().min(0).default(0),
});

export const FragranceSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
});

export const OrderStatusUpdateSchema = z.object({
  order_id: z.string().uuid(),
  status: z.enum(['pending', 'producing', 'ready_to_ship', 'shipped', 'delivered', 'cancelled']),
  notes: z.string().optional(),
});

// ── Types inferred from schemas ──────────────────────────────────────────────
export type LoginInput = z.infer<typeof LoginSchema>;
export type RegisterInput = z.infer<typeof RegisterSchema>;
export type ProfileUpdate = z.infer<typeof ProfileUpdateSchema>;
export type CartItem = z.infer<typeof CartItemSchema>;
export type ShippingAddress = z.infer<typeof ShippingAddressSchema>;
export type CheckoutInput = z.infer<typeof CheckoutSchema>;
export type ProductInput = z.infer<typeof ProductSchema>;
export type FragranceInput = z.infer<typeof FragranceSchema>;
export type OrderStatusUpdate = z.infer<typeof OrderStatusUpdateSchema>;
