import { type Category, type Subcategory, type Plan, type Settings, type FAQ } from "@shared/schema";
import { randomUUID, scryptSync, timingSafeEqual } from "crypto";

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

import postgres from "postgres";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("ERROR: DATABASE_URL not set");
  process.exit(1);
}

// Create SQL client
let sql: any;
try {
  sql = postgres(connectionString, { 
    max: 3,
    idle_timeout: 30,
    connect_timeout: 10,
  });
} catch (error) {
  console.error("Failed to connect to database:", error);
  process.exit(1);
}

export class PostgresStorage implements IStorage {
  private initialized = false;

  private hashPassword(password: string): string {
    const salt = "phoenix-salt";
    return scryptSync(password, salt, 32).toString("hex");
  }

  async initializeDatabase(): Promise<void> {
    if (this.initialized) return;
    
    try {
      console.log("Initializing PostgreSQL database...");
      
      // Create tables
      await sql`
        CREATE TABLE IF NOT EXISTS categories (
          id VARCHAR(36) PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          slug VARCHAR(255) NOT NULL UNIQUE
        )
      `;
      
      await sql`
        CREATE TABLE IF NOT EXISTS subcategories (
          id VARCHAR(36) PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          slug VARCHAR(255) NOT NULL UNIQUE,
          categoryId VARCHAR(36) NOT NULL REFERENCES categories(id) ON DELETE CASCADE
        )
      `;
      
      await sql`
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
        )
      `;
      
      await sql`
        CREATE TABLE IF NOT EXISTS faqs (
          id VARCHAR(36) PRIMARY KEY,
          question TEXT NOT NULL,
          answer TEXT NOT NULL
        )
      `;
      
      await sql`
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
      `;
      
      await sql`
        CREATE TABLE IF NOT EXISTS admin_users (
          id VARCHAR(36) PRIMARY KEY,
          username VARCHAR(255) NOT NULL UNIQUE,
          passwordHash VARCHAR(255) NOT NULL
        )
      `;

      // Initialize default settings
      const settings = await sql`SELECT * FROM settings WHERE id = 1`;
      if (settings.length === 0) {
        await sql`
          INSERT INTO settings (id, currency, supportLink, redirectLink)
          VALUES (1, 'usd', '', '')
        `;
      }

      // Initialize default admin user - check if exists first to avoid race condition
      const existingAdmin = await sql`SELECT id FROM admin_users WHERE username = 'admin'`;
      if (existingAdmin.length === 0) {
        const adminId = randomUUID();
        const passwordHash = this.hashPassword("admin123");
        await sql`
          INSERT INTO admin_users (id, username, passwordhash)
          VALUES (${adminId}, 'admin', ${passwordHash})
        `;
        console.log("✅ Created default admin user: admin / admin123");
      }

      console.log("✅ PostgreSQL database initialized successfully!");
      this.initialized = true;
    } catch (error: any) {
      console.error("Database initialization error:", error.message);
      throw error;
    }
  }

  async getCategories(): Promise<Category[]> {
    await this.initializeDatabase();
    return sql`SELECT * FROM categories`;
  }

  async getCategory(id: string): Promise<Category | undefined> {
    await this.initializeDatabase();
    const result = await sql`SELECT * FROM categories WHERE id = ${id}`;
    return result[0];
  }

  async createCategory(name: string, slug: string): Promise<Category> {
    await this.initializeDatabase();
    const id = randomUUID();
    await sql`INSERT INTO categories (id, name, slug) VALUES (${id}, ${name}, ${slug})`;
    return { id, name, slug };
  }

  async updateCategory(id: string, name: string, slug: string): Promise<Category | undefined> {
    await this.initializeDatabase();
    const result = await sql`UPDATE categories SET name = ${name}, slug = ${slug} WHERE id = ${id} RETURNING *`;
    return result[0];
  }

  async deleteCategory(id: string): Promise<boolean> {
    await this.initializeDatabase();
    const result = await sql`DELETE FROM categories WHERE id = ${id}`;
    return result.count > 0;
  }

  async getSubcategories(): Promise<Subcategory[]> {
    await this.initializeDatabase();
    return sql`SELECT * FROM subcategories`;
  }

  async getSubcategoriesByCategory(categoryId: string): Promise<Subcategory[]> {
    await this.initializeDatabase();
    return sql`SELECT * FROM subcategories WHERE categoryId = ${categoryId}`;
  }

  async createSubcategory(name: string, slug: string, categoryId: string): Promise<Subcategory> {
    await this.initializeDatabase();
    const id = randomUUID();
    await sql`INSERT INTO subcategories (id, name, slug, categoryId) VALUES (${id}, ${name}, ${slug}, ${categoryId})`;
    return { id, name, slug, categoryId };
  }

  async updateSubcategory(id: string, name: string, slug: string): Promise<Subcategory | undefined> {
    await this.initializeDatabase();
    const existing = await sql`SELECT categoryId FROM subcategories WHERE id = ${id}`;
    if (existing.length === 0) return undefined;
    const categoryId = existing[0].categoryId;
    await sql`UPDATE subcategories SET name = ${name}, slug = ${slug} WHERE id = ${id}`;
    return { id, name, slug, categoryId };
  }

  async deleteSubcategory(id: string): Promise<boolean> {
    await this.initializeDatabase();
    const result = await sql`DELETE FROM subcategories WHERE id = ${id}`;
    return result.count > 0;
  }

  async getPlans(): Promise<Plan[]> {
    await this.initializeDatabase();
    const rows = await sql`SELECT * FROM plans`;
    return rows.map((row: any) => ({
      ...row,
      features: typeof row.features === "string" ? JSON.parse(row.features) : row.features || [],
      popular: Boolean(row.popular),
    }));
  }

  async getPlansBySubcategory(subcategoryId: string): Promise<Plan[]> {
    await this.initializeDatabase();
    const rows = await sql`SELECT * FROM plans WHERE subcategoryId = ${subcategoryId}`;
    return rows.map((row: any) => ({
      ...row,
      features: typeof row.features === "string" ? JSON.parse(row.features) : row.features || [],
      popular: Boolean(row.popular),
    }));
  }

  async createPlan(plan: Omit<Plan, "id">): Promise<Plan> {
    await this.initializeDatabase();
    const id = randomUUID();
    await sql`
      INSERT INTO plans (id, name, description, priceUsd, priceInr, period, features, popular, categoryId, subcategoryId)
      VALUES (${id}, ${plan.name}, ${plan.description}, ${plan.priceUsd}, ${plan.priceInr}, ${plan.period}, 
              ${JSON.stringify(plan.features)}, ${plan.popular || false}, ${plan.categoryId}, ${plan.subcategoryId})
    `;
    return { ...plan, id };
  }

  async updatePlan(id: string, updates: Partial<Plan>): Promise<Plan | undefined> {
    await this.initializeDatabase();
    const existing = await sql`SELECT * FROM plans WHERE id = ${id}`;
    if (existing.length === 0) return undefined;
    
    const current = existing[0];
    await sql`
      UPDATE plans SET 
        name = ${updates.name || current.name},
        description = ${updates.description || current.description},
        priceUsd = ${updates.priceUsd || current.priceUsd},
        priceInr = ${updates.priceInr || current.priceInr},
        period = ${updates.period || current.period},
        features = ${updates.features ? JSON.stringify(updates.features) : current.features},
        popular = ${updates.popular !== undefined ? updates.popular : current.popular},
        categoryId = ${updates.categoryId || current.categoryId},
        subcategoryId = ${updates.subcategoryId || current.subcategoryId}
      WHERE id = ${id}
    `;
    
    return { ...current, ...updates };
  }

  async deletePlan(id: string): Promise<boolean> {
    await this.initializeDatabase();
    const result = await sql`DELETE FROM plans WHERE id = ${id}`;
    return result.count > 0;
  }

  async getFAQs(): Promise<FAQ[]> {
    await this.initializeDatabase();
    return sql`SELECT * FROM faqs`;
  }

  async createFAQ(question: string, answer: string): Promise<FAQ> {
    await this.initializeDatabase();
    const id = randomUUID();
    await sql`INSERT INTO faqs (id, question, answer) VALUES (${id}, ${question}, ${answer})`;
    return { id, question, answer };
  }

  async updateFAQ(id: string, question: string, answer: string): Promise<FAQ | undefined> {
    await this.initializeDatabase();
    const result = await sql`UPDATE faqs SET question = ${question}, answer = ${answer} WHERE id = ${id} RETURNING *`;
    return result[0];
  }

  async deleteFAQ(id: string): Promise<boolean> {
    await this.initializeDatabase();
    const result = await sql`DELETE FROM faqs WHERE id = ${id}`;
    return result.count > 0;
  }

  async getSettings(): Promise<Settings> {
    await this.initializeDatabase();
    const rows = await sql`SELECT * FROM settings WHERE id = 1`;
    const row = rows[0] || {};
    // PostgreSQL returns lowercase column names
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
  }

  async updateSettings(settings: Settings): Promise<Settings> {
    await this.initializeDatabase();
    await sql`
      UPDATE settings SET 
        currency = ${settings.currency},
        supportlink = ${settings.supportLink},
        redirectlink = ${settings.redirectLink},
        instagramlink = ${settings.instagramLink},
        youtubelink = ${settings.youtubeLink},
        email = ${settings.email},
        documentationlink = ${settings.documentationLink},
        herotitleline1 = ${settings.heroTitleLine1},
        herotitleline2 = ${settings.heroTitleLine2},
        herodescription = ${settings.heroDescription},
        stat1value = ${settings.stat1Value},
        stat1label = ${settings.stat1Label},
        stat2value = ${settings.stat2Value},
        stat2label = ${settings.stat2Label},
        stat3value = ${settings.stat3Value},
        stat3label = ${settings.stat3Label},
        featuressectiontitle = ${settings.featuresSectionTitle},
        featuressectiondescription = ${settings.featuresSectionDescription},
        feature1title = ${settings.feature1Title},
        feature1description = ${settings.feature1Description},
        feature2title = ${settings.feature2Title},
        feature2description = ${settings.feature2Description},
        feature3title = ${settings.feature3Title},
        feature3description = ${settings.feature3Description},
        feature4title = ${settings.feature4Title},
        feature4description = ${settings.feature4Description},
        feature5title = ${settings.feature5Title},
        feature5description = ${settings.feature5Description},
        feature6title = ${settings.feature6Title},
        feature6description = ${settings.feature6Description},
        ctatitle = ${settings.ctaTitle},
        ctadescription = ${settings.ctaDescription},
        backgroundimagelight = ${settings.backgroundImageLight},
        backgroundimagedark = ${settings.backgroundImageDark}
      WHERE id = 1
    `;
    return settings;
  }

  async getAdminUsers(): Promise<any[]> {
    await this.initializeDatabase();
    return sql`SELECT id, username FROM admin_users`;
  }

  async createAdminUser(username: string, passwordHash: string): Promise<any> {
    await this.initializeDatabase();
    const id = randomUUID();
    await sql`INSERT INTO admin_users (id, username, passwordhash) VALUES (${id}, ${username}, ${passwordHash})`;
    return { id, username };
  }

  async updateAdminUser(id: string, passwordHash: string): Promise<any | undefined> {
    await this.initializeDatabase();
    await sql`UPDATE admin_users SET passwordhash = ${passwordHash} WHERE id = ${id}`;
    const result = await sql`SELECT id, username FROM admin_users WHERE id = ${id}`;
    return result[0];
  }

  async deleteAdminUser(id: string): Promise<boolean> {
    await this.initializeDatabase();
    const result = await sql`DELETE FROM admin_users WHERE id = ${id}`;
    return result.count > 0;
  }

  async verifyAdminUser(username: string, password: string): Promise<boolean> {
    try {
      await this.initializeDatabase();
      console.log(`[AUTH] Looking up user: ${username}`);
      
      // PostgreSQL returns lowercase column names
      const result = await sql`SELECT passwordhash FROM admin_users WHERE username = ${username}`;
      console.log(`[AUTH] Query returned ${result.length} results`);
      
      if (result.length === 0) {
        console.log(`[AUTH] User ${username} not found in database`);
        return false;
      }
      
      // Use lowercase 'passwordhash' to match PostgreSQL column name
      const storedHash = result[0].passwordhash;
      const passwordHash = this.hashPassword(password);
      
      console.log(`[AUTH] Username: ${username}`);
      console.log(`[AUTH] Stored hash: ${storedHash?.substring(0, 20)}...`);
      console.log(`[AUTH] Input hash: ${passwordHash.substring(0, 20)}...`);
      console.log(`[AUTH] Hashes match: ${storedHash === passwordHash}`);
      
      if (storedHash === passwordHash) {
        console.log(`[AUTH] ✅ Password verification successful`);
        return true;
      }
      
      console.log(`[AUTH] ❌ Password mismatch`);
      return false;
    } catch (error) {
      console.error(`[AUTH] Error in verifyAdminUser:`, error);
      return false;
    }
  }
}

export const storage = new PostgresStorage();
