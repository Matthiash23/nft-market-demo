// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "openzeppelin-contracts/contracts/token/ERC721/ERC721.sol";
import "openzeppelin-contracts/contracts/security/ReentrancyGuard.sol";
import "openzeppelin-contracts/contracts/utils/Counters.sol";

contract Market is ReentrancyGuard {
    using Counters for Counters.Counter;
    Counters.Counter private _listingIds;
    Counters.Counter private _numberSold;

    address payable owner;

    struct TokenListing {
        uint256 listingId;
        address tokenContract;
        uint256 tokenId;
        address payable seller;
        address payable owner;
        uint256 price;
        bool sold;
    }
    uint256 listingPrice = 0.0005 ether;

    mapping(uint256 => TokenListing) private idToListing;

    event ListingCreated (
        uint256 indexed listingId,
        address indexed tokenContract,
        uint256 indexed tokenId,
        address seller,
        address owner,
        uint256 price,
        bool sold
    );

    constructor(address ownerAddress){
        owner = payable(ownerAddress);
    }

    function getListingPrice() public view returns(uint256) {
        return listingPrice;
    }

    function createListing (address _tokenContract, uint256 _tokenId, uint256 _price) public payable nonReentrant {
        require(_price > 0, "price needs to be at least 1");
        require(msg.value == listingPrice, "value should be equal to listing price");

        _listingIds.increment();
        uint256 listingId = _listingIds.current();

        idToListing[listingId] = TokenListing(
            listingId,
            _tokenContract,
            _tokenId,
            payable(msg.sender),
            payable(address(0)),
            _price,
            false
        );

        IERC721(_tokenContract).transferFrom(msg.sender, address(this), _tokenId);

        emit ListingCreated(listingId, _tokenContract, _tokenId, msg.sender, address(0), _price, false);

    }

    function purchaseListing(address _tokenContract, uint256 _listingId) public payable nonReentrant {

        uint256 price = idToListing[_listingId].price;
        uint256 tokenId = idToListing[_listingId].tokenId;
        address seller = idToListing[_listingId].seller;

        require(msg.value == price, "Please submit the full price");
        // require(true == false, idToListing[_listingId].sold);

        idToListing[_listingId].owner = payable(msg.sender);
        idToListing[_listingId].sold = true;
        idToListing[_listingId].seller = payable(address(0));
        _numberSold.increment();

        IERC721(_tokenContract).transferFrom(address(this), msg.sender, tokenId);
        payable(owner).transfer(listingPrice);
        payable(seller).transfer(msg.value);
    }

    function getOpenListings() public view returns(TokenListing[] memory) {
        uint listingCount = _listingIds.current();
        uint openListingCount = listingCount - _numberSold.current();

        TokenListing[] memory listings = new TokenListing[](openListingCount);

        uint16 currentIndex;
        uint i = 0; 
        while(i < listingCount){
            if(idToListing[i + 1].owner == address(0)) {
                uint256 currentId = idToListing[i + 1].listingId;
                TokenListing storage currentListing = idToListing[currentId];
                listings[currentIndex]  = currentListing;
                unchecked {
                    ++currentIndex;
                }
            }
            unchecked{
                ++i;   
            }
        }
        return listings;
    }

    function getUserPurchasedListings() public view returns(TokenListing[] memory) {
        uint256 listingsCount = _listingIds.current();
        uint256 ownedListingsCount;
        uint256 currentIndex;

        uint i;
        while(i < listingsCount) {
            if(idToListing[i + 1].owner == msg.sender) {
                unchecked {
                    ++ownedListingsCount;
                }
            }
            unchecked {
                ++i;
            }
        }
        
        TokenListing[] memory listings = new TokenListing[](ownedListingsCount);
        i = 0;
        while (i < listingsCount) {
            if(idToListing[i + 1].owner == msg.sender) {
                uint256 currentId = idToListing[i + 1].listingId;
                TokenListing storage currentListing = idToListing[currentId];
                listings[currentIndex]  = currentListing;
                unchecked {
                    ++ownedListingsCount;
                }
            }
            unchecked {
                ++i;
            }
        }
        return listings;
    }

    function getUserCreatedListings() public view returns(TokenListing[] memory) {
        uint256 listingsCount = _listingIds.current();
        uint256 createdListingsCount;
        uint256 currentIndex;

        uint i;
        while(i < listingsCount) {
            if(idToListing[i + 1].seller == msg.sender) {
                unchecked {
                    ++createdListingsCount;
                }
            }
            unchecked {
                ++i;
            }
        }
        
        TokenListing[] memory listings = new TokenListing[](createdListingsCount);
        i = 0;
        while (i < listingsCount) {
            if(idToListing[i + 1].seller == msg.sender) {
                uint256 currentId = idToListing[i + 1].listingId;
                TokenListing storage currentListing = idToListing[currentId];
                listings[currentIndex]  = currentListing;
                unchecked {
                    ++createdListingsCount;
                }
            }
            unchecked {
                ++i;
            }
        }
        return listings;
    }

}