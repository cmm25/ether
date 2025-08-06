import { createThirdwebClient } from "thirdweb";
import { defineChain } from "thirdweb/chains";

// Define Sepolia chain with a single reliable RPC endpoint
export const sepolia = defineChain({
  id: 11155111,
  name: "Sepolia",
  nativeCurrency: { name: "Sepolia Ether", symbol: "SEP", decimals: 18 },
  blockExplorers: [
    {
      name: "Etherscan",
      url: "https://sepolia.etherscan.io",
    },
  ],
  rpc: "https://rpc.sepolia.org", // Single reliable endpoint
});

export const client = createThirdwebClient({
  clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID!,
  chains: [sepolia], // Pass your custom chain here
});
