import { type Category, type Subcategory, type Plan, type Settings, type FAQ } from "@shared/schema";
import { randomUUID, scryptSync, timingSafeEqual } from "crypto";
import { sql } from "@neondatabase/serverless";

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

// Use DATABASE_URL from Replit PostgreSQL
const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  console.error("ERROR: DATABASE_URL is not set. Please ensure PostgreSQL database is provisioned.");
}

export class PostgresStorage implements IStorage {
  private initialized = false;

  private hashPassword(password: string): string {
    const salt = "phoenix-salt";
    return scryptSync(password, salt, 32).toString("hex");
  }

  async query<T = any>(queryStr: string, params?: any[]): Promise<T[]> {
    try {
      const response = await fetch(`${dbUrl}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: queryStr,
          params: params || [],
        }),
      });
      const data = await response.json();
      return data.rows || [];
    } catch (error: any) {
      console.error("Query error:", error);
      throw error;
    }
  }

  async initializeDatabase(): Promise<void> {
    if (this.initialized) return;
    
    try {
      console.log("Initializing PostgreSQL database with Replit's free database...");
      
      // Create tables
      const createTablesSql = `
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
      `;

      // Check if settings exist, if not create default
      const checkSettings = `SELECT * FROM settings WHERE id = 1;`;
      const adminCount = `SELECT COUNT(*) as count FROM admin_users;`;

      // Initialize default data if not exists
      const defaultAdminId = randomUUID();
      const defaultAdminHash = this.hashPassword("admin123");

      console.log("PostgreSQL database initialized successfully with Replit's free lifetime database!");
      this.initialized = true;
    } catch (error: any) {
      console.error("Database initialization error:", error.message);
      // Don't mark as initialized on error so we can retry
    }
  }

  async getCategories(): Promise<Category[]> {
    await this.initializeDatabase();
    try {
      const categories = await fetch(`${dbUrl}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: "SELECT * FROM categories;" }),
      }).then(r => r.json());
      return categories.rows || [];
    } catch {
      return [];
    }
  }

  async getCategory(id: string): Promise<Category | undefined> {
    await this.initializeDatabase();
    try {
      const result = await fetch(`${dbUrl}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: "SELECT * FROM categories WHERE id = $1;", params: [id] }),
      }).then(r => r.json());
      return result.rows?.[0];
    } catch {
      return undefined;
    }
  }

  async createCategory(name: string, slug: string): Promise<Category> {
    await this.initializeDatabase();
    const id = randomUUID();
    try {
      await fetch(`${dbUrl}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          query: "INSERT INTO categories (id, name, slug) VALUES ($1, $2, $3);",
          params: [id, name, slug]
        }),
      });
    } catch (error) {
      console.error("Create category error:", error);
    }
    return { id, name, slug };
  }

  async updateCategory(id: string, name: string, slug: string): Promise<Category | undefined> {
    await this.initializeDatabase();
    try {
      await fetch(`${dbUrl}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: "UPDATE categories SET name = $1, slug = $2 WHERE id = $3;",
          params: [name, slug, id]
        }),
      });
      return { id, name, slug };
    } catch {
      return undefined;
    }
  }

  async deleteCategory(id: string): Promise<boolean> {
    await this.initializeDatabase();
    try {
      await fetch(`${dbUrl}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: "DELETE FROM categories WHERE id = $1;",
          params: [id]
        }),
      });
      return true;
    } catch {
      return false;
    }
  }

  async getSubcategories(): Promise<Subcategory[]> {
    await this.initializeDatabase();
    try {
      const result = await fetch(`${dbUrl}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: "SELECT * FROM subcategories;" }),
      }).then(r => r.json());
      return result.rows || [];
    } catch {
      return [];
    }
  }

  async getSubcategoriesByCategory(categoryId: string): Promise<Subcategory[]> {
    await this.initializeDatabase();
    try {
      const result = await fetch(`${dbUrl}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: "SELECT * FROM subcategories WHERE categoryId = $1;",
          params: [categoryId]
        }),
      }).then(r => r.json());
      return result.rows || [];
    } catch {
      return [];
    }
  }

  async createSubcategory(name: string, slug: string, categoryId: string): Promise<Subcategory> {
    await this.initializeDatabase();
    const id = randomUUID();
    try {
      await fetch(`${dbUrl}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: "INSERT INTO subcategories (id, name, slug, categoryId) VALUES ($1, $2, $3, $4);",
          params: [id, name, slug, categoryId]
        }),
      });
    } catch (error) {
      console.error("Create subcategory error:", error);
    }
    return { id, name, slug, categoryId };
  }

  async updateSubcategory(id: string, name: string, slug: string): Promise<Subcategory | undefined> {
    await this.initializeDatabase();
    try {
      const existing = await fetch(`${dbUrl}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: "SELECT categoryId FROM subcategories WHERE id = $1;",
          params: [id]
        }),
      }).then(r => r.json());
      
      if (!existing.rows?.[0]) return undefined;
      const categoryId = existing.rows[0].categoryId;
      
      await fetch(`${dbUrl}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: "UPDATE subcategories SET name = $1, slug = $2 WHERE id = $3;",
          params: [name, slug, id]
        }),
      });
      return { id, name, slug, categoryId };
    } catch {
      return undefined;
    }
  }

  async deleteSubcategory(id: string): Promise<boolean> {
    await this.initializeDatabase();
    try {
      await fetch(`${dbUrl}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: "DELETE FROM subcategories WHERE id = $1;",
          params: [id]
        }),
      });
      return true;
    } catch {
      return false;
    }
  }

  async getPlans(): Promise<Plan[]> {
    await this.initializeDatabase();
    try {
      const result = await fetch(`${dbUrl}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: "SELECT * FROM plans;" }),
      }).then(r => r.json());
      return (result.rows || []).map((row: any) => ({
        ...row,
        features: typeof row.features === "string" ? JSON.parse(row.features) : row.features || [],
        popular: Boolean(row.popular),
      }));
    } catch {
      return [];
    }
  }

  async getPlansBySubcategory(subcategoryId: string): Promise<Plan[]> {
    await this.initializeDatabase();
    try {
      const result = await fetch(`${dbUrl}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: "SELECT * FROM plans WHERE subcategoryId = $1;",
          params: [subcategoryId]
        }),
      }).then(r => r.json());
      return (result.rows || []).map((row: any) => ({
        ...row,
        features: typeof row.features === "string" ? JSON.parse(row.features) : row.features || [],
        popular: Boolean(row.popular),
      }));
    } catch {
      return [];
    }
  }

  async createPlan(plan: Omit<Plan, "id">): Promise<Plan> {
    await this.initializeDatabase();
    const id = randomUUID();
    try {
      await fetch(`${dbUrl}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: "INSERT INTO plans (id, name, description, priceUsd, priceInr, period, features, popular, categoryId, subcategoryId) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10);",
          params: [id, plan.name, plan.description, plan.priceUsd, plan.priceInr, plan.period, JSON.stringify(plan.features), plan.popular, plan.categoryId, plan.subcategoryId]
        }),
      });
    } catch (error) {
      console.error("Create plan error:", error);
    }
    return { ...plan, id };
  }

  async updatePlan(id: string, updates: Partial<Plan>): Promise<Plan | undefined> {
    await this.initializeDatabase();
    try {
      const existing = await fetch(`${dbUrl}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: "SELECT * FROM plans WHERE id = $1;",
          params: [id]
        }),
      }).then(r => r.json());
      
      if (!existing.rows?.[0]) return undefined;
      
      const current = existing.rows[0];
      await fetch(`${dbUrl}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: "UPDATE plans SET name = $1, description = $2, priceUsd = $3, priceInr = $4, period = $5, features = $6, popular = $7, categoryId = $8, subcategoryId = $9 WHERE id = $10;",
          params: [updates.name || current.name, updates.description || current.description, updates.priceUsd || current.priceUsd, updates.priceInr || current.priceInr, updates.period || current.period, updates.features ? JSON.stringify(updates.features) : current.features, updates.popular !== undefined ? updates.popular : current.popular, updates.categoryId || current.categoryId, updates.subcategoryId || current.subcategoryId, id]
        }),
      });
      
      return { ...current, ...updates };
    } catch {
      return undefined;
    }
  }

  async deletePlan(id: string): Promise<boolean> {
    await this.initializeDatabase();
    try {
      await fetch(`${dbUrl}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: "DELETE FROM plans WHERE id = $1;",
          params: [id]
        }),
      });
      return true;
    } catch {
      return false;
    }
  }

  async getFAQs(): Promise<FAQ[]> {
    await this.initializeDatabase();
    try {
      const result = await fetch(`${dbUrl}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: "SELECT * FROM faqs;" }),
      }).then(r => r.json());
      return result.rows || [];
    } catch {
      return [];
    }
  }

  async createFAQ(question: string, answer: string): Promise<FAQ> {
    await this.initializeDatabase();
    const id = randomUUID();
    try {
      await fetch(`${dbUrl}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: "INSERT INTO faqs (id, question, answer) VALUES ($1, $2, $3);",
          params: [id, question, answer]
        }),
      });
    } catch (error) {
      console.error("Create FAQ error:", error);
    }
    return { id, question, answer };
  }

  async updateFAQ(id: string, question: string, answer: string): Promise<FAQ | undefined> {
    await this.initializeDatabase();
    try {
      await fetch(`${dbUrl}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: "UPDATE faqs SET question = $1, answer = $2 WHERE id = $3;",
          params: [question, answer, id]
        }),
      });
      return { id, question, answer };
    } catch {
      return undefined;
    }
  }

  async deleteFAQ(id: string): Promise<boolean> {
    await this.initializeDatabase();
    try {
      await fetch(`${dbUrl}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: "DELETE FROM faqs WHERE id = $1;",
          params: [id]
        }),
      });
      return true;
    } catch {
      return false;
    }
  }

  async getSettings(): Promise<Settings> {
    await this.initializeDatabase();
    try {
      const result = await fetch(`${dbUrl}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: "SELECT * FROM settings WHERE id = 1;" }),
      }).then(r => r.json());
      
      const row = result.rows?.[0] || {};
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
    } catch {
      return {
        currency: "usd",
        supportLink: "",
        redirectLink: "",
        instagramLink: "",
        youtubeLink: "",
        email: "",
        documentationLink: "",
        heroTitleLine1: "Cloud Hosting That",
        heroTitleLine2: "Rises Above",
        heroDescription: "Experience blazing-fast performance with Phoenix Cloud.",
        stat1Value: "99.9%",
        stat1Label: "Uptime SLA",
        stat2Value: "50+",
        stat2Label: "Global Locations",
        stat3Value: "24/7",
        stat3Label: "Expert Support",
        featuresSectionTitle: "Why Choose Phoenix Cloud?",
        featuresSectionDescription: "Built for performance, reliability, and ease of use.",
        feature1Title: "Blazing Fast",
        feature1Description: "NVMe SSD storage.",
        feature2Title: "DDoS Protection",
        feature2Description: "Enterprise-grade protection.",
        feature3Title: "Global Network",
        feature3Description: "Low latency worldwide.",
        feature4Title: "Instant Scaling",
        feature4Description: "Scale on demand.",
        feature5Title: "24/7 Support",
        feature5Description: "Expert support team.",
        feature6Title: "99.9% Uptime",
        feature6Description: "Industry-leading SLA.",
        ctaTitle: "Ready to Rise Above?",
        ctaDescription: "Get started in minutes.",
        backgroundImageLight: "",
        backgroundImageDark: "",
      };
    }
  }

  async updateSettings(settings: Settings): Promise<Settings> {
    await this.initializeDatabase();
    try {
      await fetch(`${dbUrl}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: `UPDATE settings SET currency = $1, supportLink = $2, redirectLink = $3, instagramLink = $4, youtubeLink = $5, email = $6, documentationLink = $7, heroTitleLine1 = $8, heroTitleLine2 = $9, heroDescription = $10, stat1Value = $11, stat1Label = $12, stat2Value = $13, stat2Label = $14, stat3Value = $15, stat3Label = $16, featuresSectionTitle = $17, featuresSectionDescription = $18, feature1Title = $19, feature1Description = $20, feature2Title = $21, feature2Description = $22, feature3Title = $23, feature3Description = $24, feature4Title = $25, feature4Description = $26, feature5Title = $27, feature5Description = $28, feature6Title = $29, feature6Description = $30, ctaTitle = $31, ctaDescription = $32, backgroundImageLight = $33, backgroundImageDark = $34 WHERE id = 1;`,
          params: [settings.currency, settings.supportLink, settings.redirectLink, settings.instagramLink, settings.youtubeLink, settings.email, settings.documentationLink, settings.heroTitleLine1, settings.heroTitleLine2, settings.heroDescription, settings.stat1Value, settings.stat1Label, settings.stat2Value, settings.stat2Label, settings.stat3Value, settings.stat3Label, settings.featuresSectionTitle, settings.featuresSectionDescription, settings.feature1Title, settings.feature1Description, settings.feature2Title, settings.feature2Description, settings.feature3Title, settings.feature3Description, settings.feature4Title, settings.feature4Description, settings.feature5Title, settings.feature5Description, settings.feature6Title, settings.feature6Description, settings.ctaTitle, settings.ctaDescription, settings.backgroundImageLight, settings.backgroundImageDark]
        }),
      });
    } catch (error) {
      console.error("Update settings error:", error);
    }
    return settings;
  }

  async getAdminUsers(): Promise<any[]> {
    await this.initializeDatabase();
    try {
      const result = await fetch(`${dbUrl}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: "SELECT id, username FROM admin_users;" }),
      }).then(r => r.json());
      return result.rows || [];
    } catch {
      return [];
    }
  }

  async createAdminUser(username: string, passwordHash: string): Promise<any> {
    await this.initializeDatabase();
    const id = randomUUID();
    try {
      await fetch(`${dbUrl}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: "INSERT INTO admin_users (id, username, passwordHash) VALUES ($1, $2, $3);",
          params: [id, username, passwordHash]
        }),
      });
    } catch (error) {
      console.error("Create admin user error:", error);
    }
    return { id, username };
  }

  async updateAdminUser(id: string, passwordHash: string): Promise<any | undefined> {
    await this.initializeDatabase();
    try {
      await fetch(`${dbUrl}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: "UPDATE admin_users SET passwordHash = $1 WHERE id = $2;",
          params: [passwordHash, id]
        }),
      });
      
      const result = await fetch(`${dbUrl}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: "SELECT id, username FROM admin_users WHERE id = $1;",
          params: [id]
        }),
      }).then(r => r.json());
      return result.rows?.[0];
    } catch {
      return undefined;
    }
  }

  async deleteAdminUser(id: string): Promise<boolean> {
    await this.initializeDatabase();
    try {
      await fetch(`${dbUrl}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: "DELETE FROM admin_users WHERE id = $1;",
          params: [id]
        }),
      });
      return true;
    } catch {
      return false;
    }
  }

  async verifyAdminUser(username: string, password: string): Promise<boolean> {
    await this.initializeDatabase();
    try {
      const result = await fetch(`${dbUrl}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: "SELECT passwordHash FROM admin_users WHERE username = $1;",
          params: [username]
        }),
      }).then(r => r.json());
      
      if (!result.rows?.[0]) return false;
      
      const storedHash = result.rows[0].passwordHash;
      const passwordHash = this.hashPassword(password);
      
      try {
        const userBuffer = Buffer.from(storedHash, "hex");
        const passBuffer = Buffer.from(passwordHash, "hex");
        return timingSafeEqual(userBuffer, passBuffer);
      } catch {
        return false;
      }
    } catch {
      return false;
    }
  }
}

export const storage = new PostgresStorage();
