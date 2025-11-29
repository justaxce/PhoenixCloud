import { type Category, type Subcategory, type Plan, type Settings, type FAQ } from "@shared/schema";
import { randomUUID, scryptSync } from "crypto";
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

const connectionUrl = process.env.DATABASE_URL;
if (!connectionUrl) {
  console.error("ERROR: DATABASE_URL not set");
  process.exit(1);
}

function getConnectionConfig() {
  // Use MySQL credentials from environment or fallback to hardcoded MySQL
  const mysqlUser = process.env.MYSQL_USER || "u4_4OW4n62mjZ";
  const mysqlPassword = process.env.MYSQL_PASSWORD || "+3GFoa+x55vSzFL4pnX1=l6F";
  const mysqlHost = process.env.MYSQL_HOST || "panel.sriyannodes.cloud";
  const mysqlPort = parseInt(process.env.MYSQL_PORT || "3306");
  const mysqlDatabase = process.env.MYSQL_DATABASE || "s4_pheonix-cloud";

  // If DATABASE_URL exists but points to PostgreSQL/Neon, ignore it and use MySQL
  if (connectionUrl && !connectionUrl.includes("neon") && !connectionUrl.includes("postgres")) {
    try {
      const urlObj = new URL(connectionUrl);
      return {
        host: urlObj.hostname,
        port: parseInt(urlObj.port || "3306"),
        user: urlObj.username,
        password: decodeURIComponent(urlObj.password),
        database: urlObj.pathname.slice(1),
      };
    } catch (e) {
      // Fall through to MySQL defaults
    }
  }

  // Use MySQL credentials
  return {
    host: mysqlHost,
    port: mysqlPort,
    user: mysqlUser,
    password: mysqlPassword,
    database: mysqlDatabase,
  };
}

export class MySQLStorage implements IStorage {
  private initialized = false;
  private pool: mysql.Pool | null = null;

  private getPool(): mysql.Pool {
    if (!this.pool) {
      const config = getConnectionConfig();
      console.log(`Connecting to MySQL at ${config.host}:${config.port}/${config.database}...`);
      this.pool = mysql.createPool({
        host: config.host,
        port: config.port,
        user: config.user,
        password: config.password,
        database: config.database,
        waitForConnections: true,
        connectionLimit: 5,
        queueLimit: 0,
        connectTimeout: 10000,
        enableKeepAlive: true,
        keepAliveInitialDelayMs: 30000,
      });
    }
    return this.pool;
  }

  private hashPassword(password: string): string {
    const salt = "phoenix-salt";
    return scryptSync(password, salt, 32).toString("hex");
  }

  async initializeDatabase(): Promise<void> {
    if (this.initialized) return;

    const pool = this.getPool();
    const conn = await pool.getConnection();

    try {
      console.log("Initializing MySQL database...");

      await conn.query(`
        CREATE TABLE IF NOT EXISTS categories (
          id VARCHAR(36) PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          slug VARCHAR(255) NOT NULL UNIQUE
        )
      `);

      await conn.query(`
        CREATE TABLE IF NOT EXISTS subcategories (
          id VARCHAR(36) PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          slug VARCHAR(255) NOT NULL UNIQUE,
          categoryId VARCHAR(36) NOT NULL,
          FOREIGN KEY (categoryId) REFERENCES categories(id) ON DELETE CASCADE
        )
      `);

      await conn.query(`
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
          FOREIGN KEY (categoryId) REFERENCES categories(id) ON DELETE SET NULL,
          FOREIGN KEY (subcategoryId) REFERENCES subcategories(id) ON DELETE SET NULL
        )
      `);

      await conn.query(`
        CREATE TABLE IF NOT EXISTS faqs (
          id VARCHAR(36) PRIMARY KEY,
          question TEXT NOT NULL,
          answer TEXT NOT NULL
        )
      `);

      await conn.query(`
        CREATE TABLE IF NOT EXISTS settings (
          id INTEGER PRIMARY KEY,
          currency VARCHAR(10) DEFAULT 'usd',
          supportLink VARCHAR(500),
          redirectLink VARCHAR(500),
          instagramLink VARCHAR(500),
          youtubeLink VARCHAR(500),
          email VARCHAR(255),
          documentationLink VARCHAR(500),
          heroTitleLine1 VARCHAR(255),
          heroTitleLine2 VARCHAR(255),
          heroDescription TEXT,
          stat1Value VARCHAR(50),
          stat1Label VARCHAR(100),
          stat2Value VARCHAR(50),
          stat2Label VARCHAR(100),
          stat3Value VARCHAR(50),
          stat3Label VARCHAR(100),
          featuresSectionTitle VARCHAR(255),
          featuresSectionDescription TEXT,
          feature1Title VARCHAR(255),
          feature1Description TEXT,
          feature2Title VARCHAR(255),
          feature2Description TEXT,
          feature3Title VARCHAR(255),
          feature3Description TEXT,
          feature4Title VARCHAR(255),
          feature4Description TEXT,
          feature5Title VARCHAR(255),
          feature5Description TEXT,
          feature6Title VARCHAR(255),
          feature6Description TEXT,
          ctaTitle VARCHAR(255),
          ctaDescription TEXT,
          backgroundImageLight TEXT,
          backgroundImageDark TEXT
        )
      `);

      await conn.query(`
        CREATE TABLE IF NOT EXISTS admin_users (
          id VARCHAR(36) PRIMARY KEY,
          username VARCHAR(255) NOT NULL UNIQUE,
          passwordHash VARCHAR(255) NOT NULL
        )
      `);

      const [settings] = await conn.query("SELECT * FROM settings WHERE id = 1");
      if (Array.isArray(settings) && settings.length === 0) {
        await conn.query("INSERT INTO settings (id, currency, supportLink, redirectLink) VALUES (?, ?, ?, ?)", [1, "usd", "", ""]);
      }

      const [existingAdmin] = await conn.query("SELECT id FROM admin_users WHERE username = ?", ["admin"]);
      if (Array.isArray(existingAdmin) && existingAdmin.length === 0) {
        const adminId = randomUUID();
        const passwordHash = this.hashPassword("admin123");
        await conn.query("INSERT INTO admin_users (id, username, passwordHash) VALUES (?, ?, ?)", [adminId, "admin", passwordHash]);
        console.log("✅ Created default admin user: admin / admin123");
      }

      console.log("✅ MySQL database initialized successfully!");
      this.initialized = true;
    } catch (error: any) {
      console.error("Database initialization error:", error.message);
      throw error;
    } finally {
      conn.release();
    }
  }

  async getCategories(): Promise<Category[]> {
    await this.initializeDatabase();
    const pool = this.getPool();
    const [rows] = await pool.query("SELECT * FROM categories");
    return rows as Category[];
  }

  async getCategory(id: string): Promise<Category | undefined> {
    await this.initializeDatabase();
    const pool = this.getPool();
    const [rows] = await pool.query("SELECT * FROM categories WHERE id = ?", [id]);
    return (rows as Category[])[0];
  }

  async createCategory(name: string, slug: string): Promise<Category> {
    await this.initializeDatabase();
    const pool = this.getPool();
    const id = randomUUID();
    await pool.query("INSERT INTO categories (id, name, slug) VALUES (?, ?, ?)", [id, name, slug]);
    return { id, name, slug };
  }

  async updateCategory(id: string, name: string, slug: string): Promise<Category | undefined> {
    await this.initializeDatabase();
    const pool = this.getPool();
    await pool.query("UPDATE categories SET name = ?, slug = ? WHERE id = ?", [name, slug, id]);
    return { id, name, slug };
  }

  async deleteCategory(id: string): Promise<boolean> {
    await this.initializeDatabase();
    const pool = this.getPool();
    const [result] = await pool.query("DELETE FROM categories WHERE id = ?", [id]);
    return (result as any).affectedRows > 0;
  }

  async getSubcategories(): Promise<Subcategory[]> {
    await this.initializeDatabase();
    const pool = this.getPool();
    const [rows] = await pool.query("SELECT * FROM subcategories");
    return rows as Subcategory[];
  }

  async getSubcategoriesByCategory(categoryId: string): Promise<Subcategory[]> {
    await this.initializeDatabase();
    const pool = this.getPool();
    const [rows] = await pool.query("SELECT * FROM subcategories WHERE categoryId = ?", [categoryId]);
    return rows as Subcategory[];
  }

  async createSubcategory(name: string, slug: string, categoryId: string): Promise<Subcategory> {
    await this.initializeDatabase();
    const pool = this.getPool();
    const id = randomUUID();
    await pool.query("INSERT INTO subcategories (id, name, slug, categoryId) VALUES (?, ?, ?, ?)", [id, name, slug, categoryId]);
    return { id, name, slug, categoryId };
  }

  async updateSubcategory(id: string, name: string, slug: string): Promise<Subcategory | undefined> {
    await this.initializeDatabase();
    const pool = this.getPool();
    const [existing] = await pool.query("SELECT categoryId FROM subcategories WHERE id = ?", [id]);
    if (!Array.isArray(existing) || existing.length === 0) return undefined;
    const categoryId = (existing[0] as any).categoryId;
    await pool.query("UPDATE subcategories SET name = ?, slug = ? WHERE id = ?", [name, slug, id]);
    return { id, name, slug, categoryId };
  }

  async deleteSubcategory(id: string): Promise<boolean> {
    await this.initializeDatabase();
    const pool = this.getPool();
    const [result] = await pool.query("DELETE FROM subcategories WHERE id = ?", [id]);
    return (result as any).affectedRows > 0;
  }

  async getPlans(): Promise<Plan[]> {
    await this.initializeDatabase();
    const pool = this.getPool();
    const [rows] = await pool.query("SELECT * FROM plans");
    return (rows as any[]).map((row) => ({
      ...row,
      features: typeof row.features === "string" ? JSON.parse(row.features) : row.features || [],
      popular: Boolean(row.popular),
    }));
  }

  async getPlansBySubcategory(subcategoryId: string): Promise<Plan[]> {
    await this.initializeDatabase();
    const pool = this.getPool();
    const [rows] = await pool.query("SELECT * FROM plans WHERE subcategoryId = ?", [subcategoryId]);
    return (rows as any[]).map((row) => ({
      ...row,
      features: typeof row.features === "string" ? JSON.parse(row.features) : row.features || [],
      popular: Boolean(row.popular),
    }));
  }

  async createPlan(plan: Omit<Plan, "id">): Promise<Plan> {
    await this.initializeDatabase();
    const pool = this.getPool();
    const id = randomUUID();
    await pool.query(
      "INSERT INTO plans (id, name, description, priceUsd, priceInr, period, features, popular, categoryId, subcategoryId) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [id, plan.name, plan.description, plan.priceUsd, plan.priceInr, plan.period, JSON.stringify(plan.features), plan.popular || false, plan.categoryId, plan.subcategoryId]
    );
    return { ...plan, id };
  }

  async updatePlan(id: string, updates: Partial<Plan>): Promise<Plan | undefined> {
    await this.initializeDatabase();
    const pool = this.getPool();
    const [existing] = await pool.query("SELECT * FROM plans WHERE id = ?", [id]);
    if (!Array.isArray(existing) || existing.length === 0) return undefined;

    const current = (existing[0] as any);
    await pool.query(
      "UPDATE plans SET name = ?, description = ?, priceUsd = ?, priceInr = ?, period = ?, features = ?, popular = ?, categoryId = ?, subcategoryId = ? WHERE id = ?",
      [
        updates.name || current.name,
        updates.description || current.description,
        updates.priceUsd || current.priceUsd,
        updates.priceInr || current.priceInr,
        updates.period || current.period,
        updates.features ? JSON.stringify(updates.features) : current.features,
        updates.popular !== undefined ? updates.popular : current.popular,
        updates.categoryId || current.categoryId,
        updates.subcategoryId || current.subcategoryId,
        id,
      ]
    );

    return { ...current, ...updates };
  }

  async deletePlan(id: string): Promise<boolean> {
    await this.initializeDatabase();
    const pool = this.getPool();
    const [result] = await pool.query("DELETE FROM plans WHERE id = ?", [id]);
    return (result as any).affectedRows > 0;
  }

  async getFAQs(): Promise<FAQ[]> {
    await this.initializeDatabase();
    const pool = this.getPool();
    const [rows] = await pool.query("SELECT * FROM faqs");
    return rows as FAQ[];
  }

  async createFAQ(question: string, answer: string): Promise<FAQ> {
    await this.initializeDatabase();
    const pool = this.getPool();
    const id = randomUUID();
    await pool.query("INSERT INTO faqs (id, question, answer) VALUES (?, ?, ?)", [id, question, answer]);
    return { id, question, answer };
  }

  async updateFAQ(id: string, question: string, answer: string): Promise<FAQ | undefined> {
    await this.initializeDatabase();
    const pool = this.getPool();
    await pool.query("UPDATE faqs SET question = ?, answer = ? WHERE id = ?", [question, answer, id]);
    return { id, question, answer };
  }

  async deleteFAQ(id: string): Promise<boolean> {
    await this.initializeDatabase();
    const pool = this.getPool();
    const [result] = await pool.query("DELETE FROM faqs WHERE id = ?", [id]);
    return (result as any).affectedRows > 0;
  }

  async getSettings(): Promise<Settings> {
    await this.initializeDatabase();
    const pool = this.getPool();
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
      heroTitleLine1: row.heroTitleLine1 || "Cloud Hosting That",
      heroTitleLine2: row.heroTitleLine2 || "Rises Above",
      heroDescription: row.heroDescription || "Experience blazing-fast performance with Phoenix Cloud.",
      stat1Value: row.stat1Value || "99.9%",
      stat1Label: row.stat1Label || "Uptime SLA",
      stat2Value: row.stat2Value || "50+",
      stat2Label: row.stat2Label || "Global Locations",
      stat3Value: row.stat3Value || "24/7",
      stat3Label: row.stat3Label || "Expert Support",
      featuresSectionTitle: row.featuresSectionTitle || "Why Choose Phoenix Cloud?",
      featuresSectionDescription: row.featuresSectionDescription || "Built for performance, reliability, and ease of use.",
      feature1Title: row.feature1Title || "Blazing Fast",
      feature1Description: row.feature1Description || "NVMe SSD storage.",
      feature2Title: row.feature2Title || "DDoS Protection",
      feature2Description: row.feature2Description || "Enterprise-grade protection.",
      feature3Title: row.feature3Title || "Global Network",
      feature3Description: row.feature3Description || "Low latency worldwide.",
      feature4Title: row.feature4Title || "Instant Scaling",
      feature4Description: row.feature4Description || "Scale on demand.",
      feature5Title: row.feature5Title || "24/7 Support",
      feature5Description: row.feature5Description || "Expert support team.",
      feature6Title: row.feature6Title || "99.9% Uptime",
      feature6Description: row.feature6Description || "Industry-leading SLA.",
      ctaTitle: row.ctaTitle || "Ready to Rise Above?",
      ctaDescription: row.ctaDescription || "Get started in minutes.",
      backgroundImageLight: row.backgroundImageLight || "",
      backgroundImageDark: row.backgroundImageDark || "",
    };
  }

  async updateSettings(settings: Settings): Promise<Settings> {
    await this.initializeDatabase();
    const pool = this.getPool();
    await pool.query(
      "UPDATE settings SET currency = ?, supportLink = ?, redirectLink = ?, instagramLink = ?, youtubeLink = ?, email = ?, documentationLink = ?, heroTitleLine1 = ?, heroTitleLine2 = ?, heroDescription = ?, stat1Value = ?, stat1Label = ?, stat2Value = ?, stat2Label = ?, stat3Value = ?, stat3Label = ?, featuresSectionTitle = ?, featuresSectionDescription = ?, feature1Title = ?, feature1Description = ?, feature2Title = ?, feature2Description = ?, feature3Title = ?, feature3Description = ?, feature4Title = ?, feature4Description = ?, feature5Title = ?, feature5Description = ?, feature6Title = ?, feature6Description = ?, ctaTitle = ?, ctaDescription = ?, backgroundImageLight = ?, backgroundImageDark = ? WHERE id = 1",
      [
        settings.currency,
        settings.supportLink,
        settings.redirectLink,
        settings.instagramLink,
        settings.youtubeLink,
        settings.email,
        settings.documentationLink,
        settings.heroTitleLine1,
        settings.heroTitleLine2,
        settings.heroDescription,
        settings.stat1Value,
        settings.stat1Label,
        settings.stat2Value,
        settings.stat2Label,
        settings.stat3Value,
        settings.stat3Label,
        settings.featuresSectionTitle,
        settings.featuresSectionDescription,
        settings.feature1Title,
        settings.feature1Description,
        settings.feature2Title,
        settings.feature2Description,
        settings.feature3Title,
        settings.feature3Description,
        settings.feature4Title,
        settings.feature4Description,
        settings.feature5Title,
        settings.feature5Description,
        settings.feature6Title,
        settings.feature6Description,
        settings.ctaTitle,
        settings.ctaDescription,
        settings.backgroundImageLight,
        settings.backgroundImageDark,
      ]
    );
    return settings;
  }

  async getAdminUsers(): Promise<any[]> {
    await this.initializeDatabase();
    const pool = this.getPool();
    const [rows] = await pool.query("SELECT id, username FROM admin_users");
    return rows as any[];
  }

  async createAdminUser(username: string, passwordHash: string): Promise<any> {
    await this.initializeDatabase();
    const pool = this.getPool();
    const id = randomUUID();
    await pool.query("INSERT INTO admin_users (id, username, passwordHash) VALUES (?, ?, ?)", [id, username, passwordHash]);
    return { id, username };
  }

  async updateAdminUser(id: string, passwordHash: string): Promise<any | undefined> {
    await this.initializeDatabase();
    const pool = this.getPool();
    await pool.query("UPDATE admin_users SET passwordHash = ? WHERE id = ?", [passwordHash, id]);
    const [result] = await pool.query("SELECT id, username FROM admin_users WHERE id = ?", [id]);
    return (result as any[])[0];
  }

  async deleteAdminUser(id: string): Promise<boolean> {
    await this.initializeDatabase();
    const pool = this.getPool();
    const [result] = await pool.query("DELETE FROM admin_users WHERE id = ?", [id]);
    return (result as any).affectedRows > 0;
  }

  async verifyAdminUser(username: string, password: string): Promise<boolean> {
    try {
      await this.initializeDatabase();
      const pool = this.getPool();
      const [result] = await pool.query("SELECT passwordHash FROM admin_users WHERE username = ?", [username]);

      if (!Array.isArray(result) || result.length === 0) {
        return false;
      }

      const storedHash = (result[0] as any).passwordHash;
      const passwordHash = this.hashPassword(password);
      return storedHash === passwordHash;
    } catch (error) {
      console.error("[AUTH] Error in verifyAdminUser:", error);
      return false;
    }
  }
}

export const storage = new MySQLStorage();
