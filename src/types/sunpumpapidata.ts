export interface SunPumpTokenData {
  code: number;
  msg: string;
  data: SunPumpTokenMarketData;
}

export interface SunPumpTokenMarketData {
  id: number;
  symbol: string;
  ownerAddress: string;
  contractAddress: string;
  swapPoolAddress: string | null;
  name: string;
  description: string;
  logoUrl: string;
  decimals: number;
  twitterUrl: string;
  telegramUrl: string;
  websiteUrl: string;
  status: string;
  active: boolean;
  syncToTronScan: boolean;
  syncToTronScanDatetime: number;
  totalSupply: number;
  currentSold: number;
  createTxHash: string;
  tokenCreatedInstant: number;
  launchTxHash: string | null;
  priceInTrx: number;
  tokenLaunchedInstant: number | null;
  trxReserve: number;
  tokenReserve: number;
  marketCap: number;
  virtualLiquidity: number;
  volume24Hr: number;
  priceChange24Hr: number;
  pumpPercentage: number;
  trxPriceInUsd: number;
}
