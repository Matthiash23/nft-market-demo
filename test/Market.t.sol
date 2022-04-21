// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "ds-test/test.sol";
import "src/Market.sol";
import "src/Nft.sol";

interface CheatCodes {
    function expectEmit(
        bool,
        bool,
        bool,
        bool
    ) external;
    function startPrank(address) external;
    function stopPrank() external;
    function addr(uint256 privateKey) external returns (address);
}

contract MarketTest is DSTest {
    address constant TEST_DEPLOYER = 0xb4c79daB8f259C7Aee6E5b2Aa729821864227e84;
    Market market;
    Longuniquename nft;
    CheatCodes constant cheats = CheatCodes(HEVM_ADDRESS);
    

    event ListingCreated (
        uint256 indexed listingId,
        address indexed tokenContract,
        uint256 indexed tokenId,
        address seller,
        address owner,
        uint256 price,
        bool sold
    );

    function setUp() public {
        market = new Market(0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199);
        nft = new Longuniquename(address(market));
    }

    function testListingPrice() public {
        assertEq(market.getListingPrice(), 0.0005 ether);
    }

    function testNFTCreation() public {
        uint tokenId = nft.mintToken("https://demotokenurl.com");

        assertEq(tokenId, 1);
        assertEq(IERC721(address(nft)).ownerOf(tokenId), TEST_DEPLOYER);
        
    }

    function testNFTListing() public {
        uint tokenId = nft.mintToken("https://demotokenurl.com");
        
        cheats.expectEmit(true, true, true, false);
        emit ListingCreated(1, address(nft), tokenId, address(0), address(0), 0.001 ether, false);

        market.createListing{value: 0.0005 ether}(address(nft), tokenId, 0.001 ether);
    }

    function testListingPurchase() public {
        uint tokenId = _createListing();

        assertEq(IERC721(address(nft)).ownerOf(tokenId), address(market));

        address buyer = cheats.addr(1);
        payable(address(buyer)).transfer(1 ether);
        
        cheats.startPrank(buyer);
        market.purchaseListing{value: 0.001 ether}(address(nft), 1);
        cheats.stopPrank();

        assertEq(IERC721(address(nft)).ownerOf(tokenId), buyer);
    }

    function testOpenListings() public {
        uint tokenId = nft.mintToken("https://demotokenurl.com");
        market.createListing{value: 0.0005 ether}(address(nft), tokenId, 0.001 ether);

        Market.TokenListing[] memory listings = market.getOpenListings();
        assertEq(listings.length, 1);
    }

    function testUserPurchasedListings() public {
        Market.TokenListing[] memory listings = market.getUserPurchasedListings();
        assertEq(listings.length, 0);

        uint tokenId = _createListing();
        market.purchaseListing{value: 0.001 ether}(address(nft), 1);
        assertEq(IERC721(address(nft)).ownerOf(tokenId), TEST_DEPLOYER);

        listings = market.getUserPurchasedListings();
        assertEq(listings.length, 1);
    }

    function testUserCreatedListing() public {
        Market.TokenListing[] memory listings = market.getUserCreatedListings();
        assertEq(listings.length, 0);

        uint tokenId = nft.mintToken("https://demotokenurl.com");
        market.createListing{value: 0.0005 ether}(address(nft), tokenId, 0.001 ether);

        listings = market.getUserCreatedListings();
        assertEq(listings.length, 1);
    }

    function _createListing() internal returns(uint) {
        address seller = cheats.addr(23);
        payable(address(seller)).transfer(1 ether);

        cheats.startPrank(seller);
        uint tokenId = nft.mintToken("https://demotokenurl.com");
        market.createListing{value: 0.0005 ether}(address(nft), tokenId, 0.001 ether);
        cheats.stopPrank();

        return tokenId;
    }

}
