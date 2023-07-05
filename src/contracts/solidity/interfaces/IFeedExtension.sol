// SPDX-License-Identifier: MIT

pragma solidity ^0.8.17;

interface IFeedExtension {

    struct SecondaryFee{
        address address_;
        string symbol;
        uint256 decimals;
        uint256 amount;
        uint256 id;
        bool or;
    }

    function withdraw(bytes calldata) external;

    function setInfo(address, uint256) external;

    function subscribe(address) external payable;

    function unsubscribe(address, uint256) external;

    function getPrice() external returns (uint256);

    function getTokenAddress() external returns (address);

    function getTokenId() external returns (uint256);

    function getTokenSymbol() external returns (string memory);

    function getTokenDecimals() external returns (uint256);

    function getFeedAddress() external returns (address);

    function getSecondaryFees(uint256) external returns (SecondaryFee memory);

    function supportsInterface(bytes4) external returns (bool);
}
