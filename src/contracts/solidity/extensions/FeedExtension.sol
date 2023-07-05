// SPDX-License-Identifier: MIT

pragma solidity ^0.8.17;

import "../common/ERC20.sol";
import "../common/ERC165.sol";
import "../interfaces/IFeedExtension.sol";

contract FeedExtension is ERC165, IFeedExtension {
    address immutable private TOKEN_ADDRESS;
    uint256 private price;
    address private feedAddress;
    ERC20 private erc20;
    ERC20 private secondaryFee;
    mapping(uint256 => SecondaryFee) private secondaryFees;
    mapping(address => address) private payments;

    constructor(address tokenAddress, uint256 price_) {
        TOKEN_ADDRESS = tokenAddress;
        price = price_;
        erc20 = ERC20(TOKEN_ADDRESS);
        SecondaryFee storage secondaryFee_ = secondaryFees[0];
        secondaryFee_.address_ = 0xcdB87780393081DA11d17864E9a29370667b0178;
        secondaryFee_.symbol = "HBM";
        secondaryFee_.decimals = 18;
        secondaryFee_.amount = 1 ether;
        secondaryFee_.id = 0;
        secondaryFee_.or = true;
        secondaryFee = ERC20(0xcdB87780393081DA11d17864E9a29370667b0178);
    }

    //0xAdd4e55Add4e55Add4e55Add4e55Add4e55Add4e000000000000000000000000000000000000000000000000000000000000000a
    //to = Add4e55Add4e55Add4e55Add4e55Add4e55Add4e
    //amount = 10
    function withdraw(bytes calldata args) external {
        require(msg.sender == feedAddress, "Inv. caller");

        bytes20 toBytes = bytes20(args[0:20]);
        address to = address(uint160(toBytes));

        bytes32 amountBytes = bytes32(args[20:52]);
        uint256 amount = uint256(amountBytes);

        erc20.transfer(to, amount);
        //secondaryFee.transfer(to, amount);
    }

    function subscribe(address subscriber) external payable {
        require(msg.sender == feedAddress, "Inv. caller");
        require(erc20.allowance(subscriber, address(this)) >= price
            /*|| secondaryFee.allowance(subscriber, address(this)) >= 1 ether*/, "No funds");

        if(erc20.allowance(subscriber, address(this)) >= price){
            erc20.transferFrom(subscriber, address(this), price);
            payments[subscriber] = TOKEN_ADDRESS;
        }
        /*else{
            secondaryFee.transferFrom(subscriber, address(this), 1 ether);
            payments[subscriber] = 0xcdB87780393081DA11d17864E9a29370667b0178;
        }*/
    }

    function unsubscribe(address subscriber, uint256 amount) external {
        require(msg.sender == feedAddress, "Inv. caller");
        if(payments[subscriber] == TOKEN_ADDRESS){
            erc20.transfer(subscriber, amount);
        }
        /*else{
            secondaryFee.transfer(subscriber, 1 ether);
        }*/
    }

    function setInfo(address feedAddress_, uint256 price_) external {
        if(feedAddress == address(0)){
            feedAddress = feedAddress_;
        }
        if(msg.sender == feedAddress){
            price = price_;
        }
    }

    function getPrice() external view returns (uint256) {
        return price;
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

    function getFeedAddress() external view returns (address) {
        return feedAddress;
    }

    function getSecondaryFees(uint256 id) external view returns (SecondaryFee memory) {
        return secondaryFees[id];
    }

    function supportsInterface(bytes4 interfaceId) public view virtual override (ERC165, IFeedExtension) returns (bool) {
        return interfaceId == type(IFeedExtension).interfaceId || super.supportsInterface(interfaceId);
    }
}
