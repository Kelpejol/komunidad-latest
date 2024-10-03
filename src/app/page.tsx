"use client";

import { ConnectWallet, ThirdwebProvider } from "@thirdweb-dev/react";
import { useAddress, useContract, useContractWrite } from "@thirdweb-dev/react";
import { Ethereum, Goerli } from "@thirdweb-dev/chains";
import { useState } from "react";
import { parseEther } from "viem";
import { signMessage, extractSignatureParts } from "./utils/ethereum";
import { KomEngineAddress, KomEngineAbi } from "./utils/constants";

export default function Home() {
  return (
    <ThirdwebProvider
      activeChain={Ethereum} // or Goerli if you're using testnet
      clientId="ff2d9dfed0f2aa3ab6d90252c104bf3f" // Replace with your actual client ID
    >
      <div>
        <HandleInteraction />
        <ConnectWallet theme="dark" />
      </div>
    </ThirdwebProvider>
  );
}

function HandleInteraction() {
  const address = useAddress();
  const { contract } = useContract(KomEngineAddress, KomEngineAbi);
  const { mutateAsync: claimToken } = useContractWrite(contract, "claimToken");
  const [loading, setLoading] = useState(false);

  const handleInteraction = async () => {
    try {
      setLoading(true);
      if (!address) {
        throw new Error(
          "No address found. Make sure you're connected to a wallet.",
        );
      }

      if (!contract) {
        throw new Error("Contract not initialized");
      }

      const amount = "1000";
      const amountInWei = parseEther(amount);
      const walletAddress = await contract.call("owner");
      console.log("Wallet Address (message address):", walletAddress);
      console.log("Address (transaction sender):", address);
      console.log("Amount in Wei:", amountInWei.toString());

      const messageHash = await contract.call("getMessageHash", [
        address,
        amountInWei,
      ]);
      console.log("Message Hash:", messageHash);
      const sig = await signMessage(messageHash);
      console.log("Signature:", sig);

      const { r, s, v } = extractSignatureParts(sig);
      await claimToken({ args: [amountInWei, v, r, s] });
    } catch (error) {
      console.error("Error in handleInteraction:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button onClick={handleInteraction} disabled={loading}>
        {loading ? "Processing..." : "Interact"}
      </button>
    </div>
  );
}
