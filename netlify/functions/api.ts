import type { Handler } from "@netlify/functions";
import { scryptSync, randomUUID } from "crypto";

const SALT = "phoenix-salt";

// Simple in-memory storage for now - PostgreSQL integration in progress
const storage: any = {
  categories: [],
  subcategories: [],
  plans: [],
  faqs: [],
  settings: {
    id: 1,
    currency: "usd",
    supportLink: "https://discord.gg/EX6Dydyar5",
    redirectLink: "https://discord.gg/EX6Dydyar5"
  },
  admin_users: [
    {
      id: randomUUID(),
      username: "admin",
      passwordhash: scryptSync("admin123", SALT, 32).toString("hex")
    }
  ]
};

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

const handler: Handler = async (event: any, context: any) => {
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

  try {
    // Admin Login
    if (apiPath === "/admin/login" && method === "POST") {
      const { username, password } = body;
      const admin = storage.admin_users.find((u: any) => u.username === username);
      
      if (admin && admin.passwordhash === hashPassword(password)) {
        return jsonResponse(200, { success: true });
      }
      return jsonResponse(401, { error: "Invalid credentials" });
    }

    // Settings - GET
    if (apiPath === "/settings" && method === "GET") {
      return jsonResponse(200, {
        currency: storage.settings.currency,
        supportLink: storage.settings.supportLink,
        redirectLink: storage.settings.redirectLink,
        instagramLink: "",
        youtubeLink: "",
        email: "pheonixcloud.offical@gmail.com",
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
        feature1Description: "NVMe SSD storage and optimized infrastructure.",
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
        backgroundImageLight: "https://i.pinimg.com/1200x/7f/b2/61/7fb2612d4b9630d91a70416fd7b8379c.jpg",
        backgroundImageDark: "https://i.pinimg.com/1200x/7f/b2/61/7fb2612d4b9630d91a70416fd7b8379c.jpg",
      });
    }

    // Categories - GET
    if (apiPath === "/categories" && method === "GET") {
      return jsonResponse(200, storage.categories);
    }

    // Plans - GET
    if (apiPath === "/plans" && method === "GET") {
      return jsonResponse(200, storage.plans);
    }

    // FAQs - GET
    if (apiPath === "/faqs" && method === "GET") {
      return jsonResponse(200, storage.faqs);
    }

    return jsonResponse(404, { error: "Not found" });
  } catch (error: any) {
    console.error("API Error:", error);
    return jsonResponse(500, { error: error.message || "Internal server error" });
  }
};

export default handler;
