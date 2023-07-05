// SPDX-License-Identifier: MIT

pragma solidity ^0.8.15;

import "../custom/Feed.sol";

contract FeedAttack_2_Aux {
    Feed private _contract;

    constructor() {}

    function setFeedAddress(address _address) external {
        _contract = Feed(_address);
    }

    function removeSubscriber(address _address) external {
        _contract.removeSubscriber(_address);
    }
}
