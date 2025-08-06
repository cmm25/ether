// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract CampaignManager {
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
    address public owner;
    uint256 public creationFee = 0.001 ether;
    mapping(address => bool) public authorizedContracts;

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }

    modifier validCampaignId(uint256 campaignId) {
        require(campaignId < campaigns.length, "Invalid campaign ID");
        _;
    }

    modifier onlyAuthorized() {
        require(authorizedContracts[msg.sender] || msg.sender == owner, "Not authorized");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function createCampaign(
        string memory name,
        string memory description,
        uint256 start,
        uint256 end
    ) external payable returns (uint256) {
        require(msg.value >= creationFee, "Insufficient creation fee");
        require(bytes(name).length > 0, "Name required");
        require(bytes(description).length > 0, "Description required");
        require(start >= block.timestamp, "Start time must be in future");
        require(end > start, "End time must be after start time");

        uint256 campaignId = campaigns.length;
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
        
        emit CampaignCreated(campaignId, msg.sender, name, description, start, end);
        return campaignId;
    }

    function endCampaign(
        uint256 campaignId,
        uint256[] memory topArtworkIds
    ) external validCampaignId(campaignId) {
        Campaign storage c = campaigns[campaignId];
        require(!c.ended, "Campaign already ended");
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

    function isCampaignActive(uint256 campaignId) external view validCampaignId(campaignId) returns (bool) {
        Campaign storage c = campaigns[campaignId];
        return !c.ended && block.timestamp >= c.start && block.timestamp <= c.end;
    }

    function getCampaign(uint256 campaignId) external view validCampaignId(campaignId) returns (Campaign memory) {
        return campaigns[campaignId];
    }

    function getCampaignsCount() external view returns (uint256) {
        return campaigns.length;
    }

    function getCampaignArtworks(uint256 campaignId) external view validCampaignId(campaignId) returns (uint256[] memory) {
        return campaigns[campaignId].artworkIds;
    }

    function getCreationFee() external view returns (uint256) {
        return creationFee;
    }

    function setCreationFee(uint256 _creationFee) external onlyOwner {
        creationFee = _creationFee;
    }

    function setAuthorizedContract(address contractAddress, bool authorized) external onlyOwner {
        authorizedContracts[contractAddress] = authorized;
    }

    function withdrawFees() external onlyOwner {
        payable(owner).transfer(address(this).balance);
    }

    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Invalid address");
        owner = newOwner;
    }
}