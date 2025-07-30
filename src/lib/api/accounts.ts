const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

export async function fetchSubmittedWorks(walletAddress: string): Promise<any[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/users/${walletAddress}/submitted-works`);
    if (!response.ok) {
      throw new Error(`Failed to fetch submitted works: ${response.statusText}`);
    }
    return response.json();
  } catch (error) {
    console.error('Error fetching submitted works:', error);
    throw error;
  }
}

export async function fetchApprovedNfts(walletAddress: string): Promise<any[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/users/${walletAddress}/approved-nfts`);
    if (!response.ok) {
      throw new Error(`Failed to fetch approved NFTs: ${response.statusText}`);
    }
    return response.json();
  } catch (error) {
    console.error('Error fetching approved NFTs:', error);
    throw error;
  }
}

export async function fetchCollections(walletAddress: string): Promise<any[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/users/${walletAddress}/collections`);
    if (!response.ok) {
      throw new Error(`Failed to fetch collections: ${response.statusText}`);
    }
    return response.json();
  } catch (error) {
    console.error('Error fetching collections:', error);
    throw error;
  }
}
