// SPDX-License-Identifier: MIT

pragma solidity ^0.8.17;

import "../common/IERC721Receiver.sol";
import "../common/ReentrancyGuard.sol";
import "../common/Ownable.sol";
import "../common/ERC20.sol";
import "./MailERC721.sol";
import "./Feed.sol";
import "./MailFeeds.sol";

contract NoReply is IERC721Receiver, ReentrancyGuard, Ownable {
    MailERC721 private mail;
    ERC20 private credits;

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

    constructor(address creditsAddress, address mailAddress) {
        credits = ERC20(creditsAddress);
        mail = MailERC721(mailAddress);
    }

    receive() external payable {
        if(msg.sender == 0x24BdEE6026041375e3697916087dE36046Bea2f1){
            require(msg.value == 1 ether, "Invalid amount");
        }
    }

    function setFee(uint256 fee, bool isAlwaysPaid) external onlyOwner {
        mail.setFee(address(0), fee, isAlwaysPaid, address(0), false);
    }

    function sendMail(address to, string calldata mailBoxUri, string calldata mailUri, uint256 customFee) external payable onlyOwner {
        mail.sendMail{value: msg.value}(to, mailBoxUri, mailUri, customFee);
    }

    function approveCredits(address spender, uint256 amount) external onlyOwner {
        credits.approve(spender, amount);
    }

    function createMailFeed(string[2] calldata args, uint256 timeInSecs, address extensionAddress, uint256 price, uint256 maxNumberSubscribers) external onlyOwner {
        mail.createMailFeed(args, timeInSecs, extensionAddress, price, maxNumberSubscribers);
    }

    function renewMailFeeds(address[] calldata feedAddresses) external onlyOwner {
        mail.renewMailFeeds(feedAddresses);
    }

    function deleteMailFeeds(address[] calldata feedAddresses) external onlyOwner {
        address mailFeedsAddress = mail.getMailFeedsAddress();
        MailFeeds mailFeeds = MailFeeds(mailFeedsAddress);
        mailFeeds.deleteMailFeeds(feedAddresses);
    }

    function subscribe(address feedAddress) external payable onlyOwner {
        Feed feed = Feed(feedAddress);
        feed.subscribe{value: msg.value}();
    }

    function sendFeed(address feedAddress, address[] calldata to, string[] calldata mailUri) external onlyOwner {
        mail.sendFeed(feedAddress, to, mailUri);

        uint256 length = to.length;
        for(uint i;i<length;){
            address receiver = to[i];
            (,,,bool isBlocked) = mail.getFromToInfo(address(this), receiver, 0, 1);
            if(!isBlocked){
                address[] memory r = new address[](1);
                bool[] memory b = new bool[](1);
                r[0] = receiver;
                b[0] = true;
                mail.blockUsers(r, b);
            }
            unchecked{i++;}
        }
    }

    function withdrawEther(uint256 amount) external onlyOwner nonReentrant {
        (bool sentEther,) = msg.sender.call{value: amount}("");
        require(sentEther, "Failed to send ether");
    }

    function getMailFeed(address feedAddress) external view returns (MailFeeds.MailFeed memory){
        address mailFeedsAddress = mail.getMailFeedsAddress();
        MailFeeds mailFeeds = MailFeeds(mailFeedsAddress);
        (MailFeeds.MailFeed memory mailFeed,,,) = mailFeeds.getInfo(feedAddress, address(0), 0);
        return mailFeed;
    }
}
