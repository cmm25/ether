# Ether - Decentralized Art Platform

A comprehensive blockchain-based platform for digital art campaigns, voting, and NFT minting built on Ethereum.

## 🏗️ Repository Structure

```
Ether/
├── contracts/              # Smart contracts (Hardhat project)
│   ├── contracts/          # Solidity smart contracts
│   ├── test/              # Contract tests
│   ├── ignition/          # Deployment scripts
│   └── hardhat.config.ts  # Hardhat configuration
├── ether-frontend/        # Next.js frontend application
│   ├── src/               # Frontend source code
│   ├── public/            # Static assets
│   └── package.json       # Frontend dependencies
├── BLOCKCHAIN_INTEGRATION.md  # Detailed blockchain setup guide
└── README.md              # This file
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- MetaMask or compatible Web3 wallet
- Git

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd Ether
```

### 2. Setup Smart Contracts

```bash
cd contracts
npm install
npx hardhat compile
```

### 3. Setup Frontend

```bash
cd ../ether-frontend
npm install
cp .env.local.example .env.local
# Configure your environment variables
npm run dev
```

## 📋 Features

### 🎨 **Art Campaign System**

- Create and manage art campaigns
- Submit digital artworks to campaigns
- Community-driven voting system
- Automatic winner selection

### 🗳️ **Decentralized Voting**

- Blockchain-based voting mechanism
- Real-time leaderboards
- Transparent vote counting
- Anti-fraud protection

### 🎯 **NFT Minting**

- Automatic NFT minting for winners
- IPFS metadata storage
- Gallery display system
- Ownership verification

### 🔔 **Smart Notifications**

- Real-time blockchain notifications
- Campaign status updates
- Voting reminders
- NFT minting alerts

### 👤 **User Profiles**

- Wallet-based authentication
- Submission history tracking
- NFT collection display
- Achievement system

## 🔧 Technology Stack

### **Blockchain**

- **Solidity** - Smart contract development
- **Hardhat** - Development framework
- **Thirdweb** - Web3 integration
- **Ethereum Sepolia** - Testnet deployment

### **Frontend**

- **Next.js 14** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations

### **Storage & APIs**

- **IPFS (Pinata)** - Decentralized file storage
- **Supabase** - User data and profiles
- **Web3 APIs** - Blockchain interaction

## 📱 Smart Contracts

### **Deployed Contracts (Sepolia Testnet)**

- **CampaignManager**: `0xF55843733EBF4d8355DF198F99B1b01620C9eD9B`
- **ArtworkSubmission**: `0x929b94e6Df14F6E91a290c0778feA81b4F26d358`
- **Voting**: `0x2B56e4bb5B885C5B570653491bcb7E69a888C913`
- **GalleryNFT**: `0x4d3B0C614DE9830BE97d6B23c74d8356A5CcDd89`

### **Contract Features**

- **Campaign Management** - Create, manage, and end campaigns
- **Artwork Submission** - Submit and validate artworks
- **Voting System** - Secure, transparent voting mechanism
- **NFT Minting** - Automatic minting for campaign winners

## 📝 Smart Contracts Overview

- **CampaignManager**: Handles creation, management, and closure of art campaigns.
- **ArtworkSubmission**: Manages submission and validation of artworks to campaigns.
- **Voting**: Implements secure, transparent voting for campaign entries.
- **GalleryNFT**: Mints NFTs for campaign winners and manages the NFT gallery.

For more on how real-time blockchain data is indexed and used, see the [Goldsky Mirror documentation](https://docs.goldsky.com/subgraphs/mirror/sources/subgraphs).

## 📡 Goldsky Integration

Ether leverages [Goldsky](https://goldsky.com/) for real-time blockchain data indexing, automation, and analytics. Goldsky pipelines process on-chain events and store them in a Postgres database, enabling features like live leaderboards, campaign automation, and NFT gallery updates.

### Goldsky Pipelines Used

- **ether-core-pipeline**: Indexes NFT mints, votes, campaign lifecycle events, and artwork submissions from the Sepolia testnet. Data is transformed and stored in the `ether_live` schema for use in leaderboards, notifications, and analytics.
- **ether-automation-pipeline**: Detects campaign end events and final winner selections, triggering automation for campaign closure and NFT minting. Results are stored in `campaign_automation_triggers` and `campaign_final_winners` tables.
- **ether-leaderboard-pipeline**: Streams live voting events from the Voting contract, supporting real-time leaderboard updates and transparent vote tracking.
- **ether-nft-pipeline**: Indexes NFT transfer events for the GalleryNFT contract, powering the NFT gallery and ownership verification features. Data is stored in the `ether_gallery.nft_transfers` table.

Goldsky enables Ether to provide instant feedback, live updates, and robust analytics by bridging on-chain activity with the app's backend in a scalable, reliable way.

## 🎯 User Journey

1. **Connect Wallet** - MetaMask integration
2. **Browse Campaigns** - View active art campaigns
3. **Submit Artwork** - Upload art to IPFS and submit to campaigns
4. **Vote on Art** - Vote for favorite submissions
5. **Track Progress** - Real-time leaderboards and notifications
6. **Mint NFTs** - Winners automatically get NFTs minted
7. **Gallery Display** - View and showcase NFT collection

## 🔐 Environment Setup

### **Frontend Environment Variables**

```env
# Blockchain
NEXT_PUBLIC_THIRDWEB_CLIENT_ID=your_thirdweb_client_id
NEXT_PUBLIC_CAMPAIGN_MANAGER_ADDRESS=0xF55843733EBF4d8355DF198F99B1b01620C9eD9B
NEXT_PUBLIC_ARTWORK_SUBMISSION_ADDRESS=0x929b94e6Df14F6E91a290c0778feA81b4F26d358
NEXT_PUBLIC_VOTING_ADDRESS=0x2B56e4bb5B885C5B570653491bcb7E69a888C913
NEXT_PUBLIC_GALLERY_NFT_ADDRESS=0x4d3B0C614DE9830BE97d6B23c74d8356A5CcDd89

# IPFS (Pinata)
NEXT_PUBLIC_PINATA_JWT=your_pinata_jwt_token
NEXT_PUBLIC_PINATA_GATEWAY_URL=https://gateway.pinata.cloud

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Goldsky (Required for real-time blockchain data)
GOLDSKY_API_KEY=your_goldsky_api_key
GOLDSKY_PROJECT_ID=your_goldsky_project_id
```

## 🧪 Testing

### **Smart Contracts**

```bash
cd contracts
npx hardhat test
```

### **Frontend**

```bash
cd ether-frontend
npm run test
```

## 🚀 Deployment

### **Smart Contracts**

```bash
cd contracts
npx hardhat run scripts/deploy.ts --network sepolia
```

### **Frontend**

```bash
cd ether-frontend
npm run build
npm run start
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- **Live Demo**: [Coming Soon]

---

**Built with ❤️ for the decentralized art community**
