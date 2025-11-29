import type { Handler, HandlerEvent, HandlerContext } from "@netlify/functions";
import { scryptSync, randomUUID } from "crypto";

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

// Use serverless-mysql which is designed for serverless environments
const serverlessMysql = require("serverless-mysql");

const mysql = serverlessMysql({
  config: {
    host: process.env.MYSQL_HOST || "panel.sriyannodes.cloud",
    port: parseInt(process.env.MYSQL_PORT || "3306"),
    user: process.env.MYSQL_USER || "u4_4OW4n62mjZ",
    password: process.env.MYSQL_PASSWORD || "+3GFoa+x55vSzFL4pnX1=l6F",
    database: process.env.MYSQL_DATABASE || "s4_pheonix-cloud",
  },
});

async function query(sql: string, values?: any[]) {
  return await mysql.query(sql, values);
}

async function ensureTables() {
  await query(`
    CREATE TABLE IF NOT EXISTS categories (
      id VARCHAR(36) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      slug VARCHAR(255) NOT NULL UNIQUE
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS subcategories (
      id VARCHAR(36) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      slug VARCHAR(255) NOT NULL UNIQUE,
      categoryId VARCHAR(36) NOT NULL
    )
  `);

  await query(`
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

  await query(`
    CREATE TABLE IF NOT EXISTS faqs (
      id VARCHAR(36) PRIMARY KEY,
      question TEXT NOT NULL,
      answer TEXT NOT NULL
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS settings (
      id INT PRIMARY KEY,
      currency VARCHAR(10) DEFAULT 'usd',
      supportLink TEXT,
      redirectLink TEXT,
      instagramLink TEXT,
      youtubeLink TEXT,
      email TEXT,
      documentationLink TEXT,
      heroTitleLine1 TEXT,
      heroTitleLine2 TEXT,
      heroDescription TEXT,
      stat1Value VARCHAR(50),
      stat1Label VARCHAR(100),
      stat2Value VARCHAR(50),
      stat2Label VARCHAR(100),
      stat3Value VARCHAR(50),
      stat3Label VARCHAR(100),
      featuresSectionTitle TEXT,
      featuresSectionDescription TEXT,
      feature1Title TEXT,
      feature1Description TEXT,
      feature2Title TEXT,
      feature2Description TEXT,
      feature3Title TEXT,
      feature3Description TEXT,
      feature4Title TEXT,
      feature4Description TEXT,
      feature5Title TEXT,
      feature5Description TEXT,
      feature6Title TEXT,
      feature6Description TEXT,
      ctaTitle TEXT,
      ctaDescription TEXT,
      backgroundImageLight TEXT,
      backgroundImageDark TEXT
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS admin_users (
      id VARCHAR(36) PRIMARY KEY,
      username VARCHAR(255) NOT NULL UNIQUE,
      passwordHash VARCHAR(255) NOT NULL
    )
  `);

  // Insert default settings if not exists
  const existingSettings = await query("SELECT id FROM settings WHERE id = 1");
  if (!existingSettings || existingSettings.length === 0) {
    await query("INSERT INTO settings (id, currency, supportLink, redirectLink) VALUES (1, 'usd', '', '')");
  }

  // Insert default admin if not exists
  const existingAdmin = await query("SELECT id FROM admin_users WHERE username = 'admin'");
  if (!existingAdmin || existingAdmin.length === 0) {
    const adminId = randomUUID();
    const passwordHash = hashPassword("admin123");
    await query("INSERT INTO admin_users (id, username, passwordHash) VALUES (?, ?, ?)", [adminId, "admin", passwordHash]);
  }
}

const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  console.log("API Function called:", event.path, event.httpMethod);

  // Handle CORS preflight
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers: corsHeaders(), body: "" };
  }

  try {
    // Initialize tables
    await ensureTables();

    // Parse the API path
    let rawPath = event.path || "";
    let apiPath = "";
    if (rawPath.includes("/api/")) {
      apiPath = "/" + rawPath.split("/api/")[1];
    } else if (rawPath.includes("/.netlify/functions/api")) {
      apiPath = rawPath.replace("/.netlify/functions/api", "");
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

    // Admin Login
    if (apiPath === "/admin/login" && method === "POST") {
      const { username, password } = body;
      const result = await query("SELECT passwordHash FROM admin_users WHERE username = ?", [username]);
      if (Array.isArray(result) && result.length > 0 && result[0].passwordHash === hashPassword(password)) {
        await mysql.end();
        return jsonResponse(200, { success: true });
      }
      await mysql.end();
      return jsonResponse(401, { error: "Invalid credentials" });
    }

    // Admin Users CRUD
    if (apiPath === "/admin/users" && method === "GET") {
      const users = await query("SELECT id, username FROM admin_users");
      await mysql.end();
      return jsonResponse(200, users || []);
    }

    if (apiPath === "/admin/users" && method === "POST") {
      const { username, password } = body;
      if (!username || !password) {
        await mysql.end();
        return jsonResponse(400, { error: "Username and password required" });
      }
      const id = randomUUID();
      const passwordHash = hashPassword(password);
      await query("INSERT INTO admin_users (id, username, passwordHash) VALUES (?, ?, ?)", [id, username, passwordHash]);
      await mysql.end();
      return jsonResponse(201, { id, username });
    }

    // Delete admin user
    if (apiPath.startsWith("/admin/users/") && method === "DELETE") {
      const id = apiPath.split("/admin/users/")[1];
      await query("DELETE FROM admin_users WHERE id = ?", [id]);
      await mysql.end();
      return jsonResponse(200, { success: true });
    }

    // Categories
    if (apiPath === "/categories" && method === "GET") {
      const categories = await query("SELECT * FROM categories");
      const subcategories = await query("SELECT * FROM subcategories");
      const result = (categories || []).map((cat: any) => ({
        ...cat,
        subcategories: (subcategories || []).filter((sub: any) => sub.categoryId === cat.id),
      }));
      await mysql.end();
      return jsonResponse(200, result);
    }

    if (apiPath === "/categories" && method === "POST") {
      const { name, slug } = body;
      const id = randomUUID();
      await query("INSERT INTO categories (id, name, slug) VALUES (?, ?, ?)", [id, name, slug]);
      await mysql.end();
      return jsonResponse(201, { id, name, slug });
    }

    if (apiPath.startsWith("/categories/") && method === "DELETE") {
      const id = apiPath.split("/categories/")[1];
      await query("DELETE FROM categories WHERE id = ?", [id]);
      await mysql.end();
      return jsonResponse(200, { success: true });
    }

    // Subcategories
    if (apiPath === "/subcategories" && method === "GET") {
      const subcategories = await query("SELECT * FROM subcategories");
      await mysql.end();
      return jsonResponse(200, subcategories || []);
    }

    if (apiPath === "/subcategories" && method === "POST") {
      const { name, slug, categoryId } = body;
      const id = randomUUID();
      await query("INSERT INTO subcategories (id, name, slug, categoryId) VALUES (?, ?, ?, ?)", [id, name, slug, categoryId]);
      await mysql.end();
      return jsonResponse(201, { id, name, slug, categoryId });
    }

    if (apiPath.startsWith("/subcategories/") && method === "DELETE") {
      const id = apiPath.split("/subcategories/")[1];
      await query("DELETE FROM subcategories WHERE id = ?", [id]);
      await mysql.end();
      return jsonResponse(200, { success: true });
    }

    // Plans
    if (apiPath === "/plans" && method === "GET") {
      const rows = await query("SELECT * FROM plans");
      const plans = (rows || []).map((row: any) => ({
        ...row,
        features: typeof row.features === "string" ? JSON.parse(row.features) : row.features || [],
        popular: Boolean(row.popular),
      }));
      await mysql.end();
      return jsonResponse(200, plans);
    }

    if (apiPath === "/plans" && method === "POST") {
      const { name, description, priceUsd, priceInr, period, features, popular, categoryId, subcategoryId } = body;
      const id = randomUUID();
      await query(
        "INSERT INTO plans (id, name, description, priceUsd, priceInr, period, features, popular, categoryId, subcategoryId) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [id, name, description, priceUsd, priceInr, period, JSON.stringify(features || []), popular || false, categoryId, subcategoryId]
      );
      await mysql.end();
      return jsonResponse(201, { id, ...body });
    }

    if (apiPath.startsWith("/plans/") && method === "PATCH") {
      const id = apiPath.split("/plans/")[1];
      const { name, description, priceUsd, priceInr, period, features, popular, categoryId, subcategoryId } = body;
      await query(
        "UPDATE plans SET name = ?, description = ?, priceUsd = ?, priceInr = ?, period = ?, features = ?, popular = ?, categoryId = ?, subcategoryId = ? WHERE id = ?",
        [name, description, priceUsd, priceInr, period, JSON.stringify(features || []), popular || false, categoryId, subcategoryId, id]
      );
      await mysql.end();
      return jsonResponse(200, { id, ...body });
    }

    if (apiPath.startsWith("/plans/") && method === "DELETE") {
      const id = apiPath.split("/plans/")[1];
      await query("DELETE FROM plans WHERE id = ?", [id]);
      await mysql.end();
      return jsonResponse(200, { success: true });
    }

    // FAQs
    if (apiPath === "/faqs" && method === "GET") {
      const faqs = await query("SELECT * FROM faqs");
      await mysql.end();
      return jsonResponse(200, faqs || []);
    }

    if (apiPath === "/faqs" && method === "POST") {
      const { question, answer } = body;
      const id = randomUUID();
      await query("INSERT INTO faqs (id, question, answer) VALUES (?, ?, ?)", [id, question, answer]);
      await mysql.end();
      return jsonResponse(201, { id, question, answer });
    }

    if (apiPath.startsWith("/faqs/") && method === "PATCH") {
      const id = apiPath.split("/faqs/")[1];
      const { question, answer } = body;
      await query("UPDATE faqs SET question = ?, answer = ? WHERE id = ?", [question, answer, id]);
      await mysql.end();
      return jsonResponse(200, { id, question, answer });
    }

    if (apiPath.startsWith("/faqs/") && method === "DELETE") {
      const id = apiPath.split("/faqs/")[1];
      await query("DELETE FROM faqs WHERE id = ?", [id]);
      await mysql.end();
      return jsonResponse(200, { success: true });
    }

    // Settings
    if (apiPath === "/settings" && method === "GET") {
      const rows = await query("SELECT * FROM settings WHERE id = 1");
      const row = (rows && rows[0]) || {};
      await mysql.end();
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
        heroDescription: row.heroDescription || "Experience blazing-fast performance with Pheonix Cloud.",
        stat1Value: row.stat1Value || "99.9%",
        stat1Label: row.stat1Label || "Uptime SLA",
        stat2Value: row.stat2Value || "50+",
        stat2Label: row.stat2Label || "Global Locations",
        stat3Value: row.stat3Value || "24/7",
        stat3Label: row.stat3Label || "Expert Support",
        featuresSectionTitle: row.featuresSectionTitle || "Why Choose Pheonix Cloud?",
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
      const s = body;
      await query(
        `UPDATE settings SET 
          currency = ?, supportLink = ?, redirectLink = ?, instagramLink = ?, youtubeLink = ?, 
          email = ?, documentationLink = ?, heroTitleLine1 = ?, heroTitleLine2 = ?, heroDescription = ?,
          stat1Value = ?, stat1Label = ?, stat2Value = ?, stat2Label = ?, stat3Value = ?, stat3Label = ?,
          featuresSectionTitle = ?, featuresSectionDescription = ?,
          feature1Title = ?, feature1Description = ?, feature2Title = ?, feature2Description = ?,
          feature3Title = ?, feature3Description = ?, feature4Title = ?, feature4Description = ?,
          feature5Title = ?, feature5Description = ?, feature6Title = ?, feature6Description = ?,
          ctaTitle = ?, ctaDescription = ?, backgroundImageLight = ?, backgroundImageDark = ?
        WHERE id = 1`,
        [
          s.currency || "usd", s.supportLink || "", s.redirectLink || "", s.instagramLink || "", s.youtubeLink || "",
          s.email || "", s.documentationLink || "", s.heroTitleLine1 || "", s.heroTitleLine2 || "", s.heroDescription || "",
          s.stat1Value || "", s.stat1Label || "", s.stat2Value || "", s.stat2Label || "", s.stat3Value || "", s.stat3Label || "",
          s.featuresSectionTitle || "", s.featuresSectionDescription || "",
          s.feature1Title || "", s.feature1Description || "", s.feature2Title || "", s.feature2Description || "",
          s.feature3Title || "", s.feature3Description || "", s.feature4Title || "", s.feature4Description || "",
          s.feature5Title || "", s.feature5Description || "", s.feature6Title || "", s.feature6Description || "",
          s.ctaTitle || "", s.ctaDescription || "", s.backgroundImageLight || "", s.backgroundImageDark || "",
        ]
      );
      await mysql.end();
      return jsonResponse(200, body);
    }

    // Not found
    await mysql.end();
    return jsonResponse(404, { error: "Not found", path: apiPath });

  } catch (error: any) {
    console.error("API Error:", error);
    await mysql.end();
    return jsonResponse(500, { error: error.message || "Internal server error" });
  }
};

export { handler };
