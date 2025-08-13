import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import rateLimit from "express-rate-limit";
import { storage } from "./storage";
import { validateAdminPassword, requireAuth, setAdminSession, clearAdminSession } from "./middleware/auth";
import { estimateCommission, calculateProfit } from "./utils/commission";
import { validateConditions, validateHoneypot } from "./utils/validation";
import { insertLeadSchema, insertVASchema, insertSettingsSchema, updateLeadStatusSchema } from "@shared/schema";

// Rate limiting for public endpoints
const submitLeadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // 20 requests per hour per IP
  message: { message: "Too many lead submissions. Please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Auth routes
  app.post("/api/login", async (req: Request, res: Response) => {
    try {
      const { password } = req.body;
      
      if (!password) {
        return res.status(400).json({ message: "Password is required" });
      }
      
      const isValid = await validateAdminPassword(password);
      if (!isValid) {
        return res.status(401).json({ message: "Invalid password" });
      }
      
      await setAdminSession(req, res);
      res.json({ message: "Login successful" });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  app.post("/api/logout", async (req: Request, res: Response) => {
    try {
      await clearAdminSession(req, res);
      res.json({ message: "Logout successful" });
    } catch (error) {
      res.status(500).json({ message: "Logout failed" });
    }
  });

  // VA routes
  app.get("/api/vas", async (req: Request, res: Response) => {
    try {
      const vas = await storage.getVAs();
      res.json(vas);
    } catch (error) {
      console.error("Error fetching VAs:", error);
      res.status(500).json({ message: "Failed to fetch VAs" });
    }
  });

  app.post("/api/vas", async (req: Request, res: Response) => {
    try {
      const validatedData = insertVASchema.parse(req.body);
      
      // Check if VA already exists
      const existingVA = await storage.getVAByName(validatedData.name);
      if (existingVA) {
        return res.status(400).json({ message: "VA with this name already exists" });
      }
      
      const va = await storage.createVA(validatedData);
      res.status(201).json(va);
    } catch (error: any) {
      if (error.name === "ZodError") {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error creating VA:", error);
      res.status(500).json({ message: "Failed to create VA" });
    }
  });

  // Lead routes
  app.get("/api/leads", async (req: Request, res: Response) => {
    try {
      const { status, vaName, search, startDate, endDate } = req.query;
      
      const filters: any = {};
      if (status) filters.status = status as string;
      if (vaName) filters.vaName = vaName as string;
      if (search) filters.search = search as string;
      if (startDate) filters.startDate = new Date(startDate as string);
      if (endDate) filters.endDate = new Date(endDate as string);
      
      const leads = await storage.getLeads(filters);
      res.json(leads);
    } catch (error) {
      console.error("Error fetching leads:", error);
      res.status(500).json({ message: "Failed to fetch leads" });
    }
  });

  app.post("/api/leads", submitLeadLimiter, async (req: Request, res: Response) => {
    try {
      const { honeypot, vaName, newVaName, conditions, ...leadData } = req.body;
      
      // Honeypot validation
      if (!validateHoneypot(honeypot)) {
        return res.status(400).json({ message: "Spam detected" });
      }
      
      // Condition validation
      const conditionValidation = validateConditions(conditions);
      if (!conditionValidation.valid) {
        return res.status(400).json({ 
          message: "Lead rejected due to major issues", 
          errors: conditionValidation.errors 
        });
      }
      
      // Determine VA
      let vaId: string;
      if (vaName && vaName !== "_new") {
        const existingVA = await storage.getVAByName(vaName);
        if (!existingVA) {
          return res.status(400).json({ message: "Selected VA not found" });
        }
        vaId = existingVA.id;
      } else if (newVaName) {
        // Create new VA
        const existingVA = await storage.getVAByName(newVaName);
        if (existingVA) {
          vaId = existingVA.id;
        } else {
          const newVA = await storage.createVA({ name: newVaName });
          vaId = newVA.id;
        }
      } else {
        return res.status(400).json({ message: "VA name is required" });
      }
      
      // Get current settings for calculations
      const settings = await storage.getSettings();
      
      // Calculate profit and commission
      const estimatedProfit = calculateProfit(
        leadData.estimatedSalePrice,
        leadData.askingPrice,
        leadData.estimatedExpenses || 0
      );
      const estimatedCommission = estimateCommission(estimatedProfit, settings);
      
      // Validate lead data
      const validatedData = insertLeadSchema.parse({
        ...leadData,
        vaId,
        estimatedProfit,
        estimatedCommission,
      });
      
      const lead = await storage.createLead(validatedData);
      
      res.status(201).json({
        lead,
        estimatedProfit,
        estimatedCommission,
      });
    } catch (error: any) {
      if (error.name === "ZodError") {
        return res.status(400).json({ message: "Validation failed", errors: error.errors });
      }
      console.error("Error creating lead:", error);
      res.status(500).json({ message: "Failed to create lead" });
    }
  });

  app.patch("/api/leads/:id/status", requireAuth, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const updateData = updateLeadStatusSchema.parse(req.body);
      
      // If setting to SOLD, calculate actual profit and commission
      if (updateData.status === "SOLD") {
        if (!updateData.actualSalePrice) {
          return res.status(400).json({ message: "Actual sale price is required when marking as sold" });
        }
        
        const lead = await storage.getLeadById(id);
        if (!lead) {
          return res.status(404).json({ message: "Lead not found" });
        }
        
        const settings = await storage.getSettings();
        const actualProfit = calculateProfit(
          updateData.actualSalePrice,
          lead.askingPrice,
          updateData.actualExpenses || 0
        );
        const actualCommission = estimateCommission(actualProfit, settings);
        
        updateData.actualProfit = actualProfit;
        updateData.actualCommission = actualCommission;
      }
      
      const updatedLead = await storage.updateLeadStatus(id, updateData);
      res.json(updatedLead);
    } catch (error: any) {
      if (error.name === "ZodError") {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error updating lead status:", error);
      res.status(500).json({ message: "Failed to update lead status" });
    }
  });

  // Settings routes (admin only)
  app.get("/api/settings", async (req: Request, res: Response) => {
    try {
      const settings = await storage.getSettings();
      res.json(settings);
    } catch (error) {
      console.error("Error fetching settings:", error);
      res.status(500).json({ message: "Failed to fetch settings" });
    }
  });

  app.patch("/api/settings", requireAuth, async (req: Request, res: Response) => {
    try {
      const validatedData = insertSettingsSchema.parse(req.body);
      const settings = await storage.updateSettings(validatedData);
      res.json(settings);
    } catch (error: any) {
      if (error.name === "ZodError") {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error updating settings:", error);
      res.status(500).json({ message: "Failed to update settings" });
    }
  });

  // KPI route (admin only)
  app.get("/api/kpis", requireAuth, async (req: Request, res: Response) => {
    try {
      const kpis = await storage.getKPIs();
      res.json(kpis);
    } catch (error) {
      console.error("Error fetching KPIs:", error);
      res.status(500).json({ message: "Failed to fetch KPIs" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
