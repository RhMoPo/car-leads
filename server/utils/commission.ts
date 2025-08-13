import type { Settings } from "@shared/schema";

export function estimateCommission(profit: number, settings: Settings): number {
  if (profit < settings.smallMax) {
    return settings.flatSmall;
  }
  if (profit <= settings.mediumMax) {
    return Math.round(profit * settings.percentMedium);
  }
  return Math.round(profit * settings.percentLarge);
}

export function calculateProfit(salePrice: number, askingPrice: number, expenses: number): number {
  return Math.max(0, salePrice - askingPrice - expenses);
}
