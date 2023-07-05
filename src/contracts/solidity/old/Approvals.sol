// SPDX-License-Identifier: MIT

pragma solidity ^0.8.17;

contract Approvals {
    /*struct Approval{
        address owner;
        address spender;
        uint256 amount;
    }
    mapping(address => Approval) private approvals;
    mapping(address => uint256) private totalApprovals;

    function approve(address owner, address spender, uint256 amount) external {
        Approval storage approval = approvals[spender];
        approval.owner = owner;
        approval.spender = spender;
        approval = amount;

        uint256 total = totalApprovals[spender];
        approvals[spender][total] = approval;
        totalApprovals[spender] = total + 1;
    }*/
}
