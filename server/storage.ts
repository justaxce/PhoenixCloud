import { type Category, type Subcategory, type Plan, type Settings, type FAQ } from "@shared/schema";
import { randomUUID, scryptSync, timingSafeEqual } from "crypto";
import { Pool } from "@neondatabase/serverless";

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

// Create PostgreSQL pool from Replit's free DATABASE_URL
const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  console.error("ERROR: DATABASE_URL is not set. Please ensure PostgreSQL database is provisioned in Replit.");
  process.exit(1);
}

const pool = new Pool({ connectionString: dbUrl });

export class PostgresStorage implements IStorage {
  private initialized = false;

  private hashPassword(password: string): string {
    const salt = "phoenix-salt";
    return scryptSync(password, salt, 32).toString("hex");
  }

  async initializeDatabase(): Promise<void> {
    if (this.initialized) return;
    
    const client = await pool.connect();
    try {
      console.log("Initializing PostgreSQL database with Replit's free lifetime database...");
      
      // Create all tables
      await client.query(`
        CREATE TABLE IF NOT EXISTS categories (
          id VARCHAR(36) PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          slug VARCHAR(255) NOT NULL UNIQUE
        );
        
        CREATE TABLE IF NOT EXISTS subcategories (
          id VARCHAR(36) PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          slug VARCHAR(255) NOT NULL UNIQUE,
          categoryId VARCHAR(36) NOT NULL REFERENCES categories(id) ON DELETE CASCADE
        );
        
        CREATE TABLE IF NOT EXISTS plans (
          id VARCHAR(36) PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          description TEXT,
          priceUsd VARCHAR(50),
          priceInr VARCHAR(50),
          period VARCHAR(50),
          features JSONB,
          popular BOOLEAN DEFAULT FALSE,
          categoryId VARCHAR(36),
          subcategoryId VARCHAR(36),
          FOREIGN KEY (categoryId) REFERENCES categories(id) ON DELETE SET NULL,
          FOREIGN KEY (subcategoryId) REFERENCES subcategories(id) ON DELETE SET NULL
        );
        
        CREATE TABLE IF NOT EXISTS faqs (
          id VARCHAR(36) PRIMARY KEY,
          question TEXT NOT NULL,
          answer TEXT NOT NULL
        );
        
        CREATE TABLE IF NOT EXISTS settings (
          id INTEGER PRIMARY KEY DEFAULT 1,
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
        );
        
        CREATE TABLE IF NOT EXISTS admin_users (
          id VARCHAR(36) PRIMARY KEY,
          username VARCHAR(255) NOT NULL UNIQUE,
          passwordHash VARCHAR(255) NOT NULL
        );
      `);

      // Initialize default settings if not exists
      const settingsResult = await client.query("SELECT * FROM settings WHERE id = 1");
      if (settingsResult.rows.length === 0) {
        await client.query(
          "INSERT INTO settings (id, currency, supportLink, redirectLink) VALUES (1, 'usd', '', '')"
        );
      }

      // Initialize default admin user if not exists
      const adminsResult = await client.query("SELECT * FROM admin_users");
      if (adminsResult.rows.length === 0) {
        const adminId = randomUUID();
        const passwordHash = this.hashPassword("admin123");
        await client.query(
          "INSERT INTO admin_users (id, username, passwordHash) VALUES ($1, $2, $3)",
          [adminId, "admin", passwordHash]
        );
        console.log("✅ Created default admin user: admin / admin123");
      }

      console.log("✅ PostgreSQL database initialized successfully!");
      this.initialized = true;
    } catch (error: any) {
      console.error("Database initialization error:", error.message);
      throw error;
    } finally {
      client.release();
    }
  }

  async getCategories(): Promise<Category[]> {
    await this.initializeDatabase();
    const client = await pool.connect();
    try {
      const result = await client.query("SELECT * FROM categories");
      return result.rows;
    } finally {
      client.release();
    }
  }

  async getCategory(id: string): Promise<Category | undefined> {
    await this.initializeDatabase();
    const client = await pool.connect();
    try {
      const result = await client.query("SELECT * FROM categories WHERE id = $1", [id]);
      return result.rows[0];
    } finally {
      client.release();
    }
  }

  async createCategory(name: string, slug: string): Promise<Category> {
    await this.initializeDatabase();
    const id = randomUUID();
    const client = await pool.connect();
    try {
      await client.query("INSERT INTO categories (id, name, slug) VALUES ($1, $2, $3)", [id, name, slug]);
      return { id, name, slug };
    } finally {
      client.release();
    }
  }

  async updateCategory(id: string, name: string, slug: string): Promise<Category | undefined> {
    await this.initializeDatabase();
    const client = await pool.connect();
    try {
      const result = await client.query(
        "UPDATE categories SET name = $1, slug = $2 WHERE id = $3 RETURNING *",
        [name, slug, id]
      );
      return result.rows[0];
    } finally {
      client.release();
    }
  }

  async deleteCategory(id: string): Promise<boolean> {
    await this.initializeDatabase();
    const client = await pool.connect();
    try {
      const result = await client.query("DELETE FROM categories WHERE id = $1", [id]);
      return result.rowCount! > 0;
    } finally {
      client.release();
    }
  }

  async getSubcategories(): Promise<Subcategory[]> {
    await this.initializeDatabase();
    const client = await pool.connect();
    try {
      const result = await client.query("SELECT * FROM subcategories");
      return result.rows;
    } finally {
      client.release();
    }
  }

  async getSubcategoriesByCategory(categoryId: string): Promise<Subcategory[]> {
    await this.initializeDatabase();
    const client = await pool.connect();
    try {
      const result = await client.query("SELECT * FROM subcategories WHERE categoryId = $1", [categoryId]);
      return result.rows;
    } finally {
      client.release();
    }
  }

  async createSubcategory(name: string, slug: string, categoryId: string): Promise<Subcategory> {
    await this.initializeDatabase();
    const id = randomUUID();
    const client = await pool.connect();
    try {
      await client.query(
        "INSERT INTO subcategories (id, name, slug, categoryId) VALUES ($1, $2, $3, $4)",
        [id, name, slug, categoryId]
      );
      return { id, name, slug, categoryId };
    } finally {
      client.release();
    }
  }

  async updateSubcategory(id: string, name: string, slug: string): Promise<Subcategory | undefined> {
    await this.initializeDatabase();
    const client = await pool.connect();
    try {
      const existing = await client.query("SELECT categoryId FROM subcategories WHERE id = $1", [id]);
      if (existing.rows.length === 0) return undefined;
      const categoryId = existing.rows[0].categoryId;
      
      await client.query("UPDATE subcategories SET name = $1, slug = $2 WHERE id = $3", [name, slug, id]);
      return { id, name, slug, categoryId };
    } finally {
      client.release();
    }
  }

  async deleteSubcategory(id: string): Promise<boolean> {
    await this.initializeDatabase();
    const client = await pool.connect();
    try {
      const result = await client.query("DELETE FROM subcategories WHERE id = $1", [id]);
      return result.rowCount! > 0;
    } finally {
      client.release();
    }
  }

  async getPlans(): Promise<Plan[]> {
    await this.initializeDatabase();
    const client = await pool.connect();
    try {
      const result = await client.query("SELECT * FROM plans");
      return result.rows.map((row: any) => ({
        ...row,
        features: typeof row.features === "string" ? JSON.parse(row.features) : row.features || [],
        popular: Boolean(row.popular),
      }));
    } finally {
      client.release();
    }
  }

  async getPlansBySubcategory(subcategoryId: string): Promise<Plan[]> {
    await this.initializeDatabase();
    const client = await pool.connect();
    try {
      const result = await client.query("SELECT * FROM plans WHERE subcategoryId = $1", [subcategoryId]);
      return result.rows.map((row: any) => ({
        ...row,
        features: typeof row.features === "string" ? JSON.parse(row.features) : row.features || [],
        popular: Boolean(row.popular),
      }));
    } finally {
      client.release();
    }
  }

  async createPlan(plan: Omit<Plan, "id">): Promise<Plan> {
    await this.initializeDatabase();
    const id = randomUUID();
    const client = await pool.connect();
    try {
      await client.query(
        `INSERT INTO plans (id, name, description, priceUsd, priceInr, period, features, popular, categoryId, subcategoryId) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [id, plan.name, plan.description, plan.priceUsd, plan.priceInr, plan.period, 
         JSON.stringify(plan.features), plan.popular || false, plan.categoryId, plan.subcategoryId]
      );
      return { ...plan, id };
    } finally {
      client.release();
    }
  }

  async updatePlan(id: string, updates: Partial<Plan>): Promise<Plan | undefined> {
    await this.initializeDatabase();
    const client = await pool.connect();
    try {
      const existing = await client.query("SELECT * FROM plans WHERE id = $1", [id]);
      if (existing.rows.length === 0) return undefined;
      
      const current = existing.rows[0];
      await client.query(
        `UPDATE plans SET name = $1, description = $2, priceUsd = $3, priceInr = $4, period = $5, 
         features = $6, popular = $7, categoryId = $8, subcategoryId = $9 WHERE id = $10`,
        [updates.name || current.name, updates.description || current.description, 
         updates.priceUsd || current.priceUsd, updates.priceInr || current.priceInr, 
         updates.period || current.period, updates.features ? JSON.stringify(updates.features) : current.features,
         updates.popular !== undefined ? updates.popular : current.popular,
         updates.categoryId || current.categoryId, updates.subcategoryId || current.subcategoryId, id]
      );
      
      return { ...current, ...updates };
    } finally {
      client.release();
    }
  }

  async deletePlan(id: string): Promise<boolean> {
    await this.initializeDatabase();
    const client = await pool.connect();
    try {
      const result = await client.query("DELETE FROM plans WHERE id = $1", [id]);
      return result.rowCount! > 0;
    } finally {
      client.release();
    }
  }

  async getFAQs(): Promise<FAQ[]> {
    await this.initializeDatabase();
    const client = await pool.connect();
    try {
      const result = await client.query("SELECT * FROM faqs");
      return result.rows;
    } finally {
      client.release();
    }
  }

  async createFAQ(question: string, answer: string): Promise<FAQ> {
    await this.initializeDatabase();
    const id = randomUUID();
    const client = await pool.connect();
    try {
      await client.query("INSERT INTO faqs (id, question, answer) VALUES ($1, $2, $3)", [id, question, answer]);
      return { id, question, answer };
    } finally {
      client.release();
    }
  }

  async updateFAQ(id: string, question: string, answer: string): Promise<FAQ | undefined> {
    await this.initializeDatabase();
    const client = await pool.connect();
    try {
      const result = await client.query(
        "UPDATE faqs SET question = $1, answer = $2 WHERE id = $3 RETURNING *",
        [question, answer, id]
      );
      return result.rows[0];
    } finally {
      client.release();
    }
  }

  async deleteFAQ(id: string): Promise<boolean> {
    await this.initializeDatabase();
    const client = await pool.connect();
    try {
      const result = await client.query("DELETE FROM faqs WHERE id = $1", [id]);
      return result.rowCount! > 0;
    } finally {
      client.release();
    }
  }

  async getSettings(): Promise<Settings> {
    await this.initializeDatabase();
    const client = await pool.connect();
    try {
      const result = await client.query("SELECT * FROM settings WHERE id = 1");
      const row = result.rows[0] || {};
      return {
        currency: row.currency || "usd",
        supportLink: row.supportlink || "",
        redirectLink: row.redirectlink || "",
        instagramLink: row.instagramlink || "",
        youtubeLink: row.youtubelink || "",
        email: row.email || "",
        documentationLink: row.documentationlink || "",
        heroTitleLine1: row.herotitleline1 || "Cloud Hosting That",
        heroTitleLine2: row.herotitleline2 || "Rises Above",
        heroDescription: row.herodescription || "Experience blazing-fast performance with Phoenix Cloud.",
        stat1Value: row.stat1value || "99.9%",
        stat1Label: row.stat1label || "Uptime SLA",
        stat2Value: row.stat2value || "50+",
        stat2Label: row.stat2label || "Global Locations",
        stat3Value: row.stat3value || "24/7",
        stat3Label: row.stat3label || "Expert Support",
        featuresSectionTitle: row.featuressectiontitle || "Why Choose Phoenix Cloud?",
        featuresSectionDescription: row.featuressectiondescription || "Built for performance, reliability, and ease of use.",
        feature1Title: row.feature1title || "Blazing Fast",
        feature1Description: row.feature1description || "NVMe SSD storage.",
        feature2Title: row.feature2title || "DDoS Protection",
        feature2Description: row.feature2description || "Enterprise-grade protection.",
        feature3Title: row.feature3title || "Global Network",
        feature3Description: row.feature3description || "Low latency worldwide.",
        feature4Title: row.feature4title || "Instant Scaling",
        feature4Description: row.feature4description || "Scale on demand.",
        feature5Title: row.feature5title || "24/7 Support",
        feature5Description: row.feature5description || "Expert support team.",
        feature6Title: row.feature6title || "99.9% Uptime",
        feature6Description: row.feature6description || "Industry-leading SLA.",
        ctaTitle: row.ctatitle || "Ready to Rise Above?",
        ctaDescription: row.ctadescription || "Get started in minutes.",
        backgroundImageLight: row.backgroundimagelight || "",
        backgroundImageDark: row.backgroundimagedark || "",
      };
    } finally {
      client.release();
    }
  }

  async updateSettings(settings: Settings): Promise<Settings> {
    await this.initializeDatabase();
    const client = await pool.connect();
    try {
      await client.query(
        `UPDATE settings SET currency = $1, supportLink = $2, redirectLink = $3, instagramLink = $4, 
         youtubeLink = $5, email = $6, documentationLink = $7, heroTitleLine1 = $8, heroTitleLine2 = $9, 
         heroDescription = $10, stat1Value = $11, stat1Label = $12, stat2Value = $13, stat2Label = $14, 
         stat3Value = $15, stat3Label = $16, featuresSectionTitle = $17, featuresSectionDescription = $18, 
         feature1Title = $19, feature1Description = $20, feature2Title = $21, feature2Description = $22, 
         feature3Title = $23, feature3Description = $24, feature4Title = $25, feature4Description = $26, 
         feature5Title = $27, feature5Description = $28, feature6Title = $29, feature6Description = $30, 
         ctaTitle = $31, ctaDescription = $32, backgroundImageLight = $33, backgroundImageDark = $34 
         WHERE id = 1`,
        [settings.currency, settings.supportLink, settings.redirectLink, settings.instagramLink, 
         settings.youtubeLink, settings.email, settings.documentationLink, settings.heroTitleLine1, 
         settings.heroTitleLine2, settings.heroDescription, settings.stat1Value, settings.stat1Label, 
         settings.stat2Value, settings.stat2Label, settings.stat3Value, settings.stat3Label, 
         settings.featuresSectionTitle, settings.featuresSectionDescription, settings.feature1Title, 
         settings.feature1Description, settings.feature2Title, settings.feature2Description, 
         settings.feature3Title, settings.feature3Description, settings.feature4Title, 
         settings.feature4Description, settings.feature5Title, settings.feature5Description, 
         settings.feature6Title, settings.feature6Description, settings.ctaTitle, 
         settings.ctaDescription, settings.backgroundImageLight, settings.backgroundImageDark]
      );
    } finally {
      client.release();
    }
    return settings;
  }

  async getAdminUsers(): Promise<any[]> {
    await this.initializeDatabase();
    const client = await pool.connect();
    try {
      const result = await client.query("SELECT id, username FROM admin_users");
      return result.rows;
    } finally {
      client.release();
    }
  }

  async createAdminUser(username: string, passwordHash: string): Promise<any> {
    await this.initializeDatabase();
    const id = randomUUID();
    const client = await pool.connect();
    try {
      await client.query(
        "INSERT INTO admin_users (id, username, passwordHash) VALUES ($1, $2, $3)",
        [id, username, passwordHash]
      );
      return { id, username };
    } finally {
      client.release();
    }
  }

  async updateAdminUser(id: string, passwordHash: string): Promise<any | undefined> {
    await this.initializeDatabase();
    const client = await pool.connect();
    try {
      await client.query("UPDATE admin_users SET passwordHash = $1 WHERE id = $2", [passwordHash, id]);
      const result = await client.query("SELECT id, username FROM admin_users WHERE id = $1", [id]);
      return result.rows[0];
    } finally {
      client.release();
    }
  }

  async deleteAdminUser(id: string): Promise<boolean> {
    await this.initializeDatabase();
    const client = await pool.connect();
    try {
      const result = await client.query("DELETE FROM admin_users WHERE id = $1", [id]);
      return result.rowCount! > 0;
    } finally {
      client.release();
    }
  }

  async verifyAdminUser(username: string, password: string): Promise<boolean> {
    await this.initializeDatabase();
    const client = await pool.connect();
    try {
      const result = await client.query(
        "SELECT passwordHash FROM admin_users WHERE username = $1",
        [username]
      );
      if (result.rows.length === 0) return false;
      
      const storedHash = result.rows[0].passwordHash;
      const passwordHash = this.hashPassword(password);
      
      try {
        const userBuffer = Buffer.from(storedHash, "hex");
        const passBuffer = Buffer.from(passwordHash, "hex");
        return timingSafeEqual(userBuffer, passBuffer);
      } catch {
        return false;
      }
    } finally {
      client.release();
    }
  }
}

export const storage = new PostgresStorage();
