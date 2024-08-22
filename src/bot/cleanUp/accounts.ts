import { getDocument, updateDocumentById } from "@/firebase";
import { tronWeb } from "@/rpc";
import { StoredAccount } from "@/types";
import {
  feeLimit,
  splitPaymentsWith,
  transactionValidTime,
} from "@/utils/constants";
import { decrypt } from "@/utils/cryptography";
import { errorHandler, log } from "@/utils/handlers";
import { getSecondsElapsed } from "@/utils/time";
import { sendTransaction } from "@/utils/web3";

export async function unlockUnusedAccounts() {
  log("Unlocking unused accounts...");

  const lockedAccounts = (await getDocument({
    collectionName: "accounts",
    queries: [["locked", "==", true]],
  })) as StoredAccount[];

  for (const { id, secretKey, lockedAt } of lockedAccounts) {
    try {
      const decryptedSecretKey = decrypt(secretKey);
      const account = tronWeb.address.fromPrivateKey(decryptedSecretKey);
      const balance = await tronWeb.trx.getBalance(account);
      const durationSinceLocked = lockedAt
        ? getSecondsElapsed(lockedAt.seconds)
        : 999999;
      const isPaymentFinished = durationSinceLocked > transactionValidTime;

      if (!isPaymentFinished) continue;

      if (balance > feeLimit) {
        log(`${account} holds ${balance}`);

        updateDocumentById({
          updates: { locked: true, lockedAt: null },
          collectionName: "accounts",
          id: id || "",
        });

        const result = await sendTransaction(
          decryptedSecretKey,
          balance,
          splitPaymentsWith.main.address
        );

        if (result) log(`${account} emptied`);
      } else {
        updateDocumentById({
          updates: { locked: false, lockedAt: null },
          collectionName: "accounts",
          id: id || "",
        });
        log(`${account} unlocked`);
      }
    } catch (error) {
      errorHandler(error);
    }
  }
}
