"use client"

import { createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { defineChain } from "viem";

export const Amoy = defineChain({
  id: 80002,
  name: "Polygon Amoy Testnet",
  nativeCurrency: {
    decimals: 18,
    name: "Polygon Amoy Testnet",
    symbol: "MATIC",
  },
  rpcUrls: {
    default: {
      http: ["https://rpc-amoy.polygon.technology/"],
    },
  },
  blockExplorers: {
    default: { name: "oklink", url: "https://www.oklink.com/amoy" },
  },
  contracts: {
    multicall3: {
      address: "0xEDB2C6d8c53A70f107a2a615e8b0C5853D1A61AB",
      blockCreated: 10042646,
    },
  },
});

export async function signMessage(message) {
  const privateKey = process.env.NEXT_PUBLIC_PRIVATE_KEY;
  if (!privateKey) {
    throw new Error(
      "Private key not found. Please set the NEXT_PUBLIC_PRIVATE_KEY environment variable.",
    );
  }
  const account = privateKeyToAccount(`0x${privateKey}`);
  const client = createWalletClient({
    account,
    chain: Amoy,
    transport: http(),
  });

  const signature = await client.signMessage({ message });
  return signature;
}

export function extractSignatureParts(signature) {
  const r = signature.slice(0, 66);
  const s = `0x${signature.slice(66, 130)}`;
  const v = parseInt(signature.slice(130, 132), 16);
  return { r, s, v };
}



