// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface ICampaignManager {
    function isCampaignActive(uint256 campaignId) external view returns (bool);
}

interface IArtworkSubmission {
    struct Artwork {
        uint256 campaignId;
        address artist;
        string artworkURI;
        string title;
        string description;
        uint256 timestamp;
        bool exists;
    }
    
    function getArtwork(uint256 artworkId) external view returns (Artwork memory);
}

contract Voting {
    event ArtworkVoted(
        uint256 indexed campaignId,
        uint256 indexed artworkId,
        address indexed voter,
        uint256 newVoteCount
    );
    
    event VoteRemoved(
        uint256 indexed campaignId,
        uint256 indexed artworkId,
        address indexed voter,
        uint256 newVoteCount
    );

    ICampaignManager public campaignManager;
    IArtworkSubmission public artworkSubmission;
    address public owner;
    
    // Vote limits
    uint256 public constant MAX_VOTES_PER_CAMPAIGN = 5;
    
    // Vote tracking
    mapping(uint256 => mapping(uint256 => uint256)) public artworkVotes; // campaignId => artworkId => voteCount
    mapping(uint256 => mapping(uint256 => mapping(address => bool))) public hasVoted; // campaignId => artworkId => voter => hasVoted
    mapping(uint256 => mapping(address => uint256)) public userVoteCount; // campaignId => user => voteCount

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }

    modifier validCampaign(uint256 campaignId) {
        require(campaignManager.isCampaignActive(campaignId), "Campaign not active");
        _;
    }

    modifier validArtwork(uint256 artworkId) {
        IArtworkSubmission.Artwork memory artwork = artworkSubmission.getArtwork(artworkId);
        require(artwork.exists, "Artwork does not exist");
        require(campaignManager.isCampaignActive(artwork.campaignId), "Campaign not active");
        _;
    }

    constructor(address _campaignManager, address _artworkSubmission) {
        owner = msg.sender;
        campaignManager = ICampaignManager(_campaignManager);
        artworkSubmission = IArtworkSubmission(_artworkSubmission);
    }

    function voteForArtwork(
        uint256 campaignId,
        uint256 artworkId
    ) external validCampaign(campaignId) validArtwork(artworkId) {
        // Verify artwork belongs to campaign
        IArtworkSubmission.Artwork memory artwork = artworkSubmission.getArtwork(artworkId);
        require(artwork.campaignId == campaignId, "Artwork not in this campaign");
        
        // Check if user already voted for this artwork
        require(!hasVoted[campaignId][artworkId][msg.sender], "Already voted for this artwork");
        
        // Check vote limits
        require(
            userVoteCount[campaignId][msg.sender] < MAX_VOTES_PER_CAMPAIGN,
            "Maximum votes reached for this campaign"
        );

        // Record vote
        hasVoted[campaignId][artworkId][msg.sender] = true;
        artworkVotes[campaignId][artworkId]++;
        userVoteCount[campaignId][msg.sender]++;

        emit ArtworkVoted(
            campaignId,
            artworkId,
            msg.sender,
            artworkVotes[campaignId][artworkId]
        );
    }

    function removeVote(
        uint256 campaignId,
        uint256 artworkId
    ) external validCampaign(campaignId) {
        // Check if user has voted for this artwork
        require(hasVoted[campaignId][artworkId][msg.sender], "No vote to remove");

        // Remove vote
        hasVoted[campaignId][artworkId][msg.sender] = false;
        artworkVotes[campaignId][artworkId]--;
        userVoteCount[campaignId][msg.sender]--;

        emit VoteRemoved(
            campaignId,
            artworkId,
            msg.sender,
            artworkVotes[campaignId][artworkId]
        );
    }

    function getVotes(uint256 campaignId, uint256 artworkId) external view returns (uint256) {
        return artworkVotes[campaignId][artworkId];
    }

    function hasUserVoted(
        uint256 campaignId,
        uint256 artworkId,
        address user
    ) external view returns (bool) {
        return hasVoted[campaignId][artworkId][user];
    }

    function getUserVoteCount(uint256 campaignId, address user) external view returns (uint256) {
        return userVoteCount[campaignId][user];
    }

    // Admin functions
    function setCampaignManager(address _campaignManager) external onlyOwner {
        campaignManager = ICampaignManager(_campaignManager);
    }

    function setArtworkSubmission(address _artworkSubmission) external onlyOwner {
        artworkSubmission = IArtworkSubmission(_artworkSubmission);
    }

    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Invalid address");
        owner = newOwner;
    }
}