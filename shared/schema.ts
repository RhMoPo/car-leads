import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, pgEnum, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const leadStatusEnum = pgEnum("lead_status", [
  "PENDING",
  "APPROVED", 
  "REJECTED",
  "CONTACTED",
  "BOUGHT",
  "SOLD",
  "PAID"
]);

export const vas = pgTable("vas", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const leads = pgTable("leads", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  vaId: varchar("va_id").notNull().references(() => vas.id),
  make: text("make").notNull(),
  model: text("model").notNull(),
  year: integer("year").notNull(),
  mileage: integer("mileage").notNull(),
  askingPrice: integer("asking_price").notNull(),
  estimatedSalePrice: integer("estimated_sale_price").notNull(),
  estimatedExpenses: integer("estimated_expenses").default(0).notNull(),
  estimatedProfit: integer("estimated_profit").notNull(),
  estimatedCommission: integer("estimated_commission").notNull(),
  sellerName: text("seller_name").notNull(),
  location: text("location").notNull(),
  listingUrl: text("listing_url").notNull(),
  conditionNotes: text("condition_notes").notNull(),
  goodDealReason: text("good_deal_reason").notNull(),
  status: leadStatusEnum("status").default("PENDING").notNull(),
  // Actual values when sold
  actualSalePrice: integer("actual_sale_price"),
  actualExpenses: integer("actual_expenses"),
  actualProfit: integer("actual_profit"),
  actualCommission: integer("actual_commission"),
});

export const settings = pgTable("settings", {
  id: integer("id").primaryKey().default(1),
  radiusMiles: integer("radius_miles").default(30).notNull(),
  allowedRegions: text("allowed_regions").default("Hereford or Worcester, UK").notNull(),
  flatSmall: integer("flat_small").default(40).notNull(),
  smallMax: integer("small_max").default(400).notNull(),
  mediumMax: integer("medium_max").default(800).notNull(),
  percentMedium: real("percent_medium").default(0.10).notNull(),
  percentLarge: real("percent_large").default(0.15).notNull(),
  videoIntroUrl: text("video_intro_url"),
  videoFindUrl: text("video_find_url"),
  videoPriceUrl: text("video_price_url"),
  videoUseUrl: text("video_use_url"),
});

// Relations
export const vasRelations = relations(vas, ({ many }) => ({
  leads: many(leads),
}));

export const leadsRelations = relations(leads, ({ one }) => ({
  va: one(vas, {
    fields: [leads.vaId],
    references: [vas.id],
  }),
}));

// Insert schemas
export const insertVASchema = createInsertSchema(vas).omit({
  id: true,
  createdAt: true,
});

export const insertLeadSchema = createInsertSchema(leads).omit({
  id: true,
  createdAt: true,
  estimatedProfit: true,
  estimatedCommission: true,
  actualProfit: true,
  actualCommission: true,
}).extend({
  year: z.number().min(2010, "Year must be 2010 or newer"),
  askingPrice: z.number().max(3000, "Asking price must be £3,000 or less"),
  location: z.string().refine(
    (val) => val.toLowerCase().includes("hereford") || val.toLowerCase().includes("worcester"),
    "Location must include Hereford or Worcester"
  ),
  listingUrl: z.string().url("Must be a valid URL"),
});

export const insertSettingsSchema = createInsertSchema(settings).omit({
  id: true,
});

export const updateLeadStatusSchema = z.object({
  status: z.enum(["PENDING", "APPROVED", "REJECTED", "CONTACTED", "BOUGHT", "SOLD", "PAID"]),
  actualSalePrice: z.number().optional(),
  actualExpenses: z.number().optional(),
});

// Types
export type InsertVA = z.infer<typeof insertVASchema>;
export type VA = typeof vas.$inferSelect;
export type InsertLead = z.infer<typeof insertLeadSchema>;
export type Lead = typeof leads.$inferSelect;
export type LeadWithVA = Lead & { va: VA };
export type InsertSettings = z.infer<typeof insertSettingsSchema>;
export type Settings = typeof settings.$inferSelect;
export type UpdateLeadStatus = z.infer<typeof updateLeadStatusSchema>;
