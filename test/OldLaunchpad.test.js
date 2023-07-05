const CreditsERC20 = artifacts.require("CreditsERC20");
const Launchpad = artifacts.require("Launchpad");
const BN = web3.utils.BN;
const {time} = require('@openzeppelin/test-helpers');

contract("Launchpad", accounts => {
    /*it("addSigner", async () => {
        const launchpad = await Launchpad.deployed();

        await launchpad.addSigner("0x10B8599e3b25E94fB5408B8613570edBeBaFa35c", {from: accounts[0]});

        const signer = await launchpad.getSigner(0);

        assert.equal(signer[0], "0x10B8599e3b25E94fB5408B8613570edBeBaFa35c", "signer[0] is correct");
        assert.equal(signer[1], 1, "signer[1] is correct");
    });

    it("cannot addSigner", async () => {
        return Launchpad.deployed().then(async contract => {
            return await contract.addSigner("0x10B8599e3b25E94fB5408B8613570edBeBaFa35c", {from: accounts[0]});
        }).then(() => {
            assert.ok(false);
        }, e => {
            assert.ok(true);
            console.log(e.reason);
        });
    });

    it("buyToken", async () => {
        const credits = await CreditsERC20.deployed();
        const launchpad = await Launchpad.deployed();

        const creditsValue = await launchpad.getCreditsPrice();
        const amount = web3.utils.toWei("1", "ether");
        const price = creditsValue;
        const nonce = parseInt(await launchpad.getNonce());
        const abiEncode = web3.eth.abi.encodeParameters(['uint256','uint256','uint256'],[amount, price, nonce]);
        const args = web3.utils.keccak256(abiEncode);
        const hash = await web3.eth.accounts.hashMessage(args);
        const signed = await web3.eth.accounts.sign(args, "fe1ad45afb3aab6af880e29783b2ad0101f39543376c9eadb828e3d3b7b06b71");

        await launchpad.buyToken(amount, price, hash, [signed.signature], {from: accounts[1], value: web3.utils.toWei("0.1", "ether")});

        const balance1 = await credits.balanceOf(accounts[0]);
        const balance2 = await credits.balanceOf(accounts[1]);
        const balance3 = await credits.balanceOf(Launchpad.address);

        assert.equal(balance1, web3.utils.toWei("9999999900", "ether"), "balance1 is correct");
        assert.equal(balance2, web3.utils.toWei("1", "ether"), "balance2 is correct");

        const rewardInterval = parseInt(await launchpad.getRewardInterval());
        await time.increase(rewardInterval);
        const payments = await launchpad.getTotalPayments(accounts[1]);
        const reward = await launchpad.getTotalReward(balance2, balance3, payments);

        assert.equal(reward, web3.utils.toWei("0.01", "ether"), "reward is correct");
    });*/
});