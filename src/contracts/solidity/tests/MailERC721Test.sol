// SPDX-License-Identifier: MIT

pragma solidity ^0.8.17;

import "../custom/MailERC721.sol";

contract MailERC721Test is MailERC721 {
    constructor(address creditsAddress, address launchpadAddress) MailERC721(creditsAddress, launchpadAddress){}

    function addSubscription(address subscriberAddress) external override {}

    function removeSubscription(address subscriberAddress) external override {}
}