// SPDX-License-Identifier: MIT

pragma solidity ^0.8.17;

import "../common/ERC721.sol";
import "../common/ReentrancyGuard.sol";
import "../common/ERC20.sol";
import "./Feed.sol";
import "../extensions/MailExtension.sol";
import "./MailFeeds.sol";
import "./Contacts.sol";
import "../libraries/CheckMailExtension.sol";

contract MailERC721 is ERC721, ReentrancyGuard {
	address immutable private LAUNCHPAD_ADDRESS;
	uint64 constant private MIN_TOTAL_CREDITS = 1 ether;
	uint80 constant private MAIL_FEED_PRICE = 10_000 ether;
	uint64 constant private CONTACTS_PRICE = 10 ether;
	uint8 constant private ALLOWED = 1;
	uint8 constant private BLOCKED = 2;
	uint8 constant private LIST_SENT = 1;
	uint8 constant private LIST_ALL_MAIL = 2;
	uint8 constant private LIST_TRASH = 3;
	uint8 constant private LIST_BLOCKED_USERS = 4;
	uint8 constant private LIST_FEEDS = 5;
	uint8 constant private LIST_SUBSCRIPTIONS = 6;
	uint256 private mailBoxId;
	uint256 private mailId;
	mapping(uint256 => address) private mailBoxIdToAddress;
	mapping(address => mapping(address => uint8)) private addressStatus;
	mapping(address => mapping(address => bool)) private freeMails;
	mapping(uint256 => uint256) private mailReceivedIdsToIndexes;
	mapping(uint256 => uint256) private mailAllMailIdsToIndexes;
	mapping(address => uint256) private blockedAddressesToIndexes;
	mapping(address => uint256) private subscriptionsAddressesToIndexes;
	ERC20 private credits;
	MailFeeds private mailFeeds;

	struct MailBox{
		uint256 id;
		string uri;
		uint256 fee;
		bool isPaid;
		address extensionAddress;
		uint256 totalEmailsReceived;
		uint256 totalEmailsSent;
		uint256 totalEmails;
		uint256 totalBurned;
		uint256 totalBlockedUsers;
		uint256 totalRemovedBlock;
		uint256 totalSubscriptions;
		uint256 totalUnsubscriptions;
		mapping(uint256 => Mail) mailReceived;
		mapping(uint256 => Mail) mailSent;
		mapping(uint256 => Mail) mailBurned;
		mapping(uint256 => Mail) allMail;
		mapping(address => mapping(uint256 => address)) subscription;
		mapping(bytes32 => uint256) sentTo;
		mapping(address => uint256) totalSentTo;
		mapping(uint256 => address) blockedUsers;
	}
	mapping(address => MailBox) private mailbox;

	struct Mail{
		uint256 id;
		string uri;
		uint256 transferBlock;
	}

	event Fee(address contract_, address indexed from, address indexed to, uint256 value);

	constructor(address creditsAddress, address launchpadAddress) ERC721("HashBox Mail", "MAIL"){
		credits = ERC20(creditsAddress);
		LAUNCHPAD_ADDRESS = launchpadAddress;
		mailFeeds = new MailFeeds();
	}

	function _mintMailBox(string calldata uri) private {
		MailBox storage mailbox_ = mailbox[msg.sender];
		require(bytes(uri).length > 0,"Inv. uri");
		require(mailbox_.id == 0,"Can't create");

		mailBoxId = mailBoxId + 1;
		mailBoxIdToAddress[mailBoxId] = msg.sender;
		mailbox_.id = mailBoxId;
		mailbox_.uri = uri;
	}

	function _mintMail(string calldata uri) private {
		MailBox storage mailbox_ = mailbox[msg.sender];
		require(bytes(uri).length > 0,"Inv. uri");
		require(mailbox_.id > 0,"No mailbox");

		mailId = mailId + 1;

		uint256 totalEmailsSent = mailbox_.totalEmailsSent + 1;
		Mail storage mail_ = mailbox_.mailSent[totalEmailsSent];
		mail_.id = mailId;
		mail_.uri = uri;
		mailbox_.totalEmailsSent = totalEmailsSent;

		_safeMint(msg.sender, mailId);
	}

	function tokenURI(uint256 _mailBoxId) public view override returns (string memory) {
		return mailbox[mailBoxIdToAddress[_mailBoxId]].uri;
	}

	function sendMail(address to, string calldata mailUri, uint256 customFee) external payable nonReentrant {
		_mintMail(mailUri);

		_antiSPAM(to, customFee, false);

		_updateTotalsAndSend(to, mailUri);

		_spendCredits(MIN_TOTAL_CREDITS);
	}

	function sendMail(address to, string calldata mailBoxUri, string calldata mailUri, uint256 customFee) external payable nonReentrant {
		_mintMailBox(mailBoxUri);

		_mintMail(mailUri);

		_antiSPAM(to, customFee, false);

		_updateTotalsAndSend(to, mailUri);
	}

	function sendMails(address[] calldata to, string[] calldata mailUri, uint256[] calldata customFees) external payable nonReentrant {
		uint256 length = to.length;
		for(uint i;i<length;){
			_mintMail(mailUri[i]);

			_antiSPAM(to[i], customFees[i], true);

			_updateTotalsAndSend(to[i], mailUri[i]);

			_spendCredits(MIN_TOTAL_CREDITS);

			unchecked{i++;}
		}
	}

	function sendFeed(address feedAddress, address[] calldata to, string[] calldata mailUri) external {
		(MailFeeds.MailFeed memory mailFeed,,,) = mailFeeds.getInfo(feedAddress, address(0), 0);
		require(mailFeed.owner == msg.sender, "Inv. caller");
		require(mailFeed.expiryTime >= block.timestamp, "Expired feed");

		Feed feed = Feed(feedAddress);
		uint256 length = to.length;

		for(uint i;i<length;){
			address user = to[i];

			(uint256 subscriberId,) = feed.getSubscriber(user, 0);
			(,Feed.Subscriber memory subscriber) = feed.getSubscriber(address(0), subscriberId);
			require(subscriber.expiryTime >= block.timestamp, "Expired subs.");
			require(!subscriber.isBlocked, "Blocked user");

			string calldata uri = mailUri[i];

			_mintMail(uri);

			_updateTotalsAndSend(user, uri);

			unchecked{i++;}
		}
	}

	function _antiSPAM(address to, uint256 customFee, bool isBatch) private {
		require(addressStatus[msg.sender][to] < BLOCKED,"Address blocked");

		MailBox storage mailboxTo = mailbox[to];
		address extensionAddress = mailboxTo.extensionAddress;
		uint256 fee = mailboxTo.fee;
		uint256 value = isBatch ? fee : msg.value;

		if((mailboxTo.isPaid && !freeMails[msg.sender][to]) ||
			(mailbox[msg.sender].totalSentTo[to] == 0 && mailboxTo.totalSentTo[msg.sender] == 0)){

			if(mailboxTo.extensionAddress != address(0)){
				require(customFee >= fee,"Fee below");
				MailExtension extension = MailExtension(extensionAddress);
				extension.antiSPAM{value: msg.value}(msg.sender, to, customFee);
			}
			else{
				require(msg.value >= fee,"Fee below");
				(bool sentEther,) = to.call{value: value}("");
				require(sentEther, "Failed");
			}
			addressStatus[msg.sender][to] = ALLOWED;
		}

		if(mailboxTo.extensionAddress != address(0)){
			emit Fee(extensionAddress, msg.sender, to, customFee);
		}
		else{
			emit Fee(address(0), msg.sender, to, value);
		}
	}

	function _updateTotalsAndSend(address to, string calldata uri) private {
		MailBox storage mailboxSender = mailbox[msg.sender];
		uint256 totalEmailsSent = mailboxSender.totalEmailsSent;
		Mail storage mailSent_ = mailboxSender.mailSent[totalEmailsSent];
		mailSent_.transferBlock = block.number;

		uint256 totalEmails = mailboxSender.totalEmails + 1;
		Mail storage allMail_ = mailboxSender.allMail[totalEmails];
		allMail_.id = mailId;
		allMail_.uri = uri;
		allMail_.transferBlock = block.number;
		mailboxSender.totalEmails = totalEmails;

		uint256 totalSentTo = mailboxSender.totalSentTo[to] + 1;
		mailboxSender.totalSentTo[to] = totalSentTo;

		bytes32 toIdHash = keccak256(abi.encode(to, totalSentTo));
		mailboxSender.sentTo[toIdHash] = totalEmailsSent;

		uint256 id = mailboxSender.mailSent[totalEmailsSent].id;
		_safeTransfer(msg.sender, to, id, "");

		MailBox storage mailboxReceiver = mailbox[to];
		uint256 totalEmailsReceived = mailboxReceiver.totalEmailsReceived + 1;
		mailboxReceiver.mailReceived[totalEmailsReceived].id = mailId;
		mailboxReceiver.mailReceived[totalEmailsReceived].uri = uri;
		mailboxReceiver.mailReceived[totalEmailsReceived].transferBlock = block.number;
		mailboxReceiver.totalEmailsReceived = totalEmailsReceived;
		mailReceivedIdsToIndexes[mailId] = totalEmailsReceived;

		totalEmails = mailboxReceiver.totalEmails + 1;
		mailboxReceiver.allMail[totalEmails].id = mailId;
		mailboxReceiver.allMail[totalEmails].uri = uri;
		mailboxReceiver.allMail[totalEmails].transferBlock = block.number;
		mailboxReceiver.totalEmails = totalEmails;
		mailAllMailIdsToIndexes[mailId] = totalEmails;
	}

	function _spendCredits(uint256 amount) private {
		require(credits.allowance(msg.sender, address(this)) >= amount, "No funds");
		credits.transferFrom(msg.sender, LAUNCHPAD_ADDRESS, amount);
	}

	function safeTransferFrom(address, address, uint256, bytes memory) public pure override(ERC721) {
		require(false,"Forbid");
	}

	function safeTransferFrom(address, address, uint256) public pure override(ERC721) {
		require(false,"Forbid");
	}

	function transferFrom(address, address, uint256) public pure override(ERC721) {
		require(false,"Forbid");
	}

	function burnMailBox() external {
		MailBox storage mailboxSender = mailbox[msg.sender];
		require(mailboxSender.id > 0,"No mailbox");

		uint256 totalEmailsReceived = mailboxSender.totalEmailsReceived + 1;
		for(uint i=1;i<totalEmailsReceived;){
			burnMail(mailboxSender.mailReceived[i].id);
			unchecked{i++;}
		}

		mailboxSender.id = 0;
		mailboxSender.uri = "";
		mailboxSender.fee = 0;
		mailboxSender.isPaid = false;
		mailboxSender.extensionAddress = address(0);
		mailboxSender.totalEmailsReceived = 0;
		mailboxSender.totalEmailsSent = 0;
		mailboxSender.totalEmails = 0;
		mailboxSender.totalBurned = 0;
		mailboxSender.totalBlockedUsers = 0;
		mailboxSender.totalRemovedBlock = 0;
	}

	function burnMails(uint256[] calldata ids) external {
		require(mailbox[msg.sender].id > 0,"No mailbox");

		uint256 length = ids.length;
		for(uint i=0;i<length;){
			burnMail(ids[i]);
			unchecked{i++;}
		}
	}

	function burnMail(uint256 mailId_) public {
		if(_exists(mailId_) && ownerOf(mailId_) == msg.sender){
			MailBox storage mailbox_ = mailbox[msg.sender];
			uint256 totalBurned = mailbox_.totalBurned;
			string memory uri_;

			uint256 index = mailReceivedIdsToIndexes[mailId_];
			Mail storage mail = mailbox_.mailReceived[index];
			uri_ = mail.uri;
			mail.id = 0;
			mail.uri = "";
			mail.transferBlock = block.number;

			index = mailAllMailIdsToIndexes[mailId_];
			mail = mailbox_.allMail[index];
			mail.id = 0;
			mail.uri = "";
			mail.transferBlock = block.number;

			_burn(mailId_);

			uint256 idBurned = totalBurned + 1;
			mailbox_.mailBurned[idBurned].id = mailId_;
			mailbox_.mailBurned[idBurned].uri = uri_;
			mailbox_.mailBurned[idBurned].transferBlock = block.number;
			mailbox_.totalBurned = idBurned;
		}
	}

	function getMailBoxInfo(address userAddress) external view returns (uint256, string memory, uint256, bool, uint256, uint256, uint256) {
		return (mailbox[userAddress].id, mailbox[userAddress].uri, mailbox[userAddress].fee, mailbox[userAddress].isPaid,
		mailBoxId, mailbox[userAddress].totalBlockedUsers, mailbox[userAddress].totalRemovedBlock);
	}

	function getMailInfo(address userAddress, uint256 id, uint8 type_) external view returns (uint256, uint256, string memory, uint256, uint256, uint256, uint256, uint256, uint256) {
		MailBox storage mailBox = mailbox[userAddress];
		Mail storage mail = mailBox.mailReceived[id];

		if(type_ == LIST_SENT){
			mail = mailBox.mailSent[id];
		}
		else if(type_ == LIST_ALL_MAIL){
			mail = mailBox.allMail[id];
		}
		else if(type_ == LIST_TRASH){
			mail = mailBox.mailBurned[id];
		}

		return (mailBox.totalEmails, mail.id, mail.uri, mail.transferBlock, mailId,
		mailBox.totalEmailsReceived, mailBox.totalBurned, mailBox.totalSubscriptions,
		mailBox.totalUnsubscriptions);
	}

	function getMails(address userAddress, uint256 fromId, uint256 length, uint8 type_) external view returns (uint256[] memory, string[] memory, uint256[] memory) {
		uint256[] memory ids = new uint256[](length);
		string[] memory uris = new string[](length);
		uint256[] memory blocks = new uint256[](length);
		MailBox storage mailbox_ = mailbox[userAddress];
		uint256 id;

		for(uint i=fromId;i>=1;){
			Mail storage mail = mailbox_.mailReceived[i];
			if(type_ == LIST_SENT){
				mail = mailbox_.mailSent[i];
			}
			else if(type_ == LIST_ALL_MAIL){
				mail = mailbox_.allMail[i];
			}
			else if(type_ == LIST_TRASH){
				mail = mailbox_.mailBurned[i];
			}

			if(mail.id > 0){
				ids[id] = i;
				uris[id] = mail.uri;
				blocks[id] = mail.transferBlock;
				id++;

				if(id == length){
					break;
				}
			}
			unchecked{i--;}
		}

		return (ids, uris, blocks);
	}

	function getAddresses(address userAddress, uint256 fromId, uint256 length, uint8 type_) external view returns (address[] memory) {
		address[] memory addresses = new address[](length);
		MailBox storage mailBox = mailbox[userAddress];
		uint256 id;

		uint256 total = mailBox.totalBlockedUsers;
		if(type_ == LIST_SUBSCRIPTIONS){
			total = mailBox.totalSubscriptions;
		}

		for(uint i=fromId;i<total;){
			address addr_ = mailBox.blockedUsers[i];
			if(type_ == LIST_SUBSCRIPTIONS){
				addr_ = mailBox.subscription[userAddress][i];
			}

			if(addr_ != address(0)){
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

	function getFromToInfo(address from, address to, uint256 fromId, uint256 length) external view returns (uint256, uint256[] memory, bool, bool) {
		uint256 totalSentTo = mailbox[from].totalSentTo[to];
		uint256[] memory ids = new uint256[](length);
		uint256 id;

		for(uint i=fromId;i>=1;){
			uint256 _mailId = mailbox[from].sentTo[keccak256(abi.encode(to, i))];

			if(_mailId > 0){
				ids[id] = _mailId;
				id++;

				if(id == length){
					break;
				}
			}
			unchecked{i--;}
		}

		uint8 status = addressStatus[from][to];
		bool isFreeMail = freeMails[from][to];
		return (totalSentTo, ids, isFreeMail, status == BLOCKED);
	}

	function blockUsers(address[] calldata users, bool[] calldata blocks) external {
		uint256 length = users.length;
		for(uint i;i<length;){
			address user = users[i];
			bool isBlock = blocks[i];
			uint8 status = addressStatus[user][msg.sender];

			if((isBlock && status != BLOCKED) || (!isBlock && status != ALLOWED)){
				addressStatus[user][msg.sender] = isBlock ? BLOCKED : ALLOWED;
				MailBox storage mailBox = mailbox[msg.sender];
				uint256 totalBlockedUsers = mailBox.totalBlockedUsers;

				if(isBlock){
					mailBox.blockedUsers[totalBlockedUsers] = user;
					mailBox.totalBlockedUsers = totalBlockedUsers + 1;
					blockedAddressesToIndexes[user] = totalBlockedUsers;
				}
				else{
					uint256 index = blockedAddressesToIndexes[user];
					mailBox.blockedUsers[index] = address(0);
					mailBox.totalRemovedBlock = mailBox.totalRemovedBlock + 1;
				}

				unchecked{i++;}
			}
		}
	}

	function createMailFeed(string[2] calldata args, uint256 timeInSecs, address extensionAddress, uint256 price, uint256 maxNumberSubscribers) external {
		Feed feed = new Feed(address(this), msg.sender, timeInSecs, extensionAddress, price, maxNumberSubscribers);
		address feedAddress = address(feed);

		mailFeeds.createMailFeed(msg.sender, feedAddress, args);
		_spendCredits(MAIL_FEED_PRICE);
	}

	function renewMailFeeds(address[] calldata feedAddresses) external {
		mailFeeds.renewMailFeeds(msg.sender, feedAddresses);
		_spendCredits(MAIL_FEED_PRICE);
	}

	function addSubscription(address subscriberAddress) external virtual {
		(MailFeeds.MailFeed memory mailFeed,,,) = mailFeeds.getInfo(msg.sender, address(0), 0);
		require(mailFeed.owner != address(0), "Inv. caller");

		MailBox storage mailbox_ = mailbox[subscriberAddress];
		uint256 total = mailbox_.totalSubscriptions;
		mailbox_.subscription[subscriberAddress][total] = msg.sender;
		mailbox_.totalSubscriptions = total + 1;
		subscriptionsAddressesToIndexes[msg.sender] = total;
	}

	function removeSubscription(address subscriberAddress) external virtual {
		(MailFeeds.MailFeed memory mailFeed,,,) = mailFeeds.getInfo(msg.sender, address(0), 0);
		require(mailFeed.owner != address(0), "Inv. caller");

		MailBox storage mailbox_ = mailbox[subscriberAddress];
		mapping(uint256 => address) storage subscriptions = mailbox_.subscription[subscriberAddress];

		uint256 index = subscriptionsAddressesToIndexes[msg.sender];
		subscriptions[index] = address(0);

		mailbox_.totalUnsubscriptions = mailbox_.totalUnsubscriptions + 1;
	}

	function getMailFeedsAddress() external view returns(address){
		return address(mailFeeds);
	}

	function setFee(address extensionAddress, uint256 fee, bool isAlwaysPaid, address from, bool free) external {
		CheckMailExtension.check(extensionAddress);
		mailbox[msg.sender].extensionAddress = extensionAddress;
		mailbox[msg.sender].fee = fee;
		mailbox[msg.sender].isPaid = isAlwaysPaid;
		freeMails[from][msg.sender] = free;
	}

	function getExtensionInfo(address user) external view returns (address){
		return (mailbox[user].extensionAddress);
	}

	function addContact(address contactsAddress, string[5] calldata args) external {
		Contacts(contactsAddress).addContact(msg.sender, args);
		_spendCredits(CONTACTS_PRICE);
	}

	function getPrices() external pure returns(uint80, uint64){
		return (MAIL_FEED_PRICE, CONTACTS_PRICE);
	}
}