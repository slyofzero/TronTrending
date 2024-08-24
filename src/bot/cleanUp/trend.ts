import { updateDocumentById } from "@/firebase";
import { PairsData } from "@/types";
import { SunPumpTokenData } from "@/types/sunpumpapidata";
import { apiFetcher, syncTrendingBuyBot } from "@/utils/api";
import { transactionValidTime } from "@/utils/constants";
import { errorHandler, log } from "@/utils/handlers";
import { getSecondsElapsed } from "@/utils/time";
import { allToTrend, syncToTrend } from "@/vars/trending";

export async function cleanUpPendingToTrend() {
  for (const trend of allToTrend) {
    try {
      const { paidAt, expiresAt, id, status, token } = trend;

      const pairData = await apiFetcher<PairsData>(
        `https://api.dexscreener.com/latest/dex/tokens/${token}`
      );

      const sunpumpData = await apiFetcher<SunPumpTokenData>(
        `https://api-v2.sunpump.meme/pump-api/token/${token}`
      );

      const firstPair = pairData?.data.pairs?.at(0);
      const tokenData = sunpumpData?.data?.data;

      const secondsTillPaymentGeneration = getSecondsElapsed(paidAt.seconds);
      const currentTime = Math.floor(new Date().getTime() / 1e3);
      const fdv = firstPair?.fdv || tokenData?.marketCap || 0;

      if (
        fdv < 2_500 ||
        (secondsTillPaymentGeneration > transactionValidTime &&
          status === "PENDING") ||
        (expiresAt &&
          currentTime > expiresAt?.seconds &&
          (status === "PAID" || status == "MANUAL"))
      ) {
        await updateDocumentById({
          updates: { status: "EXPIRED" },
          collectionName: "to_trend",
          id: id || "",
        });
        log(`Trend ${id} expired`);

        syncTrendingBuyBot();

        await syncToTrend();
      }
    } catch (error) {
      errorHandler(error);
    }
  }
}
