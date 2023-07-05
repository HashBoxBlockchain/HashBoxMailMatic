// SPDX-License-Identifier: MIT

pragma solidity ^0.8.17;

import "../common/Ownable.sol";
import "../common/ECDSA.sol";

contract LaunchpadV1 is Ownable {
    /*mapping(uint256 => address) private signers;
    mapping(bytes32 => bool) private usedSignatures;
    uint256 private nonce;
    uint256 private totalSigners;

    function buyToken(uint256 amount, uint256 price, bytes32 hash, bytes[] calldata signatures) external payable {
        _checkHash(amount, price, hash);
        _checkSignatures(hash, signatures);

        uint256 total = (amount * price) / 1 ether;
        require(msg.value >= total, "invalid value");

        ERC20 credits = ERC20(CREDITS_ADDRESS);
        credits.transfer(msg.sender, amount);
        nonce++;

        if(lastWithdraw[msg.sender] == 0){
            lastWithdraw[msg.sender] = block.timestamp;
        }
    }

    function addSigner(address signer) external onlyOwner {
        for(uint i;i<totalSigners;){
            require(signer != signers[i], "invalid signer");
            unchecked{i++;}
        }

        signers[totalSigners] = signer;
        totalSigners++;
    }

    function getSigner(uint256 id) external view returns (address, uint256){
        return (signers[id], totalSigners);
    }

    function getNonce() external view returns (uint256){
        return nonce;
    }

    function _checkHash(uint256 amount, uint256 price, bytes32 hash) private view {
        bytes32 argsHash = keccak256(abi.encodePacked(amount, price, nonce));
        bytes32 hashVerified = ECDSA.toEthSignedMessageHash(argsHash);
        require(hashVerified == hash, "invalid hash");
    }

    function _checkSignatures(bytes32 hash, bytes[] calldata signatures) private {
        uint256 validSignatures;
        uint256 length = signatures.length;

        for(uint i;i<length;){
            bytes memory signature = signatures[i];
            bytes32 signatureHash = keccak256(signature);
            require(!usedSignatures[signatureHash], "signature already used");
            usedSignatures[signatureHash] = true;

            (address recovered, ECDSA.RecoverError error) = ECDSA.tryRecover(hash, signature);
            if(error == ECDSA.RecoverError.NoError){
                for(uint j;j<totalSigners;){
                    if(recovered == signers[j]){
                        validSignatures++;
                        break;
                    }
                    unchecked{j++;}
                }
            }
            unchecked{i++;}
        }

        require(validSignatures >= (totalSigners / 2), "invalid signatures");
    }*/
}
