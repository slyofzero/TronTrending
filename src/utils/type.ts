import { TrendingData } from "@/types";
import { SunPumpTokenMarketData } from "@/types/sunpumpapidata";

export function isPairData(
  data: TrendingData | SunPumpTokenMarketData
): data is TrendingData {
  return (data as TrendingData).fdv !== undefined;
}

// Type guard export function to check if the data is SunPumpTokenMarketData
export function isSunPumpTokenData(
  data: TrendingData | SunPumpTokenMarketData
): data is SunPumpTokenMarketData {
  return (data as SunPumpTokenMarketData).trxPriceInUsd !== undefined;
}
