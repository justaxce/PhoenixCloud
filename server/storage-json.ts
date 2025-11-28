import { type Category, type Subcategory, type Plan, type Settings, type FAQ } from "@shared/schema";
import { randomUUID, scryptSync, timingSafeEqual } from "crypto";
import * as fs from "fs";
import * as path from "path";

const DATA_FILE = path.join(process.cwd(), "data.json");

interface StorageData {
  categories: Category[];
  subcategories: Subcategory[];
  plans: Plan[];
  faqs: FAQ[];
  settings: Settings;
  adminUsers: Array<{ id: string; username: string; passwordHash: string }>;
}

export interface IStorage {
  getCategories(): Promise<Category[]>;
  getCategory(id: string): Promise<Category | undefined>;
  createCategory(name: string, slug: string): Promise<Category>;
  updateCategory(id: string, name: string, slug: string): Promise<Category | undefined>;
  deleteCategory(id: string): Promise<boolean>;

  getSubcategories(): Promise<Subcategory[]>;
  getSubcategoriesByCategory(categoryId: string): Promise<Subcategory[]>;
  createSubcategory(name: string, slug: string, categoryId: string): Promise<Subcategory>;
  updateSubcategory(id: string, name: string, slug: string): Promise<Subcategory | undefined>;
  deleteSubcategory(id: string): Promise<boolean>;

  getPlans(): Promise<Plan[]>;
  getPlansBySubcategory(subcategoryId: string): Promise<Plan[]>;
  createPlan(plan: Omit<Plan, "id">): Promise<Plan>;
  updatePlan(id: string, plan: Partial<Plan>): Promise<Plan | undefined>;
  deletePlan(id: string): Promise<boolean>;

  getFAQs(): Promise<FAQ[]>;
  createFAQ(question: string, answer: string): Promise<FAQ>;
  updateFAQ(id: string, question: string, answer: string): Promise<FAQ | undefined>;
  deleteFAQ(id: string): Promise<boolean>;

  getSettings(): Promise<Settings>;
  updateSettings(settings: Settings): Promise<Settings>;

  getAdminUsers(): Promise<any[]>;
  createAdminUser(username: string, passwordHash: string): Promise<any>;
  updateAdminUser(id: string, passwordHash: string): Promise<any | undefined>;
  deleteAdminUser(id: string): Promise<boolean>;
  verifyAdminUser(username: string, password: string): Promise<boolean>;
}

export class JsonStorage implements IStorage {
  private data: StorageData;

  constructor() {
    this.data = this.loadData();
  }

  private loadData(): StorageData {
    try {
      if (fs.existsSync(DATA_FILE)) {
        const content = fs.readFileSync(DATA_FILE, "utf-8");
        console.log("Loaded data from", DATA_FILE);
        const data = JSON.parse(content);
        // Ensure faqs array exists (migration for old data files)
        if (!data.faqs) {
          data.faqs = [];
          this.saveDataSync(data);
        }
        return data;
      }
    } catch (error) {
      console.error("Error loading data file:", error);
    }

    console.log("Creating new data file at", DATA_FILE);
    const defaultData = this.getDefaultData();
    this.saveDataSync(defaultData);
    return defaultData;
  }

  private getDefaultData(): StorageData {
    const salt = "phoenix-salt";
    const passwordHash = scryptSync("admin123", salt, 32).toString("hex");
    
    return {
      categories: [],
      subcategories: [],
      plans: [],
      faqs: [],
      settings: {
        currency: "usd",
        supportLink: "https://discord.gg/EX6Dydyar5",
        redirectLink: "https://discord.gg/EX6Dydyar5",
      },
      adminUsers: [
        {
          id: randomUUID(),
          username: "admin",
          passwordHash: passwordHash,
        },
      ],
    };
  }
  
  private saveDataSync(data: StorageData): void {
    try {
      fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
      console.log("Data saved to", DATA_FILE);
    } catch (error) {
      console.error("Error saving data file:", error);
    }
  }

  private saveData(): void {
    try {
      fs.writeFileSync(DATA_FILE, JSON.stringify(this.data, null, 2), "utf-8");
    } catch (error) {
      console.error("Error saving data file:", error);
    }
  }

  private hashPassword(password: string): string {
    const salt = "phoenix-salt";
    return scryptSync(password, salt, 32).toString("hex");
  }

  // Categories
  async getCategories(): Promise<Category[]> {
    return this.data.categories;
  }

  async getCategory(id: string): Promise<Category | undefined> {
    return this.data.categories.find((c) => c.id === id);
  }

  async createCategory(name: string, slug: string): Promise<Category> {
    const category: Category = { id: randomUUID(), name, slug };
    this.data.categories.push(category);
    this.saveData();
    return category;
  }

  async updateCategory(id: string, name: string, slug: string): Promise<Category | undefined> {
    const category = this.data.categories.find((c) => c.id === id);
    if (!category) return undefined;
    category.name = name;
    category.slug = slug;
    this.saveData();
    return category;
  }

  async deleteCategory(id: string): Promise<boolean> {
    const index = this.data.categories.findIndex((c) => c.id === id);
    if (index === -1) return false;
    this.data.categories.splice(index, 1);
    this.saveData();
    return true;
  }

  // Subcategories
  async getSubcategories(): Promise<Subcategory[]> {
    return this.data.subcategories;
  }

  async getSubcategoriesByCategory(categoryId: string): Promise<Subcategory[]> {
    return this.data.subcategories.filter((s) => s.categoryId === categoryId);
  }

  async createSubcategory(name: string, slug: string, categoryId: string): Promise<Subcategory> {
    const subcategory: Subcategory = { id: randomUUID(), name, slug, categoryId };
    this.data.subcategories.push(subcategory);
    this.saveData();
    return subcategory;
  }

  async updateSubcategory(id: string, name: string, slug: string): Promise<Subcategory | undefined> {
    const subcategory = this.data.subcategories.find((s) => s.id === id);
    if (!subcategory) return undefined;
    subcategory.name = name;
    subcategory.slug = slug;
    this.saveData();
    return subcategory;
  }

  async deleteSubcategory(id: string): Promise<boolean> {
    const index = this.data.subcategories.findIndex((s) => s.id === id);
    if (index === -1) return false;
    this.data.subcategories.splice(index, 1);
    this.saveData();
    return true;
  }

  // Plans
  async getPlans(): Promise<Plan[]> {
    return this.data.plans;
  }

  async getPlansBySubcategory(subcategoryId: string): Promise<Plan[]> {
    return this.data.plans.filter((p) => p.subcategoryId === subcategoryId);
  }

  async createPlan(plan: Omit<Plan, "id">): Promise<Plan> {
    const newPlan: Plan = { ...plan, id: randomUUID() };
    this.data.plans.push(newPlan);
    this.saveData();
    return newPlan;
  }

  async updatePlan(id: string, updates: Partial<Plan>): Promise<Plan | undefined> {
    const plan = this.data.plans.find((p) => p.id === id);
    if (!plan) return undefined;
    Object.assign(plan, updates);
    this.saveData();
    return plan;
  }

  async deletePlan(id: string): Promise<boolean> {
    const index = this.data.plans.findIndex((p) => p.id === id);
    if (index === -1) return false;
    this.data.plans.splice(index, 1);
    this.saveData();
    return true;
  }

  // FAQs
  async getFAQs(): Promise<FAQ[]> {
    return this.data.faqs || [];
  }

  async createFAQ(question: string, answer: string): Promise<FAQ> {
    const faq: FAQ = { id: randomUUID(), question, answer };
    this.data.faqs.push(faq);
    this.saveData();
    return faq;
  }

  async updateFAQ(id: string, question: string, answer: string): Promise<FAQ | undefined> {
    const faq = this.data.faqs.find((f) => f.id === id);
    if (!faq) return undefined;
    faq.question = question;
    faq.answer = answer;
    this.saveData();
    return faq;
  }

  async deleteFAQ(id: string): Promise<boolean> {
    const index = this.data.faqs.findIndex((f) => f.id === id);
    if (index === -1) return false;
    this.data.faqs.splice(index, 1);
    this.saveData();
    return true;
  }

  // Settings
  async getSettings(): Promise<Settings> {
    // Ensure all fields have defaults
    return {
      currency: this.data.settings.currency || "usd",
      supportLink: this.data.settings.supportLink || "",
      redirectLink: this.data.settings.redirectLink || "",
      instagramLink: this.data.settings.instagramLink || "",
      youtubeLink: this.data.settings.youtubeLink || "",
      email: this.data.settings.email || "",
      documentationLink: this.data.settings.documentationLink || "",
    };
  }

  async updateSettings(settings: Settings): Promise<Settings> {
    this.data.settings = settings;
    this.saveData();
    return settings;
  }

  // Admin Users
  async getAdminUsers(): Promise<any[]> {
    return this.data.adminUsers.map((user) => ({
      id: user.id,
      username: user.username,
    }));
  }

  async createAdminUser(username: string, passwordHash: string): Promise<any> {
    const user = {
      id: randomUUID(),
      username,
      passwordHash,
    };
    this.data.adminUsers.push(user);
    this.saveData();
    return { id: user.id, username: user.username };
  }

  async updateAdminUser(id: string, passwordHash: string): Promise<any | undefined> {
    const user = this.data.adminUsers.find((u) => u.id === id);
    if (!user) return undefined;
    user.passwordHash = passwordHash;
    this.saveData();
    return { id: user.id, username: user.username };
  }

  async deleteAdminUser(id: string): Promise<boolean> {
    const index = this.data.adminUsers.findIndex((u) => u.id === id);
    if (index === -1) return false;
    this.data.adminUsers.splice(index, 1);
    this.saveData();
    return true;
  }

  async verifyAdminUser(username: string, password: string): Promise<boolean> {
    const user = this.data.adminUsers.find((u) => u.username === username);
    if (!user) return false;

    const passwordHash = this.hashPassword(password);
    try {
      const userBuffer = Buffer.from(user.passwordHash, 'hex');
      const passBuffer = Buffer.from(passwordHash, 'hex');
      return timingSafeEqual(userBuffer, passBuffer);
    } catch {
      return false;
    }
  }
}

export const storage = new JsonStorage();
