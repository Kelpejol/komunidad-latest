import { useAddress, useContract, useContractWrite } from "@thirdweb-dev/react";
import { createWalletClient, http, parseEther } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { KomEngineAddress, KomEngineAbi } from "./constants";
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
// Function to sign messages
export async function signMessage(message) {
  const privateKey = process.env.NEXT_PUBLIC_PRIVATE_KEY;
  const account = privateKeyToAccount(`0x${privateKey}`);
  const client = createWalletClient({
    account,
    chain: Amoy,
    transport: http(),
  });

  const signature = await client.signMessage({ message });
  return signature;
}

// Function to extract r, s, v from signature
function extractSignatureParts(signature) {
  const r = signature.slice(0, 66);
  const s = `0x${signature.slice(66, 130)}`;
  const v = parseInt(signature.slice(130, 132), 16);
  return { r, s, v };
}

// Function to call the claimToken contract
export async function callClaimToken(contract, sig, amountInWei) {
  try {
    console.log("Contract address:", contract.address);
    const owner = await contract.read.owner();
    console.log("Owner address:", owner);
    const { r, s, v } = extractSignatureParts(sig);
    console.log(v, r, s);
    await contract.write.claimToken([amountInWei, v, r, s]);
  } catch (error) {
    console.error("Error in callClaimToken:", error);
    if (error.reason) console.error("Error reason:", error.reason);
    if (error.data) console.error("Error data:", error.data);
  }
}

// Main function to handle interaction
export default function HandleInteraction() {
  const address = useAddress();
  const { contract } = useContract(KomEngineAddress, KomEngineAbi);
  const { mutateAsync: claimToken } = useContractWrite(contract, "claimToken");

  return async function handleInteraction() {
    try {
      if (!address) {
        console.error(
          "No address found. Make sure you're connected to a wallet.",
        );
        return;
      }

      if (!contract) {
        console.error("Contract not initialized");
        return;
      }

      const amount = "1000";
      const amountInWei = parseEther(amount);
      const walletAddress = await contract.read.owner();
      console.log("Wallet Address (message address):", walletAddress);
      console.log("Address (transaction sender):", address);
      console.log("Amount in Wei:", amountInWei.toString());

      const messageHash = await contract.read.getMessageHash([
        address,
        amountInWei,
      ]);
      console.log("Message Hash:", messageHash);
      const sig = await signMessage(messageHash);
      console.log("Signature:", sig);

      // Use the thirdweb SDK to send the transaction
      const { r, s, v } = extractSignatureParts(sig);
      await claimToken({ args: [amountInWei, v, r, s] });
    } catch (error) {
      console.error("Error in handleInteraction:", error);
    }
  };
}
