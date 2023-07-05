const Feed = artifacts.require("Feed");
const FeedExtension = artifacts.require("FeedExtension");
const MailERC721 = artifacts.require("MailERC721");
const CreditsERC20 = artifacts.require("CreditsERC20");
const FeedAttack_2 = artifacts.require("FeedAttack_2");
const FeedAttack_2_Aux = artifacts.require("FeedAttack_2_Aux");
const MailFeeds = artifacts.require("MailFeeds");
const BN = web3.utils.BN;

contract("FeedAttack_2", accounts => {
    it("No reentrancy", async () => {
        const attack = await FeedAttack_2.deployed();
        const credits = await CreditsERC20.deployed();
        const aux = await FeedAttack_2_Aux.deployed();
        const ETHER_DECIMALS = 1000000000000000000;

        return MailERC721.deployed().then(async mailContract => {
            const owner = accounts[0];
            const user = accounts[1];
            const attacker = accounts[2];
            const mailFeedsAddress = await mailContract.getMailFeedsAddress();
            const mailFeeds = await MailFeeds.at(mailFeedsAddress);

            const attackBeforeBalance = (parseInt(await web3.eth.getBalance(attack.address)) / ETHER_DECIMALS);
            console.log("before transfer Attack balance "+attackBeforeBalance);

            //the owner approves credits to the mail
            await credits.approve(mailContract.address, web3.utils.toWei("10000", "ether"), {from: owner});

            //the owner creates the mail feed
            await mailContract.createMailFeed(["Feed", "Description"],2592000, '0x0000000000000000000000000000000000000000', web3.utils.toWei("1", "ether"), 0, {from: owner});

            const mailFeedInfo = await mailFeeds.getInfo('0x0000000000000000000000000000000000000000', owner, 0);
            const mailFeedAddress = mailFeedInfo[2];
            await attack.setFeedAddress(mailFeedAddress);
            await attack.setAuxAddress(aux.address);
            const feedContract = await Feed.at(mailFeedAddress);

            //the owner (attacker) transfers ownership of the feed to the attacker contract
            await feedContract.transferOwnership(aux.address, {from: owner});

            //a user subscribes to the feed
            await feedContract.subscribe({from: user, value: web3.utils.toWei("1", "ether")});

            //the attacker subscribes to the feed
            await attack.subscribe({from: attacker, value: web3.utils.toWei("1", "ether")});

            //the attacker tries to steal more than 1 ether from the contract
            return await attack.attack({from: attacker});

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