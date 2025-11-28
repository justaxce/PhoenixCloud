import { type Category, type Subcategory, type Plan, type Settings } from "@shared/schema";
import { randomUUID, scryptSync, timingSafeEqual } from "crypto";

export interface IStorage {
  // Categories
  getCategories(): Promise<Category[]>;
  getCategory(id: string): Promise<Category | undefined>;
  createCategory(name: string, slug: string): Promise<Category>;
  updateCategory(id: string, name: string, slug: string): Promise<Category | undefined>;
  deleteCategory(id: string): Promise<boolean>;

  // Subcategories
  getSubcategories(): Promise<Subcategory[]>;
  getSubcategoriesByCategory(categoryId: string): Promise<Subcategory[]>;
  createSubcategory(name: string, slug: string, categoryId: string): Promise<Subcategory>;
  updateSubcategory(id: string, name: string, slug: string): Promise<Subcategory | undefined>;
  deleteSubcategory(id: string): Promise<boolean>;

  // Plans
  getPlans(): Promise<Plan[]>;
  getPlansBySubcategory(subcategoryId: string): Promise<Plan[]>;
  createPlan(plan: Omit<Plan, 'id'>): Promise<Plan>;
  updatePlan(id: string, plan: Partial<Plan>): Promise<Plan | undefined>;
  deletePlan(id: string): Promise<boolean>;

  // Settings
  getSettings(): Promise<Settings>;
  updateSettings(settings: Settings): Promise<Settings>;

  // Admin Users
  getAdminUsers(): Promise<any[]>;
  createAdminUser(username: string, passwordHash: string): Promise<any>;
  updateAdminUser(id: string, passwordHash: string): Promise<any | undefined>;
  deleteAdminUser(id: string): Promise<boolean>;
  verifyAdminUser(username: string, password: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private categories: Map<string, Category>;
  private subcategories: Map<string, Subcategory>;
  private plans: Map<string, Plan>;
  private settings: Settings;
  private adminUsers: Map<string, any>;

  constructor() {
    this.categories = new Map();
    this.subcategories = new Map();
    this.plans = new Map();
    this.adminUsers = new Map();
    this.settings = { discordLink: "https://discord.gg/EX6Dydyar5" };

    // Initialize with sample data
    this.initializeSampleData();
  }

  private hashPassword(password: string): string {
    const salt = "phoenix-salt";
    return scryptSync(password, salt, 32).toString("hex");
  }

  private initializeSampleData() {
    const vpsCategory = { id: "1", name: "VPS Hosting", slug: "vps" };
    const dedicatedCategory = { id: "2", name: "Dedicated Servers", slug: "dedicated" };
    this.categories.set(vpsCategory.id, vpsCategory);
    this.categories.set(dedicatedCategory.id, dedicatedCategory);

    const linuxSub = { id: "1a", name: "Linux VPS", slug: "linux", categoryId: "1" };
    const windowsSub = { id: "1b", name: "Windows VPS", slug: "windows", categoryId: "1" };
    this.subcategories.set(linuxSub.id, linuxSub);
    this.subcategories.set(windowsSub.id, windowsSub);

    const starterPlan: Plan = {
      id: "plan-1",
      name: "Starter VPS",
      description: "Perfect for small projects",
      price: "$9.99",
      period: "month",
      features: ["2 vCPU Cores", "4 GB RAM", "50 GB NVMe SSD", "1 TB Bandwidth", "DDoS Protection"],
      popular: true,
      categoryId: "1",
      subcategoryId: "1a",
    };
    this.plans.set(starterPlan.id, starterPlan);

    // Initialize with default admin user
    const adminId = randomUUID();
    this.adminUsers.set(adminId, {
      id: adminId,
      username: "admin",
      passwordHash: this.hashPassword("admin123"),
    });
  }

  // Categories
  async getCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }

  async getCategory(id: string): Promise<Category | undefined> {
    return this.categories.get(id);
  }

  async createCategory(name: string, slug: string): Promise<Category> {
    const id = randomUUID();
    const category: Category = { id, name, slug };
    this.categories.set(id, category);
    return category;
  }

  async updateCategory(id: string, name: string, slug: string): Promise<Category | undefined> {
    const category = this.categories.get(id);
    if (!category) return undefined;
    const updated = { ...category, name, slug };
    this.categories.set(id, updated);
    return updated;
  }

  async deleteCategory(id: string): Promise<boolean> {
    return this.categories.delete(id);
  }

  // Subcategories
  async getSubcategories(): Promise<Subcategory[]> {
    return Array.from(this.subcategories.values());
  }

  async getSubcategoriesByCategory(categoryId: string): Promise<Subcategory[]> {
    return Array.from(this.subcategories.values()).filter(
      (sub) => sub.categoryId === categoryId
    );
  }

  async createSubcategory(name: string, slug: string, categoryId: string): Promise<Subcategory> {
    const id = randomUUID();
    const subcategory: Subcategory = { id, name, slug, categoryId };
    this.subcategories.set(id, subcategory);
    return subcategory;
  }

  async updateSubcategory(id: string, name: string, slug: string): Promise<Subcategory | undefined> {
    const subcategory = this.subcategories.get(id);
    if (!subcategory) return undefined;
    const updated = { ...subcategory, name, slug };
    this.subcategories.set(id, updated);
    return updated;
  }

  async deleteSubcategory(id: string): Promise<boolean> {
    return this.subcategories.delete(id);
  }

  // Plans
  async getPlans(): Promise<Plan[]> {
    return Array.from(this.plans.values());
  }

  async getPlansBySubcategory(subcategoryId: string): Promise<Plan[]> {
    return Array.from(this.plans.values()).filter(
      (plan) => plan.subcategoryId === subcategoryId
    );
  }

  async createPlan(plan: Omit<Plan, 'id'>): Promise<Plan> {
    const id = randomUUID();
    const newPlan: Plan = { ...plan, id };
    this.plans.set(id, newPlan);
    return newPlan;
  }

  async updatePlan(id: string, updates: Partial<Plan>): Promise<Plan | undefined> {
    const plan = this.plans.get(id);
    if (!plan) return undefined;
    const updated = { ...plan, ...updates };
    this.plans.set(id, updated);
    return updated;
  }

  async deletePlan(id: string): Promise<boolean> {
    return this.plans.delete(id);
  }

  // Settings
  async getSettings(): Promise<Settings> {
    return this.settings;
  }

  async updateSettings(settings: Settings): Promise<Settings> {
    this.settings = settings;
    return settings;
  }

  // Admin Users
  async getAdminUsers(): Promise<any[]> {
    return Array.from(this.adminUsers.values()).map((user) => ({
      id: user.id,
      username: user.username,
    }));
  }

  async createAdminUser(username: string, passwordHash: string): Promise<any> {
    const id = randomUUID();
    const user = { id, username, passwordHash };
    this.adminUsers.set(id, user);
    return { id, username };
  }

  async updateAdminUser(id: string, passwordHash: string): Promise<any | undefined> {
    const user = this.adminUsers.get(id);
    if (!user) return undefined;
    const updated = { ...user, passwordHash };
    this.adminUsers.set(id, updated);
    return { id: updated.id, username: updated.username };
  }

  async deleteAdminUser(id: string): Promise<boolean> {
    return this.adminUsers.delete(id);
  }

  async verifyAdminUser(username: string, password: string): Promise<boolean> {
    const user = Array.from(this.adminUsers.values()).find((u) => u.username === username);
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

export const storage = new MemStorage();
