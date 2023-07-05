// SPDX-License-Identifier: MIT

pragma solidity ^0.8.17;

import "../common/Ownable.sol";
import "../common/ERC20.sol";
import "../common/ERC721.sol";
import "../common/IERC721Receiver.sol";

contract Extension is Ownable, IERC721Receiver {

    function onERC721Received(
        address,
        address,
        uint256,
        bytes calldata
    ) external
    override
    pure
    returns(bytes4) {
        return bytes4(keccak256("onERC721Received(address,address,uint256,bytes)"));
    }

    /*constructor() {}

    //0x01Add4e55Add4e55Add4e55Add4e55Add4e55Add4e000000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000000b
    //type = 1
    //address = 0xAdd4e55Add4e55Add4e55Add4e55Add4e55Add4e
    //amount = 10
    //id = 11
    function withdraw(bytes calldata args) external onlyOwner {
        bytes1 typeBytes = bytes1(args[0:1]);
        uint8 typeUint = uint8(typeBytes);

        bytes20 contractBytes = bytes20(args[1:21]);
        address contractAddress = address(uint160(contractBytes));

        bytes32 amountBytes = bytes32(args[21:53]);
        uint256 amount = uint256(amountBytes);

        if(typeUint == 1){
            ERC20 erc20 = ERC20(contractAddress);
            erc20.transferFrom(msg.sender, amount);
        }
        else{
            bytes32 idBytes = bytes32(args[53:85]);
            uint256 id = uint256(idBytes);

            ERC721 erc721 = ERC721(contractAddress);
            erc721.transferFrom(address(this), msg.sender, id);
        }
    }

    function checkRequirements(address subscriber) external view returns (bool) {
        ERC20 erc20 = ERC20(0xAdd4e55Add4e55Add4e55Add4e55Add4e55Add4e);
        ERC721 erc721 = ERC721(0xAdd4e55Add4e55Add4e55Add4e55Add4e55Add4e);
        return erc20.allowance(subscriber, address(this)) >= 1 ether || address(this) == erc721.getApproved(1);
    }

    function refund(address address_, uint256 amount) external onlyOwner {
        ERC20 erc20 = ERC20(0xAdd4e55Add4e55Add4e55Add4e55Add4e55Add4e);
        require(erc20.allowance(address_, address(this)) >= amount, "Invalid");
        erc20.transfer(address_, amount);

        //ERC721 erc721 = ERC721(0xAdd4e55Add4e55Add4e55Add4e55Add4e55Add4e);
        //require(address(this) == erc721.getApproved(1), "Invalid");
        //erc721.transferFrom(address_, address_, 1);
    }*/
}
