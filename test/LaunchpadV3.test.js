const CreditsERC20 = artifacts.require("CreditsERC20");
const Launchpad = artifacts.require("Launchpad");
const BN = web3.utils.BN;

contract("Launchpad", accounts => {
    /*it("cannot getTokenPrice", async () => {
        return Launchpad.deployed().then(async contract => {
            return await contract.getTokenPrice(web3.utils.toWei("1", "ether"));
        }).then(() => {
            assert.ok(false);
        }, e => {
            assert.ok(true);
            console.log(e.data.name);
        });
    });

    it("cannot addLiquidity", async () => {
        return Launchpad.deployed().then(async contract => {
            return await contract.addLiquidity(web3.utils.toWei("1", "ether"), {from: accounts[0], value: web3.utils.toWei("1", "ether")});
        }).then(() => {
            assert.ok(false);
        }, e => {
            assert.ok(true);
            console.log(e.reason);
        });
    });

    it("addLiquidity 1", async () => {
        const credits = await CreditsERC20.deployed();
        const launchpad = await Launchpad.deployed();

        await credits.approve(launchpad.address, web3.utils.toWei("1", "ether"), {from: accounts[0]});

        await launchpad.addLiquidity(web3.utils.toWei("1", "ether"), {from: accounts[0], value: web3.utils.toWei("1", "ether")});

        const after1 = await credits.balanceOf(accounts[0]);
        const after2 = await credits.balanceOf(launchpad.address);
        const after3 = await web3.eth.getBalance(launchpad.address);

        assert.equal(after1, web3.utils.toWei("9999999999", "ether"), "after1 is correct");
        assert.equal(after2, web3.utils.toWei("1", "ether"), "after2 is correct");
        assert.equal(after3, web3.utils.toWei("1", "ether"), "after3 is correct");
    });

    it("cannot buyToken", async () => {
        return Launchpad.deployed().then(async contract => {
            return await contract.buyToken(web3.utils.toWei("1", "ether"), {from: accounts[0], value: web3.utils.toWei("0", "ether")});
        }).then(() => {
            assert.ok(false);
        }, e => {
            assert.ok(true);
            console.log(e.reason);
        });
    });

    it("getTokenPrice", async () => {
        const launchpad = await Launchpad.deployed();

        const price = await launchpad.getTokenPrice(web3.utils.toWei("1", "ether"));

        assert.equal(price, web3.utils.toWei("1", "ether"), "price is correct");
    });

    it("cannot sellToken 1", async () => {
        return Launchpad.deployed().then(async contract => {
            return await contract.sellToken(web3.utils.toWei("1", "ether"), {from: accounts[0]});
        }).then(() => {
            assert.ok(false);
        }, e => {
            assert.ok(true);
            console.log(e.reason);
        });
    });

    it("cannot sellToken 2", async () => {
        return Launchpad.deployed().then(async contract => {
            const credits = await CreditsERC20.deployed();
            await credits.approve(contract.address, web3.utils.toWei("10", "ether"), {from: accounts[0]});

            return await contract.sellToken(web3.utils.toWei("10", "ether"), {from: accounts[0]});
        }).then(() => {
            assert.ok(false);
        }, e => {
            assert.ok(true);
            console.log(e.reason);
        });
    });

    it("sellToken", async () => {
        const credits = await CreditsERC20.deployed();
        const launchpad = await Launchpad.deployed();

        await credits.approve(launchpad.address, web3.utils.toWei("1", "ether"), {from: accounts[0]});

        await launchpad.sellToken(web3.utils.toWei("1", "ether"), {from: accounts[0]});

        const after1 = await credits.balanceOf(accounts[0]);
        const after2 = await credits.balanceOf(launchpad.address);
        const after3 = await web3.eth.getBalance(launchpad.address);

        assert.equal(after1, web3.utils.toWei("9999999998", "ether"), "after1 is correct");
        assert.equal(after2, web3.utils.toWei("2", "ether"), "after2 is correct");
        assert.equal(after3, web3.utils.toWei("0", "ether"), "after3 is correct");
    });

    it("buyToken", async () => {
        const credits = await CreditsERC20.deployed();
        const launchpad = await Launchpad.deployed();

        await launchpad.buyToken(web3.utils.toWei("1", "ether"), {from: accounts[0], value: web3.utils.toWei("0", "ether")});

        const after1 = await credits.balanceOf(accounts[0]);
        const after2 = await credits.balanceOf(launchpad.address);
        const after3 = await web3.eth.getBalance(launchpad.address);

        assert.equal(after1, web3.utils.toWei("9999999999", "ether"), "after1 is correct");
        assert.equal(after2, web3.utils.toWei("1", "ether"), "after2 is correct");
        assert.equal(after3, web3.utils.toWei("0", "ether"), "after3 is correct");
    });

    it("addLiquidity 2", async () => {
        const credits = await CreditsERC20.deployed();
        const launchpad = await Launchpad.deployed();

        await launchpad.addLiquidity(web3.utils.toWei("0", "ether"), {from: accounts[0], value: web3.utils.toWei("1", "ether")});

        const after1 = await credits.balanceOf(accounts[0]);
        const after2 = await credits.balanceOf(launchpad.address);
        const after3 = await web3.eth.getBalance(launchpad.address);

        assert.equal(after1, web3.utils.toWei("9999999999", "ether"), "after1 is correct");
        assert.equal(after2, web3.utils.toWei("1", "ether"), "after2 is correct");
        assert.equal(after3, web3.utils.toWei("1", "ether"), "after3 is correct");
    });*/
});