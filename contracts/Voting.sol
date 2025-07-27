// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

interface ICampaignManager {
    function isCampaignActive(uint256 campaignId) external view returns (bool);
}

interface IArtworkSubmission {
    function getArtwork(uint256 artworkId) external view returns (
        uint256 campaignId,
        address artist,
        string memory artworkURI,
        uint256 votes,
        uint256 submittedAt
    );
}

contract Voting is ReentrancyGuard, Pausable, Ownable {
    event ArtworkVoted(
        uint256 indexed campaignId,
        uint256 indexed artworkId,
        address indexed voter
    );
    
    event VoteRemoved(
        uint256 indexed campaignId,
        uint256 indexed artworkId,
        address indexed voter
    );

    ICampaignManager public campaignManager;
    IArtworkSubmission public artworkSubmission;

    // campaignId => artworkId => voter => voted
    mapping(uint256 => mapping(uint256 => mapping(address => bool))) public hasVoted;
    
    // campaignId => artworkId => vote count
    mapping(uint256 => mapping(uint256 => uint256)) public votes;
    
    // campaignId => voter => vote count (to limit votes per user per campaign)
    mapping(uint256 => mapping(address => uint256)) public userVotesPerCampaign;
    
    uint256 public maxVotesPerUser = 5; // Max votes per user per campaign

    modifier validArtwork(uint256 artworkId) {
        (uint256 campaignId,,,, ) = artworkSubmission.getArtwork(artworkId);
        require(campaignManager.isCampaignActive(campaignId), "Campaign not active");
        _;
    }

    constructor(
        address initialOwner, 
        address _campaignManager, 
        address _artworkSubmission
    ) Ownable(initialOwner) {
        require(_campaignManager != address(0), "Invalid campaign manager");
        require(_artworkSubmission != address(0), "Invalid artwork submission");
        campaignManager = ICampaignManager(_campaignManager);
        artworkSubmission = IArtworkSubmission(_artworkSubmission);
    }

    function voteForArtwork(uint256 campaignId, uint256 artworkId) 
        external 
        nonReentrant 
        whenNotPaused 
        validArtwork(artworkId) 
    {
        require(!hasVoted[campaignId][artworkId][msg.sender], "Already voted for this artwork");
        require(userVotesPerCampaign[campaignId][msg.sender] < maxVotesPerUser, "Max votes reached for this campaign");
        
        // Verify artwork belongs to campaign
        (uint256 artworkCampaignId,,,, ) = artworkSubmission.getArtwork(artworkId);
        require(artworkCampaignId == campaignId, "Artwork not in this campaign");
        
        // Record vote
        hasVoted[campaignId][artworkId][msg.sender] = true;
        votes[campaignId][artworkId]++;
        userVotesPerCampaign[campaignId][msg.sender]++;
        
        emit ArtworkVoted(campaignId, artworkId, msg.sender);
    }

    function removeVote(uint256 campaignId, uint256 artworkId) 
        external 
        nonReentrant 
        whenNotPaused 
        validArtwork(artworkId) 
    {
        require(hasVoted[campaignId][artworkId][msg.sender], "Haven't voted for this artwork");
        
        // Remove vote
        hasVoted[campaignId][artworkId][msg.sender] = false;
        votes[campaignId][artworkId]--;
        userVotesPerCampaign[campaignId][msg.sender]--;
        
        emit VoteRemoved(campaignId, artworkId, msg.sender);
    }

    function getVotes(
        uint256 campaignId,
        uint256 artworkId
    ) external view returns (uint256) {
        return votes[campaignId][artworkId];
    }

    function getUserVoteCount(uint256 campaignId, address user) external view returns (uint256) {
        return userVotesPerCampaign[campaignId][user];
    }

    function hasUserVoted(
        uint256 campaignId, 
        uint256 artworkId, 
        address user
    ) external view returns (bool) {
        return hasVoted[campaignId][artworkId][user];
    }

    // Admin functions
    function setCampaignManager(address _campaignManager) external onlyOwner {
        require(_campaignManager != address(0), "Invalid address");
        campaignManager = ICampaignManager(_campaignManager);
    }

    function setArtworkSubmission(address _artworkSubmission) external onlyOwner {
        require(_artworkSubmission != address(0), "Invalid address");
        artworkSubmission = IArtworkSubmission(_artworkSubmission);
    }

    function setMaxVotesPerUser(uint256 _maxVotes) external onlyOwner {
        require(_maxVotes > 0 && _maxVotes <= 20, "Invalid max votes");
        maxVotesPerUser = _maxVotes;
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }
}