const PINATA_JWT = process.env.NEXT_PUBLIC_IPFS_JWT!;

export interface IPFSUploadResult {
  success: boolean;
  ipfsHash?: string;
  ipfsUrl?: string;
  error?: string;
}

export interface ArtworkMetadata {
  name: string;
  description: string;
  image: string;
  artist: string;
  campaignId: string;
  submittedAt: string;
  attributes?: Array<{
    trait_type: string;
    value: string | number;
  }>;
}

export class IPFSService {
  private static readonly PINATA_API_URL = 'https://api.pinata.cloud';
  private static readonly PINATA_GATEWAY = 'https://gateway.pinata.cloud/ipfs';

  /**
   * Upload a file to IPFS via Pinata
   */
  static async uploadFile(file: File, filename?: string): Promise<IPFSUploadResult> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      // Add metadata
      const metadata = JSON.stringify({
        name: filename || file.name,
        keyvalues: {
          uploadedAt: new Date().toISOString(),
          fileType: file.type,
          fileSize: file.size.toString()
        }
      });
      formData.append('pinataMetadata', metadata);

      // Add options
      const options = JSON.stringify({
        cidVersion: 1,
      });
      formData.append('pinataOptions', options);

      const response = await fetch(`${this.PINATA_API_URL}/pinning/pinFileToIPFS`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${PINATA_JWT}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Pinata API error: ${response.status} - ${errorData.error || response.statusText}`);
      }

      const result = await response.json();
      
      return {
        success: true,
        ipfsHash: result.IpfsHash,
        ipfsUrl: `${this.PINATA_GATEWAY}/${result.IpfsHash}`,
      };
    } catch (error) {
      console.error('Error uploading file to IPFS:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }


  static async uploadMetadata(metadata: ArtworkMetadata): Promise<IPFSUploadResult> {
    try {
      const response = await fetch(`${this.PINATA_API_URL}/pinning/pinJSONToIPFS`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${PINATA_JWT}`,
        },
        body: JSON.stringify({
          pinataContent: metadata,
          pinataMetadata: {
            name: `${metadata.name}_metadata.json`,
            keyvalues: {
              type: 'artwork_metadata',
              artist: metadata.artist,
              campaignId: metadata.campaignId,
              uploadedAt: new Date().toISOString()
            }
          },
          pinataOptions: {
            cidVersion: 1,
          }
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Pinata API error: ${response.status} - ${errorData.error || response.statusText}`);
      }

      const result = await response.json();
      
      return {
        success: true,
        ipfsHash: result.IpfsHash,
        ipfsUrl: `${this.PINATA_GATEWAY}/${result.IpfsHash}`,
      };
    } catch (error) {
      console.error('Error uploading metadata to IPFS:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * Upload artwork with metadata (complete flow)
   */
  static async uploadArtwork(
    imageFile: File,
    title: string,
    description: string,
    artist: string,
    campaignId: string
  ): Promise<{
    success: boolean;
    imageHash?: string;
    imageUrl?: string;
    metadataHash?: string;
    metadataUrl?: string;
    error?: string;
  }> {
    try {
      // Step 1: Upload the image file
      console.log('Uploading image to IPFS...');
      const imageUpload = await this.uploadFile(imageFile, `${title}_artwork`);
      
      if (!imageUpload.success) {
        return {
          success: false,
          error: `Failed to upload image: ${imageUpload.error}`,
        };
      }

      console.log('Image uploaded successfully:', imageUpload.ipfsHash);

      // Step 2: Create and upload metadata
      const metadata: ArtworkMetadata = {
        name: title,
        description: description,
        image: imageUpload.ipfsUrl!,
        artist: artist,
        campaignId: campaignId,
        submittedAt: new Date().toISOString(),
        attributes: [
          {
            trait_type: 'Campaign ID',
            value: campaignId
          },
          {
            trait_type: 'Artist',
            value: artist
          },
          {
            trait_type: 'Submission Date',
            value: new Date().toLocaleDateString()
          }
        ]
      };

      console.log('Uploading metadata to IPFS...');
      const metadataUpload = await this.uploadMetadata(metadata);
      
      if (!metadataUpload.success) {
        return {
          success: false,
          error: `Failed to upload metadata: ${metadataUpload.error}`,
        };
      }

      console.log('Metadata uploaded successfully:', metadataUpload.ipfsHash);

      return {
        success: true,
        imageHash: imageUpload.ipfsHash,
        imageUrl: imageUpload.ipfsUrl,
        metadataHash: metadataUpload.ipfsHash,
        metadataUrl: metadataUpload.ipfsUrl,
      };
    } catch (error) {
      console.error('Error in complete artwork upload:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * Test IPFS connection
   */
  static async testConnection(): Promise<{ success: boolean; error?: string }> {
    try {
      const testData = {
        message: 'IPFS connection test',
        timestamp: new Date().toISOString()
      };

      const response = await fetch(`${this.PINATA_API_URL}/pinning/pinJSONToIPFS`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${PINATA_JWT}`,
        },
        body: JSON.stringify({
          pinataContent: testData,
          pinataMetadata: {
            name: 'connection_test.json'
          }
        }),
      });

      if (!response.ok) {
        throw new Error(`Connection test failed: ${response.status}`);
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Connection test failed'
      };
    }
  }

  /**
   * Get file from IPFS
   */
  static getIPFSUrl(hash: string): string {
    return `${this.PINATA_GATEWAY}/${hash}`;
  }

  /**
   * Validate IPFS hash format
   */
  static isValidIPFSHash(hash: string): boolean {
    // Basic validation for IPFS hash (CIDv0 or CIDv1)
    const cidv0Regex = /^Qm[1-9A-HJ-NP-Za-km-z]{44}$/;
    const cidv1Regex = /^b[a-z2-7]{58}$/;
    
    return cidv0Regex.test(hash) || cidv1Regex.test(hash);
  }
}

export default IPFSService;