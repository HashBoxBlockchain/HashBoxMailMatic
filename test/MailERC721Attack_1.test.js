const MailERC721 = artifacts.require("MailERC721");
const MailERC721Attack_1 = artifacts.require("MailERC721Attack_1");
const CreditsERC20 = artifacts.require("CreditsERC20");
const BN = web3.utils.BN;

contract("MailERC721Attack_1", accounts => {
    it("No reentrancy", async () => {
        const attack = await MailERC721Attack_1.deployed();
        const credits = await CreditsERC20.deployed();
        const ETHER_DECIMALS = 1000000000000000000;

        return MailERC721.deployed().then(async contract => {
            const sender = accounts[0];
            const receiver = accounts[1];
            const attacker = accounts[2];

            const attackBeforeBalance = (parseInt(await web3.eth.getBalance(attack.address)) / ETHER_DECIMALS);
            console.log("before transfer Attack balance "+attackBeforeBalance);

            //the sender approves credits to the mail
            await credits.approve(contract.address, web3.utils.toWei("1", "ether"), {from: sender});

            //the sender sends credits to the attacker
            await credits.transfer(attack.address, web3.utils.toWei("1", "ether"), {from: sender});

            //the attacker approves credits to the mail
            await attack.approve(credits.address, {from: attacker});

            //a receiver creates hers/his mailbox
            await contract.methods['sendMail(address,string,string,uint256)'](receiver, "mailBoxUri", "mailUri", web3.utils.toWei("0", "ether"), {from: receiver});

            //a sender creates hers/his mailbox
            await contract.methods['sendMail(address,string,string,uint256)'](sender, "mailBoxUri", "mailUri", web3.utils.toWei("0", "ether"), {from: sender});

            //the sender sends a mail to the receiver, sending 5 ethers to the contract
            await contract.methods['sendMail(address,string,uint256)'](receiver, "mailUri", web3.utils.toWei("0", "ether"), {from: sender, value: web3.utils.toWei("5", "ether")});

            //the attacker tries to steal the 5 ethers from the contract
            return await attack.attack({from: attacker, value: web3.utils.toWei("1", "ether")});

        }).then(async () => {
            const attackAfterBalance = (parseInt(await web3.eth.getBalance(attack.address)) / ETHER_DECIMALS);
            console.log("after hack Attack balance "+attackAfterBalance);
            assert.equal(attackAfterBalance, 0, "ERROR: REENTRANCY!");
        }, async e => {
            const attackAfterBalance = (parseInt(await web3.eth.getBalance(attack.address)) / ETHER_DECIMALS);
            console.log("after hack Attack balance "+attackAfterBalance);
            assert.ok(true);
            console.log(e.reason);
        });
    });
});