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
  order: number;
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
  order: number;
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
  backgroundImageLight?: string;
  backgroundImageDark?: string;
}

export interface AdminUser {
  id: string;
  username: string;
  passwordHash: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  description: string;
  imageUrl: string;
  order: number;
}

export interface AboutPageContent {
  heroTitle: string;
  heroSubtitle: string;
  heroImageUrl: string;
  companyName: string;
  companyDescription: string;
  companyAddress: string;
  supportEmail: string;
  storyTitle: string;
  storyContent: string;
  yearsExperience: string;
  storyImage1Url: string;
  storyImage2Url: string;
  visionTitle: string;
  visionContent: string;
  missionTitle: string;
  missionContent: string;
  teamSectionTitle: string;
  teamSectionSubtitle: string;
  stat1Value: string;
  stat1Label: string;
  stat2Value: string;
  stat2Label: string;
  stat3Value: string;
  stat3Label: string;
  stat4Value: string;
  stat4Label: string;
}

export const categorySchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
});

export const subcategorySchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  categoryId: z.string().min(1),
  order: z.number().optional(),
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
  order: z.number().optional(),
});

export const faqSchema = z.object({
  question: z.string().min(1),
  answer: z.string().min(1),
});

export const settingsSchema = z.object({
  currency: z.enum(["usd", "inr"]).optional(),
  supportLink: z.string().optional(),
  redirectLink: z.string().optional(),
  instagramLink: z.string().optional(),
  youtubeLink: z.string().optional(),
  email: z.string().optional(),
  documentationLink: z.string().optional(),
  heroTitleLine1: z.string().optional(),
  heroTitleLine2: z.string().optional(),
  heroDescription: z.string().optional(),
  stat1Value: z.string().optional(),
  stat1Label: z.string().optional(),
  stat2Value: z.string().optional(),
  stat2Label: z.string().optional(),
  stat3Value: z.string().optional(),
  stat3Label: z.string().optional(),
  featuresSectionTitle: z.string().optional(),
  featuresSectionDescription: z.string().optional(),
  feature1Title: z.string().optional(),
  feature1Description: z.string().optional(),
  feature2Title: z.string().optional(),
  feature2Description: z.string().optional(),
  feature3Title: z.string().optional(),
  feature3Description: z.string().optional(),
  feature4Title: z.string().optional(),
  feature4Description: z.string().optional(),
  feature5Title: z.string().optional(),
  feature5Description: z.string().optional(),
  feature6Title: z.string().optional(),
  feature6Description: z.string().optional(),
  ctaTitle: z.string().optional(),
  ctaDescription: z.string().optional(),
  backgroundImageLight: z.string().optional(),
  backgroundImageDark: z.string().optional(),
});

export const teamMemberSchema = z.object({
  name: z.string().min(1),
  role: z.string().min(1),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
  order: z.number().optional(),
});

export const aboutPageSchema = z.object({
  heroTitle: z.string().optional(),
  heroSubtitle: z.string().optional(),
  heroImageUrl: z.string().optional(),
  companyName: z.string().optional(),
  companyDescription: z.string().optional(),
  companyAddress: z.string().optional(),
  supportEmail: z.string().optional(),
  storyTitle: z.string().optional(),
  storyContent: z.string().optional(),
  yearsExperience: z.string().optional(),
  visionTitle: z.string().optional(),
  visionContent: z.string().optional(),
  missionTitle: z.string().optional(),
  missionContent: z.string().optional(),
  teamSectionTitle: z.string().optional(),
  teamSectionSubtitle: z.string().optional(),
  stat1Value: z.string().optional(),
  stat1Label: z.string().optional(),
  stat2Value: z.string().optional(),
  stat2Label: z.string().optional(),
  stat3Value: z.string().optional(),
  stat3Label: z.string().optional(),
  stat4Value: z.string().optional(),
  stat4Label: z.string().optional(),
});

export type InsertCategory = z.infer<typeof categorySchema>;
export type InsertSubcategory = z.infer<typeof subcategorySchema>;
export type InsertPlan = z.infer<typeof planSchema>;
export type InsertFAQ = z.infer<typeof faqSchema>;
export type InsertTeamMember = z.infer<typeof teamMemberSchema>;
export type InsertAboutPage = z.infer<typeof aboutPageSchema>;
