import type { Handler, HandlerEvent, HandlerContext } from "@netlify/functions";
import { scryptSync, timingSafeEqual, randomUUID } from "crypto";
import * as fs from "fs";
import * as path from "path";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Subcategory {
  id: string;
  name: string;
  slug: string;
  categoryId: string;
}

interface Plan {
  id: string;
  name: string;
  description: string;
  priceUsd: string;
  priceInr: string;
  period: string;
  features: string[];
  popular?: boolean;
  categoryId: string;
  subcategoryId: string;
}

interface FAQ {
  id: string;
  question: string;
  answer: string;
}

interface Settings {
  currency: "usd" | "inr";
  supportLink: string;
  redirectLink: string;
  instagramLink?: string;
  youtubeLink?: string;
  email?: string;
  documentationLink?: string;
}

interface AdminUser {
  id: string;
  username: string;
  passwordHash: string;
}

interface StorageData {
  categories: Category[];
  subcategories: Subcategory[];
  plans: Plan[];
  faqs: FAQ[];
  settings: Settings;
  adminUsers: AdminUser[];
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

function loadData(): StorageData {
  try {
    const dataPath = path.join(__dirname, "data.json");
    if (fs.existsSync(dataPath)) {
      return JSON.parse(fs.readFileSync(dataPath, "utf-8"));
    }
  } catch (error) {
    console.error("Error loading data:", error);
  }

  return {
    categories: [],
    subcategories: [],
    plans: [],
    faqs: [],
    settings: {
      currency: "usd",
      supportLink: "",
      redirectLink: "",
    },
    adminUsers: [
      {
        id: randomUUID(),
        username: "admin",
        passwordHash: hashPassword("admin123"),
      },
    ],
  };
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

  const data = loadData();
  const path = event.path.replace("/.netlify/functions/api", "").replace("/api", "");
  const method = event.httpMethod;
  const body = event.body ? JSON.parse(event.body) : {};

  try {
    if (path === "/admin/login" && method === "POST") {
      const { username, password } = body;
      const user = data.adminUsers.find((u) => u.username === username);
      if (user && verifyPassword(password, user.passwordHash)) {
        return jsonResponse(200, { success: true });
      }
      return jsonResponse(401, { error: "Invalid credentials" });
    }

    if (path === "/admin/users" && method === "GET") {
      const users = data.adminUsers.map((u) => ({ id: u.id, username: u.username }));
      return jsonResponse(200, users);
    }

    if (path === "/categories" && method === "GET") {
      const result = data.categories.map((cat) => ({
        ...cat,
        subcategories: data.subcategories.filter((sub) => sub.categoryId === cat.id),
      }));
      return jsonResponse(200, result);
    }

    if (path === "/subcategories" && method === "GET") {
      return jsonResponse(200, data.subcategories);
    }

    if (path === "/plans" && method === "GET") {
      return jsonResponse(200, data.plans);
    }

    if (path === "/faqs" && method === "GET") {
      return jsonResponse(200, data.faqs || []);
    }

    if (path === "/settings" && method === "GET") {
      return jsonResponse(200, {
        currency: data.settings.currency || "usd",
        supportLink: data.settings.supportLink || "",
        redirectLink: data.settings.redirectLink || "",
        instagramLink: data.settings.instagramLink || "",
        youtubeLink: data.settings.youtubeLink || "",
        email: data.settings.email || "",
        documentationLink: data.settings.documentationLink || "",
      });
    }

    if (method === "POST" || method === "PATCH" || method === "DELETE") {
      return jsonResponse(400, { 
        error: "Write operations are not supported on Netlify. The site data is read-only. Contact admin to update data." 
      });
    }

    return jsonResponse(404, { error: "Not found" });
  } catch (error) {
    console.error("API Error:", error);
    return jsonResponse(500, { error: "Internal server error" });
  }
};

export { handler };
