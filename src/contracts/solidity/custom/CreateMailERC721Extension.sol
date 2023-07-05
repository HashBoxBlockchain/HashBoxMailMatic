// SPDX-License-Identifier: MIT

pragma solidity ^0.8.17;

import "../extensions/MailERC721Extension.sol";

contract CreateMailERC721Extension {
    address immutable private MAIL_ADDRESS;
    mapping(address => MailERC721Extension) private extensions;

    constructor(address mailAddress) {
        MAIL_ADDRESS = mailAddress;
    }

    function create(address tokenAddress) external {
        extensions[msg.sender] = new MailERC721Extension(MAIL_ADDRESS, tokenAddress);
    }

    function getExtensionAddress(address user) external view returns (address) {
        return address(extensions[user]);
    }
}
