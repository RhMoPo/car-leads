export interface LeadFormData {
  vaName: string;
  newVaName?: string;
  make: string;
  model: string;
  year: number;
  mileage: number;
  askingPrice: number;
  estimatedSalePrice: number;
  estimatedExpenses: number;
  sellerName: string;
  location: string;
  listingUrl: string;
  conditionNotes: string;
  goodDealReason: string;
  conditions?: string[];
  honeypot?: string;
}

export interface KPIData {
  newThisWeek: number;
  approved: number;
  bought: number;
  sold: number;
  avgEstimatedProfit: number;
  avgActualProfit: number;
}

export interface StatusUpdateData {
  status: string;
  actualSalePrice?: number;
  actualExpenses?: number;
}
