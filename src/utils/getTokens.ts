import { HotPairs } from "@/types/hotpairs";
import { apiFetcher } from "./api";
import { DEXTOOLS_API_KEY } from "./env";

export async function getTrendingTokens() {
  // const browser = await puppeteer.launch({ headless: true });
  // const page = await browser.newPage();
  // // const ws = new WebSocket(DEX_URL || "", { headers: wssHeaders });
  // await page.goto(
  //   "https://app.geckoterminal.com/api/p1/tron/pools?include=dex,dex.network,dex.network.network_metric,tokens&page=1&include_network_metrics=true&sort=-1h_trend_score&networks=tron"
  // );
  // const allText = await page.evaluate(() => {
  //   return document.body.innerText;
  // });
  // await browser.close();
  // return JSON.parse(allText) as TrendingAPIData;

  const trendingTokens = await apiFetcher<HotPairs>(
    `https://public-api.dextools.io/standard/v2/ranking/tron/hotpools`,
    { "X-API-KEY": DEXTOOLS_API_KEY || "" }
  );

  return trendingTokens?.data.data || [];
}
