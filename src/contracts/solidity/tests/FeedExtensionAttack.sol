// SPDX-License-Identifier: MIT

pragma solidity ^0.8.17;

//contract to test if the Feed creation accepts extension without IFeedExtension interface implemented
contract FeedExtensionAttack {

    constructor() {}

    function withdraw(bytes calldata args) external {}

    function subscribe(address subscriber) external {}

    function unsubscribe(address subscriber, uint256 amount) external {}

    function setInfo(address feedAddress_, uint256 price_) external {}

    //without primary functions
    /*function getPrice() external view returns (uint256) {
        return 0;
    }

    function getTokenAddress() external view returns (address) {
        return address(0);
    }

    function getTokenSymbol() external view returns (string memory) {
        return "";
    }

    function getTokenDecimals() external view returns (uint256) {
        return 0;
    }

    function getFeedAddress() external view returns (address) {
        return address(0);
    }*/

    //pretending to have a supportsInterface function
    function supportsInterface(bytes4) public pure returns (bool) {
        return true;
    }
}
