// SPDX-License-Identifier: MIT

pragma solidity ^0.8.17;

import "../common/ERC20.sol";
import "../common/ReentrancyGuard.sol";

contract Launchpad is ReentrancyGuard {
    uint256 constant private CREDITS_PRICE = 0.008 ether;
    uint256 constant private MIN_CREDITS_AMOUNT = 1000 ether;
    mapping(address => uint256) private deposits;
    ERC20 private credits;

    constructor(address creditsAddress) {
        credits = ERC20(creditsAddress);
    }

    function buyToken(uint256 amount) external payable {
        uint256 total = (amount * CREDITS_PRICE) / 1 ether;
        require(msg.value >= total, "Inv. value");
        require(amount >= MIN_CREDITS_AMOUNT, "Inv. amount");

        credits.transfer(msg.sender, amount);
    }

    function sellToken(uint256 amount) external {
        uint256 value = (amount * CREDITS_PRICE) / 1 ether;
        require(address(this).balance >= value, "Inv. amount");

        credits.transferFrom(msg.sender, address(this), amount);

        (bool sentEther,) = msg.sender.call{value: value}("");
        require(sentEther, "Failed");
    }

    function depositToken(uint256 amount) external {
        require(amount > 0, "Inv. amount");

        credits.transferFrom(msg.sender, address(this), amount);

        deposits[msg.sender] = deposits[msg.sender] + amount;
    }

    function withdrawToken(uint256 amount) external {
        uint256 deposit = deposits[msg.sender];
        require(deposit >= amount, "Inv. amount");

        credits.transfer(msg.sender, amount);

        deposits[msg.sender] = deposit - amount;
    }

    function withdrawEther(uint256 value) external nonReentrant {
        uint256 deposit = deposits[msg.sender];
        uint256 total = (deposit * CREDITS_PRICE) / 1 ether;
        require(total >= value, "Inv. value");

        (bool sentEther,) = msg.sender.call{value: value}("");
        require(sentEther, "Failed");

        uint256 amount = (value / CREDITS_PRICE) * 1 ether;
        deposits[msg.sender] = deposit - amount;
    }

    function getTotalDeposits(address user) external view returns (uint256){
        return deposits[user];
    }

    function getCreditsPrice() external pure returns (uint256){
        return CREDITS_PRICE;
    }

    function getMinCreditsAmount() external pure returns (uint256){
        return MIN_CREDITS_AMOUNT;
    }
}
