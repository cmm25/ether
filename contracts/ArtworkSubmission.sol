// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

interface ICampaignManager {
    function isCampaignActive(uint256 campaignId) external view returns (bool);
    function addArtworkToCampaign(uint256 campaignId, uint256 artworkId) external;
}

contract ArtworkSubmission is ReentrancyGuard, Pausable, Ownable {
    event ArtworkSubmitted(
        uint256 indexed campaignId,
        uint256 indexed artworkId,
        address indexed artist,
        string artworkURI
    );

    struct Artwork {
        uint256 campaignId;
        address artist;
        string artworkURI;
        uint256 votes;
        uint256 submittedAt;
    }

    Artwork[] public artworks;
    ICampaignManager public campaignManager;
    
    // Constants for validation
    uint256 public constant MAX_URI_LENGTH = 500;
    
    // Mapping to track submissions per user per campaign
    mapping(uint256 => mapping(address => uint256)) public userSubmissionsPerCampaign;
    uint256 public maxSubmissionsPerUser = 3; // Max artworks per user per campaign

    modifier validCampaignId(uint256 campaignId) {
        require(campaignManager.isCampaignActive(campaignId), "Campaign not active");
        _;
    }

    constructor(address initialOwner, address _campaignManager) Ownable(initialOwner) {
        require(_campaignManager != address(0), "Invalid campaign manager address");
        campaignManager = ICampaignManager(_campaignManager);
    }

    function submitArtwork(
        uint256 campaignId,
        string memory artworkURI
    ) external nonReentrant whenNotPaused validCampaignId(campaignId) {
        // Input validation
        require(bytes(artworkURI).length > 0 && bytes(artworkURI).length <= MAX_URI_LENGTH, "Invalid URI length");
        require(userSubmissionsPerCampaign[campaignId][msg.sender] < maxSubmissionsPerUser, "Max submissions reached");
        
        // Create artwork
        artworks.push(Artwork(
            campaignId, 
            msg.sender, 
            artworkURI, 
            0,
            block.timestamp
        ));
        
        uint256 artworkId = artworks.length - 1;
        
        // Update user submission count
        userSubmissionsPerCampaign[campaignId][msg.sender]++;
        
        // Add to campaign
        campaignManager.addArtworkToCampaign(campaignId, artworkId);
        
        emit ArtworkSubmitted(
            campaignId,
            artworkId,
            msg.sender,
            artworkURI
        );
    }

    function getArtwork(
        uint256 artworkId
    ) external view returns (Artwork memory) {
        require(artworkId < artworks.length, "Invalid artwork ID");
        return artworks[artworkId];
    }

    function getArtworksCount() external view returns (uint256) {
        return artworks.length;
    }

    function getUserSubmissionCount(uint256 campaignId, address user) external view returns (uint256) {
        return userSubmissionsPerCampaign[campaignId][user];
    }

    // Admin functions
    function setCampaignManager(address _campaignManager) external onlyOwner {
        require(_campaignManager != address(0), "Invalid address");
        campaignManager = ICampaignManager(_campaignManager);
    }

    function setMaxSubmissionsPerUser(uint256 _maxSubmissions) external onlyOwner {
        require(_maxSubmissions > 0 && _maxSubmissions <= 10, "Invalid max submissions");
        maxSubmissionsPerUser = _maxSubmissions;
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }
}