import { type Category, type Subcategory, type Plan, type Settings, type FAQ } from "@shared/schema";
import { randomUUID, scryptSync, timingSafeEqual } from "crypto";
import mysql from "mysql2/promise";

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

  initializeDatabase(): Promise<void>;
}

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  port: parseInt(process.env.MYSQL_PORT || "3306"),
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export class MySQLStorage implements IStorage {
  private initialized = false;

  private hashPassword(password: string): string {
    const salt = "phoenix-salt";
    return scryptSync(password, salt, 32).toString("hex");
  }

  async initializeDatabase(): Promise<void> {
    if (this.initialized) return;

    const connection = await pool.getConnection();
    try {
      await connection.query(`
        CREATE TABLE IF NOT EXISTS categories (
          id VARCHAR(36) PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          slug VARCHAR(255) NOT NULL
        )
      `);

      await connection.query(`
        CREATE TABLE IF NOT EXISTS subcategories (
          id VARCHAR(36) PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          slug VARCHAR(255) NOT NULL,
          categoryId VARCHAR(36) NOT NULL
        )
      `);

      await connection.query(`
        CREATE TABLE IF NOT EXISTS plans (
          id VARCHAR(36) PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          description TEXT,
          priceUsd VARCHAR(50),
          priceInr VARCHAR(50),
          period VARCHAR(50),
          features JSON,
          popular BOOLEAN DEFAULT FALSE,
          categoryId VARCHAR(36),
          subcategoryId VARCHAR(36)
        )
      `);

      await connection.query(`
        CREATE TABLE IF NOT EXISTS faqs (
          id VARCHAR(36) PRIMARY KEY,
          question TEXT NOT NULL,
          answer TEXT NOT NULL
        )
      `);

      await connection.query(`
        CREATE TABLE IF NOT EXISTS settings (
          id INT PRIMARY KEY DEFAULT 1,
          currency VARCHAR(10) DEFAULT 'usd',
          supportLink VARCHAR(500),
          redirectLink VARCHAR(500),
          instagramLink VARCHAR(500),
          youtubeLink VARCHAR(500),
          email VARCHAR(255),
          documentationLink VARCHAR(500)
        )
      `);

      await connection.query(`
        CREATE TABLE IF NOT EXISTS admin_users (
          id VARCHAR(36) PRIMARY KEY,
          username VARCHAR(255) NOT NULL UNIQUE,
          passwordHash VARCHAR(255) NOT NULL
        )
      `);

      const [settings] = await connection.query("SELECT * FROM settings WHERE id = 1");
      if ((settings as any[]).length === 0) {
        await connection.query(
          "INSERT INTO settings (id, currency, supportLink, redirectLink) VALUES (1, 'usd', '', '')"
        );
      }

      const [admins] = await connection.query("SELECT * FROM admin_users");
      if ((admins as any[]).length === 0) {
        const adminId = randomUUID();
        const passwordHash = this.hashPassword("admin123");
        await connection.query(
          "INSERT INTO admin_users (id, username, passwordHash) VALUES (?, ?, ?)",
          [adminId, "admin", passwordHash]
        );
        console.log("Created default admin user: admin / admin123");
      }

      this.initialized = true;
      console.log("Database initialized successfully");
    } finally {
      connection.release();
    }
  }

  async getCategories(): Promise<Category[]> {
    await this.initializeDatabase();
    const [rows] = await pool.query("SELECT * FROM categories");
    return rows as Category[];
  }

  async getCategory(id: string): Promise<Category | undefined> {
    await this.initializeDatabase();
    const [rows] = await pool.query("SELECT * FROM categories WHERE id = ?", [id]);
    return (rows as Category[])[0];
  }

  async createCategory(name: string, slug: string): Promise<Category> {
    await this.initializeDatabase();
    const id = randomUUID();
    await pool.query("INSERT INTO categories (id, name, slug) VALUES (?, ?, ?)", [id, name, slug]);
    return { id, name, slug };
  }

  async updateCategory(id: string, name: string, slug: string): Promise<Category | undefined> {
    await this.initializeDatabase();
    const [result] = await pool.query(
      "UPDATE categories SET name = ?, slug = ? WHERE id = ?",
      [name, slug, id]
    );
    if ((result as any).affectedRows === 0) return undefined;
    return { id, name, slug };
  }

  async deleteCategory(id: string): Promise<boolean> {
    await this.initializeDatabase();
    const [result] = await pool.query("DELETE FROM categories WHERE id = ?", [id]);
    return (result as any).affectedRows > 0;
  }

  async getSubcategories(): Promise<Subcategory[]> {
    await this.initializeDatabase();
    const [rows] = await pool.query("SELECT * FROM subcategories");
    return rows as Subcategory[];
  }

  async getSubcategoriesByCategory(categoryId: string): Promise<Subcategory[]> {
    await this.initializeDatabase();
    const [rows] = await pool.query("SELECT * FROM subcategories WHERE categoryId = ?", [categoryId]);
    return rows as Subcategory[];
  }

  async createSubcategory(name: string, slug: string, categoryId: string): Promise<Subcategory> {
    await this.initializeDatabase();
    const id = randomUUID();
    await pool.query(
      "INSERT INTO subcategories (id, name, slug, categoryId) VALUES (?, ?, ?, ?)",
      [id, name, slug, categoryId]
    );
    return { id, name, slug, categoryId };
  }

  async updateSubcategory(id: string, name: string, slug: string): Promise<Subcategory | undefined> {
    await this.initializeDatabase();
    const [existing] = await pool.query("SELECT categoryId FROM subcategories WHERE id = ?", [id]);
    if ((existing as any[]).length === 0) return undefined;
    const categoryId = (existing as any[])[0].categoryId;
    await pool.query("UPDATE subcategories SET name = ?, slug = ? WHERE id = ?", [name, slug, id]);
    return { id, name, slug, categoryId };
  }

  async deleteSubcategory(id: string): Promise<boolean> {
    await this.initializeDatabase();
    const [result] = await pool.query("DELETE FROM subcategories WHERE id = ?", [id]);
    return (result as any).affectedRows > 0;
  }

  async getPlans(): Promise<Plan[]> {
    await this.initializeDatabase();
    const [rows] = await pool.query("SELECT * FROM plans");
    return (rows as any[]).map((row) => ({
      ...row,
      features: typeof row.features === "string" ? JSON.parse(row.features) : row.features || [],
      popular: Boolean(row.popular),
    }));
  }

  async getPlansBySubcategory(subcategoryId: string): Promise<Plan[]> {
    await this.initializeDatabase();
    const [rows] = await pool.query("SELECT * FROM plans WHERE subcategoryId = ?", [subcategoryId]);
    return (rows as any[]).map((row) => ({
      ...row,
      features: typeof row.features === "string" ? JSON.parse(row.features) : row.features || [],
      popular: Boolean(row.popular),
    }));
  }

  async createPlan(plan: Omit<Plan, "id">): Promise<Plan> {
    await this.initializeDatabase();
    const id = randomUUID();
    await pool.query(
      `INSERT INTO plans (id, name, description, priceUsd, priceInr, period, features, popular, categoryId, subcategoryId) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, plan.name, plan.description, plan.priceUsd, plan.priceInr, plan.period, 
       JSON.stringify(plan.features), plan.popular || false, plan.categoryId, plan.subcategoryId]
    );
    return { ...plan, id };
  }

  async updatePlan(id: string, updates: Partial<Plan>): Promise<Plan | undefined> {
    await this.initializeDatabase();
    const [existing] = await pool.query("SELECT * FROM plans WHERE id = ?", [id]);
    if ((existing as any[]).length === 0) return undefined;
    
    const current = (existing as any[])[0];
    const updated = {
      ...current,
      ...updates,
      features: updates.features ? JSON.stringify(updates.features) : current.features,
    };
    
    await pool.query(
      `UPDATE plans SET name = ?, description = ?, priceUsd = ?, priceInr = ?, period = ?, 
       features = ?, popular = ?, categoryId = ?, subcategoryId = ? WHERE id = ?`,
      [updated.name, updated.description, updated.priceUsd, updated.priceInr, updated.period,
       updated.features, updated.popular, updated.categoryId, updated.subcategoryId, id]
    );
    
    return {
      ...updated,
      features: typeof updated.features === "string" ? JSON.parse(updated.features) : updated.features,
      popular: Boolean(updated.popular),
    };
  }

  async deletePlan(id: string): Promise<boolean> {
    await this.initializeDatabase();
    const [result] = await pool.query("DELETE FROM plans WHERE id = ?", [id]);
    return (result as any).affectedRows > 0;
  }

  async getFAQs(): Promise<FAQ[]> {
    await this.initializeDatabase();
    const [rows] = await pool.query("SELECT * FROM faqs");
    return rows as FAQ[];
  }

  async createFAQ(question: string, answer: string): Promise<FAQ> {
    await this.initializeDatabase();
    const id = randomUUID();
    await pool.query("INSERT INTO faqs (id, question, answer) VALUES (?, ?, ?)", [id, question, answer]);
    return { id, question, answer };
  }

  async updateFAQ(id: string, question: string, answer: string): Promise<FAQ | undefined> {
    await this.initializeDatabase();
    const [result] = await pool.query(
      "UPDATE faqs SET question = ?, answer = ? WHERE id = ?",
      [question, answer, id]
    );
    if ((result as any).affectedRows === 0) return undefined;
    return { id, question, answer };
  }

  async deleteFAQ(id: string): Promise<boolean> {
    await this.initializeDatabase();
    const [result] = await pool.query("DELETE FROM faqs WHERE id = ?", [id]);
    return (result as any).affectedRows > 0;
  }

  async getSettings(): Promise<Settings> {
    await this.initializeDatabase();
    const [rows] = await pool.query("SELECT * FROM settings WHERE id = 1");
    const row = (rows as any[])[0] || {};
    return {
      currency: row.currency || "usd",
      supportLink: row.supportLink || "",
      redirectLink: row.redirectLink || "",
      instagramLink: row.instagramLink || "",
      youtubeLink: row.youtubeLink || "",
      email: row.email || "",
      documentationLink: row.documentationLink || "",
    };
  }

  async updateSettings(settings: Settings): Promise<Settings> {
    await this.initializeDatabase();
    await pool.query(
      `UPDATE settings SET currency = ?, supportLink = ?, redirectLink = ?, 
       instagramLink = ?, youtubeLink = ?, email = ?, documentationLink = ? WHERE id = 1`,
      [settings.currency, settings.supportLink, settings.redirectLink,
       settings.instagramLink || "", settings.youtubeLink || "", 
       settings.email || "", settings.documentationLink || ""]
    );
    return settings;
  }

  async getAdminUsers(): Promise<any[]> {
    await this.initializeDatabase();
    const [rows] = await pool.query("SELECT id, username FROM admin_users");
    return rows as any[];
  }

  async createAdminUser(username: string, passwordHash: string): Promise<any> {
    await this.initializeDatabase();
    const id = randomUUID();
    await pool.query(
      "INSERT INTO admin_users (id, username, passwordHash) VALUES (?, ?, ?)",
      [id, username, passwordHash]
    );
    return { id, username };
  }

  async updateAdminUser(id: string, passwordHash: string): Promise<any | undefined> {
    await this.initializeDatabase();
    const [result] = await pool.query(
      "UPDATE admin_users SET passwordHash = ? WHERE id = ?",
      [passwordHash, id]
    );
    if ((result as any).affectedRows === 0) return undefined;
    const [rows] = await pool.query("SELECT id, username FROM admin_users WHERE id = ?", [id]);
    return (rows as any[])[0];
  }

  async deleteAdminUser(id: string): Promise<boolean> {
    await this.initializeDatabase();
    const [result] = await pool.query("DELETE FROM admin_users WHERE id = ?", [id]);
    return (result as any).affectedRows > 0;
  }

  async verifyAdminUser(username: string, password: string): Promise<boolean> {
    await this.initializeDatabase();
    const [rows] = await pool.query(
      "SELECT passwordHash FROM admin_users WHERE username = ?",
      [username]
    );
    if ((rows as any[]).length === 0) return false;
    
    const storedHash = (rows as any[])[0].passwordHash;
    const passwordHash = this.hashPassword(password);
    
    try {
      const userBuffer = Buffer.from(storedHash, "hex");
      const passBuffer = Buffer.from(passwordHash, "hex");
      return timingSafeEqual(userBuffer, passBuffer);
    } catch {
      return false;
    }
  }
}

export const storage = new MySQLStorage();
