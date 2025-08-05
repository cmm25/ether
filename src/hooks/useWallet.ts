import { useState, useEffect, useCallback } from 'react';
import WalletService from '../lib/blockchain/walletService';

interface WalletState {
  isConnected: boolean;
  address: string | null;
  isConnecting: boolean;
  error: string | null;
}

export const useWallet = () => {
  const [walletState, setWalletState] = useState<WalletState>({
    isConnected: false,
    address: null,
    isConnecting: false,
    error: null,
  });

  // Check if wallet is already connected on mount
  useEffect(() => {
    const checkConnection = () => {
      const isConnected = WalletService.isConnected();
      const address = WalletService.getAddress();
      
      setWalletState(prev => ({
        ...prev,
        isConnected,
        address,
      }));
    };

    checkConnection();
  }, []);

  const connectWallet = useCallback(async () => {
    setWalletState(prev => ({ ...prev, isConnecting: true, error: null }));

    try {
      const result = await WalletService.connectWallet();
      
      if (result.success && result.account) {
        setWalletState({
          isConnected: true,
          address: result.account.address,
          isConnecting: false,
          error: null,
        });
      } else {
        setWalletState(prev => ({
          ...prev,
          isConnecting: false,
          error: result.error || 'Failed to connect wallet',
        }));
      }
    } catch (error) {
      setWalletState(prev => ({
        ...prev,
        isConnecting: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      }));
    }
  }, []);

  const disconnectWallet = useCallback(async () => {
    try {
      await WalletService.disconnectWallet();
      setWalletState({
        isConnected: false,
        address: null,
        isConnecting: false,
        error: null,
      });
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
    }
  }, []);

  const switchChain = useCallback(async () => {
    try {
      const result = await WalletService.switchToChain();
      if (!result.success) {
        setWalletState(prev => ({
          ...prev,
          error: result.error || 'Failed to switch chain',
        }));
      }
      return result.success;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to switch chain';
      setWalletState(prev => ({
        ...prev,
        error: errorMessage,
      }));
      return false;
    }
  }, []);

  const clearError = useCallback(() => {
    setWalletState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    ...walletState,
    connectWallet,
    disconnectWallet,
    switchChain,
    clearError,
    account: WalletService.getAccount(),
  };
};

export default useWallet;