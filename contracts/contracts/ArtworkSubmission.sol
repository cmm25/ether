// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface ICampaignManager {
    function isCampaignActive(uint256 campaignId) external view returns (bool);
    function addArtworkToCampaign(uint256 campaignId, uint256 artworkId) external;
}

contract ArtworkSubmission {
    event ArtworkSubmitted(
        uint256 indexed artworkId,
        uint256 indexed campaignId,
        address indexed artist,
        string artworkURI,
        string title,
        string description
    );

    struct Artwork {
        uint256 campaignId;
        address artist;
        string artworkURI;
        string title;
        string description;
        uint256 timestamp;
        bool exists;
    }

    Artwork[] public artworks;
    ICampaignManager public campaignManager;
    address public owner;
    
    // Submission limits
    uint256 public constant MAX_SUBMISSIONS_PER_CAMPAIGN = 3;
    uint256 public constant MAX_TITLE_LENGTH = 100;
    uint256 public constant MAX_DESCRIPTION_LENGTH = 500;
    
    // Track submissions per user per campaign
    mapping(uint256 => mapping(address => uint256)) public userSubmissionCount;

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }

    modifier validCampaignId(uint256 campaignId) {
        require(campaignManager.isCampaignActive(campaignId), "Campaign not active");
        _;
    }

    constructor(address _campaignManager) {
        owner = msg.sender;
        campaignManager = ICampaignManager(_campaignManager);
    }

    function submitArtwork(
        uint256 campaignId,
        string memory artworkURI,
        string memory title,
        string memory description
    ) external validCampaignId(campaignId) {
        // Validate inputs
        require(bytes(artworkURI).length > 0, "Artwork URI required");
        require(bytes(title).length > 0 && bytes(title).length <= MAX_TITLE_LENGTH, "Invalid title length");
        require(bytes(description).length > 0 && bytes(description).length <= MAX_DESCRIPTION_LENGTH, "Invalid description length");
        
        // Check submission limits
        require(
            userSubmissionCount[campaignId][msg.sender] < MAX_SUBMISSIONS_PER_CAMPAIGN,
            "Maximum submissions reached for this campaign"
        );

        // Create artwork
        uint256 artworkId = artworks.length;
        artworks.push(
            Artwork(
                campaignId,
                msg.sender,
                artworkURI,
                title,
                description,
                block.timestamp,
                true
            )
        );

        // Update submission count
        userSubmissionCount[campaignId][msg.sender]++;

        // Add to campaign
        campaignManager.addArtworkToCampaign(campaignId, artworkId);

        emit ArtworkSubmitted(
            artworkId,
            campaignId,
            msg.sender,
            artworkURI,
            title,
            description
        );
    }

    function getArtwork(uint256 artworkId) external view returns (Artwork memory) {
        require(artworkId < artworks.length, "Invalid artwork ID");
        require(artworks[artworkId].exists, "Artwork does not exist");
        return artworks[artworkId];
    }

    function getArtworksCount() external view returns (uint256) {
        return artworks.length;
    }

    function getUserSubmissionCount(uint256 campaignId, address user) external view returns (uint256) {
        return userSubmissionCount[campaignId][user];
    }

    // Admin functions
    function setCampaignManager(address _campaignManager) external onlyOwner {
        campaignManager = ICampaignManager(_campaignManager);
    }

    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Invalid address");
        owner = newOwner;
    }
}