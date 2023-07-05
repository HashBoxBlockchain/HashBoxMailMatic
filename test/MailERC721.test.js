const CreditsERC20 = artifacts.require("CreditsERC20");
const MailERC721 = artifacts.require("MailERC721");
const FeedExtensionAttack = artifacts.require("FeedExtensionAttack");
const Feed = artifacts.require("Feed");
const MailFeeds = artifacts.require("MailFeeds");
const {time} = require('@openzeppelin/test-helpers');
const BN = web3.utils.BN;
const OPTION_INBOX = 0;
const OPTION_SENT = 1;
const OPTION_ALL_MAIL = 2;
const OPTION_TRASH = 3;
const OPTION_BLOCKED_USERS = 4;
const OPTION_SUBSCRIPTIONS = 6;
const FEED_EXPIRY_TIME = 1296000;
const MAIL_FEED_EXPIRY_TIME = 2592000;
const LENGTH = 100;

contract("MailERC721", accounts => {
    it("name and symbol", async () => {
        const contract = await MailERC721.deployed();
        assert.equal(await contract.name(), "HashBox Mail", 'name is correct');
        assert.equal(await contract.symbol(), "MAIL", 'symbol is correct');
    });

    it("getMailBoxInfo 1", async () => {
        const contract = await MailERC721.deployed();
        const mailBoxInfo = await contract.getMailBoxInfo(accounts[0]);
        const id = mailBoxInfo[0];
        const uri = mailBoxInfo[1];
        const price = mailBoxInfo[2];

        assert.equal(id, "0", "id is correct");
        assert.equal(uri, "", "uri is correct");
        assert.equal(price, web3.utils.toWei("0", "ether"), "price is correct");
    });

    it("getMailInfo 1", async () => {
        const contract = await MailERC721.deployed();
        let mailInfo = await contract.getMailInfo(accounts[0], 1, OPTION_SENT);
        let totalIds = mailInfo[0];
        let uri = mailInfo[2];

        assert.equal(totalIds, "0", "totalIds is correct");
        assert.equal(uri, "", "uri is correct");

        mailInfo = await contract.getMailInfo(accounts[0], 1, OPTION_INBOX);
        totalIds = mailInfo[0];
        uri = mailInfo[2];

        assert.equal(totalIds, "0", "totalIds is correct");
        assert.equal(uri, "", "uri is correct");
    });

    it("setFee 1", async () => {
        const contract = await MailERC721.deployed();

        await contract.setFee("0x0000000000000000000000000000000000000000", web3.utils.toWei("1", "ether"), false, "0x0000000000000000000000000000000000000000", false, {from: accounts[0]});

        const mailBoxInfo = await contract.getMailBoxInfo(accounts[0]);
        const price = mailBoxInfo[2];
        assert.equal(price, web3.utils.toWei("1", "ether").toString(), "price is correct");
    });

    it("setFee 2", async () => {
        const contract = await MailERC721.deployed();

        await contract.setFee("0x0000000000000000000000000000000000000000", web3.utils.toWei("1", "ether"), false, "0x0000000000000000000000000000000000000000", false, {from: accounts[1]});

        const mailBoxInfo = await contract.getMailBoxInfo(accounts[1]);
        const price = mailBoxInfo[2];
        assert.equal(price, web3.utils.toWei("1", "ether").toString(), "price is correct");
    });

    it("setFee 3", async () => {
        const contract = await MailERC721.deployed();

        await contract.setFee("0x0000000000000000000000000000000000000000", web3.utils.toWei("1", "ether"), false, "0x0000000000000000000000000000000000000000", false, {from: accounts[2]});

        const mailBoxInfo = await contract.getMailBoxInfo(accounts[2]);
        const price = mailBoxInfo[2];
        assert.equal(price, web3.utils.toWei("1", "ether").toString(), "price is correct");
    });

    it("setFee 4", async () => {
        const contract = await MailERC721.deployed();

        await contract.setFee("0x0000000000000000000000000000000000000000", web3.utils.toWei("0", "ether"), false, "0x0000000000000000000000000000000000000000", false, {from: accounts[4]});

        const mailBoxInfo = await contract.getMailBoxInfo(accounts[4]);
        const price = mailBoxInfo[2];
        assert.equal(price, web3.utils.toWei("0", "ether").toString(), "price is correct");
    });

    it("setFee 5", async () => {
        const contract = await MailERC721.deployed();

        await contract.setFee("0x0000000000000000000000000000000000000000", web3.utils.toWei("1.5", "ether"), false, "0x0000000000000000000000000000000000000000", false, {from: accounts[5]});

        const mailBoxInfo = await contract.getMailBoxInfo(accounts[5]);
        const price = mailBoxInfo[2];
        assert.equal(price, web3.utils.toWei("1.5", "ether").toString(), "price is correct");
    });

    it("cannot sendMail 1", async () => {
        return MailERC721.deployed().then(async contract => {
            return contract.methods['sendMail(address,string,uint256)'](accounts[2], "mail.com", 0, {from: accounts[1], value: web3.utils.toWei("1", "ether")});
        }).then(() => {
            assert.ok(false);
        }, e => {
            assert.ok(true);
            console.log(e.reason);
        });
    });

    it("cannot sendMail 2", async () => {
        return MailERC721.deployed().then(async contract => {
            return contract.methods['sendMail(address,string,string,uint256)'](accounts[1],
                "", "mail.com", 0, {from: accounts[0], value: web3.utils.toWei("1", "ether")});
        }).then(() => {
            assert.ok(false);
        }, e => {
            assert.ok(true);
            console.log(e.reason);
        });
    });

    it("cannot sendMail 3", async () => {
        return MailERC721.deployed().then(async contract => {
            return contract.methods['sendMail(address,string,string,uint256)'](accounts[1],
                "mailbox.com", "", 0, {from: accounts[0], value: web3.utils.toWei("1", "ether")});
        }).then(() => {
            assert.ok(false);
        }, e => {
            assert.ok(true);
            console.log(e.reason);
        });
    });

    it("sendMail 1", async () => {
        const contract = await MailERC721.deployed();

        const beforeFromBalance = await web3.eth.getBalance(accounts[0]);
        const beforeToBalance = await web3.eth.getBalance(accounts[1]);

        const receipt = await contract.methods['sendMail(address,string,string,uint256)'](accounts[1],
            "mailbox.com", "mail.com", 0, {from: accounts[0], value: web3.utils.toWei("1", "ether")});
        let tx = await web3.eth.getTransaction(receipt.tx);
        let totalGas = (new BN(receipt.receipt.gasUsed)).mul(new BN(tx.gasPrice));

        const afterFromBalance = await web3.eth.getBalance(accounts[0]);
        const afterToBalance = await web3.eth.getBalance(accounts[1]);

        const event = receipt.logs[2].args;
        assert.equal(event.tokenId, '1', 'id is correct');
        assert.equal(event.from, accounts[0].toString(), 'from is correct');
        assert.equal(event.to, accounts[1].toString(), 'to is correct');
        assert.equal(afterFromBalance, (new BN(beforeFromBalance)).sub(new BN(web3.utils.toWei("1", "ether"))).sub((new BN(totalGas))).toString(), 'fromBalance is correct');
        assert.equal(afterToBalance, (new BN(beforeToBalance)).add(new BN(web3.utils.toWei("1", "ether"))).toString(), 'toBalance is correct');

        let mailInfo = await contract.getMailInfo(accounts[0], 1, OPTION_SENT);
        let uri = mailInfo[2];
        assert.equal(uri, "mail.com", "mail from is correct");
        mailInfo = await contract.getMailInfo(accounts[1], 1, OPTION_INBOX);
        uri = mailInfo[2];
        assert.equal(uri, "mail.com", "mail to is correct");

        const mailBoxInfo = await contract.getMailBoxInfo(accounts[0]);
        const price = mailBoxInfo[2];
        assert.equal(price, web3.utils.toWei("1", "ether").toString(), "price is correct");
    });

    it("cannot sendMail 4", async () => {
        return MailERC721.deployed().then(async contract => {
            return contract.methods['sendMail(address,string,string,uint256)'](accounts[1],
                "mailbox.com", "mail.com", 0, {from: accounts[0], value: web3.utils.toWei("1", "ether")});
        }).then(() => {
            assert.ok(false);
        }, e => {
            assert.ok(true);
            console.log(e.reason);
        });
    });

    it("cannot sendMail 5", async () => {
        return MailERC721.deployed().then(async contract => {
            return contract.methods['sendMail(address,string,uint256)'](accounts[1],
                "mail.com", 0, {from: accounts[0], value: web3.utils.toWei("1", "ether")});
        }).then(() => {
            assert.ok(false);
        }, e => {
            assert.ok(true);
            console.log(e.reason);
        });
    });

    it("getMailBoxInfo 2", async () => {
        const contract = await MailERC721.deployed();
        const mailBoxInfo = await contract.getMailBoxInfo(accounts[0]);
        const id = mailBoxInfo[0];
        const uri = mailBoxInfo[1];
        const price = mailBoxInfo[2];

        assert.equal(id, "1", "id is correct");
        assert.equal(uri, "mailbox.com", "uri is correct");
        assert.equal(price, web3.utils.toWei("1", "ether"), "price is correct");
    });

    it("getMailInfo 2", async () => {
        const contract = await MailERC721.deployed();
        let mailInfo = await contract.getMailInfo(accounts[1], 1, OPTION_INBOX);
        let totalIds = mailInfo[0];
        let uri = mailInfo[2];

        assert.equal(totalIds, "1", "totalIds is correct");
        assert.equal(uri, "mail.com", "uri is correct");

        mailInfo = await contract.getMailInfo(accounts[1], 1, OPTION_SENT);
        totalIds = mailInfo[0];
        uri = mailInfo[2];

        assert.equal(totalIds, "1", "totalIds is correct");
        assert.equal(uri, "", "uri is correct");
    });

    it("add credits", async () => {
        const contract = await CreditsERC20.deployed();
        const mailContract = await MailERC721.deployed();

        const before1 = await contract.allowance(accounts[0], mailContract.address);
        const before2 = await contract.allowance(accounts[1], mailContract.address);
        const before3 = await contract.allowance(accounts[2], mailContract.address);
        const before4 = await contract.allowance(accounts[3], mailContract.address);

        assert.equal(before1, web3.utils.toWei("0", "ether"), "before1 is correct");
        assert.equal(before2, web3.utils.toWei("0", "ether"), "before2 is correct");
        assert.equal(before3, web3.utils.toWei("0", "ether"), "before3 is correct");
        assert.equal(before4, web3.utils.toWei("0", "ether"), "before4 is correct");

        await contract.transfer(accounts[1], web3.utils.toWei("20", "ether"), {from: accounts[0]});
        await contract.transfer(accounts[2], web3.utils.toWei("30", "ether"), {from: accounts[0]});
        await contract.transfer(accounts[3], web3.utils.toWei("40", "ether"), {from: accounts[0]});

        const balance1 = await contract.balanceOf(accounts[0]);
        const balance2 = await contract.balanceOf(accounts[1]);
        const balance3 = await contract.balanceOf(accounts[2]);
        const balance4 = await contract.balanceOf(accounts[3]);

        assert.equal(balance1, web3.utils.toWei("9999999910", "ether"), "balance1 is correct");
        assert.equal(balance2, web3.utils.toWei("20", "ether"), "balance2 is correct");
        assert.equal(balance3, web3.utils.toWei("30", "ether"), "balance3 is correct");
        assert.equal(balance4, web3.utils.toWei("40", "ether"), "balance4 is correct");

        await contract.increaseAllowance(mailContract.address, web3.utils.toWei("10", "ether"), {from: accounts[0]});
        await contract.increaseAllowance(mailContract.address, web3.utils.toWei("20", "ether"), {from: accounts[1]});
        await contract.increaseAllowance(mailContract.address, web3.utils.toWei("30", "ether"), {from: accounts[2]});
        await contract.increaseAllowance(mailContract.address, web3.utils.toWei("40", "ether"), {from: accounts[3]});

        const after1 = await contract.allowance(accounts[0], mailContract.address);
        const after2 = await contract.allowance(accounts[1], mailContract.address);
        const after3 = await contract.allowance(accounts[2], mailContract.address);
        const after4 = await contract.allowance(accounts[3], mailContract.address);

        assert.equal(after1, web3.utils.toWei("10", "ether"), "after1 is correct");
        assert.equal(after2, web3.utils.toWei("20", "ether"), "after2 is correct");
        assert.equal(after3, web3.utils.toWei("30", "ether"), "after3 is correct");
        assert.equal(after4, web3.utils.toWei("40", "ether"), "after4 is correct");
    });

    it("sendMail 2", async () => {
        const contract = await MailERC721.deployed();

        const beforeFromBalance = await web3.eth.getBalance(accounts[0]);
        const beforeToBalance = await web3.eth.getBalance(accounts[1]);

        const receipt = await contract.methods['sendMail(address,string,uint256)'](accounts[1], "mail2.com", 0, {from: accounts[0]});
        let tx = await web3.eth.getTransaction(receipt.tx);
        let totalGas = (new BN(receipt.receipt.gasUsed)).mul(new BN(tx.gasPrice));

        const afterFromBalance = await web3.eth.getBalance(accounts[0]);
        const afterToBalance = await web3.eth.getBalance(accounts[1]);

        const event = receipt.logs[2].args;
        assert.equal(event.tokenId, '2', 'id is correct');
        assert.equal(event.from, accounts[0].toString(), 'from is correct');
        assert.equal(event.to, accounts[1].toString(), 'to is correct');
        assert.equal(afterFromBalance, (new BN(beforeFromBalance)).sub((new BN(totalGas))).toString(), 'fromBalance is correct');
        assert.equal(afterToBalance, (new BN(beforeToBalance)).toString(), 'toBalance is correct');

        let mailInfo = await contract.getMailInfo(accounts[0], 2, OPTION_SENT);
        let uri = mailInfo[2];
        assert.equal(uri, "mail2.com", "mail from is correct");
        mailInfo = await contract.getMailInfo(accounts[1], 2, OPTION_INBOX);
        uri = mailInfo[2];
        assert.equal(uri, "mail2.com", "mail to is correct");
    });

    it("getFromToInfo 1", async () => {
        const contract = await MailERC721.deployed();
        let filter = await contract.getFromToInfo(accounts[0], accounts[1], 1, 1);
        const totalSent = filter[0];
        const id1 = filter[1][0];
        filter = await contract.getFromToInfo(accounts[0], accounts[1], 2, 1);
        const id2 = filter[1][0];

        assert.equal(totalSent, "2", "totalSent is correct");
        assert.equal(id1, "1", "id1 is correct");
        assert.equal(id2, "2", "id2 is correct");
    });

    it("getFromToInfo 2", async () => {
        const contract = await MailERC721.deployed();
        const filter = await contract.getFromToInfo(accounts[1], accounts[0], 1, 1);
        const totalSent = filter[0];
        const id = filter[1][0];

        assert.equal(totalSent, "0", "totalSent is correct");
        assert.equal(id, "0", "id is correct");
    });

    it("sendMail 3", async () => {
        const contract = await MailERC721.deployed();

        const beforeFromBalance = await web3.eth.getBalance(accounts[1]);
        const beforeToBalance = await web3.eth.getBalance(accounts[0]);

        const receipt = await contract.methods['sendMail(address,string,string,uint256)'](accounts[0],
            "mailbox2.com", "mail3.com", 0, {from: accounts[1]});
        let tx = await web3.eth.getTransaction(receipt.tx);
        let totalGas = (new BN(receipt.receipt.gasUsed)).mul(new BN(tx.gasPrice));

        const afterFromBalance = await web3.eth.getBalance(accounts[1]);
        const afterToBalance = await web3.eth.getBalance(accounts[0]);

        const event = receipt.logs[2].args;
        assert.equal(event.tokenId, '3', 'id is correct');
        assert.equal(event.from, accounts[1].toString(), 'from is correct');
        assert.equal(event.to, accounts[0].toString(), 'to is correct');
        assert.equal(afterFromBalance, (new BN(beforeFromBalance)).sub((new BN(totalGas))).toString(), 'fromBalance is correct');
        assert.equal(afterToBalance, (new BN(beforeToBalance)).toString(), 'toBalance is correct');

        let mailInfo = await contract.getMailInfo(accounts[1], 1, OPTION_SENT);
        let uri = mailInfo[2];
        assert.equal(uri, "mail3.com", "mail from is correct");
        mailInfo = await contract.getMailInfo(accounts[0], 1, OPTION_INBOX);
        uri = mailInfo[2];
        assert.equal(uri, "mail3.com", "mail to is correct");

        const mailBoxUri = await contract.tokenURI(2);
        assert.equal(mailBoxUri, "mailbox2.com", "mailBoxUri is correct");
    });

    it("getMails 1", async () => {
        const contract = await MailERC721.deployed();
        const mails = await contract.getMails(accounts[0], 3, 3, OPTION_SENT);
        const ids = mails[0];
        const uris = mails[1];
        const blocks = mails[2];

        assert.equal(ids, "2,1,0", "ids is correct");
        assert.equal(uris[0], "mail2.com", "mail 1 is correct");
        assert.equal(uris[1], "mail.com", "mail 2 is correct");
        assert.equal(uris[2], "", "mail 3 is correct");
        assert.equal(blocks.length, "3", "blocks.length is correct");
    });

    it("getMails 2", async () => {
        const contract = await MailERC721.deployed();
        const mails = await contract.getMails(accounts[0], 3, 3, OPTION_ALL_MAIL);
        const ids = mails[0];
        const uris = mails[1];
        const blocks = mails[2];

        assert.equal(ids, "3,2,1", "ids is correct");
        assert.equal(uris[0], "mail3.com", "mail 1 is correct");
        assert.equal(uris[1], "mail2.com", "mail 2 is correct");
        assert.equal(uris[2], "mail.com", "mail 3 is correct");
        assert.equal(blocks.length, "3", "blocks.length is correct");
    });

    it("getFromToInfo 3", async () => {
        const contract = await MailERC721.deployed();
        let filter = await contract.getFromToInfo(accounts[0], accounts[1], 1, 1);
        const totalSent = filter[0];
        const id1 = filter[1][0];
        filter = await contract.getFromToInfo(accounts[0], accounts[1], 2, 1);
        const id2 = filter[1][0];

        assert.equal(totalSent, "2", "totalSent is correct");
        assert.equal(id1, "1", "id1 is correct");
        assert.equal(id2, "2", "id2 is correct");
    });

    it("getFromToInfo 4", async () => {
        const contract = await MailERC721.deployed();
        const filter = await contract.getFromToInfo(accounts[1], accounts[0], 1, 1);
        const totalSent = filter[0];
        const id = filter[1][0];

        assert.equal(totalSent, "1", "totalSent is correct");
        assert.equal(id, "1", "id is correct");
    });

    it("cannot transfer 1", async () => {
        return MailERC721.deployed().then(async contract => {
            return contract.methods['safeTransferFrom(address,address,uint256,bytes)'](accounts[0], accounts[1], 2, [], {from: accounts[0]});
        }).then(() => {
            assert.ok(false);
        }, e => {
            assert.ok(true);
            console.log(Object.values(e.data)[0].reason);
        });
    });

    it("cannot transfer 2", async () => {
         return MailERC721.deployed().then(async contract => {
             return contract.methods['safeTransferFrom(address,address,uint256)'](accounts[1], accounts[0], 2, {from: accounts[1]});
         }).then(() => {
             assert.ok(false);
         }, e => {
             assert.ok(true);
             console.log(Object.values(e.data)[0].reason);
         });
     });

    it("cannot transfer 3", async () => {
        return MailERC721.deployed().then(async contract => {
            return contract.transferFrom(accounts[0], accounts[1], 2, {from: accounts[0]});
        }).then(() => {
            assert.ok(false);
        }, e => {
            assert.ok(true);
            console.log(Object.values(e.data)[0].reason);
        });
    });

     it("burnMail", async () => {
         const contract = await MailERC721.deployed();

         const beforeFromBalance = await contract.balanceOf(accounts[1]);

         const receipt = await contract.burnMail(1, {from: accounts[1]});

         const afterFromBalance = await contract.balanceOf(accounts[1]);

         const event = receipt.logs[0].args;
         assert.equal(event.tokenId, '1', 'id is correct');
         assert.equal(event.from, accounts[1].toString(), 'from is correct');
         assert.equal(event.to, '0x0000000000000000000000000000000000000000', 'to is correct');
         assert.equal(afterFromBalance, (new BN(beforeFromBalance)).sub((new BN(1))).toString(), 'fromBalance is correct');

         const mails = await contract.getMails(accounts[1], 1, 1, OPTION_TRASH);
         const ids = mails[0];
         const uris = mails[1];
         const blocks = mails[2];

         assert.equal(ids[0], "1", "id is correct");
         assert.equal(uris[0], "mail.com", "uri is correct");
         assert.equal(blocks.length, "1", "blocks.length is correct");
     });

    it("getMailInfo 3", async () => {
        const contract = await MailERC721.deployed();
        const mailInfo = await contract.getMailInfo(accounts[1], 1, OPTION_INBOX);
        const totalIds = mailInfo[0];
        const uri = mailInfo[2];
        const totalBurned = mailInfo[6];

        assert.equal(totalIds, "3", "totalIds is correct");
        assert.equal(uri, "", "uri is correct");
        assert.equal(totalBurned, "1", "totalBurned is correct");
    });

    it("sendMail 4", async () => {
        const contract = await MailERC721.deployed();

        const beforeFromBalance = await web3.eth.getBalance(accounts[2]);
        const beforeToBalance = await web3.eth.getBalance(accounts[1]);

        const receipt = await contract.methods['sendMail(address,string,string,uint256)'](accounts[1],
            "mailbox3.com", "mail4.com", 0, {from: accounts[2], value: web3.utils.toWei("1", "ether")});
        let tx = await web3.eth.getTransaction(receipt.tx);
        let totalGas = (new BN(receipt.receipt.gasUsed)).mul(new BN(tx.gasPrice));

        const afterFromBalance = await web3.eth.getBalance(accounts[2]);
        const afterToBalance = await web3.eth.getBalance(accounts[1]);

        const event = receipt.logs[2].args;
        assert.equal(event.tokenId, '4', 'id is correct');
        assert.equal(event.from, accounts[2].toString(), 'from is correct');
        assert.equal(event.to, accounts[1].toString(), 'to is correct');
        assert.equal(afterFromBalance, (new BN(beforeFromBalance)).sub(new BN(web3.utils.toWei("1", "ether"))).sub((new BN(totalGas))).toString(), 'fromBalance is correct');
        assert.equal(afterToBalance, (new BN(beforeToBalance)).add(new BN(web3.utils.toWei("1", "ether"))).toString(), 'toBalance is correct');

        let mailInfo = await contract.getMailInfo(accounts[2], 1, OPTION_SENT);
        let uri = mailInfo[2];
        assert.equal(uri, "mail4.com", "mail from is correct");
        mailInfo = await contract.getMailInfo(accounts[1], 3, OPTION_INBOX);
        uri = mailInfo[2];
        assert.equal(uri, "mail4.com", "mail to is correct");

        const mailBoxUri = await contract.tokenURI(3);
        assert.equal(mailBoxUri, "mailbox3.com", "mailBoxUri is correct");
    });

    it("cannot burnMailBox", async () => {
        return MailERC721.deployed().then(async contract => {
            return contract.burnMailBox({from: accounts[3]});
        }).then(() => {
            assert.ok(false);
        }, e => {
            assert.ok(true);
            console.log(e.reason);
        });
    });

    it("burnMailBox", async () => {
        const contract = await MailERC721.deployed();

        await contract.burnMailBox({from: accounts[1]});

        const mailBoxInfo = await contract.getMailBoxInfo(accounts[1]);
        const id = mailBoxInfo[0];
        const uriMailBox = mailBoxInfo[1];
        const price = mailBoxInfo[2];

        assert.equal(id, "0", "id is correct");
        assert.equal(uriMailBox, "", "uriMailBox is correct");
        assert.equal(price, web3.utils.toWei("0", "ether"), "price is correct");

        const mailInfo = await contract.getMailInfo(accounts[1], 2, OPTION_INBOX);
        const totalIds = mailInfo[0];
        const uriMail = mailInfo[2];
        const totalReceived = mailInfo[5];
        const totalBurned = mailInfo[6];

        assert.equal(totalIds, "0", "totalIds is correct");
        assert.equal(uriMail, "", "uriMail is correct");
        assert.equal(totalReceived, "0", "totalReceived is correct");
        assert.equal(totalBurned, "0", "totalBurned is correct");

        const mails = await contract.getMails(accounts[1], 3, 3, OPTION_TRASH);
        const ids = mails[0];
        const uris = mails[1];
        const blocks = mails[2];

        assert.equal(ids[0], "3", "ids[0] is correct");
        assert.equal(ids[1], "2", "ids[1] is correct");
        assert.equal(ids[2], "1", "ids[2] is correct");
        assert.equal(uris[0], "mail4.com", "uris[0] is correct");
        assert.equal(uris[1], "mail2.com", "uris[1] is correct");
        assert.equal(uris[2], "mail.com", "uris[2] is correct");
        assert.equal(blocks.length, "3", "blocks.length is correct");
    });

    it("sendMail 5", async () => {
        const contract = await MailERC721.deployed();

        const beforeFromBalance = await web3.eth.getBalance(accounts[3]);
        const beforeToBalance = await web3.eth.getBalance(accounts[4]);

        const receipt = await contract.methods['sendMail(address,string,string,uint256)'](accounts[4],
            "mailbox.com", "mail.com", 0, {from: accounts[3]});
        let tx = await web3.eth.getTransaction(receipt.tx);
        let totalGas = (new BN(receipt.receipt.gasUsed)).mul(new BN(tx.gasPrice));

        const afterFromBalance = await web3.eth.getBalance(accounts[3]);
        const afterToBalance = await web3.eth.getBalance(accounts[4]);

        const event = receipt.logs[2].args;
        assert.equal(event.tokenId, '5', 'id is correct');
        assert.equal(event.from, accounts[3].toString(), 'from is correct');
        assert.equal(event.to, accounts[4].toString(), 'to is correct');
        assert.equal(afterFromBalance, (new BN(beforeFromBalance)).sub(new BN(web3.utils.toWei("0", "ether"))).sub((new BN(totalGas))).toString(), 'fromBalance is correct');
        assert.equal(afterToBalance, (new BN(beforeToBalance)).add(new BN(web3.utils.toWei("0", "ether"))).toString(), 'toBalance is correct');

        let mailInfo = await contract.getMailInfo(accounts[3], 1, OPTION_SENT);
        let uri = mailInfo[2];
        assert.equal(uri, "mail.com", "mail from is correct");
        mailInfo = await contract.getMailInfo(accounts[4], 1, OPTION_INBOX);
        uri = mailInfo[2];
        assert.equal(uri, "mail.com", "mail to is correct");

        const mailBoxInfo = await contract.getMailBoxInfo(accounts[4]);
        const price = mailBoxInfo[2];
        assert.equal(price, web3.utils.toWei("0", "ether").toString(), "price is correct");
    });

    it("blockUsers 1", async () => {
        const contract = await MailERC721.deployed();

        await contract.blockUsers([accounts[3]], [true], {from: accounts[4]});

        const fromToInfo = await contract.getFromToInfo(accounts[3], accounts[4], 0, 1);
        const isBlocked = fromToInfo[3];

        assert.equal(isBlocked, true, "isBlocked is correct");

        const blockedUsers = await contract.getAddresses(accounts[4], 0, 2, OPTION_BLOCKED_USERS);

        assert.equal(blockedUsers[0], accounts[3], "blockedUsers[0] is correct");
        assert.equal(blockedUsers[1], "0x0000000000000000000000000000000000000000", "blockedUsers[1] is correct");

        let mailBoxInfo = await contract.getMailBoxInfo(accounts[4]);
        assert.equal(mailBoxInfo[5], 1, "mailBoxInfo[7] is correct");
        assert.equal(mailBoxInfo[6], 0, "mailBoxInfo[8] is correct");
    });

    it("cannot sendMail 6", async () => {
        return MailERC721.deployed().then(async contract => {
            return contract.methods['sendMail(address,string,uint256)'](accounts[4], "mail.com", 0, {from: accounts[3], value: web3.utils.toWei("1", "ether")});
        }).then(() => {
            assert.ok(false);
        }, e => {
            assert.ok(true);
            console.log(e.reason);
        });
    });

    it("blockUsers 2", async () => {
        const contract = await MailERC721.deployed();

        await contract.blockUsers([accounts[3]], [false], {from: accounts[4]});

        const fromToInfo = await contract.getFromToInfo(accounts[3], accounts[4], 0, 1);
        const isBlocked = fromToInfo[3];

        assert.equal(isBlocked, false, "isBlocked is correct");

        const blockedUsers = await contract.getAddresses(accounts[4], 0, 2, OPTION_BLOCKED_USERS);
        assert.equal(blockedUsers[0], "0x0000000000000000000000000000000000000000", "blockedUsers[0] is correct");
        assert.equal(blockedUsers[1], "0x0000000000000000000000000000000000000000", "blockedUsers[1] is correct");

        let mailBoxInfo = await contract.getMailBoxInfo(accounts[4]);
        assert.equal(mailBoxInfo[5], 1, "mailBoxInfo[7] is correct");
        assert.equal(mailBoxInfo[6], 1, "mailBoxInfo[8] is correct");
    });

    it("sendMail 6", async () => {
        const contract = await MailERC721.deployed();

        const beforeFromBalance = await web3.eth.getBalance(accounts[3]);
        const beforeToBalance = await web3.eth.getBalance(accounts[4]);

        const receipt = await contract.methods['sendMail(address,string,uint256)'](accounts[4], "mail.com", 0, {from: accounts[3]});
        let tx = await web3.eth.getTransaction(receipt.tx);
        let totalGas = (new BN(receipt.receipt.gasUsed)).mul(new BN(tx.gasPrice));

        const afterFromBalance = await web3.eth.getBalance(accounts[3]);
        const afterToBalance = await web3.eth.getBalance(accounts[4]);

        const event = receipt.logs[2].args;
        assert.equal(event.tokenId, '6', 'id is correct');
        assert.equal(event.from, accounts[3].toString(), 'from is correct');
        assert.equal(event.to, accounts[4].toString(), 'to is correct');
        assert.equal(afterFromBalance, (new BN(beforeFromBalance)).sub(new BN(web3.utils.toWei("0", "ether"))).sub((new BN(totalGas))).toString(), 'fromBalance is correct');
        assert.equal(afterToBalance, (new BN(beforeToBalance)).add(new BN(web3.utils.toWei("0", "ether"))).toString(), 'toBalance is correct');

        let mailInfo = await contract.getMailInfo(accounts[3], 1, OPTION_SENT);
        let uri = mailInfo[2];
        assert.equal(uri, "mail.com", "mail from is correct");
        mailInfo = await contract.getMailInfo(accounts[4], 2, OPTION_INBOX);
        uri = mailInfo[2];
        assert.equal(uri, "mail.com", "mail to is correct");
    });

    it("cannot sendMail 7", async () => {
        return MailERC721.deployed().then(async contract => {
            return contract.methods['sendMail(address,string,uint256)'](accounts[5], "mail.com", 0, {from: accounts[0], value: web3.utils.toWei("1", "ether")});
        }).then(() => {
            assert.ok(false);
        }, e => {
            assert.ok(true);
            console.log(e.reason);
        });
    });

    it("getMailInfo 4", async () => {
        const contract = await MailERC721.deployed();
        let mailInfo = await contract.getMailInfo(accounts[9], 0, OPTION_INBOX);
        let mailIds = mailInfo[4];

        assert.equal(mailIds, "6", "mailIds is correct");

        mailInfo = await contract.getMailInfo(accounts[9], 0, OPTION_SENT);
        mailIds = mailInfo[4];

        assert.equal(mailIds, "6", "mailIds is correct");
    });

    it("setFee 6", async () => {
        const contract = await MailERC721.deployed();

        await contract.setFee("0x0000000000000000000000000000000000000000", web3.utils.toWei("1", "ether"), false, "0x0000000000000000000000000000000000000000", false, {from: accounts[4]});

        const mailBoxInfo = await contract.getMailBoxInfo(accounts[4]);
        const price = mailBoxInfo[2];
        assert.equal(price, web3.utils.toWei("1", "ether").toString(), "price is correct");
    });

    it("sendMail 7", async () => {
        const contract = await MailERC721.deployed();

        const beforeBalance = await web3.eth.getBalance(accounts[4]);

        const receipt = await contract.methods['sendMail(address,string,string,uint256)'](accounts[4],
            "mailbox.com", "mail.com", 0, {from: accounts[4], value: web3.utils.toWei("1", "ether")});
        let tx = await web3.eth.getTransaction(receipt.tx);
        let totalGas = (new BN(receipt.receipt.gasUsed)).mul(new BN(tx.gasPrice));

        const afterBalance = await web3.eth.getBalance(accounts[4]);

        const event = receipt.logs[2].args;
        assert.equal(event.tokenId, '7', 'id is correct');
        assert.equal(event.from, accounts[4].toString(), 'from is correct');
        assert.equal(event.to, accounts[4].toString(), 'to is correct');
        assert.equal(afterBalance, (new BN(beforeBalance)).sub((new BN(totalGas))).toString(), 'balance is correct');

        const mailInfo = await contract.getMailInfo(accounts[4], 3, OPTION_INBOX);
        const uri = mailInfo[2];
        assert.equal(uri, "mail.com", "mail from is correct");
    });

    it("getMailBoxInfo 3", async () => {
        const contract = await MailERC721.deployed();
        const mailBoxInfo = await contract.getMailBoxInfo(accounts[4]);
        const id = mailBoxInfo[0];
        const uri = mailBoxInfo[1];
        const price = mailBoxInfo[2];
        const isPaid = mailBoxInfo[3];
        const totalMailBoxes = mailBoxInfo[4];

        assert.equal(id, "5", "id is correct");
        assert.equal(uri, "mailbox.com", "uri is correct");
        assert.equal(price, web3.utils.toWei("1", "ether"), "price is correct");
        assert.equal(isPaid, false, "isPaid is correct");
        assert.equal(totalMailBoxes, 5, "totalMailBoxes is correct");
    });

    it("setFee 7", async () => {
        const contract = await MailERC721.deployed();

        await contract.setFee("0x0000000000000000000000000000000000000000", web3.utils.toWei("1", "ether"), true, "0x0000000000000000000000000000000000000000", false, {from: accounts[4]});

        const mailBoxInfo = await contract.getMailBoxInfo(accounts[4]);
        const isPaid = mailBoxInfo[3];
        assert.equal(isPaid, true, "isPaid is correct");
    });

    it("sendMail 8", async () => {
        const contract = await MailERC721.deployed();

        const beforeFromBalance = await web3.eth.getBalance(accounts[3]);
        const beforeToBalance = await web3.eth.getBalance(accounts[4]);

        const receipt = await contract.methods['sendMail(address,string,uint256)'](accounts[4], "mail.com", 0,
            {from: accounts[3], value: web3.utils.toWei("1", "ether")});
        let tx = await web3.eth.getTransaction(receipt.tx);
        let totalGas = (new BN(receipt.receipt.gasUsed)).mul(new BN(tx.gasPrice));

        const afterFromBalance = await web3.eth.getBalance(accounts[3]);
        const afterToBalance = await web3.eth.getBalance(accounts[4]);

        const event = receipt.logs[2].args;
        assert.equal(event.tokenId, '8', 'id is correct');
        assert.equal(event.from, accounts[3].toString(), 'from is correct');
        assert.equal(event.to, accounts[4].toString(), 'to is correct');
        assert.equal(afterFromBalance, (new BN(beforeFromBalance)).sub(new BN(web3.utils.toWei("1", "ether"))).sub((new BN(totalGas))).toString(), 'fromBalance is correct');
        assert.equal(afterToBalance, (new BN(beforeToBalance)).add(new BN(web3.utils.toWei("1", "ether"))).toString(), 'toBalance is correct');

        let mailInfo = await contract.getMailInfo(accounts[3], 2, OPTION_SENT);
        let uri = mailInfo[2];
        assert.equal(uri, "mail.com", "mail from is correct");
        mailInfo = await contract.getMailInfo(accounts[4], 4, OPTION_INBOX);
        uri = mailInfo[2];
        assert.equal(uri, "mail.com", "mail to is correct");
    });

    it("setFreeMail 1", async () => {
        const contract = await MailERC721.deployed();

        const mailboxInfo = await contract.getMailBoxInfo(accounts[4]);
        await contract.setFee("0x0000000000000000000000000000000000000000", mailboxInfo[2], mailboxInfo[3], accounts[3], true, {from: accounts[4]});

        const fromToInfo = await contract.getFromToInfo(accounts[3], accounts[4], 0, 1);
        const isFree = fromToInfo[2];

        assert.equal(isFree, true, "isFree is correct");
    });

    it("sendMail 9", async () => {
        const contract = await MailERC721.deployed();

        const beforeFromBalance = await web3.eth.getBalance(accounts[3]);
        const beforeToBalance = await web3.eth.getBalance(accounts[4]);

        const receipt = await contract.methods['sendMail(address,string,uint256)'](accounts[4], "mail.com", 0, {from: accounts[3]});
        let tx = await web3.eth.getTransaction(receipt.tx);
        let totalGas = (new BN(receipt.receipt.gasUsed)).mul(new BN(tx.gasPrice));

        const afterFromBalance = await web3.eth.getBalance(accounts[3]);
        const afterToBalance = await web3.eth.getBalance(accounts[4]);

        const event = receipt.logs[2].args;
        assert.equal(event.tokenId, '9', 'id is correct');
        assert.equal(event.from, accounts[3].toString(), 'from is correct');
        assert.equal(event.to, accounts[4].toString(), 'to is correct');
        assert.equal(afterFromBalance, (new BN(beforeFromBalance)).sub((new BN(totalGas))).toString(), 'fromBalance is correct');
        assert.equal(afterToBalance, (new BN(beforeToBalance)).toString(), 'toBalance is correct');

        let mailInfo = await contract.getMailInfo(accounts[3], 3, OPTION_SENT);
        let uri = mailInfo[2];
        assert.equal(uri, "mail.com", "mail from is correct");
        mailInfo = await contract.getMailInfo(accounts[4], 5, OPTION_INBOX);
        uri = mailInfo[2];
        assert.equal(uri, "mail.com", "mail to is correct");
    });

    it("setFreeMail 2", async () => {
        const contract = await MailERC721.deployed();

        const mailboxInfo = await contract.getMailBoxInfo(accounts[4]);
        await contract.setFee("0x0000000000000000000000000000000000000000", mailboxInfo[2], mailboxInfo[3], accounts[3], false, {from: accounts[4]});

        const fromToInfo = await contract.getFromToInfo(accounts[3], accounts[4], 0, 1);
        const isFree = fromToInfo[3];

        assert.equal(isFree, false, "isFree is correct");
    });

    it("sendMail 10", async () => {
        const contract = await MailERC721.deployed();

        const beforeFromBalance = await web3.eth.getBalance(accounts[3]);
        const beforeToBalance = await web3.eth.getBalance(accounts[4]);

        const receipt = await contract.methods['sendMail(address,string,uint256)'](accounts[4], "mail.com", 0,
            {from: accounts[3], value: web3.utils.toWei("1", "ether")});
        let tx = await web3.eth.getTransaction(receipt.tx);
        let totalGas = (new BN(receipt.receipt.gasUsed)).mul(new BN(tx.gasPrice));

        const afterFromBalance = await web3.eth.getBalance(accounts[3]);
        const afterToBalance = await web3.eth.getBalance(accounts[4]);

        const event = receipt.logs[2].args;
        assert.equal(event.tokenId, '10', 'id is correct');
        assert.equal(event.from, accounts[3].toString(), 'from is correct');
        assert.equal(event.to, accounts[4].toString(), 'to is correct');
        assert.equal(afterFromBalance, (new BN(beforeFromBalance)).sub(new BN(web3.utils.toWei("1", "ether"))).sub((new BN(totalGas))).toString(), 'fromBalance is correct');
        assert.equal(afterToBalance, (new BN(beforeToBalance)).add(new BN(web3.utils.toWei("1", "ether"))).toString(), 'toBalance is correct');

        let mailInfo = await contract.getMailInfo(accounts[3], 4, OPTION_SENT);
        let totalMails = mailInfo[0];
        let uri = mailInfo[2];
        let totalReceived = mailInfo[5];
        let totalSent = totalMails - totalReceived;
        assert.equal(uri, "mail.com", "mail from is correct");
        assert.equal(totalReceived, "0", "totalReceived to is correct");
        assert.equal(totalSent, "5", "totalSent to is correct");

        mailInfo = await contract.getMailInfo(accounts[4], 6, OPTION_INBOX);
        totalMails = mailInfo[0];
        uri = mailInfo[2];
        totalReceived = mailInfo[5];
        totalSent = totalMails - totalReceived;
        assert.equal(uri, "mail.com", "mail to is correct");
        assert.equal(totalReceived, "6", "totalReceived to is correct");
        assert.equal(totalSent, "1", "totalSent to is correct");
    });

    it("sendMail 11", async () => {
        const contract = await MailERC721.deployed();

        const beforeBalance = await web3.eth.getBalance(accounts[5]);

        const receipt = await contract.methods['sendMail(address,string,string,uint256)'](accounts[5],
            "mailbox.com", "mail.com", 0, {from: accounts[5], value: web3.utils.toWei("1.5", "ether")});
        let tx = await web3.eth.getTransaction(receipt.tx);
        let totalGas = (new BN(receipt.receipt.gasUsed)).mul(new BN(tx.gasPrice));

        const afterBalance = await web3.eth.getBalance(accounts[5]);

        const event = receipt.logs[2].args;
        assert.equal(event.from, accounts[5].toString(), 'from is correct');
        assert.equal(event.to, accounts[5].toString(), 'to is correct');
        assert.equal(afterBalance, (new BN(beforeBalance)).sub((new BN(totalGas))).toString(), 'balance is correct');

        const mailInfo = await contract.getMailInfo(accounts[5], 1, OPTION_INBOX);
        const uri = mailInfo[2];
        assert.equal(uri, "mail.com", "mail from is correct");
    });

    it("cannot sendMails 1", async () => {
        return MailERC721.deployed().then(async contract => {
            return await contract.sendMails([accounts[1], accounts[2], accounts[3]],
                ["mailx.com","maily.com","mailz.com"], [0,0,0], {from: accounts[5], value: web3.utils.toWei("1", "ether")});
        }).then(() => {
            assert.ok(false);
        }, e => {
            assert.ok(true);
            console.log(e.reason);
        });
    });

    it("cannot sendMails 2", async () => {
        return MailERC721.deployed().then(async contract => {
            const credits = await CreditsERC20.deployed();
            await credits.transfer(accounts[5], web3.utils.toWei("100000", "ether"), {from: accounts[0]});
            await credits.approve(contract.address, web3.utils.toWei("3", "ether"), {from: accounts[5]});

            return await contract.sendMails([accounts[1], accounts[2], accounts[3]],
                ["mailx.com","maily.com","mailz.com"], [0,0,0], {from: accounts[6], value: web3.utils.toWei("1", "ether")});
        }).then(() => {
            assert.ok(false);
        }, e => {
            assert.ok(true);
            console.log(e.reason);
        });
    });

    it("cannot sendMails 3", async () => {
        return MailERC721.deployed().then(async contract => {
            return await contract.sendMails([accounts[1], accounts[2], accounts[3]],
                ["mailx.com","maily.com","mailz.com"], [0,0,0], {from: accounts[5]});
        }).then(() => {
            assert.ok(false);
        }, e => {
            assert.ok(true);
            console.log(e.reason);
        });
    });

    it("sendMails", async () => {
        const contract = await MailERC721.deployed();
        const credits = await CreditsERC20.deployed();

        const before0 = await credits.balanceOf(accounts[5]);
        const before1 = await web3.eth.getBalance(accounts[1]);
        const before2 = await web3.eth.getBalance(accounts[2]);
        const before3 = await web3.eth.getBalance(accounts[3]);
        const before4 = await web3.eth.getBalance(accounts[5]);

        const receipt = await contract.sendMails([accounts[1], accounts[2], accounts[3]],
            ["mailx.com","maily.com","mailz.com"], [0,0,0], {from: accounts[5], value: web3.utils.toWei("2", "ether")});
        let tx = await web3.eth.getTransaction(receipt.tx);
        let totalGas = (new BN(receipt.receipt.gasUsed)).mul(new BN(tx.gasPrice));

        const after0 = await credits.balanceOf(accounts[5]);
        const after1 = await web3.eth.getBalance(accounts[1]);
        const after2 = await web3.eth.getBalance(accounts[2]);
        const after3 = await web3.eth.getBalance(accounts[3]);
        const after4 = await web3.eth.getBalance(accounts[5]);

        assert.equal(after0, (new BN(before0)).sub((new BN(web3.utils.toWei("3", "ether")))).toString(), 'after0 is correct');
        assert.equal(after1, before1.toString(), 'after1 is correct');
        assert.equal(after2, (new BN(before2)).add((new BN(web3.utils.toWei("1", "ether")))).toString(), 'after2 is correct');
        assert.equal(after3, before3, 'after3 is correct');
        assert.equal(after4, (new BN(before4)).sub((new BN(web3.utils.toWei("2", "ether")))).sub((new BN(totalGas))).toString(), 'after4 is correct');

        let event = receipt.logs[2].args;
        assert.equal(event.from, accounts[5].toString(), 'from 1 is correct');
        assert.equal(event.to, accounts[1].toString(), 'to 1 is correct');
        event = receipt.logs[5].args;
        assert.equal(event.from, accounts[5].toString(), 'from 2 is correct');
        assert.equal(event.to, accounts[2].toString(), 'to 2 is correct');
        event = receipt.logs[8].args;
        assert.equal(event.from, accounts[5].toString(), 'from 3 is correct');
        assert.equal(event.to, accounts[3].toString(), 'to 3 is correct');

        let mailInfo = await contract.getMailInfo(accounts[1], 1, OPTION_INBOX);
        let uri = mailInfo[2];
        assert.equal(uri, "mailx.com", "mail 1 from is correct");

        mailInfo = await contract.getMailInfo(accounts[2], 1, OPTION_INBOX);
        uri = mailInfo[2];
        assert.equal(uri, "maily.com", "mail 2 from is correct");

        mailInfo = await contract.getMailInfo(accounts[3], 1, OPTION_INBOX);
        uri = mailInfo[2];
        assert.equal(uri, "mailz.com", "mail 3 from is correct");
    });

    it("burnMails", async () => {
        const contract = await MailERC721.deployed();

        const beforeFromBalance = await contract.balanceOf(accounts[4]);

        const receipt = await contract.burnMails([9, 10], {from: accounts[4]});

        const afterFromBalance = await contract.balanceOf(accounts[4]);

        let event = receipt.logs[0].args;
        assert.equal(event.tokenId, '9', 'id 1 is correct');
        assert.equal(event.from, accounts[4].toString(), 'from 1 is correct');
        assert.equal(event.to, '0x0000000000000000000000000000000000000000', 'to 1 is correct');
        event = receipt.logs[1].args;
        assert.equal(event.tokenId, '10', 'id 2 is correct');
        assert.equal(event.from, accounts[4].toString(), 'from 2 is correct');
        assert.equal(event.to, '0x0000000000000000000000000000000000000000', 'to 2 is correct');
        assert.equal(afterFromBalance, (new BN(beforeFromBalance)).sub((new BN(2))).toString(), 'fromBalance is correct');

        const mails = await contract.getMails(accounts[4], 2, 2, OPTION_TRASH);
        const ids = mails[0];
        const uris = mails[1];
        const blocks = mails[2];

        assert.equal(ids[0], "2", "id 3 is correct");
        assert.equal(ids[1], "1", "id 4 is correct");
        assert.equal(uris[0], "mail.com", "uri 1 is correct");
        assert.equal(uris[1], "mail.com", "uri 2 is correct");
        assert.equal(blocks.length, "2", "blocks.length is correct");
    });

    it("cannot createMailFeed 1", async () => {
        return MailERC721.deployed().then(async contract => {
            return await contract.createMailFeed(["Feed1", "Description1"], FEED_EXPIRY_TIME, "0x0000000000000000000000000000000000000000", web3.utils.toWei("1", "ether"), 0, {from: accounts[0]});
        }).then(() => {
            assert.ok(false);
        }, e => {
            assert.ok(true);
            console.log(e.reason);
        });
    });

    it("cannot createMailFeed 2", async () => {
        return MailERC721.deployed().then(async contract => {
            return await contract.createMailFeed(["Feed1", "Description1"], FEED_EXPIRY_TIME, FeedExtensionAttack.address, web3.utils.toWei("1", "ether"), 0, {from: accounts[0]});
        }).then(() => {
            assert.ok(false);
        }, e => {
            assert.ok(true);
            console.log(e.reason);
        });
    });

    it("createMailFeed 1", async () => {
        const credits = await CreditsERC20.deployed();
        const mail = await MailERC721.deployed();
        const mailFeedsAddress = await mail.getMailFeedsAddress();
        const mailFeeds = await MailFeeds.at(mailFeedsAddress);

        await credits.approve(mail.address, web3.utils.toWei("10000", "ether"), {from: accounts[5]});

        const allowance = await credits.allowance(accounts[5], mail.address);
        assert.equal(allowance, web3.utils.toWei("10000", "ether"), "allowance is correct");

        const receipt = await mail.createMailFeed(["Feed1", "Description1"], FEED_EXPIRY_TIME, "0x0000000000000000000000000000000000000000",
            web3.utils.toWei("1", "ether"), 0, {from: accounts[5]});
        const tx = await web3.eth.getTransaction(receipt.tx);
        const timestamp = (await web3.eth.getBlock(tx.blockNumber)).timestamp;

        let mailFeedInfo = await mailFeeds.getInfo("0x0000000000000000000000000000000000000000", accounts[5], 0);
        const totalMailFeedsByOwner = mailFeedInfo[1];
        let mailFeedAddress = mailFeedInfo[2];

        mailFeedInfo = await mailFeeds.getInfo(mailFeedAddress, accounts[5], 0);
        const mailFeed = mailFeedInfo[0];

        assert.equal(totalMailFeedsByOwner, 1, "totalMailFeedsByOwner is correct");
        assert.notEqual(mailFeedAddress, "0x0000000000000000000000000000000000000000", "mailFeedAddress is correct");
        assert.equal(mailFeed[0], "Feed1", "mailFeed[0] is correct");
        assert.equal(mailFeed[1], "Description1", "mailFeed[1] is correct");
        assert.equal(mailFeed[2], accounts[5], "mailFeed[2] is correct");
        assert.equal(mailFeed[3], (new BN(timestamp.toString())).add(new BN(MAIL_FEED_EXPIRY_TIME.toString())), "mailFeed[3] is correct");

        const totalMailFeeds = mailFeedInfo[1];
        mailFeedAddress = await mailFeeds.getFeeds("0x0000000000000000000000000000000000000000", 0, 1, LENGTH, false, 0);
        const feedContract = await Feed.at(mailFeedAddress[0]);
        const info = await feedContract.getInfo();
        const timeInSecs = info[0];

        assert.equal(totalMailFeeds, 1, "totalMailFeeds is correct");
        assert.notEqual(mailFeedAddress[0], "0x0000000000000000000000000000000000000000", "mailFeedAddress is correct");
        assert.equal(timeInSecs, FEED_EXPIRY_TIME, "timeInSecs is correct");

        await feedContract.subscribe({from: accounts[5], value: web3.utils.toWei("1", "ether")});

        await feedContract.setRating(4, {from: accounts[5]});

        mailFeedAddress = await mailFeeds.getFeeds("0x0000000000000000000000000000000000000000", 0, 1, LENGTH, false, 5);
        assert.equal(mailFeedAddress[0], "0x0000000000000000000000000000000000000000", "mailFeedAddress is correct");
    });

    it("cannot renewMailFeeds 1", async () => {
        return MailERC721.deployed().then(async contract => {
            const mailFeedsAddress = await contract.getMailFeedsAddress();
            const mailFeeds = await MailFeeds.at(mailFeedsAddress);
            const mailFeedInfo = await mailFeeds.getInfo("0x0000000000000000000000000000000000000000", accounts[5], 0);
            const mailFeedAddress = mailFeedInfo[2];

            return await contract.renewMailFeeds([mailFeedAddress], {from: accounts[1]});
        }).then(() => {
            assert.ok(false);
        }, e => {
            assert.ok(true);
            console.log(e.reason);
        });
    });

    it("renewMailFeeds 1", async () => {
        const credits = await CreditsERC20.deployed();
        const mail = await MailERC721.deployed();
        const mailFeedsAddress = await mail.getMailFeedsAddress();
        const mailFeeds = await MailFeeds.at(mailFeedsAddress);

        await credits.approve(mail.address, web3.utils.toWei("10000", "ether"), {from: accounts[5]});

        const allowance = await credits.allowance(accounts[5], mail.address);
        let mailFeedInfo = await mailFeeds.getInfo("0x0000000000000000000000000000000000000000", accounts[5], 0);
        let mailFeedAddress = mailFeedInfo[2];
        const mailFeedExpiryTime = mailFeedInfo[3];

        assert.equal(allowance, web3.utils.toWei("10000", "ether"), "allowance is correct");

        let feeds = await mailFeeds.getFeeds("0x0000000000000000000000000000000000000000", 0, 1, LENGTH, true, 0);
        assert.equal(feeds[0], mailFeedAddress, "feeds[0] is correct");

        await time.increase(mailFeedExpiryTime);//passed 30 days

        feeds = await mailFeeds.getFeeds("0x0000000000000000000000000000000000000000", 0, 1, LENGTH, true, 0);
        assert.equal(feeds[0], "0x0000000000000000000000000000000000000000", "feeds[0] is correct");

        const receipt = await mail.renewMailFeeds([mailFeedAddress], {from: accounts[5]});
        const tx = await web3.eth.getTransaction(receipt.tx);
        const timestamp = (await web3.eth.getBlock(tx.blockNumber)).timestamp;

        const mailFeedTotals = await mailFeeds.getTotals(accounts[5], 0, LENGTH);
        const totalMailFeeds = mailFeedTotals[0];

        mailFeedInfo = await mailFeeds.getInfo(mailFeedAddress, accounts[5], 0);
        const mailFeed = mailFeedInfo[0];
        const totalMailFeedsByOwner = mailFeedInfo[1];

        assert.equal(totalMailFeedsByOwner, 1, "totalMailFeedsByOwner is correct");
        assert.equal(mailFeed[0], "Feed1", "mailFeed[0] is correct");
        assert.equal(mailFeed[1], "Description1", "mailFeed[1] is correct");
        assert.equal(mailFeed[2], accounts[5], "mailFeed[2] is correct");
        assert.equal(mailFeed[3], (new BN(timestamp.toString())).add(new BN(mailFeedExpiryTime.toString())), "mailFeed[3] is correct");

        mailFeedAddress = await mailFeeds.getFeeds("0x0000000000000000000000000000000000000000", 0, 1, LENGTH, false, 0);

        assert.equal(totalMailFeeds, 1, "totalMailFeeds is correct");
        assert.notEqual(mailFeedAddress[0], "0x0000000000000000000000000000000000000000", "mailFeedAddress is correct");
    });

    it("cannot renewMailFeeds 2", async () => {
        return MailERC721.deployed().then(async contract => {
            const mailFeedsAddress = await contract.getMailFeedsAddress();
            const mailFeeds = await MailFeeds.at(mailFeedsAddress);
            const mailFeedInfo = await mailFeeds.getInfo("0x0000000000000000000000000000000000000000", accounts[5], 0);
            const mailFeedAddress = mailFeedInfo[2];

            return await contract.renewMailFeeds([mailFeedAddress], {from: accounts[5]});
        }).then(() => {
            assert.ok(false);
        }, e => {
            assert.ok(true);
            console.log(e.reason);
        });
    });

    it("cannot deleteMailFeeds 1", async () => {
        return MailERC721.deployed().then(async contract => {
            const mailFeedsAddress = await contract.getMailFeedsAddress();
            const mailFeeds = await MailFeeds.at(mailFeedsAddress);
            const mailFeedInfo = await mailFeeds.getInfo("0x0000000000000000000000000000000000000000", accounts[5], 0);
            const mailFeedAddress = mailFeedInfo[2];

            return await mailFeeds.deleteMailFeeds([mailFeedAddress], {from: accounts[5]});
        }).then(() => {
            assert.ok(false);
        }, e => {
            assert.ok(true);
            console.log(e.reason);
        });
    });

    it("createMailFeed 2", async () => {
        const credits = await CreditsERC20.deployed();
        const mail = await MailERC721.deployed();
        const mailFeedsAddress = await mail.getMailFeedsAddress();
        const mailFeeds = await MailFeeds.at(mailFeedsAddress);

        await credits.approve(mail.address, web3.utils.toWei("10000", "ether"), {from: accounts[5]});

        const allowance = await credits.allowance(accounts[5], mail.address);
        assert.equal(allowance, web3.utils.toWei("10000", "ether"), "allowance is correct");

        const receipt = await mail.createMailFeed(["Feed2", "Description2"], FEED_EXPIRY_TIME, "0x0000000000000000000000000000000000000000",
            web3.utils.toWei("1", "ether"), 0, {from: accounts[5]});
        const tx = await web3.eth.getTransaction(receipt.tx);
        const timestamp = (await web3.eth.getBlock(tx.blockNumber)).timestamp;

        const mailFeedTotals = await mailFeeds.getTotals(accounts[5], 0, LENGTH);
        const totalMailFeeds = mailFeedTotals[0];

        let mailFeedInfo = await mailFeeds.getInfo("0x0000000000000000000000000000000000000000", accounts[5], 1);
        const totalMailFeedsByOwner = mailFeedInfo[1];
        let mailFeedAddress = mailFeedInfo[2];

        mailFeedInfo = await mailFeeds.getInfo(mailFeedAddress, accounts[5], 1);
        const mailFeed = mailFeedInfo[0];

        assert.equal(totalMailFeedsByOwner, 2, "totalMailFeedsByOwner is correct");
        assert.notEqual(mailFeedAddress, "0x0000000000000000000000000000000000000000", "mailFeedAddress is correct");
        assert.equal(mailFeed[0], "Feed2", "mailFeed[0] is correct");
        assert.equal(mailFeed[1], "Description2", "mailFeed[1] is correct");
        assert.equal(mailFeed[2], accounts[5], "mailFeed[2] is correct");
        assert.equal(mailFeed[3], (new BN(timestamp.toString())).add(new BN(MAIL_FEED_EXPIRY_TIME.toString())), "mailFeed[3] is correct");

        mailFeedAddress = await mailFeeds.getFeeds("0x0000000000000000000000000000000000000000", 1, 1, LENGTH, false, 0);
        const feedContract = await Feed.at(mailFeedAddress[0]);
        const info = await feedContract.getInfo();
        const timeInSecs = info[0];

        assert.equal(totalMailFeeds, 2, "totalMailFeeds is correct");
        assert.notEqual(mailFeedAddress[0], "0x0000000000000000000000000000000000000000", "mailFeedAddress is correct");
        assert.equal(timeInSecs, FEED_EXPIRY_TIME, "timeInSecs is correct");
    });

    it("cannot deleteMailFeeds 2", async () => {
        return MailERC721.deployed().then(async contract => {
            const mailFeedsAddress = await contract.getMailFeedsAddress();
            const mailFeeds = await MailFeeds.at(mailFeedsAddress);
            const mailFeedInfo = await mailFeeds.getInfo("0x0000000000000000000000000000000000000000", accounts[5], 0);
            const mailFeedAddress = mailFeedInfo[2];

            return await mailFeeds.deleteMailFeeds([mailFeedAddress], {from: accounts[1]});
        }).then(() => {
            assert.ok(false);
        }, e => {
            assert.ok(true);
            console.log(e.reason);
        });
    });

    it("cannot renewMailFeeds 3", async () => {
        return MailERC721.deployed().then(async contract => {
            const mailFeedsAddress = await contract.getMailFeedsAddress();
            const mailFeeds = await MailFeeds.at(mailFeedsAddress);
            const mailFeedInfo = await mailFeeds.getInfo("0x0000000000000000000000000000000000000000", accounts[5], 1);
            const mailFeedAddress = mailFeedInfo[2];
            const mailFeedExpiryTime = mailFeedInfo[3];

            await time.increase(mailFeedExpiryTime);//passed 30 days

            return await contract.renewMailFeeds([mailFeedAddress], {from: accounts[5]});
        }).then(() => {
            assert.ok(false);
        }, e => {
            assert.ok(true);
            console.log(e.reason);
        });
    });

    it("renewMailFeeds 2", async () => {
        const credits = await CreditsERC20.deployed();
        const mail = await MailERC721.deployed();
        const mailFeedsAddress = await mail.getMailFeedsAddress();
        const mailFeeds = await MailFeeds.at(mailFeedsAddress);

        await credits.approve(mail.address, web3.utils.toWei("10000", "ether"), {from: accounts[5]});
        const allowance = await credits.allowance(accounts[5], mail.address);

        let mailFeedInfo = await mailFeeds.getInfo("0x0000000000000000000000000000000000000000", accounts[5], 1);
        let mailFeedAddress = mailFeedInfo[2];

        assert.equal(allowance, web3.utils.toWei("10000", "ether"), "allowance is correct");

        const receipt = await mail.renewMailFeeds([mailFeedAddress], {from: accounts[5]});
        const tx = await web3.eth.getTransaction(receipt.tx);
        const timestamp = (await web3.eth.getBlock(tx.blockNumber)).timestamp;

        const mailFeedTotals = await mailFeeds.getTotals(accounts[2], 0, LENGTH);
        const totalMailFeeds = mailFeedTotals[0];

        mailFeedInfo = await mailFeeds.getInfo(mailFeedAddress, accounts[5], 1);
        const mailFeed = mailFeedInfo[0];
        const expiryTime = mailFeed[3];

        assert.equal(expiryTime, (new BN(timestamp.toString())).add(new BN(MAIL_FEED_EXPIRY_TIME.toString())).toString(), "expiryTime is correct");

        const feedContract = await Feed.at(mailFeedAddress);
        const feedInfo = await feedContract.getInfo();
        const totalSubscribers = feedInfo[3];
        const subscribers = await feedContract.getSubscribers(totalSubscribers);

        assert.equal(subscribers.length, 0, "subscribers.length is correct");

        mailFeedAddress = await mailFeeds.getFeeds("0x0000000000000000000000000000000000000000", 1, 1, LENGTH, false, 0);

        assert.equal(totalMailFeeds, 2, "totalMailFeeds is correct");
        assert.notEqual(mailFeedAddress[0], "0x0000000000000000000000000000000000000000", "mailFeedAddress is correct");
    });

    it("subscribe 1", async () => {
        const mail = await MailERC721.deployed();
        const mailFeedsAddress = await mail.getMailFeedsAddress();
        const mailFeeds = await MailFeeds.at(mailFeedsAddress);

        const mailFeedInfo = await mailFeeds.getInfo("0x0000000000000000000000000000000000000000", accounts[5], 1);
        const mailFeedAddress = mailFeedInfo[2];
        const feedContract = await Feed.at(mailFeedAddress);

        await feedContract.subscribe({from: accounts[1], value: web3.utils.toWei("1", "ether")});
        await feedContract.subscribe({from: accounts[2], value: web3.utils.toWei("1", "ether")});
        await feedContract.subscribe({from: accounts[3], value: web3.utils.toWei("1", "ether")});

        const feedInfo = await feedContract.getInfo();
        const totalSubscribers = feedInfo[3];
        const subscribers = await feedContract.getSubscribers(totalSubscribers);
        assert.equal(subscribers.length, 3, "subscribers.length is correct");

        let subscriptions = await mail.getAddresses(accounts[1], 0, 1, OPTION_SUBSCRIPTIONS);
        assert.equal(subscriptions.length, 1, "subscriptions 0 is correct");
        assert.equal(subscriptions[0], mailFeedAddress, "subscriptions 1 is correct");
        subscriptions = await mail.getAddresses(accounts[2], 0, 1, OPTION_SUBSCRIPTIONS);
        assert.equal(subscriptions[0], mailFeedAddress, "subscriptions 2 is correct");
        subscriptions = await mail.getAddresses(accounts[3], 0, 1, OPTION_SUBSCRIPTIONS);
        assert.equal(subscriptions[0], mailFeedAddress, "subscriptions 3 is correct");
        subscriptions = await mail.getAddresses(accounts[4], 0, 1, OPTION_SUBSCRIPTIONS);
        assert.equal(subscriptions.length, 1, "subscriptions 4 is correct");

        let mailInfo = await mail.getMailInfo(accounts[1], 0, 0);
        let totalSubscriptions = mailInfo[7];
        let totalUnsubscriptions = mailInfo[8];

        assert.equal(totalSubscriptions, 1, "totalSubscriptions 1 is correct");
        assert.equal(totalUnsubscriptions, 0, "totalUnsubscriptions 1 is correct");

        mailInfo = await mail.getMailInfo(accounts[2], 0, 0);
        totalSubscriptions = mailInfo[7];
        totalUnsubscriptions = mailInfo[8];

        assert.equal(totalSubscriptions, 1, "totalSubscriptions 2 is correct");
        assert.equal(totalUnsubscriptions, 0, "totalUnsubscriptions 2 is correct");

        mailInfo = await mail.getMailInfo(accounts[3], 0, 0);
        totalSubscriptions = mailInfo[7];
        totalUnsubscriptions = mailInfo[8];

        assert.equal(totalSubscriptions, 1, "totalSubscriptions 3 is correct");
        assert.equal(totalUnsubscriptions, 0, "totalUnsubscriptions 3 is correct");
    });

    it("cannot sendFeed 1", async () => {
        return MailERC721.deployed().then(async contract => {
            const mailFeedsAddress = await contract.getMailFeedsAddress();
            const mailFeeds = await MailFeeds.at(mailFeedsAddress);
            const mailFeedInfo = await mailFeeds.getInfo("0x0000000000000000000000000000000000000000", accounts[5], 1);
            const mailFeedAddress = mailFeedInfo[2];

            return await contract.sendFeed(mailFeedAddress,[accounts[1], accounts[2], accounts[3]],
                ["mailx.com","maily.com","mailz.com"], {from: accounts[6]});
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

        const mailFeedInfo = await mailFeeds.getInfo("0x0000000000000000000000000000000000000000", accounts[5], 1);
        const mailFeedAddress = mailFeedInfo[2];

        const before0 = await credits.balanceOf(accounts[5]);
        const before1 = await web3.eth.getBalance(accounts[1]);
        const before2 = await web3.eth.getBalance(accounts[2]);
        const before3 = await web3.eth.getBalance(accounts[3]);
        const before4 = await web3.eth.getBalance(accounts[5]);

        const receipt = await contract.sendFeed(mailFeedAddress,[accounts[1], accounts[2], accounts[3]],
            ["mailx.com","maily.com","mailz.com"], {from: accounts[5]});
        let tx = await web3.eth.getTransaction(receipt.tx);
        let totalGas = (new BN(receipt.receipt.gasUsed)).mul(new BN(tx.gasPrice));

        const after0 = await credits.balanceOf(accounts[5]);
        const after1 = await web3.eth.getBalance(accounts[1]);
        const after2 = await web3.eth.getBalance(accounts[2]);
        const after3 = await web3.eth.getBalance(accounts[3]);
        const after4 = await web3.eth.getBalance(accounts[5]);

        assert.equal(after0, before0.toString(), "after0 is correct");
        assert.equal(after1, before1.toString(), "after1 is correct");
        assert.equal(after2, before2.toString(), "after2 is correct");
        assert.equal(after3, before3.toString(), "after3 is correct");
        assert.equal(after4, (new BN(before4)).sub((new BN(totalGas))).toString(), 'after4 is correct');

        let event = receipt.logs[1].args;
        assert.equal(event.from, accounts[5].toString(), 'from is correct');
        assert.equal(event.to, accounts[1].toString(), 'to is correct');
        event = receipt.logs[3].args;
        assert.equal(event.from, accounts[5].toString(), 'from is correct');
        assert.equal(event.to, accounts[2].toString(), 'to is correct');
        event = receipt.logs[5].args;
        assert.equal(event.from, accounts[5].toString(), 'from is correct');
        assert.equal(event.to, accounts[3].toString(), 'to is correct');

        let mailInfo = await contract.getMailInfo(accounts[1], 2, OPTION_INBOX);
        let uri = mailInfo[2];
        assert.equal(uri, "mailx.com", "mail from is correct");

        mailInfo = await contract.getMailInfo(accounts[2], 2, OPTION_INBOX);
        uri = mailInfo[2];
        assert.equal(uri, "maily.com", "mail from is correct");

        mailInfo = await contract.getMailInfo(accounts[3], 2, OPTION_INBOX);
        uri = mailInfo[2];
        assert.equal(uri, "mailz.com", "mail from is correct");
    });

    it("cannot sendFeed 2", async () => {
        return MailERC721.deployed().then(async contract => {
            const mailFeedsAddress = await contract.getMailFeedsAddress();
            const mailFeeds = await MailFeeds.at(mailFeedsAddress);
            const mailFeedInfo = await mailFeeds.getInfo("0x0000000000000000000000000000000000000000", accounts[5], 1);
            const mailFeedAddress = mailFeedInfo[2];
            const feedContract = await Feed.at(mailFeedAddress);
            const info = await feedContract.getInfo();
            const timeInSecs = info[0];
            await time.increase(timeInSecs);//passed 15 days

            return await contract.sendFeed(mailFeedAddress,[accounts[1], accounts[2], accounts[3]],
                ["mailx.com","maily.com","mailz.com"], {from: accounts[5]});
        }).then(() => {
            assert.ok(false);
        }, e => {
            assert.ok(true);
            console.log(e.reason);
        });
    });

    it("cannot withdrawEther", async () => {
        return Feed.deployed().then(async contract => {
            return await contract.withdrawEther(web3.utils.toWei("1", "ether"), {from: accounts[5]});
        }).then(() => {
            assert.ok(false);
        }, e => {
            assert.ok(true);
            console.log(e.reason);
        });
    });

    it("withdrawEther", async () => {
        const mail = await MailERC721.deployed();
        const mailFeedsAddress = await mail.getMailFeedsAddress();
        const mailFeeds = await MailFeeds.at(mailFeedsAddress);

        const mailFeedInfo = await mailFeeds.getInfo("0x0000000000000000000000000000000000000000", accounts[5], 1);
        const mailFeedAddress = mailFeedInfo[2];
        const before1 = await web3.eth.getBalance(accounts[5]);
        const before2 = await web3.eth.getBalance(mailFeedAddress);
        const feedContract = await Feed.at(mailFeedAddress);

        const receipt = await feedContract.withdrawEther(web3.utils.toWei("1", "ether"), {from: accounts[5]});
        const tx = await web3.eth.getTransaction(receipt.tx);
        const totalGas = (new BN(receipt.receipt.gasUsed)).mul(new BN(tx.gasPrice));

        const after1 = await web3.eth.getBalance(accounts[5]);
        const after2 = await web3.eth.getBalance(mailFeedAddress);

        assert.equal(after1, (new BN(before1.toString())).add(new BN(web3.utils.toWei("1", "ether").toString())).sub(new BN(totalGas.toString())).toString(), "after1 is correct");
        assert.equal(after2, (new BN(before2.toString())).sub(new BN(web3.utils.toWei("1", "ether").toString())).toString(), "after2 is correct");
    });

    it("cannot sendFeed 3", async () => {
        return MailERC721.deployed().then(async contract => {
            const mailFeedsAddress = await contract.getMailFeedsAddress();
            const mailFeeds = await MailFeeds.at(mailFeedsAddress);
            const mailFeedInfo = await mailFeeds.getInfo("0x0000000000000000000000000000000000000000", accounts[5], 1);
            const mailFeedAddress = mailFeedInfo[2];

            return await contract.sendFeed(mailFeedAddress,[accounts[1], accounts[2], accounts[3]],
                ["mailx.com","maily.com","mailz.com"], {from: accounts[5]});
        }).then(() => {
            assert.ok(false);
        }, e => {
            assert.ok(true);
            console.log(e.reason);
        });
    });

    it("deleteMailFeeds", async () => {
        const mail = await MailERC721.deployed();
        const mailFeedsAddress = await mail.getMailFeedsAddress();
        const mailFeeds = await MailFeeds.at(mailFeedsAddress);

        let mailFeedInfo = await mailFeeds.getInfo("0x0000000000000000000000000000000000000000", accounts[5], 0);
        let mailFeedAddress = mailFeedInfo[2];

        await mailFeeds.deleteMailFeeds([mailFeedAddress], {from: accounts[5]});

        const mailFeedTotals = await mailFeeds.getTotals(accounts[5], 0, LENGTH);
        const totalMailFeeds = mailFeedTotals[0];
        const totalDeletedMailFeeds = mailFeedTotals[1];

        mailFeedInfo = await mailFeeds.getInfo(mailFeedAddress, accounts[5], 0);
        const afterMailFeed = mailFeedInfo[0];
        const totalMailFeedsByOwner = mailFeedInfo[1];

        assert.equal(afterMailFeed[0], "", "afterMailFeed[0] is correct");
        assert.equal(afterMailFeed[1], "", "afterMailFeed[1] is correct");
        assert.equal(afterMailFeed[2], "0x0000000000000000000000000000000000000000", "afterMailFeed[2] is correct");
        assert.equal(afterMailFeed[3], 0, "afterMailFeed[3] is correct");
        assert.equal(totalMailFeedsByOwner, 1, "totalMailFeedsByOwner is correct");

        mailFeedAddress = await mailFeeds.getFeeds("0x0000000000000000000000000000000000000000", 0, 1, LENGTH, false, 0);

        assert.equal(totalMailFeeds, 2, "totalMailFeeds is correct");
        assert.equal(totalDeletedMailFeeds, 1, "totalDeletedMailFeeds is correct");
        assert.notEqual(mailFeedAddress[0], "0x0000000000000000000000000000000000000000", "mailFeedAddress is correct");
    });

    it("renewMailFeed 3", async () => {
        const credits = await CreditsERC20.deployed();
        const mail = await MailERC721.deployed();
        const mailFeedsAddress = await mail.getMailFeedsAddress();
        const mailFeeds = await MailFeeds.at(mailFeedsAddress);

        await credits.approve(mail.address, web3.utils.toWei("10000", "ether"), {from: accounts[5]});
        const allowance = await credits.allowance(accounts[5], mail.address);

        let mailFeedInfo = await mailFeeds.getInfo("0x0000000000000000000000000000000000000000", accounts[5], 1);
        let mailFeedAddress = mailFeedInfo[2];

        const feedContract = await Feed.at(mailFeedAddress);
        const feedInfo = await feedContract.getInfo();
        const totalSubscribers = feedInfo[3];
        const subscribers = await feedContract.getSubscribers(totalSubscribers);
        const info = await feedContract.getInfo();
        const timeInSecs = info[0];
        await time.increase(timeInSecs);//passed 15 days

        assert.equal(allowance, web3.utils.toWei("10000", "ether"), "allowance is correct");

        const receipt = await mail.renewMailFeeds([mailFeedAddress], {from: accounts[5]});
        const tx = await web3.eth.getTransaction(receipt.tx);
        const timestamp = (await web3.eth.getBlock(tx.blockNumber)).timestamp;

        mailFeedInfo = await mailFeeds.getInfo(mailFeedAddress, accounts[5], 1);
        const mailFeed = mailFeedInfo[0];
        const expiryTime = mailFeed[3];

        assert.equal(expiryTime, (new BN(timestamp.toString())).add(new BN(MAIL_FEED_EXPIRY_TIME.toString())).toString(), "expiryTime is correct");
        assert.equal(subscribers.length, 3, "subscribers.length is correct");

        const mailFeedTotals = await mailFeeds.getTotals(accounts[5], 0, LENGTH);
        const totalMailFeeds = mailFeedTotals[0];

        mailFeedAddress = await mailFeeds.getFeeds("0x0000000000000000000000000000000000000000", 1, 1, LENGTH, false, 0);

        assert.equal(totalMailFeeds, 2, "totalMailFeeds is correct");
        assert.notEqual(mailFeedAddress[0], "0x0000000000000000000000000000000000000000", "mailFeedAddress is correct");
    });

    it("subscribe 2", async () => {
        const mail = await MailERC721.deployed();
        const mailFeedsAddress = await mail.getMailFeedsAddress();
        const mailFeeds = await MailFeeds.at(mailFeedsAddress);

        let mailFeedInfo = await mailFeeds.getInfo("0x0000000000000000000000000000000000000000", accounts[5], 1);
        let mailFeedAddress = mailFeedInfo[2];

        const feedContract = await Feed.at(mailFeedAddress);

        await feedContract.subscribe({from: accounts[1], value: web3.utils.toWei("1", "ether")});
        await feedContract.subscribe({from: accounts[2], value: web3.utils.toWei("1", "ether")});
        await feedContract.subscribe({from: accounts[3], value: web3.utils.toWei("1", "ether")});

        const feedInfo = await feedContract.getInfo();
        const totalSubscribers = feedInfo[3];
        const subscribers = await feedContract.getSubscribers(totalSubscribers);
        assert.equal(subscribers.length, 3, "subscribers.length is correct");

        let subscriptions = await mail.getAddresses(accounts[1], 0, 1, OPTION_SUBSCRIPTIONS);
        assert.equal(subscriptions.length, 1, "subscriptions 0 is correct");
        assert.equal(subscriptions[0], mailFeedAddress, "subscriptions 1 is correct");
        subscriptions = await mail.getAddresses(accounts[2], 0, 1, OPTION_SUBSCRIPTIONS);
        assert.equal(subscriptions[0], mailFeedAddress, "subscriptions 2 is correct");
        subscriptions = await mail.getAddresses(accounts[3], 0, 1, OPTION_SUBSCRIPTIONS);
        assert.equal(subscriptions[0], mailFeedAddress, "subscriptions 3 is correct");
        subscriptions = await mail.getAddresses(accounts[4], 0, 1, OPTION_SUBSCRIPTIONS);
        assert.equal(subscriptions.length, 1, "subscriptions 4 is correct");

        let mailInfo = await mail.getMailInfo(accounts[1], 0, 0);
        let totalSubscriptions = mailInfo[7];
        let totalUnsubscriptions = mailInfo[8];

        assert.equal(totalSubscriptions, 1, "totalSubscriptions 1 is correct");
        assert.equal(totalUnsubscriptions, 0, "totalUnsubscriptions 1 is correct");

        mailInfo = await mail.getMailInfo(accounts[2], 0, 0);
        totalSubscriptions = mailInfo[7];
        totalUnsubscriptions = mailInfo[8];

        assert.equal(totalSubscriptions, 1, "totalSubscriptions 2 is correct");
        assert.equal(totalUnsubscriptions, 0, "totalUnsubscriptions 2 is correct");

        mailInfo = await mail.getMailInfo(accounts[3], 0, 0);
        totalSubscriptions = mailInfo[7];
        totalUnsubscriptions = mailInfo[8];

        assert.equal(totalSubscriptions, 1, "totalSubscriptions 3 is correct");
        assert.equal(totalUnsubscriptions, 0, "totalUnsubscriptions 3 is correct");
    });

    it("cannot sendFeed 4", async () => {
        return MailERC721.deployed().then(async contract => {
            const mailFeedsAddress = await contract.getMailFeedsAddress();
            const mailFeeds = await MailFeeds.at(mailFeedsAddress);
            let mailFeedInfo = await mailFeeds.getInfo("0x0000000000000000000000000000000000000000", accounts[5], 1);
            let mailFeedAddress = mailFeedInfo[2];

            const feedContract = await Feed.at(mailFeedAddress);
            await feedContract.blockAddress(accounts[1], true, {from: accounts[5]});

            return await contract.sendFeed(mailFeedAddress,[accounts[1], accounts[2], accounts[3]],
                ["mailx.com","maily.com","mailz.com"], {from: accounts[5]});
        }).then(() => {
            assert.ok(false);
        }, e => {
            assert.ok(true);
            console.log(e.reason);
        });
    });

    it("cannot subscribe", async () => {
        return MailERC721.deployed().then(async contract => {
            const mailFeedsAddress = await contract.getMailFeedsAddress();
            const mailFeeds = await MailFeeds.at(mailFeedsAddress);
            let mailFeedInfo = await mailFeeds.getInfo("0x0000000000000000000000000000000000000000", accounts[5], 1);
            let mailFeedAddress = mailFeedInfo[2];
            const feedContract = await Feed.at(mailFeedAddress);

            return await feedContract.subscribe({from: accounts[1], value: web3.utils.toWei("1", "ether")});
        }).then(() => {
            assert.ok(false);
        }, e => {
            assert.ok(true);
            console.log(e.reason);
        });
    });

    it("unsubscribe 1", async () => {
        const mail = await MailERC721.deployed();
        const mailFeedsAddress = await mail.getMailFeedsAddress();
        const mailFeeds = await MailFeeds.at(mailFeedsAddress);

        let mailFeedInfo = await mailFeeds.getInfo("0x0000000000000000000000000000000000000000", accounts[5], 1);
        let mailFeedAddress = mailFeedInfo[2];
        const feedContract = await Feed.at(mailFeedAddress);

        await feedContract.unsubscribe({from: accounts[1]});
        await feedContract.unsubscribe({from: accounts[2]});
        await feedContract.unsubscribe({from: accounts[3]});

        const feedInfo = await feedContract.getInfo();
        const totalSubscribers = feedInfo[3];
        const subscribers = await feedContract.getSubscribers(totalSubscribers);
        assert.equal(subscribers.length, 3, "subscribers.length is correct");

        let subscriptions = await mail.getAddresses(accounts[1], 0, 2, OPTION_SUBSCRIPTIONS);
        assert.equal(subscriptions.length, 2, "subscriptions 1 is correct");
        assert.equal(subscriptions[0], "0x0000000000000000000000000000000000000000", "subscriptions 2 is correct");
        assert.equal(subscriptions[1], "0x0000000000000000000000000000000000000000", "subscriptions 3 is correct");
        subscriptions = await mail.getAddresses(accounts[2], 0, 2, OPTION_SUBSCRIPTIONS);
        assert.equal(subscriptions.length, 2, "subscriptions 4 is correct");
        assert.equal(subscriptions[0], "0x0000000000000000000000000000000000000000", "subscriptions 5 is correct");
        assert.equal(subscriptions[1], "0x0000000000000000000000000000000000000000", "subscriptions 6 is correct");
        subscriptions = await mail.getAddresses(accounts[3], 0, 2, OPTION_SUBSCRIPTIONS);
        assert.equal(subscriptions.length, 2, "subscriptions 7 is correct");
        assert.equal(subscriptions[0], "0x0000000000000000000000000000000000000000", "subscriptions 8 is correct");
        assert.equal(subscriptions[1], "0x0000000000000000000000000000000000000000", "subscriptions 9 is correct");

        let mailInfo = await mail.getMailInfo(accounts[1], 0, 0);
        let totalSubscriptions = mailInfo[7];
        let totalUnsubscriptions = mailInfo[8];

        assert.equal(totalSubscriptions, 1, "totalSubscriptions 1 is correct");
        assert.equal(totalUnsubscriptions, 1, "totalUnsubscriptions 1 is correct");

        mailInfo = await mail.getMailInfo(accounts[2], 0, 0);
        totalSubscriptions = mailInfo[7];
        totalUnsubscriptions = mailInfo[8];

        assert.equal(totalSubscriptions, 1, "totalSubscriptions 2 is correct");
        assert.equal(totalUnsubscriptions, 1, "totalUnsubscriptions 2 is correct");

        mailInfo = await mail.getMailInfo(accounts[3], 0, 0);
        totalSubscriptions = mailInfo[7];
        totalUnsubscriptions = mailInfo[8];

        assert.equal(totalSubscriptions, 1, "totalSubscriptions 3 is correct");
        assert.equal(totalUnsubscriptions, 1, "totalUnsubscriptions 3 is correct");
    });

    it("createMailFeed 3", async () => {
        const credits = await CreditsERC20.deployed();
        const mail = await MailERC721.deployed();
        const mailFeedsAddress = await mail.getMailFeedsAddress();
        const mailFeeds = await MailFeeds.at(mailFeedsAddress);

        await credits.approve(mail.address, web3.utils.toWei("10000", "ether"), {from: accounts[5]});

        const allowance = await credits.allowance(accounts[5], mail.address);
        assert.equal(allowance, web3.utils.toWei("10000", "ether"), "allowance is correct");

        const receipt = await mail.createMailFeed(["Feed3", "Description3"], FEED_EXPIRY_TIME, "0x0000000000000000000000000000000000000000",
            web3.utils.toWei("1", "ether"), 1, {from: accounts[5]});
        const tx = await web3.eth.getTransaction(receipt.tx);
        const timestamp = (await web3.eth.getBlock(tx.blockNumber)).timestamp;

        const mailFeedTotals = await mailFeeds.getTotals(accounts[2], 0, LENGTH);
        const totalMailFeeds = mailFeedTotals[0];

        let mailFeedInfo = await mailFeeds.getInfo("0x0000000000000000000000000000000000000000", accounts[5], 2);
        const totalMailFeedsByOwner = mailFeedInfo[1];
        let mailFeedAddress = mailFeedInfo[2];

        assert.equal(totalMailFeedsByOwner, 2, "totalMailFeedsByOwner is correct");
        assert.equal(mailFeedAddress, "0x0000000000000000000000000000000000000000", "mailFeedAddress is correct");

        mailFeedInfo = await mailFeeds.getInfo("0x0000000000000000000000000000000000000000", accounts[5], 1);
        mailFeedAddress = mailFeedInfo[2];
        mailFeedInfo = await mailFeeds.getInfo(mailFeedAddress, accounts[5], 1);
        const mailFeed = mailFeedInfo[0];

        assert.equal(mailFeed[0], "Feed3", "mailFeed[0] is correct");
        assert.equal(mailFeed[1], "Description3", "mailFeed[1] is correct");
        assert.equal(mailFeed[2], accounts[5], "mailFeed[2] is correct");
        assert.equal(mailFeed[3], (new BN(timestamp.toString())).add(new BN(MAIL_FEED_EXPIRY_TIME.toString())), "mailFeed[3] is correct");

        mailFeedAddress = await mailFeeds.getFeeds("0x0000000000000000000000000000000000000000", 2, 1, LENGTH, false, 0);
        const feedContract = await Feed.at(mailFeedAddress[0]);
        const info = await feedContract.getInfo();
        const timeInSecs = info[0];
        const maxNumberSubscribers = info[4];

        assert.equal(totalMailFeeds, 3, "totalMailFeeds is correct");
        assert.notEqual(mailFeedAddress[0], "0x0000000000000000000000000000000000000000", "mailFeedAddress is correct");
        assert.equal(timeInSecs, FEED_EXPIRY_TIME, "timeInSecs is correct");
        assert.equal(maxNumberSubscribers, 1, "maxNumberSubscribers is correct");
    });

    it("subscribe 3", async () => {
        const mail = await MailERC721.deployed();
        const mailFeedsAddress = await mail.getMailFeedsAddress();
        const mailFeeds = await MailFeeds.at(mailFeedsAddress);

        let mailFeedInfo = await mailFeeds.getInfo("0x0000000000000000000000000000000000000000", accounts[5], 1);
        let mailFeedAddress = mailFeedInfo[2];

        const feedContract = await Feed.at(mailFeedAddress);

        await feedContract.subscribe({from: accounts[1], value: web3.utils.toWei("1", "ether")});

        const feedInfo = await feedContract.getInfo();
        const totalSubscribers = feedInfo[3];
        const subscribers = await feedContract.getSubscribers(totalSubscribers);
        assert.equal(subscribers.length, 1, "subscribers.length is correct");

        let subscriptions = await mail.getAddresses(accounts[1], 0, 2, OPTION_SUBSCRIPTIONS);
        assert.equal(subscriptions.length, 2, "subscriptions 0 is correct");
        assert.equal(subscriptions[0], mailFeedAddress, "subscriptions 1 is correct");
        assert.equal(subscriptions[1], "0x0000000000000000000000000000000000000000", "subscriptions 2 is correct");

        let mailInfo = await mail.getMailInfo(accounts[1], 0, 0);
        let totalSubscriptions = mailInfo[7];
        let totalUnsubscriptions = mailInfo[8];

        assert.equal(totalSubscriptions, 2, "totalSubscriptions 1 is correct");
        assert.equal(totalUnsubscriptions, 1, "totalUnsubscriptions 1 is correct");

        const info = await feedContract.getInfo();
        const countSubscribers = info[5];

        assert.equal(countSubscribers, 1, "countSubscribers is correct");
    });

    it("cannot subscribe 2", async () => {
        return MailERC721.deployed().then(async contract => {
            const mailFeedsAddress = await contract.getMailFeedsAddress();
            const mailFeeds = await MailFeeds.at(mailFeedsAddress);
            let mailFeedInfo = await mailFeeds.getInfo("0x0000000000000000000000000000000000000000", accounts[5], 1);
            let mailFeedAddress = mailFeedInfo[2];
            const feedContract = await Feed.at(mailFeedAddress);

            return await feedContract.subscribe({from: accounts[1], value: web3.utils.toWei("1", "ether")});
        }).then(() => {
            assert.ok(false);
        }, e => {
            assert.ok(true);
            console.log(e.reason);
        });
    });

    it("unsubscribe 2", async () => {
        const mail = await MailERC721.deployed();
        const mailFeedsAddress = await mail.getMailFeedsAddress();
        const mailFeeds = await MailFeeds.at(mailFeedsAddress);

        let mailFeedInfo = await mailFeeds.getInfo("0x0000000000000000000000000000000000000000", accounts[5], 1);
        let mailFeedAddress = mailFeedInfo[2];
        const feedContract = await Feed.at(mailFeedAddress);

        await feedContract.unsubscribe({from: accounts[1]});

        const feedInfo = await feedContract.getInfo();
        const totalSubscribers = feedInfo[3];
        const subscribers = await feedContract.getSubscribers(totalSubscribers);
        assert.equal(subscribers.length, 1, "subscribers.length is correct");

        let subscriptions = await mail.getAddresses(accounts[1], 0, 2, OPTION_SUBSCRIPTIONS);
        assert.equal(subscriptions.length, 2, "subscriptions 1 is correct");
        assert.equal(subscriptions[0], "0x0000000000000000000000000000000000000000", "subscriptions 2 is correct");
        assert.equal(subscriptions[1], "0x0000000000000000000000000000000000000000", "subscriptions 3 is correct");

        let mailInfo = await mail.getMailInfo(accounts[1], 0, 0);
        let totalSubscriptions = mailInfo[7];
        let totalUnsubscriptions = mailInfo[8];

        assert.equal(totalSubscriptions, 2, "totalSubscriptions 1 is correct");
        assert.equal(totalUnsubscriptions, 2, "totalUnsubscriptions 1 is correct");

        const info = await feedContract.getInfo();
        const countSubscribers = info[5];

        assert.equal(countSubscribers, 0, "countSubscribers is correct");
    });

    it("subscribe 4", async () => {
        const mail = await MailERC721.deployed();
        const mailFeedsAddress = await mail.getMailFeedsAddress();
        const mailFeeds = await MailFeeds.at(mailFeedsAddress);

        let mailFeedInfo = await mailFeeds.getInfo("0x0000000000000000000000000000000000000000", accounts[5], 1);
        let mailFeedAddress = mailFeedInfo[2];

        const feedContract = await Feed.at(mailFeedAddress);

        await feedContract.subscribe({from: accounts[1], value: web3.utils.toWei("1", "ether")});

        const feedInfo = await feedContract.getInfo();
        const totalSubscribers = feedInfo[3];
        const subscribers = await feedContract.getSubscribers(totalSubscribers);
        assert.equal(subscribers.length, 2, "subscribers.length is correct");

        let subscriptions = await mail.getAddresses(accounts[1], 0, 3, OPTION_SUBSCRIPTIONS);
        assert.equal(subscriptions.length, 3, "subscriptions 0 is correct");
        assert.equal(subscriptions[0], mailFeedAddress, "subscriptions 1 is correct");
        assert.equal(subscriptions[1], "0x0000000000000000000000000000000000000000", "subscriptions 2 is correct");
        assert.equal(subscriptions[2], "0x0000000000000000000000000000000000000000", "subscriptions 3 is correct");

        let mailInfo = await mail.getMailInfo(accounts[1], 0, 0);
        let totalSubscriptions = mailInfo[7];
        let totalUnsubscriptions = mailInfo[8];

        assert.equal(totalSubscriptions, 3, "totalSubscriptions 1 is correct");
        assert.equal(totalUnsubscriptions, 2, "totalUnsubscriptions 1 is correct");

        const info = await feedContract.getInfo();
        const countSubscribers = info[5];

        assert.equal(countSubscribers, 1, "countSubscribers is correct");
    });

    it("searchFeed", async () => {
        const mail = await MailERC721.deployed();
        const mailFeedsAddress = await mail.getMailFeedsAddress();
        const mailFeeds = await MailFeeds.at(mailFeedsAddress);

        let address = await mailFeeds.searchFeed("Feed1", LENGTH);
        assert.equal(address, "0x0000000000000000000000000000000000000000", "address 1 is correct");

        address = await mailFeeds.searchFeed("Description2", LENGTH);
        assert.notEqual(address, "0x0000000000000000000000000000000000000000", "address 2 is correct");

        address = await mailFeeds.searchFeed("3", LENGTH);
        assert.notEqual(address, "0x0000000000000000000000000000000000000000", "address 3 is correct");

        const mailFeedInfo = await mailFeeds.getInfo("0x0000000000000000000000000000000000000000", accounts[5], 2);
        const mailFeedAddress = mailFeedInfo[2];
        assert.equal(mailFeedAddress, "0x0000000000000000000000000000000000000000", "mailFeedAddress is correct");
    });

    it("cannot setArgs", async () => {
        return MailERC721.deployed().then(async contract => {
            const mailFeedsAddress = await contract.getMailFeedsAddress();
            const mailFeeds = await MailFeeds.at(mailFeedsAddress);
            const mailFeedInfo = await mailFeeds.getInfo("0x0000000000000000000000000000000000000000", accounts[5], 0);
            const mailFeedAddress = mailFeedInfo[2];

            return await mailFeeds.setArgs(mailFeedAddress, ["FeedA","DescriptionA"],{from: accounts[0]});
        }).then(() => {
            assert.ok(false);
        }, e => {
            assert.ok(true);
            console.log(e.reason);
        });
    });

    it("setArgs", async () => {
        const mail = await MailERC721.deployed();
        const mailFeedsAddress = await mail.getMailFeedsAddress();
        const mailFeeds = await MailFeeds.at(mailFeedsAddress);

        let mailFeedInfo = await mailFeeds.getInfo("0x0000000000000000000000000000000000000000", accounts[5], 1);
        let mailFeedAddress = mailFeedInfo[2];

        await mailFeeds.setArgs(mailFeedAddress,["FeedA","DescriptionA"],{from: accounts[5]});

        let address = await mailFeeds.searchFeed("FeedA", LENGTH);

        assert.equal(address, mailFeedAddress, "address 1 is correct");

        address = await mailFeeds.searchFeed("3", LENGTH);

        mailFeedInfo = await mailFeeds.getInfo("0x0000000000000000000000000000000000000000", accounts[5], 2);
        mailFeedAddress = mailFeedInfo[2];

        assert.equal(address, mailFeedAddress, "address 3 is correct");
    });
});