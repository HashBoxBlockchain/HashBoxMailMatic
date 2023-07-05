// SPDX-License-Identifier: MIT

pragma solidity ^0.8.17;

import "./Feed.sol";

contract MailFeeds {
    uint24 constant private MAIL_FEED_EXPIRY_TIME = 30 days;
    mapping(address => mapping(uint256 => address)) private mailFeedOwners;
    mapping(address => uint256) private totalMailFeedsByOwner;
    mapping(uint256 => address) private mailFeedAddresses;
    mapping(uint256 => string) private mailFeedNames;
    mapping(uint256 => string) private mailFeedDescriptions;
    mapping(address => uint256) private mailFeedIds;
    mapping(address => uint256) private mailFeedAddressesToIndexes;
    mapping(address => mapping(address => uint256)) private mailFeedOwnerAddressesToIndexes;
    uint256 private totalMailFeeds;
    uint256 private totalDeletedMailFeeds;
    address private owner;

    struct MailFeed{
        string name;
        string description;
        address owner;
        uint256 expiryTime;
    }
    mapping(address => MailFeed) private mailFeeds;

    constructor(){
        owner = msg.sender;
    }

    function createMailFeed(address owner_, address feedAddress, string[2] calldata args) external {
        require(msg.sender == owner, "Inv. caller");

        MailFeed storage mailFeed = mailFeeds[feedAddress];
        mailFeed.name = args[0];
        mailFeed.description = args[1];
        mailFeed.owner = owner_;
        mailFeed.expiryTime = block.timestamp + MAIL_FEED_EXPIRY_TIME;

        uint256 total = totalMailFeedsByOwner[owner_];
        mailFeedOwners[owner_][total] = feedAddress;
        totalMailFeedsByOwner[owner_] = total + 1;
        mailFeedOwnerAddressesToIndexes[owner_][feedAddress] = total;

        total = totalMailFeeds;
        mailFeedIds[feedAddress] = total;
        mailFeedAddresses[total] = feedAddress;
        mailFeedNames[total] = args[0];
        mailFeedDescriptions[total] = args[1];
        totalMailFeeds = total + 1;
        mailFeedAddressesToIndexes[feedAddress] = total;
    }

    function renewMailFeeds(address owner_, address[] calldata feedAddresses) external {
        require(msg.sender == owner, "Inv. caller");
        uint256 length = feedAddresses.length;

        for(uint i;i<length;){
            address feedAddress = feedAddresses[i];
            MailFeed storage mailFeed = mailFeeds[feedAddress];
            require(owner_ == mailFeed.owner, "Inv. owner");
            require(block.timestamp >= mailFeed.expiryTime, "Not expired");

            mailFeed.expiryTime = block.timestamp + MAIL_FEED_EXPIRY_TIME;

            Feed(feedAddress).renewFeed();

            unchecked{i++;}
        }
    }

    function deleteMailFeeds(address[] calldata feedAddresses) external {
        uint256 length = feedAddresses.length;
        for(uint i;i<length;){
            address feedAddress = feedAddresses[i];
            MailFeed storage mailFeed = mailFeeds[feedAddress];
            require(msg.sender == mailFeed.owner, "Inv. caller");
            require(block.timestamp >= mailFeed.expiryTime, "Inv. deletion");

            uint id = mailFeedIds[feedAddress];
            mailFeedNames[id] = "";
            mailFeedDescriptions[id] = "";

            mailFeedIds[feedAddress] = 0;
            mailFeed.name = "";
            mailFeed.description = "";
            mailFeed.owner = address(0);
            mailFeed.expiryTime = 0;

            totalDeletedMailFeeds = totalDeletedMailFeeds + 1;
            totalMailFeedsByOwner[msg.sender] = totalMailFeedsByOwner[msg.sender] - 1;

            mapping(uint256 => address) storage mailFeeds_ = mailFeedOwners[msg.sender];
            uint256 index = mailFeedOwnerAddressesToIndexes[msg.sender][feedAddress];
            mailFeeds_[index] = address(0);

            index = mailFeedAddressesToIndexes[feedAddress];
            mailFeedAddresses[index] = address(0);

            unchecked{i++;}
        }
    }

    function setArgs(address feedAddress, string[2] calldata args) external {
        MailFeed storage mailFeed = mailFeeds[feedAddress];
        require(msg.sender == mailFeed.owner, "Inv. caller");

        mailFeed.name = args[0];
        mailFeed.description = args[1];
        uint256 id = mailFeedIds[feedAddress];
        mailFeedNames[id] = args[0];
        mailFeedDescriptions[id] = args[1];
    }

    function getFeeds(address owner_, uint256 fromId, uint256 length, uint256 total, bool notExpired, uint8 minRating) external view returns (address[] memory) {
        address[] memory addresses = new address[](length);
        uint256 id;

        for(uint i=fromId;i<total;){
            address addr_ = mailFeedAddresses[i];

            uint8 rating;
            uint256 expiryTime = block.timestamp;
            if(addr_ != address(0)){
                (,rating,) = Feed(addr_).getRating(owner_);
                (,expiryTime,,,,) = Feed(addr_).getInfo();
            }

            if(addr_ != address(0) && (owner_ == address(0) || owner_ == mailFeeds[addr_].owner) &&
            (rating == 0 || rating >= minRating) && (!notExpired || block.timestamp <= expiryTime)){
                addresses[id] = addr_;
                id++;

                if(id == length){
                    break;
                }
            }
            unchecked{i++;}
        }

        return addresses;
    }

    function searchFeed(string calldata search, uint256 length) external view returns (address) {
        address address_;
        for(uint i;i<length;){
            if(_contains(mailFeedNames[i], search) || _contains(mailFeedDescriptions[i], search)){
                address_ = mailFeedAddresses[i];
                break;
            }

            unchecked{i++;}
        }
        return address_;
    }

    function getInfo(address feedAddress, address owner_, uint256 id) external view returns (MailFeed memory, uint256, address, uint24){
        return (mailFeeds[feedAddress], totalMailFeedsByOwner[owner_], mailFeedOwners[owner_][id], MAIL_FEED_EXPIRY_TIME);
    }

    function getTotals(address owner_, uint8 minRating, uint256 length) external view returns(uint256, uint256, uint256){
        uint256 totalMinRatingNotExpired;
        for(uint i;i<length;){
            address addr_ = mailFeedAddresses[i];
            if(addr_ != address(0)){
                Feed feed = Feed(addr_);
                (,uint8 rating,) = feed.getRating(owner_);
                (,uint256 expiryTime,,,,) = feed.getInfo();
                if(block.timestamp <= expiryTime && rating == 0 || rating >= minRating){
                    totalMinRatingNotExpired++;
                }
            }
            unchecked{i++;}
        }

        return (totalMailFeeds, totalDeletedMailFeeds, totalMinRatingNotExpired);
    }

    function _contains(string storage where, string calldata what) private pure returns (bool){
        bytes memory whereBytes = bytes(where);
        bytes memory whatBytes = bytes(what);
        uint256 whereLength = whereBytes.length;
        uint256 whatLength = whatBytes.length;
        bool found;

        if(whereLength >= whatLength){
            uint256 length = whereLength - whatLength;
            for (uint i;i<=length;) {
                bool flag = true;

                for (uint j;j<whatLength;){
                    if (whereBytes[i + j] != whatBytes[j]) {
                        flag = false;
                        break;
                    }
                    unchecked{j++;}
                }

                if (flag) {
                    found = true;
                    break;
                }

                unchecked{i++;}
            }
        }

        return found;
    }
}
