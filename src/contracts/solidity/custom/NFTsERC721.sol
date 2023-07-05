// SPDX-License-Identifier: MIT

pragma solidity ^0.8.17;

import "../common/ERC721.sol";
import "../common/Ownable.sol";

contract NFTsERC721 is ERC721, Ownable {
    uint256 private id;
    string private baseURI;

    constructor() ERC721("HashBox NFTs", "HBNFT") {}

    function mint() external onlyOwner {
        _safeMint(msg.sender, id++);
    }

    function setBaseURI(string calldata uri) external onlyOwner {
        baseURI = uri;
    }

    function _baseURI() internal view virtual override returns (string memory) {
        return baseURI;
    }

    function totalSupply() external view returns (uint256) {
        return id;
    }

    function getOwner() external view returns (address) {
        return owner();
    }
}
