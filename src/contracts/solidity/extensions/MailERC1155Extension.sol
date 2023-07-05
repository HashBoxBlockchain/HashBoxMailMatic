// SPDX-License-Identifier: MIT

pragma solidity ^0.8.17;

import "../common/ERC1155.sol";
import "../common/ERC165.sol";
import "../interfaces/IMailExtension.sol";

contract MailERC1155Extension is ERC165, IMailExtension {
    address immutable private MAIL_ADDRESS;
    address immutable private TOKEN_ADDRESS;
    ERC1155 private erc1155;
    mapping(uint256 => SecondaryFee) private secondaryFees;

    constructor(address mailAddress, address tokenAddress) {
        MAIL_ADDRESS = mailAddress;
        TOKEN_ADDRESS = tokenAddress;
        erc1155 = ERC1155(TOKEN_ADDRESS);
        SecondaryFee storage secondaryFee = secondaryFees[0];
        secondaryFee.address_ = address(0);
        secondaryFee.symbol = "MATIC";
        secondaryFee.decimals = 18;
        secondaryFee.amount = 0.000001 ether;
        secondaryFee.id = 0;
        secondaryFee.or = true;
    }

    function antiSPAM(address sender, address receiver, uint256) external payable {
        require(msg.sender == MAIL_ADDRESS, "Inv. caller");
        require(erc1155.balanceOf(sender, 1) > 0 && msg.value >= 0.000001 ether, "No funds");
        (bool sentEther,) = receiver.call{value: 0.000001 ether}("");
        require(sentEther, "Failed");
    }

    function getTokenAddress() external view returns (address) {
        return TOKEN_ADDRESS;
    }

    function getTokenId() external pure returns (uint256) {
        return 0;
    }

    function getTokenSymbol() external pure returns (string memory) {
        return "HBM";
    }

    function getTokenDecimals() external pure returns (uint256) {
        return 18;
    }

    function getSecondaryFees(uint256 id) external view returns (SecondaryFee memory) {
        return secondaryFees[id];
    }

    function supportsInterface(bytes4 interfaceId) public view virtual override (ERC165, IMailExtension) returns (bool) {
        return interfaceId == type(IMailExtension).interfaceId || super.supportsInterface(interfaceId);
    }
}
