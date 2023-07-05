// SPDX-License-Identifier: MIT

pragma solidity ^0.8.17;

import "../common/ERC20.sol";

contract LaunchpadV3 {
    address immutable private CREDITS_ADDRESS;
    ERC20 private credits;

    constructor(address creditsAddress) {
        CREDITS_ADDRESS = creditsAddress;
        credits = ERC20(CREDITS_ADDRESS);
    }

    function buyToken(uint256 amount) external payable {
        uint256 value = getTokenPrice(amount);
        require(msg.value >= value, "Invalid value");

        credits.transfer(msg.sender, amount);
    }

    function sellToken(uint256 amount) external {
        require(credits.allowance(msg.sender, address(this)) >= amount, "Invalid amount");
        uint256 value = getTokenPrice(amount);

        credits.transferFrom(msg.sender, address(this), amount);

        (bool sentEther,) = msg.sender.call{value: value}("");
        require(sentEther, "Failed to send ether");
    }

    function addLiquidity(uint256 amount) external payable {
        require(credits.allowance(msg.sender, address(this)) >= amount, "Invalid amount");
        credits.transferFrom(msg.sender, address(this), amount);
    }

    function getTokenPrice(uint256 amount) public view returns (uint256){
        uint256 balanceOfContract = credits.balanceOf(address(this));
        require(balanceOfContract > 0, "Invalid price");

        return amount * (address(this).balance / balanceOfContract);
    }
}
