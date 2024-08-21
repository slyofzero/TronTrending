import { errorHandler, log } from "./handlers";
import { splitPaymentsWith } from "./constants";
import { tronWeb } from "@/rpc";
import { decrypt } from "./cryptography";

export async function generateAccount() {
  const account = await tronWeb.createAccount();
  return { publicKey: account.address.base58, secretKey: account.privateKey };
}

export async function sendTransaction(
  privateKey: string,
  amount: number,
  to: string
) {
  try {
    const wallet = tronWeb.address.fromPrivateKey(privateKey);
    const txn = await tronWeb.transactionBuilder.sendTrx(
      to,
      amount,
      String(wallet)
    );
    const signedTx = await tronWeb.trx.sign(txn, privateKey);
    const result = await tronWeb.trx.sendRawTransaction(signedTx);

    return result.result;
  } catch (error) {
    log(`No transaction for ${amount} to ${to}`);
    errorHandler(error);
  }
}

export async function splitPayment(secretKey: string) {
  try {
    const decryptedSecretKey = decrypt(secretKey);
    const account = tronWeb.address.fromPrivateKey(decryptedSecretKey);
    const balance = await tronWeb.trx.getBalance(account);
    const { main } = splitPaymentsWith;
    const mainTx = await sendTransaction(
      decryptedSecretKey,
      balance,
      main.address
    );

    if (mainTx) log(`Main share ${balance} sent ${mainTx}`);
  } catch (error) {
    errorHandler(error);
  }
}
