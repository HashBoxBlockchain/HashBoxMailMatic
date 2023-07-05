const MailERC721 = artifacts.require("MailERC721");
const Contacts = artifacts.require("Contacts.sol");
const CreditsERC20 = artifacts.require("CreditsERC20.sol");
const BN = web3.utils.BN;

contract("Contacts", accounts => {
    it("cannot addContact 1", async () => {
        return MailERC721.deployed().then(async contract => {
            const contacts = await Contacts.deployed();

            return await contract.addContact(contacts.address, ["ETH", "0x24BdEE6026041375e3697916087dE36046Bea2f1", "Fulano", "24B", "Ful"], {from: accounts[0]});
        }).then(() => {
            assert.ok(false);
        }, e => {
            assert.ok(true);
            console.log(e.reason);
        });
    });

    it("addContact 1", async () => {
        const mail = await MailERC721.deployed();
        const credits = await CreditsERC20.deployed();
        const contacts = await Contacts.deployed();

        await credits.approve(mail.address, web3.utils.toWei("10", "ether"), {from: accounts[0]});

        await mail.addContact(contacts.address, ["ETH", "0x24BdEE6026041375e3697916087dE36046Bea2f1", "Fulano", "24B", "Ful"],{from: accounts[0]});

        const contact = await contacts.getContacts(accounts[0], "ETH", 0, 1);
        assert.equal(contact[0].id, 0, "id is correct");
        assert.equal(contact[0].address_, "0x24BdEE6026041375e3697916087dE36046Bea2f1", "address is correct");
        assert.equal(contact[0].nickname, "Fulano", "nickname is correct");

        const info = await contacts.getInfo(accounts[0], 0);
        assert.equal(info[0], accounts[0], "info[0] is correct");
        assert.equal(info[1], 1, "info[1] is correct");
        assert.equal(info[2], 0, "info[2] is correct");
        assert.equal(info[3], 1, "info[3] is correct");

        const nickname = await contacts.getNicknameFromAddress(accounts[0], "24B");
        assert.equal(nickname, "Fulano", "nickname is correct");

        const address = await contacts.getAddressFromNickname(accounts[0], "Ful");
        assert.equal(address, "0x24BdEE6026041375e3697916087dE36046Bea2f1", "address is correct");
    });

    it("cannot addContact 2", async () => {
        return MailERC721.deployed().then(async contract => {
            const mail = await MailERC721.deployed();
            const contacts = await Contacts.deployed();
            const credits = await CreditsERC20.deployed();
            await credits.approve(mail.address, web3.utils.toWei("10", "ether"), {from: accounts[0]});

            return await contract.addContact(contacts.address, ["ETH", "0x24BdEE6026041375e3697916087dE36046Bea2f1", "Fulano", "24B", "Ful"],{from: accounts[0]});
        }).then(() => {
            assert.ok(false);
        }, e => {
            assert.ok(true);
            console.log(e.reason);
        });
    });

    it("cannot setContact 1", async () => {
        return Contacts.deployed().then(async contract => {
            const credits = await CreditsERC20.deployed();
            await credits.transfer(accounts[1], web3.utils.toWei("10", "ether"), {from: accounts[0]});
            await credits.approve(contract.address, web3.utils.toWei("10", "ether"), {from: accounts[1]});

            return await contract.setContact(0, ["ETH", "0x24BdEE6026041375e3697916087dE36046Bea2f1", "Fulano", "24B", "Ful", "24B", "Ful"], {from: accounts[1]});
        }).then(() => {
            assert.ok(false);
        }, e => {
            assert.ok(true);
            console.log(e.reason);
        });
    });

    it("cannot setContact 2", async () => {
        return Contacts.deployed().then(async contract => {
            const credits = await CreditsERC20.deployed();
            await credits.transfer(accounts[1], web3.utils.toWei("10", "ether"), {from: accounts[0]});
            await credits.approve(contract.address, web3.utils.toWei("10", "ether"), {from: accounts[1]});

            return await contract.setContact(0, ["ETH", "0x24BdEE6026041375e3697916087dE36046Bea2f1", "Fulano", "24B", "Ful", "X", "Y"], {from: accounts[0]});
        }).then(() => {
            assert.ok(false);
        }, e => {
            assert.ok(true);
            console.log(e.reason);
        });
    });

    it("setContact", async () => {
        const credits = await CreditsERC20.deployed();
        const mail = await MailERC721.deployed();
        const contacts = await Contacts.deployed();

        await credits.approve(mail.address, web3.utils.toWei("10", "ether"), {from: accounts[0]});

        await contacts.setContact(0, ["ETH", "0x24BdEE6026041375e3697916087dE36046Bea2f1", "Ciclano", "24B", "Cic", "24B", "Ful"], {from: accounts[0]});

        const contact = await contacts.getContacts(accounts[0], "ETH", 0, 1);
        assert.equal(contact[0].id, 0, "id is correct");
        assert.equal(contact[0].address_, "0x24BdEE6026041375e3697916087dE36046Bea2f1", "address is correct");
        assert.equal(contact[0].nickname, "Ciclano", "nickname is correct");

        const nickname = await contacts.getNicknameFromAddress(accounts[0], "24B");
        assert.equal(nickname, "Ciclano", "nickname is correct");

        const address = await contacts.getAddressFromNickname(accounts[0], "Cic");
        assert.equal(address, "0x24BdEE6026041375e3697916087dE36046Bea2f1", "address is correct");
    });

    it("addContact 2", async () => {
        const mail = await MailERC721.deployed();
        const contacts = await Contacts.deployed();
        const credits = await CreditsERC20.deployed();

        await credits.transfer(accounts[1], web3.utils.toWei("20", "ether"), {from: accounts[0]});
        await credits.approve(mail.address, web3.utils.toWei("20", "ether"), {from: accounts[1]});

        await mail.addContact(contacts.address, ["ETH", "0x39e81278c865709223554728331A4eF5942D0eA4", "Beltrano", "39e", "Bel"], {from: accounts[1]});
        await mail.addContact(contacts.address, ["ETH", "0xE01ea9F58a0b563B0809f44169A022a7b75642cC", "John Doe", "E01", "Joh"], {from: accounts[1]});

        const contact = await contacts.getContacts(accounts[1], "ETH", 0, 2);
        assert.equal(contact[0].id, 0, "id 0 is correct");
        assert.equal(contact[0].address_, "0x39e81278c865709223554728331A4eF5942D0eA4", "address 0 is correct");
        assert.equal(contact[0].nickname, "Beltrano", "nickname 0 is correct");
        assert.equal(contact[1].id, 1, "id 1 is correct");
        assert.equal(contact[1].address_, "0xE01ea9F58a0b563B0809f44169A022a7b75642cC", "address 1 is correct");
        assert.equal(contact[1].nickname, "John Doe", "nickname 1 is correct");

        let info = await contacts.getInfo(accounts[1], 0);
        assert.equal(info[0], accounts[0], "info[0] 1 is correct");
        info = await contacts.getInfo(accounts[1], 1);
        assert.equal(info[0], accounts[1], "info[0] 2 is correct");
        assert.equal(info[1], 2, "info[1] is correct");
        assert.equal(info[2], 0, "info[2] is correct");
        assert.equal(info[3], 2, "info[3] is correct");

        let nickname = await contacts.getNicknameFromAddress(accounts[1], "39e");
        assert.equal(nickname, "Beltrano", "nickname 1 is correct");
        nickname = await contacts.getNicknameFromAddress(accounts[1], "E01");
        assert.equal(nickname, "John Doe", "nickname 2 is correct");

        let address = await contacts.getAddressFromNickname(accounts[1], "Bel");
        assert.equal(address, "0x39e81278c865709223554728331A4eF5942D0eA4", "address 1 is correct");
        address = await contacts.getAddressFromNickname(accounts[1], "Joh");
        assert.equal(address, "0xE01ea9F58a0b563B0809f44169A022a7b75642cC", "address 2 is correct");
    });

    it("removeContacts", async () => {
        const contacts = await Contacts.deployed();

        await contacts.removeContacts([0], ["39e","Bel"], {from: accounts[1]});

        const contact = await contacts.getContacts(accounts[1], "ETH", 0, 2);
        assert.equal(contact[0].id, 1, "id 0 is correct");
        assert.equal(contact[0].address_, "0xE01ea9F58a0b563B0809f44169A022a7b75642cC", "address 0 is correct");
        assert.equal(contact[0].nickname, "John Doe", "nickname 0 is correct");
        assert.equal(contact[1].id, 0, "id 1 is correct");
        assert.equal(contact[1].address_, "", "address 1 is correct");
        assert.equal(contact[1].nickname, "", "nickname 1 is correct");

        const info = await contacts.getInfo(accounts[1], 1);
        assert.equal(info[0], accounts[1], "info[0] is correct");
        assert.equal(info[1], 2, "info[1] is correct");
        assert.equal(info[2], 1, "info[2] is correct");
        assert.equal(info[3], 2, "info[3] is correct");

        let nickname = await contacts.getNicknameFromAddress(accounts[1], "39e");
        assert.equal(nickname, "", "nickname 1 is correct");
        nickname = await contacts.getNicknameFromAddress(accounts[1], "E01");
        assert.equal(nickname, "John Doe", "nickname 2 is correct");

        let address = await contacts.getAddressFromNickname(accounts[1], "Bel");
        assert.equal(address, "", "address 1 is correct");
        address = await contacts.getAddressFromNickname(accounts[1], "Joh");
        assert.equal(address, "0xE01ea9F58a0b563B0809f44169A022a7b75642cC", "address 2 is correct");
    });
});