const CreditsERC20 = artifacts.require("CreditsERC20");
const Launchpad = artifacts.require("Launchpad");
const BN = web3.utils.BN;

contract("Launchpad", accounts => {
    it("depositToken", async () => {
        const credits = await CreditsERC20.deployed();
        const launchpad = await Launchpad.deployed();

        let totalCredits = await credits.totalSupply();
        totalCredits = web3.utils.fromWei(totalCredits.toString(), "ether");
        const minTokensAmount = await launchpad.getMinCreditsAmount();
        const depositAmount = (new BN(web3.utils.fromWei(minTokensAmount.toString(), "ether"))).mul(new BN("10"));

        await credits.approve(launchpad.address, web3.utils.toWei(depositAmount.toString(), "ether"), {from: accounts[0]});

        const allowance = await credits.allowance(accounts[0], launchpad.address);

        assert.equal(allowance, web3.utils.toWei(depositAmount.toString(), "ether"), "allowance is correct");

        await launchpad.depositToken(web3.utils.toWei(depositAmount.toString(), "ether"), {from: accounts[0]});

        const balance1 = await credits.balanceOf(accounts[0]);
        const balance2 = await credits.balanceOf(launchpad.address);

        assert.equal(balance1, web3.utils.toWei(((new BN(totalCredits.toString())).sub(new BN(depositAmount.toString()))).toString(), "ether"), "balance1 is correct");
        assert.equal(balance2, web3.utils.toWei(depositAmount.toString(), "ether"), "balance2 is correct");

        const totalDeposits = await launchpad.getTotalDeposits(accounts[0]);
        assert.equal(totalDeposits, web3.utils.toWei(depositAmount.toString(), "ether"), "totalDeposits is correct");
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

    it("buyToken 1", async () => {
        const credits = await CreditsERC20.deployed();
        const launchpad = await Launchpad.deployed();

        let totalCredits = await credits.totalSupply();
        totalCredits = web3.utils.fromWei(totalCredits.toString(), "ether");
        let minTokensAmount = await launchpad.getMinCreditsAmount();
        const depositAmount = (new BN(web3.utils.fromWei(minTokensAmount.toString(), "ether"))).mul(new BN("10"));
        minTokensAmount = web3.utils.fromWei(minTokensAmount.toString(), "ether");
        let creditsValue = await launchpad.getCreditsPrice();
        creditsValue = web3.utils.toWei(creditsValue.toString(), "ether");
        const value = ((new BN(minTokensAmount.toString())).mul(new BN(creditsValue.toString()))).div(new BN(web3.utils.toWei("1", "ether")));

        await launchpad.buyToken(web3.utils.toWei(minTokensAmount.toString(), "ether"), {from: accounts[1], value: value});

        const balance1 = await credits.balanceOf(accounts[0]);
        const balance2 = await credits.balanceOf(accounts[1]);

        assert.equal(balance1, web3.utils.toWei(((new BN(totalCredits.toString())).sub(new BN(depositAmount.toString()))).toString(), "ether"), "balance1 is correct");
        assert.equal(balance2, web3.utils.toWei(minTokensAmount.toString(), "ether"), "balance2 is correct");
    });

    it("cannot buyToken1", async () => {
        return Launchpad.deployed().then(async contract => {
            let minTokensAmount = await contract.getMinCreditsAmount();
            minTokensAmount = web3.utils.fromWei(minTokensAmount.toString(), "ether");
            let creditsValue = await contract.getCreditsPrice();
            creditsValue = web3.utils.toWei(creditsValue.toString(), "ether");
            const value = ((new BN(minTokensAmount.toString())).mul(new BN(creditsValue.toString()))).div(new BN(web3.utils.toWei("1", "ether")));
            return await contract.buyToken(web3.utils.toWei("0", "ether"), {from: accounts[1], value: value});
        }).then(() => {
            assert.ok(false);
        }, e => {
            assert.ok(true);
            console.log(e.reason);
        });
    });

    it("cannot buyToken2", async () => {
        return Launchpad.deployed().then(async contract => {
            let minTokensAmount = await contract.getMinCreditsAmount();
            minTokensAmount = web3.utils.fromWei(minTokensAmount.toString(), "ether");
            return await contract.buyToken(web3.utils.toWei(minTokensAmount.toString(), "ether"), {from: accounts[1], value: 0});
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
            let creditsValue = await contract.getCreditsPrice();
            creditsValue = web3.utils.toWei(creditsValue.toString(), "ether");
            const amount = ((new BN(totalDeposits.toString())).mul(new BN(creditsValue.toString()))).div(new BN(web3.utils.toWei("1", "ether")));
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
        const minTokensAmount = await launchpad.getMinCreditsAmount();
        const depositAmount = (new BN(web3.utils.fromWei(minTokensAmount.toString(), "ether"))).mul(new BN("10"));

        assert.equal(totalDeposits, (new BN(web3.utils.toWei(depositAmount.toString(), "ether"))).sub(new BN(web3.utils.toWei("1", "ether"))).toString(), "totalDeposits is correct");
    });

    it("withdrawToken", async () => {
        const credits = await CreditsERC20.deployed();
        const launchpad = await Launchpad.deployed();

        let totalCredits = await credits.totalSupply();
        totalCredits = web3.utils.fromWei(totalCredits.toString(), "ether");
        let minTokensAmount = await launchpad.getMinCreditsAmount();
        const depositAmount = (new BN(web3.utils.fromWei(minTokensAmount.toString(), "ether"))).mul(new BN("10"));
        minTokensAmount = web3.utils.fromWei(minTokensAmount.toString(), "ether");

        const before1 = await credits.balanceOf(accounts[0]);
        const before2 = await credits.balanceOf(launchpad.address);

        assert.equal(before1, web3.utils.toWei(((new BN(totalCredits.toString())).sub(new BN(depositAmount.toString()))).toString(), "ether").toString(), "before1 is correct");
        assert.equal(before2, ((new BN(web3.utils.toWei(depositAmount.toString(), "ether"))).sub(new BN(web3.utils.toWei(minTokensAmount.toString(), "ether")))).toString(), "before2 is correct");

        await launchpad.withdrawToken(web3.utils.toWei("1", "ether"), {from: accounts[0]});

        const after1 = await credits.balanceOf(accounts[0]);
        const after2 = await credits.balanceOf(launchpad.address);

        assert.equal(after1, web3.utils.toWei(((new BN(totalCredits.toString())).sub(new BN(depositAmount.toString())).add(new BN("1"))).toString(), "ether").toString(), "after1 is correct");
        assert.equal(after2, ((new BN(web3.utils.toWei(depositAmount.toString(), "ether"))).sub(new BN(web3.utils.toWei(minTokensAmount.toString(), "ether"))).sub(new BN(web3.utils.toWei("1", "ether")))).toString(), "after2 is correct");

        const totalDeposits = await launchpad.getTotalDeposits(accounts[0]);
        assert.equal(totalDeposits, ((new BN(web3.utils.toWei(depositAmount.toString(), "ether"))).sub(new BN(web3.utils.toWei("2", "ether")))).toString(), "totalDeposits is correct");
    });

    it("cannot withdrawToken", async () => {
        return Launchpad.deployed().then(async contract => {
            const minTokensAmount = await contract.getMinCreditsAmount();
            return await contract.withdrawToken(web3.utils.toWei((new BN(minTokensAmount.toString())).add(new BN("1")).toString(), "ether"), {from: accounts[0]});
        }).then(() => {
            assert.ok(false);
        }, e => {
            assert.ok(true);
            console.log(e.reason);
        });
    });

    it("buyToken 2", async () => {
        const credits = await CreditsERC20.deployed();
        const launchpad = await Launchpad.deployed();

        let minTokensAmount = await launchpad.getMinCreditsAmount();
        minTokensAmount = web3.utils.fromWei(minTokensAmount.toString(), "ether");
        let creditsValue = await launchpad.getCreditsPrice();
        creditsValue = web3.utils.toWei(creditsValue.toString(), "ether");
        const value = ((new BN(minTokensAmount.toString())).mul(new BN(creditsValue.toString()))).div(new BN(web3.utils.toWei("1", "ether")));

        await launchpad.buyToken(web3.utils.toWei(minTokensAmount.toString(), "ether"), {from: accounts[1], value: value});

        const balance1 = await credits.balanceOf(accounts[1]);
        assert.equal(balance1, web3.utils.toWei(((new BN(minTokensAmount).mul(new BN("2")))).toString(), "ether"), "balance1 is correct");
    });

    it("sellToken", async () => {
        const credits = await CreditsERC20.deployed();
        const launchpad = await Launchpad.deployed();

        await credits.approve(launchpad.address, web3.utils.toWei("1", "ether"), {from: accounts[0]});

        const allowance = await credits.allowance(accounts[0], launchpad.address);

        assert.equal(allowance, web3.utils.toWei("1", "ether"), "allowance is correct");

        const beforeBalance1 = await credits.balanceOf(accounts[0]);
        const beforeBalance2 = await credits.balanceOf(launchpad.address);
        const beforeBalance3 = await web3.eth.getBalance(accounts[0]);
        const beforeBalance4 = await web3.eth.getBalance(launchpad.address);

        const receipt = await launchpad.sellToken(web3.utils.toWei("1", "ether"), {from: accounts[0]});
        let tx = await web3.eth.getTransaction(receipt.tx);
        let totalGas = (new BN(receipt.receipt.gasUsed)).mul(new BN(tx.gasPrice));

        const afterBalance1 = await credits.balanceOf(accounts[0]);
        const afterBalance2 = await credits.balanceOf(launchpad.address);
        const afterBalance3 = await web3.eth.getBalance(accounts[0]);
        const afterBalance4 = await web3.eth.getBalance(launchpad.address);
        const creditsValue = await launchpad.getCreditsPrice();

        assert.equal(afterBalance1, (new BN(beforeBalance1)).sub((new BN(web3.utils.toWei("1", "ether")))).toString(), "balance1 is correct");
        assert.equal(afterBalance2, (new BN(beforeBalance2)).add((new BN(web3.utils.toWei("1", "ether")))).toString(), "balance2 is correct");
        assert.equal(afterBalance3, (new BN(beforeBalance3)).sub(new BN(totalGas)).add((new BN(creditsValue))).toString(), "balance3 is correct");
        assert.equal(afterBalance4, (new BN(beforeBalance4)).sub((new BN(creditsValue))).toString(), "balance4 is correct");
    });
});