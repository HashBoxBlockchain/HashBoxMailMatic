// SPDX-License-Identifier: MIT

pragma solidity ^0.8.17;

import "../common/ERC20.sol";
import "../common/ERC165.sol";
import "../interfaces/IMailExtension.sol";

contract MailExtension is ERC165, IMailExtension {
    address immutable private MAIL_ADDRESS;
    address immutable private TOKEN_ADDRESS;
    ERC20 private erc20;
    mapping(uint256 => SecondaryFee) private secondaryFees;

    constructor(address mailAddress, address tokenAddress) {
        MAIL_ADDRESS = mailAddress;
        TOKEN_ADDRESS = tokenAddress;
        erc20 = ERC20(TOKEN_ADDRESS);
        SecondaryFee storage secondaryFee = secondaryFees[0];
        secondaryFee.address_ = address(0);
        secondaryFee.symbol = "MATIC";
        secondaryFee.decimals = 18;
        secondaryFee.amount = 0.000001 ether;
        secondaryFee.id = 0;
        secondaryFee.or = true;
    }

    function antiSPAM(address sender, address receiver, uint256 fee) external payable {
        require(msg.sender == MAIL_ADDRESS, "Inv. caller");
        require(erc20.allowance(sender, address(this)) >= fee /*|| msg.value >= 0.000001 ether*/, "No funds");
        if(erc20.allowance(sender, address(this)) >= fee){
            erc20.transferFrom(sender, receiver, fee);
        }
        else{
            (bool sentEther,) = receiver.call{value: 0.000001 ether}("");
            require(sentEther, "Failed");
        }
    }

    function getTokenAddress() external view returns (address) {
        return TOKEN_ADDRESS;
    }

    function getTokenId() external pure returns (uint256) {
        return 0;
    }

    function getTokenSymbol() external view returns (string memory) {
        return erc20.symbol();
    }

    function getTokenDecimals() external view returns (uint256) {
        return erc20.decimals();
    }

    function getSecondaryFees(uint256 id) external view returns (SecondaryFee memory) {
        return secondaryFees[id];
    }

    function supportsInterface(bytes4 interfaceId) public view virtual override (ERC165, IMailExtension) returns (bool) {
        return interfaceId == type(IMailExtension).interfaceId || super.supportsInterface(interfaceId);
    }
}
