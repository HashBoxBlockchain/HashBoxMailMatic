"use strict";

import {utils} from "../utils/utils.mjs";
import {shared} from "../shared/shared.mjs";
import {Constants} from "../shared/constants.mjs";

class Partner {
    constructor() {
        this.web3 = new Web3(Constants.RPC_PROVIDER);
        this.actionType = 0;
        this.extensionAddress = "";
        this.address = "";
        this.listenEvents();
    }

    listenEvents() {
        const self = this;
        document.addEventListener("DOMContentLoaded", async function() {
            utils.checkIfMetaMaskIsInstalled()
                .then(async () => {
                    if(utils.isMobileBrowser()) {
                        shared.showWarning();
                    }
                    else{
                        self.onDOMContentLoaded();
                    }
                })
                .catch(e => {
                    if(e.title && e.text && e.lastText && e.link){
                        shared.showWarning(e.title, e.text, e.lastText, e.link);
                    }
                    else{
                        utils.showAlert(e);
                    }
                });
        });
    }

    async onAccountsChanged(){
        this.address = this.web3.utils.toChecksumAddress(await utils.getSelectedAddress());
        window.location.reload();
    }

    onChainChanged(){}

    onNotConnected(){
        this.onDOMContentLoaded();
    }

    onDOMContentLoaded(){
        this.clicks();
        this.initViews().catch(e => utils.showAlert(e));
    }

    clicks(){
        document.getElementsByClassName('set-extension')[0].addEventListener('click', this.setMailExtension);
        document.getElementsByClassName('create-extension')[0].addEventListener('click', this.createMailERC721Extension);
        document.getElementsByClassName('custom-btn-warning')[2].addEventListener('click', this.onCookieClicked);
        document.getElementsByClassName('custom-btn-warning')[3].addEventListener('click', this.onOKClicked);
        document.getElementsByClassName('set-new-extension')[0].addEventListener('click', this.setNewMailExtension);
        utils.setEnterClick(document.getElementsByClassName("nft-contract-address")[0], this.createMailERC721Extension);
    }

    async initViews(){
        const accounts = await utils.getConnectedAccounts();
        const isAllowedCookie = utils.getCookie("allowed-cookie");
        if(accounts.length === 0 && isAllowedCookie === "true"){
            this.showConnectWalletDialog();
        }
        else if(accounts.length === 0 && isAllowedCookie !== "true"){
            this.actionType = Constants.ACTION_CONNECT;
            this.showCookieDialog();
        }
        else{
            utils.listenMetaMaskEvents(this)
                .then(address => {
                    if(utils.isMobileBrowser()) {
                        shared.showWarning();
                    }
                    else{
                        this.address = this.web3.utils.toChecksumAddress(address);
                    }
                })
                .catch(e => {
                    if(e.title && e.text && e.lastText && e.link){
                        shared.showWarning(e.title, e.text, e.lastText, e.link);
                    }
                    else{
                        utils.showAlert(e);
                    }
                });
        }
    }

    onCookieClicked(){
        utils.setCookie("allowed-cookie","true", Constants.COOKIE_EXPIRY_TIME);
        if(partner.actionType === Constants.ACTION_CONNECT){
            partner.showConnectWalletDialog();
        }
        else{
            partner.hideDialog();
        }
    }

    onOKClicked(){
        if(partner.actionType === Constants.ACTION_CONNECT){
            utils.listenMetaMaskEvents(partner)
                .then(() => {
                    if(utils.isMobileBrowser()) {
                        shared.showWarning();
                    }
                    else{
                        window.location.reload();
                    }
                })
                .catch(e => {
                    if(e.title && e.text && e.lastText && e.link){
                        shared.showWarning(e.title, e.text, e.lastText, e.link);
                    }
                    else{
                        utils.showAlert(e);
                    }
                });
        }
        else if(partner.actionType === Constants.ACTION_CREATE_EXTENSION_WARNING){
            partner.hideDialog();
            shared.showLoading();
        }
        else{
            shared.hideLoading();
            partner.hideDialog();
        }
        partner.actionType = 0;
    }

    showConnectWalletDialog(){
        this.actionType = Constants.ACTION_CONNECT;
        document.getElementsByClassName("custom-title-warning")[2].innerHTML = "Connect Wallet";
        document.getElementsByClassName("custom-text-warning")[4].innerHTML = 'You must connect to MetaMask first.<br><br>Click on the \'CONNECT\' button<br>to connect to MetaMask.';
        document.getElementsByClassName("custom-btn-warning")[3].innerHTML = "CONNECT";
        shared.hideClassName("custom-text-warning", 5);
        shared.showClassName("custom-btn-warning", 3);
        shared.hideClassName("custom-btn-warning", 4);
        shared.showClassName("dialog-background", 0);
        shared.showClassName("custom-dialog-warning-small", 0);
        shared.hideLoading();
    }

    showCookieDialog(){
        const isAllowedCookie = utils.getCookie("allowed-cookie");
        if(!isAllowedCookie || isAllowedCookie === "false" || isAllowedCookie === ""){
            document.getElementsByClassName("custom-title-warning")[1].innerHTML = "Terms and Privacy";
            document.getElementsByClassName("custom-text-warning")[2].innerHTML = 'We use cookies to ensure you get the<br>best experience on our website.<br><br>By clicking on the button \'OK\' you agree<br>the <a href="terms" target="_blank">Terms of Services</a> and the <a href="privacy" target="_blank">Privacy Policy</a>.';
            document.getElementsByClassName("custom-btn-warning")[2].innerHTML = "OK";
            shared.hideClassName("custom-text-warning", 3);
            shared.hideClassName("custom-btn-warning", 1);
            shared.showClassName("custom-btn-warning", 2);
            shared.showClassName("dialog-background", 0);
            shared.showClassName("custom-dialog-warning-medium", 0);
            shared.hideLoading();
        }
    }

    showCreateExtensionWarningDialog(){
        this.actionType = Constants.ACTION_CREATE_EXTENSION_WARNING;
        document.getElementsByClassName("custom-title-warning")[2].innerHTML = "Warning";
        document.getElementsByClassName("custom-text-warning")[4].innerHTML = 'Creating your customized NFT fee.<br>DO NOT close this tab, window or browser.';
        document.getElementsByClassName("custom-btn-warning")[3].innerHTML = "OK, I UNDERSTOOD";
        shared.hideClassName("custom-text-warning", 5);
        shared.showClassName("custom-btn-warning", 3);
        shared.hideClassName("custom-btn-warning", 4);
        shared.showClassName("dialog-background", 0);
        shared.showClassName("custom-dialog-warning-small", 0);
        shared.hideLoading();
    }

    showNowYouCanUseNFTFeeDialog(){
        document.getElementsByClassName("custom-title-warning")[2].innerHTML = "Transaction Confirmed";
        document.getElementsByClassName("custom-text-warning")[4].innerHTML = "The transaction has been confirmed and<br>the NFT fee has been created.<br>Now you can use your NFT fee.";
        document.getElementsByClassName("custom-btn-warning")[3].innerHTML = "OK";
        shared.hideClassName("custom-text-warning", 5);
        shared.showClassName("custom-btn-warning", 3);
        shared.hideClassName("custom-btn-warning", 4);
        shared.showClassName("dialog-background", 0);
        shared.showClassName("custom-dialog-warning-small", 0);
        shared.hideLoading();
    }

    hideDialog(){
        shared.hideClassName("dialog-background", 0);
        shared.hideClassName("custom-dialog-warning-large", 0);
        shared.hideClassName("custom-dialog-warning-medium", 0);
        shared.hideClassName("custom-dialog-warning-small", 0);
    }

    async setMailExtension(){
        shared.showLoading();
        const txValues = await utils.getTxValues();

        let tx;
        tx = {
            to: Constants.MAIL_CONTRACT_ADDRESS,
            data: txValues.iface.encodeFunctionData("setExtension(address,bool)", [
                Constants.PARTNER_MAIL_EXTENSION, true
            ])
        };

        txValues.signer.sendTransaction(tx)
            .then(() => {
                partner.actionType = 0;
                shared.hideLoading();
            })
            .catch(e => {
                partner.actionType = 0;
                utils.showAlert({e}.e);
            });
    }

    async createMailERC721Extension(){
        partner.showCreateExtensionWarningDialog();
        document.getElementsByClassName("set-new-extension")[0].classList.add("disabled");
        const nftAddress = document.getElementsByClassName("nft-contract-address")[0].value;
        const txValues = await utils.getTxValues();

        let tx;
        tx = {
            to: Constants.CREATE_MAIL_ERC721_EXTENSION,
            data: txValues.iface.encodeFunctionData("create(address)", [
                nftAddress
            ])
        };

        txValues.signer.sendTransaction(tx)
            .then(() => {
                partner.actionType = 0;
                partner.checkNewMailExtension();
            })
            .catch(e => {
                partner.actionType = 0;
                utils.showAlert({e}.e);
                partner.hideDialog();
            });
    }

    async setNewMailExtension(){
        shared.showLoading();
        const txValues = await utils.getTxValues();

        let tx;
        tx = {
            to: Constants.MAIL_CONTRACT_ADDRESS,
            data: txValues.iface.encodeFunctionData("setExtension(address,bool)", [
                partner.extensionAddress, true
            ])
        };

        txValues.signer.sendTransaction(tx)
            .then(() => {
                partner.actionType = 0;
                shared.hideLoading();
            })
            .catch(e => {
                partner.actionType = 0;
                utils.showAlert({e}.e);
            });
    }

    checkNewMailExtension(){
        setTimeout(async () => {
            const createMailExtension = await utils.getContract(Constants.CREATE_MAIL_ERC721_EXTENSION);
            this.extensionAddress = await createMailExtension.methods.getExtensionAddress(this.address).call();
            if(this.extensionAddress){
                this.actionType = 0;
                this.hideDialog();
                this.showNowYouCanUseNFTFeeDialog();
                document.getElementsByClassName("set-new-extension")[0].classList.remove("disabled");
            }
            else{
                this.checkNewMailExtension();
            }
        }, Constants.CHECK_NEW_EXTENSION_TIMEOUT);
    }
}
const partner = new Partner();
export {partner};