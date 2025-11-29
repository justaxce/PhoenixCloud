import type { Handler } from "@netlify/functions";
import { scryptSync, randomUUID } from "crypto";
import postgres from "postgres";

const SALT = "phoenix-salt";

const connectionString = process.env.DATABASE_URL;

let sql: ReturnType<typeof postgres> | null = null;

function getDb() {
  if (!sql && connectionString) {
    sql = postgres(connectionString, {
      max: 3,
      idle_timeout: 20,
      connect_timeout: 10,
      ssl: 'require',
    });
  }
  return sql;
}

function hashPassword(password: string): string {
  return scryptSync(password, SALT, 32).toString("hex");
}

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
    "Content-Type": "application/json",
  };
}

function jsonResponse(statusCode: number, body: any) {
  return {
    statusCode,
    headers: corsHeaders(),
    body: JSON.stringify(body),
  };
}

async function initializeDatabase() {
  const db = getDb();
  if (!db) return;

  try {
    await db`
      CREATE TABLE IF NOT EXISTS categories (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL UNIQUE
      )
    `;

    await db`
      CREATE TABLE IF NOT EXISTS subcategories (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL UNIQUE,
        categoryId VARCHAR(36) NOT NULL REFERENCES categories(id) ON DELETE CASCADE
      )
    `;

    await db`
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

    await db`
      CREATE TABLE IF NOT EXISTS faqs (
        id VARCHAR(36) PRIMARY KEY,
        question TEXT NOT NULL,
        answer TEXT NOT NULL
      )
    `;

    await db`
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

    await db`
      CREATE TABLE IF NOT EXISTS admin_users (
        id VARCHAR(36) PRIMARY KEY,
        username VARCHAR(255) NOT NULL UNIQUE,
        passwordHash VARCHAR(255) NOT NULL
      )
    `;

    const settings = await db`SELECT * FROM settings WHERE id = 1`;
    if (settings.length === 0) {
      await db`
        INSERT INTO settings (id, currency, supportLink, redirectLink)
        VALUES (1, 'usd', '', '')
      `;
    }

    const existingAdmin = await db`SELECT id FROM admin_users WHERE username = 'admin'`;
    if (existingAdmin.length === 0) {
      const adminId = randomUUID();
      const passwordHash = hashPassword("admin123");
      await db`
        INSERT INTO admin_users (id, username, passwordhash)
        VALUES (${adminId}, 'admin', ${passwordHash})
      `;
    }
  } catch (error: any) {
    console.error("Database initialization error:", error.message);
  }
}

const handler: Handler = async (event: any, context: any) => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers: corsHeaders(), body: "" };
  }

  const db = getDb();
  if (!db) {
    return jsonResponse(500, { error: "Database not configured. Set DATABASE_URL environment variable." });
  }

  await initializeDatabase();

  const pathMatch = event.path.match(/\/api(\/.*)/);
  const apiPath = pathMatch ? pathMatch[1] : event.path.replace("/.netlify/functions/api", "");
  const method = event.httpMethod;

  let body: any = {};
  try {
    body = event.body ? JSON.parse(event.body) : {};
  } catch (e) {
    return jsonResponse(400, { error: "Invalid JSON" });
  }

  const pathParts = apiPath.split("/").filter(Boolean);

  try {
    // Admin Login
    if (apiPath === "/admin/login" && method === "POST") {
      const { username, password } = body;
      const result = await db`SELECT passwordhash FROM admin_users WHERE username = ${username}`;
      if (result.length > 0 && result[0].passwordhash === hashPassword(password)) {
        return jsonResponse(200, { success: true });
      }
      return jsonResponse(401, { error: "Invalid credentials" });
    }

    // Admin Users
    if (apiPath === "/admin/users" && method === "GET") {
      const users = await db`SELECT id, username FROM admin_users`;
      return jsonResponse(200, users);
    }

    if (apiPath === "/admin/users" && method === "POST") {
      const { username, password } = body;
      if (!username || !password) {
        return jsonResponse(400, { error: "Username and password required" });
      }
      const id = randomUUID();
      const passwordHash = hashPassword(password);
      await db`INSERT INTO admin_users (id, username, passwordhash) VALUES (${id}, ${username}, ${passwordHash})`;
      return jsonResponse(201, { id, username });
    }

    if (pathParts[0] === "admin" && pathParts[1] === "users" && pathParts[2] && method === "PATCH") {
      const id = pathParts[2];
      const { password } = body;
      if (!password) {
        return jsonResponse(400, { error: "Password required" });
      }
      const passwordHash = hashPassword(password);
      await db`UPDATE admin_users SET passwordhash = ${passwordHash} WHERE id = ${id}`;
      const result = await db`SELECT id, username FROM admin_users WHERE id = ${id}`;
      return jsonResponse(200, result[0] || { error: "User not found" });
    }

    if (pathParts[0] === "admin" && pathParts[1] === "users" && pathParts[2] && method === "DELETE") {
      const id = pathParts[2];
      await db`DELETE FROM admin_users WHERE id = ${id}`;
      return jsonResponse(200, { success: true });
    }

    // Categories
    if (apiPath === "/categories" && method === "GET") {
      const categories = await db`SELECT * FROM categories`;
      const subcategories = await db`SELECT * FROM subcategories`;
      const result = categories.map((cat: any) => ({
        ...cat,
        subcategories: subcategories.filter((sub: any) => sub.categoryid === cat.id),
      }));
      return jsonResponse(200, result);
    }

    if (apiPath === "/categories" && method === "POST") {
      const { name, slug } = body;
      const id = randomUUID();
      await db`INSERT INTO categories (id, name, slug) VALUES (${id}, ${name}, ${slug})`;
      return jsonResponse(201, { id, name, slug });
    }

    if (pathParts[0] === "categories" && pathParts[1] && method === "PATCH") {
      const id = pathParts[1];
      const { name, slug } = body;
      const result = await db`UPDATE categories SET name = ${name}, slug = ${slug} WHERE id = ${id} RETURNING *`;
      return jsonResponse(200, result[0] || { error: "Category not found" });
    }

    if (pathParts[0] === "categories" && pathParts[1] && method === "DELETE") {
      const id = pathParts[1];
      await db`DELETE FROM categories WHERE id = ${id}`;
      return jsonResponse(200, { success: true });
    }

    // Subcategories
    if (apiPath === "/subcategories" && method === "GET") {
      const subcategories = await db`SELECT * FROM subcategories`;
      return jsonResponse(200, subcategories);
    }

    if (apiPath === "/subcategories" && method === "POST") {
      const { name, slug, categoryId } = body;
      const id = randomUUID();
      await db`INSERT INTO subcategories (id, name, slug, categoryId) VALUES (${id}, ${name}, ${slug}, ${categoryId})`;
      return jsonResponse(201, { id, name, slug, categoryId });
    }

    if (pathParts[0] === "subcategories" && pathParts[1] && method === "PATCH") {
      const id = pathParts[1];
      const { name, slug } = body;
      await db`UPDATE subcategories SET name = ${name}, slug = ${slug} WHERE id = ${id}`;
      const result = await db`SELECT * FROM subcategories WHERE id = ${id}`;
      return jsonResponse(200, result[0] || { error: "Subcategory not found" });
    }

    if (pathParts[0] === "subcategories" && pathParts[1] && method === "DELETE") {
      const id = pathParts[1];
      await db`DELETE FROM subcategories WHERE id = ${id}`;
      return jsonResponse(200, { success: true });
    }

    // Plans
    if (apiPath === "/plans" && method === "GET") {
      const rows = await db`SELECT * FROM plans`;
      const plans = rows.map((row: any) => ({
        ...row,
        features: typeof row.features === "string" ? JSON.parse(row.features) : row.features || [],
        popular: Boolean(row.popular),
      }));
      return jsonResponse(200, plans);
    }

    if (apiPath === "/plans" && method === "POST") {
      const { name, description, priceUsd, priceInr, period, features, popular, categoryId, subcategoryId } = body;
      const id = randomUUID();
      await db`
        INSERT INTO plans (id, name, description, priceUsd, priceInr, period, features, popular, categoryId, subcategoryId)
        VALUES (${id}, ${name}, ${description}, ${priceUsd}, ${priceInr}, ${period}, ${JSON.stringify(features)}, ${popular || false}, ${categoryId}, ${subcategoryId})
      `;
      return jsonResponse(201, { id, ...body });
    }

    if (pathParts[0] === "plans" && pathParts[1] && method === "PATCH") {
      const id = pathParts[1];
      const { name, description, priceUsd, priceInr, period, features, popular, categoryId, subcategoryId } = body;
      await db`
        UPDATE plans SET 
          name = ${name}, description = ${description}, priceUsd = ${priceUsd}, priceInr = ${priceInr},
          period = ${period}, features = ${JSON.stringify(features)}, popular = ${popular || false},
          categoryId = ${categoryId}, subcategoryId = ${subcategoryId}
        WHERE id = ${id}
      `;
      return jsonResponse(200, { id, ...body });
    }

    if (pathParts[0] === "plans" && pathParts[1] && method === "DELETE") {
      const id = pathParts[1];
      await db`DELETE FROM plans WHERE id = ${id}`;
      return jsonResponse(200, { success: true });
    }

    // FAQs
    if (apiPath === "/faqs" && method === "GET") {
      const faqs = await db`SELECT * FROM faqs`;
      return jsonResponse(200, faqs);
    }

    if (apiPath === "/faqs" && method === "POST") {
      const { question, answer } = body;
      const id = randomUUID();
      await db`INSERT INTO faqs (id, question, answer) VALUES (${id}, ${question}, ${answer})`;
      return jsonResponse(201, { id, question, answer });
    }

    if (pathParts[0] === "faqs" && pathParts[1] && method === "PATCH") {
      const id = pathParts[1];
      const { question, answer } = body;
      await db`UPDATE faqs SET question = ${question}, answer = ${answer} WHERE id = ${id}`;
      return jsonResponse(200, { id, question, answer });
    }

    if (pathParts[0] === "faqs" && pathParts[1] && method === "DELETE") {
      const id = pathParts[1];
      await db`DELETE FROM faqs WHERE id = ${id}`;
      return jsonResponse(200, { success: true });
    }

    // Settings
    if (apiPath === "/settings" && method === "GET") {
      const rows = await db`SELECT * FROM settings WHERE id = 1`;
      const row = rows[0] || {};
      return jsonResponse(200, {
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
      });
    }

    if (apiPath === "/settings" && method === "POST") {
      const settings = body;
      await db`
        UPDATE settings SET 
          currency = ${settings.currency},
          supportlink = ${settings.supportLink},
          redirectlink = ${settings.redirectLink},
          instagramlink = ${settings.instagramLink || ""},
          youtubelink = ${settings.youtubeLink || ""},
          email = ${settings.email || ""},
          documentationlink = ${settings.documentationLink || ""},
          herotitleline1 = ${settings.heroTitleLine1 || ""},
          herotitleline2 = ${settings.heroTitleLine2 || ""},
          herodescription = ${settings.heroDescription || ""},
          stat1value = ${settings.stat1Value || ""},
          stat1label = ${settings.stat1Label || ""},
          stat2value = ${settings.stat2Value || ""},
          stat2label = ${settings.stat2Label || ""},
          stat3value = ${settings.stat3Value || ""},
          stat3label = ${settings.stat3Label || ""},
          featuressectiontitle = ${settings.featuresSectionTitle || ""},
          featuressectiondescription = ${settings.featuresSectionDescription || ""},
          feature1title = ${settings.feature1Title || ""},
          feature1description = ${settings.feature1Description || ""},
          feature2title = ${settings.feature2Title || ""},
          feature2description = ${settings.feature2Description || ""},
          feature3title = ${settings.feature3Title || ""},
          feature3description = ${settings.feature3Description || ""},
          feature4title = ${settings.feature4Title || ""},
          feature4description = ${settings.feature4Description || ""},
          feature5title = ${settings.feature5Title || ""},
          feature5description = ${settings.feature5Description || ""},
          feature6title = ${settings.feature6Title || ""},
          feature6description = ${settings.feature6Description || ""},
          ctatitle = ${settings.ctaTitle || ""},
          ctadescription = ${settings.ctaDescription || ""},
          backgroundimagelight = ${settings.backgroundImageLight || ""},
          backgroundimagedark = ${settings.backgroundImageDark || ""}
        WHERE id = 1
      `;
      return jsonResponse(200, settings);
    }

    return jsonResponse(404, { error: "Not found", path: apiPath, method });
  } catch (error: any) {
    console.error("API Error:", error);
    return jsonResponse(500, { error: error.message || "Internal server error" });
  }
};

export default handler;
