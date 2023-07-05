const MailERC721 = artifacts.require("MailERC721.sol");
const NoReply = artifacts.require("NoReply.sol");
const CreditsERC20 = artifacts.require("CreditsERC20.sol");
const Feed = artifacts.require("Feed.sol");
const MailFeeds = artifacts.require("MailFeeds");
const {time} = require('@openzeppelin/test-helpers');
const BN = web3.utils.BN;
const OPTION_INBOX = 0;
const OPTION_SENT = 1;

contract("NoReply", accounts => {
    it("cannot setFee", async () => {
        return NoReply.deployed().then(async contract => {
            return await contract.setFee(web3.utils.toWei("1", "ether"), false, {from: accounts[1]});
        }).then(() => {
            assert.ok(false);
        }, e => {
            assert.ok(true);
            console.log(e.reason);
        });
    });

    it("setFee", async () => {
        const mail = await MailERC721.deployed();
        const noReply = await NoReply.deployed();

        await noReply.setFee(web3.utils.toWei("1", "ether"), false, {from: accounts[0]});

        const mailBoxInfo = await mail.getMailBoxInfo(noReply.address);
        const price = mailBoxInfo[2];
        assert.equal(price, web3.utils.toWei("1", "ether").toString(), "price is correct");
    });

    it("cannot sendMail 1", async () => {
        return NoReply.deployed().then(async contract => {
            return await contract.sendMail(contract.address, "mailbox.com", "mail.com", 0, {from: accounts[1], value: web3.utils.toWei("1", "ether")});
        }).then(() => {
            assert.ok(false);
        }, e => {
            assert.ok(true);
            console.log(e.reason);
        });
    });

    it("cannot sendMail 2", async () => {
        return NoReply.deployed().then(async contract => {
            return await contract.sendMail(contract.address, "mailbox.com", "mail.com", 0, {from: accounts[0], value: web3.utils.toWei("0", "ether")});
        }).then(() => {
            assert.ok(false);
        }, e => {
            assert.ok(true);
            console.log(e.reason);
        });
    });

    it("sendMail", async () => {
        const mail = await MailERC721.deployed();
        const noReply = await NoReply.deployed();

        await noReply.sendMail(noReply.address, "mailbox.com", "mail.com", 0, {from: accounts[0], value: web3.utils.toWei("1", "ether")});

        let mailInfo = await mail.getMailInfo(noReply.address, 1, OPTION_SENT);
        let uri = mailInfo[2];
        assert.equal(uri, "mail.com", "mail from is correct");
        mailInfo = await mail.getMailInfo(noReply.address, 1, OPTION_INBOX);
        uri = mailInfo[2];
        assert.equal(uri, "mail.com", "mail to is correct");

        const mailBoxInfo = await mail.getMailBoxInfo(noReply.address);
        const mailBoxUri = mailBoxInfo[1];
        assert.equal(mailBoxUri, "mailbox.com", "mailBoxUri is correct");
    });

    it("cannot createMailFeed 1", async () => {
        return NoReply.deployed().then(async contract => {
            return await contract.createMailFeed(["Feed1", "Description1"], 2000000, "0x0000000000000000000000000000000000000000", web3.utils.toWei("1", "ether"), 0,{from: accounts[0]});
        }).then(() => {
            assert.ok(false);
        }, e => {
            assert.ok(true);
            console.log(e.reason);
        });
    });

    it("cannot createMailFeed 2", async () => {
        return NoReply.deployed().then(async contract => {
            const noReply = await NoReply.deployed();
            const credits = await CreditsERC20.deployed();
            const mail = await MailERC721.deployed();

            await credits.transfer(noReply.address, web3.utils.toWei("10000", "ether"), {from: accounts[0]});
            await noReply.approveCredits(mail.address, web3.utils.toWei("10000", "ether"), {from: accounts[0]});

            return await contract.createMailFeed(["Feed1", "Description1"],2000000, "0x0000000000000000000000000000000000000000", web3.utils.toWei("1", "ether"), 0,{from: accounts[1]});
        }).then(() => {
            assert.ok(false);
        }, e => {
            assert.ok(true);
            console.log(e.reason);
        });
    });

    it("createMailFeed", async () => {
        const mail = await MailERC721.deployed();
        const noReply = await NoReply.deployed();
        const credits = await CreditsERC20.deployed();
        const mailFeedsAddress = await mail.getMailFeedsAddress();
        const mailFeeds = await MailFeeds.at(mailFeedsAddress);

        await credits.transfer(noReply.address, web3.utils.toWei("10000", "ether"), {from: accounts[0]});
        await noReply.approveCredits(mail.address, web3.utils.toWei("10000", "ether"), {from: accounts[0]});

        const receipt = await noReply.createMailFeed(["Feed1", "Description1"],2000000, "0x0000000000000000000000000000000000000000", web3.utils.toWei("1", "ether"), 0,{from: accounts[0]});
        const tx = await web3.eth.getTransaction(receipt.tx);
        const timestamp = (await web3.eth.getBlock(tx.blockNumber)).timestamp;

        let mailFeedInfo = await mailFeeds.getInfo("0x0000000000000000000000000000000000000000", noReply.address, 0);
        const mailFeedAddress = mailFeedInfo[2];
        mailFeedInfo = await mailFeeds.getInfo(mailFeedAddress, noReply.address, 0);
        const mailFeed = await mailFeedInfo[0];

        assert.equal(mailFeed[0], "Feed1", "mailFeed[0] is correct");
        assert.equal(mailFeed[1], "Description1", "mailFeed[1] is correct");
        assert.equal(mailFeed[2], noReply.address, "mailFeed[2] is correct");
        assert.equal(mailFeed[3], (new BN('2592000')).add(new BN(timestamp.toString())).toString(), "mailFeed[3] is correct");

        const feedContract = await Feed.at(mailFeedAddress);
        const info = await feedContract.getInfo();
        const timeInSecs = info[0];

        assert.equal(timeInSecs, "2000000", "timeInSecs is correct");
    });

    it("cannot sendFeed 1", async () => {
        return NoReply.deployed().then(async contract => {
            const mail = await MailERC721.deployed();
            const mailFeedsAddress = await mail.getMailFeedsAddress();
            const mailFeeds = await MailFeeds.at(mailFeedsAddress);
            const mailFeedInfo = await mailFeeds.getInfo("0x0000000000000000000000000000000000000000", contract.address, 0);
            const mailFeedAddress = mailFeedInfo[2];

            return await contract.subscribe(mailFeedAddress, {from: accounts[1], value: web3.utils.toWei("1", "ether")});
        }).then(() => {
            assert.ok(false);
        }, e => {
            assert.ok(true);
            console.log(e.reason);
        });
    });

    it("cannot sendFeed 2", async () => {
        return NoReply.deployed().then(async contract => {
            const mail = await MailERC721.deployed();
            const mailFeedsAddress = await mail.getMailFeedsAddress();
            const mailFeeds = await MailFeeds.at(mailFeedsAddress);
            const mailFeedInfo = await mailFeeds.getInfo("0x0000000000000000000000000000000000000000", contract.address, 0);
            const mailFeedAddress = mailFeedInfo[2];

            return await contract.subscribe(mailFeedAddress, {from: accounts[0], value: web3.utils.toWei("0", "ether")});
        }).then(() => {
            assert.ok(false);
        }, e => {
            assert.ok(true);
            console.log(e.reason);
        });
    });

    it("cannot sendFeed 3", async () => {
        return NoReply.deployed().then(async contract => {
            const mail = await MailERC721.deployed();
            const mailFeedsAddress = await mail.getMailFeedsAddress();
            const mailFeeds = await MailFeeds.at(mailFeedsAddress);
            const mailFeedInfo = await mailFeeds.getInfo("0x0000000000000000000000000000000000000000", contract.address, 0);
            const mailFeedAddress = mailFeedInfo[2];

            return await contract.sendFeed(mailFeedAddress, [accounts[0]], ["mail2.com"],{from: accounts[0]});
        }).then(() => {
            assert.ok(false);
        }, e => {
            assert.ok(true);
            console.log(e.reason);
        });
    });

    it("sendFeed 1", async () => {
        const mail = await MailERC721.deployed();
        const noReply = await NoReply.deployed();
        const mailFeedsAddress = await mail.getMailFeedsAddress();
        const mailFeeds = await MailFeeds.at(mailFeedsAddress);

        const mailFeedInfo = await mailFeeds.getInfo("0x0000000000000000000000000000000000000000", noReply.address, 0);
        const mailFeedAddress = mailFeedInfo[2];

        await noReply.subscribe(mailFeedAddress, {from: accounts[0], value: web3.utils.toWei("1", "ether")});

        await noReply.sendFeed(mailFeedAddress, [noReply.address], ["mail2.com"],{from: accounts[0]});

        let mailInfo = await mail.getMailInfo(noReply.address, 2, OPTION_SENT);
        let uri = mailInfo[2];
        assert.equal(uri, "mail2.com", "mail from is correct");
        mailInfo = await mail.getMailInfo(noReply.address, 2, OPTION_INBOX);
        uri = mailInfo[2];
        assert.equal(uri, "mail2.com", "mail to is correct");

        const fromToInfo = await mail.getFromToInfo(noReply.address, noReply.address, 0, 1);
        const isBlocked = fromToInfo[3];

        assert.equal(isBlocked, true, "isBlocked is correct");
    });

    it("sendFeed 2", async () => {
        const mail = await MailERC721.deployed();
        const noReply = await NoReply.deployed();
        const mailFeedsAddress = await mail.getMailFeedsAddress();
        const mailFeeds = await MailFeeds.at(mailFeedsAddress);

        const mailFeedInfo = await mailFeeds.getInfo("0x0000000000000000000000000000000000000000", noReply.address, 0);
        const mailFeedAddress = mailFeedInfo[2];

        const feedContract = await Feed.at(mailFeedAddress);
        await feedContract.subscribe({from: accounts[5], value: web3.utils.toWei("1", "ether")});

        await noReply.sendFeed(mailFeedAddress, [noReply.address, accounts[5]], ["mail3.com", "mail4.com"],{from: accounts[0]});

        let mailInfo = await mail.getMailInfo(noReply.address, 3, OPTION_INBOX);
        let uri = mailInfo[2];
        assert.equal(uri, "mail3.com", "mail from is correct");
        mailInfo = await mail.getMailInfo(accounts[5], 1, OPTION_INBOX);
        uri = mailInfo[2];
        assert.equal(uri, "mail4.com", "mail from is correct");

        let fromToInfo = await mail.getFromToInfo(noReply.address, noReply.address, 0, 1);
        const isBlocked1 = fromToInfo[3];

        assert.equal(isBlocked1, true, "isBlocked1 is correct");

        fromToInfo = await mail.getFromToInfo(accounts[5], noReply.address, 0, 1);
        const isBlocked2 = fromToInfo[3];

        assert.equal(isBlocked2, true, "isBlocked2 is correct");
    });

    it("cannot sendFeed 4", async () => {
        return NoReply.deployed().then(async contract => {
            const mail = await MailERC721.deployed();
            const mailFeedsAddress = await mail.getMailFeedsAddress();
            const mailFeeds = await MailFeeds.at(mailFeedsAddress);
            const mailFeedInfo = await mailFeeds.getInfo("0x0000000000000000000000000000000000000000", contract.address, 0);
            const mailFeedAddress = mailFeedInfo[2];

            return await mail.sendFeed(mailFeedAddress, [contract.address], ["mail2.com"],{from: accounts[0]});
        }).then(() => {
            assert.ok(false);
        }, e => {
            assert.ok(true);
            console.log(e.reason);
        });
    });

    it("cannot sendFeed 5", async () => {
        return NoReply.deployed().then(async contract => {
            const mail = await MailERC721.deployed();
            const mailFeedsAddress = await mail.getMailFeedsAddress();
            const mailFeeds = await MailFeeds.at(mailFeedsAddress);

            const mailFeedInfo = await mailFeeds.getInfo("0x0000000000000000000000000000000000000000", contract.address, 0);
            const mailFeedAddress = mailFeedInfo[2];
            const feedContract = await Feed.at(mailFeedAddress);
            const info = await feedContract.getInfo();
            const timeInSecs = info[0];
            await time.increase(timeInSecs);

            return await contract.sendFeed(mailFeedAddress, [contract.address], ["mail2.com"],{from: accounts[0]});
        }).then(() => {
            assert.ok(false);
        }, e => {
            assert.ok(true);
            console.log(e.reason);
        });
    });

    it("cannot sendFeed 6", async () => {
        return NoReply.deployed().then(async contract => {
            const mail = await MailERC721.deployed();
            const mailFeedsAddress = await mail.getMailFeedsAddress();
            const mailFeeds = await MailFeeds.at(mailFeedsAddress);
            const mailFeedInfo = await mailFeeds.getInfo("0x0000000000000000000000000000000000000000", contract.address, 0);
            const mailFeedAddress = mailFeedInfo[2];
            await time.increase(592000);

            return await contract.sendFeed(mailFeedAddress, [contract.address], ["mail2.com"],{from: accounts[0]});
        }).then(() => {
            assert.ok(false);
        }, e => {
            assert.ok(true);
            console.log(e.reason);
        });
    });
});