// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract GalleryNFT is ERC721URIStorage, ERC721Burnable, ReentrancyGuard, Pausable, Ownable {
    uint256 public nextTokenId;

    event NFTMinted(
        uint256 indexed tokenId,
        address indexed to,
        string tokenURI,
        uint256 indexed campaignId,
        uint256 artworkId
    );

    struct NFTMetadata {
        uint256 campaignId;
        uint256 artworkId;
        address originalArtist;
        uint256 mintedAt;
        uint256 votes;
    }

    mapping(uint256 => NFTMetadata) public nftMetadata;
    mapping(uint256 => mapping(uint256 => bool)) public campaignArtworkMinted; // campaignId => artworkId => minted
    
    // Authorized minters (campaign managers, etc.)
    mapping(address => bool) public authorizedMinters;

    modifier onlyAuthorizedMinter() {
        require(authorizedMinters[msg.sender] || msg.sender == owner(), "Not authorized to mint");
        _;
    }

    constructor(address initialOwner) 
        ERC721("Gallery NFT", "GNFT") 
        Ownable(initialOwner) 
    {
        authorizedMinters[initialOwner] = true;
    }

    function mintNFT(
        address to,
        string memory _tokenURI,
        uint256 campaignId,
        uint256 artworkId,
        address originalArtist,
        uint256 votesReceived
    ) external onlyAuthorizedMinter nonReentrant whenNotPaused returns (uint256) {
        require(to != address(0), "Cannot mint to zero address");
        require(bytes(_tokenURI).length > 0, "Token URI cannot be empty");
        require(originalArtist != address(0), "Invalid artist address");
        require(!campaignArtworkMinted[campaignId][artworkId], "NFT already minted for this artwork");

        uint256 tokenId = nextTokenId++;
        
        // Mark as minted
        campaignArtworkMinted[campaignId][artworkId] = true;
        
        // Store metadata
        nftMetadata[tokenId] = NFTMetadata({
            campaignId: campaignId,
            artworkId: artworkId,
            originalArtist: originalArtist,
            mintedAt: block.timestamp,
            votes: votesReceived
        });

        _mint(to, tokenId);
        _setTokenURI(tokenId, _tokenURI);
        
        emit NFTMinted(tokenId, to, _tokenURI, campaignId, artworkId);
        return tokenId;
    }

    function batchMintNFTs(
        address[] memory recipients,
        string[] memory tokenURIs,
        uint256[] memory campaignIds,
        uint256[] memory artworkIds,
        address[] memory originalArtists,
        uint256[] memory votesReceived
    ) external onlyAuthorizedMinter nonReentrant whenNotPaused {
        require(recipients.length == tokenURIs.length, "Array length mismatch");
        require(recipients.length == campaignIds.length, "Array length mismatch");
        require(recipients.length == artworkIds.length, "Array length mismatch");
        require(recipients.length == originalArtists.length, "Array length mismatch");
        require(recipients.length == votesReceived.length, "Array length mismatch");
        require(recipients.length <= 50, "Too many NFTs to mint at once");

        for (uint256 i = 0; i < recipients.length; i++) {
            _mintSingleNFT(
                recipients[i],
                tokenURIs[i],
                campaignIds[i],
                artworkIds[i],
                originalArtists[i],
                votesReceived[i]
            );
        }
    }

    function _mintSingleNFT(
        address to,
        string memory _tokenURI,
        uint256 campaignId,
        uint256 artworkId,
        address originalArtist,
        uint256 votesReceived
    ) internal {
        require(to != address(0), "Cannot mint to zero address");
        require(bytes(_tokenURI).length > 0, "Token URI cannot be empty");
        require(originalArtist != address(0), "Invalid artist address");
        require(!campaignArtworkMinted[campaignId][artworkId], "NFT already minted for this artwork");

        uint256 tokenId = nextTokenId++;
        
        // Mark as minted
        campaignArtworkMinted[campaignId][artworkId] = true;
        
        // Store metadata
        nftMetadata[tokenId] = NFTMetadata({
            campaignId: campaignId,
            artworkId: artworkId,
            originalArtist: originalArtist,
            mintedAt: block.timestamp,
            votes: votesReceived
        });

        _mint(to, tokenId);
        _setTokenURI(tokenId, _tokenURI);
        
        emit NFTMinted(tokenId, to, _tokenURI, campaignId, artworkId);
    }

    function getNFTMetadata(uint256 tokenId) external view returns (NFTMetadata memory) {
        require(_ownerOf(tokenId) != address(0), "NFT does not exist");
        return nftMetadata[tokenId];
    }

    function isArtworkMinted(uint256 campaignId, uint256 artworkId) external view returns (bool) {
        return campaignArtworkMinted[campaignId][artworkId];
    }

    function totalSupply() external view returns (uint256) {
        return nextTokenId;
    }

    // Admin functions
    function setAuthorizedMinter(address minter, bool authorized) external onlyOwner {
        require(minter != address(0), "Invalid minter address");
        authorizedMinters[minter] = authorized;
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    // Override required by Solidity
    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    // Prevent transfers when paused
    function _update(address to, uint256 tokenId, address auth) internal override whenNotPaused returns (address) {
        return super._update(to, tokenId, auth);
    }
}