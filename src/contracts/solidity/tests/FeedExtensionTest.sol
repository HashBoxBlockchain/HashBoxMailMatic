// SPDX-License-Identifier: MIT

pragma solidity ^0.8.17;

import "../extensions/FeedExtension.sol";

contract FeedExtensionTest is FeedExtension {
    constructor(address tokenAddress, uint256 price) FeedExtension(tokenAddress, price){}
}
