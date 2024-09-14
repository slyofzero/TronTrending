import { BOT_USERNAME, CHANNEL_ID, DISCLAIMER_LINK } from "@/utils/env";
import { errorHandler, log } from "@/utils/handlers";
import { toTrendTokens, trendingTokens } from "@/vars/trending";
import { setLastEditted, trendingMessageId } from "@/vars/message";
import { teleBot } from "..";
import {
  cleanUpBotMessage,
  generateAdvertisementKeyboard,
  hardCleanUpBotMessage,
  sendNewTrendingMessage,
} from "@/utils/bot";
import { validEditMessageTextErrors } from "@/utils/constants";
import { isPairData } from "@/utils/type";

export async function updateTrendingMessage() {
  if (!CHANNEL_ID) {
    return log("Channel ID or PINNED_MSG_ID is undefined");
  }

  log("Updating trending message...");

  let trendingTokensMessage = `*HYPE TRON TRENDING* \\| [*Disclaimer*](${DISCLAIMER_LINK})\n\n`;
  const icons = [
    "🥇",
    "🥈",
    "🥉",
    "4️⃣",
    "5️⃣",
    "6️⃣",
    "7️⃣",
    "8️⃣",
    "9️⃣",
    "🔟",
    "11",
    "12",
    "13",
    "14",
    "15",
  ];

  try {
    // ------------------------------ Trending Message ------------------------------
    for (const [index, [token, tokenData]] of trendingTokens.entries()) {
      let symbol = "";
      let priceChangeh24 = 0;
      let info = null;

      if (isPairData(tokenData)) {
        symbol = tokenData.baseToken.symbol;
        priceChangeh24 = tokenData.priceChange.h24;
        info = tokenData.info;
      } else {
        symbol = tokenData.symbol;
        priceChangeh24 = tokenData.priceChange24Hr;
      }

      const icon = icons[index] || "🔥";

      const telegramLink = info?.socials?.find(
        ({ type }) => type === "telegram"
      )?.url;

      const tokenSocials = toTrendTokens.find(
        ({ token: storedToken }) => storedToken === token
      )?.socials;

      const dexSLink = `https://dexscreener.com/tron/${token}`;

      const url = tokenSocials || telegramLink || dexSLink;
      // const scanUrl = `https://t.me/ttfbotbot?start=${token}`;
      // const buyUrl = `https://t.me/magnum_trade_bot?start=PHryLEnW_snipe_${token}`;

      const cleanedTokenSymbol = hardCleanUpBotMessage(symbol);
      // const trendingDuration =
      //   Date.now() - timeSinceTrending[token] < NEW_THRESHOLD;
      const tokenText = `${cleanUpBotMessage(priceChangeh24)}%`;
      const formattedPriceChange = `[${tokenText}](${dexSLink})`;

      const indentation =
        (index + 1) % 5 === 0 && index != 14 ? "————————————\n" : "";

      let newLine = `${icon} \\- [*${cleanedTokenSymbol}*](${url}) \\| ${formattedPriceChange}\n${indentation}`;
      newLine = newLine.trimStart();
      trendingTokensMessage += newLine;
    }

    setLastEditted(new Date().toLocaleTimeString());
    trendingTokensMessage += `\n_ℹ️ Trending data is automatically updated by @${BOT_USERNAME} every minute_`;

    // ------------------------------ Advertisements ------------------------------
    const keyboard = generateAdvertisementKeyboard();

    try {
      await teleBot.api.editMessageText(
        CHANNEL_ID,
        trendingMessageId,
        trendingTokensMessage,
        {
          parse_mode: "MarkdownV2",
          // @ts-expect-error Type not found
          disable_web_page_preview: true,
          reply_markup: keyboard,
        }
      );
      teleBot.api.pinChatMessage(CHANNEL_ID || "", trendingMessageId);
      log(`Updated Message ${trendingMessageId}`);
    } catch (err) {
      const error = err as Error;
      errorHandler(err);

      const isValidEditError = validEditMessageTextErrors.some((errors) =>
        error.message.includes(errors)
      );

      if (isValidEditError) sendNewTrendingMessage(trendingTokensMessage);
    }
  } catch (error) {
    errorHandler(error);
  }
}
