// SPDX-License-Identifier: MIT

pragma solidity ^0.8.17;

import "../common/ERC165Checker.sol";
import "../interfaces/IFeedExtension.sol";

library CheckFeedExtension {
    function check(address extensionAddress) external view {
        require(ERC165Checker.supportsInterface(extensionAddress, type(IFeedExtension).interfaceId), "Inv. Extension");
    }
}
