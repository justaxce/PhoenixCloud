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
  priceUsd: string;
  priceInr: string;
  period: string;
  features: string[];
  popular?: boolean;
  categoryId: string;
  subcategoryId: string;
}

export interface Settings {
  currency: "usd" | "inr";
  supportLink: string;
  redirectLink: string;
  instagramLink?: string;
  youtubeLink?: string;
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
  priceUsd: z.string().min(1),
  priceInr: z.string().min(1),
  period: z.string().min(1),
  features: z.array(z.string()),
  popular: z.boolean().optional(),
  categoryId: z.string().min(1),
  subcategoryId: z.string().min(1),
});

export const settingsSchema = z.object({
  currency: z.enum(["usd", "inr"]),
  supportLink: z.string().url(),
  redirectLink: z.string().url(),
  instagramLink: z.string().url().optional(),
  youtubeLink: z.string().url().optional(),
});

export type InsertCategory = z.infer<typeof categorySchema>;
export type InsertSubcategory = z.infer<typeof subcategorySchema>;
export type InsertPlan = z.infer<typeof planSchema>;
