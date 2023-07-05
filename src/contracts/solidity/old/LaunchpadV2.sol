// SPDX-License-Identifier: MIT

pragma solidity ^0.8.17;

import "../common/ERC20.sol";

contract LaunchpadV2 {
    address immutable private CREDITS_ADDRESS;
    uint256 constant private CREDITS_PRICE = 0.0000077 ether;
    uint64 constant private REWARD_INTERVAL_IN_SECS = 2_592_000;
    uint8 constant private PERCENT_PER_REWARD = 1;
    mapping(address => uint256) private deposits;
    mapping(address => uint256) private lastWithdraw;
    uint256 private creationBlock;
    ERC20 private credits;

    constructor(address creditsAddress) {
        CREDITS_ADDRESS = creditsAddress;
        credits = ERC20(CREDITS_ADDRESS);
        creationBlock = block.timestamp;
    }

    function buyToken(uint256 amount) external payable {
        uint256 total = (amount * CREDITS_PRICE) / 1 ether;
        require(msg.value >= total, "Invalid value");

        credits.transfer(msg.sender, amount);

        if(lastWithdraw[msg.sender] == 0){
            lastWithdraw[msg.sender] = block.timestamp;
        }
    }

    function depositToken(uint256 amount) external {
        require(amount > 0, "Invalid amount");

        credits.transferFrom(msg.sender, address(this), amount);

        deposits[msg.sender] = deposits[msg.sender] + amount;
    }

    function withdrawToken(uint256 amount) external {
        uint256 deposit = deposits[msg.sender];
        require(deposit >= amount, "Invalid amount");

        credits.transfer(msg.sender, amount);

        deposits[msg.sender] = deposit - amount;
    }

    function withdrawEther(uint256 value) external {
        uint256 deposit = deposits[msg.sender];
        uint256 total = (deposit * CREDITS_PRICE) / 1 ether;
        require(total >= value, "Invalid value");

        if(value > address(this).balance){
            value = address(this).balance;
        }

        (bool sentEther,) = msg.sender.call{value: value}("");
        require(sentEther, "Failed to send ether");

        uint256 amount = (value / CREDITS_PRICE) * 1 ether;
        deposits[msg.sender] = deposit - amount;
    }

    function withdrawReward() external {
        uint256 payments = getTotalPayments(msg.sender);
        require(payments >= 1, "Can't withdraw");

        uint256 userBalance = credits.balanceOf(msg.sender);
        uint256 contractBalance = credits.balanceOf(address(this));
        uint256 total = getTotalReward(userBalance, contractBalance, payments);
        credits.transfer(msg.sender, total);

        lastWithdraw[msg.sender] = block.timestamp;

        uint256 deposit = deposits[msg.sender];
        if(deposit >= total){
            deposits[msg.sender] = deposit - total;
        }
    }

    function getTotalReward(uint256 userBalance, uint256 contractBalance, uint256 payments) public pure returns (uint256){
        uint256 total;
        for(uint i;i<payments;){
            total = total + ((userBalance * PERCENT_PER_REWARD) / 100);
            unchecked{i++;}
        }
        if(total > contractBalance){
            total = contractBalance;
        }
        return total;
    }

    function getTotalPayments(address user) public view returns (uint256){
        uint256 diff;
        if(lastWithdraw[user] > 0){
            diff = block.timestamp - lastWithdraw[user];
        }
        else{
            diff = block.timestamp - creationBlock;
        }
        return diff / REWARD_INTERVAL_IN_SECS;
    }

    function getTotalDeposits(address user) external view returns (uint256){
        return deposits[user];
    }

    function getLastWithdraw(address user) external view returns (uint256){
        return lastWithdraw[user];
    }

    function getRewardInterval() external pure returns (uint256){
        return REWARD_INTERVAL_IN_SECS;
    }

    function getCreditsPrice() external pure returns (uint256){
        return CREDITS_PRICE;
    }
}
