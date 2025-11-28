import { z } from "zod";

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface Subcategory {
  id: string;
  name: string;
  slug: string;
  categoryId: string;
}

export interface Plan {
  id: string;
  name: string;
  description: string;
  price: string;
  period: string;
  features: string[];
  popular?: boolean;
  categoryId: string;
  subcategoryId: string;
}

export interface Settings {
  discordLink: string;
}

export interface AdminUser {
  id: string;
  username: string;
  passwordHash: string;
}

export const categorySchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
});

export const subcategorySchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  categoryId: z.string().min(1),
});

export const planSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  price: z.string().min(1),
  period: z.string().min(1),
  features: z.array(z.string()),
  popular: z.boolean().optional(),
  categoryId: z.string().min(1),
  subcategoryId: z.string().min(1),
});

export const settingsSchema = z.object({
  discordLink: z.string().url(),
});

export type InsertCategory = z.infer<typeof categorySchema>;
export type InsertSubcategory = z.infer<typeof subcategorySchema>;
export type InsertPlan = z.infer<typeof planSchema>;
