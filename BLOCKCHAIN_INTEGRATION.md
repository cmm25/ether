# Blockchain Integration for Ether Platform

This document explains how the Ether platform has been integrated with blockchain technology to enable real campaign creation and management.

## Overview

The platform now uses real Ethereum smart contracts deployed on Sepolia testnet for:
- Campaign creation with ETH payment
- Campaign management and lifecycle
- Real-time blockchain data fetching
- Wallet integration with MetaMask

## Smart Contracts

### CampaignManager Contract
- **Address**: `0x00c426b68939E496e088e0BF4D5Ba7FCA2bD3c1F`
- **Purpose**: Manages campaign creation, lifecycle, and metadata
- **Key Functions**:
  - `createCampaign()` - Create new campaigns with fee payment
  - `getCampaign()` - Retrieve campaign details
  - `isCampaignActive()` - Check campaign status
  - `endCampaign()` - End campaigns and select winners

### Other Contracts
- **ArtworkSubmission**: `0xd11f3b7A517490a4d0a8873Cb67cCA25E280893d`
- **Voting**: `0x408B34694443394adbC7BcB6aEC2459B5b25a750`
- **GalleryNFT**: `0x9344d4a53fA2DFA02a52b4c57988488dFBCdE8c1`

## Frontend Integration

### Wallet Connection
The platform uses Thirdweb SDK for wallet integration:
- MetaMask support
- Automatic chain switching to Sepolia testnet
- Real-time connection status

### Campaign Management
- Real blockchain data fetching
- Live campaign status updates
- Transaction hash tracking
- Error handling for failed transactions

## Key Features Implemented

### 1. Real Campaign Creation
- Users connect their wallet
- Pay creation fee in ETH (0.001 ETH default)
- Transaction is submitted to blockchain
- Campaign appears in UI after confirmation

### 2. Blockchain Data Integration
- Campaigns are fetched from smart contract
- Real-time status updates (active/upcoming/ended)
- Transaction hash links to block explorer

### 3. Wallet Integration
- Connect/disconnect wallet functionality
- Display connected address
- Handle wallet errors gracefully

## Usage Instructions

### For Users

1. **Connect Wallet**
   - Click "Create Campaign" button
   - Connect MetaMask wallet when prompted
   - Ensure you're on Sepolia testnet

2. **Create Campaign**
   - Fill out campaign form (title, description, dates, category)
   - Review campaign details
   - Pay creation fee (0.001 ETH + gas)
   - Wait for transaction confirmation

3. **View Campaigns**
   - All campaigns are loaded from blockchain
   - See real-time status updates
   - Click on active campaigns to view details

### For Developers

1. **Setup Environment**
   ```bash
   cd contracts
   npm install
   npx hardhat compile
   ```

2. **Deploy Contracts** (if needed)
   ```bash
   npx hardhat run scripts/deploy.ts --network sepolia
   ```

3. **Run Tests**
   ```bash
   npx hardhat test
   ```

4. **Frontend Development**
   ```bash
   cd ether-frontend
   npm install
   npm run dev
   ```

## Environment Variables

Required environment variables in `.env.local`:

```env
# Thirdweb Configuration
NEXT_PUBLIC_THIRDWEB_CLIENT_ID=your_client_id
NEXT_PUBLIC_THIRDWEB_SECRET_KEY=your_secret_key

# Contract Addresses (Sepolia Testnet)
NEXT_PUBLIC_CAMPAIGN_MANAGER_ADDRESS=0x00c426b68939E496e088e0BF4D5Ba7FCA2bD3c1F
NEXT_PUBLIC_GALLERY_NFT_ADDRESS=0x9344d4a53fA2DFA02a52b4c57988488dFBCdE8c1
NEXT_PUBLIC_ARTWORK_SUBMISSION_ADDRESS=0xd11f3b7A517490a4d0a8873Cb67cCA25E280893d
NEXT_PUBLIC_VOTING_ADDRESS=0x408B34694443394adbC7BcB6aEC2459B5b25a750
```

## Technical Architecture

### Blockchain Services
- `CampaignService`: Handles all campaign-related blockchain interactions
- `WalletService`: Manages wallet connections and transactions

### React Hooks
- `useWallet`: Wallet connection state management
- `useCampaigns`: Campaign data fetching and management

### Components
- `CreateCampaignForm`: Real blockchain campaign creation
- `CampaignCard`: Display blockchain campaign data

## Network Configuration

The platform is configured to use:
- **Network**: Sepolia Testnet (Chain ID: 11155111)
- **Currency**: SepoliaETH (for gas fees)
- **Creation Fee**: Paid in ETH (0.001 ETH default)
- **Block Explorer**: https://sepolia.etherscan.io

## Error Handling

The platform handles various blockchain errors:
- Wallet connection failures
- Transaction rejections
- Network switching issues
- Contract interaction errors
- RPC connection issues

## Future Enhancements

Planned blockchain features:
1. Artwork submission to campaigns
2. Voting mechanism implementation
3. NFT minting for winners
4. Prize distribution
5. Governance token integration

## Troubleshooting

### Common Issues

1. **Wallet Not Connecting**
   - Ensure MetaMask is installed
   - Check if Sepolia testnet is added to MetaMask
   - Refresh page and try again

2. **Transaction Failing**
   - Check wallet balance for gas fees (need SepoliaETH)
   - Ensure creation fee is sufficient
   - Verify campaign parameters are valid
   - Make sure you're connected to Sepolia testnet

3. **Campaigns Not Loading**
   - Check network connection
   - Verify contract addresses in environment
   - Check browser console for errors
   - Ensure MetaMask is connected to Sepolia testnet

4. **Internal JSON-RPC Error**
   - Switch to Sepolia testnet in MetaMask
   - Check if contract addresses are correct
   - Verify you have SepoliaETH for gas fees
   - Try refreshing the page

### Getting Sepolia ETH

To test the platform, you'll need Sepolia ETH:
- Use Sepolia faucets like: https://sepoliafaucet.com/
- Or: https://faucet.sepolia.dev/
- Request small amounts for testing

### Support

For technical issues:
1. Check browser console for error messages
2. Verify wallet connection and network (should be Sepolia)
3. Ensure all environment variables are set correctly
4. Check that contract addresses match the deployed contracts

## Security Considerations

- All transactions require user confirmation
- Smart contracts include access controls
- Creation fees prevent spam campaigns
- Input validation on both frontend and contract level
- Testnet deployment for safe testing

## Contract Verification

All contracts are deployed and verified on Sepolia testnet:
- View on Etherscan: https://sepolia.etherscan.io/address/[CONTRACT_ADDRESS]
- Source code is publicly available
- ABI is included in the frontend for interaction