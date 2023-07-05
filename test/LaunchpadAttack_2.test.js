const Launchpad = artifacts.require("Launchpad");
const CreditsERC20 = artifacts.require("CreditsERC20");
const LaunchpadAttack_2 = artifacts.require("LaunchpadAttack_2");
const BN = web3.utils.BN;

contract("LaunchpadAttack_2", accounts => {
    it("No reentrancy", async () => {
        const attack = await LaunchpadAttack_2.deployed();
        const credits = await CreditsERC20.deployed();

        return Launchpad.deployed().then(async launchpadContract => {
            const owner = accounts[0];
            const attacker = accounts[1];
            const user = accounts[2];

            const attackBeforeBalance = await web3.eth.getBalance(attack.address);
            console.log("before transfer Attack balance "+web3.utils.fromWei(attackBeforeBalance.toString(), "ether").toString());

            const creditsPrice = await launchpadContract.getCreditsPrice();

            //the owner approves 2 credits
            await credits.approve(launchpadContract.address, web3.utils.toWei("2", "ether"), {from: owner});

            //the owner deposits 2 credits to the contract
            await launchpadContract.depositToken(web3.utils.toWei("2", "ether"), {from: owner});

            //the attacker contract receives 1 credit
            await credits.transfer(attack.address, web3.utils.toWei("1", "ether"), {from: owner});

            //the attacker approves 1 credits
            await attack.approve(web3.utils.toWei("1", "ether"), {from: attacker});

            //the attacker deposits 1 credit to the contract
            await attack.depositToken(web3.utils.toWei("1", "ether"), {from: attacker});

            //a user buys 2 credits
            await launchpadContract.buyToken(web3.utils.toWei("2", "ether"), {from: user, value: creditsPrice.mul(new BN('2'))});

            //the attacker tries to steal the price of 2 credits from the contract
            return await attack.attack({from: attacker});

        }).then(async () => {
            const launchpadContract = await Launchpad.deployed();
            const creditsPrice = await launchpadContract.getCreditsPrice();
            const attackAfterBalance = await web3.eth.getBalance(attack.address);
            console.log("after hack Attack balance "+web3.utils.fromWei(attackAfterBalance.toString(), "ether").toString());
            assert.equal(attackAfterBalance, creditsPrice.toString(), "ERROR: REENTRANCY!");
        }, async e => {
            const attackAfterBalance = await web3.eth.getBalance(attack.address);
            console.log("after hack Attack balance "+web3.utils.fromWei(attackAfterBalance.toString(), "ether").toString());
            assert.ok(true);
            console.log(e.reason);
        });
    });
});