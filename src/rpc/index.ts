import { RPC_ENDPOINT } from "@/utils/env";
import { log } from "@/utils/handlers";
import { TronWeb } from "tronweb";

export const tronWeb: TronWeb = new TronWeb({
  fullHost: RPC_ENDPOINT,
  headers: { "TRON-PRO-API-KEY": "0dbf7a42-2efb-422e-9593-5017b678c8d6" },
  privateKey: "",
});

export function rpcConfig() {
  if (!RPC_ENDPOINT) {
    log("RPC endpoint is undefined");
    process.exit(1);
  }
}
