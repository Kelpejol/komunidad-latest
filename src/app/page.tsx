'use client'
import { ConnectButton } from "thirdweb/react";
import { createWallet } from "thirdweb/wallets";
import HandleInteraction from "../../utils/ethereum"

import { client } from "./client";


const wallets = [
  createWallet("io.metamask"),
  createWallet("com.coinbase.wallet"),
  createWallet("com.trustwallet.app"),
  createWallet("app.phantom"),
];

export default function Home() {
  return (
    <div>
      <button onClick={HandleInteraction}>Claim</button>
    <ConnectButton
      client={client}
      wallets={wallets}
      connectModal={{
        size: "compact",
        showThirdwebBranding: false,
      }}
    />
    </div>
  );
}