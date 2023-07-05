// SPDX-License-Identifier: MIT

pragma solidity ^0.8.17;

import "../common/ERC165Checker.sol";
import "../interfaces/IMailExtension.sol";

library CheckMailExtension {
    function check(address extensionAddress) external view {
        if(extensionAddress != address(0)){
            require(ERC165Checker.supportsInterface(extensionAddress, type(IMailExtension).interfaceId), "Inv. Extension");
        }
    }
}
