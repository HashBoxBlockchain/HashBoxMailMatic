const Feed = artifacts.require("Feed.sol");
const FeedExtensionTest2 = artifacts.require("FeedExtensionTest2.sol");
const {time} = require('@openzeppelin/test-helpers');
const BN = web3.utils.BN;
const FEED_EXPIRY_TIME = 1296000;

contract("Feed", accounts => {
    it("basic info 1", async () => {
        const feed = await Feed.deployed();

        const owner = await feed.owner();
        const info = await feed.getInfo();
        const timeInSecs = info[0];
        const expiryTime = info[1];
        const price = info[2];
        const totalSubscribers = info[3];
        const sub = await feed.getSubscriber(accounts[0], 0);
        const subscriberId = sub[0];
        const subscriber = sub[1];
        const subscribers = await feed.getSubscribers(totalSubscribers);

        assert.equal(owner, accounts[0], "owner is correct");
        assert.equal(timeInSecs, FEED_EXPIRY_TIME, "timeInSecs is correct");
        assert.equal(price, web3.utils.toWei("1", "ether"), "price is correct");
        assert.notEqual(expiryTime, 0, "expiryTime is correct");
        assert.equal(subscribers.length, 0, "subscribers.length is correct");
        assert.equal(subscriber[0], "0x0000000000000000000000000000000000000000", "subscriber[0] is correct");
        assert.equal(subscriber[1], 0, "subscriber[1] is correct");
        assert.equal(subscriber[2], 0, "subscriber[2] is correct");
        assert.equal(subscriberId, 0, "subscriberId is correct");
        assert.equal(totalSubscribers, 0, "totalSubscribers is correct");
    });

    it("cannot subscribe 1", async () => {
        return Feed.deployed().then(async contract => {
            return await contract.subscribe({from: accounts[1], value: web3.utils.toWei("0", "ether")});
        }).then(() => {
            assert.ok(false);
        }, e => {
            assert.ok(true);
            console.log(e.reason);
        });
    });

    it("subscribe 1", async () => {
        const feed = await Feed.deployed();

        const receipt = await feed.subscribe({from: accounts[1], value: web3.utils.toWei("1", "ether")});
        const tx = await web3.eth.getTransaction(receipt.tx);
        const timestamp = (await web3.eth.getBlock(tx.blockNumber)).timestamp;

        const info = await feed.getInfo();
        const timeInSecs = info[0];
        const totalSubscribers = info[3];
        const subscribers = await feed.getSubscribers(totalSubscribers);
        const sub = await feed.getSubscriber(accounts[1], 1);
        const subscriberId = sub[0];
        const subscriber = sub[1];

        assert.equal(subscribers.length, 1, "subscribers.length is correct");
        assert.equal(subscribers[0], accounts[1], "subscribers[0] is correct");
        assert.equal(subscriber[0], accounts[1], "subscriber[0] is correct");
        assert.equal(subscriber[1], timestamp.toString(), "subscriber[1] is correct");
        assert.equal(subscriber[2], (new BN(timestamp.toString())).add(new BN(timeInSecs.toString())), "subscriber[2] is correct");
        assert.equal(subscriber[3], false, "subscriber[3] is correct");
        assert.equal(subscriberId, 1, "subscriberId is correct");
        assert.equal(totalSubscribers, 1, "totalSubscribers is correct");
    });

    it("setRating 1", async () => {
        const feed = await Feed.deployed();

        await feed.setRating(5, {from: accounts[1]});

        const info = await feed.getRating(accounts[1]);
        const userRating = info[0];
        const rating = info[1];
        const totalRatings = info[2];
        assert.notEqual(userRating, new BN('5'), "userRating is correct");
        assert.notEqual(rating, new BN('5'), "rating is correct");
        assert.notEqual(totalRatings, new BN('1'), "totalRatings is correct");
    });

    it("cannot unsubscribe 1", async () => {
        return Feed.deployed().then(async contract => {
            return await contract.unsubscribe({from: accounts[2]});
        }).then(() => {
            assert.ok(false);
        }, e => {
            assert.ok(true);
            console.log(e.reason);
        });
    });

    it("unsubscribe", async () => {
        const feed = await Feed.deployed();

        let info = await feed.getInfo();
        let timeInSecs = info[0];
        let price = info[2];
        let sub = await feed.getSubscriber("0x0000000000000000000000000000000000000000", 1);
        let beforeSubscriber = sub[1];
        let expiredTime = beforeSubscriber[2];

        const before1 = await web3.eth.getBalance(accounts[1]);
        const before2 = await web3.eth.getBalance(feed.address);

        const receipt = await feed.unsubscribe({from: accounts[1]});
        const tx = await web3.eth.getTransaction(receipt.tx);
        const timestamp = (await web3.eth.getBlock(tx.blockNumber)).timestamp;
        const totalGas = (new BN(receipt.receipt.gasUsed)).mul(new BN(tx.gasPrice));

        info = await feed.getInfo();
        const totalSubscribers = info[3];
        const subscribers = await feed.getSubscribers(totalSubscribers);
        sub = await feed.getSubscriber("0x0000000000000000000000000000000000000000", 1);
        const subscriberId = sub[0];
        const subscriber = sub[1];

        const after1 = await web3.eth.getBalance(accounts[1]);
        const after2 = await web3.eth.getBalance(feed.address);
        const difference = (new BN(expiredTime.toString())).sub(new BN(timestamp.toString()));
        const amount = ((new BN(difference.toString())).mul(new BN(price.toString()))).div(new BN(timeInSecs.toString()));

        assert.equal(subscribers.length, 1, "subscribers.length is correct");
        assert.equal(subscribers[0], "0x0000000000000000000000000000000000000000", "subscribers[0] is correct");
        assert.equal(subscriber[0], "0x0000000000000000000000000000000000000000", "subscriber[0] is correct");
        assert.equal(subscriber[1], 0, "subscriber[1] is correct");
        assert.equal(subscriber[2], 0, "subscriber[2] is correct");
        assert.equal(subscriberId, "0", "subscriberId is correct");
        assert.equal(totalSubscribers, 1, "totalSubscribers is correct");
        assert.equal(after1, (new BN(before1.toString())).add(new BN(amount.toString())).sub(new BN(totalGas.toString())).toString(), "after1 is correct");
        assert.equal(after2, (new BN(before2.toString())).sub(new BN(amount.toString())).toString(), "after2 is correct");
    });

    it("subscribe 2", async () => {
        const feed = await Feed.deployed();

        const receipt = await feed.subscribe({from: accounts[2], value: web3.utils.toWei("1", "ether")});
        const tx = await web3.eth.getTransaction(receipt.tx);
        const timestamp = (await web3.eth.getBlock(tx.blockNumber)).timestamp;

        const info = await feed.getInfo();
        const timeInSecs = info[0];
        const totalSubscribers = info[3];
        const subscribers = await feed.getSubscribers(totalSubscribers);
        const sub = await feed.getSubscriber(accounts[2], 2);
        const subscriberId = sub[0];
        const subscriber = sub[1];

        assert.equal(subscribers.length, 2, "subscribers.length is correct");
        assert.equal(subscribers[0], accounts[2], "subscribers[0] is correct");
        assert.equal(subscribers[1], "0x0000000000000000000000000000000000000000", "subscribers[1] is correct");
        assert.equal(subscriber[0], accounts[2], "subscriber[0] is correct");
        assert.equal(subscriber[1], timestamp.toString(), "subscriber[1] is correct");
        assert.equal(subscriber[2], (new BN(timestamp.toString())).add(new BN(timeInSecs.toString())), "subscriber[2] is correct");
        assert.equal(subscriber[3], false, "subscriber[3] is correct");
        assert.equal(subscriberId, 2, "subscriberId is correct");
        assert.equal(totalSubscribers, 2, "totalSubscribers is correct");
    });

    it("cannot setRating 1", async () => {
        return Feed.deployed().then(async contract => {
            return await contract.setRating(0, {from: accounts[2]});
        }).then(() => {
            assert.ok(false);
        }, e => {
            assert.ok(true);
            console.log(e.reason);
        });
    });

    it("cannot setRating 2", async () => {
        return Feed.deployed().then(async contract => {
            return await contract.setRating(11, {from: accounts[2]});
        }).then(() => {
            assert.ok(false);
        }, e => {
            assert.ok(true);
            console.log(e.reason);
        });
    });

    it("setRating 2", async () => {
        const feed = await Feed.deployed();

        await feed.setRating(10, {from: accounts[2]});

        const info = await feed.getRating(accounts[2]);
        const userRating = info[0];
        const rating = info[1];
        const totalRatings = info[2];
        assert.notEqual(userRating, new BN('10'), "userRating is correct");
        assert.notEqual(rating, new BN('7'), "rating is correct");
        assert.notEqual(totalRatings, new BN('2'), "totalRatings is correct");
    });

    it("cannot setRating 3", async () => {
        return Feed.deployed().then(async contract => {
            return await contract.setRating(5, {from: accounts[1]});
        }).then(() => {
            assert.ok(false);
        }, e => {
            assert.ok(true);
            console.log(e.reason);
        });
    });

    it("cannot setRating 4", async () => {
        return Feed.deployed().then(async contract => {
            return await contract.setRating(5, {from: accounts[2]});
        }).then(() => {
            assert.ok(false);
        }, e => {
            assert.ok(true);
            console.log(e.reason);
        });
    });

    it("cannot withdrawEther 1", async () => {
        return Feed.deployed().then(async contract => {
            return await contract.withdrawEther(web3.utils.toWei("1", "wei"), {from: accounts[0]});
        }).then(() => {
            assert.ok(false);
        }, e => {
            assert.ok(true);
            console.log(e.reason);
        });
    });

    it("cannot setInfo", async () => {
        return Feed.deployed().then(async contract => {
            return await contract.setInfo("0x0000000000000000000000000000000000000000", 2592000, web3.utils.toWei("1", "ether"), {from: accounts[0]});
        }).then(() => {
            assert.ok(false);
        }, e => {
            assert.ok(true);
            console.log(e.reason);
        });
    });

    it("cannot unsubscribe 2", async () => {
        return Feed.deployed().then(async contract => {
            const info = await contract.getInfo();
            const timeInSecs = info[0];
            await time.increase(timeInSecs);

            return await contract.unsubscribe({from: accounts[2]});
        }).then(() => {
            assert.ok(false);
        }, e => {
            assert.ok(true);
            console.log(e.reason);
        });
    });

    it("cannot subscribe 2", async () => {
        return Feed.deployed().then(async contract => {
            return await contract.subscribe({from: accounts[1], value: web3.utils.toWei("1", "ether")});
        }).then(() => {
            assert.ok(false);
        }, e => {
            assert.ok(true);
            console.log(e.reason);
        });
    });

    it("cannot removeSubscriber", async () => {
        return Feed.deployed().then(async contract => {
            return await contract.removeSubscriber(accounts[2], {from: accounts[1]});
        }).then(() => {
            assert.ok(false);
        }, e => {
            assert.ok(true);
            console.log(e.reason);
        });
    });

    it("cannot renewFeed", async () => {
        return Feed.deployed().then(async contract => {
            return await contract.renewFeed({from: accounts[0]});
        }).then(() => {
            assert.ok(false);
        }, e => {
            assert.ok(true);
            console.log(e.reason);
        });
    });

    it("removeSubscriber", async () => {
        const feed = await Feed.deployed();

        let info = await feed.getInfo();
        const price = info[2];
        const before1 = await web3.eth.getBalance(accounts[2]);
        const before2 = await web3.eth.getBalance(feed.address);

        const receipt = await feed.removeSubscriber(accounts[2], {from: accounts[0]});
        await web3.eth.getTransaction(receipt.tx);

        info = await feed.getInfo();
        const totalSubscribers = info[3];
        const subscribers = await feed.getSubscribers(totalSubscribers);
        const sub = await feed.getSubscriber(accounts[2], 2);
        const subscriberId = sub[0];
        const subscriber = sub[1];

        const after1 = await web3.eth.getBalance(accounts[2]);
        const after2 = await web3.eth.getBalance(feed.address);

        assert.equal(subscribers.length, 2, "subscribers.length is correct");
        assert.equal(subscribers[0], "0x0000000000000000000000000000000000000000", "subscribers[0] is correct");
        assert.equal(subscriber[0], "0x0000000000000000000000000000000000000000", "subscriber[0] is correct");
        assert.equal(subscriber[1], 0, "subscriber[1] is correct");
        assert.equal(subscriber[2], 0, "subscriber[2] is correct");
        assert.equal(subscriberId, "0", "subscriberId is correct");
        assert.equal(totalSubscribers, 2, "totalSubscribers is correct");
        assert.equal(after1, (new BN(before1.toString())).add(new BN(price.toString())).toString(), "after1 is correct");
        assert.equal(after2, (new BN(before2.toString())).sub(new BN(price.toString())).toString(), "after2 is correct");
    });

    it("cannot setRating 3", async () => {
        return Feed.deployed().then(async contract => {
            return await contract.setRating(5, {from: accounts[2]});
        }).then(() => {
            assert.ok(false);
        }, e => {
            assert.ok(true);
            console.log(e.reason);
        });
    });

    it("cannot withdrawEther 2", async () => {
        return Feed.deployed().then(async contract => {
            return await contract.withdrawEther(web3.utils.toWei("1", "wei"), {from: accounts[1]});
        }).then(() => {
            assert.ok(false);
        }, e => {
            assert.ok(true);
            console.log(e.reason);
        });
    });

    it("withdrawEther", async () => {
        const feed = await Feed.deployed();

        const before1 = await web3.eth.getBalance(accounts[0]);
        const before2 = await web3.eth.getBalance(feed.address);

        const receipt = await feed.withdrawEther(before2, {from: accounts[0]});
        const tx = await web3.eth.getTransaction(receipt.tx);
        const totalGas = (new BN(receipt.receipt.gasUsed)).mul(new BN(tx.gasPrice));

        const after1 = await web3.eth.getBalance(accounts[0]);
        const after2 = await web3.eth.getBalance(feed.address);

        assert.equal(after1, (new BN(before1.toString())).add(new BN(before2.toString())).sub(new BN(totalGas.toString())).toString(), "after1 is correct");
        assert.equal(after2, 0, "after2 is correct");
    });

    it("cannot setInfo 2", async () => {
        return Feed.deployed().then(async contract => {
            return await contract.setInfo("0x0000000000000000000000000000000000000000", 2592000, web3.utils.toWei("1", "ether"), {from: accounts[1]});
        }).then(() => {
            assert.ok(false);
        }, e => {
            assert.ok(true);
            console.log(e.reason);
        });
    });

    it("basic info 2", async () => {
        const feed = await Feed.deployed();

        let info = await feed.getInfo();
        const beforeTimeInSecs = info[0];
        const beforePrice = info[2];

        assert.equal(beforeTimeInSecs, FEED_EXPIRY_TIME, "beforeTimeInSecs is correct");
        assert.equal(beforePrice, web3.utils.toWei("1", "ether"), "beforePrice is correct");

        await feed.setInfo("0x0000000000000000000000000000000000000000", 3000000, web3.utils.toWei("0.1", "ether"), {from: accounts[0]});

        info = await feed.getInfo();
        const afterTimeInSecs = info[0];
        const afterPrice = info[2];

        assert.equal(afterTimeInSecs, 3000000, "afterTimeInSecs is correct");
        assert.equal(afterPrice, web3.utils.toWei("0.1", "ether"), "afterPrice is correct");
    });

    it("setInfo 1", async () => {
        const feed = await Feed.deployed();
        const feedExtensionTest2 = await FeedExtensionTest2.deployed();

        const before = await feed.getExtensionInfo();
        assert.equal(before, "0x0000000000000000000000000000000000000000", "before is correct");

        await feed.setInfo(feedExtensionTest2.address, 3000000, web3.utils.toWei("0.1", "ether"), {from: accounts[0]});

        const after = await feed.getExtensionInfo();
        assert.notEqual(after, "0x0000000000000000000000000000000000000000", "after is correct");
    });

    it("setInfo 2", async () => {
        const feed = await Feed.deployed();
        const feedExtensionTest2 = await FeedExtensionTest2.deployed();

        const before = await feed.getExtensionInfo();
        assert.notEqual(before, "0x0000000000000000000000000000000000000000", "before is correct");

        await feed.setInfo(feedExtensionTest2.address, 3000000, web3.utils.toWei("0.1", "ether"), {from: accounts[0]});

        const after = await feed.getExtensionInfo();
        assert.equal(after, feedExtensionTest2.address, "after is correct");
    });
});