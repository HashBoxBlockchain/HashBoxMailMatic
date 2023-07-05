// SPDX-License-Identifier: MIT

pragma solidity ^0.8.17;

import "../custom/Feed.sol";

contract FeedTest is Feed {
    constructor(address mailAddress, address owner_, uint256 timeInSecs_, address extensionAddress_, uint256 price_, uint256 maxNumberSubscribers_)
    Feed(mailAddress, owner_, timeInSecs_, extensionAddress_, price_, maxNumberSubscribers_){}
}