const FeedTest = artifacts.require("FeedTest.sol");
const Feed = artifacts.require("Feed.sol");
const FeedExtension = artifacts.require("FeedExtension.sol");
const FeedExtensionTest = artifacts.require("FeedExtensionTest.sol");
const CreditsERC20 = artifacts.require("CreditsERC20");
const MailERC721 = artifacts.require("MailERC721");
const MailFeeds = artifacts.require("MailFeeds");
const {time} = require('@openzeppelin/test-helpers');
const BN = web3.utils.BN;
const OPTION_INBOX = 0;
const FEED_EXPIRY_TIME = 1296000;
const MAIL_FEED_EXPIRY_TIME = 2592000;
const LENGTH = 100;

contract("FeedExtension", accounts => {
    it("basic info", async () => {
        const feed = await FeedTest.deployed();
        const feedExtension = await FeedExtension.deployed();
        const token = await CreditsERC20.deployed();

        const tokenAddress = await feedExtension.getTokenAddress();
        const tokenSymbol = await feedExtension.getTokenSymbol();
        const tokenDecimals = await feedExtension.getTokenDecimals();
        const symbol = await token.symbol();
        const decimals = await token.decimals();
        const info = await feed.getInfo();
        const price = info[2];
        const feedAddress = await feedExtension.getFeedAddress();
        const feedPrice = await feedExtension.getPrice();

        assert.equal(tokenAddress, token.address, "tokenAddress is correct");
        assert.equal(tokenSymbol, symbol, "tokenSymbol is correct");
        assert.equal(tokenDecimals, decimals.toString(), "tokenDecimals is correct");
        assert.equal(price, web3.utils.toWei("2", "ether"), "price is correct");
        assert.equal(feedPrice, web3.utils.toWei("2", "ether"), "feedPrice is correct");
        assert.equal(feedAddress, feed.address, "feedAddress is correct");
    });

    it("cannot setInfo 1", async () => {
        return FeedTest.deployed().then(async contract => {
            return await contract.setInfo("0x0000000000000000000000000000000000000000", 0, 0, {from: accounts[1]});
        }).then(() => {
            assert.ok(false);
        }, e => {
            assert.ok(true);
            console.log(e.reason);
        });
    });

    it("cannot setInfo 2", async () => {
        return FeedTest.deployed().then(async contract => {
            const feedExtension = await FeedExtension.deployed();
            return await contract.setInfo(feedExtension.address, 0, 0, {from: accounts[0]});
        }).then(() => {
            assert.ok(false);
        }, e => {
            assert.ok(true);
            console.log(e.reason);
        });
    });

    it("cannot withdrawToken", async () => {
        return FeedTest.deployed().then(async contract => {
            let args = accounts[0];
            const amountInHex = web3.utils.padLeft(web3.utils.toHex(web3.utils.toWei("2", "wei")), 64);
            args = args + amountInHex.replace("0x","");

            return await contract.withdrawToken(args, {from: accounts[0]});
        }).then(() => {
            assert.ok(false);
        }, e => {
            assert.ok(true);
            console.log(e.reason);
        });
    });

    it("cannot subscribe 1", async () => {
        return FeedTest.deployed().then(async contract => {
            return await contract.subscribe({from: accounts[1]});
        }).then(() => {
            assert.ok(false);
        }, e => {
            assert.ok(true);
            console.log(e.reason);
        });
    });

    it("cannot subscribe 2", async () => {
        return FeedExtension.deployed().then(async contract => {
            return await contract.subscribe(accounts[1], {from: accounts[1]});
        }).then(() => {
            assert.ok(false);
        }, e => {
            assert.ok(true);
            console.log(e.reason);
        });
    });

    it("cannot unsubscribe 1", async () => {
        return FeedExtension.deployed().then(async contract => {
            return await contract.unsubscribe(accounts[1], web3.utils.toWei("2", "ether"), {from: accounts[1]});
        }).then(() => {
            assert.ok(false);
        }, e => {
            assert.ok(true);
            console.log(e.reason);
        });
    });

    it("subscribe 1", async () => {
        const feed = await FeedTest.deployed();
        const token = await CreditsERC20.deployed();

        const feedExtensionAddress = await feed.getExtensionInfo();

        await token.transfer(accounts[1], web3.utils.toWei("2", "ether"), {from: accounts[0]});
        await token.approve(feedExtensionAddress, web3.utils.toWei("2", "ether"), {from: accounts[1]});

        const before1 = await token.balanceOf(accounts[1]);
        const before2 = await token.balanceOf(feedExtensionAddress);

        const receipt = await feed.subscribe({from: accounts[1]});
        const tx = await web3.eth.getTransaction(receipt.tx);
        const timestamp = (await web3.eth.getBlock(tx.blockNumber)).timestamp;

        const sub = await feed.getSubscriber(accounts[1], 1);
        const subscriberId = sub[0];
        const subscriber = sub[1];
        const info = await feed.getInfo();
        const timeInSecs = info[0];
        const totalSubscribers = info[3];
        const subscribers = await feed.getSubscribers(totalSubscribers);

        assert.equal(subscribers.length, 1, "subscribers.length is correct");
        assert.equal(subscribers[0], accounts[1], "subscribers[0] is correct");
        assert.equal(subscriber[0], accounts[1], "subscriber[0] is correct");
        assert.equal(subscriber[1], timestamp.toString(), "subscriber[1] is correct");
        assert.equal(subscriber[2], (new BN(timestamp.toString())).add(new BN(timeInSecs.toString())), "subscriber[2] is correct");
        assert.equal(subscriberId, 1, "subscriberId is correct");
        assert.equal(totalSubscribers, 1, "totalSubscribers is correct");

        const after1 = await token.balanceOf(accounts[1]);
        const after2 = await token.balanceOf(feedExtensionAddress);

        assert.equal(after1, before1.sub(new BN(web3.utils.toWei("2", "ether"))).toString(), "after1 is correct");
        assert.equal(after2, before2.add(new BN(web3.utils.toWei("2", "ether"))).toString(), "after2 is correct");
    });

    it("unsubscribe", async () => {
        const feed = await FeedTest.deployed();
        const token = await CreditsERC20.deployed();

        const feedExtensionAddress = await feed.getExtensionInfo();

        const before1 = await token.balanceOf(accounts[1]);
        const before2 = await token.balanceOf(feedExtensionAddress);
        const beforeSubscriber = await feed.getSubscriber("0x0000000000000000000000000000000000000000", 1);
        const expiredTime = beforeSubscriber[1][2];
        let info = await feed.getInfo();
        const timeInSecs = info[0];
        const price = info[2];

        const receipt = await feed.unsubscribe({from: accounts[1]});
        const tx = await web3.eth.getTransaction(receipt.tx);
        const timestamp = (await web3.eth.getBlock(tx.blockNumber)).timestamp;
        const difference = (new BN(expiredTime.toString())).sub(new BN(timestamp.toString()));
        const amount = (((new BN(difference.toString())).mul(new BN(price.toString()))).div(new BN(timeInSecs.toString())));

        const sub = await feed.getSubscriber(accounts[1], 3);
        const subscriberId = sub[0];
        const subscriber = sub[1];
        info = await feed.getInfo();
        const totalSubscribers = info[3];
        const subscribers = await feed.getSubscribers(totalSubscribers);

        assert.equal(subscribers.length, 1, "subscribers.length is correct");
        assert.equal(subscribers[0], "0x0000000000000000000000000000000000000000", "subscribers[0] is correct");
        assert.equal(subscriber[0], "0x0000000000000000000000000000000000000000", "subscriber[0] is correct");
        assert.equal(subscriber[1], 0, "subscriber[1] is correct");
        assert.equal(subscriber[2], 0, "subscriber[2] is correct");
        assert.equal(subscriberId, 0, "subscriberId is correct");
        assert.equal(totalSubscribers, 1, "totalSubscribers is correct");

        const after1 = await token.balanceOf(accounts[1]);
        const after2 = await token.balanceOf(feedExtensionAddress);

        assert.equal(after1, (new BN(before1.toString())).add(new BN(amount.toString())).toString(), "after1 is correct");
        assert.equal(after2, (new BN(before2.toString())).sub(new BN(amount.toString())).toString(), "after2 is correct");
    });

    it("cannot withdrawToken 2", async () => {
        return FeedExtension.deployed().then(async contract => {
            let args = accounts[0];
            const amountInHex = web3.utils.padLeft(web3.utils.toHex(web3.utils.toWei("2", "wei")), 64);
            args = args + amountInHex.replace("0x","");

            return await contract.withdraw(args, {from: accounts[0]});
        }).then(() => {
            assert.ok(false);
        }, e => {
            assert.ok(true);
            console.log(e.reason);
        });
    });

    it("withdrawToken", async () => {
        const feed = await FeedTest.deployed();
        const token = await CreditsERC20.deployed();

        const feedExtensionAddress = await feed.getExtensionInfo();

        const before1 = await token.balanceOf(accounts[0]);
        const before2 = await token.balanceOf(feedExtensionAddress);

        let args = accounts[0];
        const amountInHex = web3.utils.padLeft(web3.utils.toHex(before2.toString()), 64);
        args = args + amountInHex.replace("0x","");
        const info = await feed.getInfo();
        const timeInSecs = info[0];
        await time.increase(timeInSecs);

        await feed.withdrawToken(args, {from: accounts[0]});

        const after1 = await token.balanceOf(accounts[0]);
        const after2 = await token.balanceOf(feedExtensionAddress);

        assert.equal(after1, (new BN(before1.toString())).add(new BN(before2.toString())).toString(), "after1 is correct");
        assert.equal(after2, 0, "after2 is correct");
    });

    it("setInfo", async () => {
        const feed = await FeedTest.deployed();

        let feedExtensionAddress = await feed.getExtensionInfo();

        await feed.setInfo(feedExtensionAddress, 100, web3.utils.toWei("3", "ether"), {from: accounts[0]});

        const feedExtensionContract = await FeedExtension.at(feedExtensionAddress);
        const feedAddress = await feedExtensionContract.getFeedAddress();
        const feedInfo = await feed.getInfo();
        const timeInSecs = feedInfo[0];
        const price = await feedExtensionContract.getPrice();

        feedExtensionAddress = await feed.getExtensionInfo();

        assert.equal(feedAddress, feed.address, "feedAddress is correct");
        assert.equal(timeInSecs, 100, "timeInSecs is correct");
        assert.equal(price, web3.utils.toWei("3", "ether").toString(), "price is correct");
        assert.notEqual(feedExtensionAddress, '0x0000000000000000000000000000000000000000', "feedExtensionAddress is correct");
    });

    it("cannot subscribe 3", async () => {
        return FeedTest.deployed().then(async contract => {
            const token = await CreditsERC20.deployed();

            const feedExtensionAddress = await contract.getExtensionInfo();
            await token.transfer(accounts[1], web3.utils.toWei("3", "ether"), {from: accounts[0]});
            await token.approve(feedExtensionAddress, web3.utils.toWei("3", "ether"), {from: accounts[1]});

            return await contract.subscribe({from: accounts[1]});
        }).then(() => {
            assert.ok(false);
        }, e => {
            assert.ok(true);
            console.log(e.reason);
        });
    });

    it("sendMail", async () => {
        const contract = await MailERC721.deployed();

        const beforeBalance = await web3.eth.getBalance(accounts[2]);

        const receipt = await contract.methods['sendMail(address,string,string,uint256)'](accounts[2],
            "mailbox.com", "mail.com", 0, {from: accounts[2], value: web3.utils.toWei("1.5", "ether")});
        let tx = await web3.eth.getTransaction(receipt.tx);
        let totalGas = (new BN(receipt.receipt.gasUsed)).mul(new BN(tx.gasPrice));

        const afterBalance = await web3.eth.getBalance(accounts[2]);

        const event = receipt.logs[2].args;
        assert.equal(event.from, accounts[2].toString(), 'from is correct');
        assert.equal(event.to, accounts[2].toString(), 'to is correct');
        assert.equal(afterBalance, (new BN(beforeBalance)).sub((new BN(totalGas))).toString(), 'balance is correct');

        const mailInfo = await contract.getMailInfo(accounts[2], 1, OPTION_INBOX);
        const uri = mailInfo[2];
        assert.equal(uri, "mail.com", "mail from is correct");
    });

    it("createMailFeed 1", async () => {
        const credits = await CreditsERC20.deployed();
        const mail = await MailERC721.deployed();
        const feedExtensionTest = await FeedExtensionTest.deployed();
        const mailFeedsAddress = await mail.getMailFeedsAddress();
        const mailFeeds = await MailFeeds.at(mailFeedsAddress);

        await credits.transfer(accounts[2], web3.utils.toWei("100000", "ether"), {from: accounts[0]});
        await credits.transfer(accounts[3], web3.utils.toWei("1", "ether"), {from: accounts[0]});
        await credits.transfer(accounts[4], web3.utils.toWei("1", "ether"), {from: accounts[0]});
        await credits.transfer(accounts[5], web3.utils.toWei("1", "ether"), {from: accounts[0]});
        await credits.approve(mail.address, web3.utils.toWei("10000", "ether"), {from: accounts[2]});

        const allowance = await credits.allowance(accounts[2], mail.address);
        assert.equal(allowance, web3.utils.toWei("10000", "ether"), "allowance is correct");

        const receipt = await mail.createMailFeed(["Feed1", "Description1"], FEED_EXPIRY_TIME, feedExtensionTest.address,
            web3.utils.toWei("1", "ether"), 0, {from: accounts[2]});
        const tx = await web3.eth.getTransaction(receipt.tx);
        const timestamp = (await web3.eth.getBlock(tx.blockNumber)).timestamp;

        const mailFeedTotals = await mailFeeds.getTotals(accounts[2], 0, LENGTH);
        const totalMailFeeds = mailFeedTotals[0];

        let mailFeedInfo = await mailFeeds.getInfo("0x0000000000000000000000000000000000000000", accounts[2], 0);
        const totalMailFeedsByOwner = mailFeedInfo[1];
        let mailFeedAddress = mailFeedInfo[2];
        mailFeedInfo = await mailFeeds.getInfo(mailFeedAddress, accounts[2], 0);
        const mailFeed = mailFeedInfo[0];

        assert.equal(totalMailFeedsByOwner, 1, "totalMailFeedsByOwner is correct");
        assert.notEqual(mailFeedAddress, "0x0000000000000000000000000000000000000000", "mailFeedAddress is correct");
        assert.equal(mailFeed[0], "Feed1", "mailFeed[0] is correct");
        assert.equal(mailFeed[1], "Description1", "mailFeed[1] is correct");
        assert.equal(mailFeed[2], accounts[2], "mailFeed[2] is correct");
        assert.equal(mailFeed[3], (new BN(timestamp.toString())).add(new BN(MAIL_FEED_EXPIRY_TIME.toString())), "mailFeed[3] is correct");

        mailFeedAddress = await mailFeeds.getFeeds("0x0000000000000000000000000000000000000000", 0, 1, LENGTH, false, 0);
        const feedContract = await FeedTest.at(mailFeedAddress[0]);
        const info = await feedContract.getInfo();
        const timeInSecs = info[0];

        assert.equal(totalMailFeeds, 1, "totalMailFeeds is correct");
        assert.notEqual(mailFeedAddress[0], "0x0000000000000000000000000000000000000000", "mailFeedAddress is correct");
        assert.equal(timeInSecs, FEED_EXPIRY_TIME, "timeInSecs is correct");
    });

    it("subscribe 2", async () => {
        const credits = await CreditsERC20.deployed();
        const mail = await MailERC721.deployed();
        const mailFeedsAddress = await mail.getMailFeedsAddress();
        const mailFeeds = await MailFeeds.at(mailFeedsAddress);

        let mailFeedInfo = await mailFeeds.getInfo("0x0000000000000000000000000000000000000000", accounts[2], 0);
        let mailFeedAddress = mailFeedInfo[2];
        const feedContract = await Feed.at(mailFeedAddress);
        const feedExtensionAddress = await feedContract.getExtensionInfo();

        await credits.approve(feedExtensionAddress, web3.utils.toWei("1", "ether"), {from: accounts[3]});
        await credits.approve(feedExtensionAddress, web3.utils.toWei("1", "ether"), {from: accounts[4]});
        await credits.approve(feedExtensionAddress, web3.utils.toWei("1", "ether"), {from: accounts[5]});

        await feedContract.subscribe({from: accounts[3]});
        await feedContract.subscribe({from: accounts[4]});
        await feedContract.subscribe({from: accounts[5]});

        const feedInfo = await feedContract.getInfo();
        const totalSubscribers = feedInfo[3];
        const subscribers = await feedContract.getSubscribers(totalSubscribers);
        assert.equal(subscribers.length, 3, "subscribers.length is correct");
    });

    it("cannot sendFeed 1", async () => {
        return MailERC721.deployed().then(async contract => {
            const mailFeedsAddress = await contract.getMailFeedsAddress();
            const mailFeeds = await MailFeeds.at(mailFeedsAddress);
            let mailFeedInfo = await mailFeeds.getInfo("0x0000000000000000000000000000000000000000", accounts[2], 0);
            let mailFeedAddress = mailFeedInfo[2];

            return await contract.sendFeed(mailFeedAddress,[accounts[3], accounts[4], accounts[5]],
                ["mailx.com","maily.com","mailz.com"], {from: accounts[1]});
        }).then(() => {
            assert.ok(false);
        }, e => {
            assert.ok(true);
            console.log(e.reason);
        });
    });

    it("sendFeed", async () => {
        const contract = await MailERC721.deployed();
        const credits = await CreditsERC20.deployed();
        const mailFeedsAddress = await contract.getMailFeedsAddress();
        const mailFeeds = await MailFeeds.at(mailFeedsAddress);

        let mailFeedInfo = await mailFeeds.getInfo("0x0000000000000000000000000000000000000000", accounts[2], 0);
        let mailFeedAddress = mailFeedInfo[2];

        const before0 = await credits.balanceOf(accounts[2]);
        const before1 = await web3.eth.getBalance(accounts[3]);
        const before2 = await web3.eth.getBalance(accounts[4]);
        const before3 = await web3.eth.getBalance(accounts[5]);
        const before4 = await web3.eth.getBalance(accounts[2]);

        const receipt = await contract.sendFeed(mailFeedAddress,[accounts[3], accounts[4], accounts[5]],
            ["mailx.com","maily.com","mailz.com"], {from: accounts[2]});
        let tx = await web3.eth.getTransaction(receipt.tx);
        let totalGas = (new BN(receipt.receipt.gasUsed)).mul(new BN(tx.gasPrice));

        const after0 = await credits.balanceOf(accounts[2]);
        const after1 = await web3.eth.getBalance(accounts[3]);
        const after2 = await web3.eth.getBalance(accounts[4]);
        const after3 = await web3.eth.getBalance(accounts[5]);
        const after4 = await web3.eth.getBalance(accounts[2]);

        assert.equal(after0, before0.toString(), "after0 is correct");
        assert.equal(after1, before1.toString(), "after1 is correct");
        assert.equal(after2, before2.toString(), "after2 is correct");
        assert.equal(after3, before3.toString(), "after3 is correct");
        assert.equal(after4, (new BN(before4)).sub((new BN(totalGas))).toString(), 'after4 is correct');

        let event = receipt.logs[1].args;
        assert.equal(event.from, accounts[2].toString(), 'from is correct');
        assert.equal(event.to, accounts[3].toString(), 'to is correct');
        event = receipt.logs[3].args;
        assert.equal(event.from, accounts[2].toString(), 'from is correct');
        assert.equal(event.to, accounts[4].toString(), 'to is correct');
        event = receipt.logs[5].args;
        assert.equal(event.from, accounts[2].toString(), 'from is correct');
        assert.equal(event.to, accounts[5].toString(), 'to is correct');

        let mailInfo = await contract.getMailInfo(accounts[3], 1, OPTION_INBOX);
        let uri = mailInfo[2];
        assert.equal(uri, "mailx.com", "mail from is correct");

        mailInfo = await contract.getMailInfo(accounts[4], 1, OPTION_INBOX);
        uri = mailInfo[2];
        assert.equal(uri, "maily.com", "mail from is correct");

        mailInfo = await contract.getMailInfo(accounts[5], 1, OPTION_INBOX);
        uri = mailInfo[2];
        assert.equal(uri, "mailz.com", "mail from is correct");
    });

    it("cannot sendFeed 2", async () => {
        return MailERC721.deployed().then(async contract => {
            const mailFeedsAddress = await contract.getMailFeedsAddress();
            const mailFeeds = await MailFeeds.at(mailFeedsAddress);
            let mailFeedInfo = await mailFeeds.getInfo("0x0000000000000000000000000000000000000000", accounts[2], 0);
            let mailFeedAddress = mailFeedInfo[2];
            const feedContract = await FeedTest.at(mailFeedAddress);
            const info = await feedContract.getInfo();
            const timeInSecs = info[0];
            await time.increase(timeInSecs);//passed 15 days

            return await contract.sendFeed(mailFeedAddress,[accounts[3], accounts[4], accounts[5]],
                ["mailx.com","maily.com","mailz.com"], {from: accounts[2]});
        }).then(() => {
            assert.ok(false);
        }, e => {
            assert.ok(true);
            console.log(e.reason);
        });
    });

    it("cannot sendFeed 3", async () => {
        return MailERC721.deployed().then(async contract => {
            const mailFeedsAddress = await contract.getMailFeedsAddress();
            const mailFeeds = await MailFeeds.at(mailFeedsAddress);
            let mailFeedInfo = await mailFeeds.getInfo("0x0000000000000000000000000000000000000000", accounts[2], 0);
            let mailFeedAddress = mailFeedInfo[2];
            const feedContract = await FeedTest.at(mailFeedAddress);
            const info = await feedContract.getInfo();
            const timeInSecs = info[0];
            await time.increase(timeInSecs);//passed 15 days

            return await contract.sendFeed(mailFeedAddress,[accounts[3], accounts[4], accounts[5]],
                ["mailx.com","maily.com","mailz.com"], {from: accounts[2]});
        }).then(() => {
            assert.ok(false);
        }, e => {
            assert.ok(true);
            console.log(e.reason);
        });
    });
});