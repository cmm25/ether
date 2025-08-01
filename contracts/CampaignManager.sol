// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract CampaignManager is ReentrancyGuard, Pausable, Ownable {
    event CampaignCreated(
        uint256 indexed campaignId,
        address indexed creator,
        string name,
        string description,
        uint256 start,
        uint256 end
    );
    event CampaignEnded(uint256 indexed campaignId, uint256[] topArtworkIds);

    struct Campaign {
        string name;
        string description;
        uint256 start;
        uint256 end;
        address creator;
        bool ended;
        uint256[] artworkIds;
    }

    Campaign[] public campaigns;
    
    // Constants for validation
    uint256 public constant MIN_CAMPAIGN_DURATION = 1 hours;
    uint256 public constant MAX_CAMPAIGN_DURATION = 365 days;
    uint256 public constant MAX_NAME_LENGTH = 100;
    uint256 public constant MAX_DESCRIPTION_LENGTH = 1000;

    // Authorized contracts that can add artworks
    mapping(address => bool) public authorizedContracts;

    modifier validCampaignId(uint256 campaignId) {
        require(campaignId < campaigns.length, "Invalid campaign ID");
        _;
    }

    modifier onlyAuthorized() {
        require(authorizedContracts[msg.sender], "Not authorized");
        _;
    }

    constructor(address initialOwner) Ownable(initialOwner) {}

    function createCampaign(
        string memory name,
        string memory description,
        uint256 start,
        uint256 end
    ) external nonReentrant whenNotPaused {
        // Input validation
        require(bytes(name).length > 0 && bytes(name).length <= MAX_NAME_LENGTH, "Invalid name length");
        require(bytes(description).length > 0 && bytes(description).length <= MAX_DESCRIPTION_LENGTH, "Invalid description length");
        require(start >= block.timestamp, "Start time must be in future");
        require(end > start, "End time must be after start time");
        require(end - start >= MIN_CAMPAIGN_DURATION, "Campaign too short");
        require(end - start <= MAX_CAMPAIGN_DURATION, "Campaign too long");

        campaigns.push(
            Campaign(
                name,
                description,
                start,
                end,
                msg.sender,
                false,
                new uint256[](0)
            )
        );
        
        emit CampaignCreated(
            campaigns.length - 1,
            msg.sender,
            name,
            description,
            start,
            end
        );
    }

    function endCampaign(
        uint256 campaignId,
        uint256[] memory topArtworkIds
    ) external nonReentrant validCampaignId(campaignId) {
        Campaign storage c = campaigns[campaignId];
        require(!c.ended, "Campaign already ended");
        require(msg.sender == c.creator, "Only creator can end campaign");
        require(block.timestamp >= c.end, "Campaign not yet finished");
        
        c.ended = true;
        emit CampaignEnded(campaignId, topArtworkIds);
    }

    function addArtworkToCampaign(
        uint256 campaignId,
        uint256 artworkId
    ) external onlyAuthorized validCampaignId(campaignId) {
        Campaign storage c = campaigns[campaignId];
        require(!c.ended, "Campaign has ended");
        require(block.timestamp >= c.start && block.timestamp <= c.end, "Campaign not active");
        
        campaigns[campaignId].artworkIds.push(artworkId);
    }

    function getCampaign(
        uint256 campaignId
    ) external view validCampaignId(campaignId) returns (Campaign memory) {
        return campaigns[campaignId];
    }

    function getCampaignsCount() external view returns (uint256) {
        return campaigns.length;
    }

    function isCampaignActive(uint256 campaignId) external view validCampaignId(campaignId) returns (bool) {
        Campaign storage c = campaigns[campaignId];
        return !c.ended && block.timestamp >= c.start && block.timestamp <= c.end;
    }

    // Admin functions
    function setAuthorizedContract(address contractAddress, bool authorized) external onlyOwner {
        authorizedContracts[contractAddress] = authorized;
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }
}