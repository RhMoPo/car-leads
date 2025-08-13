import { 
  vas, leads, settings, 
  type VA, type InsertVA, 
  type Lead, type InsertLead, type LeadWithVA,
  type Settings, type InsertSettings,
  type UpdateLeadStatus
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, or, like, gte } from "drizzle-orm";

export interface IStorage {
  // VA operations
  getVAs(): Promise<VA[]>;
  getVAById(id: string): Promise<VA | undefined>;
  getVAByName(name: string): Promise<VA | undefined>;
  createVA(va: InsertVA): Promise<VA>;

  // Lead operations
  getLeads(filters?: {
    status?: string;
    vaName?: string;
    search?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<LeadWithVA[]>;
  getLeadById(id: string): Promise<LeadWithVA | undefined>;
  createLead(lead: InsertLead): Promise<LeadWithVA>;
  updateLeadStatus(id: string, update: UpdateLeadStatus): Promise<LeadWithVA>;

  // Settings operations
  getSettings(): Promise<Settings>;
  updateSettings(settings: InsertSettings): Promise<Settings>;

  // Analytics
  getKPIs(): Promise<{
    newThisWeek: number;
    approved: number;
    bought: number;
    sold: number;
    avgEstimatedProfit: number;
    avgActualProfit: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  async getVAs(): Promise<VA[]> {
    return await db.select().from(vas).orderBy(vas.name);
  }

  async getVAById(id: string): Promise<VA | undefined> {
    const [va] = await db.select().from(vas).where(eq(vas.id, id));
    return va;
  }

  async getVAByName(name: string): Promise<VA | undefined> {
    const [va] = await db.select().from(vas).where(eq(vas.name, name));
    return va;
  }

  async createVA(insertVA: InsertVA): Promise<VA> {
    const [va] = await db.insert(vas).values(insertVA).returning();
    return va;
  }

  async getLeads(filters?: {
    status?: string;
    vaName?: string;
    search?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<LeadWithVA[]> {
    let query = db
      .select({
        id: leads.id,
        createdAt: leads.createdAt,
        vaId: leads.vaId,
        make: leads.make,
        model: leads.model,
        year: leads.year,
        mileage: leads.mileage,
        askingPrice: leads.askingPrice,
        estimatedSalePrice: leads.estimatedSalePrice,
        estimatedExpenses: leads.estimatedExpenses,
        estimatedProfit: leads.estimatedProfit,
        estimatedCommission: leads.estimatedCommission,
        sellerName: leads.sellerName,
        location: leads.location,
        listingUrl: leads.listingUrl,
        conditionNotes: leads.conditionNotes,
        goodDealReason: leads.goodDealReason,
        status: leads.status,
        actualSalePrice: leads.actualSalePrice,
        actualExpenses: leads.actualExpenses,
        actualProfit: leads.actualProfit,
        actualCommission: leads.actualCommission,
        va: {
          id: vas.id,
          name: vas.name,
          createdAt: vas.createdAt,
        },
      })
      .from(leads)
      .leftJoin(vas, eq(leads.vaId, vas.id));

    const conditions = [];

    if (filters?.status) {
      conditions.push(eq(leads.status, filters.status as any));
    }

    if (filters?.vaName) {
      conditions.push(like(vas.name, `%${filters.vaName}%`));
    }

    if (filters?.search) {
      conditions.push(
        or(
          like(leads.make, `%${filters.search}%`),
          like(leads.model, `%${filters.search}%`),
          like(leads.sellerName, `%${filters.search}%`),
          like(leads.location, `%${filters.search}%`)
        )
      );
    }

    if (filters?.startDate) {
      conditions.push(gte(leads.createdAt, filters.startDate));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const results = await query.orderBy(desc(leads.createdAt));
    
    return results.map(result => ({
      ...result,
      va: result.va!,
    }));
  }

  async getLeadById(id: string): Promise<LeadWithVA | undefined> {
    const [result] = await db
      .select({
        id: leads.id,
        createdAt: leads.createdAt,
        vaId: leads.vaId,
        make: leads.make,
        model: leads.model,
        year: leads.year,
        mileage: leads.mileage,
        askingPrice: leads.askingPrice,
        estimatedSalePrice: leads.estimatedSalePrice,
        estimatedExpenses: leads.estimatedExpenses,
        estimatedProfit: leads.estimatedProfit,
        estimatedCommission: leads.estimatedCommission,
        sellerName: leads.sellerName,
        location: leads.location,
        listingUrl: leads.listingUrl,
        conditionNotes: leads.conditionNotes,
        goodDealReason: leads.goodDealReason,
        status: leads.status,
        actualSalePrice: leads.actualSalePrice,
        actualExpenses: leads.actualExpenses,
        actualProfit: leads.actualProfit,
        actualCommission: leads.actualCommission,
        va: {
          id: vas.id,
          name: vas.name,
          createdAt: vas.createdAt,
        },
      })
      .from(leads)
      .leftJoin(vas, eq(leads.vaId, vas.id))
      .where(eq(leads.id, id));

    if (!result) return undefined;

    return {
      ...result,
      va: result.va!,
    };
  }

  async createLead(insertLead: InsertLead): Promise<LeadWithVA> {
    const [lead] = await db.insert(leads).values(insertLead).returning();
    const result = await this.getLeadById(lead.id);
    return result!;
  }

  async updateLeadStatus(id: string, update: UpdateLeadStatus): Promise<LeadWithVA> {
    const [lead] = await db
      .update(leads)
      .set(update)
      .where(eq(leads.id, id))
      .returning();
    
    const result = await this.getLeadById(lead.id);
    return result!;
  }

  async getSettings(): Promise<Settings> {
    let [currentSettings] = await db.select().from(settings).where(eq(settings.id, 1));
    
    if (!currentSettings) {
      // Create default settings if none exist
      [currentSettings] = await db.insert(settings).values({}).returning();
    }
    
    return currentSettings;
  }

  async updateSettings(newSettings: InsertSettings): Promise<Settings> {
    const [updated] = await db
      .update(settings)
      .set(newSettings)
      .where(eq(settings.id, 1))
      .returning();
    
    return updated;
  }

  async getKPIs(): Promise<{
    newThisWeek: number;
    approved: number;
    bought: number;
    sold: number;
    avgEstimatedProfit: number;
    avgActualProfit: number;
  }> {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const allLeads = await db.select().from(leads);
    
    const newThisWeek = allLeads.filter(lead => 
      new Date(lead.createdAt) >= oneWeekAgo
    ).length;

    const approved = allLeads.filter(lead => 
      lead.status === 'APPROVED' || 
      lead.status === 'CONTACTED' || 
      lead.status === 'BOUGHT' || 
      lead.status === 'SOLD' || 
      lead.status === 'PAID'
    ).length;

    const bought = allLeads.filter(lead => 
      lead.status === 'BOUGHT' || 
      lead.status === 'SOLD' || 
      lead.status === 'PAID'
    ).length;

    const sold = allLeads.filter(lead => 
      lead.status === 'SOLD' || 
      lead.status === 'PAID'
    ).length;

    const avgEstimatedProfit = allLeads.length > 0 
      ? Math.round(allLeads.reduce((sum, lead) => sum + lead.estimatedProfit, 0) / allLeads.length)
      : 0;

    const soldLeads = allLeads.filter(lead => lead.actualProfit !== null);
    const avgActualProfit = soldLeads.length > 0
      ? Math.round(soldLeads.reduce((sum, lead) => sum + (lead.actualProfit || 0), 0) / soldLeads.length)
      : 0;

    return {
      newThisWeek,
      approved,
      bought,
      sold,
      avgEstimatedProfit,
      avgActualProfit,
    };
  }
}

export const storage = new DatabaseStorage();
