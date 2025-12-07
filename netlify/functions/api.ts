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
  // Categories
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
      categoryId VARCHAR(36) NOT NULL,
      \`order\` INT DEFAULT 0
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
      subcategoryId VARCHAR(36),
      \`order\` INT DEFAULT 0
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS faqs (
      id VARCHAR(36) PRIMARY KEY,
      question TEXT NOT NULL,
      answer TEXT NOT NULL
    )
  `);

  // Settings - with ALTER TABLE to add missing columns
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

  // Ensure redirectLink column exists (for tables created before this column was added)
  try {
    await query(`ALTER TABLE settings ADD COLUMN redirectLink TEXT`);
  } catch (e) {
    // Column already exists, ignore error
  }

  // Ensure instagramLink column exists
  try {
    await query(`ALTER TABLE settings ADD COLUMN instagramLink TEXT`);
  } catch (e) {
    // Column already exists, ignore error
  }

  // Ensure youtubeLink column exists
  try {
    await query(`ALTER TABLE settings ADD COLUMN youtubeLink TEXT`);
  } catch (e) {
    // Column already exists, ignore error
  }

  await query(`
    CREATE TABLE IF NOT EXISTS admin_users (
      id VARCHAR(36) PRIMARY KEY,
      username VARCHAR(255) NOT NULL UNIQUE,
      passwordHash VARCHAR(255) NOT NULL
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS team_members (
      id VARCHAR(36) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      role VARCHAR(255) NOT NULL,
      imageUrl TEXT,
      \`order\` INT DEFAULT 0
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS about_page_content (
      id INTEGER PRIMARY KEY,
      heroTitle VARCHAR(255),
      heroSubtitle VARCHAR(255),
      heroImageUrl TEXT,
      companyName VARCHAR(255),
      companyDescription TEXT,
      companyAddress TEXT,
      supportEmail VARCHAR(255),
      storyTitle VARCHAR(255),
      storyContent TEXT,
      yearsExperience VARCHAR(50),
      storyImage1Url TEXT,
      storyImage2Url TEXT,
      visionTitle VARCHAR(255),
      visionContent TEXT,
      missionTitle VARCHAR(255),
      missionContent TEXT,
      teamSectionTitle VARCHAR(255),
      teamSectionSubtitle VARCHAR(255),
      stat1Value VARCHAR(50),
      stat1Label VARCHAR(100),
      stat2Value VARCHAR(50),
      stat2Label VARCHAR(100),
      stat3Value VARCHAR(50),
      stat3Label VARCHAR(100),
      stat4Value VARCHAR(50),
      stat4Label VARCHAR(100)
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

  // Insert default about page content if not exists
  const existingAbout = await query("SELECT id FROM about_page_content WHERE id = 1");
  if (!existingAbout || existingAbout.length === 0) {
    await query(`INSERT INTO about_page_content (id, heroTitle, heroSubtitle, companyName, companyDescription, storyTitle, storyContent, yearsExperience, storyImage1Url, storyImage2Url, visionTitle, visionContent, missionTitle, missionContent, teamSectionTitle, teamSectionSubtitle, stat1Value, stat1Label, stat2Value, stat2Label, stat3Value, stat3Label, stat4Value, stat4Label) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, 
      [1, "This is our story", "About us", "PHEONIX Cloud", "Web & Game Hosting Business focused on high-performance hosting for gamers and developers.", "The beginning", "PHEONIX Cloud started with a simple goal: to provide reliable and high-performance server hosting. We recognized the need for a platform where gamers could enjoy smooth, lag-free experiences. Today, we are proud to offer scalable and affordable hosting solutions trusted by gamers worldwide.", "1", "", "", "Our Vision", "Our vision is to provide the most reliable, high-performance hosting services. We aim to create a platform where gamers can focus on enjoying their game, without worrying about server performance.", "Our Mission", "Our mission is to deliver the best server hosting experience through top-tier infrastructure, low-latency connections, and excellent customer support.", "Behind the scene", "Our solid team", "150", "Happy Clients", "300", "Servers Ordered", "10", "Awards Winning", "1", "Years Experience"]
    );
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
      const subcategories = await query("SELECT * FROM subcategories ORDER BY `order` ASC, id ASC");
      await mysql.end();
      return jsonResponse(200, subcategories || []);
    }

    if (apiPath === "/subcategories" && method === "POST") {
      const { name, slug, categoryId, order } = body;
      const id = randomUUID();
      
      // Check for duplicate order in same category
      if (order !== undefined && order !== null) {
        const existing = await query("SELECT * FROM subcategories WHERE categoryId = ? AND `order` = ?", [categoryId, order]);
        if (existing && existing.length > 0) {
          await mysql.end();
          return jsonResponse(409, { error: `Position ${order} is already used by "${existing[0].name}". Please choose a different position.`, conflictingItem: existing[0] });
        }
      }
      
      await query("INSERT INTO subcategories (id, name, slug, categoryId, `order`) VALUES (?, ?, ?, ?, ?)", [id, name, slug, categoryId, order || 0]);
      await mysql.end();
      return jsonResponse(201, { id, name, slug, categoryId, order: order || 0 });
    }

    if (apiPath.startsWith("/subcategories/") && method === "PATCH") {
      const id = apiPath.split("/subcategories/")[1];
      const { name, slug, categoryId, order } = body;
      
      // Get current subcategory
      const current = await query("SELECT * FROM subcategories WHERE id = ?", [id]);
      if (!current || current.length === 0) {
        await mysql.end();
        return jsonResponse(404, { error: "Subcategory not found" });
      }
      
      const currentSub = current[0];
      const newOrder = order !== undefined ? order : currentSub.order;
      
      // Check for duplicate order in same category (excluding current)
      if (newOrder !== undefined && newOrder !== null && newOrder !== currentSub.order) {
        const existing = await query("SELECT * FROM subcategories WHERE categoryId = ? AND `order` = ? AND id != ?", [categoryId || currentSub.categoryId, newOrder, id]);
        if (existing && existing.length > 0) {
          await mysql.end();
          return jsonResponse(409, { error: `Position ${newOrder} is already used by "${existing[0].name}". Please choose a different position.`, conflictingItem: existing[0] });
        }
      }
      
      await query("UPDATE subcategories SET name = ?, slug = ?, `order` = ? WHERE id = ?", [name, slug, newOrder, id]);
      await mysql.end();
      return jsonResponse(200, { id, name, slug, categoryId: categoryId || currentSub.categoryId, order: newOrder });
    }

    if (apiPath.startsWith("/subcategories/") && method === "DELETE") {
      const id = apiPath.split("/subcategories/")[1];
      await query("DELETE FROM subcategories WHERE id = ?", [id]);
      await mysql.end();
      return jsonResponse(200, { success: true });
    }

    // Plans
    if (apiPath === "/plans" && method === "GET") {
      const rows = await query("SELECT * FROM plans ORDER BY `order` ASC, id ASC");
      const plans = (rows || []).map((row: any) => ({
        ...row,
        features: typeof row.features === "string" ? JSON.parse(row.features) : row.features || [],
        popular: Boolean(row.popular),
      }));
      await mysql.end();
      return jsonResponse(200, plans);
    }

    if (apiPath === "/plans" && method === "POST") {
      const { name, description, priceUsd, priceInr, period, features, popular, categoryId, subcategoryId, order } = body;
      const id = randomUUID();
      
      // Check for duplicate order in same subcategory
      if (order !== undefined && order !== null) {
        const existing = await query("SELECT * FROM plans WHERE subcategoryId = ? AND `order` = ?", [subcategoryId, order]);
        if (existing && existing.length > 0) {
          await mysql.end();
          return jsonResponse(409, { error: `Position ${order} is already used by "${existing[0].name}". Please choose a different position.`, conflictingItem: existing[0] });
        }
      }
      
      await query(
        "INSERT INTO plans (id, name, description, priceUsd, priceInr, period, features, popular, categoryId, subcategoryId, `order`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [id, name, description, priceUsd, priceInr, period, JSON.stringify(features || []), popular || false, categoryId, subcategoryId, order || 0]
      );
      await mysql.end();
      return jsonResponse(201, { id, name, description, priceUsd, priceInr, period, features: features || [], popular: popular || false, categoryId, subcategoryId, order: order || 0 });
    }

    if (apiPath.startsWith("/plans/") && method === "PATCH") {
      const id = apiPath.split("/plans/")[1];
      const { name, description, priceUsd, priceInr, period, features, popular, categoryId, subcategoryId, order } = body;
      
      // Get current plan
      const current = await query("SELECT * FROM plans WHERE id = ?", [id]);
      if (!current || current.length === 0) {
        await mysql.end();
        return jsonResponse(404, { error: "Plan not found" });
      }
      
      const currentPlan = current[0];
      const newOrder = order !== undefined ? order : currentPlan.order;
      
      // Check for duplicate order in same subcategory (excluding current)
      if (newOrder !== undefined && newOrder !== null && newOrder !== currentPlan.order) {
        const existing = await query("SELECT * FROM plans WHERE subcategoryId = ? AND `order` = ? AND id != ?", [subcategoryId || currentPlan.subcategoryId, newOrder, id]);
        if (existing && existing.length > 0) {
          await mysql.end();
          return jsonResponse(409, { error: `Position ${newOrder} is already used by "${existing[0].name}". Please choose a different position.`, conflictingItem: existing[0] });
        }
      }
      
      await query(
        "UPDATE plans SET name = ?, description = ?, priceUsd = ?, priceInr = ?, period = ?, features = ?, popular = ?, categoryId = ?, subcategoryId = ?, `order` = ? WHERE id = ?",
        [name, description, priceUsd, priceInr, period, JSON.stringify(features || []), popular || false, categoryId, subcategoryId || currentPlan.subcategoryId, newOrder, id]
      );
      await mysql.end();
      return jsonResponse(200, { id, name, description, priceUsd, priceInr, period, features: features || [], popular: popular || false, categoryId, subcategoryId: subcategoryId || currentPlan.subcategoryId, order: newOrder });
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

    // About Page Content
    if (apiPath === "/about" && method === "GET") {
      const rows = await query("SELECT * FROM about_page_content WHERE id = 1");
      const row = (rows && rows[0]) || {};
      await mysql.end();
      return jsonResponse(200, {
        heroTitle: row.heroTitle || "",
        heroSubtitle: row.heroSubtitle || "",
        heroImageUrl: row.heroImageUrl || "",
        companyName: row.companyName || "",
        companyDescription: row.companyDescription || "",
        companyAddress: row.companyAddress || "",
        supportEmail: row.supportEmail || "",
        storyTitle: row.storyTitle || "",
        storyContent: row.storyContent || "",
        yearsExperience: row.yearsExperience || "",
        storyImage1Url: row.storyImage1Url || "",
        storyImage2Url: row.storyImage2Url || "",
        visionTitle: row.visionTitle || "",
        visionContent: row.visionContent || "",
        missionTitle: row.missionTitle || "",
        missionContent: row.missionContent || "",
        teamSectionTitle: row.teamSectionTitle || "",
        teamSectionSubtitle: row.teamSectionSubtitle || "",
        stat1Value: row.stat1Value || "",
        stat1Label: row.stat1Label || "",
        stat2Value: row.stat2Value || "",
        stat2Label: row.stat2Label || "",
        stat3Value: row.stat3Value || "",
        stat3Label: row.stat3Label || "",
        stat4Value: row.stat4Value || "",
        stat4Label: row.stat4Label || "",
      });
    }

    if (apiPath === "/about" && method === "POST") {
      const a = body;
      await query(
        `UPDATE about_page_content SET 
          heroTitle = ?, heroSubtitle = ?, heroImageUrl = ?, companyName = ?, companyDescription = ?, 
          companyAddress = ?, supportEmail = ?, storyTitle = ?, storyContent = ?, yearsExperience = ?,
          storyImage1Url = ?, storyImage2Url = ?, visionTitle = ?, visionContent = ?, missionTitle = ?, 
          missionContent = ?, teamSectionTitle = ?, teamSectionSubtitle = ?,
          stat1Value = ?, stat1Label = ?, stat2Value = ?, stat2Label = ?, stat3Value = ?, stat3Label = ?,
          stat4Value = ?, stat4Label = ?
        WHERE id = 1`,
        [
          a.heroTitle || "", a.heroSubtitle || "", a.heroImageUrl || "", a.companyName || "", a.companyDescription || "",
          a.companyAddress || "", a.supportEmail || "", a.storyTitle || "", a.storyContent || "", a.yearsExperience || "",
          a.storyImage1Url || "", a.storyImage2Url || "", a.visionTitle || "", a.visionContent || "", a.missionTitle || "",
          a.missionContent || "", a.teamSectionTitle || "", a.teamSectionSubtitle || "",
          a.stat1Value || "", a.stat1Label || "", a.stat2Value || "", a.stat2Label || "", a.stat3Value || "", a.stat3Label || "",
          a.stat4Value || "", a.stat4Label || "",
        ]
      );
      await mysql.end();
      return jsonResponse(200, body);
    }

    // Team Members
    if (apiPath === "/team-members" && method === "GET") {
      const members = await query("SELECT * FROM team_members ORDER BY \`order\` ASC");
      await mysql.end();
      return jsonResponse(200, members || []);
    }

    if (apiPath === "/team-members" && method === "POST") {
      const { name, role, imageUrl, order } = body;
      const id = randomUUID();
      await query("INSERT INTO team_members (id, name, role, imageUrl, \`order\`) VALUES (?, ?, ?, ?, ?)", 
        [id, name, role, imageUrl || "", order || 0]);
      await mysql.end();
      return jsonResponse(201, { id, name, role, imageUrl: imageUrl || "", order: order || 0 });
    }

    if (apiPath.startsWith("/team-members/") && method === "PATCH") {
      const id = apiPath.split("/team-members/")[1];
      const { name, role, imageUrl, order } = body;
      await query("UPDATE team_members SET name = ?, role = ?, imageUrl = ?, \`order\` = ? WHERE id = ?", 
        [name, role, imageUrl || "", order || 0, id]);
      await mysql.end();
      return jsonResponse(200, { id, name, role, imageUrl: imageUrl || "", order: order || 0 });
    }

    if (apiPath.startsWith("/team-members/") && method === "DELETE") {
      const id = apiPath.split("/team-members/")[1];
      await query("DELETE FROM team_members WHERE id = ?", [id]);
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
