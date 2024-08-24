import { PairData, PairsData } from "@/types";
import {
  SunPumpTokenData,
  SunPumpTokenMarketData,
} from "@/types/sunpumpapidata";
import { TrendingTokens } from "@/types/trending";
import { apiFetcher, syncTrendingBuyBot } from "@/utils/api";
import { getTrendingTokens } from "@/utils/getTokens";
import { log } from "@/utils/handlers";
import {
  previouslyTrendingTokens,
  setTopTrendingTokens,
  toTrendTokens,
} from "@/vars/trending";

export const timeSinceTrending: { [key: string]: number } = {};

export async function processTrendingPairs() {
  let newTopTrendingTokens: TrendingTokens = [];

  const trendingPoolsList = await getTrendingTokens();

  for (const tokenData of trendingPoolsList) {
    if (newTopTrendingTokens.length >= 15) break;

    const { address } = tokenData;
    try {
      const pairData = await apiFetcher<PairsData>(
        `https://api.dexscreener.com/latest/dex/pairs/tron/${address}`
      );

      const tokenAlreadyInTop15 = newTopTrendingTokens.some(
        ([token]) => token === address
      );

      const firstPair = pairData?.data.pairs?.at(0);
      if (!firstPair || tokenAlreadyInTop15) continue;
      const tokenAddress = firstPair.baseToken.address;

      newTopTrendingTokens.push([tokenAddress, firstPair]);
    } catch (error) {
      continue;
    }
  }

  for (const { slot, token } of toTrendTokens) {
    const alreadyTrendingRank = newTopTrendingTokens.findIndex(
      ([storedToken]) => storedToken === token
    );

    let slotRange = [1, 3];
    if (slot === 2) slotRange = [1, 8];
    else if (slot === 3) slotRange = [1, 15];

    const [min, max] = slotRange;
    const slotToTrend = Math.floor(Math.random() * (max - min + 1)) + min;

    if (alreadyTrendingRank !== -1) {
      if (slotToTrend < alreadyTrendingRank) {
        const [tokenData] = newTopTrendingTokens.splice(alreadyTrendingRank, 1);
        newTopTrendingTokens.splice(slotToTrend, 0, tokenData);
      }
      continue;
    }

    const pairData = await apiFetcher<PairsData>(
      `https://api.dexscreener.com/latest/dex/tokens/${token}`
    );

    const sunpumpData = await apiFetcher<SunPumpTokenData>(
      `https://api-v2.sunpump.meme/pump-api/token/${token}`
    );

    const firstPair = pairData?.data.pairs?.at(0);
    const tokenData = sunpumpData?.data.data;
    const availableData = firstPair || tokenData;
    if (!availableData) continue;
    const newTrendingPair: [string, PairData | SunPumpTokenMarketData] = [
      token,
      availableData,
    ];
    newTopTrendingTokens.splice(slotToTrend - 1, 0, newTrendingPair);
  }

  newTopTrendingTokens = newTopTrendingTokens.slice(0, 15);
  setTopTrendingTokens(newTopTrendingTokens);

  if (previouslyTrendingTokens.length !== newTopTrendingTokens.length) {
    log(
      `Trending tokens set, tokens trending now - ${newTopTrendingTokens.length}`
    );
  }

  for (const [token] of newTopTrendingTokens) {
    if (!previouslyTrendingTokens.includes(token)) {
      timeSinceTrending[token] = Date.now();
      log(`${token} added to trending list`);
      syncTrendingBuyBot();
      break;
    }
  }
}
