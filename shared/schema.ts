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

export interface FAQ {
  id: string;
  question: string;
  answer: string;
}

export interface Settings {
  currency: "usd" | "inr";
  supportLink: string;
  redirectLink: string;
  instagramLink?: string;
  youtubeLink?: string;
  email?: string;
  documentationLink?: string;
  heroTitleLine1?: string;
  heroTitleLine2?: string;
  heroDescription?: string;
  stat1Value?: string;
  stat1Label?: string;
  stat2Value?: string;
  stat2Label?: string;
  stat3Value?: string;
  stat3Label?: string;
  featuresSectionTitle?: string;
  featuresSectionDescription?: string;
  feature1Title?: string;
  feature1Description?: string;
  feature2Title?: string;
  feature2Description?: string;
  feature3Title?: string;
  feature3Description?: string;
  feature4Title?: string;
  feature4Description?: string;
  feature5Title?: string;
  feature5Description?: string;
  feature6Title?: string;
  feature6Description?: string;
  ctaTitle?: string;
  ctaDescription?: string;
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

export const faqSchema = z.object({
  question: z.string().min(1),
  answer: z.string().min(1),
});

export const settingsSchema = z.object({
  currency: z.enum(["usd", "inr"]),
  supportLink: z.string().url(),
  redirectLink: z.string().url(),
  instagramLink: z.string().url().optional(),
  youtubeLink: z.string().url().optional(),
  email: z.string().email().optional(),
  documentationLink: z.string().url().optional(),
});

export type InsertCategory = z.infer<typeof categorySchema>;
export type InsertSubcategory = z.infer<typeof subcategorySchema>;
export type InsertPlan = z.infer<typeof planSchema>;
export type InsertFAQ = z.infer<typeof faqSchema>;
