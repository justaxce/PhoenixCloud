import type { Handler, HandlerEvent, HandlerContext } from "@netlify/functions";
import { scryptSync, timingSafeEqual, randomUUID } from "crypto";

let mysql: any = null;

try {
  mysql = require("mysql2/promise");
} catch (e) {
  console.warn("mysql2 not available in Netlify function");
}

const SALT = "phoenix-salt";

function hashPassword(password: string): string {
  return scryptSync(password, SALT, 32).toString("hex");
}

function verifyPassword(password: string, storedHash: string): boolean {
  try {
    const passwordHash = hashPassword(password);
    const userBuffer = Buffer.from(storedHash, "hex");
    const passBuffer = Buffer.from(passwordHash, "hex");
    return timingSafeEqual(userBuffer, passBuffer);
  } catch {
    return false;
  }
}

async function getConnection() {
  if (!mysql) {
    throw new Error("MySQL module not available");
  }
  return mysql.createConnection({
    host: process.env.MYSQL_HOST,
    port: parseInt(process.env.MYSQL_PORT || "3306"),
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
  });
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

const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers: corsHeaders(), body: "" };
  }

  const pathMatch = event.path.match(/\/api(\/.*)/);
  const apiPath = pathMatch ? pathMatch[1] : event.path.replace("/.netlify/functions/api", "");
  const method = event.httpMethod;
  
  let body: any = {};
  try {
    body = event.body ? JSON.parse(event.body) : {};
  } catch (e) {
    return jsonResponse(400, { error: "Invalid JSON" });
  }

  let connection: any;
  try {
    connection = await getConnection();

    if (apiPath === "/admin/login" && method === "POST") {
      const { username, password } = body;
      const [rows] = await connection.query(
        "SELECT passwordHash FROM admin_users WHERE username = ?",
        [username]
      );
      if ((rows as any[]).length > 0 && verifyPassword(password, (rows as any[])[0].passwordHash)) {
        return jsonResponse(200, { success: true });
      }
      return jsonResponse(401, { error: "Invalid credentials" });
    }

    if (apiPath === "/admin/users" && method === "GET") {
      const [rows] = await connection.query("SELECT id, username FROM admin_users");
      return jsonResponse(200, rows);
    }

    if (apiPath === "/admin/users" && method === "POST") {
      const { username, password } = body;
      if (!username || !password) {
        return jsonResponse(400, { error: "Username and password required" });
      }
      const id = randomUUID();
      const passwordHash = hashPassword(password);
      await connection.query(
        "INSERT INTO admin_users (id, username, passwordHash) VALUES (?, ?, ?)",
        [id, username, passwordHash]
      );
      return jsonResponse(201, { id, username });
    }

    const userIdMatch = apiPath.match(/\/admin\/users\/([^/]+)$/);
    if (userIdMatch) {
      const userId = userIdMatch[1];
      if (method === "PATCH") {
        const { password } = body;
        if (!password) {
          return jsonResponse(400, { error: "Password required" });
        }
        const passwordHash = hashPassword(password);
        await connection.query("UPDATE admin_users SET passwordHash = ? WHERE id = ?", [passwordHash, userId]);
        const [rows] = await connection.query("SELECT id, username FROM admin_users WHERE id = ?", [userId]);
        if ((rows as any[]).length === 0) {
          return jsonResponse(404, { error: "User not found" });
        }
        return jsonResponse(200, (rows as any[])[0]);
      }
      if (method === "DELETE") {
        await connection.query("DELETE FROM admin_users WHERE id = ?", [userId]);
        return jsonResponse(200, { success: true });
      }
    }

    if (apiPath === "/categories" && method === "GET") {
      const [categories] = await connection.query("SELECT * FROM categories");
      const [subcategories] = await connection.query("SELECT * FROM subcategories");
      const result = (categories as any[]).map((cat) => ({
        ...cat,
        subcategories: (subcategories as any[]).filter((sub) => sub.categoryId === cat.id),
      }));
      return jsonResponse(200, result);
    }

    if (apiPath === "/categories" && method === "POST") {
      const { name, slug } = body;
      const id = randomUUID();
      await connection.query("INSERT INTO categories (id, name, slug) VALUES (?, ?, ?)", [id, name, slug]);
      return jsonResponse(201, { id, name, slug });
    }

    const catIdMatch = apiPath.match(/\/categories\/([^/]+)$/);
    if (catIdMatch) {
      const catId = catIdMatch[1];
      if (method === "PATCH") {
        const { name, slug } = body;
        await connection.query("UPDATE categories SET name = ?, slug = ? WHERE id = ?", [name, slug, catId]);
        return jsonResponse(200, { id: catId, name, slug });
      }
      if (method === "DELETE") {
        await connection.query("DELETE FROM categories WHERE id = ?", [catId]);
        return jsonResponse(200, { success: true });
      }
    }

    if (apiPath === "/subcategories" && method === "GET") {
      const [rows] = await connection.query("SELECT * FROM subcategories");
      return jsonResponse(200, rows);
    }

    if (apiPath === "/subcategories" && method === "POST") {
      const { name, slug, categoryId } = body;
      const id = randomUUID();
      await connection.query(
        "INSERT INTO subcategories (id, name, slug, categoryId) VALUES (?, ?, ?, ?)",
        [id, name, slug, categoryId]
      );
      return jsonResponse(201, { id, name, slug, categoryId });
    }

    const subIdMatch = apiPath.match(/\/subcategories\/([^/]+)$/);
    if (subIdMatch) {
      const subId = subIdMatch[1];
      if (method === "PATCH") {
        const { name, slug } = body;
        await connection.query("UPDATE subcategories SET name = ?, slug = ? WHERE id = ?", [name, slug, subId]);
        const [rows] = await connection.query("SELECT * FROM subcategories WHERE id = ?", [subId]);
        return jsonResponse(200, (rows as any[])[0]);
      }
      if (method === "DELETE") {
        await connection.query("DELETE FROM subcategories WHERE id = ?", [subId]);
        return jsonResponse(200, { success: true });
      }
    }

    if (apiPath === "/plans" && method === "GET") {
      const [rows] = await connection.query("SELECT * FROM plans");
      const plans = (rows as any[]).map((row) => ({
        ...row,
        features: typeof row.features === "string" ? JSON.parse(row.features) : row.features || [],
        popular: Boolean(row.popular),
      }));
      return jsonResponse(200, plans);
    }

    if (apiPath === "/plans" && method === "POST") {
      const id = randomUUID();
      await connection.query(
        `INSERT INTO plans (id, name, description, priceUsd, priceInr, period, features, popular, categoryId, subcategoryId) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, body.name, body.description, body.priceUsd, body.priceInr, body.period,
         JSON.stringify(body.features), body.popular || false, body.categoryId, body.subcategoryId]
      );
      return jsonResponse(201, { ...body, id });
    }

    const planIdMatch = apiPath.match(/\/plans\/([^/]+)$/);
    if (planIdMatch) {
      const planId = planIdMatch[1];
      if (method === "PATCH") {
        await connection.query(
          `UPDATE plans SET name = ?, description = ?, priceUsd = ?, priceInr = ?, period = ?, 
           features = ?, popular = ?, categoryId = ?, subcategoryId = ? WHERE id = ?`,
          [body.name, body.description, body.priceUsd, body.priceInr, body.period,
           JSON.stringify(body.features), body.popular, body.categoryId, body.subcategoryId, planId]
        );
        return jsonResponse(200, { ...body, id: planId });
      }
      if (method === "DELETE") {
        await connection.query("DELETE FROM plans WHERE id = ?", [planId]);
        return jsonResponse(200, { success: true });
      }
    }

    if (apiPath === "/faqs" && method === "GET") {
      const [rows] = await connection.query("SELECT * FROM faqs");
      return jsonResponse(200, rows);
    }

    if (apiPath === "/faqs" && method === "POST") {
      const { question, answer } = body;
      const id = randomUUID();
      await connection.query("INSERT INTO faqs (id, question, answer) VALUES (?, ?, ?)", [id, question, answer]);
      return jsonResponse(201, { id, question, answer });
    }

    const faqIdMatch = apiPath.match(/\/faqs\/([^/]+)$/);
    if (faqIdMatch) {
      const faqId = faqIdMatch[1];
      if (method === "PATCH") {
        const { question, answer } = body;
        await connection.query("UPDATE faqs SET question = ?, answer = ? WHERE id = ?", [question, answer, faqId]);
        return jsonResponse(200, { id: faqId, question, answer });
      }
      if (method === "DELETE") {
        await connection.query("DELETE FROM faqs WHERE id = ?", [faqId]);
        return jsonResponse(200, { success: true });
      }
    }

    if (apiPath === "/settings" && method === "GET") {
      const [rows] = await connection.query("SELECT * FROM settings WHERE id = 1");
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
      });
    }

    if (apiPath === "/settings" && method === "POST") {
      await connection.query(
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
         ctaTitle = ?, ctaDescription = ?
         WHERE id = 1`,
        [
          body.currency, body.supportLink, body.redirectLink,
          body.instagramLink || "", body.youtubeLink || "", 
          body.email || "", body.documentationLink || "",
          body.heroTitleLine1 || "Cloud Hosting That",
          body.heroTitleLine2 || "Rises Above",
          body.heroDescription || "",
          body.stat1Value || "99.9%",
          body.stat1Label || "Uptime SLA",
          body.stat2Value || "50+",
          body.stat2Label || "Global Locations",
          body.stat3Value || "24/7",
          body.stat3Label || "Expert Support",
          body.featuresSectionTitle || "Why Choose Phoenix Cloud?",
          body.featuresSectionDescription || "",
          body.feature1Title || "Blazing Fast",
          body.feature1Description || "",
          body.feature2Title || "DDoS Protection",
          body.feature2Description || "",
          body.feature3Title || "Global Network",
          body.feature3Description || "",
          body.feature4Title || "Instant Scaling",
          body.feature4Description || "",
          body.feature5Title || "24/7 Support",
          body.feature5Description || "",
          body.feature6Title || "99.9% Uptime",
          body.feature6Description || "",
          body.ctaTitle || "Ready to Rise Above?",
          body.ctaDescription || ""
        ]
      );
      return jsonResponse(200, body);
    }

    return jsonResponse(404, { error: "Not found" });
  } catch (error) {
    console.error("API Error:", error);
    return jsonResponse(500, { error: "Internal server error" });
  } finally {
    if (connection) {
      await connection.end();
    }
  }
};

export { handler };
