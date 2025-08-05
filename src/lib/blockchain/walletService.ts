import { createThirdwebClient } from "thirdweb";
import { createWallet } from "thirdweb/wallets";
import { defineChain } from "thirdweb/chains";

// Initialize Thirdweb client
const client = createThirdwebClient({
  clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID!,
});

// Define the chain (using Sepolia testnet for development)
const chain = defineChain(11155111); // Sepolia testnet

export class WalletService {
  private static wallet: any = null;
  private static account: any = null;

  /**
   * Connect to MetaMask or other injected wallet
   */
  static async connectWallet(): Promise<{ success: boolean; account?: any; error?: string }> {
    try {
      // Create wallet instance for MetaMask
      this.wallet = createWallet("io.metamask");
      
      // Connect to the wallet
      this.account = await this.wallet.connect({ client });
      
      return {
        success: true,
        account: this.account,
      };
    } catch (error) {
      console.error("Error connecting wallet:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to connect wallet",
      };
    }
  }

  /**
   * Disconnect wallet
   */
  static async disconnectWallet(): Promise<void> {
    try {
      if (this.wallet) {
        await this.wallet.disconnect();
        this.wallet = null;
        this.account = null;
      }
    } catch (error) {
      console.error("Error disconnecting wallet:", error);
    }
  }

  /**
   * Get current connected account
   */
  static getAccount() {
    return this.account;
  }

  /**
   * Get current wallet instance
   */
  static getWallet() {
    return this.wallet;
  }

  /**
   * Check if wallet is connected
   */
  static isConnected(): boolean {
    return this.account !== null;
  }

  /**
   * Get account address
   */
  static getAddress(): string | null {
    return this.account?.address || null;
  }

  /**
   * Switch to the correct chain
   */
  static async switchToChain(): Promise<{ success: boolean; error?: string }> {
    try {
      if (!this.wallet) {
        return { success: false, error: "Wallet not connected" };
      }

      await this.wallet.switchChain(chain);
      return { success: true };
    } catch (error) {
      console.error("Error switching chain:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to switch chain",
      };
    }
  }

  /**
   * Get wallet balance
   */
  static async getBalance(): Promise<string> {
    try {
      if (!this.account) {
        return "0";
      }

      // This would need to be implemented with proper balance fetching
      // For now, return a placeholder
      return "0.0";
    } catch (error) {
      console.error("Error fetching balance:", error);
      return "0";
    }
  }
}

export default WalletService;