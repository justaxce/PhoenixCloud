import { type Category, type Subcategory, type Plan, type Settings } from "@shared/schema";
import { randomUUID, scryptSync, timingSafeEqual } from "crypto";
import * as fs from "fs";
import * as path from "path";

const DATA_FILE = path.join(process.cwd(), "data.json");

interface StorageData {
  categories: Category[];
  subcategories: Subcategory[];
  plans: Plan[];
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
        return JSON.parse(content);
      }
    } catch (error) {
      console.error("Error loading data file:", error);
    }

    return this.getDefaultData();
  }

  private getDefaultData(): StorageData {
    return {
      categories: [
        { id: "1", name: "VPS Hosting", slug: "vps" },
        { id: "2", name: "Dedicated Servers", slug: "dedicated" },
      ],
      subcategories: [
        { id: "1a", name: "Linux VPS", slug: "linux", categoryId: "1" },
        { id: "1b", name: "Windows VPS", slug: "windows", categoryId: "1" },
      ],
      plans: [
        {
          id: "plan-1",
          name: "Starter VPS",
          description: "Perfect for small projects",
          priceUsd: "9.99",
          priceInr: "849",
          period: "month",
          features: ["2 vCPU Cores", "4 GB RAM", "50 GB NVMe SSD", "1 TB Bandwidth", "DDoS Protection"],
          popular: true,
          categoryId: "1",
          subcategoryId: "1a",
        },
      ],
      settings: {
        currency: "usd",
        supportLink: "https://discord.gg/EX6Dydyar5",
        redirectLink: "https://discord.gg/EX6Dydyar5",
      },
      adminUsers: [
        {
          id: randomUUID(),
          username: "admin",
          passwordHash: this.hashPassword("admin123"),
        },
      ],
    };
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

  // Settings
  async getSettings(): Promise<Settings> {
    return this.data.settings;
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
      timingSafeEqual(Buffer.from(user.passwordHash), Buffer.from(passwordHash));
      return true;
    } catch {
      return false;
    }
  }
}

export const storage = new JsonStorage();
