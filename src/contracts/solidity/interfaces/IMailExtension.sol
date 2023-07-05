// SPDX-License-Identifier: MIT

pragma solidity ^0.8.17;

interface IMailExtension {

    struct SecondaryFee{
        address address_;
        string symbol;
        uint256 decimals;
        uint256 amount;
        uint256 id;
        bool or;
    }

    function antiSPAM(address, address, uint256) external payable;

    function getTokenAddress() external returns (address);

    function getTokenId() external returns (uint256);

    function getTokenSymbol() external returns (string memory);

    function getTokenDecimals() external returns (uint256);

    function getSecondaryFees(uint256) external returns (SecondaryFee memory);

    function supportsInterface(bytes4) external returns (bool);
}
