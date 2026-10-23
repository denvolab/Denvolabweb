import { z } from "zod";
export const productSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]{1,100}$/),
  name: z.string().min(1).max(180),
  price: z.number().int().nonnegative().max(1000000),
  category: z.enum(["womens", "mens", "kids", "accessories", "gifting"]),
  material: z.enum(["Cotton", "Satin", "Jersey", "Linen blend"]),
  colour: z.string().max(40),
  image: z.string().regex(/^[a-z0-9-]+$/),
  gallery: z.array(z.string().regex(/^[a-z0-9-]+$/)).max(8),
  sizes: z.array(z.string().min(1).max(12)).min(1).max(20),
  stock: z.number().int().min(0).max(99),
  isNew: z.boolean(),
  description: z.string().max(3000),
});
export type Product = z.infer<typeof productSchema>;
export const lineSchema = z.object({
  productId: z.string().regex(/^[a-z0-9-]{1,100}$/),
  size: z.string().min(1).max(12),
  quantity: z.number().int().min(1).max(99),
});
export type CartLine = z.infer<typeof lineSchema>;
export const cartSchema = z.array(lineSchema).max(50);
export const emailSchema = z.string().trim().email().max(254);
export const addressSchema = z.object({
  email: emailSchema,
  firstName: z.string().trim().min(1).max(80),
  lastName: z.string().trim().min(1).max(80),
  address: z.string().trim().min(3).max(160),
  city: z.string().trim().min(2).max(80),
  postcode: z.string().trim().min(3).max(16),
  country: z.enum(["GB", "BD", "US"]),
  consent: z.literal(true),
});
export type Address = z.infer<typeof addressSchema>;
export const contactSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: emailSchema,
  subject: z.string().trim().min(3).max(160),
  message: z.string().trim().min(10).max(3000),
});
