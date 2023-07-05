// SPDX-License-Identifier: MIT

pragma solidity ^0.8.17;

import "../common/ERC20.sol";

contract CreditsERC20 is ERC20 {
    constructor() ERC20("HashBox Mail Credits", "HBM") {
        _mint(msg.sender, totalSupply());
    }

    function totalSupply() public view override returns (uint256) {
        return 10_000_000_000 * (10 ** uint256(decimals()));
    }

    function getOwner() external pure returns (address) {
        return address(0);
    }
}
