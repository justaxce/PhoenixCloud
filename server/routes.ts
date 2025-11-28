import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { categorySchema, subcategorySchema, planSchema, settingsSchema } from "@shared/schema";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Admin Authentication
  app.post("/api/admin/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      const valid = await storage.verifyAdminUser(username, password);
      if (valid) {
        res.json({ success: true });
      } else {
        res.status(401).json({ error: "Invalid credentials" });
      }
    } catch (error) {
      res.status(500).json({ error: "Authentication error" });
    }
  });

  // Admin Users
  app.get("/api/admin/users", async (req, res) => {
    try {
      const users = await storage.getAdminUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: "Error fetching users" });
    }
  });

  app.post("/api/admin/users", async (req, res) => {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        res.status(400).json({ error: "Username and password required" });
        return;
      }
      const salt = "phoenix-salt";
      const { scryptSync } = await import("crypto");
      const passwordHash = scryptSync(password, salt, 32).toString("hex");
      const user = await storage.createAdminUser(username, passwordHash);
      res.status(201).json(user);
    } catch (error) {
      res.status(500).json({ error: "Error creating user" });
    }
  });

  app.patch("/api/admin/users/:id", async (req, res) => {
    try {
      const { password } = req.body;
      if (!password) {
        res.status(400).json({ error: "Password required" });
        return;
      }
      const salt = "phoenix-salt";
      const { scryptSync } = await import("crypto");
      const passwordHash = scryptSync(password, salt, 32).toString("hex");
      const user = await storage.updateAdminUser(req.params.id, passwordHash);
      if (user) {
        res.json(user);
      } else {
        res.status(404).json({ error: "User not found" });
      }
    } catch (error) {
      res.status(500).json({ error: "Error updating user" });
    }
  });

  app.delete("/api/admin/users/:id", async (req, res) => {
    try {
      const success = await storage.deleteAdminUser(req.params.id);
      res.json({ success });
    } catch (error) {
      res.status(500).json({ error: "Error deleting user" });
    }
  });

  // Categories
  app.get("/api/categories", async (req, res) => {
    const categories = await storage.getCategories();
    const subcategories = await storage.getSubcategories();
    const result = categories.map((cat) => ({
      ...cat,
      subcategories: subcategories.filter((sub) => sub.categoryId === cat.id),
    }));
    res.json(result);
  });

  app.post("/api/categories", async (req, res) => {
    try {
      const { name, slug } = categorySchema.parse(req.body);
      const category = await storage.createCategory(name, slug);
      res.status(201).json(category);
    } catch (error) {
      res.status(400).json({ error: "Invalid input" });
    }
  });

  app.delete("/api/categories/:id", async (req, res) => {
    const success = await storage.deleteCategory(req.params.id);
    res.json({ success });
  });

  // Subcategories
  app.get("/api/subcategories", async (req, res) => {
    const subcategories = await storage.getSubcategories();
    res.json(subcategories);
  });

  app.post("/api/subcategories", async (req, res) => {
    try {
      const { name, slug, categoryId } = subcategorySchema.parse(req.body);
      const subcategory = await storage.createSubcategory(name, slug, categoryId);
      res.status(201).json(subcategory);
    } catch (error) {
      res.status(400).json({ error: "Invalid input" });
    }
  });

  app.delete("/api/subcategories/:id", async (req, res) => {
    const success = await storage.deleteSubcategory(req.params.id);
    res.json({ success });
  });

  // Plans
  app.get("/api/plans", async (req, res) => {
    const plans = await storage.getPlans();
    res.json(plans);
  });

  app.post("/api/plans", async (req, res) => {
    try {
      const plan = planSchema.parse(req.body);
      const created = await storage.createPlan(plan);
      res.status(201).json(created);
    } catch (error) {
      res.status(400).json({ error: "Invalid input" });
    }
  });

  app.delete("/api/plans/:id", async (req, res) => {
    const success = await storage.deletePlan(req.params.id);
    res.json({ success });
  });

  // Settings
  app.get("/api/settings", async (req, res) => {
    const settings = await storage.getSettings();
    res.json(settings);
  });

  app.post("/api/settings", async (req, res) => {
    try {
      const settings = settingsSchema.parse(req.body);
      const updated = await storage.updateSettings(settings);
      res.json(updated);
    } catch (error) {
      res.status(400).json({ error: "Invalid input" });
    }
  });

  return httpServer;
}
