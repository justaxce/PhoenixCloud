import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { categorySchema, subcategorySchema, planSchema, settingsSchema, faqSchema, teamMemberSchema, aboutPageSchema } from "@shared/schema";

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
    try {
      const categories = await storage.getCategories();
      const subcategories = await storage.getSubcategories();
      const result = categories.map((cat) => ({
        ...cat,
        subcategories: subcategories.filter((sub) => sub.categoryId === cat.id),
      }));
      res.json(result);
    } catch (error: any) {
      console.error("Error fetching categories:", error.message);
      res.status(503).json({ error: "Database temporarily unavailable", data: [] });
    }
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

  app.patch("/api/categories/:id", async (req, res) => {
    try {
      const { name, slug } = categorySchema.parse(req.body);
      const category = await storage.updateCategory(req.params.id, name, slug);
      if (category) {
        res.json(category);
      } else {
        res.status(404).json({ error: "Category not found" });
      }
    } catch (error) {
      res.status(400).json({ error: "Invalid input" });
    }
  });

  app.delete("/api/categories/:id", async (req, res) => {
    try {
      const success = await storage.deleteCategory(req.params.id);
      res.json({ success });
    } catch (error: any) {
      console.error("Error deleting category:", error.message);
      res.status(500).json({ error: "Error deleting category" });
    }
  });

  // Subcategories
  app.get("/api/subcategories", async (req, res) => {
    try {
      const subcategories = await storage.getSubcategories();
      res.json(subcategories);
    } catch (error: any) {
      console.error("Error fetching subcategories:", error.message);
      res.status(503).json([]);
    }
  });

  app.post("/api/subcategories", async (req, res) => {
    try {
      const { name, slug, categoryId, order } = subcategorySchema.parse(req.body);
      const subcategory = await storage.createSubcategory(name, slug, categoryId, order);
      res.status(201).json(subcategory);
    } catch (error) {
      res.status(400).json({ error: "Invalid input" });
    }
  });

  app.patch("/api/subcategories/:id", async (req, res) => {
    try {
      const { name, slug, order } = subcategorySchema.parse(req.body);
      const subcategory = await storage.updateSubcategory(req.params.id, name, slug, order);
      if (subcategory) {
        res.json(subcategory);
      } else {
        res.status(404).json({ error: "Subcategory not found" });
      }
    } catch (error) {
      res.status(400).json({ error: "Invalid input" });
    }
  });

  app.delete("/api/subcategories/:id", async (req, res) => {
    try {
      const success = await storage.deleteSubcategory(req.params.id);
      res.json({ success });
    } catch (error: any) {
      console.error("Error deleting subcategory:", error.message);
      res.status(500).json({ error: "Error deleting subcategory" });
    }
  });

  // Plans
  app.get("/api/plans", async (req, res) => {
    try {
      const plans = await storage.getPlans();
      res.json(plans);
    } catch (error: any) {
      console.error("Error fetching plans:", error.message);
      res.status(503).json([]);
    }
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

  app.patch("/api/plans/:id", async (req, res) => {
    try {
      const plan = planSchema.parse(req.body);
      const updated = await storage.updatePlan(req.params.id, plan);
      if (updated) {
        res.json(updated);
      } else {
        res.status(404).json({ error: "Plan not found" });
      }
    } catch (error) {
      res.status(400).json({ error: "Invalid input" });
    }
  });

  app.delete("/api/plans/:id", async (req, res) => {
    try {
      const success = await storage.deletePlan(req.params.id);
      res.json({ success });
    } catch (error: any) {
      console.error("Error deleting plan:", error.message);
      res.status(500).json({ error: "Error deleting plan" });
    }
  });

  // FAQs
  app.get("/api/faqs", async (req, res) => {
    try {
      const faqs = await storage.getFAQs();
      res.json(faqs);
    } catch (error: any) {
      console.error("Error fetching FAQs:", error.message);
      res.status(503).json([]);
    }
  });

  app.post("/api/faqs", async (req, res) => {
    try {
      const { question, answer } = faqSchema.parse(req.body);
      const faq = await storage.createFAQ(question, answer);
      res.status(201).json(faq);
    } catch (error) {
      res.status(400).json({ error: "Invalid input" });
    }
  });

  app.patch("/api/faqs/:id", async (req, res) => {
    try {
      const { question, answer } = faqSchema.parse(req.body);
      const faq = await storage.updateFAQ(req.params.id, question, answer);
      if (faq) {
        res.json(faq);
      } else {
        res.status(404).json({ error: "FAQ not found" });
      }
    } catch (error) {
      res.status(400).json({ error: "Invalid input" });
    }
  });

  app.delete("/api/faqs/:id", async (req, res) => {
    try {
      const success = await storage.deleteFAQ(req.params.id);
      res.json({ success });
    } catch (error: any) {
      console.error("Error deleting FAQ:", error.message);
      res.status(500).json({ error: "Error deleting FAQ" });
    }
  });

  // Settings
  app.get("/api/settings", async (req, res) => {
    try {
      const settings = await storage.getSettings();
      res.json(settings);
    } catch (error: any) {
      console.error("Error fetching settings:", error.message);
      res.status(503).json({ 
        currency: "usd", 
        supportLink: "", 
        redirectLink: "",
        heroTitleLine1: "Cloud Hosting That",
        heroTitleLine2: "Rises Above",
        heroDescription: "Experience blazing-fast performance with Phoenix Cloud. 99.9% uptime guarantee, instant scaling, and 24/7 expert support.",
        stat1Value: "99.9%",
        stat1Label: "Uptime SLA",
        stat2Value: "50+",
        stat2Label: "Global Locations",
        stat3Value: "24/7",
        stat3Label: "Expert Support",
        featuresSectionTitle: "Why Choose Phoenix Cloud?",
        featuresSectionDescription: "Built for performance, reliability, and ease of use.",
        feature1Title: "Blazing Fast",
        feature1Description: "NVMe SSD storage and optimized infrastructure for lightning-quick load times.",
        feature2Title: "DDoS Protection",
        feature2Description: "Enterprise-grade protection against attacks, keeping your services online.",
        feature3Title: "Global Network",
        feature3Description: "Strategically located data centers for low latency worldwide.",
        feature4Title: "Instant Scaling",
        feature4Description: "Scale resources up or down instantly based on your needs.",
        feature5Title: "24/7 Support",
        feature5Description: "Expert support team available around the clock via Discord and tickets.",
        feature6Title: "99.9% Uptime",
        feature6Description: "Industry-leading SLA with guaranteed uptime for your peace of mind.",
        ctaTitle: "Ready to Rise Above?",
        ctaDescription: "Join thousands of satisfied customers who trust Phoenix Cloud for their hosting needs. Get started in minutes.",
        backgroundImageLight: "",
        backgroundImageDark: ""
      });
    }
  });

  app.post("/api/settings", async (req, res) => {
    try {
      const settings = settingsSchema.parse(req.body);
      const updated = await storage.updateSettings(settings as any);
      res.json(updated);
    } catch (error: any) {
      console.error("Settings error:", error.message);
      if (error.message.includes("validation")) {
        res.status(400).json({ error: "Invalid input" });
      } else {
        res.status(503).json({ error: "Database temporarily unavailable" });
      }
    }
  });

  // Team Members
  app.get("/api/team-members", async (req, res) => {
    try {
      const members = await storage.getTeamMembers();
      res.json(members);
    } catch (error: any) {
      console.error("Error fetching team members:", error.message);
      res.status(503).json([]);
    }
  });

  app.post("/api/team-members", async (req, res) => {
    try {
      const member = teamMemberSchema.parse(req.body);
      const created = await storage.createTeamMember({
        name: member.name,
        role: member.role,
        imageUrl: member.imageUrl || "",
        order: member.order || 0,
      });
      res.status(201).json(created);
    } catch (error) {
      res.status(400).json({ error: "Invalid input" });
    }
  });

  app.patch("/api/team-members/:id", async (req, res) => {
    try {
      const member = teamMemberSchema.parse(req.body);
      const updated = await storage.updateTeamMember(req.params.id, member);
      if (updated) {
        res.json(updated);
      } else {
        res.status(404).json({ error: "Team member not found" });
      }
    } catch (error) {
      res.status(400).json({ error: "Invalid input" });
    }
  });

  app.delete("/api/team-members/:id", async (req, res) => {
    try {
      const success = await storage.deleteTeamMember(req.params.id);
      res.json({ success });
    } catch (error: any) {
      console.error("Error deleting team member:", error.message);
      res.status(500).json({ error: "Error deleting team member" });
    }
  });

  // About Page Content
  app.get("/api/about", async (req, res) => {
    try {
      const content = await storage.getAboutPageContent();
      res.json(content);
    } catch (error: any) {
      console.error("Error fetching about page content:", error.message);
      res.status(503).json({
        heroTitle: "This is our story",
        heroSubtitle: "About us",
        companyName: "Phoenix Cloud",
        companyDescription: "Web & Game Hosting Business focused on high-performance hosting.",
        storyTitle: "The beginning",
        storyContent: "Phoenix Cloud started with a simple goal: to provide reliable and high-performance server hosting.",
        yearsExperience: "1",
        visionTitle: "Our Vision",
        visionContent: "Our vision is to provide the most reliable, high-performance hosting services.",
        missionTitle: "Our Mission",
        missionContent: "Our mission is to deliver the best server hosting experience.",
        teamSectionTitle: "Behind the scene",
        teamSectionSubtitle: "Our solid team",
        stat1Value: "150",
        stat1Label: "Happy Clients",
        stat2Value: "300",
        stat2Label: "Servers Ordered",
        stat3Value: "10",
        stat3Label: "Awards Winning",
        stat4Value: "1",
        stat4Label: "Years Experience",
      });
    }
  });

  app.post("/api/about", async (req, res) => {
    try {
      const content = aboutPageSchema.parse(req.body);
      const updated = await storage.updateAboutPageContent(content);
      res.json(updated);
    } catch (error: any) {
      console.error("About page error:", error.message);
      if (error.message.includes("validation")) {
        res.status(400).json({ error: "Invalid input" });
      } else {
        res.status(503).json({ error: "Database temporarily unavailable" });
      }
    }
  });

  return httpServer;
}
