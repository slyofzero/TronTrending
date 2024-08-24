import { Bot } from "grammy";
import { initiateBotCommands, initiateCallbackQueries } from "./bot";
import { log } from "./utils/handlers";
import { BOT_TOKEN, PORT } from "./utils/env";
import { processTrendingPairs } from "./bot/processTrendingPairs";
import { sleep } from "./utils/time";
import { syncToTrend, toTrendTokens, trendingTokens } from "./vars/trending";
import { updateTrendingMessage } from "./bot/updateTrendingMessage";
import { advertisements, syncAdvertisements } from "./vars/advertisements";
import { cleanUpExpired } from "./bot/cleanUp";
import express, { Request, Response } from "express";
import { syncAdmins } from "./vars/admins";
import { unlockUnusedAccounts } from "./bot/cleanUp/accounts";
import { checkNewTrending } from "./bot/checkNewTrending";
import { trendingMessageId } from "./vars/message";
import { rpcConfig } from "./rpc";
import { isPairData } from "./utils/type";

export const teleBot = new Bot(BOT_TOKEN || "");
log("Bot instance ready");

const app = express();
log("Express server ready");

export async function sendMessages() {
  log("To repeat");
  await processTrendingPairs();
  await checkNewTrending();
  await updateTrendingMessage();

  cleanUpExpired();
}

(async function () {
  rpcConfig();
  teleBot.start();
  log("Telegram bot setup");
  initiateBotCommands();
  initiateCallbackQueries();

  await Promise.all([
    syncToTrend(),
    syncAdvertisements(),
    syncAdmins(),
    unlockUnusedAccounts(),
  ]);

  setInterval(unlockUnusedAccounts, 5 * 60 * 1e3);
  // connectWebSocket();

  app.use(express.json());

  app.get("/ping", (req: Request, res: Response) => {
    return res.json({ message: "Server is up" });
  });

  app.get("/trending", (req: Request, res: Response) => {
    const trendingTokensAndPairs: { [key: string]: string } = {};
    for (const [token, tokenData] of trendingTokens) {
      let pair = "";

      if (isPairData(tokenData)) {
        pair = tokenData.pairAddress;
      } else {
        pair = tokenData.swapPoolAddress || "";
      }

      trendingTokensAndPairs[token] = pair;
    }

    return res.status(200).json({ trendingTokens: trendingTokensAndPairs });
  });

  app.get("/getLastMessage", (req: Request, res: Response) => {
    return res.status(200).json({ messageId: trendingMessageId });
  });

  app.post("/syncTrending", async (req: Request, res: Response) => {
    await syncToTrend();
    return res.status(200).json({ toTrendTokens });
  });

  app.post("/syncAdvertisements", async (req: Request, res: Response) => {
    await syncAdvertisements();
    return res.status(200).json({ advertisements });
  });

  app.listen(PORT, () => {
    log(`Server is running on port ${PORT}`);
  });

  await sendMessages();
  sleep(5 * 60 * 1e3).then(() => sendMessages());
})();
