// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract GalleryNFT is ERC721, ERC721URIStorage, Ownable {
    event NFTMinted(
        uint256 indexed tokenId,
        address indexed recipient,
        uint256 indexed campaignId,
        uint256 artworkId,
        address originalArtist,
        uint256 votesReceived
    );

    struct NFTMetadata {
        uint256 campaignId;
        uint256 artworkId;
        address originalArtist;
        uint256 votesReceived;
        uint256 mintTimestamp;
        string artworkTitle;
        string artworkDescription;
    }

    mapping(uint256 => NFTMetadata) public nftMetadata;
    mapping(address => bool) public authorizedMinters;
    
    uint256 private _nextTokenId = 1;

    modifier onlyAuthorizedMinter() {
        require(authorizedMinters[msg.sender] || msg.sender == owner(), "Not authorized to mint");
        _;
    }

    constructor(string memory _name, string memory _symbol) 
        ERC721(_name, _symbol) 
        Ownable(msg.sender) 
    {
    }

    function _mintNFTInternal(
        address to,
        string memory tokenURI_,
        uint256 campaignId,
        uint256 artworkId,
        address originalArtist,
        uint256 votesReceived,
        string memory artworkTitle,
        string memory artworkDescription
    ) internal returns (uint256) {
        require(to != address(0), "Cannot mint to zero address");
        require(bytes(tokenURI_).length > 0, "Token URI required");
        require(originalArtist != address(0), "Original artist required");

        uint256 tokenId = _nextTokenId++;
        
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, tokenURI_);
        
        nftMetadata[tokenId] = NFTMetadata(
            campaignId,
            artworkId,
            originalArtist,
            votesReceived,
            block.timestamp,
            artworkTitle,
            artworkDescription
        );

        emit NFTMinted(
            tokenId,
            to,
            campaignId,
            artworkId,
            originalArtist,
            votesReceived
        );

        return tokenId;
    }

    function mintNFT(
        address to,
        string memory tokenURI_,
        uint256 campaignId,
        uint256 artworkId,
        address originalArtist,
        uint256 votesReceived,
        string memory artworkTitle,
        string memory artworkDescription
    ) external onlyAuthorizedMinter returns (uint256) {
        return _mintNFTInternal(
            to,
            tokenURI_,
            campaignId,
            artworkId,
            originalArtist,
            votesReceived,
            artworkTitle,
            artworkDescription
        );
    }

    function batchMintNFTs(
        address[] memory recipients,
        string[] memory tokenURIs,
        uint256[] memory campaignIds,
        uint256[] memory artworkIds,
        address[] memory originalArtists,
        uint256[] memory votesReceived,
        string[] memory artworkTitles,
        string[] memory artworkDescriptions
    ) external onlyAuthorizedMinter {
        require(recipients.length == tokenURIs.length, "Array length mismatch");
        require(recipients.length == campaignIds.length, "Array length mismatch");
        require(recipients.length == artworkIds.length, "Array length mismatch");
        require(recipients.length == originalArtists.length, "Array length mismatch");
        require(recipients.length == votesReceived.length, "Array length mismatch");
        require(recipients.length == artworkTitles.length, "Array length mismatch");
        require(recipients.length == artworkDescriptions.length, "Array length mismatch");

        for (uint256 i = 0; i < recipients.length; i++) {
            _mintNFTInternal(
                recipients[i],
                tokenURIs[i],
                campaignIds[i],
                artworkIds[i],
                originalArtists[i],
                votesReceived[i],
                artworkTitles[i],
                artworkDescriptions[i]
            );
        }
    }

    function getNFTMetadata(uint256 tokenId) external view returns (NFTMetadata memory) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        return nftMetadata[tokenId];
    }

    function getTotalSupply() public view returns (uint256) {
        return _nextTokenId - 1;
    }

    function getNFTsByCampaign(uint256 campaignId) external view returns (uint256[] memory) {
        uint256 totalSupply = getTotalSupply();
        uint256[] memory tokenIds = new uint256[](totalSupply);
        uint256 count = 0;
        
        for (uint256 i = 1; i <= totalSupply; i++) {
            if (_ownerOf(i) != address(0) && nftMetadata[i].campaignId == campaignId) {
                tokenIds[count] = i;
                count++;
            }
        }
        
        // Resize array to actual count
        uint256[] memory result = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = tokenIds[i];
        }
        
        return result;
    }

    function getNFTsByArtist(address artist) external view returns (uint256[] memory) {
        uint256 totalSupply = getTotalSupply();
        uint256[] memory tokenIds = new uint256[](totalSupply);
        uint256 count = 0;
        
        for (uint256 i = 1; i <= totalSupply; i++) {
            if (_ownerOf(i) != address(0) && nftMetadata[i].originalArtist == artist) {
                tokenIds[count] = i;
                count++;
            }
        }
        
        // Resize array to actual count
        uint256[] memory result = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = tokenIds[i];
        }
        
        return result;
    }

    function getAllNFTs() external view returns (uint256[] memory) {
        uint256 totalSupply = getTotalSupply();
        uint256[] memory tokenIds = new uint256[](totalSupply);
        uint256 count = 0;
        
        for (uint256 i = 1; i <= totalSupply; i++) {
            if (_ownerOf(i) != address(0)) {
                tokenIds[count] = i;
                count++;
            }
        }
        
        // Resize array to actual count
        uint256[] memory result = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = tokenIds[i];
        }
        
        return result;
    }

    // Admin functions
    function setAuthorizedMinter(address minter, bool authorized) external onlyOwner {
        authorizedMinters[minter] = authorized;
    }

    // Override required functions
    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}