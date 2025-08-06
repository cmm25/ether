import UserDataService from '../blockchain/userDataService';

export async function fetchSubmittedWorks(walletAddress: string): Promise<any[]> {
  try {
    return await UserDataService.getSubmittedWorks(walletAddress);
  } catch (error) {
    console.error('Error fetching submitted works:', error);
    return [];
  }
}

export async function fetchApprovedNfts(walletAddress: string): Promise<any[]> {
  try {
    return await UserDataService.getApprovedNFTs(walletAddress);
  } catch (error) {
    console.error('Error fetching approved NFTs:', error);
    return [];
  }
}

export async function fetchCollections(walletAddress: string): Promise<any[]> {
  try {
    return await UserDataService.getCollections(walletAddress);
  } catch (error) {
    console.error('Error fetching collections:', error);
    return [];
  }
}
