import type { Handler, HandlerEvent, HandlerContext } from "@netlify/functions";
import { scryptSync, randomUUID } from "crypto";
import postgres from "postgres";

const SALT = "phoenix-salt";

function hashPassword(password: string): string {
  return scryptSync(password, SALT, 32).toString("hex");
}

function getConnection() {
  const connectionString = process.env.DATABASE_URL;
  console.log("[DB] DATABASE_URL exists:", !!connectionString);
  
  if (!connectionString) {
    throw new Error("DATABASE_URL environment variable not set");
  }
  
  console.log("[DB] Connecting to PostgreSQL...");
  return postgres(connectionString, {
    max: 1,
    idle_timeout: 30,
    connect_timeout: 30,
    ssl: { rejectUnauthorized: false }
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

async function initializeDatabase(sql: any) {
  try {
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
        categoryid VARCHAR(36) NOT NULL REFERENCES categories(id) ON DELETE CASCADE
      )
    `;
    
    await sql`
      CREATE TABLE IF NOT EXISTS plans (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        priceusd VARCHAR(50),
        priceinr VARCHAR(50),
        period VARCHAR(50),
        features JSONB,
        popular BOOLEAN DEFAULT FALSE,
        categoryid VARCHAR(36),
        subcategoryid VARCHAR(36),
        FOREIGN KEY (categoryid) REFERENCES categories(id) ON DELETE SET NULL,
        FOREIGN KEY (subcategoryid) REFERENCES subcategories(id) ON DELETE SET NULL
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
        supportlink VARCHAR(500),
        redirectlink VARCHAR(500),
        instagramlink VARCHAR(500),
        youtubelink VARCHAR(500),
        email VARCHAR(255),
        documentationlink VARCHAR(500),
        herotitleline1 VARCHAR(255),
        herotitleline2 VARCHAR(255),
        herodescription TEXT,
        stat1value VARCHAR(50),
        stat1label VARCHAR(100),
        stat2value VARCHAR(50),
        stat2label VARCHAR(100),
        stat3value VARCHAR(50),
        stat3label VARCHAR(100),
        featuressectiontitle VARCHAR(255),
        featuressectiondescription TEXT,
        feature1title VARCHAR(255),
        feature1description TEXT,
        feature2title VARCHAR(255),
        feature2description TEXT,
        feature3title VARCHAR(255),
        feature3description TEXT,
        feature4title VARCHAR(255),
        feature4description TEXT,
        feature5title VARCHAR(255),
        feature5description TEXT,
        feature6title VARCHAR(255),
        feature6description TEXT,
        ctatitle VARCHAR(255),
        ctadescription TEXT,
        backgroundimagelight TEXT,
        backgroundimagedark TEXT
      )
    `;
    
    await sql`
      CREATE TABLE IF NOT EXISTS admin_users (
        id VARCHAR(36) PRIMARY KEY,
        username VARCHAR(255) NOT NULL UNIQUE,
        passwordhash VARCHAR(255) NOT NULL
      )
    `;

    const settings = await sql`SELECT * FROM settings WHERE id = 1`;
    if (settings.length === 0) {
      await sql`
        INSERT INTO settings (id, currency, supportlink, redirectlink)
        VALUES (1, 'usd', '', '')
      `;
    }

    const existingAdmin = await sql`SELECT id FROM admin_users WHERE username = 'admin'`;
    if (existingAdmin.length === 0) {
      const adminId = randomUUID();
      const passwordHash = hashPassword("admin123");
      await sql`
        INSERT INTO admin_users (id, username, passwordhash)
        VALUES (${adminId}, 'admin', ${passwordHash})
      `;
      console.log("Created default admin user: admin / admin123");
    }
  } catch (error) {
    console.error("Database initialization error:", error);
  }
}

function mapSubcategoryToCamelCase(sub: any) {
  return {
    id: sub.id,
    name: sub.name,
    slug: sub.slug,
    categoryId: sub.categoryid,
  };
}

function mapPlanToCamelCase(row: any) {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    priceUsd: row.priceusd,
    priceInr: row.priceinr,
    period: row.period,
    features: typeof row.features === "string" ? JSON.parse(row.features) : row.features || [],
    popular: Boolean(row.popular),
    categoryId: row.categoryid,
    subcategoryId: row.subcategoryid,
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

  let sql: any = null;
  
  try {
    console.log(`[API] ${method} ${apiPath}`);
    sql = getConnection();
    await initializeDatabase(sql);
    console.log("[DB] Database initialized successfully");

    // Admin Login
    if (apiPath === "/admin/login" && method === "POST") {
      const { username, password } = body;
      console.log(`[AUTH] Attempting login for user: ${username}`);
      
      const result = await sql`SELECT passwordhash FROM admin_users WHERE username = ${username}`;
      console.log(`[AUTH] Found ${result.length} users`);
      
      if (result.length > 0) {
        const storedHash = result[0].passwordhash;
        const inputHash = hashPassword(password);
        console.log(`[AUTH] Stored hash prefix: ${storedHash?.substring(0, 20)}`);
        console.log(`[AUTH] Input hash prefix: ${inputHash.substring(0, 20)}`);
        
        if (storedHash === inputHash) {
          console.log(`[AUTH] Login successful for ${username}`);
          return jsonResponse(200, { success: true });
        }
      }
      
      console.log(`[AUTH] Login failed for ${username}`);
      return jsonResponse(401, { error: "Invalid credentials" });
    }

    // Admin Users - GET
    if (apiPath === "/admin/users" && method === "GET") {
      const rows = await sql`SELECT id, username FROM admin_users`;
      return jsonResponse(200, rows);
    }

    // Admin Users - POST
    if (apiPath === "/admin/users" && method === "POST") {
      const { username, password } = body;
      if (!username || !password) {
        return jsonResponse(400, { error: "Username and password required" });
      }
      const id = randomUUID();
      const passwordHash = hashPassword(password);
      await sql`INSERT INTO admin_users (id, username, passwordhash) VALUES (${id}, ${username}, ${passwordHash})`;
      return jsonResponse(201, { id, username });
    }

    // Admin Users - PATCH/DELETE by ID
    const userIdMatch = apiPath.match(/\/admin\/users\/([^/]+)$/);
    if (userIdMatch) {
      const userId = userIdMatch[1];
      if (method === "PATCH") {
        const { password } = body;
        if (!password) {
          return jsonResponse(400, { error: "Password required" });
        }
        const passwordHash = hashPassword(password);
        await sql`UPDATE admin_users SET passwordhash = ${passwordHash} WHERE id = ${userId}`;
        const rows = await sql`SELECT id, username FROM admin_users WHERE id = ${userId}`;
        if (rows.length === 0) {
          return jsonResponse(404, { error: "User not found" });
        }
        return jsonResponse(200, rows[0]);
      }
      if (method === "DELETE") {
        await sql`DELETE FROM admin_users WHERE id = ${userId}`;
        return jsonResponse(200, { success: true });
      }
    }

    // Categories - GET
    if (apiPath === "/categories" && method === "GET") {
      const categories = await sql`SELECT * FROM categories`;
      const subcategories = await sql`SELECT * FROM subcategories`;
      const result = categories.map((cat: any) => ({
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        subcategories: subcategories
          .filter((sub: any) => sub.categoryid === cat.id)
          .map(mapSubcategoryToCamelCase),
      }));
      return jsonResponse(200, result);
    }

    // Categories - POST
    if (apiPath === "/categories" && method === "POST") {
      const { name, slug } = body;
      const id = randomUUID();
      await sql`INSERT INTO categories (id, name, slug) VALUES (${id}, ${name}, ${slug})`;
      return jsonResponse(201, { id, name, slug });
    }

    // Categories - PATCH/DELETE by ID
    const catIdMatch = apiPath.match(/\/categories\/([^/]+)$/);
    if (catIdMatch) {
      const catId = catIdMatch[1];
      if (method === "PATCH") {
        const { name, slug } = body;
        await sql`UPDATE categories SET name = ${name}, slug = ${slug} WHERE id = ${catId}`;
        return jsonResponse(200, { id: catId, name, slug });
      }
      if (method === "DELETE") {
        await sql`DELETE FROM categories WHERE id = ${catId}`;
        return jsonResponse(200, { success: true });
      }
    }

    // Subcategories - GET
    if (apiPath === "/subcategories" && method === "GET") {
      const rows = await sql`SELECT * FROM subcategories`;
      return jsonResponse(200, rows.map(mapSubcategoryToCamelCase));
    }

    // Subcategories - POST
    if (apiPath === "/subcategories" && method === "POST") {
      const { name, slug, categoryId } = body;
      const id = randomUUID();
      await sql`INSERT INTO subcategories (id, name, slug, categoryid) VALUES (${id}, ${name}, ${slug}, ${categoryId})`;
      return jsonResponse(201, { id, name, slug, categoryId });
    }

    // Subcategories - PATCH/DELETE by ID
    const subIdMatch = apiPath.match(/\/subcategories\/([^/]+)$/);
    if (subIdMatch) {
      const subId = subIdMatch[1];
      if (method === "PATCH") {
        const { name, slug } = body;
        await sql`UPDATE subcategories SET name = ${name}, slug = ${slug} WHERE id = ${subId}`;
        const rows = await sql`SELECT * FROM subcategories WHERE id = ${subId}`;
        return jsonResponse(200, rows.length > 0 ? mapSubcategoryToCamelCase(rows[0]) : null);
      }
      if (method === "DELETE") {
        await sql`DELETE FROM subcategories WHERE id = ${subId}`;
        return jsonResponse(200, { success: true });
      }
    }

    // Plans - GET
    if (apiPath === "/plans" && method === "GET") {
      const rows = await sql`SELECT * FROM plans`;
      return jsonResponse(200, rows.map(mapPlanToCamelCase));
    }

    // Plans - POST
    if (apiPath === "/plans" && method === "POST") {
      const id = randomUUID();
      await sql`
        INSERT INTO plans (id, name, description, priceusd, priceinr, period, features, popular, categoryid, subcategoryid)
        VALUES (${id}, ${body.name}, ${body.description}, ${body.priceUsd}, ${body.priceInr}, ${body.period},
                ${JSON.stringify(body.features)}, ${body.popular || false}, ${body.categoryId}, ${body.subcategoryId})
      `;
      return jsonResponse(201, { ...body, id });
    }

    // Plans - PATCH/DELETE by ID
    const planIdMatch = apiPath.match(/\/plans\/([^/]+)$/);
    if (planIdMatch) {
      const planId = planIdMatch[1];
      if (method === "PATCH") {
        await sql`
          UPDATE plans SET 
            name = ${body.name}, 
            description = ${body.description}, 
            priceusd = ${body.priceUsd}, 
            priceinr = ${body.priceInr}, 
            period = ${body.period},
            features = ${JSON.stringify(body.features)}, 
            popular = ${body.popular}, 
            categoryid = ${body.categoryId}, 
            subcategoryid = ${body.subcategoryId}
          WHERE id = ${planId}
        `;
        return jsonResponse(200, { ...body, id: planId });
      }
      if (method === "DELETE") {
        await sql`DELETE FROM plans WHERE id = ${planId}`;
        return jsonResponse(200, { success: true });
      }
    }

    // FAQs - GET
    if (apiPath === "/faqs" && method === "GET") {
      const rows = await sql`SELECT * FROM faqs`;
      return jsonResponse(200, rows);
    }

    // FAQs - POST
    if (apiPath === "/faqs" && method === "POST") {
      const { question, answer } = body;
      const id = randomUUID();
      await sql`INSERT INTO faqs (id, question, answer) VALUES (${id}, ${question}, ${answer})`;
      return jsonResponse(201, { id, question, answer });
    }

    // FAQs - PATCH/DELETE by ID
    const faqIdMatch = apiPath.match(/\/faqs\/([^/]+)$/);
    if (faqIdMatch) {
      const faqId = faqIdMatch[1];
      if (method === "PATCH") {
        const { question, answer } = body;
        await sql`UPDATE faqs SET question = ${question}, answer = ${answer} WHERE id = ${faqId}`;
        return jsonResponse(200, { id: faqId, question, answer });
      }
      if (method === "DELETE") {
        await sql`DELETE FROM faqs WHERE id = ${faqId}`;
        return jsonResponse(200, { success: true });
      }
    }

    // Settings - GET
    if (apiPath === "/settings" && method === "GET") {
      const rows = await sql`SELECT * FROM settings WHERE id = 1`;
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
        heroDescription: row.herodescription || "Experience blazing-fast performance with Phoenix Cloud. 99.9% uptime guarantee, instant scaling, and 24/7 expert support.",
        stat1Value: row.stat1value || "99.9%",
        stat1Label: row.stat1label || "Uptime SLA",
        stat2Value: row.stat2value || "50+",
        stat2Label: row.stat2label || "Global Locations",
        stat3Value: row.stat3value || "24/7",
        stat3Label: row.stat3label || "Expert Support",
        featuresSectionTitle: row.featuressectiontitle || "Why Choose Phoenix Cloud?",
        featuresSectionDescription: row.featuressectiondescription || "Built for performance, reliability, and ease of use.",
        feature1Title: row.feature1title || "Blazing Fast",
        feature1Description: row.feature1description || "NVMe SSD storage and optimized infrastructure for lightning-quick load times.",
        feature2Title: row.feature2title || "DDoS Protection",
        feature2Description: row.feature2description || "Enterprise-grade protection against attacks, keeping your services online.",
        feature3Title: row.feature3title || "Global Network",
        feature3Description: row.feature3description || "Strategically located data centers for low latency worldwide.",
        feature4Title: row.feature4title || "Instant Scaling",
        feature4Description: row.feature4description || "Scale resources up or down instantly based on your needs.",
        feature5Title: row.feature5title || "24/7 Support",
        feature5Description: row.feature5description || "Expert support team available around the clock via Discord and tickets.",
        feature6Title: row.feature6title || "99.9% Uptime",
        feature6Description: row.feature6description || "Industry-leading SLA with guaranteed uptime for your peace of mind.",
        ctaTitle: row.ctatitle || "Ready to Rise Above?",
        ctaDescription: row.ctadescription || "Join thousands of satisfied customers who trust Phoenix Cloud for their hosting needs. Get started in minutes.",
        backgroundImageLight: row.backgroundimagelight || "",
        backgroundImageDark: row.backgroundimagedark || "",
      });
    }

    // Settings - POST
    if (apiPath === "/settings" && method === "POST") {
      await sql`
        UPDATE settings SET 
          currency = ${body.currency},
          supportlink = ${body.supportLink},
          redirectlink = ${body.redirectLink},
          instagramlink = ${body.instagramLink || ""},
          youtubelink = ${body.youtubeLink || ""},
          email = ${body.email || ""},
          documentationlink = ${body.documentationLink || ""},
          herotitleline1 = ${body.heroTitleLine1 || "Cloud Hosting That"},
          herotitleline2 = ${body.heroTitleLine2 || "Rises Above"},
          herodescription = ${body.heroDescription || ""},
          stat1value = ${body.stat1Value || "99.9%"},
          stat1label = ${body.stat1Label || "Uptime SLA"},
          stat2value = ${body.stat2Value || "50+"},
          stat2label = ${body.stat2Label || "Global Locations"},
          stat3value = ${body.stat3Value || "24/7"},
          stat3label = ${body.stat3Label || "Expert Support"},
          featuressectiontitle = ${body.featuresSectionTitle || "Why Choose Phoenix Cloud?"},
          featuressectiondescription = ${body.featuresSectionDescription || ""},
          feature1title = ${body.feature1Title || "Blazing Fast"},
          feature1description = ${body.feature1Description || ""},
          feature2title = ${body.feature2Title || "DDoS Protection"},
          feature2description = ${body.feature2Description || ""},
          feature3title = ${body.feature3Title || "Global Network"},
          feature3description = ${body.feature3Description || ""},
          feature4title = ${body.feature4Title || "Instant Scaling"},
          feature4description = ${body.feature4Description || ""},
          feature5title = ${body.feature5Title || "24/7 Support"},
          feature5description = ${body.feature5Description || ""},
          feature6title = ${body.feature6Title || "99.9% Uptime"},
          feature6description = ${body.feature6Description || ""},
          ctatitle = ${body.ctaTitle || "Ready to Rise Above?"},
          ctadescription = ${body.ctaDescription || ""},
          backgroundimagelight = ${body.backgroundImageLight || ""},
          backgroundimagedark = ${body.backgroundImageDark || ""}
        WHERE id = 1
      `;
      return jsonResponse(200, body);
    }

    return jsonResponse(404, { error: "Not found" });
  } catch (error: any) {
    console.error("API Error:", error);
    return jsonResponse(500, { error: error.message || "Internal server error" });
  } finally {
    if (sql) {
      try {
        await sql.end();
      } catch (e) {
        console.error("Error closing connection:", e);
      }
    }
  }
};

export default handler;
