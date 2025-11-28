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
  queueLimit: 20,
  enableKeepAlive: true,
  decimalNumbers: true,
});

pool.on("error", (err: any) => {
  console.error("MySQL Pool error:", err.message);
});

pool.on("connection", (connection) => {
  connection.on("error", (err: any) => {
    console.error("MySQL Connection error:", err.message);
  });
});

export class MySQLStorage implements IStorage {
  private initialized = false;

  private hashPassword(password: string): string {
    const salt = "phoenix-salt";
    return scryptSync(password, salt, 32).toString("hex");
  }

  async initializeDatabase(): Promise<void> {
    if (this.initialized) return;

    let connection: any;
    try {
      connection = await Promise.race([
        pool.getConnection(),
        new Promise<any>((_, reject) => setTimeout(() => reject(new Error("Connection timeout")), 15000))
      ]);
    } catch (error: any) {
      console.warn("Database initialization delayed, will retry:", error.message);
      return;
    }
    
    try {
      await connection.query(`
        CREATE TABLE IF NOT EXISTS categories (
          id VARCHAR(36) PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          slug VARCHAR(255) NOT NULL,
          UNIQUE KEY unique_slug (slug)
        )
      `);

      await connection.query(`
        CREATE TABLE IF NOT EXISTS subcategories (
          id VARCHAR(36) PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          slug VARCHAR(255) NOT NULL,
          categoryId VARCHAR(36) NOT NULL,
          UNIQUE KEY unique_slug (slug),
          INDEX idx_category (categoryId),
          FOREIGN KEY (categoryId) REFERENCES categories(id) ON DELETE CASCADE
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
          subcategoryId VARCHAR(36),
          INDEX idx_category (categoryId),
          INDEX idx_subcategory (subcategoryId),
          FOREIGN KEY (categoryId) REFERENCES categories(id) ON DELETE SET NULL,
          FOREIGN KEY (subcategoryId) REFERENCES subcategories(id) ON DELETE SET NULL
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
          documentationLink VARCHAR(500),
          heroTitleLine1 VARCHAR(255) DEFAULT 'Cloud Hosting That',
          heroTitleLine2 VARCHAR(255) DEFAULT 'Rises Above',
          heroDescription TEXT,
          stat1Value VARCHAR(50) DEFAULT '99.9%',
          stat1Label VARCHAR(100) DEFAULT 'Uptime SLA',
          stat2Value VARCHAR(50) DEFAULT '50+',
          stat2Label VARCHAR(100) DEFAULT 'Global Locations',
          stat3Value VARCHAR(50) DEFAULT '24/7',
          stat3Label VARCHAR(100) DEFAULT 'Expert Support',
          featuresSectionTitle VARCHAR(255) DEFAULT 'Why Choose Phoenix Cloud?',
          featuresSectionDescription TEXT,
          feature1Title VARCHAR(255) DEFAULT 'Blazing Fast',
          feature1Description TEXT,
          feature2Title VARCHAR(255) DEFAULT 'DDoS Protection',
          feature2Description TEXT,
          feature3Title VARCHAR(255) DEFAULT 'Global Network',
          feature3Description TEXT,
          feature4Title VARCHAR(255) DEFAULT 'Instant Scaling',
          feature4Description TEXT,
          feature5Title VARCHAR(255) DEFAULT '24/7 Support',
          feature5Description TEXT,
          feature6Title VARCHAR(255) DEFAULT '99.9% Uptime',
          feature6Description TEXT,
          ctaTitle VARCHAR(255) DEFAULT 'Ready to Rise Above?',
          ctaDescription TEXT,
          backgroundImageLight TEXT,
          backgroundImageDark TEXT
        )
      `);

      const columnsToAdd = [
        "heroTitleLine1 VARCHAR(255) DEFAULT 'Cloud Hosting That'",
        "heroTitleLine2 VARCHAR(255) DEFAULT 'Rises Above'",
        "heroDescription TEXT",
        "stat1Value VARCHAR(50) DEFAULT '99.9%'",
        "stat1Label VARCHAR(100) DEFAULT 'Uptime SLA'",
        "stat2Value VARCHAR(50) DEFAULT '50+'",
        "stat2Label VARCHAR(100) DEFAULT 'Global Locations'",
        "stat3Value VARCHAR(50) DEFAULT '24/7'",
        "stat3Label VARCHAR(100) DEFAULT 'Expert Support'",
        "featuresSectionTitle VARCHAR(255) DEFAULT 'Why Choose Phoenix Cloud?'",
        "featuresSectionDescription TEXT",
        "feature1Title VARCHAR(255) DEFAULT 'Blazing Fast'",
        "feature1Description TEXT",
        "feature2Title VARCHAR(255) DEFAULT 'DDoS Protection'",
        "feature2Description TEXT",
        "feature3Title VARCHAR(255) DEFAULT 'Global Network'",
        "feature3Description TEXT",
        "feature4Title VARCHAR(255) DEFAULT 'Instant Scaling'",
        "feature4Description TEXT",
        "feature5Title VARCHAR(255) DEFAULT '24/7 Support'",
        "feature5Description TEXT",
        "feature6Title VARCHAR(255) DEFAULT '99.9% Uptime'",
        "feature6Description TEXT",
        "ctaTitle VARCHAR(255) DEFAULT 'Ready to Rise Above?'",
        "ctaDescription TEXT",
        "backgroundImageLight TEXT",
        "backgroundImageDark TEXT"
      ];

      for (const col of columnsToAdd) {
        const colName = col.split(" ")[0];
        try {
          await connection.query(`ALTER TABLE settings ADD COLUMN ${col}`);
        } catch (e: any) {
          if (!e.message?.includes("Duplicate column")) {
          }
        }
      }

      await connection.query(`
        CREATE TABLE IF NOT EXISTS admin_users (
          id VARCHAR(36) PRIMARY KEY,
          username VARCHAR(255) NOT NULL,
          passwordHash VARCHAR(255) NOT NULL,
          UNIQUE KEY unique_username (username)
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

      console.log("Database initialized successfully");
      this.initialized = true;
    } catch (error: any) {
      console.error("Database initialization error:", error.message);
    } finally {
      if (connection) {
        (connection as any).release();
      }
    }
  }

  private async query(sql: string, values?: any[]): Promise<[any[], any]> {
    let conn;
    try {
      conn = await Promise.race([
        pool.getConnection(),
        new Promise<any>((_, reject) => setTimeout(() => reject(new Error("Connection timeout")), 20000))
      ]);
      return await conn.query(sql, values);
    } catch (error: any) {
      if (error.message.includes("Connection timeout")) {
        console.warn("Database connection timeout - the database server may be slow to respond, returning cached or default data");
      }
      throw error;
    } finally {
      if (conn) {
        try {
          conn.release();
        } catch (releaseErr) {
          console.error("Error releasing connection:", releaseErr);
        }
      }
    }
  }

  async getCategories(): Promise<Category[]> {
    await this.initializeDatabase();
    const [rows] = await this.query("SELECT * FROM categories");
    return rows as Category[];
  }

  async getCategory(id: string): Promise<Category | undefined> {
    await this.initializeDatabase();
    const [rows] = await this.query("SELECT * FROM categories WHERE id = ?", [id]);
    return (rows as Category[])[0];
  }

  async createCategory(name: string, slug: string): Promise<Category> {
    await this.initializeDatabase();
    const id = randomUUID();
    await this.query("INSERT INTO categories (id, name, slug) VALUES (?, ?, ?)", [id, name, slug]);
    return { id, name, slug };
  }

  async updateCategory(id: string, name: string, slug: string): Promise<Category | undefined> {
    await this.initializeDatabase();
    const [result] = await this.query(
      "UPDATE categories SET name = ?, slug = ? WHERE id = ?",
      [name, slug, id]
    );
    if ((result as any).affectedRows === 0) return undefined;
    return { id, name, slug };
  }

  async deleteCategory(id: string): Promise<boolean> {
    await this.initializeDatabase();
    const [result] = await this.query("DELETE FROM categories WHERE id = ?", [id]);
    return (result as any).affectedRows > 0;
  }

  async getSubcategories(): Promise<Subcategory[]> {
    await this.initializeDatabase();
    const [rows] = await this.query("SELECT * FROM subcategories");
    return rows as Subcategory[];
  }

  async getSubcategoriesByCategory(categoryId: string): Promise<Subcategory[]> {
    await this.initializeDatabase();
    const [rows] = await this.query("SELECT * FROM subcategories WHERE categoryId = ?", [categoryId]);
    return rows as Subcategory[];
  }

  async createSubcategory(name: string, slug: string, categoryId: string): Promise<Subcategory> {
    await this.initializeDatabase();
    const id = randomUUID();
    await this.query(
      "INSERT INTO subcategories (id, name, slug, categoryId) VALUES (?, ?, ?, ?)",
      [id, name, slug, categoryId]
    );
    return { id, name, slug, categoryId };
  }

  async updateSubcategory(id: string, name: string, slug: string): Promise<Subcategory | undefined> {
    await this.initializeDatabase();
    const [existing] = await this.query("SELECT categoryId FROM subcategories WHERE id = ?", [id]);
    if ((existing as any[]).length === 0) return undefined;
    const categoryId = (existing as any[])[0].categoryId;
    await this.query("UPDATE subcategories SET name = ?, slug = ? WHERE id = ?", [name, slug, id]);
    return { id, name, slug, categoryId };
  }

  async deleteSubcategory(id: string): Promise<boolean> {
    await this.initializeDatabase();
    const [result] = await this.query("DELETE FROM subcategories WHERE id = ?", [id]);
    return (result as any).affectedRows > 0;
  }

  async getPlans(): Promise<Plan[]> {
    await this.initializeDatabase();
    const [rows] = await this.query("SELECT * FROM plans");
    return (rows as any[]).map((row) => ({
      ...row,
      features: typeof row.features === "string" ? JSON.parse(row.features) : row.features || [],
      popular: Boolean(row.popular),
    }));
  }

  async getPlansBySubcategory(subcategoryId: string): Promise<Plan[]> {
    await this.initializeDatabase();
    const [rows] = await this.query("SELECT * FROM plans WHERE subcategoryId = ?", [subcategoryId]);
    return (rows as any[]).map((row) => ({
      ...row,
      features: typeof row.features === "string" ? JSON.parse(row.features) : row.features || [],
      popular: Boolean(row.popular),
    }));
  }

  async createPlan(plan: Omit<Plan, "id">): Promise<Plan> {
    await this.initializeDatabase();
    const id = randomUUID();
    await this.query(
      `INSERT INTO plans (id, name, description, priceUsd, priceInr, period, features, popular, categoryId, subcategoryId) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, plan.name, plan.description, plan.priceUsd, plan.priceInr, plan.period, 
       JSON.stringify(plan.features), plan.popular || false, plan.categoryId, plan.subcategoryId]
    );
    return { ...plan, id };
  }

  async updatePlan(id: string, updates: Partial<Plan>): Promise<Plan | undefined> {
    await this.initializeDatabase();
    const [existing] = await this.query("SELECT * FROM plans WHERE id = ?", [id]);
    if ((existing as any[]).length === 0) return undefined;
    
    const current = (existing as any[])[0];
    const updated = {
      ...current,
      ...updates,
      features: updates.features ? JSON.stringify(updates.features) : current.features,
    };
    
    await this.query(
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
    const [result] = await this.query("DELETE FROM plans WHERE id = ?", [id]);
    return (result as any).affectedRows > 0;
  }

  async getFAQs(): Promise<FAQ[]> {
    await this.initializeDatabase();
    const [rows] = await this.query("SELECT * FROM faqs");
    return rows as FAQ[];
  }

  async createFAQ(question: string, answer: string): Promise<FAQ> {
    await this.initializeDatabase();
    const id = randomUUID();
    await this.query("INSERT INTO faqs (id, question, answer) VALUES (?, ?, ?)", [id, question, answer]);
    return { id, question, answer };
  }

  async updateFAQ(id: string, question: string, answer: string): Promise<FAQ | undefined> {
    await this.initializeDatabase();
    const [result] = await this.query(
      "UPDATE faqs SET question = ?, answer = ? WHERE id = ?",
      [question, answer, id]
    );
    if ((result as any).affectedRows === 0) return undefined;
    return { id, question, answer };
  }

  async deleteFAQ(id: string): Promise<boolean> {
    await this.initializeDatabase();
    const [result] = await this.query("DELETE FROM faqs WHERE id = ?", [id]);
    return (result as any).affectedRows > 0;
  }

  async getSettings(): Promise<Settings> {
    await this.initializeDatabase();
    const [rows] = await this.query("SELECT * FROM settings WHERE id = 1");
    const row = (rows as any[])[0] || {};
    return {
      currency: row.currency || "usd",
      supportLink: row.supportLink || "",
      redirectLink: row.redirectLink || "",
      instagramLink: row.instagramLink || "",
      youtubeLink: row.youtubeLink || "",
      email: row.email || "",
      documentationLink: row.documentationLink || "",
      heroTitleLine1: row.heroTitleLine1 || "Cloud Hosting That",
      heroTitleLine2: row.heroTitleLine2 || "Rises Above",
      heroDescription: row.heroDescription || "Experience blazing-fast performance with Phoenix Cloud. 99.9% uptime guarantee, instant scaling, and 24/7 expert support.",
      stat1Value: row.stat1Value || "99.9%",
      stat1Label: row.stat1Label || "Uptime SLA",
      stat2Value: row.stat2Value || "50+",
      stat2Label: row.stat2Label || "Global Locations",
      stat3Value: row.stat3Value || "24/7",
      stat3Label: row.stat3Label || "Expert Support",
      featuresSectionTitle: row.featuresSectionTitle || "Why Choose Phoenix Cloud?",
      featuresSectionDescription: row.featuresSectionDescription || "Built for performance, reliability, and ease of use.",
      feature1Title: row.feature1Title || "Blazing Fast",
      feature1Description: row.feature1Description || "NVMe SSD storage and optimized infrastructure for lightning-quick load times.",
      feature2Title: row.feature2Title || "DDoS Protection",
      feature2Description: row.feature2Description || "Enterprise-grade protection against attacks, keeping your services online.",
      feature3Title: row.feature3Title || "Global Network",
      feature3Description: row.feature3Description || "Strategically located data centers for low latency worldwide.",
      feature4Title: row.feature4Title || "Instant Scaling",
      feature4Description: row.feature4Description || "Scale resources up or down instantly based on your needs.",
      feature5Title: row.feature5Title || "24/7 Support",
      feature5Description: row.feature5Description || "Expert support team available around the clock via Discord and tickets.",
      feature6Title: row.feature6Title || "99.9% Uptime",
      feature6Description: row.feature6Description || "Industry-leading SLA with guaranteed uptime for your peace of mind.",
      ctaTitle: row.ctaTitle || "Ready to Rise Above?",
      ctaDescription: row.ctaDescription || "Join thousands of satisfied customers who trust Phoenix Cloud for their hosting needs. Get started in minutes.",
      backgroundImageLight: row.backgroundImageLight || "",
      backgroundImageDark: row.backgroundImageDark || "",
    };
  }

  async updateSettings(settings: Settings): Promise<Settings> {
    await this.initializeDatabase();
    await this.query(
      `UPDATE settings SET currency = ?, supportLink = ?, redirectLink = ?, 
       instagramLink = ?, youtubeLink = ?, email = ?, documentationLink = ?,
       heroTitleLine1 = ?, heroTitleLine2 = ?, heroDescription = ?,
       stat1Value = ?, stat1Label = ?, stat2Value = ?, stat2Label = ?, stat3Value = ?, stat3Label = ?,
       featuresSectionTitle = ?, featuresSectionDescription = ?,
       feature1Title = ?, feature1Description = ?,
       feature2Title = ?, feature2Description = ?,
       feature3Title = ?, feature3Description = ?,
       feature4Title = ?, feature4Description = ?,
       feature5Title = ?, feature5Description = ?,
       feature6Title = ?, feature6Description = ?,
       ctaTitle = ?, ctaDescription = ?,
       backgroundImageLight = ?, backgroundImageDark = ?
       WHERE id = 1`,
      [
        settings.currency, settings.supportLink, settings.redirectLink,
        settings.instagramLink || "", settings.youtubeLink || "", 
        settings.email || "", settings.documentationLink || "",
        settings.heroTitleLine1 || "Cloud Hosting That",
        settings.heroTitleLine2 || "Rises Above",
        settings.heroDescription || "",
        settings.stat1Value || "99.9%",
        settings.stat1Label || "Uptime SLA",
        settings.stat2Value || "50+",
        settings.stat2Label || "Global Locations",
        settings.stat3Value || "24/7",
        settings.stat3Label || "Expert Support",
        settings.featuresSectionTitle || "Why Choose Phoenix Cloud?",
        settings.featuresSectionDescription || "",
        settings.feature1Title || "Blazing Fast",
        settings.feature1Description || "",
        settings.feature2Title || "DDoS Protection",
        settings.feature2Description || "",
        settings.feature3Title || "Global Network",
        settings.feature3Description || "",
        settings.feature4Title || "Instant Scaling",
        settings.feature4Description || "",
        settings.feature5Title || "24/7 Support",
        settings.feature5Description || "",
        settings.feature6Title || "99.9% Uptime",
        settings.feature6Description || "",
        settings.ctaTitle || "Ready to Rise Above?",
        settings.ctaDescription || "",
        settings.backgroundImageLight || "",
        settings.backgroundImageDark || ""
      ]
    );
    return settings;
  }

  async getAdminUsers(): Promise<any[]> {
    await this.initializeDatabase();
    const [rows] = await this.query("SELECT id, username FROM admin_users");
    return rows as any[];
  }

  async createAdminUser(username: string, passwordHash: string): Promise<any> {
    await this.initializeDatabase();
    const id = randomUUID();
    await this.query(
      "INSERT INTO admin_users (id, username, passwordHash) VALUES (?, ?, ?)",
      [id, username, passwordHash]
    );
    return { id, username };
  }

  async updateAdminUser(id: string, passwordHash: string): Promise<any | undefined> {
    await this.initializeDatabase();
    const [result] = await this.query(
      "UPDATE admin_users SET passwordHash = ? WHERE id = ?",
      [passwordHash, id]
    );
    if ((result as any).affectedRows === 0) return undefined;
    const [rows] = await this.query("SELECT id, username FROM admin_users WHERE id = ?", [id]);
    return (rows as any[])[0];
  }

  async deleteAdminUser(id: string): Promise<boolean> {
    await this.initializeDatabase();
    const [result] = await this.query("DELETE FROM admin_users WHERE id = ?", [id]);
    return (result as any).affectedRows > 0;
  }

  async verifyAdminUser(username: string, password: string): Promise<boolean> {
    await this.initializeDatabase();
    const [rows] = await this.query(
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
