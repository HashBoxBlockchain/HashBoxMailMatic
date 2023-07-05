const MailERC721 = artifacts.require("MailERC721");
const MailERC721Attack_2 = artifacts.require("MailERC721Attack_2");
const BN = web3.utils.BN;

contract("MailERC721Attack_2", accounts => {
    /*it("block", async () => {
        const attack = await MailERC721Attack_2.deployed();

        return MailERC721.deployed().then(async () => {
            const attacker = accounts[0];

            //the attacker blocks the contract when he/she sends ether to the contract
            return await attack.attack({from: attacker, value: web3.utils.toWei("1", "ether")});

        }).then(async () => {}, async () => {});
    });*/
});