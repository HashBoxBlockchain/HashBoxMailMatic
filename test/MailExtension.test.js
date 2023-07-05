const CreditsERC20 = artifacts.require("CreditsERC20");
const CreditsERC20Test = artifacts.require("CreditsERC20Test");
const MailERC721 = artifacts.require("MailERC721");
const MailExtension = artifacts.require("MailExtension");
const BN = web3.utils.BN;
const OPTION_INBOX = 0;
const OPTION_SENT = 1;

contract("MailExtension", accounts => {
    it("setExtension", async () => {
        const mail = await MailERC721.deployed();
        const extension = await MailExtension.deployed();

        await mail.setFee(extension.address, web3.utils.toWei("1", "ether"), false, "0x0000000000000000000000000000000000000000", false, {from: accounts[1]});

        const extensionInfo = await mail.getExtensionInfo(accounts[1]);
        assert.notEqual(extensionInfo[0], "0x0000000000000000000000000000000000000000", "extensionInfo[0] is correct");

        const mailBoxInfo = await mail.getMailBoxInfo(accounts[1]);
        const price = mailBoxInfo[2];
        assert.equal(price, web3.utils.toWei("1", "ether").toString(), "price is correct");
    });

    it("cannot sendMail 1", async () => {
        return MailERC721.deployed().then(async contract => {
            return await contract.methods['sendMail(address,string,string,uint256)'](accounts[1],
                "mailbox.com", "mail.com", web3.utils.toWei("1", "ether"), {from: accounts[0]});
        }).then(() => {
            assert.ok(false);
        }, e => {
            assert.ok(true);
            console.log(e.reason);
        });
    });

    it("cannot sendMail 2", async () => {
        return MailERC721.deployed().then(async contract => {
            return await contract.methods['sendMail(address,string,string,uint256)'](accounts[1],
                "mailbox.com", "mail.com", web3.utils.toWei("1", "ether"), {from: accounts[0], value: web3.utils.toWei("1", "ether")});
        }).then(() => {
            assert.ok(false);
        }, e => {
            assert.ok(true);
            console.log(e.reason);
        });
    });

    it("cannot sendMail 3", async () => {
        return MailERC721.deployed().then(async contract => {
            const tokenTest = await CreditsERC20Test.deployed();
            const extension = await MailExtension.deployed();
            await tokenTest.approve(extension.address, web3.utils.toWei("1", "ether"), {from: accounts[0]});

            return await contract.methods['sendMail(address,string,string,uint256)'](accounts[1],
                "mailbox.com", "mail.com", web3.utils.toWei("1", "ether"), {from: accounts[0]});
        }).then(() => {
            assert.ok(false);
        }, e => {
            assert.ok(true);
            console.log(e.reason);
        });
    });

    it("sendMail", async () => {
        const mail = await MailERC721.deployed();
        const token = await CreditsERC20.deployed();
        const extension = await MailExtension.deployed();

        const beforeFromBalance = await token.balanceOf(accounts[0]);
        const beforeToBalance = await token.balanceOf(accounts[1]);

        await token.approve(extension.address, web3.utils.toWei("1", "ether"), {from: accounts[0]});

        const receipt = await mail.methods['sendMail(address,string,string,uint256)'](accounts[1],
            "mailbox.com", "mail.com", web3.utils.toWei("1", "ether"), {from: accounts[0]});

        const afterFromBalance = await token.balanceOf(accounts[0]);
        const afterToBalance = await token.balanceOf(accounts[1]);

        const event = receipt.logs[2].args;
        assert.equal(event.tokenId, '1', 'id is correct');
        assert.equal(event.from, accounts[0].toString(), 'from is correct');
        assert.equal(event.to, accounts[1].toString(), 'to is correct');
        assert.equal(afterFromBalance, (new BN(beforeFromBalance)).sub(new BN(web3.utils.toWei("1", "ether"))).toString(), 'fromBalance is correct');
        assert.equal(afterToBalance, (new BN(beforeToBalance)).add(new BN(web3.utils.toWei("1", "ether"))).toString(), 'toBalance is correct');

        let mailInfo = await mail.getMailInfo(accounts[0], 1, OPTION_SENT);
        let uri = mailInfo[2];
        assert.equal(uri, "mail.com", "mail from is correct");
        mailInfo = await mail.getMailInfo(accounts[1], 1, OPTION_INBOX);
        uri = mailInfo[2];
        assert.equal(uri, "mail.com", "mail to is correct");

        const mailBoxInfo = await mail.getMailBoxInfo(accounts[1]);
        const price = mailBoxInfo[2];
        assert.equal(price, web3.utils.toWei("1", "ether").toString(), "price is correct");
    });
});