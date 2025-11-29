import type { Handler } from "@netlify/functions";
import { scryptSync, randomUUID } from "crypto";
import mysql from "mysql2/promise";

const SALT = "phoenix-salt";

function hashPassword(password: string): string {
  return scryptSync(password, SALT, 32).toString("hex");
}

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
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

function getConnectionConfig() {
  const connectionString = process.env.DATABASE_URL;
  const mysqlUser = process.env.MYSQL_USER || "u4_4OW4n62mjZ";
  const mysqlPassword = process.env.MYSQL_PASSWORD || "+3GFoa+x55vSzFL4pnX1=l6F";
  const mysqlHost = process.env.MYSQL_HOST || "panel.sriyannodes.cloud";
  const mysqlPort = parseInt(process.env.MYSQL_PORT || "3306");
  const mysqlDatabase = process.env.MYSQL_DATABASE || "s4_pheonix-cloud";

  // If DATABASE_URL exists but points to PostgreSQL/Neon, ignore it and use MySQL
  if (connectionString && !connectionString.includes("neon") && !connectionString.includes("postgres")) {
    try {
      const urlObj = new URL(connectionString);
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

async function getDb() {
  const config = getConnectionConfig();
  if (!config) return null;
  const pool = mysql.createPool({
    host: config.host,
    port: config.port,
    user: config.user,
    password: config.password,
    database: config.database,
    waitForConnections: true,
    connectionLimit: 1,
    queueLimit: 0,
  });
  
  return pool;
}

async function ensureTables(pool: mysql.Pool) {
  const conn = await pool.getConnection();
  try {
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
      const passwordHash = hashPassword("admin123");
      await conn.query("INSERT INTO admin_users (id, username, passwordHash) VALUES (?, ?, ?)", [adminId, "admin", passwordHash]);
    }
  } finally {
    conn.release();
  }
}

const handler: Handler = async (event, context) => {
  console.log("API Function called:", event.path, event.httpMethod);

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers: corsHeaders(), body: "" };
  }

  const pool = await getDb();
  if (!pool) {
    return jsonResponse(500, { error: "Database not configured" });
  }

  try {
    await ensureTables(pool);

    let rawPath = event.path || "";
    let apiPath = "";
    if (rawPath.includes("/api/")) {
      apiPath = "/" + rawPath.split("/api/")[1];
    } else {
      apiPath = rawPath;
    }

    if (!apiPath.startsWith("/")) {
      apiPath = "/" + apiPath;
    }
    if (apiPath.length > 1 && apiPath.endsWith("/")) {
      apiPath = apiPath.slice(0, -1);
    }

    console.log("Parsed API path:", apiPath);

    const method = event.httpMethod;
    let body: any = {};

    if (event.body) {
      try {
        body = JSON.parse(event.body);
      } catch (e) {
        return jsonResponse(400, { error: "Invalid JSON body" });
      }
    }

    const pathParts = apiPath.split("/").filter(Boolean);
    const conn = await pool.getConnection();

    try {
      // Admin Login
      if (apiPath === "/admin/login" && method === "POST") {
        const { username, password } = body;
        const [result] = await conn.query("SELECT passwordHash FROM admin_users WHERE username = ?", [username]);
        if (Array.isArray(result) && result.length > 0 && (result[0] as any).passwordHash === hashPassword(password)) {
          return jsonResponse(200, { success: true });
        }
        return jsonResponse(401, { error: "Invalid credentials" });
      }

      // Admin Users CRUD
      if (apiPath === "/admin/users" && method === "GET") {
        const [users] = await conn.query("SELECT id, username FROM admin_users");
        return jsonResponse(200, users);
      }

      if (apiPath === "/admin/users" && method === "POST") {
        const { username, password } = body;
        if (!username || !password) {
          return jsonResponse(400, { error: "Username and password required" });
        }
        const id = randomUUID();
        const passwordHash = hashPassword(password);
        await conn.query("INSERT INTO admin_users (id, username, passwordHash) VALUES (?, ?, ?)", [id, username, passwordHash]);
        return jsonResponse(201, { id, username });
      }

      // Categories
      if (apiPath === "/categories" && method === "GET") {
        const [categories] = await conn.query("SELECT * FROM categories");
        const [subcategories] = await conn.query("SELECT * FROM subcategories");
        const result = (categories as any[]).map((cat) => ({
          ...cat,
          subcategories: (subcategories as any[]).filter((sub) => sub.categoryId === cat.id),
        }));
        return jsonResponse(200, result);
      }

      if (apiPath === "/categories" && method === "POST") {
        const { name, slug } = body;
        const id = randomUUID();
        await conn.query("INSERT INTO categories (id, name, slug) VALUES (?, ?, ?)", [id, name, slug]);
        return jsonResponse(201, { id, name, slug });
      }

      // Plans
      if (apiPath === "/plans" && method === "GET") {
        const [rows] = await conn.query("SELECT * FROM plans");
        const plans = (rows as any[]).map((row) => ({
          ...row,
          features: typeof row.features === "string" ? JSON.parse(row.features) : row.features || [],
          popular: Boolean(row.popular),
        }));
        return jsonResponse(200, plans);
      }

      if (apiPath === "/plans" && method === "POST") {
        const { name, description, priceUsd, priceInr, period, features, popular, categoryId, subcategoryId } = body;
        const id = randomUUID();
        await conn.query(
          "INSERT INTO plans (id, name, description, priceUsd, priceInr, period, features, popular, categoryId, subcategoryId) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
          [id, name, description, priceUsd, priceInr, period, JSON.stringify(features), popular || false, categoryId, subcategoryId]
        );
        return jsonResponse(201, { id, ...body });
      }

      // FAQs
      if (apiPath === "/faqs" && method === "GET") {
        const [faqs] = await conn.query("SELECT * FROM faqs");
        return jsonResponse(200, faqs);
      }

      if (apiPath === "/faqs" && method === "POST") {
        const { question, answer } = body;
        const id = randomUUID();
        await conn.query("INSERT INTO faqs (id, question, answer) VALUES (?, ?, ?)", [id, question, answer]);
        return jsonResponse(201, { id, question, answer });
      }

      // Settings
      if (apiPath === "/settings" && method === "GET") {
        const [rows] = await conn.query("SELECT * FROM settings WHERE id = 1");
        const row = (rows as any[])[0] || {};
        return jsonResponse(200, {
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
        });
      }

      if (apiPath === "/settings" && method === "POST") {
        const settings = body;
        await conn.query(
          "UPDATE settings SET currency = ?, supportLink = ?, redirectLink = ?, instagramLink = ?, youtubeLink = ?, email = ?, documentationLink = ?, heroTitleLine1 = ?, heroTitleLine2 = ?, heroDescription = ?, stat1Value = ?, stat1Label = ?, stat2Value = ?, stat2Label = ?, stat3Value = ?, stat3Label = ?, featuresSectionTitle = ?, featuresSectionDescription = ?, feature1Title = ?, feature1Description = ?, feature2Title = ?, feature2Description = ?, feature3Title = ?, feature3Description = ?, feature4Title = ?, feature4Description = ?, feature5Title = ?, feature5Description = ?, feature6Title = ?, feature6Description = ?, ctaTitle = ?, ctaDescription = ?, backgroundImageLight = ?, backgroundImageDark = ? WHERE id = 1",
          [
            settings.currency || "usd",
            settings.supportLink || "",
            settings.redirectLink || "",
            settings.instagramLink || "",
            settings.youtubeLink || "",
            settings.email || "",
            settings.documentationLink || "",
            settings.heroTitleLine1 || "",
            settings.heroTitleLine2 || "",
            settings.heroDescription || "",
            settings.stat1Value || "",
            settings.stat1Label || "",
            settings.stat2Value || "",
            settings.stat2Label || "",
            settings.stat3Value || "",
            settings.stat3Label || "",
            settings.featuresSectionTitle || "",
            settings.featuresSectionDescription || "",
            settings.feature1Title || "",
            settings.feature1Description || "",
            settings.feature2Title || "",
            settings.feature2Description || "",
            settings.feature3Title || "",
            settings.feature3Description || "",
            settings.feature4Title || "",
            settings.feature4Description || "",
            settings.feature5Title || "",
            settings.feature5Description || "",
            settings.feature6Title || "",
            settings.feature6Description || "",
            settings.ctaTitle || "",
            settings.ctaDescription || "",
            settings.backgroundImageLight || "",
            settings.backgroundImageDark || "",
          ]
        );
        return jsonResponse(200, settings);
      }

      return jsonResponse(404, { error: "Not found" });
    } finally {
      conn.release();
      pool.end();
    }
  } catch (error: any) {
    console.error("API Error:", error);
    return jsonResponse(500, { error: error.message || "Internal server error" });
  }
};

export default handler;
