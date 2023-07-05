"use strict";

import {shared} from "../shared/shared.mjs";
import {ethers} from "../../imports/ethers-5.6.9.esm.min.js";
import {Constants} from "../shared/constants.mjs";

class Utils{
    constructor() {
        this.buttonStyle = [];
        this.instance = null;
        this.showedAlert = false;
        this.accounts = [];
        this.web3 = new Web3(Constants.DEFAULT_RPC_PROVIDER);
    }

    setInstance(instance){
        this.instance = instance;
    }

    async getWeb3(){
        return new Promise(function(resolve, reject) {
            try {
                utils.checkNetwork(utils.web3)
                    .then(() => resolve(utils.web3))
                    .catch(e => reject(e));
            } catch (e) {
                reject(e);
            }
        });
    }

    checkNetwork(web3){
        return new Promise(function(resolve, reject) {
            try{
                window.ethereum.request({method: 'net_version'})
                    .then(version => {
                        web3.eth.net.getId()
                            .then(async id => {
                                if(version.toString() !== id.toString()){
                                    reject("Error: wrong network.");
                                }
                                else{
                                    resolve(true);
                                }
                            }).catch(e => reject(e));
                    }).catch(e => reject(e));
            }
            catch (e) {
                reject(e);
            }
        });
    }

    getABI(){
        return [
            {"inputs":[{"internalType":"address","name":"to","type":"address"},
                    {"internalType":"uint256","name":"tokenId","type":"uint256"}],
                "name":"approve",
                "outputs":[],
                "stateMutability":"nonpayable","type":"function"},
            {"inputs":[{"internalType":"address","name":"owner","type":"address"},
                    {"internalType":"address","name":"spender","type":"address"}],
                "name":"allowance",
                "outputs":[{"internalType":"uint256","name":"","type":"uint256"}],
                "stateMutability":"view","type":"function"},
            {"inputs": [
                    {"internalType": "address","name": "to","type": "address"},
                    {"internalType": "string","name": "mailBoxUri","type": "string"},
                    {"internalType": "string","name": "mailUri","type": "string"},
                    {"internalType": "uint256","name": "customFee","type": "uint256"}],
                "name": "sendMail",
                "outputs": [],
                "stateMutability": "payable","type": "function"},
            {"inputs": [
                    {"internalType": "address","name": "to","type": "address"},
                    {"internalType": "string","name": "mailBoxUri","type": "string"},
                    {"internalType": "uint256","name": "customFee","type": "uint256"}],
                "name": "sendMail",
                "outputs": [],
                "stateMutability": "payable","type": "function"},
            {"inputs": [
                    {"internalType": "address","name": "userAddress","type": "address"}],
                "name": "getMailBoxInfo",
                "outputs": [
                    {"internalType": "uint256","name": "","type": "uint256"},
                    {"internalType": "string","name": "","type": "string"},
                    {"internalType": "uint256","name": "","type": "uint256"},
                    {"internalType": "bool","name": "","type": "bool"},
                    {"internalType": "uint256","name": "","type": "uint256"},
                    {"internalType": "uint256","name": "","type": "uint256"},
                    {"internalType": "uint256","name": "","type": "uint256"}],
                "stateMutability": "view","type": "function"},
            {"inputs": [
                    {"internalType": "address","name": "userAddress","type": "address"},
                    {"internalType": "uint256","name": "id","type": "uint256"},
                    {"internalType": "uint8","name": "option","type": "uint8"}],
                "name": "getMailInfo",
                "outputs": [
                    {"internalType": "uint256","name": "","type": "uint256"},
                    {"internalType": "uint256","name": "","type": "uint256"},
                    {"internalType": "string","name": "","type": "string"},
                    {"internalType": "uint256","name": "","type": "uint256"},
                    {"internalType": "uint256","name": "","type": "uint256"},
                    {"internalType": "uint256","name": "","type": "uint256"},
                    {"internalType": "uint256","name": "","type": "uint256"},
                    {"internalType": "uint256","name": "","type": "uint256"},
                    {"internalType": "uint256","name": "","type": "uint256"},
                ],
                "stateMutability": "view","type": "function"},
            {"inputs": [
                    {"internalType": "address","name": "userAddress","type": "address"},
                    {"internalType": "uint256","name": "fromId","type": "uint256"},
                    {"internalType": "uint256","name": "toId","type": "uint256"},
                    {"internalType": "uint8","name": "option","type": "uint8"}],
                "name": "getMails",
                "outputs": [
                    {"internalType": "uint256[]","name": "","type": "uint256[]"},
                    {"internalType": "string[]","name": "","type": "string[]"},
                    {"internalType": "uint256[]","name": "","type": "uint256[]"},
                ],
                "stateMutability": "view","type": "function"},
            {"inputs": [
                    {"internalType": "address[]","name": "from","type": "address[]"},
                    {"internalType": "bool[]","name": "to","type": "bool[]"}],
                "name": "blockUsers",
                "outputs": [],
                "stateMutability": "nonpayable","type": "function"},
            {"inputs": [
                    {"internalType": "address","name": "spender","type": "address"},
                    {"internalType": "uint256","name": "addedValue","type": "uint256"}],
                "name": "increaseAllowance",
                "outputs": [],
                "stateMutability": "nonpayable","type": "function"},
            {"inputs": [
                    {"internalType": "address","name": "spender","type": "address"},
                    {"internalType": "uint256","name": "addedValue","type": "uint256"}],
                "name": "decreaseAllowance",
                "outputs": [],
                "stateMutability": "nonpayable","type": "function"},
            {"inputs": [{"internalType": "uint256","name": "amount","type": "uint256"}],
                "name": "buyToken",
                "outputs": [],
                "stateMutability": "payable","type": "function"},
            {"inputs":[
                    {"internalType":"address","name":"account","type":"address"}],
                "name":"balanceOf",
                "outputs":[{"internalType":"uint256","name":"","type":"uint256"}],
                "stateMutability":"view","type":"function"},
            {"inputs":[],
                "name":"getCreditsPrice",
                "outputs":[{"internalType":"uint256","name":"","type":"uint256"}],
                "stateMutability":"pure","type":"function"},
            {"inputs": [{"internalType": "uint256","name": "amount","type": "uint256"}],
                "name": "sellToken",
                "outputs": [],
                "stateMutability": "payable","type": "function"},
            {"inputs": [{"internalType": "uint256","name": "amount","type": "uint256"}],
                "name": "depositToken",
                "outputs": [],
                "stateMutability": "nonpayable","type": "function"},
            {"inputs": [{"internalType": "address","name": "user","type": "address"}],
                "name": "getTotalDeposits",
                "outputs": [{"internalType": "uint256","name": "","type": "uint256"}],
                "stateMutability": "view","type": "function"},
            {"inputs": [{"internalType": "uint256","name": "value","type": "uint256"}],
                "name": "withdrawEther",
                "outputs": [],
                "stateMutability": "nonpayable","type": "function"},
            {"inputs": [{"internalType": "uint256","name": "amount","type": "uint256"}],
                "name": "withdrawToken",
                "outputs": [],
                "stateMutability": "nonpayable","type": "function"},
            {"inputs": [],
                "name": "burnMailBox",
                "outputs": [],
                "stateMutability": "nonpayable","type": "function"},
            {"inputs": [{"internalType": "string[2]","name": "args","type": "string[2]"},
                    {"internalType": "uint256","name": "timeInSecs","type": "uint256"},
                    {"internalType": "address","name": "extensionAddress","type": "address"},
                    {"internalType": "uint256","name": "price","type": "uint256"},
                    {"internalType": "uint256","name": "maxSubscribers","type": "uint256"}],
                "name": "createMailFeed",
                "outputs": [],
                "stateMutability": "nonpayable","type": "function"},
            {"inputs": [],
                "name": "subscribe",
                "outputs": [],
                "stateMutability": "payable","type": "function"},
            {"inputs": [],
                "name": "unsubscribe",
                "outputs": [],
                "stateMutability": "nonpayable","type": "function"},
            {"inputs": [{"internalType": "address","name": "subscriber","type": "address"}],
                "name": "removeSubscriber",
                "outputs": [],
                "stateMutability": "nonpayable","type": "function"},
            {"inputs": [{"internalType": "address[]","name": "feedAddresses","type": "address[]"}],
                "name": "renewMailFeeds",
                "outputs": [],
                "stateMutability": "nonpayable","type": "function"},
            {"inputs": [{"internalType": "address[]","name": "feedAddress","type": "address[]"}],
                "name": "deleteMailFeeds",
                "outputs": [],
                "stateMutability": "nonpayable","type": "function"},
            {"inputs": [{"internalType": "bytes","name": "args","type": "bytes"}],
                "name": "withdrawToken",
                "outputs": [],
                "stateMutability": "nonpayable","type": "function"},
            {"inputs": [],
                "name": "getTokenAddress",
                "outputs": [{"internalType": "address","name": "","type": "address"}],
                "stateMutability": "view","type": "function"},
            {"inputs": [{"internalType": "address","name": "userAddress","type": "address"},
                    {"internalType": "uint256","name": "fromId","type": "uint256"},
                    {"internalType": "uint256","name": "length","type": "uint256"},
                    {"internalType": "uint8","name": "type","type": "uint8"}],
                "name": "getAddresses",
                "outputs": [{"internalType": "address[]","name": "","type": "address[]"}],
                "stateMutability": "view","type": "function"},
            {"inputs": [{"internalType": "uint256","name": "length","type": "uint256"}],
                "name": "getSubscribers",
                "outputs": [{"internalType": "address[]","name": "","type": "address[]"}],
                "stateMutability": "view","type": "function"},
            {"inputs": [{"internalType": "address","name": "feedAddress","type": "address"},
                    {"internalType": "address[]","name": "to","type": "address[]"},
                    {"internalType": "string[]","name": "mailUri","type": "string[]"}],
                "name": "sendFeed",
                "outputs": [],
                "stateMutability": "nonpayable","type": "function"},
            {"inputs": [{"internalType": "address","name": "feedAddress","type": "address"},
                    {"internalType": "uint256","name": "id","type": "uint256"}],
                "name": "getSubscriber",
                "outputs": [{"internalType": "uint256","name": "","type": "uint256"},
                    {"components": [{"internalType": "address","name": "address_","type": "address"},
                            {"internalType": "uint256","name": "subscribeTime","type": "uint256"},
                            {"internalType": "uint256","name": "expiryTime","type": "uint256"},
                            {"internalType": "bool","name": "isBlocked","type": "bool"}],
                        "internalType": "struct Feed.Subscriber","name": "","type": "tuple"}],
                "stateMutability": "view","type": "function"},
            {"inputs": [],
                "name": "symbol",
                "outputs": [{"internalType": "string","name": "","type": "string"}],
                "stateMutability": "view","type": "function"},
            {"inputs": [{"internalType": "address","name": "address_","type": "address"},
                        {"internalType": "bool","name": "status","type": "bool"}],
                "name": "blockAddress",
                "outputs": [],
                "stateMutability": "nonpayable","type": "function"},
            {"inputs": [{"internalType": "address","name": "from","type": "address"},
                    {"internalType": "address","name": "to","type": "address"},
                    {"internalType": "uint256","name": "fromId","type": "uint256"},
                    {"internalType": "uint256","name": "length","type": "uint256"}],
                "name": "getFromToInfo",
                "outputs": [{"internalType": "uint256","name": "","type": "uint256"},
                    {"internalType": "uint256[]","name": "","type": "uint256[]"},
                    {"internalType": "bool","name": "","type": "bool"},
                    {"internalType": "bool","name": "","type": "bool"}],
                "stateMutability": "view","type": "function"},
            {"inputs": [{"internalType": "address","name": "mailFeedAddress","type": "address"},
                    {"internalType": "address","name": "owner","type": "address"},
                    {"internalType": "uint256","name": "id","type": "uint256"}],
                "name": "getInfo",
                "outputs": [{
                        "components": [
                            {"internalType": "string","name": "name","type": "string"},
                            {"internalType": "string","name": "description","type": "string"},
                            {"internalType": "address","name": "owner","type": "address"},
                            {"internalType": "uint256","name": "expiryTime","type": "uint256"}
                        ],
                        "internalType": "struct MailFeeds.MailFeed", "name": "","type": "tuple"},
                        {"internalType": "uint256","name": "","type": "uint256"},
                        {"internalType": "address","name": "","type": "address"},
                        {"internalType": "uint24","name": "","type": "uint24"}],
                "stateMutability": "view","type": "function"
            },
            {"inputs": [{"internalType": "address","name": "owner","type": "address"},
                    {"internalType": "uint8","name": "minRating","type": "uint8"},
                    {"internalType": "uint256","name": "length","type": "uint256"}],
                "name": "getTotals",
                "outputs": [{"internalType": "uint256","name": "","type": "uint256"},
                    {"internalType": "uint256","name": "","type": "uint256"},
                    {"internalType": "uint256","name": "","type": "uint256"}],
                "stateMutability": "view","type": "function"
            },
            {"inputs": [{"internalType": "address","name": "user","type": "address"}],
                "name": "getExtensionInfo",
                "outputs": [{"internalType": "address","name": "","type": "address"}],
                "stateMutability": "view","type": "function"},
            {"inputs": [{"internalType": "address[]","name": "to","type": "address[]"},
                    {"internalType": "string[]","name": "mailUri","type": "string[]"},
                    {"internalType": "uint256[]","name": "customFees","type": "uint256[]"}],
                "name": "sendMails",
                "outputs": [],
                "stateMutability": "payable","type": "function"},
            {"anonymous":false,"inputs":[
                    {"indexed":false,"internalType":"address","name":"contract_","type":"address"},
                    {"indexed":true,"internalType":"address","name":"from","type":"address"},
                    {"indexed":true,"internalType":"address","name":"to","type":"address"},
                    {"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],
                "name":"Fee",
                "type":"event"},
            {"inputs": [],
                "name": "getTokenSymbol",
                "outputs": [{"internalType": "string","name": "","type": "string"}],
                "stateMutability": "view","type": "function"},
            {"inputs": [],
                "name": "getInfo",
                "outputs": [{"internalType": "uint256","name": "","type": "uint256"},
                    {"internalType": "uint256","name": "","type": "uint256"},
                    {"internalType": "uint256","name": "","type": "uint256"},
                    {"internalType": "uint256","name": "","type": "uint256"},
                    {"internalType": "uint256","name": "","type": "uint256"},
                    {"internalType": "uint256","name": "","type": "uint256"}],
                "stateMutability": "view","type": "function"},
            {"inputs": [{"internalType": "address","name": "extensionAddress","type": "address"},
                    {"internalType": "uint256","name": "fee","type": "uint256"},
                    {"internalType": "bool","name": "isAlwaysPaid","type": "bool"},
                    {"internalType": "address","name": "from","type": "address"},
                    {"internalType": "bool","name": "free","type": "bool"}],
                "name": "setFee",
                "outputs": [],
                "stateMutability": "nonpayable","type": "function"},
            {"inputs": [],
                "name": "getExtensionInfo",
                "outputs": [{"internalType": "address","name": "","type": "address"}],
                "stateMutability": "view","type": "function"},
            {"inputs": [{"internalType": "address","name": "extensionAddress","type": "address"},
                    {"internalType": "uint256","name": "timeInSecs_","type": "uint256"},
                    {"internalType": "uint256","name": "price_","type": "uint256"}],
                "name": "setInfo",
                "outputs": [],
                "stateMutability": "nonpayable","type": "function"},
            {"inputs": [{"internalType": "address","name": "user","type": "address"}],
                "name": "getRating",
                "outputs": [{"internalType": "uint8","name": "","type": "uint8"},
                    {"internalType": "uint8","name": "","type": "uint8"},
                    {"internalType": "uint256","name": "","type": "uint256"}],
                "stateMutability": "view","type": "function"},
            {"inputs": [{"internalType": "uint8","name": "rating_","type": "uint8"}],
                "name": "setRating",
                "outputs": [],
                "stateMutability": "nonpayable","type": "function"},
            {"inputs": [{"internalType": "address","name": "user","type": "address"},
                    {"internalType": "uint256","name": "id","type": "uint256"}],
                "name": "getInfo",
                "outputs": [{"internalType": "address","name": "","type": "address"},
                    {"internalType": "uint256","name": "","type": "uint256"},
                    {"internalType": "uint256","name": "","type": "uint256"},
                    {"internalType": "uint256","name": "","type": "uint256"},
                    {"internalType": "address","name": "","type": "address"}],
                "stateMutability": "view","type": "function"},
            {"inputs": [{"internalType": "address","name": "from","type": "address"},
                    {"internalType": "string","name": "symbol","type": "string"},
                    {"internalType": "uint256","name": "fromId","type": "uint256"},
                    {"internalType": "uint256","name": "length","type": "uint256"}],
                "name": "getContacts",
                "outputs": [{"components": [{"internalType": "uint256","name": "id","type": "uint256"},
                            {"internalType": "string","name": "symbol","type": "string"},
                            {"internalType": "string","name": "address_","type": "string"},
                        {"internalType": "string","name": "nickname","type": "string"}],
                        "internalType": "struct Contacts.Contact[]","name": "","type": "tuple[]"}],
                "stateMutability": "view", "type": "function"},
            {"inputs": [{"internalType": "uint256[]","name": "ids","type": "uint256[]"},
                        {"internalType": "string[]","name": "args","type": "string[]"}],
                "name": "removeContacts",
                "outputs": [],
                "stateMutability": "nonpayable","type": "function"},
            {"inputs": [{"internalType": "address","name": "user","type": "address"},
                    {"internalType": "string[5]","name": "args","type": "string[5]"}],
                "name": "addContact",
                "outputs": [],
                "stateMutability": "nonpayable","type": "function"},
            {"inputs": [{"internalType": "address","name": "user","type": "address"},
                    {"internalType": "string","name": "addressToNickname","type": "string"}],
                "name": "getNicknameFromAddress",
                "outputs": [{"internalType": "string","name": "","type": "string"}],
                "stateMutability": "view","type": "function"},
            {"inputs": [{"internalType": "address","name": "user","type": "address"},
                    {"internalType": "string","name": "nicknameToAddress","type": "string"}],
                "name": "getAddressFromNickname",
                "outputs": [{"internalType": "string","name": "","type": "string"}],
                "stateMutability": "view","type": "function"},
            {"inputs": [{"internalType": "address","name": "owner_","type": "address"},
                    {"internalType": "uint256","name": "fromId","type": "uint256"},
                    {"internalType": "uint256","name": "length","type": "uint256"},
                    {"internalType": "uint256","name": "total","type": "uint256"},
                    {"internalType": "bool","name": "notExpired","type": "bool"},
                    {"internalType": "uint8","name": "minRating","type": "uint8"}],
                "name": "getFeeds",
                "outputs": [{"internalType": "address[]","name": "","type": "address[]"}],
                "stateMutability": "view","type": "function"},
            {"inputs": [],
                "name": "getMailFeedsAddress",
                "outputs": [{"internalType": "address","name": "","type": "address"}],
                "stateMutability": "view","type": "function"},
            {"inputs": [],
                "name": "getPrices",
                "outputs": [{"internalType": "uint80","name": "","type": "uint80"},
                    {"internalType": "uint64","name": "","type": "uint64"}],
                "stateMutability": "view","type": "function"},
            {"inputs": [{"internalType": "uint256","name": "id","type": "uint256"},
                    {"internalType": "string[7]","name": "args","type": "string[7]"}],
                "name": "setContact",
                "outputs": [],
                "stateMutability": "nonpayable","type": "function"},
            {"inputs":[{"internalType":"address","name":"from","type":"address"},
                    {"internalType":"uint256","name":"amount","type":"uint256"}],
                "name":"transfer",
                "outputs":[],
                "stateMutability":"nonpayable","type":"function"},
            {"inputs": [
                    {"internalType": "uint256[]","name": "mailIds","type": "uint256[]"}],
                "name": "burnMails",
                "outputs": [],
                "stateMutability": "nonpayable","type": "function"},
            {"inputs": [],
                "name": "decimals",
                "outputs": [{"internalType": "uint256","name": "","type": "uint256"}],
                "stateMutability": "nonpayable","type": "function"},
            {"inputs": [],
                "name": "getDecimals",
                "outputs": [{"internalType": "uint256","name": "","type": "uint256"}],
                "stateMutability": "view","type": "function"},
            {"inputs": [],
                "name": "getFeedAddress",
                "outputs": [{"internalType": "address","name": "","type": "address"}],
                "stateMutability": "view","type": "function"},
            {"inputs": [{"internalType":"address","name": "operator","type": "address"},
                    {"internalType":"address","name": "from","type": "address"},
                    {"internalType":"uint256","name": "tokenId","type": "uint256"},
                    {"internalType":"bytes","name": "data","type": "bytes"}],
                "name": "onERC721Received",
                "outputs": [{"internalType":"bytes4","name": "","type": "bytes4"}],
                "stateMutability":"pure","type": "function"},
            {"inputs": [],
                "name": "getPrice",
                "outputs": [{"internalType": "uint256","name": "","type": "uint256"}],
                "stateMutability": "view","type": "function"},
            {"inputs": [],
                "name": "getTokenDecimals",
                "outputs": [{"internalType": "uint256","name": "","type": "uint256"}],
                "stateMutability": "view","type": "function"},
            {"inputs": [{"internalType": "bytes4","name": "interfaceId","type": "bytes4"}],
                "name": "supportsInterface",
                "outputs": [{"internalType": "bool","name": "","type": "bool"}],
                "stateMutability": "view","type": "function"},
            {"inputs":[],
                "name":"getMinCreditsAmount",
                "outputs":[{"internalType":"uint256","name":"","type":"uint256"}],
                "stateMutability":"pure","type":"function"},
            {"inputs":[{"internalType":"address","name":"extensionAddress","type":"address"},
                    {"internalType":"bool","name":"status","type":"bool"}],
                "name":"setExtension",
                "outputs":[],
                "stateMutability":"nonpayable","type":"function"},
            {"inputs":[{"internalType":"address","name":"tokenAddress","type":"address"}],
                "name":"create",
                "outputs":[],
                "stateMutability":"nonpayable","type":"function"},
            {"inputs":[{"internalType":"address","name":"user","type":"address"}],
                "name":"getExtensionAddress",
                "outputs":[{"internalType":"address","name":"","type":"address"}],
                "stateMutability":"view","type":"function"},
            {"inputs":[],
                "name":"owner",
                "outputs":[{"internalType":"address","name":"","type":"address"}],
                "stateMutability":"view","type":"function"},
            {"inputs":[{"internalType":"uint256","name":"id","type":"uint256"}],
                "name":"getSecondaryFees",
                "outputs": [{"components": [{"internalType": "address","name": "contract_","type": "address"},
                        {"internalType": "string","name": "symbol","type": "string"},
                        {"internalType": "uint256","name": "decimals","type": "uint256"},
                        {"internalType": "uint256","name": "value","type": "uint256"},
                        {"internalType": "bool","name": "or","type": "bool"}],
                    "internalType": "struct IMailExtension.SecondaryFee","name": "","type": "tuple"}],
                "stateMutability":"view","type":"function"},
        ];
    }

    async getContract(smartContractAddress){
        return new Promise(function(resolve, reject) {
            try {
                utils.getWeb3()
                    .then(web3 => resolve(new web3.eth.Contract(utils.getABI(), smartContractAddress)))
                    .catch(e => reject(e));
            } catch (e) {
                reject(e);
            }
        });
    }

    async checkAddress(address){
        try{
            const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
            address = address.toString().trim().replaceAll(" ","");
            if(address.toString().includes(".") || address.toString().length !== 42){
                address = await provider.resolveName(address);
                return address;
            }
            else{
                /*const code = await provider.getCode(address);
                if(code !== '0x'){
                    const contract = await this.getContract(address);
                    return await this.isERC721Receiver(contract) ? address : false;
                }
                else{*/
                    return ethers.utils.getAddress(address);
                //}
            }
        }
        catch (_) {
            return false;
        }
    }

    isAddress(address){
        return address.toString().toLowerCase().startsWith("0x") && address.toString().length <= 42;
    }

    async isERC721Receiver(contract){
        try{
            const r = await contract.methods.onERC721Received(Constants.ZERO_ADDRESS, Constants.ZERO_ADDRESS, 0, []).call();
            return r === '0x150b7a02';
        }
        catch (_) {
            return false;
        }
    }

    hideLoading() {
        shared.hideLoading();
    }

    showAlert(error){
        console.log(error)
        this.showedAlert = true;
        this.hideLoading();
        if(error.code === 4001) {
            if(this.instance){
                this.showedAlert = false;
                this.instance.onRejectTx(error);
            }
            else if(error.message){
                //this.alert(error.message);
            }
        }
        else if(error.status && error.response && error.message){
            this.alert("Error "+error.status+" - "+error.message+"\n\nMore Info:\n\n"+error.response);
        }
        else if(error.reason){
            this.alert(this.capitalizeFirstLetter(error.reason));
        }
        else if(error.message){
            this.alert(error.message);
        }
        else{
            this.alert(error);
        }
    }

    alert(text){
        alert(text);
        this.showedAlert = false;
    }

    async showConfirm(message){
        try{
            this.showedAlert = true;
            await this.hideLoading();
            const r = confirm(message);
            this.showedAlert = false;
            return r;
        }
        catch (e) {
            this.showAlert(e);
        }
        return undefined;
    }

    async getBlockDate(web3, block){
        const dateTimeStamp = (await web3.eth.getBlock(block)).timestamp;
        const d = new Date(dateTimeStamp * 1000);
        const date = d.toLocaleString("en-US", {year: 'numeric', month: 'short', day: 'numeric'});
        const time = d.toLocaleString("en-US", {hour: '2-digit', minute:'2-digit', timeZone:'UTC', timeZoneName:"short"});
        return {date: date, time: time};
    }

    async getSelectedAddress(instance){
        return new Promise(async function(resolve, reject) {
            try {
                await window.ethereum.request({method: 'eth_requestAccounts'});
                const accounts = await window.ethereum.request({method: 'eth_accounts'});
                if (accounts.length > 0) {
                    resolve(accounts[0]);
                } else {
                    reject("Error: there is no account connected to MetaMask.");
                }
            } catch (e) {
                if(instance){
                    instance.onNotConnected();
                }
                else{
                    reject(e);
                }
            }
        });
    }

    async getConnectedAccounts(){
        return window.ethereum.request({method: 'eth_accounts'});
    }

    getButtonStyle(className, index){
        if(document.getElementsByClassName(className)[index].classList.toString().includes("btn-primary")){
            return "btn-primary";
        }
        else if(document.getElementsByClassName(className)[index].classList.toString().includes("btn-secondary")){
            return "btn-secondary";
        }
        else if(document.getElementsByClassName(className)[index].classList.toString().includes("btn-success")){
            return "btn-success";
        }
        else if(document.getElementsByClassName(className)[index].classList.toString().includes("btn-danger")){
            return "btn-danger";
        }
        else if(document.getElementsByClassName(className)[index].classList.toString().includes("btn-warning")){
            return "btn-warning";
        }
        else if(document.getElementsByClassName(className)[index].classList.toString().includes("btn-info")){
            return "btn-info";
        }
        else if(document.getElementsByClassName(className)[index].classList.toString().includes("btn-light")){
            return "btn-light";
        }
        else if(document.getElementsByClassName(className)[index].classList.toString().includes("btn-dark")){
            return "btn-dark";
        }
        else{
            return window.getComputedStyle(document.getElementsByClassName(className)[index]).backgroundColor;
        }
    }

    disableButton(className, index){
        this.buttonStyle[className+index] = this.getButtonStyle(className, index);
        document.getElementsByClassName(className)[index].classList.remove(utils.buttonStyle[className+index])
        document.getElementsByClassName(className)[index].classList.add("btn-secondary");
        document.getElementsByClassName(className)[index].disabled = true;
    }

    enableButton(className, index){
        document.getElementsByClassName(className)[index].classList.remove("btn-secondary");
        if(utils.buttonStyle[className+index].includes("btn-")){
            document.getElementsByClassName(className)[index].classList.add(utils.buttonStyle[className+index]);
        }
        else{
            document.getElementsByClassName(className)[index].style.background = this.buttonStyle[className+index];
        }
        document.getElementsByClassName(className)[index].disabled = false;
    }

    async listenMetaMaskEvents(instance) {
        return new Promise(async function (resolve, reject) {
            try {
                if (typeof window.ethereum !== 'undefined' && window.ethereum.isMetaMask) {
                    const provider = await detectEthereumProvider();
                    if(provider && provider !== window.ethereum){
                        reject('Error: do you have multiple wallets installed?');
                    }
                    else if(!provider){
                        reject({title: Constants.NO_METAMASK_TITLE, text: Constants.NO_METAMASK, lastText: Constants.METAMASK_DOWNLOAD_URL, link: Constants.METAMASK_DOWNLOAD_URL});
                    }
                    window.ethereum
                        .request({method: 'eth_requestAccounts'})
                        .then(accounts => {
                            if (accounts.length === 0) {
                                reject('Error: please connect to MetaMask.');
                            }
                            else{
                                //utils.accounts = accounts;
                                resolve(accounts[0]);
                            }
                        })
                        .catch(e => {
                            if(instance){
                                instance.onNotConnected();
                            }
                            else{
                                reject(e);
                            }
                        });
                    window.ethereum.on('accountsChanged', () => {
                        if(instance){
                            instance.onAccountsChanged();
                        }
                        else{
                            window.location.reload();
                        }
                    });
                    window.ethereum.on('chainChanged', () => {
                        if(instance){
                            instance.onChainChanged();
                        }
                        else{
                            window.location.reload();
                        }
                    });
                }
                else{
                    reject({title: Constants.NO_METAMASK_TITLE, text: Constants.NO_METAMASK, lastText: Constants.METAMASK_DOWNLOAD_URL, link: Constants.METAMASK_DOWNLOAD_URL});
                }
            } catch (e) {
                reject(e);
            }
        });
    }

    onAccountsChanged(){}
    onChainChanged(){}

    getEllipsis(text, maxLength, textEnd){
        const end = (textEnd !== null && textEnd !== undefined) ? textEnd : "";
        if(text && (text.length + end.length) > maxLength){
            const ellipsis = "...";
            return text.substring(0, maxLength - ellipsis.length - end.length) + ellipsis + end;
        }
        return text + end;
    }

    async getTxValues(){
        const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
        const signer = provider.getSigner();
        const iface = new ethers.utils.Interface(this.getABI());
        return {signer: signer, iface: iface};
    }

    async getBigNumber(value){
        return ethers.BigNumber.from(value);
    }

    saveFile(data, filename, type) {
        const file = new Blob([data], {type: type});
        if (window.navigator.msSaveOrOpenBlob) // IE10+
            window.navigator.msSaveOrOpenBlob(file, filename);
        else { // Others
            const a = document.createElement("a");
            const url = URL.createObjectURL(file);
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            setTimeout(function() {
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
            }, 0);
        }
    }

    setEnterClick(input, action){
        input.addEventListener("keyup", function(event) {
            // Number 13 is the "Enter" key on the keyboard
            if (event.key === 'Enter') {
                // Cancel the default action, if needed
                event.preventDefault();
                // Trigger the button element with a click
                action();
            }
        });
    }

    async returnResponse(response){
        if(response.status === 200){
            return response.json();
        }
        else{
            const error = {
                status: response.status,
                message: response.statusText,
                response: await response.text()
            }
            return Promise.reject(error);
        }
    }

    getRandomValues(){
        const randomArrayBuffer = window.crypto.getRandomValues(new Uint8Array(32));
        const textDecoder = new TextDecoder("utf-8");
        return textDecoder.decode(randomArrayBuffer);
    }

    isMobileBrowser(){
        return this.isIos() ? true : (utils.isKindle() ? true : this.isMobile());
    }

    isMobile(){
        let check = false;
        (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
        return check;
    }

    isIos(){
        const toMatch = [
            /Android/i,
            /webOS/i,
            /iPhone/i,
            /iPad/i,
            /iPod/i,
            /BlackBerry/i,
            /Windows Phone/i
        ];

        return toMatch.some((toMatchItem) => {
            return navigator.userAgent.match(toMatchItem);
        });
    }

    isKindle(){
        const ua = navigator.userAgent;
        return /Kindle/i.test(ua) || /Silk/i.test(ua) || /KFTT/i.test(ua) || /KFOT/i.test(ua) || /KFJWA/i.test(ua) || /KFJWI/i.test(ua) || /KFSOWI/i.test(ua) || /KFTHWA/i.test(ua) || /KFTHWI/i.test(ua) || /KFAPWA/i.test(ua) || /KFAPWI/i.test(ua);
    }

    get32BytesPassword(password, salt){
        const key = CryptoJS.PBKDF2(password, salt, {keySize: 128 / 32, iterations: 10000});
        return key.toString();
    }

    async checkIfMetaMaskIsInstalled(){
        return new Promise(async function(resolve, reject) {
            try {
                const e = {
                    title: Constants.NO_METAMASK_TITLE,
                    text: Constants.NO_METAMASK,
                    lastText: Constants.METAMASK_DOWNLOAD_URL,
                    link: Constants.METAMASK_DOWNLOAD_URL,
                }

                if (typeof window.ethereum !== 'undefined' && window.ethereum.isMetaMask) {
                    const provider = await detectEthereumProvider();
                    if (provider && provider !== window.ethereum) {
                        reject('Error: do you have multiple wallets installed?');
                    } else if (!provider) {
                        reject(e);
                    }
                    resolve(true);
                }
                else{
                    reject(e);
                }
            } catch (e) {
                reject(e);
            }
        });
    }

    getDate(timestamp){
        const d = new Date(timestamp);
        return d.toDateString();
    }

    async getSha256(text){
        const hashBuffer = await crypto.subtle.digest('SHA-256', (new TextEncoder()).encode(text));
        const hashArray = Array.from(new Uint8Array(hashBuffer));// convert buffer to byte array
        return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    }

    capitalizeFirstLetter(text) {
        return text.charAt(0).toUpperCase() + text.slice(1);
    }

    urlToFile(url, filename, mimeType){
        return (fetch(url)
                .then(function(res){return res.arrayBuffer();})
                .then(function(buf){return new File([buf], filename,{type:mimeType});})
        );
    }

    getFeeEvent(mailContract, filter, block){
        return new Promise(async function(resolve, reject) {
            try{
                await mailContract.getPastEvents('Fee', {
                    filter: filter,
                    fromBlock: block,
                    toBlock: block,
                }, async function(e, events){
                    if(!e){
                        if(events && events.length > 0){
                            resolve({value: events[0].returnValues.value, contract: events[0].returnValues.contract_});
                        }
                        else{
                            resolve({value: '0', contract: ""});
                        }
                    }
                    else{
                        reject(e);
                    }
                });
            }
            catch (e) {
                reject(e);
            }
        });
    }

    copyToClipboard(text){
        return new Promise(async function(resolve, reject) {
            try{
                navigator.clipboard.writeText(text).then(function() {
                    resolve(true);
                }, function(err) {
                    reject(err);
                });
            }
            catch (e) {
                reject(e);
            }
        });
    }

    getNameNormalized(name){
        return name.toString().trim().toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, "").replaceAll(" ","");
    }

    getTime(timestamp){
        const d = new Date(timestamp);
        return ("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2) + ":" + ("0" + d.getSeconds()).slice(-2);
    }

    setCookie(cname, cvalue, exdays) {
        const d = new Date();
        d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
        if(exdays){
            let expires = "expires="+d.toUTCString();
            document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/;SameSite=Lax";
        }
        else{
            document.cookie = cname + "=" + cvalue + ";path=/;SameSite=Lax";
        }
    }

    getCookie(cname) {
        let name = cname + "=";
        let decodedCookie = decodeURIComponent(document.cookie);
        let ca = decodedCookie.split(';');
        for(let i = 0; i <ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) === ' ') {
                c = c.substring(1);
            }
            if (c.indexOf(name) === 0) {
                return c.substring(name.length, c.length);
            }
        }
        return "";
    }

    async getUnit(contract, web3){
        return new Promise(async function(resolve, reject) {
            try{
                let decimals = await contract.methods.decimals().call();
                if(!decimals){
                    decimals = await contract.methods.getDecimals().call();
                }

                if(decimals){
                    const decimal = "1".padEnd(parseInt(decimals) + 1, "0");
                    const {unitMap} = web3.utils;
                    resolve({unit: Object.keys(unitMap).find((k) => unitMap[k] === decimal), decimals: decimals});
                }
                else{
                    reject("ether");
                }
            }
            catch (e) {
                reject(e);
            }
        });
    }

    findUnit(decimals, web3){
        const decimal = "1".padEnd(parseInt(decimals) + 1, "0");
        const {unitMap} = web3.utils;
        return Object.keys(unitMap).find((k) => unitMap[k] === decimal);
    }

    getNumericDate(d){
        return parseInt(d.getFullYear() + "" + ("0" + d.getMonth()).slice(-2) + "" + ("0" + d.getDate()).slice(-2) + "" +
            ("0" + d.getHours()).slice(-2) + "" + ("0" + d.getMinutes()).slice(-2) + "" + ("0" + d.getSeconds()).slice(-2));
    }

    countDecimals(value) {
        const text = value.toString();
        // verify if number 0.000005 is represented as "5e-6"
        if (text.indexOf('e-') > -1) {
            const [, trail] = text.split('e-');
            return parseInt(trail, 10);
        }
        // count decimals for number in representation like "0.123456"
        if (Math.floor(value) !== value) {
            const decimals = value.toString().split(".")[1];
            return decimals ? (decimals.length || 0) : 0;
        }
        return 0;
    }
}
const utils = new Utils();
export {utils};
