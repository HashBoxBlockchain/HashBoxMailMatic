// SPDX-License-Identifier: MIT

pragma solidity ^0.8.17;

import "../common/ReentrancyGuard.sol";
import "../common/Ownable.sol";
import "../extensions/FeedExtension.sol";
import "../custom/MailERC721.sol";
import "../libraries/CheckFeedExtension.sol";

contract Feed is ReentrancyGuard, Ownable {
	address immutable private MAIL_ADDRESS;
	address immutable private MAIL_FEEDS_ADDRESS;
	uint256 immutable private MAX_NUMBER_SUBSCRIBERS;
	uint256 private price;
	uint256 private timeInSecs;
	uint256 private totalSubscribers;
	uint256 private expiryTime;
	uint256 private countSubscribers;
	uint8 private rating;
	uint256 private totalRatings;
	address private extensionAddress;
	mapping(address => uint256) private addressToSubscriberId;
	mapping(address => uint8) private ratings;
	FeedExtension private extension;
	MailERC721 private mailERC721;

	struct Subscriber{
		address address_;
		uint256 subscribeTime;
		uint256 expiryTime;
		bool isBlocked;
	}
	mapping(uint256 => Subscriber) private subscribers;

	constructor(address mailAddress, address owner_, uint256 timeInSecs_, address extensionAddress_, uint256 price_, uint256 maxNumberSubscribers) {
		MAIL_ADDRESS = mailAddress;
		mailERC721 = MailERC721(MAIL_ADDRESS);
		MAIL_FEEDS_ADDRESS = mailERC721.getMailFeedsAddress();
		transferOwnership(owner_);
		timeInSecs = timeInSecs_;

		if(extensionAddress_ != address(0)){
			CheckFeedExtension.check(extensionAddress_);
			extension = FeedExtension(extensionAddress_);
			extension.setInfo(address(this), price_);
		}

		price = price_;
		expiryTime = block.timestamp + timeInSecs_;
		MAX_NUMBER_SUBSCRIBERS = maxNumberSubscribers;
		extensionAddress = extensionAddress_;
	}

	function subscribe() external payable {
		_subscribe(msg.sender);
	}

	function unsubscribe() external nonReentrant {
		_unsubscribe(msg.sender);
	}

	function removeSubscriber(address subscriber) external nonReentrant onlyOwner {
		_unsubscribe(subscriber);
	}

	function withdrawEther(uint256 amount) external onlyOwner {
		//the owner can withdraw only when the feed period ends - if he renews/updates the feed, he needs to wait it ends
		require(block.timestamp >= expiryTime, "Inv. withdraw");

		(bool sentEther,) = msg.sender.call{value: amount}("");
		require(sentEther, "Failed");
	}

	function withdrawToken(bytes calldata args) external onlyOwner {
		require(block.timestamp >= expiryTime, "Inv. withdraw");
		extension.withdraw(args);
	}

	function setInfo(address extensionAddress_, uint256 timeInSecs_, uint256 price_) external onlyOwner {
		require(block.timestamp >= expiryTime, "Can't set");

		if(extensionAddress_ != address(0)){
			CheckFeedExtension.check(extensionAddress_);
			extension = FeedExtension(extensionAddress_);
			extension.setInfo(address(this), price_);
		}

		timeInSecs = timeInSecs_;
		price = price_;
		extensionAddress = extensionAddress_;
	}

	function blockAddress(address address_, bool status) external onlyOwner {
		Subscriber storage subscriber = subscribers[addressToSubscriberId[address_]];
		subscriber.isBlocked = status;
	}

	function setRating(uint8 rating_) external {
		require(subscribers[addressToSubscriberId[msg.sender]].expiryTime >= block.timestamp, "Can't set");
		require(rating_ > 0 && rating_ < 11, "Inv. rating");
		require(ratings[msg.sender] == 0, "Inv. caller");

		totalRatings = totalRatings + 1;
		rating = uint8((rating + rating_) / totalRatings);
		ratings[msg.sender] = rating_;
	}

	function renewFeed() external {
		require(msg.sender == MAIL_FEEDS_ADDRESS, "Inv. caller");
		expiryTime = block.timestamp + timeInSecs;
	}

	function getRating(address user) external view returns (uint8, uint8, uint256){
		return (ratings[user], rating, totalRatings);
	}

	function getInfo() external view returns (uint256, uint256, uint256, uint256, uint256, uint256){
		return (timeInSecs, expiryTime, price, totalSubscribers, MAX_NUMBER_SUBSCRIBERS, countSubscribers);
	}

	function getExtensionInfo() external view returns (address){
		return extensionAddress;
	}

	function getSubscribers(uint256 length) external view returns (address[] memory){
		address[] memory subscribers_ = new address[](length);
		uint256 id;

		for(uint i=1;i<=length;){
			Subscriber storage subscriber = subscribers[i];
			if(subscriber.address_ != address(0) && subscriber.expiryTime >= block.timestamp){
				subscribers_[id] = subscriber.address_;
				id++;
			}
			unchecked{i++;}
		}

		return subscribers_;
	}

	function getSubscriber(address subscriberAddress, uint256 id) external view returns (uint256, Subscriber memory){
		return (addressToSubscriberId[subscriberAddress], subscribers[id]);
	}

	function _subscribe(address subscriberAddress) private {
		require(expiryTime > block.timestamp, "Inv. subs.");

		if(address(extension) != address(0)){
			extension.subscribe{value: msg.value}(subscriberAddress);
		}
		else{
			require(msg.value >= price, "Inv. value");
		}

		uint256 subscriberId = addressToSubscriberId[subscriberAddress];
		Subscriber storage subscriber = subscribers[subscriberId];
		require(!subscriber.isBlocked, "Blocked user");

		if(subscriberId == 0){
			totalSubscribers = totalSubscribers + 1;
			subscriber = subscribers[totalSubscribers];
			subscriber.address_ = subscriberAddress;
			subscribers[totalSubscribers] = subscriber;
			addressToSubscriberId[subscriberAddress] = totalSubscribers;
			mailERC721.addSubscription(subscriberAddress);
		}
		subscriber.subscribeTime = block.timestamp;
		subscriber.expiryTime = block.timestamp + timeInSecs;

		if(MAX_NUMBER_SUBSCRIBERS != 0){
			require(countSubscribers < MAX_NUMBER_SUBSCRIBERS, "Max. subs.");
			countSubscribers = countSubscribers + 1;
		}
	}

	function _unsubscribe(address subscriberAddress) private {
		uint256 subscriberId = addressToSubscriberId[subscriberAddress];
		Subscriber storage subscriber = subscribers[subscriberId];
		require(subscriberId != 0, "Inv. user");

		uint256 value = price;
		if(msg.sender == subscriberAddress){
			require(subscriber.expiryTime > block.timestamp, "Inv. unsubs.");
			uint256 difference = subscriber.expiryTime - block.timestamp;
			value = (difference * price) / timeInSecs;
		}

		if(address(extension) != address(0)){
			extension.unsubscribe(subscriberAddress, value);
		}
		else{
			(bool sentEther,) = subscriberAddress.call{value: value}("");
			require(sentEther, "Failed");
		}

		subscriber.address_ = address(0);
		subscriber.subscribeTime = 0;
		subscriber.expiryTime = 0;
		subscribers[subscriberId] = subscriber;
		addressToSubscriberId[subscriberAddress] = 0;
		mailERC721.removeSubscription(subscriberAddress);

		if(MAX_NUMBER_SUBSCRIBERS != 0){
			countSubscribers = countSubscribers - 1;
		}
	}
}