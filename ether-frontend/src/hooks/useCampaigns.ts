import { useState, useEffect, useCallback } from 'react';
import CampaignService, { CreateCampaignParams, CampaignData } from '../lib/blockchain/campaignService';
import { Campaign } from '../types/campaigns';
import { useWallet } from './useWallet';

interface CampaignsState {
  campaigns: Campaign[];
  isLoading: boolean;
  error: string | null;
  isCreating: boolean;
}

export const useCampaigns = () => {
  const [state, setState] = useState<CampaignsState>({
    campaigns: [],
    isLoading: false,
    error: null,
    isCreating: false,
  });

  const { account } = useWallet();

  // Fetch campaigns from blockchain
  const fetchCampaigns = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const blockchainCampaigns = await CampaignService.getAllCampaigns();

      // Convert blockchain data to frontend format
      const formattedCampaigns = blockchainCampaigns.map(campaign =>
        CampaignService.formatCampaignForFrontend(campaign)
      );

      setState(prev => ({
        ...prev,
        campaigns: formattedCampaigns,
        isLoading: false,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch campaigns',
      }));
    }
  }, []);

  // Create a new campaign
  const createCampaign = useCallback(async (campaignData: {
    title: string;
    description: string;
    startDate: string;
    endDate: string;
    category: string;
  }): Promise<{ success: boolean; transactionHash?: string; error?: string }> => {
    if (!account) {
      return { success: false, error: 'Wallet not connected' };
    }

    setState(prev => ({ ...prev, isCreating: true, error: null }));

    try {
      const startTime = Math.floor(new Date(campaignData.startDate).getTime() / 1000);
      const endTime = Math.floor(new Date(campaignData.endDate).getTime() / 1000);
      const now = Math.floor(Date.now() / 1000);

      // Debug logging
      console.log('=== Campaign Creation Debug ===');
      console.log('Campaign Data:', campaignData);
      console.log('Start Date (string):', campaignData.startDate);
      console.log('End Date (string):', campaignData.endDate);
      console.log('Start Time (Unix):', startTime);
      console.log('End Time (Unix):', endTime);
      console.log('Current Time (Unix):', now);
      console.log('Duration (seconds):', endTime - startTime);
      console.log('Duration (hours):', (endTime - startTime) / 3600);
      console.log('Start is in future:', startTime > now);
      console.log('End > Start:', endTime > startTime);
      console.log('Name length:', campaignData.title.length);
      console.log('Description length:', campaignData.description.length);
      console.log('Account:', account.address);

      // Validation checks
      if (startTime <= now) {
        const error = `Start time must be in the future. Current time: ${new Date(now * 1000).toISOString()}, Start time: ${new Date(startTime * 1000).toISOString()}`;
        console.error('Validation failed:', error);
        return { success: false, error };
      }

      if (endTime <= startTime) {
        const error = `End time must be after start time. Start: ${new Date(startTime * 1000).toISOString()}, End: ${new Date(endTime * 1000).toISOString()}`;
        console.error('Validation failed:', error);
        return { success: false, error };
      }

      const durationHours = (endTime - startTime) / 3600;
      if (durationHours < 1) {
        const error = `Campaign duration must be at least 1 hour. Duration: ${durationHours.toFixed(2)} hours`;
        console.error('Validation failed:', error);
        return { success: false, error };
      }

      if (durationHours > 8760) { // 365 days
        const error = `Campaign duration must be at most 365 days. Duration: ${durationHours.toFixed(2)} hours`;
        console.error('Validation failed:', error);
        return { success: false, error };
      }

      if (campaignData.title.length === 0 || campaignData.title.length > 100) {
        const error = `Campaign name must be between 1 and 100 characters. Length: ${campaignData.title.length}`;
        console.error('Validation failed:', error);
        return { success: false, error };
      }

      if (campaignData.description.length === 0 || campaignData.description.length > 1000) {
        const error = `Campaign description must be between 1 and 1000 characters. Length: ${campaignData.description.length}`;
        console.error('Validation failed:', error);
        return { success: false, error };
      }

      const params: CreateCampaignParams = {
        name: campaignData.title,
        description: campaignData.description,
        startTime,
        endTime,
      };

      const result = await CampaignService.createCampaign(account, params);

      if (result.success) {
        // Refresh campaigns list
        await fetchCampaigns();
      }

      setState(prev => ({ ...prev, isCreating: false }));
      return result;
    } catch (error) {
      console.error('=== Error Details ===');
      console.error('Error type:', typeof error);
      console.error('Error object:', error);

      // Extract error message from different error formats
      let errorMessage = 'Unknown error occurred';

      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'object' && error !== null) {
        // Handle thirdweb/viem error objects
        const errorObj = error as Record<string, unknown>;
        if ('message' in errorObj) {
          errorMessage = String(errorObj.message);
        } else if ('reason' in errorObj) {
          errorMessage = String(errorObj.reason);
        } else if ('data' in errorObj) {
          errorMessage = `Contract revert: ${JSON.stringify(errorObj.data)}`;
        }
      }

      console.error('Extracted error message:', errorMessage);

      setState(prev => ({
        ...prev,
        isCreating: false,
        error: errorMessage,
      }));
      return { success: false, error: errorMessage };
    }
  }, [account, fetchCampaigns]);

  // Get campaign by ID
  const getCampaign = useCallback(async (campaignId: string): Promise<Campaign | null> => {
    try {
      const id = parseInt(campaignId);
      const blockchainCampaign = await CampaignService.getCampaign(id);

      if (blockchainCampaign) {
        return CampaignService.formatCampaignForFrontend(blockchainCampaign);
      }

      return null;
    } catch (error) {
      console.error('Error fetching campaign:', error);
      return null;
    }
  }, []);

  // Check if campaign is active
  const isCampaignActive = useCallback(async (campaignId: string): Promise<boolean> => {
    try {
      const id = parseInt(campaignId);
      return await CampaignService.isCampaignActive(id);
    } catch (error) {
      console.error('Error checking campaign status:', error);
      return false;
    }
  }, []);

  // End a campaign
  const endCampaign = useCallback(async (
    campaignId: string,
    topArtworkIds: number[] = []
  ): Promise<{ success: boolean; transactionHash?: string; error?: string }> => {
    if (!account) {
      return { success: false, error: 'Wallet not connected' };
    }

    try {
      const id = parseInt(campaignId);
      const result = await CampaignService.endCampaign(account, id, topArtworkIds);

      if (result.success) {
        // Refresh campaigns list
        await fetchCampaigns();
      }

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to end campaign';
      return { success: false, error: errorMessage };
    }
  }, [account, fetchCampaigns]);

  // Get creation fee
  const getCreationFee = useCallback(async (): Promise<string> => {
    try {
      const fee = await CampaignService.getCreationFee();
      // Convert from wei to ETH
      return (Number(fee) / 1e18).toString();
    } catch (error) {
      console.error('Error fetching creation fee:', error);
      return '0.001'; // Default fallback
    }
  }, []);

  // Filter campaigns by status
  const getActiveCampaigns = useCallback(() => {
    return state.campaigns.filter(c => c.status === 'active');
  }, [state.campaigns]);

  const getUpcomingCampaigns = useCallback(() => {
    return state.campaigns.filter(c => c.status === 'upcoming');
  }, [state.campaigns]);

  const getEndedCampaigns = useCallback(() => {
    return state.campaigns.filter(c => c.status === 'ended');
  }, [state.campaigns]);

  // Clear error
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // Load campaigns on mount
  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  return {
    ...state,
    fetchCampaigns,
    createCampaign,
    getCampaign,
    isCampaignActive,
    endCampaign,
    getCreationFee,
    getActiveCampaigns,
    getUpcomingCampaigns,
    getEndedCampaigns,
    clearError,
  };
};

export default useCampaigns;