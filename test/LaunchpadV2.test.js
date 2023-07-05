const CreditsERC20 = artifacts.require("CreditsERC20");
const Launchpad = artifacts.require("Launchpad");
const BN = web3.utils.BN;
const {time} = require('@openzeppelin/test-helpers');

contract("Launchpad", accounts => {
    /*it("depositToken", async () => {
        const credits = await CreditsERC20.deployed();
        const launchpad = await Launchpad.deployed();

        await credits.approve(launchpad.address, web3.utils.toWei("100", "ether"), {from: accounts[0]});

        const allowance = await credits.allowance(accounts[0], launchpad.address);

        assert.equal(allowance, web3.utils.toWei("100", "ether"), "allowance is correct");

        await launchpad.depositToken(web3.utils.toWei("100", "ether"), {from: accounts[0]});

        const balance1 = await credits.balanceOf(accounts[0]);
        const balance2 = await credits.balanceOf(launchpad.address);

        assert.equal(balance1, web3.utils.toWei("9999999900", "ether"), "balance1 is correct");
        assert.equal(balance2, web3.utils.toWei("100", "ether"), "balance2 is correct");

        const totalDeposits = await launchpad.getTotalDeposits(accounts[0]);
        assert.equal(totalDeposits, web3.utils.toWei("100", "ether"), "totalDeposits is correct");
    });

    it("cannot depositToken", async () => {
        return Launchpad.deployed().then(async contract => {
            return await contract.depositToken(web3.utils.toWei("100", "ether"), {from: accounts[0]});
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
        const receipt = await launchpad.buyToken(web3.utils.toWei("1", "ether"), {from: accounts[1], value: creditsValue});
        const tx = await web3.eth.getTransaction(receipt.tx);
        const timestamp = (await web3.eth.getBlock(tx.blockNumber)).timestamp;

        const balance1 = await credits.balanceOf(accounts[0]);
        const balance2 = await credits.balanceOf(accounts[1]);
        const balance3 = await credits.balanceOf(launchpad.address);

        assert.equal(balance1, web3.utils.toWei("9999999900", "ether"), "balance1 is correct");
        assert.equal(balance2, web3.utils.toWei("1", "ether"), "balance2 is correct");

        const lastWithdraw = await launchpad.getLastWithdraw(accounts[1]);
        assert.equal(lastWithdraw, timestamp, "lastWithdraw is correct");

        const payments = await launchpad.getTotalPayments(accounts[1]);
        const reward = await launchpad.getTotalReward(balance1, balance3, payments);
        assert.equal(reward, web3.utils.toWei("0", "ether"), "reward is correct");
    });

    it("cannot buyToken", async () => {
        return Launchpad.deployed().then(async contract => {
            return await contract.buyToken(web3.utils.toWei("1", "ether"), {from: accounts[1], value: web3.utils.toWei("0", "ether")});
        }).then(() => {
            assert.ok(false);
        }, e => {
            assert.ok(true);
            console.log(e.reason);
        });
    });

    it("cannot withdrawEther", async () => {
        return Launchpad.deployed().then(async contract => {
            const totalDeposits = await contract.getTotalDeposits(accounts[0]);
            const creditsValue = await contract.getCreditsPrice();
            let amount = (totalDeposits * creditsValue) / web3.utils.toWei("1", "ether");
            amount = (new BN(amount)).add(new BN(web3.utils.toWei("1", "wei")));

            return await contract.withdrawEther(amount, {from: accounts[0]});
        }).then(() => {
            assert.ok(false);
        }, e => {
            assert.ok(true);
            console.log(e.reason);
        });
    });

    it("withdrawEther", async () => {
        const launchpad = await Launchpad.deployed();

        const before1 = await web3.eth.getBalance(accounts[0]);
        const before2 = await web3.eth.getBalance(launchpad.address);

        const creditsValue = await launchpad.getCreditsPrice();
        const receipt = await launchpad.withdrawEther(creditsValue, {from: accounts[0]});
        let tx = await web3.eth.getTransaction(receipt.tx);
        let totalGas = (new BN(receipt.receipt.gasUsed)).mul(new BN(tx.gasPrice));

        const after1 = await web3.eth.getBalance(accounts[0]);
        const after2 = await web3.eth.getBalance(launchpad.address);

        assert.equal(after1, (new BN(before1)).add(new BN(creditsValue)).sub(totalGas).toString(), "after1 is correct");
        assert.equal(after2, (new BN(before2)).sub(new BN(creditsValue)).toString(), "after2 is correct");

        const totalDeposits = await launchpad.getTotalDeposits(accounts[0]);
        assert.equal(totalDeposits, web3.utils.toWei("99", "ether"), "totalDeposits is correct");
    });

    it("withdrawToken", async () => {
        const credits = await CreditsERC20.deployed();
        const launchpad = await Launchpad.deployed();

        const before1 = await credits.balanceOf(accounts[0]);
        const before2 = await credits.balanceOf(launchpad.address);

        assert.equal(before1, web3.utils.toWei("9999999900", "ether"), "before1 is correct");
        assert.equal(before2, web3.utils.toWei("99", "ether"), "before2 is correct");

        await launchpad.withdrawToken(web3.utils.toWei("1", "ether"), {from: accounts[0]});

        const after1 = await credits.balanceOf(accounts[0]);
        const after2 = await credits.balanceOf(launchpad.address);

        assert.equal(after1, web3.utils.toWei("9999999901", "ether"), "after1 is correct");
        assert.equal(after2, web3.utils.toWei("98", "ether"), "after2 is correct");

        const totalDeposits = await launchpad.getTotalDeposits(accounts[0]);
        assert.equal(totalDeposits, web3.utils.toWei("98", "ether"), "totalDeposits is correct");
    });

    it("cannot withdrawToken", async () => {
        return Launchpad.deployed().then(async contract => {
            return await contract.withdrawToken(web3.utils.toWei("101", "ether"), {from: accounts[0]});
        }).then(() => {
            assert.ok(false);
        }, e => {
            assert.ok(true);
            console.log(e.reason);
        });
    });

    it("withdrawReward 1", async () => {
        const credits = await CreditsERC20.deployed();
        const launchpad = await Launchpad.deployed();

        const before1 = await credits.balanceOf(accounts[1]);
        const before2 = await credits.balanceOf(launchpad.address);

        assert.equal(before1, web3.utils.toWei("1", "ether"), "before1 is correct");
        assert.equal(before2, web3.utils.toWei("98", "ether"), "before2 is correct");

        const rewardInterval = parseInt(await launchpad.getRewardInterval());
        await time.increase(rewardInterval);
        const payments = await launchpad.getTotalPayments(accounts[1]);
        const reward = await launchpad.getTotalReward(before1, before2, payments);
        assert.equal(reward, web3.utils.toWei("0.01", "ether"), "reward is correct");

        const receipt = await launchpad.withdrawReward({from: accounts[1]});
        const tx = await web3.eth.getTransaction(receipt.tx);
        const timestamp = (await web3.eth.getBlock(tx.blockNumber)).timestamp;

        const after1 = await credits.balanceOf(accounts[1]);
        const after2 = await credits.balanceOf(launchpad.address);

        assert.equal(after1, web3.utils.toWei("1.01", "ether"), "after1 is correct");
        assert.equal(after2, web3.utils.toWei("97.99", "ether"), "after2 is correct");

        const lastWithdraw = await launchpad.getLastWithdraw(accounts[1]);
        assert.equal(lastWithdraw, timestamp, "lastWithdraw is correct");
    });

    it("withdrawReward 2", async () => {
        const credits = await CreditsERC20.deployed();
        const launchpad = await Launchpad.deployed();

        const before1 = await credits.balanceOf(accounts[0]);
        const before2 = await credits.balanceOf(launchpad.address);
        const beforeTotalDeposit = await launchpad.getTotalDeposits(accounts[0]);

        assert.equal(before1, web3.utils.toWei("9999999901", "ether"), "before1 is correct");
        assert.equal(before2, web3.utils.toWei("97.99", "ether"), "before2 is correct");

        const rewardInterval = parseInt(await launchpad.getRewardInterval());
        await time.increase(rewardInterval);
        const payments = await launchpad.getTotalPayments(accounts[0]);
        reward = await launchpad.getTotalReward(before1, before2, payments);
        assert.equal(reward, web3.utils.toWei("97.99", "ether"), "reward is correct");

        const receipt = await launchpad.withdrawReward({from: accounts[0]});
        const tx = await web3.eth.getTransaction(receipt.tx);
        const timestamp = (await web3.eth.getBlock(tx.blockNumber)).timestamp;

        const after1 = await credits.balanceOf(accounts[0]);
        const after2 = await credits.balanceOf(launchpad.address);
        const afterTotalDeposit = await launchpad.getTotalDeposits(accounts[0]);

        assert.equal(after1, web3.utils.toWei("9999999998.99", "ether"), "after1 is correct");
        assert.equal(after2, web3.utils.toWei("0", "ether"), "after2 is correct");
        assert.equal(afterTotalDeposit, (new BN(beforeTotalDeposit)).sub((new BN(reward))).toString(), "afterTotalDeposit is correct");

        const lastWithdraw = await launchpad.getLastWithdraw(accounts[0]);
        assert.equal(lastWithdraw, timestamp, "lastWithdraw is correct");
    });

    it("cannot withdrawReward", async () => {
        return Launchpad.deployed().then(async contract => {
            return await contract.withdrawReward({from: accounts[0]});
        }).then(() => {
            assert.ok(false);
        }, e => {
            assert.ok(true);
            console.log(e.reason);
        });
    });*/
});