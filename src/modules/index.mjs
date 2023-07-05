"use strict";

import {utils} from "./utils/utils.mjs";
import {shared} from "./shared/shared.mjs";
import {rsa} from "./utils/rsa.mjs";
import {aes} from "./utils/aes.mjs";
import {Constants} from "./shared/constants.mjs";
import {Errors} from "./shared/errors.mjs";
import * as MagicUrl from '../imports/quill-magic-url-3.0.0.js';

class Index {
    constructor() {
        this.web3 = new Web3(Constants.RPC_PROVIDER);
        this.address = "";
        this.mailContract = null;
        this.creditsContract = null;
        this.contactsContract = null;
        this.mailFeedsContract = null;
        this.controller = null;
        this.inbox = [];
        this.sent = [];
        this.allMail = [];
        this.burned = [];
        this.blockedUsers = [];
        this.feeds = [];
        this.subscriptions = [];
        this.contacts = [];
        this.searchMail = [];
        this.inboxSelected = [];
        this.sentSelected = [];
        this.allMailSelected = [];
        this.blockedUsersSelected = [];
        this.contactsSelected = [];
        this.searchMailSelected = [];
        this.jwk = null;
        this.signature = "";
        this.option = Constants.OPTION_INBOX;
        this.totalMails = 0;
        this.totalReceived = 0;
        this.totalSent = 0;
        this.totalBurned = 0;
        this.totalBlockedUsers = 0;
        this.totalFeeds = 0;
        this.totalSubscriptions = 0;
        this.totalRemovedBlock = 0;
        this.totalContacts = 0;
        this.totalSearchMails = 0;
        this.totalCreatedFeeds = 0;
        this.fromIdReceived = 1;
        this.fromIdSent = 1;
        this.fromIdAllMail = 1;
        this.fromIdBurned = 1;
        this.fromIdBlockedUsers = 0;
        this.fromIdFeeds = 0;
        this.fromIdSubscriptions = 0;
        this.fromIdContacts = 0;
        this.fromIdSearchMail = 0;
        this.pageAllMail = 0;
        this.pageInbox = 0;
        this.pageSent = 0;
        this.pageBurned = 0;
        this.pageBlockedUsers = 0;
        this.pageFeeds = 0;
        this.pageSubscriptions = 0;
        this.pageContacts = 0;
        this.pageSearchMail = 0;
        this.itemsTimeoutId = 0;
        this.creditsTimeoutId = 0;
        this.indexMail = 0;
        this.dateMail = "";
        this.fromMail = "";
        this.msgMail = "";
        this.subjectMail = "";
        this.toMail = "";
        this.addressFrom = "";
        this.addressTo = "";
        this.encryptedKey = null;
        this.file = null;
        this.fileName = "";
        this.fileType = "";
        this.loading = 0;
        this.sendingTx = false;
        this.credits = 0;
        this.creditsAmount = 0;
        this.actionType = 0;
        this.actionNext = 0;
        this.oldValue = undefined;
        this.oldBalanceTimeoutId = 0;
        this.oldCreditsToSellTimeoutId = 0;
        this.oldCreditsToDepositTimeoutId = 0;
        this.launchpadContract = null;
        this.price = 0;
        this.feedAddress = "";
        this.feedTokenAddress = "";
        this.feedExtensionAddress = "";
        this.subscriptionAddress = "";
        this.idContact = 0;
        this.onlyMyFeeds = false;
        this.addressToSearch = "";
        this.termsSign = "";
        this.termsMessage = "";
        this.unit = "";
        this.decimals = 0;
        this.useNickname = false;
        this.writeMessage = null;
        this.readMessage = null;

        this.listenEvents();
    }

    listenEvents() {
        shared.showLoading();
        const self = this;
        document.addEventListener("DOMContentLoaded", function() {
            utils.checkIfMetaMaskIsInstalled()
                .then(() => {
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
        document.getElementsByClassName('sign-in')[0].addEventListener('click', this.onSignInClicked);
        document.getElementsByClassName('inbox')[0].addEventListener('click', this.onInboxClicked);
        document.getElementsByClassName('sent')[0].addEventListener('click', this.onSentClicked);
        document.getElementsByClassName('all-mail')[0].addEventListener('click', this.onAllMailClicked);
        document.getElementsByClassName('trash')[0].addEventListener('click', this.onTrashClicked);
        document.getElementsByClassName('blocked-users')[0].addEventListener('click', this.onBlockedUsersClicked);
        document.getElementsByClassName('feeds')[0].addEventListener('click', this.onFeedsClicked);
        document.getElementsByClassName('subscriptions')[0].addEventListener('click', this.onSubscriptionsClicked);
        document.getElementsByClassName('contacts')[0].addEventListener('click', this.onContactsClicked);
        document.getElementsByClassName('search-mail')[0].addEventListener('click', this.onSearchMailClicked);
        document.getElementsByClassName('back')[0].addEventListener('click', this.onBackClicked);
        document.getElementsByClassName('back')[1].addEventListener('click', this.onBackClicked);
        document.getElementsByClassName('back')[2].addEventListener('click', this.onBackClicked);
        document.getElementsByClassName('block')[0].addEventListener('click', this.onBlockClicked);
        document.getElementsByClassName('delete')[0].addEventListener('click', this.onDeleteClicked);
        document.getElementsByClassName('send')[0].addEventListener('click', this.onSendClicked);
        document.getElementsByClassName('add-contact')[0].addEventListener('click', this.showAddContactDialog);
        document.getElementsByClassName('block-all')[0].addEventListener('click', this.onBlockAllClicked);
        document.getElementsByClassName('delete-all')[0].addEventListener('click', this.onDeleteAllClicked);
        document.getElementsByClassName('read-all')[0].addEventListener('click', this.onReadAllClicked);
        document.getElementsByClassName('compose')[0].addEventListener('click', this.onComposeClicked);
        document.getElementsByClassName('refresh')[0].addEventListener('click', this.onRefreshClicked);
        document.getElementsByClassName('page-back')[0].addEventListener('click', this.onPageBackClicked);
        document.getElementsByClassName('page-forward')[0].addEventListener('click', this.onPageForwardClicked);
        document.getElementsByClassName("custom-btn-warning")[1].addEventListener('click', this.onWelcomeClicked);
        document.getElementsByClassName("custom-btn-warning")[2].addEventListener('click', this.onCookieClicked);
        document.getElementsByClassName("custom-btn-warning")[3].addEventListener('click', this.onSignUpOrConnectClicked);
        document.getElementsByClassName('reply')[0].addEventListener('click', this.onReplyClicked);
        document.getElementsByClassName('forward')[0].addEventListener('click', this.onForwardClicked);
        document.getElementsByClassName('backup')[0].addEventListener('click', this.backupPrivateKey);
        document.getElementsByClassName('backup-mailbox')[0].addEventListener('click', this.backupMailBox);
        document.getElementsByClassName('add-credits')[0].addEventListener('click', this.onAddCreditsClicked);
        document.getElementsByClassName('ok-credits')[0].addEventListener('click', this.onOKAmountClicked);
        document.getElementsByClassName('ok-feed')[0].addEventListener('click', this.onOKFeedClicked);
        document.getElementsByClassName('ok-rating')[0].addEventListener('click', this.onOKRatingClicked);
        document.getElementsByClassName('ok-contacts')[0].addEventListener('click', this.onOKContactsClicked);
        document.getElementsByClassName('ok-send-money')[0].addEventListener('click', this.onOKSendMoneyClicked);
        document.getElementsByClassName('buy-credits')[0].addEventListener('click', this.onBuyCreditsClicked);
        document.getElementsByClassName('approve-credits')[0].addEventListener('click', this.onApproveCreditsClicked);
        document.getElementsByClassName('deposit-credits')[0].addEventListener('click', this.onDepositCreditsClicked);
        document.getElementsByClassName('sell-credits')[0].addEventListener('click', this.onSellCreditsClicked);
        document.getElementsByClassName('withdraw-ether')[0].addEventListener('click', this.onWithdrawEtherClicked);
        document.getElementsByClassName('withdraw-credits')[0].addEventListener('click', this.onWithdrawTokenClicked);
        document.getElementsByClassName('close')[0].addEventListener('click', this.closeDialog);
        document.getElementsByClassName('close')[1].addEventListener('click', this.closeDialog);
        document.getElementsByClassName('close')[2].addEventListener('click', this.closeDialog);
        document.getElementsByClassName('close')[3].addEventListener('click', this.closeDialog);
        document.getElementsByClassName('close')[4].addEventListener('click', this.closeDialog);
        document.getElementsByClassName('refresh-credits')[0].addEventListener('click', () => this.getCredits());
        document.getElementsByClassName('settings')[0].addEventListener('click', this.onSettingsClicked);
        document.getElementsByClassName('remove-approvals')[0].addEventListener('click', this.removeMailApprovals);
        document.getElementsByClassName('remove-approvals')[1].addEventListener('click', this.removeLaunchpadApprovals);
        document.getElementsByClassName('delete-account')[0].addEventListener('click', this.onDeleteAccountClicked);
        document.getElementsByClassName('download-file')[0].addEventListener('click', this.onDownloadAttachmentClicked);
        document.getElementsByClassName('feed')[0].addEventListener('click', this.onCreateFeed);
        document.getElementsByClassName('remove-subscriber')[0].addEventListener('click', this.onRemoveSubscriberFeedClicked);
        document.getElementsByClassName('save')[0].addEventListener('click', this.onSetFeeClicked);
        document.getElementsByClassName('save')[1].addEventListener('click', this.onSetFreeMailClicked);
        document.getElementsByClassName('save')[2].addEventListener('click', this.onBlockAddressFeedClicked);
        document.getElementsByClassName('save')[3].addEventListener('click', this.onSetTimeFeedClicked);
        document.getElementsByClassName('save')[4].addEventListener('click', this.onSetExtensionAddressFeedClicked);
        document.getElementsByClassName('save')[5].addEventListener('click', this.onSetPriceFeedClicked);
        document.getElementsByClassName('save')[6].addEventListener('click', this.onSetRPCServerClicked);
        document.getElementsByClassName('save')[7].addEventListener('click', this.onSetIPFSServerClicked);
        document.getElementsByClassName('renew-feed')[0].addEventListener('click', this.onRenewFeedClicked);
        document.getElementsByClassName('delete-feed')[0].addEventListener('click', this.onDeleteFeedClicked);
        document.getElementsByClassName('withdraw-eth-feed')[0].addEventListener('click', this.onWithdrawETHFeedClicked);
        document.getElementsByClassName('withdraw-token-feed')[0].addEventListener('click', this.onWithdrawTokenFeedClicked);
        document.getElementById('payment-with-token').addEventListener('click', this.onPaymentWithTokenClicked);
        document.getElementsByClassName('ok')[0].addEventListener('click', this.onCheckAddressToClicked);
        document.getElementsByClassName('send-money')[0].addEventListener('click', this.showSendMoneyDialog);
        document.getElementsByClassName('search-mail-btn')[0].addEventListener('click', this.searchMails);
        document.getElementsByClassName('restore')[0].addEventListener('click', this.onRestoreDefaults);
        utils.setEnterClick(document.getElementsByClassName("search-mail-input")[0], this.searchMails);
        utils.setEnterClick(document.getElementsByClassName("to")[0], this.onCheckAddressToClicked);
        shared.clicks();
    }

    async initViews(){
        shared.disableAll(true);

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
                        shared.showClassName("account-label", 0);
                        this.initGeneralSettings();
                        this.setAccountAddress();
                        this.setTokenType();
                        this.initFile();
                        this.getCredits(true);
                        this.getCreditsPrice();
                        this.getDeFiValues();
                        this.initFeedSettings();
                        this.initAccountSettings();
                        this.initMailsSettings();
                        this.initSendMoney();
                        this.initQuill();
                        this.showCookieDialog();
                        if(window.location.pathname.toLowerCase().includes("address")){
                            this.showCompose();
                        }
                        else{
                            shared.hideLoading();
                        }
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

    async showCompose(){
        await this.onComposeClicked();
        const paths = window.location.pathname.split('/').filter(function(v){return v;});
        document.getElementsByClassName('to')[0].value = paths[1];
        await this.onCheckAddressToClicked();
        await this.checkValues();
    }

    onInboxClicked(){
        shared.hideClassName('search-mail-input', 0);
        shared.hideClassName('search-mail-btn', 0);
        shared.hideClassName('add-contact', 0);
        document.getElementsByClassName('block-all')[0].innerHTML = "Block Users";
        shared.showClassName('block-all', 0);
        shared.showClassName('delete', 0);
        shared.showClassName('delete-all', 0);
        shared.showClassName('read-all', 0);
        shared.hideClassName('only-my-feeds', 0);
        shared.showClassName('refresh', 0);

        document.getElementsByClassName('col-select')[0].innerHTML = "Select:";
        document.getElementsByClassName('col-select')[0].style.width = "10%";
        document.getElementsByClassName('col-from-to')[0].innerHTML = "From:";
        document.getElementsByClassName('col-from-to')[0].style.width = "20%";
        document.getElementsByClassName('col-subject')[0].innerHTML = "Subject:";
        document.getElementsByClassName('col-subject')[0].style.width = "40%";
        document.getElementsByClassName('col-date')[0].innerHTML = "Date:";
        document.getElementsByClassName('col-date')[0].style.width = "15%";
        document.getElementsByClassName('col-value')[0].innerHTML = "Value:";
        document.getElementsByClassName('col-value')[0].style.width = "15%";
        shared.showClassName("col-select", 0);
        shared.showClassName("col-subject", 0);
        shared.showClassName("col-date", 0);
        shared.showClassName("col-value", 0);
        document.getElementsByClassName('inbox')[0].classList.add("fw-bold");
        document.getElementsByClassName('inbox')[0].style.backgroundColor = "#bcb2ff";
        shared.unselect("options-list","inbox", "#e7e7ff");
        document.getElementsByClassName("col-subject")[0].classList.remove("justify-content-center");
        document.getElementsByClassName("col-subject")[0].classList.add("justify-content-start");
        document.getElementsByClassName("col-date")[0].classList.add("justify-content-center");
        document.getElementsByClassName("col-date")[0].classList.remove("justify-content-start");

        shared.showClassName("inbox-list-container",0);
        shared.hideClassName("sent-list-container",0);
        shared.hideClassName("all-mail-list-container",0);
        shared.hideClassName("burned-list-container",0);
        shared.hideClassName("blocked-users-list-container",0);
        shared.hideClassName("feeds-list-container",0);
        shared.hideClassName("subscriptions-list-container",0);
        shared.hideClassName("contacts-list-container",0);
        shared.hideClassName("search-mail-list-container",0);

        index.option = Constants.OPTION_INBOX;
        index.disablePageButtons(Constants.OPTION_INBOX, index.pageInbox, index.totalReceived - index.totalBurned);
        document.getElementsByClassName("total")[0].innerHTML = (index.totalReceived - index.totalBurned).toString();
        document.getElementsByClassName("total-type")[0].innerHTML = "&nbsp;Mails";

        const updateIdsAndShowLoading = index.inbox.length === 0;
        index.load(updateIdsAndShowLoading, updateIdsAndShowLoading, false, Constants.OPTION_INBOX).catch(e => utils.showAlert(e));
    }

    onSentClicked(){
        shared.hideClassName('search-mail-input', 0);
        shared.hideClassName('search-mail-btn', 0);
        shared.hideClassName('add-contact', 0);
        document.getElementsByClassName('block-all')[0].innerHTML = "Block Users";
        shared.showClassName('block-all', 0);
        shared.showClassName('delete', 0);
        shared.hideClassName('delete-all', 0);
        shared.showClassName('read-all', 0);
        shared.hideClassName('only-my-feeds', 0);
        shared.showClassName('refresh', 0);

        document.getElementsByClassName('col-select')[0].innerHTML = "Select:";
        document.getElementsByClassName('col-select')[0].style.width = "10%";
        document.getElementsByClassName('col-from-to')[0].innerHTML = "To:";
        document.getElementsByClassName('col-from-to')[0].style.width = "20%";
        document.getElementsByClassName('col-subject')[0].innerHTML = "Subject:";
        document.getElementsByClassName('col-subject')[0].style.width = "40%";
        document.getElementsByClassName('col-date')[0].innerHTML = "Date:";
        document.getElementsByClassName('col-date')[0].style.width = "15%";
        document.getElementsByClassName('col-value')[0].innerHTML = "Value:";
        document.getElementsByClassName('col-value')[0].style.width = "15%";
        shared.showClassName("col-select", 0);
        shared.showClassName("col-subject", 0);
        shared.showClassName("col-date", 0);
        shared.showClassName("col-value", 0);
        document.getElementsByClassName('sent')[0].classList.add("fw-bold");
        document.getElementsByClassName('sent')[0].style.backgroundColor = "#bcb2ff";
        shared.unselect("options-list","sent", "#e7e7ff");
        document.getElementsByClassName("col-subject")[0].classList.remove("justify-content-center");
        document.getElementsByClassName("col-subject")[0].classList.add("justify-content-start");
        document.getElementsByClassName("col-date")[0].classList.add("justify-content-center");
        document.getElementsByClassName("col-date")[0].classList.remove("justify-content-start");

        shared.showClassName("sent-list-container",0);
        shared.hideClassName("inbox-list-container",0);
        shared.hideClassName("all-mail-list-container",0);
        shared.hideClassName("burned-list-container",0);
        shared.hideClassName("blocked-users-list-container",0);
        shared.hideClassName("feeds-list-container",0);
        shared.hideClassName("subscriptions-list-container",0);
        shared.hideClassName("contacts-list-container",0);
        shared.hideClassName("search-mail-list-container",0);

        index.option = Constants.OPTION_SENT;
        index.disablePageButtons(Constants.OPTION_SENT, index.pageSent, index.totalSent);
        document.getElementsByClassName("total")[0].innerHTML = index.totalSent.toString();
        document.getElementsByClassName("total-type")[0].innerHTML = "&nbsp;Mails";

        const updateIdsAndShowLoading = index.sent.length === 0;
        index.load(updateIdsAndShowLoading, updateIdsAndShowLoading, false, Constants.OPTION_SENT).catch(e => utils.showAlert(e));
    }

    onAllMailClicked(){
        shared.hideClassName('search-mail-input', 0);
        shared.hideClassName('search-mail-btn', 0);
        shared.hideClassName('add-contact', 0);
        document.getElementsByClassName('block-all')[0].innerHTML = "Block Users";
        shared.showClassName('block-all', 0);
        shared.showClassName('delete', 0);
        shared.showClassName('delete-all', 0);
        shared.showClassName('read-all', 0);
        shared.hideClassName('only-my-feeds', 0);
        shared.showClassName('refresh', 0);

        document.getElementsByClassName('col-select')[0].innerHTML = "Select:";
        document.getElementsByClassName('col-select')[0].style.width = "10%";
        document.getElementsByClassName('col-from-to')[0].innerHTML = "From/To:";
        document.getElementsByClassName('col-from-to')[0].style.width = "20%";
        document.getElementsByClassName('col-subject')[0].innerHTML = "Subject:";
        document.getElementsByClassName('col-subject')[0].style.width = "40%";
        document.getElementsByClassName('col-date')[0].innerHTML = "Date:";
        document.getElementsByClassName('col-date')[0].style.width = "15%";
        document.getElementsByClassName('col-value')[0].innerHTML = "Value:";
        document.getElementsByClassName('col-value')[0].style.width = "15%";
        shared.showClassName("col-select", 0);
        shared.showClassName("col-subject", 0);
        shared.showClassName("col-date", 0);
        shared.showClassName("col-value", 0);
        document.getElementsByClassName('all-mail')[0].classList.add("fw-bold");
        document.getElementsByClassName('all-mail')[0].style.backgroundColor = "#bcb2ff";
        shared.unselect("options-list","all-mail", "#e7e7ff");
        document.getElementsByClassName("col-subject")[0].classList.remove("justify-content-center");
        document.getElementsByClassName("col-subject")[0].classList.add("justify-content-start");
        document.getElementsByClassName("col-date")[0].classList.add("justify-content-center");
        document.getElementsByClassName("col-date")[0].classList.remove("justify-content-start");

        shared.showClassName("all-mail-list-container",0);
        shared.hideClassName("inbox-list-container",0);
        shared.hideClassName("sent-list-container",0);
        shared.hideClassName("burned-list-container",0);
        shared.hideClassName("blocked-users-list-container",0);
        shared.hideClassName("feeds-list-container",0);
        shared.hideClassName("subscriptions-list-container",0);
        shared.hideClassName("contacts-list-container",0);
        shared.hideClassName("search-mail-list-container",0);

        index.option = Constants.OPTION_ALL_MAIL;
        index.disablePageButtons(Constants.OPTION_ALL_MAIL, index.pageAllMail, index.totalMails - index.totalBurned);
        document.getElementsByClassName("total")[0].innerHTML = (index.totalMails - index.totalBurned).toString();
        document.getElementsByClassName("total-type")[0].innerHTML = "&nbsp;Mails";

        const updateIdsAndShowLoading = index.allMail.length === 0;
        index.load(updateIdsAndShowLoading, updateIdsAndShowLoading, false, Constants.OPTION_ALL_MAIL).catch(e => utils.showAlert(e));
    }

    onTrashClicked(){
        shared.hideClassName('search-mail-input', 0);
        shared.hideClassName('search-mail-btn', 0);
        shared.hideClassName('add-contact', 0);
        shared.hideClassName('block-all', 0);
        shared.hideClassName('delete', 0);
        shared.hideClassName('delete-all', 0);
        shared.hideClassName('read-all', 0);
        shared.hideClassName('only-my-feeds', 0);
        shared.showClassName('refresh', 0);

        document.getElementsByClassName('col-select')[0].innerHTML = "Select:";
        document.getElementsByClassName('col-select')[0].style.width = "10%";
        document.getElementsByClassName('col-from-to')[0].innerHTML = "From:";
        document.getElementsByClassName('col-from-to')[0].style.width = "20%";
        document.getElementsByClassName('col-subject')[0].innerHTML = "Subject:";
        document.getElementsByClassName('col-subject')[0].style.width = "40%";
        document.getElementsByClassName('col-date')[0].innerHTML = "Date:";
        document.getElementsByClassName('col-date')[0].style.width = "15%";
        document.getElementsByClassName('col-value')[0].innerHTML = "Value:";
        document.getElementsByClassName('col-value')[0].style.width = "15%";
        shared.showClassName("col-select", 0);
        shared.showClassName("col-subject", 0);
        shared.showClassName("col-date", 0);
        shared.showClassName("col-value", 0);
        document.getElementsByClassName('trash')[0].classList.add("fw-bold");
        document.getElementsByClassName('trash')[0].style.backgroundColor = "#bcb2ff";
        shared.unselect("options-list","trash", "#e7e7ff");
        document.getElementsByClassName("col-subject")[0].classList.remove("justify-content-center");
        document.getElementsByClassName("col-subject")[0].classList.add("justify-content-start");
        document.getElementsByClassName("col-date")[0].classList.add("justify-content-center");
        document.getElementsByClassName("col-date")[0].classList.remove("justify-content-start");

        shared.showClassName("burned-list-container",0);
        shared.hideClassName("inbox-list-container",0);
        shared.hideClassName("sent-list-container",0);
        shared.hideClassName("all-mail-list-container",0);
        shared.hideClassName("blocked-users-list-container",0);
        shared.hideClassName("feeds-list-container",0);
        shared.hideClassName("subscriptions-list-container",0);
        shared.hideClassName("contacts-list-container",0);
        shared.hideClassName("search-mail-list-container",0);

        index.option = Constants.OPTION_TRASH;
        index.disablePageButtons(Constants.OPTION_TRASH, index.pageBurned, index.totalBurned);
        document.getElementsByClassName("total")[0].innerHTML = index.totalBurned.toString();
        document.getElementsByClassName("total-type")[0].innerHTML = "&nbsp;Mails";

        const updateIdsAndShowLoading = index.burned.length === 0;
        index.load(updateIdsAndShowLoading, updateIdsAndShowLoading, false, Constants.OPTION_TRASH).catch(e => utils.showAlert(e));
    }

    async onBlockedUsersClicked(){
        shared.hideClassName('search-mail-input', 0);
        shared.hideClassName('search-mail-btn', 0);
        shared.hideClassName('add-contact', 0);
        document.getElementsByClassName('block-all')[0].innerHTML = "Unblock Users";
        shared.showClassName('block-all', 0);
        shared.hideClassName('delete-all', 0);
        shared.hideClassName('read-all', 0);
        shared.hideClassName('only-my-feeds', 0);
        shared.showClassName('refresh', 0);

        document.getElementsByClassName('col-select')[0].innerHTML = "Select:";
        document.getElementsByClassName('col-select')[0].style.width = "10%";
        document.getElementsByClassName('col-from-to')[0].innerHTML = "Address/Nickname:";
        document.getElementsByClassName('col-from-to')[0].style.width = "40%";
        document.getElementsByClassName('col-subject')[0].innerHTML = "Subject:";
        document.getElementsByClassName('col-subject')[0].style.width = "50%";
        document.getElementsByClassName('col-date')[0].innerHTML = "Date:";
        document.getElementsByClassName('col-date')[0].style.width = "0%";
        document.getElementsByClassName('col-value')[0].innerHTML = "Value:";
        document.getElementsByClassName('col-value')[0].style.width = "0%";
        shared.hideClassName("col-subject", 0);
        shared.hideClassName("col-date", 0);
        shared.hideClassName("col-value", 0);
        document.getElementsByClassName('blocked-users')[0].classList.add("fw-bold");
        document.getElementsByClassName('blocked-users')[0].style.backgroundColor = "#bcb2ff";
        shared.unselect("options-list","blocked-users", "#e7e7ff");
        document.getElementsByClassName("col-subject")[0].classList.remove("justify-content-center");
        document.getElementsByClassName("col-subject")[0].classList.add("justify-content-start");
        document.getElementsByClassName("col-date")[0].classList.add("justify-content-center");
        document.getElementsByClassName("col-date")[0].classList.remove("justify-content-start");

        shared.showClassName("blocked-users-list-container",0);
        shared.hideClassName("inbox-list-container",0);
        shared.hideClassName("sent-list-container",0);
        shared.hideClassName("all-mail-list-container",0);
        shared.hideClassName("burned-list-container",0);
        shared.hideClassName("feeds-list-container",0);
        shared.hideClassName("subscriptions-list-container",0);
        shared.hideClassName("contacts-list-container",0);
        shared.hideClassName("search-mail-list-container",0);

        index.option = Constants.OPTION_BLOCKED_USERS;
        const mailBoxInfo = await index.mailContract.methods.getMailBoxInfo(index.address).call();
        const totalBlockedUsers = mailBoxInfo[5];
        const totalRemovedBlock = mailBoxInfo[6];
        const total = (totalBlockedUsers - totalRemovedBlock) > 0 ? (totalBlockedUsers - totalRemovedBlock) : 0;

        index.disablePageButtons(Constants.OPTION_BLOCKED_USERS, index.pageBlockedUsers, total);
        document.getElementsByClassName("total")[0].innerHTML = total.toString();
        document.getElementsByClassName("total-type")[0].innerHTML = "&nbsp;Blocked";

        const updateIdsAndShowLoading = index.blockedUsers.length === 0;
        index.load(updateIdsAndShowLoading, updateIdsAndShowLoading, false, Constants.OPTION_BLOCKED_USERS).catch(e => utils.showAlert(e));
    }

    async onFeedsClicked(){
        shared.hideClassName('search-mail-input', 0);
        shared.hideClassName('search-mail-btn', 0);
        shared.hideClassName('add-contact', 0);
        shared.hideClassName('block-all', 0);
        shared.hideClassName('delete-all', 0);
        shared.hideClassName('read-all', 0);
        shared.showClassName('only-my-feeds', 0);
        shared.showClassName('refresh', 0);

        document.getElementsByClassName('col-select')[0].innerHTML = "Name:";
        document.getElementsByClassName('col-select')[0].style.width = "42.5%";
        document.getElementsByClassName('col-from-to')[0].innerHTML = "Price:";
        document.getElementsByClassName('col-from-to')[0].style.width = "12.5%";
        document.getElementsByClassName('col-subject')[0].innerHTML = "Rating:";
        document.getElementsByClassName('col-subject')[0].style.width = "15%";
        document.getElementsByClassName('col-date')[0].innerHTML = "Address:";
        document.getElementsByClassName('col-date')[0].style.width = "15%";
        document.getElementsByClassName('col-value')[0].innerHTML = "";
        document.getElementsByClassName('col-value')[0].style.width = "15%";
        shared.showClassName("col-subject", 0);
        shared.showClassName("col-value", 0);
        shared.showClassName("col-date", 0);
        document.getElementsByClassName('feeds')[0].classList.add("fw-bold");
        document.getElementsByClassName('feeds')[0].style.backgroundColor = "#bcb2ff";
        shared.unselect("options-list","feeds", "#e7e7ff");
        document.getElementsByClassName("col-subject")[0].classList.add("justify-content-center");
        document.getElementsByClassName("col-subject")[0].classList.remove("justify-content-start");
        document.getElementsByClassName("col-date")[0].classList.add("justify-content-center");
        document.getElementsByClassName("col-date")[0].classList.remove("justify-content-start");

        shared.showClassName("feeds-list-container",0);
        shared.hideClassName("inbox-list-container",0);
        shared.hideClassName("sent-list-container",0);
        shared.hideClassName("all-mail-list-container",0);
        shared.hideClassName("burned-list-container",0);
        shared.hideClassName("blocked-users-list-container",0);
        shared.hideClassName("subscriptions-list-container",0);
        shared.hideClassName("contacts-list-container",0);
        shared.hideClassName("search-mail-list-container",0);

        index.option = Constants.OPTION_FEEDS;
        if(!index.mailFeedsContract){
            const mailFeedsAddress = await index.mailContract.methods.getMailFeedsAddress().call();
            index.mailFeedsContract = await utils.getContract(mailFeedsAddress);
        }
        let mailFeedTotals = await index.mailFeedsContract.methods.getTotals(Constants.ZERO_ADDRESS, 0, 0).call();
        index.totalCreatedFeeds = mailFeedTotals[0];
        mailFeedTotals = await index.mailFeedsContract.methods.getTotals(index.address, Constants.FEED_MIN_RATING, Constants.USE_DYNAMIC_LENGTH ? mailFeedTotals[0] : Constants.DEFAULT_LENGTH).call();
        const mailFeedInfo = await index.mailFeedsContract.methods.getInfo(Constants.ZERO_ADDRESS, index.address, 0).call();
        const total = index.onlyMyFeeds ? mailFeedInfo[1] : mailFeedTotals[2];
        index.disablePageButtons(Constants.OPTION_FEEDS, index.pageFeeds, total);
        document.getElementsByClassName("total")[0].innerHTML = total.toString();
        document.getElementsByClassName("total-type")[0].innerHTML = "&nbsp;Feeds";

        const updateIdsAndShowLoading = index.feeds.length === 0;
        index.load(updateIdsAndShowLoading, updateIdsAndShowLoading, false, Constants.OPTION_FEEDS).catch(e => utils.showAlert(e));
    }

    async onSubscriptionsClicked(){
        shared.hideClassName('search-mail-input', 0);
        shared.hideClassName('search-mail-btn', 0);
        shared.hideClassName('add-contact', 0);
        shared.hideClassName('block-all', 0);
        shared.hideClassName('delete-all', 0);
        shared.hideClassName('read-all', 0);
        shared.hideClassName('only-my-feeds', 0);
        shared.showClassName('refresh', 0);

        document.getElementsByClassName('col-select')[0].innerHTML = "Name:";
        document.getElementsByClassName('col-select')[0].style.width = "55%";
        document.getElementsByClassName('col-from-to')[0].innerHTML = "Owner:";
        document.getElementsByClassName('col-from-to')[0].style.width = "15%";
        document.getElementsByClassName('col-date')[0].innerHTML = "";
        document.getElementsByClassName('col-date')[0].style.width = "15%";
        document.getElementsByClassName('col-subject')[0].style.width = "0%";
        document.getElementsByClassName('col-value')[0].innerHTML = "";
        document.getElementsByClassName('col-value')[0].style.width = "15%";
        shared.hideClassName("col-subject", 0);
        shared.showClassName("col-value", 0);
        shared.showClassName("col-date", 0);
        document.getElementsByClassName('subscriptions')[0].classList.add("fw-bold");
        document.getElementsByClassName('subscriptions')[0].style.backgroundColor = "#bcb2ff";
        shared.unselect("options-list","subscriptions", "#e7e7ff");
        document.getElementsByClassName("col-subject")[0].classList.remove("justify-content-center");
        document.getElementsByClassName("col-subject")[0].classList.add("justify-content-start");
        document.getElementsByClassName("col-date")[0].classList.add("justify-content-center");
        document.getElementsByClassName("col-date")[0].classList.remove("justify-content-start");

        shared.showClassName("subscriptions-list-container",0);
        shared.hideClassName("inbox-list-container",0);
        shared.hideClassName("sent-list-container",0);
        shared.hideClassName("all-mail-list-container",0);
        shared.hideClassName("burned-list-container",0);
        shared.hideClassName("blocked-users-list-container",0);
        shared.hideClassName("feeds-list-container",0);
        shared.hideClassName("contacts-list-container",0);
        shared.hideClassName("search-mail-list-container",0);

        index.option = Constants.OPTION_SUBSCRIPTIONS;
        if(!index.mailFeedsContract){
            const mailFeedsAddress = await index.mailContract.methods.getMailFeedsAddress().call();
            index.mailFeedsContract = await utils.getContract(mailFeedsAddress);
        }
        const mailInfo = await index.mailContract.methods.getMailInfo(index.address, 0, 0).call();
        const totalSubscriptions = mailInfo[7];
        const totalUnsubscriptions = mailInfo[8];
        const total = (totalSubscriptions - totalUnsubscriptions) > 0 ? (totalSubscriptions - totalUnsubscriptions) : 0;
        index.disablePageButtons(Constants.OPTION_SUBSCRIPTIONS, index.pageSubscriptions, total);
        document.getElementsByClassName("total")[0].innerHTML = total.toString();
        document.getElementsByClassName("total-type")[0].innerHTML = "&nbsp;Subscriptions";

        const updateIdsAndShowLoading = index.subscriptions.length === 0;
        index.load(updateIdsAndShowLoading, updateIdsAndShowLoading, false, Constants.OPTION_SUBSCRIPTIONS).catch(e => utils.showAlert(e));
    }

    async onContactsClicked(){
        shared.hideClassName('search-mail-input', 0);
        shared.hideClassName('search-mail-btn', 0);
        shared.showClassName('add-contact', 0);
        shared.showClassName('delete-all', 0);
        shared.hideClassName('block-all', 0);
        shared.hideClassName('read-all', 0);
        shared.hideClassName('only-my-feeds', 0);
        shared.showClassName('refresh', 0);

        document.getElementsByClassName('col-select')[0].innerHTML = "Select:";
        document.getElementsByClassName('col-select')[0].style.width = "10%";
        document.getElementsByClassName('col-from-to')[0].innerHTML = "Network:";
        document.getElementsByClassName('col-from-to')[0].style.width = "15%";
        document.getElementsByClassName('col-subject')[0].innerHTML = "Address:";
        document.getElementsByClassName('col-subject')[0].style.width = "15%";
        document.getElementsByClassName('col-date')[0].innerHTML = "Nickname:";
        document.getElementsByClassName('col-date')[0].style.width = "40%";
        document.getElementsByClassName('col-value')[0].innerHTML = "";
        document.getElementsByClassName('col-value')[0].style.width = "20%";
        shared.showClassName("col-subject", 0);
        shared.showClassName("col-date", 0);
        shared.showClassName("col-value", 0);
        document.getElementsByClassName('contacts')[0].classList.add("fw-bold");
        document.getElementsByClassName('contacts')[0].style.backgroundColor = "#bcb2ff";
        shared.unselect("options-list","contacts", "#e7e7ff");
        document.getElementsByClassName("col-subject")[0].classList.add("justify-content-center");
        document.getElementsByClassName("col-subject")[0].classList.remove("justify-content-start");
        document.getElementsByClassName("col-date")[0].classList.remove("justify-content-center");
        document.getElementsByClassName("col-date")[0].classList.add("justify-content-start");

        shared.showClassName("contacts-list-container",0);
        shared.hideClassName("inbox-list-container",0);
        shared.hideClassName("sent-list-container",0);
        shared.hideClassName("all-mail-list-container",0);
        shared.hideClassName("burned-list-container",0);
        shared.hideClassName("blocked-users-list-container",0);
        shared.hideClassName("feeds-list-container",0);
        shared.hideClassName("subscriptions-list-container",0);
        shared.hideClassName("search-mail-list-container",0);

        index.option = Constants.OPTION_CONTACTS;
        if(!index.contactsContract){
            index.contactsContract = await utils.getContract(Constants.CONTACTS_ADDRESS);
        }

        const info = await index.contactsContract.methods.getInfo(index.address, 0).call();
        const totalContacts = info[1];
        const totalRemoved = info[2];
        const total = (totalContacts - totalRemoved) > 0 ? (totalContacts - totalRemoved) : 0;
        index.disablePageButtons(Constants.OPTION_CONTACTS, index.pageContacts, total);
        document.getElementsByClassName("total")[0].innerHTML = total.toString();
        document.getElementsByClassName("total-type")[0].innerHTML = "&nbsp;Contacts";

        const updateIdsAndShowLoading = index.contacts.length === 0;
        index.load(updateIdsAndShowLoading, updateIdsAndShowLoading, false, Constants.OPTION_CONTACTS).catch(e => utils.showAlert(e));
    }

    onSearchMailClicked(){
        shared.showClassName('search-mail-input', 0);
        shared.showClassName('search-mail-btn', 0);
        shared.hideClassName('add-contact', 0);
        shared.hideClassName('block-all', 0);
        shared.showClassName('delete', 0);
        shared.showClassName('delete-all', 0);
        shared.showClassName('read-all', 0);
        shared.hideClassName('only-my-feeds', 0);
        shared.hideClassName('refresh', 0);

        document.getElementsByClassName('col-select')[0].innerHTML = "Select:";
        document.getElementsByClassName('col-select')[0].style.width = "10%";
        document.getElementsByClassName('col-from-to')[0].innerHTML = "From/To:";
        document.getElementsByClassName('col-from-to')[0].style.width = "20%";
        document.getElementsByClassName('col-subject')[0].innerHTML = "Subject:";
        document.getElementsByClassName('col-subject')[0].style.width = "40%";
        document.getElementsByClassName('col-date')[0].innerHTML = "Date:";
        document.getElementsByClassName('col-date')[0].style.width = "15%";
        document.getElementsByClassName('col-value')[0].innerHTML = "Value:";
        document.getElementsByClassName('col-value')[0].style.width = "15%";
        shared.showClassName("col-select", 0);
        shared.showClassName("col-subject", 0);
        shared.showClassName("col-date", 0);
        shared.showClassName("col-value", 0);
        document.getElementsByClassName('search-mail')[0].classList.add("fw-bold");
        document.getElementsByClassName('search-mail')[0].style.backgroundColor = "#bcb2ff";
        shared.unselect("options-list","search-mail", "#e7e7ff");
        document.getElementsByClassName("col-subject")[0].classList.remove("justify-content-center");
        document.getElementsByClassName("col-subject")[0].classList.add("justify-content-start");
        document.getElementsByClassName("col-date")[0].classList.add("justify-content-center");
        document.getElementsByClassName("col-date")[0].classList.remove("justify-content-start");

        shared.showClassName("search-mail-list-container",0);
        shared.hideClassName("all-mail-list-container",0);
        shared.hideClassName("inbox-list-container",0);
        shared.hideClassName("sent-list-container",0);
        shared.hideClassName("burned-list-container",0);
        shared.hideClassName("blocked-users-list-container",0);
        shared.hideClassName("feeds-list-container",0);
        shared.hideClassName("subscriptions-list-container",0);
        shared.hideClassName("contacts-list-container",0);

        index.option = Constants.OPTION_SEARCH_MAIL;
        index.disablePageButtons(Constants.OPTION_SEARCH_MAIL, index.pageSearchMail, index.totalSearchMails);
        document.getElementsByClassName("total")[0].innerHTML = (index.totalSearchMails).toString();
        document.getElementsByClassName("total-type")[0].innerHTML = "&nbsp;Mails";
    }

    onBackClicked(){
        shared.hideClassName("read-msg-container", 0);
        shared.hideClassName("write-msg-container", 0);
        shared.hideClassName("settings-container", 0);
        index.disableComposeMailControls(false, false);
    }

    async onBlockClicked(){
        if(await utils.showConfirm("Block user "+index.fromMail+".\n\nAre you sure?")){
            shared.showLoading();
            index.sendingTx = true;
            const address = await index.getAddress(index.fromMail);
            index.blockUsers([address], [true]).catch(e => utils.showAlert(e));
        }
    }

    async onDeleteClicked(){
        if(await utils.showConfirm("Delete mail \""+utils.getEllipsis(index.subjectMail, Constants.MAX_CHARACTERS_SUBJECT_DELETE_MAIL)+"\".\n\nAre you sure?")){
            shared.showLoading();
            index.sendingTx = true;
            const mailInfo = await index.mailContract.methods.getMailInfo(index.address, index.indexMail, index.option).call();
            const mailId = mailInfo[1];
            index.deleteMails([mailId]).catch(e => utils.showAlert(e));
        }
    }

    async onBlockAllClicked(){
        shared.showLoading();
        const type = document.getElementsByClassName('block-all')[0].innerHTML;
        if(type === "Block Users"){
            const selectedAddresses = index.getSelectedAddresses();
            const totalUsers = selectedAddresses.length;
            if(totalUsers > 0){
                if(await utils.showConfirm("Block "+totalUsers+" selected users.\n\nAre you sure?")){
                    let values = [];
                    for(let i=0;i<totalUsers;i++){
                        values.push(true);
                    }
                    index.blockUsers(selectedAddresses, values).catch(e => utils.showAlert(e));
                }
            }
            else{
                utils.showAlert("Error: no mails selected.");
            }
        }
        else{
            const selectedAddresses = await index.getSelectedBlocked();
            const totalUsers = selectedAddresses.length;
            if(totalUsers > 0){
                if(await utils.showConfirm("Unblock "+totalUsers+" selected users.\n\nAre you sure?")){
                    let values = [];
                    for(let i=0;i<totalUsers;i++){
                        values.push(false);
                    }
                    index.blockUsers(selectedAddresses, values).catch(e => utils.showAlert(e));
                }
            }
            else{
                utils.showAlert("Error: no addresses selected.");
            }
        }
    }

    async onDeleteAllClicked(){
        shared.showLoading();
        if(index.option === Constants.OPTION_CONTACTS){
            const selectedContacts = await index.getSelectedContacts();
            const totalContacts = selectedContacts.ids.length;
            if(totalContacts > 0){
                if(await utils.showConfirm("Delete "+totalContacts+" selected contacts.\n\nAre you sure?")){
                    index.removeContacts(selectedContacts.ids,selectedContacts.addressesAndNicknames).catch(e => utils.showAlert(e));
                }
            }
            else{
                utils.showAlert("Error: no contacts selected.");
            }
        }
        else{
            const selectedIds = await index.getSelectedIds();
            const totalMails = selectedIds.length;
            if(totalMails > 0){
                if(await utils.showConfirm("Delete "+totalMails+" selected mails.\n\nAre you sure?")){
                    index.deleteMails(selectedIds).catch(e => utils.showAlert(e));
                }
            }
            else{
                utils.showAlert("Error: no mails selected.");
            }
        }
    }

    async onReadAllClicked(){
        const signHash = await utils.getSha256(index.signature);
        const selected = await index.getSelectedMails();
        const mails = selected.mails;
        const ids = selected.ids;
        const uris = selected.uris;
        const totalMails = uris.length;

        if(totalMails > 0){
            if(await utils.showConfirm("Mark as read "+totalMails+" selected mails.\n\nAre you sure?")){
                for(let i=0;i<totalMails;i++){
                    const mail = mails[i];

                    if(index.inbox){
                        const id = index.inbox.findIndex(e => e.encryptedMsg === mail.encryptedMsg && e.encryptedKey === mail.encryptedKey);
                        index.inbox[id] ? index.inbox[id].status = 1 : undefined;
                    }

                    if(index.sent){
                        const id = index.sent.findIndex(e => e.encryptedMsg === mail.encryptedMsg && e.encryptedKey === mail.encryptedKey);
                        index.sent[id] ? index.sent[id].status = 1 : undefined;
                    }

                    if(index.allMail){
                        for(let id=0;id<index.allMail.length;id++){
                            const e = index.allMail[id];
                            if(e.encryptedMsg === mail.encryptedMsg && e.encryptedKey === mail.encryptedKey){
                                index.allMail[id] ? index.allMail[id].status = 1 : undefined;
                            }
                        }
                    }

                    if(index.searchMail){
                        for(let id=0;id<index.searchMail.length;id++){
                            const e = index.searchMail[id];
                            if(e.encryptedMsg === mail.encryptedMsg && e.encryptedKey === mail.encryptedKey){
                                index.searchMail[id] ? index.searchMail[id].status = 1 : undefined;
                            }
                        }
                    }
                }

                index.setStatuses(ids, uris, 1, signHash, index.option)
                    .then(() => {
                        index.removeSelects();
                    })
                    .catch(e => utils.showAlert(e));
            }
        }
        else{
            utils.showAlert("Error: no mails selected.");
        }
    }

    async getSelectedIds(){
        let selected;
        if(index.option === Constants.OPTION_INBOX){
            selected = index.inboxSelected;
        }
        else if(index.option === Constants.OPTION_SENT){
            selected = index.sentSelected;
        }
        else if(index.option === Constants.OPTION_ALL_MAIL){
            selected = index.allMailSelected;
        }
        else if(index.option === Constants.OPTION_SEARCH_MAIL){
            selected = index.searchMailSelected;
        }

        const selectedIds = [];
        const keys = Object.keys(selected);
        const values = Object.values(selected);
        for(let i=0;i<keys.length;i++){
            const mail = JSON.parse(keys[i]);
            if(values[i]){
                selectedIds.push(mail.id);
            }
        }

        const mailIds = [];
        for(let i=0;i<selectedIds.length;i++){
            const mailInfo = await index.mailContract.methods.getMailInfo(index.address, selectedIds[i], index.option).call();
            mailIds.push(mailInfo[1]);
        }

        return mailIds;
    }

    getSelectedAddresses(){
        let selected;
        if(index.option === Constants.OPTION_INBOX){
            selected = index.inboxSelected;
        }
        else if(index.option === Constants.OPTION_SENT){
            selected = index.sentSelected;
        }
        else if(index.option === Constants.OPTION_ALL_MAIL){
            selected = index.allMailSelected;
        }
        else if(index.option === Constants.OPTION_SEARCH_MAIL){
            selected = index.searchMailSelected;
        }

        const selectedFrom = [];
        const selectedTo = [];
        const keys = Object.keys(selected);
        const values = Object.values(selected);
        for(let i=0;i<keys.length;i++){
            const mail = JSON.parse(keys[i]);
            if(values[i]){
                selectedFrom.push(mail.from);
                selectedTo.push(mail.to);
            }
        }

        if(index.option === Constants.OPTION_SENT){
            return selectedTo;
        }
        return selectedFrom;
    }

    async getSelectedBlocked(){
        const selectedAddresses = [];
        const keys = Object.keys(index.blockedUsersSelected);
        const values = Object.values(index.blockedUsersSelected);
        for(let i=0;i<keys.length;i++){
            if(values[i]){
                const address = await index.getAddress(keys[i]);
                selectedAddresses.push(address);
            }
        }
        return selectedAddresses;
    }

    async getSelectedContacts(){
        const ids = [];
        const addressesAndNicknames = [];
        const keys = Object.keys(index.contactsSelected);
        const values = Object.values(index.contactsSelected);

        for(let i=0;i<keys.length;i++){
            if(values[i]){
                const key = JSON.parse(keys[i]);
                const id = key.id;
                const info = key.info;
                const symbol = info.symbol.toString().trim().toLowerCase();
                const address = info.address.toString().trim().toLowerCase();
                const nickname = utils.getNameNormalized(info.nickname);
                const addressToNickname = await utils.getSha256(symbol + address + index.signature);
                const nicknameToAddress = await utils.getSha256(symbol + nickname + index.signature);

                ids.push(id);
                addressesAndNicknames.push(addressToNickname);
                addressesAndNicknames.push(nicknameToAddress);
            }
        }

        return {ids: ids, addressesAndNicknames: addressesAndNicknames};
    }

    async getSelectedMails(){
        let selected;
        if(index.option === Constants.OPTION_INBOX){
            selected = index.inboxSelected;
        }
        else if(index.option === Constants.OPTION_SENT){
            selected = index.sentSelected;
        }
        else if(index.option === Constants.OPTION_ALL_MAIL){
            selected = index.allMailSelected;
        }
        else if(index.option === Constants.OPTION_SEARCH_MAIL){
            selected = index.searchMailSelected;
        }

        const selectedMails = [];
        const selectedIds = [];
        const selectedUris = [];
        const keys = Object.keys(selected);
        const values = Object.values(selected);
        for(let i=0;i<keys.length;i++){
            const mail = JSON.parse(keys[i]);
            if(values[i]){
                selectedMails.push(mail);
                selectedIds.push(mail.id);
                selectedUris.push(mail.uri);
            }
        }

        return {mails: selectedMails, ids: selectedIds, uris: selectedUris};
    }

    removeSelects(){
        if(index.option === Constants.OPTION_INBOX){
            index.inboxSelected = [];
            for(let i=0;i<index.totalReceived;i++){
                $("#inbox-select"+i).prop('checked', false);
            }
        }
        else if(index.option === Constants.OPTION_SENT){
            index.sentSelected = [];
            for(let i=0;i<index.totalSent;i++){
                $("#sent-select"+i).prop('checked', false);
            }
        }
        else if(index.option === Constants.OPTION_ALL_MAIL){
            index.allMailSelected = [];
            for(let i=0;i<index.totalMails;i++){
                $("#all-mail-select"+i).prop('checked', false);
            }
        }
        else if(index.option === Constants.OPTION_CONTACTS){
            index.contactsSelected = [];
            for(let i=0;i<index.totalContacts;i++){
                $("#contacts-select"+i).prop('checked', false);
            }
        }
        else if(index.option === Constants.OPTION_SEARCH_MAIL){
            index.searchMailSelected = [];
            for(let i=0;i<index.totalSearchMails;i++){
                $("#search-mail-select"+i).prop('checked', false);
            }
        }
        else if(index.option === Constants.OPTION_BLOCKED_USERS){
            index.blockedUsersSelected = [];
            for(let i=0;i<index.totalBlockedUsers;i++){
                $("#blocked-users-select"+i).prop('checked', false);
            }
        }
    }

    async onComposeClicked(){
        index.disableComposeMailControls(true, true);
        document.getElementsByClassName('ok')[0].innerHTML = "OK";
        document.getElementsByClassName('fee-symbol')[0].innerHTML = "&nbsp;" + Constants.DEFAULT_TOKEN_SYMBOL;
        document.getElementsByClassName('to')[0].value = "";
        document.getElementsByClassName('fee')[0].value = "0";
        document.getElementsByClassName('subject')[0].value = "";

        shared.hideClassName("fee-or", 0);
        shared.hideClassName("fee-secondary-value", 0);
        shared.hideClassName("fee-secondary-symbol", 0);
        shared.hideClassName("read-msg-container", 0);
        shared.showClassName("write-msg-container", 0);

        document.getElementById("attach-file").value = null;
        document.getElementsByClassName("filename")[0].innerHTML = "";
        index.file = null;
        index.fileName = "";
        index.fileType = "";
        index.writeMessage.root.innerHTML = "";
        document.getElementsByClassName('to')[0].focus();
    }

    async onCheckAddressToClicked(){
        if(document.getElementsByClassName('to')[0].disabled){
            index.disableComposeMailControls(true, true);
            document.getElementsByClassName('to')[0].focus();
            document.getElementsByClassName('ok')[0].innerHTML = "OK";
        }
        else{
            shared.showLoading();
            let to = document.getElementsByClassName('to')[0].value;
            to = await index.getAddress(to);
            to = await utils.checkAddress(to);
            if(!to){
                utils.showAlert("Error: invalid Receiver Address.");
                return;
            }

            if(!index.mailContract){
                index.mailContract = await utils.getContract(Constants.MAIL_CONTRACT_ADDRESS);
            }

            const mailBoxInfo = await index.mailContract.methods.getMailBoxInfo(to).call();
            const feeValue = mailBoxInfo[2];
            const isPaid = mailBoxInfo[3];
            let fromToInfo = await index.mailContract.methods.getFromToInfo(index.address, to, 0, 1).call();
            const totalSentFrom = fromToInfo[0];
            const isFreeMail = fromToInfo[2];
            fromToInfo = await index.mailContract.methods.getFromToInfo(to, index.address, 0, 1).call();
            const totalSentTo = fromToInfo[0];
            const extensionAddress = await index.mailContract.methods.getExtensionInfo(to).call();
            const isPaymentWithToken = extensionAddress !== Constants.ZERO_ADDRESS;

            let tokenSymbol = Constants.DEFAULT_TOKEN_SYMBOL;
            let unit = "ether";
            let isERC721 = false;
            if(isPaymentWithToken) {
                const extensionContract = await utils.getContract(extensionAddress);
                tokenSymbol = await extensionContract.methods.getTokenSymbol().call();
                const tokenDecimals = await extensionContract.methods.getTokenDecimals().call();
                unit = utils.findUnit(tokenDecimals, index.web3);
                isERC721 = await extensionContract.methods.supportsInterface(Constants.ERC721_INTERFACE_ID).call();

                const secondaryFees = await extensionContract.methods.getSecondaryFees(0).call();
                const secondaryFeeContract = secondaryFees[0];
                const secondaryFeeSymbol = secondaryFees[1];
                const secondaryFeeDecimals = secondaryFees[2];
                const secondaryFeeValue = secondaryFees[3];
                const secondaryFeeOr = secondaryFees[4];
                if(parseInt(secondaryFeeValue) > 0){
                    let feeUnit = "ether";
                    if(secondaryFeeContract !== Constants.ZERO_ADDRESS){
                        feeUnit = utils.findUnit(secondaryFeeDecimals, index.web3);
                    }

                    shared.showClassName("fee-or", 0);
                    shared.showClassName("fee-secondary-value", 0);
                    shared.showClassName("fee-secondary-symbol", 0);
                    document.getElementsByClassName('fee-or')[0].innerHTML = secondaryFeeOr ? "&nbsp;or&nbsp;" : "&nbsp;and&nbsp;";
                    document.getElementsByClassName('fee-secondary-value')[0].innerHTML = index.web3.utils.fromWei(secondaryFeeValue.toString(), feeUnit);
                    document.getElementsByClassName('fee-secondary-symbol')[0].innerHTML = "&nbsp;" + secondaryFeeSymbol;
                }
                else{
                    shared.hideClassName("fee-or", 0);
                    shared.hideClassName("fee-secondary-value", 0);
                    shared.hideClassName("fee-secondary-symbol", 0);
                }
            }

            document.getElementsByClassName('fee-symbol')[0].innerHTML = "&nbsp;" + tokenSymbol;

            const result = await index.checkAddress(to);
            if(isFreeMail || result.isFeed){
                index.disableComposeMailControls(false, true);
            }
            else{
                let fee = 0;
                if((isPaid && !isFreeMail) || (totalSentFrom.toString() === '0' && totalSentTo.toString() === '0')){
                    fee = index.web3.utils.fromWei(feeValue.toString(), unit);
                    index.disableComposeMailControls(false, false);
                }
                else{
                    index.disableComposeMailControls(false, false);
                }
                document.getElementsByClassName('fee')[0].value = fee;
                if(isERC721){
                    index.disableComposeMailControls(false, true);
                }
            }

            shared.hideLoading();
        }
    }

    onSettingsClicked(){
        shared.hideClassName("read-msg-container", 0);
        shared.hideClassName("write-msg-container", 0);
        shared.showClassName("settings-container", 0);
    }

    async onReplyClicked(){
        shared.showLoading();
        index.disableMailControls(true);
        let mailBoxInfo = await index.mailContract.methods.getMailBoxInfo(index.addressFrom).call();
        let fee = mailBoxInfo[2];
        fee = index.web3.utils.fromWei(fee.toString(), "ether");

        const msg = "\n\nOn " + index.dateMail + " " + index.fromMail + " wrote: " + index.msgMail;

        document.getElementsByClassName('to')[0].value = index.fromMail;
        document.getElementsByClassName('fee')[0].value = fee;
        document.getElementsByClassName('subject')[0].value = index.subjectMail;

        shared.hideClassName("read-msg-container", 0);
        shared.showClassName("write-msg-container", 0);
        document.getElementById("message").focus();

        document.getElementById("attach-file").value = null;
        const fileName = index.getFileName(index.fileName);
        if(fileName.fileName && fileName.extension){
            document.getElementsByClassName("filename")[0].innerHTML = fileName.fileName + "." + fileName.extension;
        }
        else{
            document.getElementsByClassName("filename")[0].innerHTML = "";
        }

        index.writeMessage.root.innerHTML = msg;
        setTimeout(()=>{
            index.writeMessage.focus();
        });
        shared.hideLoading();
    }

    onForwardClicked(){
        index.disableMailControls(false);
        const msg = "\n\n---------- Forwarded message ---------\nFrom: " + index.fromMail + "\nDate: " + index.dateMail +
            "\nSubject: " + index.subjectMail + "\nTo: " + index.toMail + "\n\n" + index.msgMail;

        document.getElementsByClassName('to')[0].value = "";
        document.getElementsByClassName('subject')[0].value = index.subjectMail;

        shared.hideClassName("read-msg-container", 0);
        shared.showClassName("write-msg-container", 0);
        document.getElementById("message").focus();

        document.getElementById("attach-file").value = null;
        const fileName = index.getFileName(index.fileName);
        if(fileName.fileName && fileName.extension){
            document.getElementsByClassName("filename")[0].innerHTML = fileName.fileName + "." + fileName.extension;
        }
        else{
            document.getElementsByClassName("filename")[0].innerHTML = "";
        }

        index.writeMessage.root.innerHTML = msg;
        document.getElementsByClassName('to')[0].focus();
    }

    onRefreshClicked(){
        index.load(true, true, false, index.option).catch(e => utils.showAlert(e));
    }

    onPageBackClicked(){//get the newer mails
        if(index.option === Constants.OPTION_INBOX){
            index.fromIdReceived = index.fromIdReceived + Constants.ITEMS_OFFSET > index.totalReceived ? index.totalReceived : index.fromIdReceived + Constants.ITEMS_OFFSET;
            index.pageInbox = index.pageInbox - Constants.ITEMS_OFFSET >= 0 ? index.pageInbox - Constants.ITEMS_OFFSET : 0;
            index.loading = index.fromIdReceived;
        }
        else if(index.option === Constants.OPTION_SENT){
            index.fromIdSent = index.fromIdSent + Constants.ITEMS_OFFSET > index.totalSent ? index.totalSent : index.fromIdSent + Constants.ITEMS_OFFSET;
            index.pageSent = index.pageSent - Constants.ITEMS_OFFSET >= 0 ? index.pageSent - Constants.ITEMS_OFFSET : 0;
            index.loading = index.fromIdSent;
        }
        else if(index.option === Constants.OPTION_ALL_MAIL){
            index.fromIdAllMail = index.fromIdAllMail + Constants.ITEMS_OFFSET > index.totalMails ? index.totalMails : index.fromIdAllMail + Constants.ITEMS_OFFSET;
            index.pageAllMail = index.pageAllMail - Constants.ITEMS_OFFSET >= 0 ? index.pageAllMail - Constants.ITEMS_OFFSET : 0;
            index.loading = index.fromIdAllMail;
        }
        else if(index.option === Constants.OPTION_TRASH){
            index.fromIdBurned = index.fromIdBurned + Constants.ITEMS_OFFSET > index.totalBurned ? index.totalBurned : index.fromIdBurned + Constants.ITEMS_OFFSET;
            index.pageBurned = index.pageBurned - Constants.ITEMS_OFFSET >= 0 ? index.pageBurned - Constants.ITEMS_OFFSET : 0;
            index.loading = index.fromIdBurned;
        }
        else if(index.option === Constants.OPTION_BLOCKED_USERS){
            index.fromIdBlockedUsers = index.fromIdBlockedUsers - Constants.ITEMS_OFFSET >= 0 ? index.fromIdBlockedUsers - Constants.ITEMS_OFFSET : 0;
            index.pageBlockedUsers = index.pageBlockedUsers - Constants.ITEMS_OFFSET >= 0 ? index.pageBlockedUsers - Constants.ITEMS_OFFSET : 0;
            index.loading = index.fromIdBlockedUsers;
        }
        else if(index.option === Constants.OPTION_FEEDS){
            index.fromIdFeeds = index.fromIdFeeds - Constants.ITEMS_OFFSET >= 0 ? index.fromIdFeeds - Constants.ITEMS_OFFSET : 0;
            index.pageFeeds = index.pageFeeds - Constants.ITEMS_OFFSET >= 0 ? index.pageFeeds - Constants.ITEMS_OFFSET : 0;
            index.loading = index.fromIdFeeds;
        }
        else if(index.option === Constants.OPTION_SUBSCRIPTIONS){
            index.fromIdSubscriptions = index.fromIdSubscriptions - Constants.ITEMS_OFFSET >= 0 ? index.fromIdSubscriptions - Constants.ITEMS_OFFSET : 0;
            index.pageSubscriptions = index.pageSubscriptions - Constants.ITEMS_OFFSET >= 0 ? index.pageSubscriptions - Constants.ITEMS_OFFSET : 0;
            index.loading = index.fromIdSubscriptions;
        }
        else if(index.option === Constants.OPTION_CONTACTS){
            index.fromIdContacts = index.fromIdContacts - Constants.ITEMS_OFFSET >= 0 ? index.fromIdContacts - Constants.ITEMS_OFFSET : 0;
            index.pageContacts = index.pageContacts - Constants.ITEMS_OFFSET >= 0 ? index.pageContacts - Constants.ITEMS_OFFSET : 0;
            index.loading = index.fromIdContacts;
        }
        else if(index.option === Constants.OPTION_SEARCH_MAIL){
            index.fromIdSearchMail = index.fromIdSearchMail - Constants.ITEMS_OFFSET >= 0 ? index.fromIdSearchMail - Constants.ITEMS_OFFSET : 0;
            index.pageSearchMail = index.pageSearchMail - Constants.ITEMS_OFFSET >= 0 ? index.pageSearchMail - Constants.ITEMS_OFFSET : 0;
            index.loading = index.fromIdSearchMail;
        }
        index.controller?.abort();
        index.loadItems(true, false, index.option);
    }

    onPageForwardClicked(){//get the older mails
        if(index.option === Constants.OPTION_INBOX) {
            index.fromIdReceived = index.fromIdReceived - Constants.ITEMS_OFFSET > 0 ? index.fromIdReceived - Constants.ITEMS_OFFSET : 1;
            index.pageInbox = index.pageInbox + Constants.ITEMS_OFFSET <= index.totalReceived ? index.pageInbox + Constants.ITEMS_OFFSET : index.totalReceived;
            index.loading = index.fromIdReceived;
        }
        else if(index.option === Constants.OPTION_SENT){
            index.fromIdSent = index.fromIdSent - Constants.ITEMS_OFFSET > 0 ? index.fromIdSent - Constants.ITEMS_OFFSET : 1;
            index.pageSent = index.pageSent + Constants.ITEMS_OFFSET <= index.totalSent ? index.pageSent + Constants.ITEMS_OFFSET : index.totalSent;
            index.loading = index.fromIdSent;
        }
        else if(index.option === Constants.OPTION_ALL_MAIL){
            index.fromIdAllMail = index.fromIdAllMail - Constants.ITEMS_OFFSET > 0 ? index.fromIdAllMail - Constants.ITEMS_OFFSET : 1;
            index.pageAllMail = index.pageAllMail + Constants.ITEMS_OFFSET <= index.totalMails ? index.pageAllMail + Constants.ITEMS_OFFSET : index.totalMails;
            index.loading = index.fromIdAllMail;
        }
        else if(index.option === Constants.OPTION_TRASH){
            index.fromIdBurned = index.fromIdBurned - Constants.ITEMS_OFFSET > 0 ? index.fromIdBurned - Constants.ITEMS_OFFSET : 1;
            index.pageBurned = index.pageBurned + Constants.ITEMS_OFFSET <= index.totalBurned ? index.pageBurned + Constants.ITEMS_OFFSET : index.totalBurned;
            index.loading = index.fromIdBurned;
        }
        else if(index.option === Constants.OPTION_BLOCKED_USERS){
            index.fromIdBlockedUsers = index.fromIdBlockedUsers + Constants.ITEMS_OFFSET > index.totalBlockedUsers ? index.totalBlockedUsers : index.fromIdBlockedUsers + Constants.ITEMS_OFFSET;
            index.pageBlockedUsers = index.pageBlockedUsers + Constants.ITEMS_OFFSET <= index.totalBlockedUsers ? index.pageBlockedUsers + Constants.ITEMS_OFFSET : index.totalBlockedUsers;
            index.loading = index.fromIdBlockedUsers;
        }
        else if(index.option === Constants.OPTION_FEEDS){
            index.fromIdFeeds = index.fromIdFeeds + Constants.ITEMS_OFFSET > index.totalFeeds ? index.totalFeeds : index.fromIdFeeds + Constants.ITEMS_OFFSET;
            index.pageFeeds = index.pageFeeds + Constants.ITEMS_OFFSET <= index.totalFeeds ? index.pageFeeds + Constants.ITEMS_OFFSET : index.totalFeeds;
            index.loading = index.fromIdFeeds;
        }
        else if(index.option === Constants.OPTION_SUBSCRIPTIONS){
            index.fromIdSubscriptions = index.fromIdSubscriptions + Constants.ITEMS_OFFSET > index.totalSubscriptions ? index.totalSubscriptions : index.fromIdSubscriptions + Constants.ITEMS_OFFSET;
            index.pageSubscriptions = index.pageSubscriptions + Constants.ITEMS_OFFSET <= index.totalSubscriptions ? index.pageSubscriptions + Constants.ITEMS_OFFSET : index.totalSubscriptions;
            index.loading = index.fromIdSubscriptions;
        }
        else if(index.option === Constants.OPTION_CONTACTS){
            index.fromIdContacts = index.fromIdContacts + Constants.ITEMS_OFFSET > index.totalContacts ? index.totalContacts : index.fromIdContacts + Constants.ITEMS_OFFSET;
            index.pageContacts = index.pageContacts + Constants.ITEMS_OFFSET <= index.totalContacts ? index.pageContacts + Constants.ITEMS_OFFSET : index.totalContacts;
            index.loading = index.fromIdContacts;
        }
        else if(index.option === Constants.OPTION_SEARCH_MAIL){
            index.fromIdSearchMail = index.fromIdSearchMail + Constants.ITEMS_OFFSET > index.totalSearchMails ? index.totalSearchMails : index.fromIdSearchMail + Constants.ITEMS_OFFSET;
            index.pageSearchMail = index.pageSearchMail + Constants.ITEMS_OFFSET <= index.totalSearchMails ? index.pageSearchMail + Constants.ITEMS_OFFSET : index.totalSearchMails;
            index.loading = index.fromIdSearchMail;
        }
        index.controller?.abort();
        index.loadItems(true, false, index.option);
    }

    async onSignInClicked(){
        if(!index.address){
            index.showAddressError();
            return;
        }

        shared.showLoading();
        try{
            index.signature = await window.ethereum.request({
                method: 'personal_sign',
                params: [Constants.SIGN_IN_MESSAGE, index.address],
            });
            const signHash = await utils.getSha256(index.signature);

            index.getTerms(signHash)
                .then(async terms => {
                    if(terms.status){
                        index.termsMessage = terms.message;
                        index.termsSign = terms.signature;
                        index.jwk = await index.getMailEncryptedPK();
                        index.signIn().catch(e => utils.showAlert(e));
                    }
                    else{
                        try{
                            if(!Constants.IS_LOCALHOST){
                                const timestamp = Date.now();
                                index.termsMessage = Constants.TERMS_MESSAGE + "\"" + utils.getDate(timestamp) + " - " + utils.getTime(timestamp) + "\"}";
                                index.termsSign = await window.ethereum.request({
                                    method: 'personal_sign',
                                    params: [index.termsMessage, index.address],
                                });
                            }
                            index.jwk = await index.getMailEncryptedPK();

                            if(terms.status === null) {//the user didn't create account on the database
                                if(Constants.IS_LOCALHOST){
                                    index.sendEncryptedPK("", signHash)
                                        .then(() => index.signIn().catch(e => utils.showAlert(e)))
                                        .catch(e => utils.showAlert(e));
                                }
                                else{
                                    index.sendEncryptedPK("", signHash)
                                        .then(() => {
                                            index.sendTerms(index.termsMessage, index.termsSign)
                                                .then(() => index.signIn().catch(e => utils.showAlert(e)))
                                                .catch(e => utils.showAlert(e));
                                        })
                                        .catch(e => utils.showAlert(e));
                                }
                            }
                            else{
                                if(Constants.IS_LOCALHOST){
                                    index.signIn().catch(e => utils.showAlert(e));
                                }
                                else{
                                    index.sendTerms(index.termsMessage, index.termsSign)
                                        .then(() => index.signIn().catch(e => utils.showAlert(e)))
                                        .catch(e => utils.showAlert(e));
                                }
                            }
                        }
                        catch (e) {
                            utils.showAlert(e);
                        }
                    }
                })
                .catch(e => utils.showAlert(e));
        }
        catch (e) {
            index.jwk = undefined;
            utils.showAlert(e);
        }
    }

    async signIn(){
        if(index.jwk) {
            index.hideDialog();
            shared.enableAll(true);
            index.disableSignInButton();
            await index.checkValues();
            index.load(true, true, false, Constants.OPTION_INBOX).catch(e => utils.showAlert(e));
        }
        else if(index.jwk === undefined){
            let encryptedpk = "";
            const fileAttached = document.getElementById("attach-pk").files[0];
            const reader = new FileReader();

            reader.onload = async function() {
                encryptedpk = reader.result;
                const privateKey = utils.get32BytesPassword(index.signature, index.address);

                try{
                    const obj = await aes.decryptData(encryptedpk, privateKey);
                    if(obj.includes('"n"') && obj.includes('"e"')){
                        index.jwk = JSON.parse(obj.toString());
                        index.hideDialog();
                        shared.enableAll(true);
                        index.disableSignInButton();
                        await index.checkValues();
                        index.load(true, true, false, Constants.OPTION_INBOX).catch(e => utils.showAlert(e));
                    }
                    else{
                        utils.showAlert("Error: invalid imported private key.");
                    }
                }
                catch (_) {
                    utils.showAlert("Error: invalid imported private key.");
                }
            }

            if(fileAttached){
                reader.readAsText(fileAttached);
            }
            else{
                utils.showAlert("Error: you need to import your private key on the Settings first.");
            }
        }
        else if(index.jwk === null){
            index.showSignUpDialog();
        }
    }

    onSignUpOrConnectClicked(){
        if(index.actionType === Constants.ACTION_SIGNUP){
            shared.showLoading();
            index.createAccount().catch(e => utils.showAlert(e));
        }
        else if(index.actionType === Constants.ACTION_CONNECT){
            utils.listenMetaMaskEvents(index)
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
        else{
            index.hideDialog();
        }
        index.actionType = 0;
    }

    async onSendClicked(){
        shared.showLoading();
        let address = document.getElementsByClassName('to')[0].value;
        address = await index.getAddress(address);
        const result = await index.checkAddress(address);
        if(result.isFeed){
            if(result.addresses.length === 0){
                utils.showAlert("Error: no subscribers in this Feed.");
            }
            else{
                index.sendFeed(address, result.addresses).catch(e => utils.showAlert(e));
            }
        }
        else{
            if((await utils.getBigNumber(index.web3.utils.toWei(index.credits.toString(), "ether"))).gte((await utils.getBigNumber(index.web3.utils.toWei(Constants.MIN_CREDITS.toString(), "ether"))))){
                index.sendMail(result.address).catch(e => utils.showAlert(e));
            }
            else{
                utils.showAlert("Error: you must have "+Constants.MIN_CREDITS+" "+Constants.CREDITS_SYMBOL+" added to your account to send a Mail.");
                index.showAddCreditsDialog(Constants.ACTION_ADD_CREDITS_TO_SEND_MAIL).catch(e => utils.showAlert(e));
            }
        }
    }

    async checkAddress(address){
        try{
            address = address.toString().trim();
            const feedContract = await utils.getContract(address);
            const feedInfo = await feedContract.methods.getInfo().call();
            const totalSubscribers = feedInfo[3] > 0 ? (Constants.USE_DYNAMIC_LENGTH ? feedInfo[3] : Constants.DEFAULT_LENGTH) : Constants.DEFAULT_LENGTH;
            const subscribers = await feedContract.methods.getSubscribers(totalSubscribers).call();
            const addresses = [];
            for(let i=0;i<subscribers.length;i++){
                if(subscribers[i] !== Constants.ZERO_ADDRESS){
                    addresses.push(subscribers[i]);
                }
            }
            if(subscribers && subscribers.length > 0){
                return {isFeed: true, addresses: addresses};
            }
        }
        catch (e) {
            return {isFeed: false, address: address};
        }
    }

    async onDownloadAttachmentClicked(){
        shared.showLoading();
        index.decryptFile()
            .then(decryptedFileBase64 => {
                utils.urlToFile(decryptedFileBase64, index.fileName, index.fileType)
                    .then(decryptedFile => {
                        utils.saveFile(decryptedFile, index.fileName, index.fileType);
                        shared.hideLoading();
                    })
                    .catch(e => utils.showAlert(e));
            })
            .catch(e => utils.showAlert(e));
    }

    onAddCreditsClicked(){
        if(!index.address){
            index.showAddressError();
            return;
        }
        index.showAddCreditsDialog(Constants.ACTION_ADD_CREDITS).catch(e => utils.showAlert(e));
    }

    onBuyCreditsClicked(){
        if(!index.address){
            index.showAddressError();
            return;
        }
        index.showBuyCreditsDialog("Set the amount and click on the<br>'Buy Credits' button to buy <br>HashBox Mail credits.").catch(e => utils.showAlert(e));
    }

    onApproveCreditsClicked(){
        if(!index.address){
            index.showAddressError();
            return;
        }
        index.showApproveCreditsDialog().catch(e => utils.showAlert(e));
    }

    onDepositCreditsClicked(){
        if(!index.address){
            index.showAddressError();
            return;
        }
        index.showDepositCreditsDialog().catch(e => utils.showAlert(e));
    }

    onSellCreditsClicked(){
        if(!index.address){
            index.showAddressError();
            return;
        }
        index.showSellCreditsDialog().catch(e => utils.showAlert(e));
    }

    onWithdrawEtherClicked(){
        if(!index.address){
            index.showAddressError();
            return;
        }
        index.showWithdrawEtherDialog().catch(e => utils.showAlert(e));
    }

    onWithdrawTokenClicked(){
        if(!index.address){
            index.showAddressError();
            return;
        }
        index.showWithdrawTokenDialog().catch(e => utils.showAlert(e));
    }

    onCreateFeed(){
        if(!index.address){
            index.showAddressError();
            return;
        }
        index.showCreateFeedDialog().catch(e => utils.showAlert(e));
    }

    onPaymentWithTokenClicked(){
        document.getElementsByClassName("feed-extension-address")[0].disabled = !document.getElementById("payment-with-token").checked;
    }

    async onDeleteAccountClicked(){
        if(index.signature){
            try{
                const signHash = await utils.getSha256(index.signature);
                const timestamp = Date.now();
                const message = Constants.DELETION_MESSAGE + utils.getDate(timestamp) + " - " + utils.getTime(timestamp);
                const signature = await window.ethereum.request({
                    method: 'personal_sign',
                    params: [message, index.address],
                });

                utils.setCookie("allowed-cookie","false", 0);
                index.deleteAccountServer(signHash, message, signature)
                    .then(() => index.deleteAccount())
                    .catch(e => utils.showAlert(e));
            }
            catch (e) {
                utils.showAlert(e);
            }
        }
        else{
            utils.showAlert("Error: you must sign in first.");
        }
    }

    async searchMails(){
        index.cleanSearchMailList();
        let address = document.getElementsByClassName("search-mail-input")[0].value;
        address = await index.getAddress(address);
        address = await utils.checkAddress(address);

        if(!address){
            utils.showAlert("Error: invalid Address or Nickname.");
            return;
        }

        index.addressToSearch = address;
        index.load(true, true, false, Constants.OPTION_SEARCH_MAIL).catch(e => utils.showAlert(e));
    }

    async getSearchMails(){
        let items = [];

        let fromToInfo = await index.mailContract.methods.getFromToInfo(index.address, index.addressToSearch, 0, 1).call();
        const total1 = parseInt(fromToInfo[0]);

        fromToInfo = await index.mailContract.methods.getFromToInfo(index.address, index.addressToSearch, total1, total1).call();
        const ids1 = fromToInfo[1];

        let total = total1;
        let ids2 = [];

        if(index.address !== index.addressToSearch){
            fromToInfo = await index.mailContract.methods.getFromToInfo(index.addressToSearch, index.address, 0, 1).call();
            const total2 = parseInt(fromToInfo[0]);

            fromToInfo = await index.mailContract.methods.getFromToInfo(index.addressToSearch, index.address, total2, total2).call();
            ids2 = fromToInfo[1];

            total = total + total2;
        }

        for(let i=0;i<ids1.length;i++){
            if(ids1[i] !== "0"){
                items.push({
                    id: ids1[i],
                    sender: index.address
                });
            }
        }
        for(let i=0;i<ids2.length;i++){
            if(ids2[i] !== "0" && !items.some(e => e.id === ids2[i] && e.sender === index.addressToSearch)){
                items.push({
                    id: ids2[i],
                    sender: index.addressToSearch
                });
            }
        }

        const array = [];
        for(let i=0;i<items.length;i++){
            const mail = await index.mailContract.methods.getMails(items[i].sender, items[i].id, 1, Constants.OPTION_SENT).call();
            array.push({
                id: mail[0][0],
                uri: mail[1][0],
                block: mail[2][0]
            });
        }
        array.sort((a,b) => b.block - a.block);

        let ids = [];
        let uris = [];
        let blocks = [];
        for(let i=0;i<array.length;i++){
            ids.push(array[i].id);
            uris.push(array[i].uri);
            blocks.push(array[i].block);
        }

        ids = ids.slice(index.fromIdSearchMail, index.fromIdSearchMail + Constants.ITEMS_OFFSET);
        uris = uris.slice(index.fromIdSearchMail, index.fromIdSearchMail + Constants.ITEMS_OFFSET);
        blocks = blocks.slice(index.fromIdSearchMail, index.fromIdSearchMail + Constants.ITEMS_OFFSET);

        const mails = {"0": ids,"1": uris,"2": blocks};
        return {mails: mails, total: total};
    }

    cleanSearchMailList(){
        index.addressToSearch = "";
        index.searchMail = [];
        index.totalSearchMails = 0;

        let htmlStr = "";
        for(let i=0;i<length;i++){
            htmlStr += this.rowSearchMailList(i);
        }

        document.getElementsByClassName("search-mail-list")[0].innerHTML = htmlStr;
        document.getElementsByClassName("total")[0].innerHTML = '0';
    }

    async onOKAmountClicked(){
        shared.showLoading();
        let amount = document.getElementsByClassName('credits-amount')[0].value;
        if(parseFloat(amount) < 0 || !amount || amount === ""){
            utils.showAlert("Error: invalid amount.");
            return;
        }
        const wei = shared.getWei(amount, index.web3);
        if(!wei){
            return;
        }

        if(index.actionType === Constants.ACTION_ADD_CREDITS ||
            index.actionType === Constants.ACTION_ADD_CREDITS_TO_CONTACTS ||
            index.actionType === Constants.ACTION_ADD_CREDITS_TO_SEND_MAIL ||
            index.actionType === Constants.ACTION_ADD_CREDITS_TO_FEEDS){
            index.hideDialog();
            index.addCredits(amount).catch(e => utils.showAlert(e));
        }
        else if(index.actionType === Constants.ACTION_BUY_CREDITS){
            //checking if the launchpad has the amount needed
            const balance = await index.creditsContract.methods.balanceOf(Constants.LAUNCHPAD_CONTRACT_ADDRESS).call();
            if((await utils.getBigNumber(balance)).gt(0)){
                if(!index.launchpadContract){
                    index.launchpadContract = await utils.getContract(Constants.LAUNCHPAD_CONTRACT_ADDRESS);
                }
                const minAmount = await index.launchpadContract.methods.getMinCreditsAmount().call();
                if((await utils.getBigNumber(index.web3.utils.toWei(amount.toString(), "ether"))).gte(await utils.getBigNumber(minAmount))){
                    index.buyCredits(amount).catch(e => utils.showAlert(e));
                }
                else{
                    utils.showAlert("Error: amount is less than "+index.web3.utils.fromWei(minAmount.toString(), "ether") + " " + Constants.CREDITS_SYMBOL + "s.");
                }
            }
            else{
                utils.showAlert("Error: amount exceeds balance.");
            }
        }
        else if(index.actionType === Constants.ACTION_APPROVE_TO_DEPOSIT_CREDITS){
            index.approveToDepositSellCredits(amount).catch(e => utils.showAlert(e));
        }
        else if(index.actionType === Constants.ACTION_DEPOSIT_CREDITS){
            const allowance = await index.creditsContract.methods.allowance(index.address, Constants.LAUNCHPAD_CONTRACT_ADDRESS).call();
            if((await utils.getBigNumber(allowance)).gte(await utils.getBigNumber(index.web3.utils.toWei(amount.toString(), "ether")))){
                index.hideDialog();
                index.depositCredits(amount).catch(e => utils.showAlert(e));
            }
            else{
                utils.showAlert("Error: amount exceeds available credits for deposit.");
            }
        }
        else if(index.actionType === Constants.ACTION_SELL_CREDITS){
            const allowance = await index.creditsContract.methods.allowance(index.address, Constants.LAUNCHPAD_CONTRACT_ADDRESS).call();
            if((await utils.getBigNumber(allowance)).gte(await utils.getBigNumber(index.web3.utils.toWei(amount.toString(), "ether")))){
                index.hideDialog();
                index.sellCredits(amount).catch(e => utils.showAlert(e));
            }
            else{
                utils.showAlert("Error: amount exceeds available credits for deposit.");
            }
        }
        else if(index.actionType === Constants.ACTION_WITHDRAW_ETHER){
            const totalDeposits = await index.launchpadContract.methods.getTotalDeposits(index.address).call();
            const total = ((await utils.getBigNumber(totalDeposits)).mul(await utils.getBigNumber(index.web3.utils.toWei(index.price.toString(), "ether")))).div(await utils.getBigNumber(index.web3.utils.toWei("1", "ether")));
            if((await utils.getBigNumber(total)).gte(await utils.getBigNumber(index.web3.utils.toWei(amount.toString(), "ether")))){
                index.hideDialog();
                index.withdrawEther(amount).catch(e => utils.showAlert(e));
            }
            else{
                utils.showAlert("Error: amount exceeds balance.");
            }
        }
        else if(index.actionType === Constants.ACTION_WITHDRAW_TOKEN){
            const totalDeposits = await index.launchpadContract.methods.getTotalDeposits(index.address).call();
            if((await utils.getBigNumber(totalDeposits)).gte(await utils.getBigNumber(index.web3.utils.toWei(amount.toString(), "ether")))){
                index.hideDialog();
                index.withdrawToken(amount).catch(e => utils.showAlert(e));
            }
            else{
                utils.showAlert("Error: amount exceeds balance.");
            }
        }
        else if(index.actionType === Constants.ACTION_APPROVE_TOKENS){
            index.hideDialog();
            const decimals = parseInt(index.decimals);
            const period = amount.toString().indexOf(".");
            const valueWithDecimals = amount.toString().substring(0, period) + amount.toString().substring(period, decimals + period + 1);
            amount = index.web3.utils.toWei(valueWithDecimals, index.unit);
            index.onApproveTokensFeedClicked(index.feedExtensionAddress, index.feedTokenAddress, amount).catch(e => utils.showAlert(e));
        }
    }

    async onOKFeedClicked(){
        shared.showLoading();
        const paymentWithToken = document.getElementById("payment-with-token").checked;
        let extensionAddress;
        if(paymentWithToken){
            extensionAddress = document.getElementsByClassName('feed-extension-address')[0].value;
            if(!(await index.checkExtensionAddress(extensionAddress))){
                return;
            }
        }
        else{
            extensionAddress = Constants.ZERO_ADDRESS;
        }

        const name = document.getElementsByClassName('feed-name')[0].value;
        if(!name || name === ""){
            utils.showAlert("Error: invalid name.");
            return;
        }

        const timeInSecs = document.getElementById('feed-time').value;
        if(parseFloat(timeInSecs) < 0 || !timeInSecs || timeInSecs === ""){
            utils.showAlert("Error: invalid time.");
            return;
        }

        let price = document.getElementsByClassName('feed-price')[1].value;
        if(parseFloat(price) < 0 || !price || price === ""){
            utils.showAlert("Error: invalid price.");
            return;
        }

        const maxSubscribers = document.getElementById('feed-max').value;
        if(parseFloat(maxSubscribers) < 0 || !maxSubscribers || maxSubscribers === ""){
            utils.showAlert("Error: invalid maximum subscribers.");
            return;
        }

        if(index.actionType === Constants.ACTION_CREATE_FEED){
            if(!index.mailContract){
                index.mailContract = await utils.getContract(Constants.MAIL_CONTRACT_ADDRESS);
            }

            if(!index.mailFeedsContract){
                const mailFeedsAddress = await index.mailContract.methods.getMailFeedsAddress().call();
                index.mailFeedsContract = await utils.getContract(mailFeedsAddress);
            }

            if(!index.creditsContract){
                index.creditsContract = await utils.getContract(Constants.CREDITS_CONTRACT_ADDRESS);
            }

            const allowance = await index.creditsContract.methods.allowance(index.address, Constants.MAIL_CONTRACT_ADDRESS).call();
            const prices = await index.mailContract.methods.getPrices().call();
            const feedPrice = prices[0];
            if((await utils.getBigNumber(allowance)).gte(await utils.getBigNumber(feedPrice))){
                index.actionType = 0;

                let priceInUnit = shared.getWei(price, index.web3);
                if(!priceInUnit){
                    return;
                }

                if(paymentWithToken){
                    const feedExtensionContract = await utils.getContract(extensionAddress);
                    const feedTokenAddress = await feedExtensionContract.methods.getTokenAddress().call();
                    if(!(await index.checkTokenAddress(feedTokenAddress))){
                        return;
                    }

                    const tokenContract = await utils.getContract(feedTokenAddress);
                    const result = await utils.getUnit(tokenContract, index.web3);
                    const unit = result.unit;
                    const decimals = parseInt(result.decimals);
                    const period = price.toString().indexOf(".");
                    const valueWithDecimals = price.toString().substring(0, period) + price.toString().substring(period, decimals + period + 1);
                    priceInUnit = index.web3.utils.toWei(valueWithDecimals, unit);
                }

                index.createMailFeed(name, "", timeInSecs, extensionAddress, priceInUnit, maxSubscribers).catch(e => utils.showAlert(e));
            }
            else{
                index.hideDialog();
                const amountInEther = index.web3.utils.fromWei(feedPrice.toString(), "ether").toString();
                utils.showAlert("Error: you must have "+amountInEther+" "+Constants.CREDITS_SYMBOL+"s added to your account to create a Feed.");
                index.showAddCreditsDialog(Constants.ACTION_ADD_CREDITS_TO_FEEDS).catch(e => utils.showAlert(e));
            }
        }
    }

    async onOKRatingClicked(){
        const rating = document.getElementById("rating").value;
        if(index.actionType === Constants.ACTION_SET_RATING){
            index.onSetRating(rating).catch(e => utils.showAlert(e));
        }
    }

    async onOKContactsClicked(){
        shared.showLoading();
        const symbol = document.getElementById("contacts-symbol").value;
        let address = document.getElementsByClassName("contacts-address")[0].value;
        const nickname = document.getElementsByClassName("contacts-nickname")[0].value;

        if(!symbol || symbol === ""){
            utils.showAlert("Error: invalid symbol.");
            return;
        }
        address = await utils.checkAddress(address);
        if(!address){
            utils.showAlert("Error: invalid address.");
            return;
        }
        if(!nickname || nickname === ""){
            utils.showAlert("Error: invalid nickname.");
            return;
        }

        if(!index.contactsContract){
            index.contactsContract = await utils.getContract(Constants.CONTACTS_ADDRESS);
        }

        const allowance = await index.creditsContract.methods.allowance(index.address, Constants.MAIL_CONTRACT_ADDRESS).call();
        const prices = await index.mailContract.methods.getPrices().call();
        const price = prices[1];
        if(index.actionType === Constants.ACTION_ADD_CONTACT){
            if((await utils.getBigNumber(allowance)).gte(await utils.getBigNumber(price))){
                index.hideDialog();
                index.onAddContact(symbol, address, nickname).catch(e => utils.showAlert(e));
                index.actionType = 0;
            }
            else{
                index.hideDialog();
                const amountInEther = index.web3.utils.fromWei(price.toString(), "ether").toString();
                utils.showAlert("Error: you must have "+amountInEther+" "+Constants.CREDITS_SYMBOL+"s added to your account to add a Contact.");
                index.showAddCreditsToContactsDialog().catch(e => utils.showAlert(e));
            }
        }
        else if(index.actionType === Constants.ACTION_EDIT_CONTACT){
            index.hideDialog();
            index.editContact(symbol, address, nickname).catch(e => utils.showAlert(e));
            index.actionType = 0;
        }
    }

    async onOKSendMoneyClicked(){
        shared.showLoading();
        const amount = document.getElementsByClassName("send-money-amount")[0].value;
        const tokenAddress = document.getElementById("send-money-type").value;
        let to = document.getElementsByClassName("send-money-address")[0].value;

        if(!amount || amount === ""){
            utils.showAlert("Error: invalid amount.");
            return;
        }

        if(!utils.isAddress(to) && !index.signature){
            utils.showAlert("Error: you must sign in before using a nickname to send token.");
            return;
        }
        else{
            to = await index.getAddress(to);
            to = await utils.checkAddress(to);
            if(!to){
                utils.showAlert("Error: invalid address.");
                return;
            }
        }

        if(tokenAddress === ""){
            const amountInWei = shared.getWei(amount, index.web3);
            if(!amountInWei){
                return;
            }
            const balance = await index.web3.eth.getBalance(index.address);

            if((await utils.getBigNumber(balance)).gte(await utils.getBigNumber(amountInWei))){
                index.sendMoney("", to, amountInWei).catch(e => utils.showAlert(e));
            }
            else{
                utils.showAlert("Error: you must have "+amount+" "+Constants.DEFAULT_TOKEN_SYMBOL+"s available in your wallet to send token.");
            }
        }
        else{
            const tokenContract = await utils.getContract(tokenAddress);
            const available = await tokenContract.methods.balanceOf(index.address).call();
            const result = await utils.getUnit(tokenContract, index.web3);
            const unit = result.unit;
            const decimals = parseInt(result.decimals);
            const period = amount.indexOf(".");
            const valueWithDecimals = amount.substring(0, period) + amount.substring(period, decimals + period + 1);
            const amountInUnit = index.web3.utils.toWei(valueWithDecimals, unit);

            if((await utils.getBigNumber(available)).gte(await utils.getBigNumber(amountInUnit))){
                index.sendMoney(tokenAddress, to, amountInUnit).catch(e => utils.showAlert(e));
            }
            else{
                const symbol = await tokenContract.methods.symbol().call();
                utils.showAlert("Error: you must have " + valueWithDecimals + " " + symbol + "s available in your wallet to send token.");
            }
        }
    }

    async onSubscribeFeedClicked(feedAddress){
        shared.showLoading();

        index.feedAddress = feedAddress;
        const feedContract = await utils.getContract(index.feedAddress);
        const extensionAddress = await feedContract.methods.getExtensionInfo().call();
        const isPaymentWithToken = extensionAddress !== Constants.ZERO_ADDRESS;
        const info = await feedContract.methods.getInfo().call();
        let price = info[2];

        if(isPaymentWithToken){
            index.feedExtensionAddress = extensionAddress;
            const feedExtensionContract = await utils.getContract(index.feedExtensionAddress);
            index.feedTokenAddress = await feedExtensionContract.methods.getTokenAddress().call();
            price = await feedExtensionContract.methods.getPrice().call();
            const tokenContract = await utils.getContract(index.feedTokenAddress);
            const available = await tokenContract.methods.balanceOf(index.address).call();
            const allowance = await tokenContract.methods.allowance(index.address, index.feedExtensionAddress).call();
            const symbol = await tokenContract.methods.symbol().call();
            const result = await utils.getUnit(tokenContract, index.web3);
            index.unit = result.unit;
            index.decimals = result.decimals;

            if((await utils.getBigNumber(available)).lte(await utils.getBigNumber(price))) {
                const amount = index.web3.utils.fromWei(price.toString(), index.unit).toString();
                utils.showAlert("Error: you must have " + amount + " " + symbol + "s in your wallet to subscribe to this feed.");
                return;
            }

            if((await utils.getBigNumber(allowance)).gte(await utils.getBigNumber(price))){
                index.subscribeFeed(index.feedAddress, price, isPaymentWithToken).catch(e => utils.showAlert(e));
            }
            else{
                const amount = index.web3.utils.fromWei(price.toString(), index.unit).toString();
                utils.showAlert("Error: you must have " + amount + " " + symbol + "s approved to subscribe to this feed.");
                index.showApproveTokensDialog(allowance, symbol, index.feedExtensionAddress, index.unit).catch(e => utils.showAlert(e));
            }
        }
        else{
            index.subscribeFeed(index.feedAddress, price, isPaymentWithToken).catch(e => utils.showAlert(e));
        }
    }

    async onUnsubscribeFeedClicked(){
        const feedAddress = document.getElementsByClassName("unsubscribe-address")[0].value;
        index.unsubscribeFeed(feedAddress).catch(e => utils.showAlert(e));
    }

    async showAddCreditsDialog(actionType){
        this.actionType = actionType;
        shared.showLoading();

        if(!this.creditsContract){
            this.creditsContract = await utils.getContract(Constants.CREDITS_CONTRACT_ADDRESS);
        }

        let balance = await this.creditsContract.methods.balanceOf(this.address).call();
        balance = parseInt(this.web3.utils.fromWei(balance.toString(), "ether")) - this.credits;
        if (balance >= Constants.MIN_CREDITS) {
            document.getElementsByClassName("custom-title-warning")[3].innerHTML = "Add Credits";
            document.getElementsByClassName("custom-text-warning")[6].innerHTML = "Set the amount and click on the<br>'Add Credits' button to add funds<br>to your HashBox Mail account.";
            document.getElementsByClassName("custom-btn-warning")[5].innerHTML = "CLOSE";
            document.getElementsByClassName("custom-btn-warning")[6].innerHTML = "ADD CREDITS";
            document.getElementsByClassName("total-label")[0].innerHTML = "Available:&nbsp;";
            document.getElementsByClassName("total")[1].innerHTML = utils.getEllipsis(balance.toString(), Constants.MAX_CHARACTERS_DIALOGS) + "&nbsp;" + Constants.CREDITS_SYMBOL + "s";
            document.getElementsByClassName('credits-amount')[0].onchange = () => {};
            shared.showClassName("dialog-background", 0);
            shared.showClassName("custom-dialog-credits", 0);
            shared.hideLoading();
        }
        else{
            this.showBuyCreditsDialog("You don't have funds.<br>Set the amount to buy<br>HashBox Mail credits.").catch(e => utils.showAlert(e));
        }
    }

    async showAddCreditsToContactsDialog(){
        this.actionType = Constants.ACTION_ADD_CREDITS_TO_CONTACTS;
        shared.showLoading();

        if(!this.creditsContract){
            this.creditsContract = await utils.getContract(Constants.CREDITS_CONTRACT_ADDRESS);
        }

        let balance = await this.creditsContract.methods.balanceOf(this.address).call();
        balance = parseInt(this.web3.utils.fromWei(balance.toString(), "ether"));
        if (balance >= Constants.MIN_CONTACTS_CREDITS) {
            document.getElementsByClassName("custom-title-warning")[3].innerHTML = "Add Credits";
            document.getElementsByClassName("custom-text-warning")[6].innerHTML = "Set the amount and click on the<br>'Add Credits' button to add funds<br>to your HashBox Mail account.";
            document.getElementsByClassName("custom-btn-warning")[5].innerHTML = "CLOSE";
            document.getElementsByClassName("custom-btn-warning")[6].innerHTML = "ADD CREDITS";
            document.getElementsByClassName("total-label")[0].innerHTML = "Available:&nbsp;";
            document.getElementsByClassName("total")[1].innerHTML = utils.getEllipsis(balance.toString(), Constants.MAX_CHARACTERS_DIALOGS) + "&nbsp;" + Constants.CREDITS_SYMBOL + "s";
            document.getElementsByClassName('credits-amount')[0].onchange = () => {};
            shared.showClassName("dialog-background", 0);
            shared.showClassName("custom-dialog-credits", 0);
            shared.hideLoading();
        }
        else{
            this.showBuyCreditsDialog("You don't have funds.<br>Set the amount to buy<br>HashBox Mail credits.").catch(e => utils.showAlert(e));
        }
    }

    async showBuyCreditsDialog(text){
        this.actionType = Constants.ACTION_BUY_CREDITS;
        shared.showLoading();

        if(!this.creditsContract){
            this.creditsContract = await utils.getContract(Constants.CREDITS_CONTRACT_ADDRESS);
        }

        document.getElementsByClassName("custom-title-warning")[3].innerHTML = "Buy Credits";
        document.getElementsByClassName("custom-text-warning")[6].innerHTML = text;
        document.getElementsByClassName("custom-btn-warning")[5].innerHTML = "CLOSE";
        document.getElementsByClassName("custom-btn-warning")[6].innerHTML = "BUY CREDITS";
        document.getElementsByClassName("total-label")[0].innerHTML = "Total:&nbsp;";
        document.getElementsByClassName('credits-amount')[0].onchange = (event) => {
            this.setTotalPrice(event.target.value);
        };
        const creditsAmount = document.getElementsByClassName('credits-amount')[0].value;
        await this.setTotalPrice(creditsAmount);
        shared.showClassName("dialog-background", 0);
        shared.showClassName("custom-dialog-credits", 0);
        shared.hideLoading();
    }

    async showDepositCreditsDialog(){
        shared.showLoading();

        if(!this.creditsContract){
            this.creditsContract = await utils.getContract(Constants.CREDITS_CONTRACT_ADDRESS);
        }

        let allowance = await this.creditsContract.methods.allowance(this.address, Constants.LAUNCHPAD_CONTRACT_ADDRESS).call();
        allowance = this.web3.utils.fromWei(allowance.toString(), "ether");
        let available = parseInt(allowance);
        if((await utils.getBigNumber(this.web3.utils.toWei(allowance.toString(), "ether"))).gt(0)){
            this.actionType = Constants.ACTION_DEPOSIT_CREDITS;
            document.getElementsByClassName("custom-title-warning")[3].innerHTML = "Deposit Credits";
            document.getElementsByClassName("custom-text-warning")[6].innerHTML = "Set the amount and click on the<br>'Deposit' button to deposit <br>HashBox Mail credits.";
            document.getElementsByClassName("custom-btn-warning")[6].innerHTML = "DEPOSIT";
            document.getElementsByClassName("total-label")[0].innerHTML = "Available:&nbsp;";
        }
        else{
            this.actionType = Constants.ACTION_APPROVE_TO_DEPOSIT_CREDITS;
            this.actionNext = Constants.ACTION_DEPOSIT_CREDITS;
            document.getElementsByClassName("custom-title-warning")[3].innerHTML = "Approve Credits to Deposit";
            document.getElementsByClassName("custom-text-warning")[6].innerHTML = "Set the amount and click on the<br>'Approve' button to approve the <br>HashBox Mail credits to deposit.";
            document.getElementsByClassName("custom-btn-warning")[6].innerHTML = "APPROVE";
            document.getElementsByClassName("total-label")[0].innerHTML = "Available:&nbsp;";
            available = await this.creditsContract.methods.balanceOf(this.address).call();
            available = parseInt(this.web3.utils.fromWei(available.toString(), "ether"));
        }

        document.getElementsByClassName('credits-amount')[0].onchange = () => {};
        document.getElementsByClassName("total")[1].innerHTML = utils.getEllipsis(available.toString(), Constants.MAX_CHARACTERS_DIALOGS) + "&nbsp;" + Constants.CREDITS_SYMBOL + "s";
        document.getElementsByClassName("custom-btn-warning")[5].innerHTML = "CLOSE";
        shared.showClassName("dialog-background", 0);
        shared.showClassName("custom-dialog-credits", 0);
        shared.hideLoading();
    }

    async showApproveCreditsDialog(){
        this.actionType = Constants.ACTION_APPROVE_TO_DEPOSIT_CREDITS;
        shared.showLoading();

        if(!this.creditsContract){
            this.creditsContract = await utils.getContract(Constants.CREDITS_CONTRACT_ADDRESS);
        }

        document.getElementsByClassName("custom-title-warning")[3].innerHTML = "Approve Credits to Deposit";
        document.getElementsByClassName("custom-text-warning")[6].innerHTML = "Set the amount and click on the<br>'Approve' button to approve the <br>HashBox Mail credits to deposit.";
        document.getElementsByClassName("custom-btn-warning")[6].innerHTML = "APPROVE";
        document.getElementsByClassName("custom-btn-warning")[5].innerHTML = "CLOSE";
        document.getElementsByClassName("total-label")[0].innerHTML = "Available:&nbsp;";
        let available = await this.creditsContract.methods.balanceOf(this.address).call();
        available = parseInt(this.web3.utils.fromWei(available.toString(), "ether"));

        document.getElementsByClassName('credits-amount')[0].onchange = () => {};
        document.getElementsByClassName("total")[1].innerHTML = utils.getEllipsis(available.toString(), Constants.MAX_CHARACTERS_DIALOGS) + "&nbsp;" + Constants.CREDITS_SYMBOL + "s";
        shared.showClassName("dialog-background", 0);
        shared.showClassName("custom-dialog-credits", 0);
        shared.hideLoading();
    }

    async showSellCreditsDialog(){
        shared.showLoading();

        if(!this.creditsContract){
            this.creditsContract = await utils.getContract(Constants.LAUNCHPAD_CONTRACT_ADDRESS);
        }

        let allowance = await this.creditsContract.methods.allowance(this.address, Constants.LAUNCHPAD_CONTRACT_ADDRESS).call();
        allowance = this.web3.utils.fromWei(allowance.toString(), "ether");
        let available = parseInt(allowance);
        if((await utils.getBigNumber(this.web3.utils.toWei(allowance.toString(), "ether"))).gt(0)){
            this.actionType = Constants.ACTION_SELL_CREDITS;
            document.getElementsByClassName("custom-title-warning")[3].innerHTML = "Sell Credits";
            document.getElementsByClassName("custom-text-warning")[6].innerHTML = "Set the amount and click on the<br>'Sell' button to sell <br>HashBox Mail credits.";
            document.getElementsByClassName("custom-btn-warning")[6].innerHTML = "SELL";
            document.getElementsByClassName("total-label")[0].innerHTML = "Available:&nbsp;";
        }
        else{
            this.actionType = Constants.ACTION_APPROVE_TO_DEPOSIT_CREDITS;
            this.actionNext = Constants.ACTION_SELL_CREDITS;
            document.getElementsByClassName("custom-title-warning")[3].innerHTML = "Approve Credits to Sell";
            document.getElementsByClassName("custom-text-warning")[6].innerHTML = "Set the amount and click on the<br>'Approve' button to approve the <br>HashBox Mail credits to sell.";
            document.getElementsByClassName("custom-btn-warning")[6].innerHTML = "APPROVE";
            document.getElementsByClassName("total-label")[0].innerHTML = "Available:&nbsp;";
            available = await this.creditsContract.methods.balanceOf(this.address).call();
            available = parseInt(this.web3.utils.fromWei(available.toString(), "ether"));
        }

        document.getElementsByClassName('credits-amount')[0].onchange = () => {};
        document.getElementsByClassName("total")[1].innerHTML = utils.getEllipsis(available.toString(), Constants.MAX_CHARACTERS_DIALOGS) + "&nbsp;" + Constants.CREDITS_SYMBOL + "s";
        document.getElementsByClassName("custom-btn-warning")[5].innerHTML = "CLOSE";
        shared.showClassName("dialog-background", 0);
        shared.showClassName("custom-dialog-credits", 0);
        shared.hideLoading();
    }

    async showWithdrawEtherDialog(){
        this.actionType = Constants.ACTION_WITHDRAW_ETHER;
        shared.showLoading();

        if(!this.launchpadContract){
            this.launchpadContract = await utils.getContract(Constants.LAUNCHPAD_CONTRACT_ADDRESS);
        }

        let totalDeposits = await this.launchpadContract.methods.getTotalDeposits(this.address).call();
        totalDeposits = this.web3.utils.fromWei(totalDeposits.toString(), "ether");
        const total = parseFloat(totalDeposits) * parseFloat(index.price);
        let available = await this.web3.eth.getBalance(Constants.LAUNCHPAD_CONTRACT_ADDRESS);
        available = this.web3.utils.fromWei(available.toString(), "ether");
        const value = parseFloat(available) < total ? available : total;
        document.getElementsByClassName("custom-title-warning")[3].innerHTML = "Withdraw " + Constants.DEFAULT_TOKEN_SYMBOL;
        document.getElementsByClassName("custom-text-warning")[6].innerHTML = "Set the amount and<br>click on the 'Withdraw'<br>button to withdraw " + Constants.DEFAULT_TOKEN_SYMBOL + ".";
        document.getElementsByClassName("custom-btn-warning")[6].innerHTML = "WITHDRAW";
        document.getElementsByClassName("custom-btn-warning")[5].innerHTML = "CLOSE";
        document.getElementsByClassName("total-label")[0].innerHTML = "Available:&nbsp;";
        document.getElementsByClassName("total")[1].innerHTML = utils.getEllipsis(value.toString(), Constants.MAX_CHARACTERS_DIALOGS) + "&nbsp;" + Constants.DEFAULT_TOKEN_SYMBOL + "s";

        document.getElementsByClassName('credits-amount')[0].onchange = () => {};
        shared.showClassName("dialog-background", 0);
        shared.showClassName("custom-dialog-credits", 0);
        shared.hideLoading();
    }

    async showWithdrawTokenDialog(){
        this.actionType = Constants.ACTION_WITHDRAW_TOKEN;
        shared.showLoading();

        if(!this.launchpadContract){
            this.launchpadContract = await utils.getContract(Constants.LAUNCHPAD_CONTRACT_ADDRESS);
        }

        let totalDeposits = await this.launchpadContract.methods.getTotalDeposits(this.address).call();
        totalDeposits = this.web3.utils.fromWei(totalDeposits.toString(), "ether");
        document.getElementsByClassName("custom-title-warning")[3].innerHTML = "Withdraw " + Constants.CREDITS_SYMBOL;
        document.getElementsByClassName("custom-text-warning")[6].innerHTML = "Set the amount and<br>click on the 'Withdraw'<br>button to withdraw " + Constants.CREDITS_SYMBOL + ".";
        document.getElementsByClassName("custom-btn-warning")[6].innerHTML = "WITHDRAW";
        document.getElementsByClassName("custom-btn-warning")[5].innerHTML = "CLOSE";
        document.getElementsByClassName("total-label")[0].innerHTML = "Available:&nbsp;";
        document.getElementsByClassName("total")[1].innerHTML = utils.getEllipsis(totalDeposits.toString(), Constants.MAX_CHARACTERS_DIALOGS) + "&nbsp;" + Constants.CREDITS_SYMBOL + "s";

        document.getElementsByClassName('credits-amount')[0].onchange = () => {};
        shared.showClassName("dialog-background", 0);
        shared.showClassName("custom-dialog-credits", 0);
        shared.hideLoading();
    }

    async showCreateFeedDialog(){
        this.actionType = Constants.ACTION_CREATE_FEED;
        shared.showLoading();

        if(!this.mailContract){
            this.mailContract = await utils.getContract(Constants.MAIL_CONTRACT_ADDRESS);
        }

        document.getElementsByClassName("custom-title-warning")[4].innerHTML = "Create Feed";
        document.getElementsByClassName("custom-text-warning")[7].innerHTML = "Set the name, the payment type,<br>the subscription period, the total of users,<br> the price and click on the 'Create' button.";
        document.getElementsByClassName("custom-btn-warning")[8].innerHTML = "CREATE";
        document.getElementsByClassName("custom-btn-warning")[7].innerHTML = "CLOSE";
        document.getElementsByClassName("feed-price")[0].placeholder = "Price in " + Constants.DEFAULT_TOKEN_SYMBOL;
        shared.showClassName("dialog-background", 0);
        shared.showClassName("custom-dialog-feed", 0);
        shared.hideLoading();
    }

    async showApproveTokensDialog(available, symbol, feedExtensionAddress, unit){
        this.actionType = Constants.ACTION_APPROVE_TOKENS;
        shared.showLoading();

        available = this.web3.utils.fromWei(available.toString(), unit);
        const extensionAddress = utils.getEllipsis(feedExtensionAddress, Constants.ADDRESS_MAX_LENGTH, feedExtensionAddress.substring(feedExtensionAddress.length-3));
        document.getElementsByClassName("custom-title-warning")[3].innerHTML = "Approve Tokens";
        document.getElementsByClassName("custom-text-warning")[6].innerHTML = "Set the amount and click on the<br>'Approve' button to approve tokens<br>to the contract "+extensionAddress+".";
        document.getElementsByClassName("custom-btn-warning")[5].innerHTML = "CLOSE";
        document.getElementsByClassName("custom-btn-warning")[6].innerHTML = "APPROVE";
        document.getElementsByClassName("total-label")[0].innerHTML = "Available:&nbsp;";
        document.getElementsByClassName("total")[1].innerHTML = utils.getEllipsis(available.toString(), Constants.MAX_CHARACTERS_DIALOGS) + "&nbsp;" + symbol + "s";
        document.getElementsByClassName('credits-amount')[0].onchange = () => {};
        shared.showClassName("dialog-background", 0);
        shared.showClassName("custom-dialog-credits", 0);
        shared.hideLoading();
    }

    showRatingDialog(){
        this.actionType = Constants.ACTION_SET_RATING;
        shared.showLoading();

        document.getElementsByClassName("custom-title-warning")[5].innerHTML = "Set Rating";
        document.getElementsByClassName("custom-text-warning")[8].innerHTML = "Choose the rating<br>(from rating 1 to rating 10) and<br>click on the 'Save' button to save.";
        document.getElementsByClassName("custom-btn-warning")[9].innerHTML = "CLOSE";
        document.getElementsByClassName("custom-btn-warning")[10].innerHTML = "SAVE";
        shared.showClassName("dialog-background", 0);
        shared.showClassName("custom-dialog-rating", 0);
        shared.hideLoading();
    }

    showAddContactDialog(){
        index.actionType = Constants.ACTION_ADD_CONTACT;
        document.getElementsByClassName("custom-title-warning")[6].innerHTML = "Add Contact";
        document.getElementsByClassName("custom-text-warning")[9].innerHTML = "Set the network, the address, the nickname<br> and click on the 'Add' button to save.";
        document.getElementsByClassName("custom-btn-warning")[11].innerHTML = "CLOSE";
        document.getElementsByClassName("custom-btn-warning")[12].innerHTML = "ADD";
        shared.showClassName("dialog-background", 0);
        shared.showClassName("custom-dialog-contacts", 0);
    }

    showEditContactDialog(){
        index.actionType = Constants.ACTION_EDIT_CONTACT;
        document.getElementsByClassName("custom-title-warning")[6].innerHTML = "Edit Contact";
        document.getElementsByClassName("custom-text-warning")[9].innerHTML = "Set the network, the address, the nickname<br> and click on the 'Edit' button to save.";
        document.getElementsByClassName("custom-btn-warning")[11].innerHTML = "CLOSE";
        document.getElementsByClassName("custom-btn-warning")[12].innerHTML = "EDIT";
        shared.showClassName("dialog-background", 0);
        shared.showClassName("custom-dialog-contacts", 0);
    }

    showSendMoneyDialog(){
        document.getElementsByClassName("custom-title-warning")[7].innerHTML = "Send Token";
        document.getElementsByClassName("custom-text-warning")[10].innerHTML = "Set the the address or nickname,<br>the token, the amount and click on<br> the 'Send' button to send token.";
        document.getElementsByClassName("custom-btn-warning")[13].innerHTML = "CLOSE";
        document.getElementsByClassName("custom-btn-warning")[14].innerHTML = "SEND";
        shared.showClassName("dialog-background", 0);
        shared.showClassName("custom-dialog-send-money", 0);
    }

    showNowYouCanSendMailDialog(){
        document.getElementsByClassName("custom-title-warning")[2].innerHTML = "Transaction Confirmed";
        document.getElementsByClassName("custom-text-warning")[4].innerHTML = "The transaction has been confirmed and<br>credits have been added to your account.<br>Now you can use your credits.";
        document.getElementsByClassName("custom-btn-warning")[3].innerHTML = "OK";
        shared.hideClassName("custom-text-warning", 5);
        shared.showClassName("custom-btn-warning", 3);
        shared.hideClassName("custom-btn-warning", 4);
        shared.showClassName("dialog-background", 0);
        shared.showClassName("custom-dialog-warning-small", 0);
        shared.hideLoading();
    }

    showNowYouCanUseYourMailDialog(){
        document.getElementsByClassName("custom-title-warning")[2].innerHTML = "Transaction Confirmed";
        document.getElementsByClassName("custom-text-warning")[4].innerHTML = "The transaction has been confirmed and<br>your account has been created.<br>Now you can use your mail.";
        document.getElementsByClassName("custom-btn-warning")[3].innerHTML = "OK";
        shared.hideClassName("custom-text-warning", 5);
        shared.showClassName("custom-btn-warning", 3);
        shared.hideClassName("custom-btn-warning", 4);
        shared.showClassName("dialog-background", 0);
        shared.showClassName("custom-dialog-warning-small", 0);
        shared.hideLoading();
    }

    setTokenType(){
        document.getElementsByClassName("withdraw-token-type")[0].innerHTML = "Withdraw&nbsp;" + Constants.DEFAULT_TOKEN_SYMBOL;
    }

    initFile(){
        document.getElementById("attach-file").value = null;
        $("#attach-file").change(function() {
            let filename = this.files[0].name;
            filename = index.getFileName(filename);
            document.getElementsByClassName("filename")[0].innerHTML = filename.fileName + "." + filename.extension;
            index.file = null;
            index.fileName = "";
            index.fileType = "";
        });

        const pk = document.getElementById("attach-pk").files[0];
        if(pk){
            index.setPKName(pk.name);
        }
        $("#attach-pk").change(function() {
            index.setPKName(this.files[0].name);
        });
    }

    initFeedSettings(){
        document.getElementsByClassName("withdraw-eth-feed-label")[0].innerHTML = "Withdraw&nbsp;" + Constants.DEFAULT_TOKEN_SYMBOL;
        document.getElementsByClassName("feed-price")[0].placeholder = "Price in " + Constants.DEFAULT_TOKEN_SYMBOL;
        document.getElementById("payment-with-token").checked = false;
        document.getElementsByClassName("feed-extension-address")[0].disabled = true;
        document.getElementById("block-address").checked = false;
        document.getElementById("only-my-feeds").checked = false;
        document.getElementById("only-my-feeds").addEventListener('change', async(event) => {
            this.onlyMyFeeds = event.currentTarget.checked;
            this.pageFeeds = 0;
            this.load(true, true, false, Constants.OPTION_FEEDS).catch(e => utils.showAlert(e));
        });
    }

    async initAccountSettings(){
        if(!this.address){
            this.showAddressError();
            return;
        }

        if(!this.mailContract){
            this.mailContract = await utils.getContract(Constants.MAIL_CONTRACT_ADDRESS);
        }

        const mailBoxInfo = await this.mailContract.methods.getMailBoxInfo(this.address).call();
        const fee = mailBoxInfo[2];
        const isAlwaysPaid = mailBoxInfo[3];
        const extensionAddress = await this.mailContract.methods.getExtensionInfo(this.address).call();
        const isPaymentWithToken = extensionAddress !== Constants.ZERO_ADDRESS;

        let unit = "ether";
        let symbol = Constants.DEFAULT_TOKEN_SYMBOL;
        if(isPaymentWithToken) {
            const extensionContract = await utils.getContract(extensionAddress);
            const decimals = await extensionContract.methods.getTokenDecimals().call();
            symbol = await extensionContract.methods.getTokenSymbol().call();
            unit = utils.findUnit(decimals, this.web3);
        }

        document.getElementsByClassName("fee")[1].placeholder = "Value in " + symbol;
        document.getElementsByClassName("fee")[1].value = this.web3.utils.fromWei(fee, unit);
        document.getElementById("always-paid").checked = isAlwaysPaid;
        document.getElementById("free-mails").checked = false;
        document.getElementsByClassName("fee-token")[0].innerHTML = symbol;
    }

    initMailsSettings(){
        this.useNickname = utils.getCookie("use-nickname") === "true";
        document.getElementById("use-nickname").checked = this.useNickname;
        document.getElementById("use-nickname").addEventListener('change', async(event) => {
            this.useNickname = event.currentTarget.checked;
            document.getElementById("use-nickname").checked = this.useNickname;
            utils.setCookie("use-nickname",this.useNickname.toString());
            this.onRefreshClicked();
        });
    }

    initGeneralSettings(){
        const rpcServer = utils.getCookie("rpc-server");
        if(rpcServer && rpcServer !== "null" && rpcServer !== "undefined"){
            document.getElementsByClassName("rpc-server")[0].value = rpcServer;
            Constants.RPC_PROVIDER = rpcServer;
            this.web3 = new Web3(rpcServer);
            utils.web3 = new Web3(rpcServer);
        }
        else{
            document.getElementsByClassName("rpc-server")[0].value = Constants.DEFAULT_RPC_PROVIDER;
            utils.setCookie("rpc-server", Constants.DEFAULT_RPC_PROVIDER);
        }

        const ipfsServer = utils.getCookie("ipfs-server");
        if(ipfsServer && ipfsServer !== "null" && ipfsServer !== "undefined"){
            document.getElementsByClassName("ipfs-server")[0].value = ipfsServer;
            Constants.IPFS_SERVER_URL = ipfsServer;
        }
        else{
            document.getElementsByClassName("ipfs-server")[0].value = Constants.DEFAULT_IPFS_SERVER_URL;
            utils.setCookie("ipfs-server", Constants.DEFAULT_IPFS_SERVER_URL);
        }

        const useLocalhost = utils.getCookie("use-localhost");
        Constants.IS_LOCALHOST = useLocalhost === "true";
        document.getElementById("use-localhost").checked = Constants.IS_LOCALHOST;
        utils.setCookie("use-localhost", Constants.IS_LOCALHOST.toString());
        document.getElementById("use-localhost").addEventListener('change', async(event) => {
            Constants.IS_LOCALHOST = event.currentTarget.checked;
            document.getElementById("use-localhost").checked = Constants.IS_LOCALHOST;
            utils.setCookie("use-localhost", Constants.IS_LOCALHOST.toString());
        });
    }

    initSendMoney(){
        document.getElementById("send-money-type").options[0].value = Constants.TOKEN_CONTRACT_0_ADDRESS;
        document.getElementById("send-money-type").options[1].value = Constants.TOKEN_CONTRACT_1_ADDRESS;
        document.getElementById("send-money-type").options[2].value = Constants.TOKEN_CONTRACT_2_ADDRESS;
        document.getElementById("send-money-type").options[3].value = Constants.TOKEN_CONTRACT_3_ADDRESS;
        document.getElementById("send-money-type").options[4].value = Constants.TOKEN_CONTRACT_4_ADDRESS;
        document.getElementById("send-money-type").options[0].innerHTML = Constants.DEFAULT_TOKEN_NAME + " (" + Constants.DEFAULT_TOKEN_SYMBOL + ")";
    }

    initQuill() {
        index.writeMessage = new Quill('#editor', {
            theme: 'snow',
            readOnly: false,
            modules: {
                magicUrl: true,
            },
        });
        index.readMessage = new Quill('#message', {
            theme: 'snow',
            readOnly: true,
        });
        Quill.register('modules/magicUrl', MagicUrl);
    }

    async decryptFile(){
        return new Promise(async function(resolve, reject) {
            try {
                const decryptedKey = await rsa.decrypt(index.encryptedKey, null, index.jwk);
                index.getFile(index.file, "encrypted")
                    .then(encryptedFileSource => {
                        index.downloadLink(encryptedFileSource.link)
                            .then(async encryptedFileBase64 => {
                                const decryptedFileBase64 = await aes.decryptData(encryptedFileBase64, decryptedKey);
                                resolve(decryptedFileBase64);
                            })
                            .catch(e => reject(e));
                    })
                    .catch(e => reject(e));
            } catch (e) {
                reject(e);
            }
        });
    }

    async load(updateIds, showLoading, isWaiting, option){
        const mailInfo = await index.mailContract.methods.getMailInfo(index.address, 0, option).call();
        index.totalMails = parseInt(mailInfo[0]);
        index.totalReceived = parseInt(mailInfo[5]);
        index.totalBurned = parseInt(mailInfo[6]);
        index.totalSent = index.totalMails - index.totalReceived;

        if(updateIds){
            if(option === Constants.OPTION_INBOX){
                index.fromIdReceived = index.totalReceived;
            }
            else if(option === Constants.OPTION_SENT){
                index.fromIdSent = index.totalSent;
            }
            else if(option === Constants.OPTION_ALL_MAIL){
                index.fromIdAllMail = index.totalMails;
            }
            else if(option === Constants.OPTION_TRASH){
                index.fromIdBurned = index.totalBurned;
            }
            else if(option === Constants.OPTION_BLOCKED_USERS){
                index.fromIdBlockedUsers = 0;
            }
            else if(option === Constants.OPTION_FEEDS){
                index.fromIdFeeds = 0;
            }
            else if(option === Constants.OPTION_SUBSCRIPTIONS){
                index.fromIdSubscriptions = 0;
            }
            else if(option === Constants.OPTION_CONTACTS){
                index.fromIdContacts = 0;
            }
            else if(option === Constants.OPTION_SEARCH_MAIL){
                index.fromIdSearchMail = 0;
            }
        }

        index.loadItems(showLoading, isWaiting, option);
    }

    loadItems(showLoading, isWaiting, option){
        if(showLoading || isWaiting){
            shared.showLoading();
        }

        this.gettingAllMails(option)
            .then(async mails => {
                if(mails.option === Constants.OPTION_INBOX){
                    const inbox = mails.inbox;
                    await this.listMails(mails.option);
                    if(inbox){
                        this.disablePageButtons(Constants.OPTION_INBOX, this.pageInbox, this.totalReceived - this.totalBurned);

                        for(let i=0;i<inbox.length;i++){
                            const mail = inbox[i];
                            const mailFrom = mail.from === this.address ? "Me" : mail.from;
                            if(mailFrom.length > Constants.ADDRESS_MAX_LENGTH){
                                const end = mailFrom.substring(mailFrom.length-Constants.FROM_TO_END_LENGTH);
                                $("#inbox-from"+i).text(utils.getEllipsis(mailFrom, Constants.FROM_TO_MAX_LENGTH, end));
                            }
                            else{
                                $("#inbox-from"+i).text(mailFrom);
                            }
                            if(mail.subject.length > Constants.SUBJECT_MAX_LENGTH){
                                $("#inbox-subject"+i).text(utils.getEllipsis(mail.subject, Constants.SUBJECT_MAX_LENGTH));
                            }
                            else{
                                $("#inbox-subject"+i).text(mail.subject);
                            }

                            if(mail.encryptedFile && mail.encryptedFile !== ""){
                                $("#inbox-subject"+i).width("37.5%");
                                $("#inbox-file"+i).width("2.5%");
                            }
                            else{
                                $("#inbox-subject"+i).width("40%");
                                $("#inbox-file"+i).width("0%");
                            }

                            $("#inbox-date"+i).text(mail.date);
                            $("#inbox-time"+i).text(mail.time);
                            if(mail.mixed === 1){
                                $("#inbox-paid"+i).text("MIXED");
                            }
                            else{
                                if(mail.value.length >= Constants.ETH_MAX_LENGTH){
                                    $("#inbox-paid"+i).text(utils.getEllipsis(mail.value, Constants.ETH_MAX_LENGTH, " " + mail.symbol));
                                }
                                else{
                                    $("#inbox-paid"+i).text(mail.value + " " + mail.symbol);
                                }
                            }
                        }

                        if(!this.sendingTx){
                            if(this.loading > 0){
                                if(showLoading && this.loading <= this.fromIdReceived){
                                    this.loading = 0;
                                    shared.hideLoading();
                                }
                            }
                            else if(this.loading === 0 && !isWaiting || isWaiting && inbox.length > 0){
                                if(isWaiting){
                                    this.checkBackupStatus(false);
                                    this.checkValues().catch(e => utils.showAlert(e));
                                    this.disableSignInButton();
                                    this.showNowYouCanUseYourMailDialog();
                                }
                                isWaiting = false;
                                shared.hideLoading();
                            }
                        }
                    }
                }
                else if(mails.option === Constants.OPTION_SENT){
                    const sent = mails.sent;
                    await this.listMails(mails.option);
                    if(sent){
                        this.disablePageButtons(Constants.OPTION_SENT, this.pageSent, this.totalSent);

                        for(let i=0;i<sent.length;i++){
                            const mail = sent[i];
                            const mailTo = mail.to === this.address ? "Me" : mail.to;
                            if(mailTo.length > Constants.ADDRESS_MAX_LENGTH){
                                const end = mailTo.substring(mailTo.length-Constants.FROM_TO_END_LENGTH);
                                $("#sent-to"+i).text(utils.getEllipsis(mailTo, Constants.FROM_TO_MAX_LENGTH, end));
                            }
                            else{
                                $("#sent-to"+i).text(mailTo);
                            }
                            if(mail.subject.length > Constants.SUBJECT_MAX_LENGTH){
                                $("#sent-subject"+i).text(utils.getEllipsis(mail.subject, Constants.SUBJECT_MAX_LENGTH));
                            }
                            else{
                                $("#sent-subject"+i).text(mail.subject);
                            }

                            if(mail.encryptedFile && mail.encryptedFile !== ""){
                                $("#sent-subject"+i).width("37.5%");
                                $("#sent-file"+i).width("2.5%");
                            }
                            else{
                                $("#sent-subject"+i).width("40%");
                                $("#sent-file"+i).width("0%");
                            }

                            $("#sent-date"+i).text(mail.date);
                            $("#sent-time"+i).text(mail.time);
                            if(mail.mixed === 1){
                                $("#sent-paid"+i).text("MIXED");
                            }
                            else{
                                if(mail.value.length >= Constants.ETH_MAX_LENGTH){
                                    $("#sent-paid"+i).text(utils.getEllipsis(mail.value, Constants.ETH_MAX_LENGTH, " " + mail.symbol));
                                }
                                else{
                                    $("#sent-paid"+i).text(mail.value + " " + mail.symbol);
                                }
                            }
                        }

                        if(!this.sendingTx) {
                            if (this.loading > 0) {
                                if (showLoading && this.loading <= this.fromIdSent) {
                                    this.loading = 0;
                                    shared.hideLoading();
                                }
                            } else if (this.loading === 0 && !isWaiting || isWaiting && sent.length > 0) {
                                if(isWaiting){
                                    this.checkBackupStatus(false);
                                    this.checkValues().catch(e => utils.showAlert(e));
                                    this.disableSignInButton();
                                    this.showNowYouCanUseYourMailDialog();
                                }
                                isWaiting = false;
                                shared.hideLoading();
                            }
                        }
                    }
                }
                else if(mails.option === Constants.OPTION_ALL_MAIL){
                    const allMail = mails.allMail;
                    await this.listMails(mails.option);
                    if(allMail){
                        this.disablePageButtons(Constants.OPTION_ALL_MAIL, this.pageAllMail, this.totalMails - this.totalBurned);

                        for(let i=0;i<allMail.length;i++){
                            const mail = allMail[i];
                            const oddOrEven = mail.id % 2 === 0 ? "From Me" : "To Me";
                            const mailFrom = mail.duplicated ? oddOrEven : (mail.from === this.address ? oddOrEven : mail.from);
                            if(mailFrom.length > Constants.ADDRESS_MAX_LENGTH){
                                const end = mailFrom.substring(mailFrom.length-Constants.FROM_TO_END_LENGTH);
                                $("#all-mail-from"+i).text(utils.getEllipsis(mailFrom, Constants.FROM_TO_MAX_LENGTH, end));
                            }
                            else{
                                $("#all-mail-from"+i).text(mailFrom);
                            }
                            if(mail.subject.length > Constants.SUBJECT_MAX_LENGTH){
                                $("#all-mail-subject"+i).text(utils.getEllipsis(mail.subject, Constants.SUBJECT_MAX_LENGTH));
                            }
                            else{
                                $("#all-mail-subject"+i).text(mail.subject);
                            }

                            if(mail.encryptedFile && mail.encryptedFile !== ""){
                                $("#all-mail-subject"+i).width("37.5%");
                                $("#all-mail-file"+i).width("2.5%");
                            }
                            else{
                                $("#all-mail-subject"+i).width("40%");
                                $("#all-mail-file"+i).width("0%");
                            }

                            $("#all-mail-date"+i).text(mail.date);
                            $("#all-mail-time"+i).text(mail.time);
                            if(mail.mixed === 1){
                                $("#all-mail-paid"+i).text("MIXED");
                            }
                            else{
                                if(mail.value.length >= Constants.ETH_MAX_LENGTH){
                                    $("#all-mail-paid"+i).text(utils.getEllipsis(mail.value, Constants.ETH_MAX_LENGTH, " " + mail.symbol));
                                }
                                else{
                                    $("#all-mail-paid"+i).text(mail.value + " " + mail.symbol);
                                }
                            }
                        }

                        if(!this.sendingTx) {
                            if (this.loading > 0) {
                                if (showLoading && this.loading <= this.fromIdAllMail) {
                                    this.loading = 0;
                                    shared.hideLoading();
                                }
                            } else if (this.loading === 0 && !isWaiting || isWaiting && allMail.length > 0) {
                                if(isWaiting){
                                    this.checkBackupStatus(false);
                                    this.checkValues().catch(e => utils.showAlert(e));
                                    this.disableSignInButton();
                                    this.showNowYouCanUseYourMailDialog();
                                }
                                isWaiting = false;
                                shared.hideLoading();
                            }
                        }
                    }
                }
                else if(mails.option === Constants.OPTION_TRASH){
                    const burned = mails.burned;
                    await this.listMails(mails.option);
                    if(burned){
                        this.disablePageButtons(Constants.OPTION_TRASH, this.pageBurned, this.totalBurned);

                        for(let i=0;i<burned.length;i++){
                            const mail = burned[i];
                            const oddOrEven = mail.id % 2 === 0 ? "From Me" : "To Me";
                            const mailFrom = mail.duplicated ? oddOrEven : (mail.from === this.address ? oddOrEven : mail.from);
                            if(mailFrom.length > Constants.ADDRESS_MAX_LENGTH){
                                const end = mailFrom.substring(mailFrom.length-Constants.FROM_TO_END_LENGTH);
                                $("#burned-from"+i).text(utils.getEllipsis(mailFrom, Constants.FROM_TO_MAX_LENGTH, end));
                            }
                            else{
                                $("#burned-from"+i).text(mailFrom);
                            }
                            if(mail.subject.length > Constants.SUBJECT_MAX_LENGTH){
                                $("#burned-subject"+i).text(utils.getEllipsis(mail.subject, Constants.SUBJECT_MAX_LENGTH));
                            }
                            else{
                                $("#burned-subject"+i).text(mail.subject);
                            }

                            if(mail.encryptedFile && mail.encryptedFile !== ""){
                                $("#burned-subject"+i).width("37.5%");
                                $("#burned-file"+i).width("2.5%");
                            }
                            else{
                                $("#burned-subject"+i).width("40%");
                                $("#burned-file"+i).width("0%");
                            }

                            $("#burned-date"+i).text(mail.date);
                            $("#burned-time"+i).text(mail.time);
                            if(mail.mixed === 1){
                                $("#burned-paid"+i).text("MIXED");
                            }
                            else{
                                if(mail.value.length >= Constants.ETH_MAX_LENGTH){
                                    $("#burned-paid"+i).text(utils.getEllipsis(mail.value, Constants.ETH_MAX_LENGTH, " " + mail.symbol));
                                }
                                else{
                                    $("#burned-paid"+i).text(mail.value + " " + mail.symbol);
                                }
                            }
                        }

                        if(!this.sendingTx) {
                            if (this.loading > 0) {
                                if (showLoading && this.loading <= this.fromIdBurned) {
                                    this.loading = 0;
                                    shared.hideLoading();
                                }
                            } else if (this.loading === 0 && !isWaiting || isWaiting && burned.length > 0) {
                                if(isWaiting){
                                    this.checkBackupStatus(false);
                                    this.checkValues().catch(e => utils.showAlert(e));
                                    this.disableSignInButton();
                                    this.showNowYouCanUseYourMailDialog();
                                }
                                isWaiting = false;
                                shared.hideLoading();
                            }
                        }
                    }
                }
                else if(mails.option === Constants.OPTION_BLOCKED_USERS){
                    const blockedUsers = mails.blockedUsers;
                    await this.listMails(mails.option);
                    if(blockedUsers) {
                        this.disablePageButtons(Constants.OPTION_BLOCKED_USERS, this.pageBlockedUsers, this.totalBlockedUsers - this.totalRemovedBlock);

                        for(let i=0;i<index.blockedUsers.length;i++){
                            $("#blocked-users-address"+i).text(index.blockedUsers[i].address);
                            $("#blocked-users-unblock"+i).click(async function(e) {
                                const address = await index.getAddress(index.blockedUsers[i].address);
                                index.blockUsers([address], [false]).catch(e => utils.showAlert(e));
                                e.stopPropagation();
                            });
                        }

                        if(!this.sendingTx) {
                            if (this.loading > 0) {
                                if (showLoading && this.loading <= this.fromIdBlockedUsers) {
                                    this.loading = 0;
                                    shared.hideLoading();
                                }
                            } else if (this.loading === 0 && !isWaiting || isWaiting && blockedUsers.length > 0) {
                                if(isWaiting){
                                    this.checkBackupStatus(false);
                                    this.checkValues().catch(e => utils.showAlert(e));
                                    this.disableSignInButton();
                                    this.showNowYouCanUseYourMailDialog();
                                }
                                isWaiting = false;
                                shared.hideLoading();
                            }
                        }
                    }
                }
                else if(mails.option === Constants.OPTION_FEEDS){
                    const feeds = mails.feeds;
                    await this.listMails(mails.option);
                    if(feeds) {
                        this.disablePageButtons(Constants.OPTION_FEEDS, this.pageFeeds, this.totalFeeds);

                        const formatter = Intl.NumberFormat('en', {notation: 'compact', maximumSignificantDigits: Constants.MAX_SIGNIFICANT_DIGITS});
                        for(let i=0;i<index.feeds.length;i++){
                            const feed = index.feeds[i];
                            const isExpired = feed.isExpired;
                            let name = isExpired ? "[EXPIRED] " + feed.name : feed.name;
                            name = name.length > Constants.FEED_NAME_MAX_LENGTH ? utils.getEllipsis(name, Constants.FEED_NAME_MAX_LENGTH) : name;

                            let price = feed.price;
                            if(parseInt(price) > 0){
                                price = formatter.format(parseInt(price)) + " " + feed.symbol;
                            }
                            else if(price.toString().length > Constants.MAX_FEED_PRICE_LENGTH){
                                price = utils.getEllipsis(price.toString(), Constants.MAX_FEED_PRICE_LENGTH) + " " + feed.symbol;
                            }
                            else{
                                price = price + " " + feed.symbol;
                            }

                            let rating = parseInt(feed.rating);
                            rating = rating > 0 ? rating + "/10" : "Not Rated";
                            let address = feed.address;
                            const addressEnd = address.substring(address.length-Constants.FROM_TO_END_LENGTH);
                            address = utils.getEllipsis(address, Constants.ADDRESS_MIN_LENGTH, addressEnd);
                            $("#feeds-name"+i).text(name).css("color", isExpired ? "grey" : "black");
                            $("#feeds-price"+i).text(price).css("color", isExpired ? "grey" : "black");
                            $("#feeds-rating"+i).text(rating).css("color", isExpired ? "grey" : "black");
                            $("#feeds-address-text"+i).text(address);
                            $("#feeds-subscribe"+i).text(feed.isSubscribed ? "Unsubscribe" : "Subscribe").prop('disabled',isExpired);
                            $("#feeds-address"+i).click(async function(e) {
                                await utils.copyToClipboard(index.feeds[i].address);
                                shared.showToast("Address copied successfully!");
                                e.stopPropagation();
                            });
                        }

                        if(!this.sendingTx) {
                            if (this.loading > 0) {
                                if (showLoading && this.loading <= this.fromIdFeeds) {
                                    this.loading = 0;
                                    shared.hideLoading();
                                }
                            } else if (this.loading === 0 && !isWaiting || isWaiting && feeds.length > 0) {
                                if(isWaiting){
                                    this.checkBackupStatus(false);
                                    this.checkValues().catch(e => utils.showAlert(e));
                                    this.disableSignInButton();
                                    this.showNowYouCanUseYourMailDialog();
                                }
                                isWaiting = false;
                                shared.hideLoading();
                            }
                        }
                    }
                }
                else if(mails.option === Constants.OPTION_SUBSCRIPTIONS){
                    const subscriptions = mails.subscriptions;
                    await this.listMails(mails.option);
                    if(subscriptions) {
                        this.disablePageButtons(Constants.OPTION_SUBSCRIPTIONS, this.pageSubscriptions, this.totalSubscriptions);

                        for(let i=0;i<index.subscriptions.length;i++){
                            const subscription = index.subscriptions[i];
                            const isExpired = subscription.isExpired;
                            const isSubscribed = subscription.isSubscribed;
                            let name = isExpired ? "[EXPIRED] " + subscription.name : subscription.name;
                            name = isSubscribed ? name : "[SUBSCRIPTION EXPIRED] " + subscription.name;
                            name = name.length > Constants.FEED_NAME_MAX_LENGTH ? utils.getEllipsis(name, Constants.FEED_NAME_MAX_LENGTH) : name;
                            let owner = subscription.owner;
                            const ownerEnd = owner.substring(owner.length-Constants.FROM_TO_END_LENGTH);
                            owner = owner.length > Constants.ADDRESS_MAX_LENGTH ? utils.getEllipsis(owner, Constants.ADDRESS_MAX_LENGTH, ownerEnd) : owner;
                            let address = subscription.address;
                            const addressEnd = address.substring(address.length-Constants.FROM_TO_END_LENGTH);
                            address = address.length > Constants.ADDRESS_MAX_LENGTH ? utils.getEllipsis(address, Constants.ADDRESS_MAX_LENGTH, addressEnd) : address;
                            $("#subscriptions-name"+i).text(name).css("color", isExpired || !isSubscribed ? "grey" : "black");
                            $("#subscriptions-owner"+i).text(owner).css("color", isExpired || !isSubscribed ? "grey" : "black");
                            $("#subscriptions-rating"+i).click(async function(e) {
                                index.subscriptionAddress = subscription.address;
                                index.showRatingDialog();
                                e.stopPropagation();
                            }).prop('disabled',isExpired || !isSubscribed);
                            $("#subscriptions-subscribe"+i).text(isSubscribed ? "Unsubscribe" : "Subscribe").prop('disabled',isExpired);
                        }

                        if(!this.sendingTx) {
                            if (this.loading > 0) {
                                if (showLoading && this.loading <= this.fromIdSubscriptions) {
                                    this.loading = 0;
                                    shared.hideLoading();
                                }
                            } else if (this.loading === 0 && !isWaiting || isWaiting && subscriptions.length > 0) {
                                if(isWaiting){
                                    this.checkBackupStatus(false);
                                    this.checkValues().catch(e => utils.showAlert(e));
                                    this.disableSignInButton();
                                    this.showNowYouCanUseYourMailDialog();
                                }
                                isWaiting = false;
                                shared.hideLoading();
                            }
                        }
                    }
                }
                else if(mails.option === Constants.OPTION_CONTACTS){
                    const contacts = mails.contacts;
                    await this.listMails(mails.option);
                    if(contacts) {
                        this.disablePageButtons(Constants.OPTION_CONTACTS, this.pageContacts, this.totalContacts);

                        for(let i=0;i<index.contacts.length;i++){
                            const contact = index.contacts[i];
                            const info = contact.info;
                            let network = info.symbol;
                            network = network.length > Constants.NETWORK_MAX_LENGTH ? utils.getEllipsis(network, Constants.NETWORK_MAX_LENGTH) : network;
                            let address = info.address;
                            const addressEnd = address.substring(address.length-Constants.FROM_TO_END_LENGTH);
                            address = address.length > Constants.ADDRESS_CONTACT_MAX_LENGTH ? utils.getEllipsis(address, Constants.ADDRESS_CONTACT_MAX_LENGTH, addressEnd) : address;
                            let nickname = info.nickname;
                            nickname = nickname.length > Constants.NICKNAME_CONTACT_MAX_LENGTH ? utils.getEllipsis(nickname, Constants.NICKNAME_CONTACT_MAX_LENGTH) : nickname;
                            $("#contacts-network"+i).text(network);
                            $("#contacts-address"+i).text(address);
                            $("#contacts-nickname"+i).text(nickname);
                        }

                        if(!this.sendingTx) {
                            if (this.loading > 0) {
                                if (showLoading && this.loading <= this.fromIdContacts) {
                                    this.loading = 0;
                                    shared.hideLoading();
                                }
                            } else if (this.loading === 0 && !isWaiting || isWaiting && contacts.length > 0) {
                                if(isWaiting){
                                    this.checkBackupStatus(false);
                                    this.checkValues().catch(e => utils.showAlert(e));
                                    this.disableSignInButton();
                                    this.showNowYouCanUseYourMailDialog();
                                }
                                isWaiting = false;
                                shared.hideLoading();
                            }
                        }
                    }
                }
                else if(mails.option === Constants.OPTION_SEARCH_MAIL){
                    const searchMail = mails.searchMail;
                    await this.listMails(mails.option);
                    if(searchMail){
                        this.disablePageButtons(Constants.OPTION_SEARCH_MAIL, this.pageSearchMail, this.totalSearchMails);

                        for(let i=0;i<searchMail.length;i++){
                            const mail = searchMail[i];
                            const oddOrEven = mail.id % 2 === 0 ? "From Me" : "To Me";
                            const mailFrom = mail.duplicated ? oddOrEven : (mail.from === this.address ? oddOrEven : mail.from);
                            if(mailFrom.length > Constants.ADDRESS_MAX_LENGTH){
                                const end = mailFrom.substring(mailFrom.length-Constants.FROM_TO_END_LENGTH);
                                $("#search-mail-from"+i).text(utils.getEllipsis(mailFrom, Constants.FROM_TO_MAX_LENGTH, end));
                            }
                            else{
                                $("#search-mail-from"+i).text(mailFrom);
                            }
                            if(mail.subject.length > Constants.SUBJECT_MAX_LENGTH){
                                $("#search-mail-subject"+i).text(utils.getEllipsis(mail.subject, Constants.SUBJECT_MAX_LENGTH));
                            }
                            else{
                                $("#search-mail-subject"+i).text(mail.subject);
                            }

                            if(mail.encryptedFile && mail.encryptedFile !== ""){
                                $("#search-mail-subject"+i).width("37.5%");
                                $("#search-mail-file"+i).width("2.5%");
                            }
                            else{
                                $("#search-mail-subject"+i).width("40%");
                                $("#search-mail-file"+i).width("0%");
                            }

                            $("#search-mail-date"+i).text(mail.date);
                            $("#search-mail-time"+i).text(mail.time);
                            if(mail.mixed === 1){
                                $("#search-mail-paid"+i).text("MIXED");
                            }
                            else{
                                if(mail.value.length >= Constants.ETH_MAX_LENGTH){
                                    $("#search-mail-paid"+i).text(utils.getEllipsis(mail.value, Constants.ETH_MAX_LENGTH, " " + mail.symbol));
                                }
                                else{
                                    $("#search-mail-paid"+i).text(mail.value + " " + mail.symbol);
                                }
                            }
                        }

                        if(!this.sendingTx) {
                            if (this.loading > 0) {
                                if (showLoading && this.loading <= this.fromIdSearchMail) {
                                    this.loading = 0;
                                    shared.hideLoading();
                                }
                            } else if (this.loading === 0 && !isWaiting || isWaiting && searchMail.length > 0) {
                                if(isWaiting){
                                    this.checkBackupStatus(false);
                                    this.checkValues().catch(e => utils.showAlert(e));
                                    this.disableSignInButton();
                                    this.showNowYouCanUseYourMailDialog();
                                }
                                isWaiting = false;
                                shared.hideLoading();
                            }
                        }
                    }
                }

                clearTimeout(this.itemsTimeoutId);
                this.itemsTimeoutId = setTimeout(async () => {
                    console.log("<<<loaded>>> ",(new Date()));
                    let page = -1;
                    if(this.option === Constants.OPTION_INBOX){
                        page = this.pageInbox;
                    }
                    else if(this.option === Constants.OPTION_SENT){
                        page = this.pageSent;
                    }
                    else if(this.option === Constants.OPTION_ALL_MAIL){
                        page = this.pageAllMail;
                    }
                    else if(this.option === Constants.OPTION_TRASH){
                        page = this.pageBurned;
                    }
                    else if(this.option === Constants.OPTION_BLOCKED_USERS){
                        page = this.pageBlockedUsers;
                    }
                    else if(this.option === Constants.OPTION_FEEDS){
                        page = this.pageFeeds;
                    }
                    else if(this.option === Constants.OPTION_SUBSCRIPTIONS){
                        page = this.pageSubscriptions;
                    }
                    else if(this.option === Constants.OPTION_CONTACTS){
                        page = this.pageContacts;
                    }
                    else if(this.option === Constants.OPTION_SEARCH_MAIL){
                        page = this.pageSearchMail;
                    }
                    this.controller = null;
                    await this.load(page === 0, false, isWaiting, this.option);
                }, Constants.CHECK_NEW_MAILS_TIMEOUT);
            })
            .catch(e => {
                if(!this.controller.signal.aborted){
                    utils.showAlert(e);
                }
                this.controller = null;
            });
    }

    async gettingAllMails(option){
        return new Promise(async function(resolve, reject) {
            if(!index.controller){
                index.controller = new AbortController();
                const abortListener = () => {
                    index.controller.signal.removeEventListener('abort', abortListener);
                    reject("abort");
                }
                index.controller.signal.addEventListener("abort", abortListener);
            }
            try {
                let resultSearch;
                if(option <= Constants.OPTION_TRASH){
                    if(index.mailContract){
                        const mailInfo = await index.mailContract.methods.getMailInfo(index.address, 0, option).call();
                        index.totalMails = parseInt(mailInfo[0]);
                        index.totalReceived = parseInt(mailInfo[5]);
                        index.totalBurned = parseInt(mailInfo[6]);
                        index.totalSent = index.totalMails - index.totalReceived;
                    }
                }
                else if(option === Constants.OPTION_BLOCKED_USERS){
                    if(index.mailContract){
                        const mailBoxInfo = await index.mailContract.methods.getMailBoxInfo(index.address).call();
                        index.totalBlockedUsers = mailBoxInfo[5];
                        index.totalRemovedBlock = mailBoxInfo[6];
                    }
                }
                else if(option === Constants.OPTION_FEEDS){
                    if(index.mailFeedsContract){
                        const owner = index.onlyMyFeeds ? index.address : Constants.ZERO_ADDRESS;
                        let mailFeedTotals = await index.mailFeedsContract.methods.getTotals(Constants.ZERO_ADDRESS, 0, 0).call();
                        index.totalCreatedFeeds = mailFeedTotals[0];
                        mailFeedTotals = await index.mailFeedsContract.methods.getTotals(owner, Constants.FEED_MIN_RATING, Constants.USE_DYNAMIC_LENGTH ? mailFeedTotals[0] : Constants.DEFAULT_LENGTH).call();
                        const mailFeedInfo = await index.mailFeedsContract.methods.getInfo(Constants.ZERO_ADDRESS, owner, 0).call();
                        index.totalFeeds = index.onlyMyFeeds ? mailFeedInfo[1] : mailFeedTotals[2];
                    }
                }
                else if(option === Constants.OPTION_SUBSCRIPTIONS){
                    if(index.mailContract){
                        const mailBoxInfo = await index.mailContract.methods.getMailInfo(index.address, 0, 0).call();
                        index.totalSubscriptions = mailBoxInfo[7];
                        index.totalUnsubscriptions = mailBoxInfo[8];
                    }
                }
                else if(option === Constants.OPTION_CONTACTS){
                    if(index.contactsContract){
                        const info = await index.contactsContract.methods.getInfo(index.address, 0).call();
                        index.totalContacts = info[1] - info[2];
                    }
                }
                else if(option === Constants.OPTION_SEARCH_MAIL){
                    if(index.mailContract && index.addressToSearch){
                        resultSearch = await index.getSearchMails();
                        index.totalSearchMails = resultSearch.total;
                    }
                }

                document.getElementsByClassName("total")[0].innerHTML =
                    option === Constants.OPTION_INBOX ? (index.totalReceived - index.totalBurned).toString() :
                        (option === Constants.OPTION_SENT ? index.totalSent.toString() :
                        (option === Constants.OPTION_ALL_MAIL ? (index.totalMails - index.totalBurned).toString() :
                        (option === Constants.OPTION_TRASH ? index.totalBurned.toString() :
                        (option === Constants.OPTION_BLOCKED_USERS ? (index.totalBlockedUsers - index.totalRemovedBlock).toString() :
                        (option === Constants.OPTION_FEEDS ? (index.totalFeeds).toString() :
                        (option === Constants.OPTION_SUBSCRIPTIONS ? (index.totalSubscriptions - index.totalUnsubscriptions).toString() :
                        (option === Constants.OPTION_CONTACTS ? (index.totalContacts).toString() :
                        (option === Constants.OPTION_SEARCH_MAIL ? (index.totalSearchMails).toString() : 0))))))));

                let mails;
                if(option === Constants.OPTION_INBOX){
                    if(index.totalReceived > 0){
                        mails = await index.mailContract.methods.getMails(index.address, index.fromIdReceived, Constants.ITEMS_OFFSET, option).call();
                        await index.getNewMails(option, mails, resolve, reject);
                    }
                    else{
                        index.inbox = [];
                        resolve({option: option, inbox: []});
                    }
                }
                else if(option === Constants.OPTION_SENT){
                    if(index.totalSent > 0){
                        mails = await index.mailContract.methods.getMails(index.address, index.fromIdSent, Constants.ITEMS_OFFSET, option).call();
                        await index.getNewMails(option, mails, resolve, reject);
                    }
                    else{
                        index.sent = [];
                        resolve({option: option, sent: []});
                    }
                }
                else if(option === Constants.OPTION_ALL_MAIL){
                    if(index.totalMails > 0){
                        mails = await index.mailContract.methods.getMails(index.address, index.fromIdAllMail, Constants.ITEMS_OFFSET, option).call();
                        await index.getNewMails(option, mails, resolve, reject);
                    }
                    else{
                        index.allMail = [];
                        resolve({option: option, allMail: []});
                    }
                }
                else if(option === Constants.OPTION_TRASH){
                    if(index.totalBurned > 0){
                        mails = await index.mailContract.methods.getMails(index.address, index.fromIdBurned, Constants.ITEMS_OFFSET, option).call();
                        await index.getNewMails(option, mails, resolve, reject);
                    }
                    else{
                        index.burned = [];
                        resolve({option: option, burned: []});
                    }
                }
                else if(option === Constants.OPTION_BLOCKED_USERS){
                    if(index.totalBlockedUsers > 0){
                        const items = await index.mailContract.methods.getAddresses(index.address, index.fromIdBlockedUsers, Constants.ITEMS_OFFSET, Constants.OPTION_BLOCKED_USERS).call();
                        index.getNewItems(option, items, resolve).catch(e => utils.showAlert(e));
                    }
                    else{
                        index.blockedUsers = [];
                        resolve({option: option, blockedUsers: []});
                    }
                }
                else if(option === Constants.OPTION_FEEDS){
                    if(index.totalFeeds > 0){
                        const owner = index.onlyMyFeeds ? index.address : Constants.ZERO_ADDRESS;
                        const addresses = await index.mailFeedsContract.methods.getFeeds(owner, index.fromIdFeeds,
                            Constants.ITEMS_OFFSET, Constants.USE_DYNAMIC_LENGTH ? index.totalCreatedFeeds : Constants.DEFAULT_LENGTH,
                            !index.onlyMyFeeds, index.onlyMyFeeds ? 0 : Constants.FEED_MIN_RATING).call();

                        let items = [];
                        for(let i=0;i<addresses.length;i++){
                            const address = addresses[i];
                            if(address !== Constants.ZERO_ADDRESS){
                                items.push({address: address});
                            }
                        }

                        index.getNewItems(option, items, resolve).catch(e => utils.showAlert(e));
                    }
                    else{
                        index.feeds = [];
                        resolve({option: option, feeds: []});
                    }
                }
                else if(option === Constants.OPTION_SUBSCRIPTIONS){
                    if(index.totalSubscriptions > 0){
                        const addresses = await index.mailContract.methods.getAddresses(index.address, index.fromIdSubscriptions, Constants.ITEMS_OFFSET, Constants.OPTION_SUBSCRIPTIONS).call();

                        let items = [];
                        for(let i=0;i<addresses.length;i++){
                            const address = addresses[i];
                            if(address !== Constants.ZERO_ADDRESS){
                                items.push({address: address});
                            }
                        }

                        index.getNewItems(option, items, resolve).catch(e => utils.showAlert(e));
                    }
                    else{
                        index.subscriptions = [];
                        resolve({option: option, subscriptions: []});
                    }
                }
                else if(option === Constants.OPTION_CONTACTS){
                    if(index.totalContacts > 0){
                        const contacts = await index.contactsContract.methods.getContacts(index.address, "", index.fromIdContacts, Constants.ITEMS_OFFSET).call();

                        let items = [];
                        for(let i=0;i<contacts.length;i++){
                            const symbol = contacts[i][1];
                            if(symbol){
                                items.push(contacts[i]);
                            }
                        }

                        index.getNewContacts(option, items, resolve).catch(e => utils.showAlert(e));
                    }
                    else{
                        index.contacts = [];
                        resolve({option: option, contacts: []});
                    }
                }
                else if(option === Constants.OPTION_SEARCH_MAIL){
                    if(index.totalSearchMails > 0 && resultSearch){
                        const mails = resultSearch.mails;
                        await index.getNewMails(option, mails, resolve, reject);
                    }
                    else{
                        index.searchMail = [];
                        resolve({option: option, searchMail: []});
                    }
                }
            } catch (e) {
                reject(e);
            }
        });
    }

    async getNewMails(option, mails, resolve, reject){
        let ids = [];
        let uris = [];
        let blocks = [];
        let dates = [];
        let hours = [];
        let values = [];
        let symbols = [];
        let mixeds = [];

        const mailIds = mails[0];
        const mailUris = mails[1];
        const mailBlocks = mails[2];
        for(let i=0;i<mailIds.length;i++){
            const id = mailIds[i];
            if(id > 0){
                const block = mailBlocks[i];
                const uri = mailUris[i];
                ids.push(id);
                uris.push(uri);
                blocks.push(block);

                const result = await this.getFee(id);
                if(result && result.data && result.data.length > 0){
                    const d = result.data[0];
                    const date = d.date;
                    const hour = d.hour;
                    const value = d.value;
                    const symbol = d.symbol;
                    const isMixed = d.isMixed;

                    dates.push(date);
                    hours.push(hour);
                    values.push(value);
                    symbols.push(symbol);
                    mixeds.push(isMixed);
                }
                else{
                    const feeEventFrom = await utils.getFeeEvent(this.mailContract, {from: this.address}, block);
                    if(feeEventFrom.value !== "0"){
                        await this.addFeeEvent(id, block, feeEventFrom, symbols, dates, hours, values, mixeds);
                    }
                    else{
                        const feeEventTo = await utils.getFeeEvent(this.mailContract, {to: this.address}, block);
                        if(feeEventTo.value !== "0"){
                            await this.addFeeEvent(id, block, feeEventTo, symbols, dates, hours, values, mixeds);
                        }
                        else{
                            symbols.push(Constants.DEFAULT_TOKEN_SYMBOL);
                            values.push('0');
                            const signHash = await utils.getSha256(this.signature);
                            const dateAndTime = await utils.getBlockDate(this.web3, block);
                            dates.push(dateAndTime.date);
                            hours.push(dateAndTime.time);
                            mixeds.push(0);
                            this.sendFee(id, dateAndTime.date, dateAndTime.time, "0", Constants.DEFAULT_TOKEN_SYMBOL, 0, signHash).then().catch();
                        }
                    }
                }
            }
        }
        
        this.waitGettingMails(option, ids, uris, blocks, dates, hours, values, symbols, mixeds)
            .then(result => {
                if(result.option === Constants.OPTION_INBOX){
                    resolve({option: result.option, inbox: result.inbox});
                }
                else if(result.option === Constants.OPTION_SENT){
                    resolve({option: result.option, sent: result.sent});
                }
                else if(result.option === Constants.OPTION_ALL_MAIL){
                    resolve({option: result.option, allMail: result.allMail});
                }
                else if(result.option === Constants.OPTION_TRASH){
                    resolve({option: result.option, burned: result.burned});
                }
                else if(result.option === Constants.OPTION_SEARCH_MAIL){
                    resolve({option: result.option, searchMail: result.searchMail});
                }
            })
            .catch(e => reject(e));
    }

    async addFeeEvent(id, block, feeEvent, symbols, dates, hours, values, mixeds){
        let symbol = Constants.DEFAULT_TOKEN_SYMBOL;
        let unit = "ether";
        let isMixed = false;
        if(feeEvent.contract && feeEvent.contract !== Constants.ZERO_ADDRESS){
            const extensionContract = await utils.getContract(feeEvent.contract);
            const secondaryFees = await extensionContract.methods.getSecondaryFees(0).call();
            const secondaryFeeValue = secondaryFees[3];
            if(parseInt(secondaryFeeValue) > 0){
                isMixed = true;
            }

            symbol = await extensionContract.methods.getTokenSymbol().call();
            symbol = symbol.substring(0, Constants.MAX_CHARACTERS_SYMBOL);
            symbols.push(symbol);
            const decimals = await extensionContract.methods.getTokenDecimals().call();
            unit = utils.findUnit(decimals, this.web3);
        }
        else{
            symbols.push(symbol);
        }

        const signHash = await utils.getSha256(this.signature);
        const dateAndTime = await utils.getBlockDate(this.web3, block);
        dates.push(dateAndTime.date);
        hours.push(dateAndTime.time);
        const value = this.web3.utils.fromWei(feeEvent.value, unit);
        values.push(value);
        mixeds.push(isMixed ? 1 : 0);
        this.sendFee(id, dateAndTime.date, dateAndTime.time, value, symbol, isMixed ? 1 : 0, signHash).then().catch();
    }

    async getNewItems(option, items, resolve){
        let array = [];
        if(option === Constants.OPTION_BLOCKED_USERS){
            for(let i=0;i<items.length;i++){
                if(items[i] !== Constants.ZERO_ADDRESS && !array.some(e => e.address === items[i])){
                    const address = await this.getNickname(items[i]);
                    array.push({address: address, checked: false});
                }
            }

            array = this.getItemChecked(array, this.blockedUsersSelected);
            this.blockedUsers = array;
            resolve({option: option, blockedUsers: this.blockedUsers});
        }
        else if(option === Constants.OPTION_FEEDS){
            if(!this.mailFeedsContract){
                const mailFeedsAddress = await this.mailContract.methods.getMailFeedsAddress().call();
                this.mailFeedsContract = await utils.getContract(mailFeedsAddress);
            }

            for(let i=0;i<items.length;i++){
                const item = items[i];
                if(!array.some(e => e.address === item)){
                    const address = item.address;
                    const feedContract = await utils.getContract(address);
                    const feedInfo = await feedContract.methods.getInfo().call();
                    const expiryTime = feedInfo[1];
                    const isExpired = utils.getNumericDate(new Date(parseInt(expiryTime) * 1000)) < utils.getNumericDate(new Date(Date.now()));
                    const mailFeedInfo = await this.mailFeedsContract.methods.getInfo(address, Constants.ZERO_ADDRESS, 0).call();
                    const mailFeed = mailFeedInfo[0];
                    let sub = await feedContract.methods.getSubscriber(this.address, 0).call();
                    const subscriberId = sub[0];
                    sub = await feedContract.methods.getSubscriber(this.address, subscriberId).call();
                    const subExpiryTime = sub[1][2];
                    const isSubscribed = utils.getNumericDate(new Date(parseInt(subExpiryTime) * 1000)) >= utils.getNumericDate(new Date(Date.now()));
                    const ratingInfo = await feedContract.methods.getRating(Constants.ZERO_ADDRESS).call();
                    const rating = ratingInfo[1];
                    const extensionAddress = await feedContract.methods.getExtensionInfo().call();
                    const isPaymentWithToken = extensionAddress !== Constants.ZERO_ADDRESS;

                    let name = mailFeed[0];
                    let price;
                    let symbol;
                    if(isPaymentWithToken){
                        const extensionContract = await utils.getContract(extensionAddress);
                        price = await extensionContract.methods.getPrice().call();
                        symbol = await extensionContract.methods.getTokenSymbol().call();
                        symbol = symbol.substring(0, Constants.MAX_CHARACTERS_SYMBOL);
                        const decimals = await extensionContract.methods.getTokenDecimals().call();
                        const unit = utils.findUnit(decimals, this.web3);
                        price = this.web3.utils.fromWei(price.toString(), unit);
                    }
                    else{
                        const info = await feedContract.methods.getInfo().call();
                        price = info[2];
                        price = this.web3.utils.fromWei(price.toString(), "ether");
                        symbol = Constants.DEFAULT_TOKEN_SYMBOL;
                    }

                    array.push({name: name, owner: mailFeed[1], rating: rating, address: address, isSubscribed: isSubscribed,
                        price: price, symbol: symbol, isExpired: isExpired});
                }
            }

            this.feeds = array;
            resolve({option: option, feeds: this.feeds});
        }
        else if(option === Constants.OPTION_SUBSCRIPTIONS){
            if(!this.mailFeedsContract){
                const mailFeedsAddress = await this.mailContract.methods.getMailFeedsAddress().call();
                this.mailFeedsContract = await utils.getContract(mailFeedsAddress);
            }

            for(let i=0;i<items.length;i++){
                const item = items[i];
                if(!array.some(e => e.address === item)){
                    const address = item.address;
                    const mailFeedInfo = await this.mailFeedsContract.methods.getInfo(address, Constants.ZERO_ADDRESS, 0).call();
                    const mailFeed = mailFeedInfo[0];
                    const feedContract = await utils.getContract(address);
                    const feedInfo = await feedContract.methods.getInfo().call();
                    const expiryTime = feedInfo[1];
                    const isExpired = utils.getNumericDate(new Date(parseInt(expiryTime) * 1000)) < utils.getNumericDate(new Date(Date.now()));
                    let sub = await feedContract.methods.getSubscriber(this.address, 0).call();
                    const subscriberId = sub[0];
                    if(subscriberId > 0){
                        sub = await feedContract.methods.getSubscriber(this.address, subscriberId).call();
                        const subExpiryTime = sub[1][2];
                        const isSubscribed = utils.getNumericDate(new Date(parseInt(subExpiryTime) * 1000)) >= utils.getNumericDate(new Date(Date.now()));
                        array.push({name: mailFeed[0], description: mailFeed[1], owner: mailFeed[2], address: address,
                            isExpired: isExpired, isSubscribed: isSubscribed});
                    }
                }
            }

            this.subscriptions = array;
            resolve({option: option, subscriptions: this.subscriptions});
        }
    }

    async getNewContacts(option, items, resolve){
        if(option === Constants.OPTION_CONTACTS) {
            let array = [];
            const privateKey = utils.get32BytesPassword(this.signature, this.address);

            for(let i=0;i<items.length;i++){
                const contact = items[i];
                const id = contact[0];
                const symbol = contact[1];
                let address = contact[2];
                address = await aes.decryptData(address, privateKey);
                let nickname = contact[3];
                nickname = await aes.decryptData(nickname, privateKey);
                const info = {
                    symbol: symbol,
                    address: address,
                    nickname: nickname
                }

                if(!array.some(e => e.id === id)){
                    array.push({id: id, info: info, checked: false});
                }
            }

            array = this.getContactChecked(array, this.contactsSelected);
            this.contacts = array;
            resolve({option: option, contacts: this.contacts});
        }
    }

    async waitGettingMails(option, ids, uris, blocks, dates, hours, values, symbols, mixeds){
        return new Promise(async function(resolve, reject) {
            try {
                await index.gettingMails(option, ids, uris, blocks, dates, hours, values, symbols, mixeds, resolve, reject);
            } catch (e) {
                reject(e);
            }
        });
    }

    gettingMails(option, ids, uris, blocks, dates, hours, values, symbols, mixeds, resolve, reject){
        let array = [];
        if(uris.length > 0){
            this.getTexts(uris)
                .then(async data => {
                    if(!this.contactsContract){
                        this.contactsContract = await utils.getContract(Constants.CONTACTS_ADDRESS);
                    }
                    for(let i=0;i<uris.length;i++){
                        for(let j=0;j<data.result.length;j++){
                            if(uris[i] === data.result[j].cid){
                                const id = ids[i];
                                const uri = uris[i];

                                let result = data.result[0];
                                let status = 0;
                                if(data.result[j].text){
                                    result = data.result[j].text;
                                    status = data.result[j].status;
                                }

                                let obj = {};
                                if(result !== "Invalid") {
                                    obj = JSON.parse(result);
                                    if(!index.containsValues(obj)){
                                        index.setInvalidValues(obj);
                                    }
                                }
                                else{
                                    index.setInvalidValues(obj);
                                }

                                let encryptedKey = obj.receiver_key;
                                let encryptedSubject = obj.receiver_subject;
                                let encryptedMsg = obj.receiver_msg;
                                let encryptedFile = obj.receiver_file;
                                let encryptedFileName = obj.receiver_file_name;
                                let encryptedFileType = obj.receiver_file_type;
                                if(obj.sender.toString().toLowerCase() === this.address.toString().toLowerCase()){
                                    encryptedKey = obj.sender_key;
                                    encryptedSubject = obj.sender_subject;
                                    encryptedMsg = obj.sender_msg;
                                    encryptedFile = obj.sender_file;
                                    encryptedFileName = obj.sender_file_name;
                                    encryptedFileType = obj.sender_file_type;
                                }

                                let subject = "Invalid";
                                if(encryptedKey !== "Invalid"){
                                    const decryptedKey = await rsa.decrypt(encryptedKey, null, this.jwk);
                                    subject = await aes.decryptData(encryptedSubject, decryptedKey);
                                }
                                const date = dates[i];
                                const hour = hours[i];
                                const value = values[i];
                                const mixed = mixeds[i];

                                let mail = null;
                                if(option === Constants.OPTION_INBOX || option === Constants.OPTION_TRASH){
                                    let from = obj.sender;
                                    if(this.useNickname){
                                        from = await index.getNickname(obj.sender);
                                    }
                                    mail = {id: id, uri: uri, subject: subject, encryptedMsg: encryptedMsg,
                                        encryptedFile: encryptedFile, encryptedFileName: encryptedFileName,
                                        encryptedFileType: encryptedFileType, encryptedKey: encryptedKey, from: from,
                                        date: date, time: hour, value: value, symbol: symbols[i], mixed: mixed,
                                        status: status, addressFrom: obj.sender, addressTo: obj.receiver};
                                }
                                else if(option === Constants.OPTION_SENT){
                                    let to = obj.receiver;
                                    if(this.useNickname){
                                        to = await index.getNickname(obj.receiver);
                                    }
                                    mail = {id: id, uri: uri, subject: subject, encryptedMsg: encryptedMsg,
                                        encryptedFile: encryptedFile, encryptedFileName: encryptedFileName,
                                        encryptedFileType: encryptedFileType, encryptedKey: encryptedKey, to: to,
                                        date: date, time: hour, value: value, symbol: symbols[i], mixed: mixed,
                                        status: status, addressFrom: obj.sender, addressTo: obj.receiver};
                                }
                                else if(option === Constants.OPTION_ALL_MAIL || option === Constants.OPTION_SEARCH_MAIL){
                                    let duplicated = false;
                                    if(array.some(e => e.uri === uri)){
                                        duplicated = true;
                                    }
                                    let from = obj.sender;
                                    let to = obj.receiver;
                                    if(this.useNickname){
                                        from = await index.getNickname(obj.sender);
                                        to = await index.getNickname(obj.receiver);
                                    }
                                    mail = {id: id, uri: uri, subject: subject, encryptedMsg: encryptedMsg,
                                        encryptedFile: encryptedFile, encryptedFileName: encryptedFileName,
                                        encryptedFileType: encryptedFileType, encryptedKey: encryptedKey, from: from,
                                        to: to, date: date, time: hour, value: value, symbol: symbols[i], mixed: mixed,
                                        status: status, duplicated: duplicated, addressFrom: obj.sender,
                                        addressTo: obj.receiver, block: blocks[i]};
                                }
                                array.push(mail);
                                break;
                            }
                        }
                    }

                    if(option === Constants.OPTION_INBOX){
                        array = this.getChecked(array, this.inboxSelected);
                        this.inbox = array;
                        this.inbox.sort((a,b) => b.id - a.id);
                        resolve({option: option, inbox: this.inbox});
                    }
                    else if(option === Constants.OPTION_SENT) {
                        array = this.getChecked(array, this.sentSelected);
                        this.sent = array;
                        this.sent.sort((a,b) => b.id - a.id);
                        resolve({option: option, sent: this.sent});
                    }
                    else if(option === Constants.OPTION_ALL_MAIL){
                        array = this.getChecked(array, this.allMailSelected);
                        this.allMail = array;
                        this.allMail.sort((a,b) => b.id - a.id);
                        resolve({option: option, allMail: this.allMail});
                    }
                    else if(option === Constants.OPTION_TRASH){
                        this.burned = array;
                        this.burned.sort((a,b) => b.id - a.id);
                        resolve({option: option, burned: this.burned});
                    }
                    else if(option === Constants.OPTION_SEARCH_MAIL){
                        array = this.getChecked(array, this.searchMailSelected);
                        this.searchMail = array;
                        resolve({option: option, searchMail: this.searchMail});
                    }
                })
                .catch(e => reject(e));
        }
        else{
            if(option === Constants.OPTION_INBOX){
                if(this.totalReceived > this.totalBurned){
                    this.load(true, false, false, this.option).catch(e => utils.showAlert(e));
                }
                else{
                    this.inbox = [];
                    resolve({option: option, inbox: []});
                }
            }
            else if(option === Constants.OPTION_ALL_MAIL){
                if(this.totalMails > this.totalBurned){
                    this.load(true, false, false, this.option).catch(e => utils.showAlert(e));
                }
                else{
                    this.allMail = [];
                    resolve({option: option, allMail: []});
                }
            }
        }
    }

    setInvalidValues(obj){
        obj.receiver = "Invalid";
        obj.receiver_key = "Invalid";
        obj.receiver_subject = "Invalid";
        obj.receiver_msg = "Invalid";
        obj.receiver_file = null;
        obj.receiver_file_name = null;
        obj.receiver_file_type = null;
        obj.sender = "Invalid";
        obj.sender_key = "Invalid";
        obj.sender_subject = "Invalid";
        obj.sender_msg = "Invalid";
        obj.sender_file = null;
        obj.sender_file_name = null;
        obj.sender_file_type = null;
    }

    containsValues(obj){
        return obj.receiver &&
        obj.receiver_key &&
        obj.receiver_subject &&
        obj.receiver_msg &&
        obj.sender &&
        obj.sender_key &&
        obj.sender_subject &&
        obj.sender_msg;
    }

    async listMails(option){
        const signHash = await utils.getSha256(this.signature);

        if(option === Constants.OPTION_INBOX){
            const length = this.pageInbox === 0 ? (this.inbox.length > Constants.ITEMS_OFFSET ? Constants.ITEMS_OFFSET : this.inbox.length) : this.inbox.length;

            let htmlStr = "";
            for(let i=0;i<length;i++){
                htmlStr += this.rowInboxList(i);
            }
            document.getElementsByClassName("inbox-list")[0].innerHTML = htmlStr;

            for(let i=0;i<length;i++){
                $("#inbox-list"+i).click(async function(e) {
                    const mail = index.inbox[i];
                    if(mail.encryptedKey === "Invalid"){
                        shared.showToast("Invalid Email");
                        return;
                    }
                    const decryptedKey = await rsa.decrypt(mail.encryptedKey, null, index.jwk);
                    index.indexMail = mail.id;
                    index.msgMail = await aes.decryptData(mail.encryptedMsg, decryptedKey);
                    index.subjectMail = mail.subject;
                    index.dateMail = mail.date + " at " + mail.time;
                    index.fromMail = mail.from;
                    index.toMail = index.address;
                    index.addressFrom = mail.addressFrom;
                    index.addressTo = index.address;
                    index.encryptedKey = mail.encryptedKey;
                    index.file = mail.encryptedFile;
                    index.fileName = mail.encryptedFileName ? await aes.decryptData(mail.encryptedFileName, decryptedKey) : null;
                    index.fileType = mail.encryptedFileType ? await aes.decryptData(mail.encryptedFileType, decryptedKey) : null;
                    shared.showClassName("read-msg-container", 0);
                    index.readMessage.root.innerHTML = index.msgMail;
                    $("#msg-from").text(index.fromMail);
                    $("#msg-to").text(index.toMail);
                    $("#msg-date").text(index.dateMail);
                    $("#msg-value").text(mail.mixed ? "MIXED" : mail.value+" "+mail.symbol);
                    $("#subject").text(mail.subject);
                    $("#message").val(index.msgMail);
                    if(mail.addressFrom === index.address){
                        shared.hideClassName("delete",0);
                    }
                    else{
                        shared.showClassName("delete",0);
                    }

                    index.showHideDownloadButton();

                    if(index.inbox[i].status === 0){
                        index.setStatus(mail.id, mail.uri, 1, signHash, option)
                            .then(result => {
                                if(result.data){
                                    index.inbox[i].status = 1;

                                    if(index.sent){
                                        const id = index.sent.findIndex(e => e.encryptedMsg === mail.encryptedMsg && e.encryptedKey === mail.encryptedKey);
                                        index.sent[id] ? index.sent[id].status = index.allMail[i].status : undefined;
                                    }

                                    if(index.allMail){
                                        for(let id=0;id<index.allMail.length;id++){
                                            const e = index.allMail[id];
                                            if(e.encryptedMsg === mail.encryptedMsg && e.encryptedKey === mail.encryptedKey){
                                                index.allMail[id] ? index.allMail[id].status = index.inbox[i].status : undefined;
                                            }
                                        }
                                    }

                                    this.style.color = mail.status === 1 ? "grey" : "black";
                                    this.style.backgroundColor = mail.status === 1 ? "#eaeafa" : "#e7e7ff";
                                }
                            });
                    }

                    e.stopPropagation();
                });

                $("#inbox-select"+i).click(function(e) {
                    const mail = index.inbox[i];
                    const id = JSON.stringify({id: mail.id, uri: mail.uri, from: mail.addressFrom, to: mail.addressTo});
                    index.inboxSelected[id] = !index.inboxSelected[id] === true;
                    e.stopPropagation();
                });
            }
        }
        else if(option === Constants.OPTION_SENT){
            const length = this.pageSent === 0 ? (this.sent.length > Constants.ITEMS_OFFSET ? Constants.ITEMS_OFFSET : this.sent.length) : this.sent.length;

            let htmlStr = "";
            for(let i=0;i<length;i++){
                htmlStr += this.rowSentList(i);
            }
            document.getElementsByClassName("sent-list")[0].innerHTML = htmlStr;

            for(let i=0;i<length;i++){
                $("#sent-list"+i).click(async function(e) {
                    const mail = index.sent[i];
                    if(mail.encryptedKey === "Invalid"){
                        shared.showToast("Invalid Email");
                        return;
                    }
                    const decryptedKey = await rsa.decrypt(mail.encryptedKey, null, index.jwk);
                    index.indexMail = mail.id;
                    index.msgMail = await aes.decryptData(mail.encryptedMsg, decryptedKey);
                    index.subjectMail = mail.subject;
                    index.dateMail = mail.date + " at " + mail.time;
                    index.fromMail = index.address;
                    index.toMail = mail.to;
                    index.addressFrom = index.address;
                    index.addressTo = mail.addressTo;
                    index.file = mail.encryptedFile;
                    index.fileName = mail.encryptedFileName ? await aes.decryptData(mail.encryptedFileName, decryptedKey) : null;
                    index.fileType = mail.encryptedFileType ? await aes.decryptData(mail.encryptedFileType, decryptedKey) : null;
                    shared.showClassName("read-msg-container", 0);
                    index.readMessage.root.innerHTML = index.msgMail;
                    $("#msg-from").text(index.fromMail);
                    $("#msg-to").text(index.toMail);
                    $("#msg-date").text(index.dateMail);
                    $("#msg-value").text(mail.mixed ? "MIXED" : mail.value+" "+mail.symbol);
                    $("#subject").text(index.subjectMail);
                    $("#message").val(index.msgMail);
                    if(mail.addressFrom === index.address){
                        shared.hideClassName("delete",0);
                    }
                    else{
                        shared.showClassName("delete",0);
                    }

                    index.showHideDownloadButton();

                    if(index.sent[i].status === 0){
                        index.setStatus(mail.id, mail.uri, 1, signHash, option)
                            .then(result => {
                                if(result.data){
                                    index.sent[i].status = 1;

                                    if(index.inbox){
                                        const id = index.inbox.findIndex(e => e.encryptedMsg === mail.encryptedMsg && e.encryptedKey === mail.encryptedKey);
                                        index.inbox[id] ? index.inbox[id].status = index.sent[i].status : undefined;
                                    }

                                    if(index.allMail){
                                        for(let id=0;id<index.allMail.length;id++){
                                            const e = index.allMail[id];
                                            if(e.encryptedMsg === mail.encryptedMsg && e.encryptedKey === mail.encryptedKey){
                                                index.allMail[id] ? index.allMail[id].status = index.sent[i].status : undefined;
                                            }
                                        }
                                    }

                                    this.style.color = mail.status === 1 ? "grey" : "black";
                                    this.style.backgroundColor = mail.status === 1 ? "#eaeafa" : "#e7e7ff";
                                }
                            });
                    }

                    e.stopPropagation();
                });

                $("#sent-select"+i).click(function(e) {
                    const mail = index.sent[i];
                    const id = JSON.stringify({id: mail.id, uri: mail.uri, from: mail.addressFrom, to: mail.addressTo});
                    index.sentSelected[id] = !index.sentSelected[id] === true;
                    e.stopPropagation();
                });
            }
        }
        else if(option === Constants.OPTION_ALL_MAIL){
            const length = this.pageAllMail === 0 ? (this.allMail.length > Constants.ITEMS_OFFSET ? Constants.ITEMS_OFFSET : this.allMail.length) : this.allMail.length;

            let htmlStr = "";
            for(let i=0;i<length;i++){
                htmlStr += this.rowAllMailList(i);
            }
            document.getElementsByClassName("all-mail-list")[0].innerHTML = htmlStr;

            for(let i=0;i<length;i++){
                $("#all-mail-list"+i).click(async function(e) {
                    const mail = index.allMail[i];
                    if(mail.encryptedKey === "Invalid"){
                        shared.showToast("Invalid Email");
                        return;
                    }
                    const decryptedKey = await rsa.decrypt(mail.encryptedKey, null, index.jwk);
                    index.indexMail = mail.id;
                    index.msgMail = await aes.decryptData(mail.encryptedMsg, decryptedKey);
                    index.subjectMail = mail.subject;
                    index.dateMail = mail.date + " at " + mail.time;
                    index.fromMail = mail.from;
                    index.toMail = mail.to;
                    index.addressFrom = mail.addressFrom;
                    index.addressTo = mail.addressTo;
                    index.file = mail.encryptedFile;
                    index.fileName = mail.encryptedFileName ? await aes.decryptData(mail.encryptedFileName, decryptedKey) : null;
                    index.fileType = mail.encryptedFileType ? await aes.decryptData(mail.encryptedFileType, decryptedKey) : null;
                    shared.showClassName("read-msg-container", 0);
                    index.readMessage.root.innerHTML = index.msgMail;
                    $("#msg-from").text(index.fromMail);
                    $("#msg-to").text(index.toMail);
                    $("#msg-date").text(index.dateMail);
                    $("#msg-value").text(mail.mixed ? "MIXED" : mail.value+" "+mail.symbol);
                    $("#subject").text(mail.subject);
                    $("#message").val(index.msgMail);
                    if(mail.addressFrom === index.address){
                        shared.hideClassName("delete",0);
                    }
                    else{
                        shared.showClassName("delete",0);
                    }

                    index.showHideDownloadButton();

                    if(index.allMail[i].status === 0){
                        index.setStatus(mail.id, mail.uri, 1, signHash, option)
                            .then(result => {
                                if(result.data){
                                    index.allMail[i].status = 1;

                                    if(index.inbox){
                                        const id = index.inbox.findIndex(e => e.encryptedMsg === mail.encryptedMsg && e.encryptedKey === mail.encryptedKey);
                                        index.inbox[id] ? index.inbox[id].status = index.allMail[i].status : undefined;
                                    }

                                    if(index.sent){
                                        const id = index.sent.findIndex(e => e.encryptedMsg === mail.encryptedMsg && e.encryptedKey === mail.encryptedKey);
                                        index.sent[id] ? index.sent[id].status = index.allMail[i].status : undefined;
                                    }

                                    for(let id=0;id<index.allMail.length;id++){
                                        const e = index.allMail[id];
                                        if(e.encryptedMsg === mail.encryptedMsg && e.encryptedKey === mail.encryptedKey){
                                            index.allMail[id] ? index.allMail[id].status = index.allMail[i].status : undefined;
                                        }
                                    }

                                    this.style.color = mail.status === 1 ? "grey" : "black";
                                    this.style.backgroundColor = mail.status === 1 ? "#eaeafa" : "#e7e7ff";
                                }
                            });
                    }

                    e.stopPropagation();
                });

                $("#all-mail-select"+i).click(function(e) {
                    const mail = index.allMail[i];
                    const id = JSON.stringify({id: mail.id, uri: mail.uri, from: mail.addressFrom, to: mail.addressTo});
                    index.allMailSelected[id] = !index.allMailSelected[id] === true;
                    e.stopPropagation();
                });
            }
        }
        if(option === Constants.OPTION_TRASH){
            const length = this.pageBurned === 0 ? (this.burned.length > Constants.ITEMS_OFFSET ? Constants.ITEMS_OFFSET : this.burned.length) : this.burned.length;

            let htmlStr = "";
            for(let i=0;i<length;i++){
                htmlStr += this.rowTrashList(i);
            }
            document.getElementsByClassName("burned-list")[0].innerHTML = htmlStr;

            for(let i=0;i<length;i++){
                $("#burned-list"+i).click(async function(e) {
                    const mail = index.burned[i];
                    if(mail.encryptedKey === "Invalid"){
                        shared.showToast("Invalid Email");
                        return;
                    }
                    const decryptedKey = await rsa.decrypt(mail.encryptedKey, null, index.jwk);
                    index.indexMail = mail.id;
                    index.msgMail = await aes.decryptData(mail.encryptedMsg, decryptedKey);
                    index.subjectMail = mail.subject;
                    index.dateMail = mail.date + " at " + mail.time;
                    index.fromMail = mail.from;
                    index.toMail = index.address;
                    index.addressFrom = mail.addressFrom;
                    index.addressTo = index.address;
                    index.encryptedKey = mail.encryptedKey;
                    index.file = mail.encryptedFile;
                    index.fileName = mail.encryptedFileName ? await aes.decryptData(mail.encryptedFileName, decryptedKey) : null;
                    index.fileType = mail.encryptedFileType ? await aes.decryptData(mail.encryptedFileType, decryptedKey) : null;
                    shared.showClassName("read-msg-container", 0);
                    index.readMessage.root.innerHTML = index.msgMail;
                    $("#msg-from").text(index.fromMail);
                    $("#msg-to").text(index.toMail);
                    $("#msg-date").text(index.dateMail);
                    $("#msg-value").text(mail.mixed ? "MIXED" : mail.value+" "+mail.symbol);
                    $("#subject").text(mail.subject);
                    $("#message").val(index.msgMail);
                    if(mail.addressFrom === index.address){
                        shared.hideClassName("delete",0);
                    }
                    else{
                        shared.showClassName("delete",0);
                    }

                    index.showHideDownloadButton();

                    e.stopPropagation();
                });
            }
        }
        else if(option === Constants.OPTION_BLOCKED_USERS){
            const length = this.pageBlockedUsers === 0 ? (this.blockedUsers.length > Constants.ITEMS_OFFSET ? Constants.ITEMS_OFFSET : this.blockedUsers.length) : this.blockedUsers.length;

            let htmlStr = "";
            for(let i=0;i<length;i++){
                htmlStr += this.rowBlockedUsersList(i);
            }
            document.getElementsByClassName("blocked-users-list")[0].innerHTML = htmlStr;

            for(let i=0;i<length;i++){
                $("#blocked-users-list"+i).click(async function(e) {
                    const blockedUser = index.blockedUsers[i];
                    e.stopPropagation();
                });
                $("#blocked-users-select"+i).click(function(e) {
                    const item = index.blockedUsers[i];
                    const id = item.address;
                    index.blockedUsersSelected[id] = !index.blockedUsersSelected[id] === true;
                    e.stopPropagation();
                });
            }
        }
        else if(option === Constants.OPTION_FEEDS){
            const length = this.pageFeeds === 0 ? (this.feeds.length > Constants.ITEMS_OFFSET ? Constants.ITEMS_OFFSET : this.feeds.length) : this.feeds.length;

            let htmlStr = "";
            for(let i=0;i<length;i++){
                htmlStr += this.rowFeedsList(i);
            }
            document.getElementsByClassName("feeds-list")[0].innerHTML = htmlStr;

            for(let i=0;i<length;i++){
                $("#feeds-subscribe"+i).click(async function(e) {
                    const feed = index.feeds[i];
                    if(feed.isSubscribed){
                        index.unsubscribeFeed(feed.address).catch(e => utils.showAlert(e));
                    }
                    else{
                        index.onSubscribeFeedClicked(feed.address).catch(e => utils.showAlert(e));
                    }
                    e.stopPropagation();
                });
            }
        }
        else if(option === Constants.OPTION_SUBSCRIPTIONS){
            const length = this.pageSubscriptions === 0 ? (this.subscriptions.length > Constants.ITEMS_OFFSET ? Constants.ITEMS_OFFSET : this.subscriptions.length) : this.subscriptions.length;

            let htmlStr = "";
            for(let i=0;i<length;i++){
                htmlStr += this.rowSubscriptionsList(i);
            }
            document.getElementsByClassName("subscriptions-list")[0].innerHTML = htmlStr;

            for(let i=0;i<length;i++){
                $("#subscriptions-subscribe"+i).click(async function(e) {
                    const subscription = index.subscriptions[i];
                    if(subscription.isSubscribed){
                        index.unsubscribeFeed(subscription.address).catch(e => utils.showAlert(e));
                    }
                    else{
                        index.onSubscribeFeedClicked(subscription.address).catch(e => utils.showAlert(e));
                    }
                    e.stopPropagation();
                });
            }
        }
        else if(option === Constants.OPTION_CONTACTS){
            const length = this.pageContacts === 0 ? (this.contacts.length > Constants.ITEMS_OFFSET ? Constants.ITEMS_OFFSET : this.contacts.length) : this.contacts.length;

            let htmlStr = "";
            for(let i=0;i<length;i++){
                htmlStr += this.rowContactsList(i);
            }
            document.getElementsByClassName("contacts-list")[0].innerHTML = htmlStr;

            for(let i=0;i<length;i++){
                $("#contacts-select"+i).click(function(e) {
                    const item = index.contacts[i];
                    const id = JSON.stringify({id: item.id, info: item.info});
                    index.contactsSelected[id] = !index.contactsSelected[id] === true;
                    e.stopPropagation();
                });
                $("#contacts-edit"+i).click(async function(e) {
                    const item = index.contacts[i];
                    index.idContact = item.id;
                    const info = item.info;
                    const symbol = info.symbol;
                    const address = info.address;
                    const nickname = info.nickname;
                    document.getElementById("contacts-symbol").value = symbol;
                    document.getElementsByClassName("contacts-address")[0].value = address;
                    document.getElementsByClassName("contacts-nickname")[0].value = nickname;
                    index.showEditContactDialog();
                    e.stopPropagation();
                });
                $("#contacts-delete"+i).click(async function(e) {
                    const item = index.contacts[i];
                    const id = item.id;
                    const info = item.info;
                    const symbol = info.symbol.toString().trim().toLowerCase();
                    const address = info.address.toString().trim().toLowerCase();
                    const nickname = utils.getNameNormalized(info.nickname);
                    const addressToNickname = await utils.getSha256(symbol + address + index.signature);
                    const nicknameToAddress = await utils.getSha256(symbol + nickname + index.signature);
                    index.removeContacts([id],[addressToNickname, nicknameToAddress]).catch(e => utils.showAlert(e));
                    e.stopPropagation();
                });
            }
        }
        else if(option === Constants.OPTION_SEARCH_MAIL){
            const length = this.pageSearchMail === 0 ? (this.searchMail.length > Constants.ITEMS_OFFSET ? Constants.ITEMS_OFFSET : this.searchMail.length) : this.searchMail.length;

            let htmlStr = "";
            for(let i=0;i<length;i++){
                htmlStr += this.rowSearchMailList(i);
            }
            document.getElementsByClassName("search-mail-list")[0].innerHTML = htmlStr;

            for(let i=0;i<length;i++){
                $("#search-mail-list"+i).click(async function(e) {
                    const mail = index.searchMail[i];
                    if(mail.encryptedKey === "Invalid"){
                        shared.showToast("Invalid Email");
                        return;
                    }
                    const decryptedKey = await rsa.decrypt(mail.encryptedKey, null, index.jwk);
                    index.indexMail = mail.id;
                    index.msgMail = await aes.decryptData(mail.encryptedMsg, decryptedKey);
                    index.subjectMail = mail.subject;
                    index.dateMail = mail.date + " at " + mail.time;
                    index.fromMail = mail.from;
                    index.toMail = mail.to;
                    index.addressFrom = mail.addressFrom;
                    index.addressTo = mail.addressTo;
                    index.file = mail.encryptedFile;
                    index.fileName = mail.encryptedFileName ? await aes.decryptData(mail.encryptedFileName, decryptedKey) : null;
                    index.fileType = mail.encryptedFileType ? await aes.decryptData(mail.encryptedFileType, decryptedKey) : null;
                    shared.showClassName("read-msg-container", 0);
                    index.readMessage.root.innerHTML = index.msgMail;
                    $("#msg-from").text(index.fromMail);
                    $("#msg-to").text(index.toMail);
                    $("#msg-date").text(index.dateMail);
                    $("#msg-value").text(mail.mixed ? "MIXED" : mail.value+" "+mail.symbol);
                    $("#subject").text(mail.subject);
                    $("#message").val(index.msgMail);
                    if(mail.addressFrom === index.address){
                        shared.hideClassName("delete",0);
                    }
                    else{
                        shared.showClassName("delete",0);
                    }

                    index.showHideDownloadButton();

                    if(index.searchMail[i].status === 0){
                        index.setStatus(mail.id, mail.uri, 1, signHash, mail.addressFrom === index.address ? Constants.OPTION_SENT : Constants.OPTION_INBOX)
                            .then(result => {
                                if(result.data){
                                    index.searchMail[i].status = 1;

                                    if(index.inbox){
                                        const id = index.inbox.findIndex(e => e.encryptedMsg === mail.encryptedMsg && e.encryptedKey === mail.encryptedKey);
                                        index.inbox[id] ? index.inbox[id].status = index.searchMail[i].status : undefined;
                                    }

                                    if(index.sent){
                                        const id = index.sent.findIndex(e => e.encryptedMsg === mail.encryptedMsg && e.encryptedKey === mail.encryptedKey);
                                        index.sent[id] ? index.sent[id].status = index.searchMail[i].status : undefined;
                                    }

                                    if(index.allMail){
                                        for(let id=0;id<index.allMail.length;id++){
                                            const e = index.allMail[id];
                                            if(e.encryptedMsg === mail.encryptedMsg && e.encryptedKey === mail.encryptedKey){
                                                index.allMail[id] ? index.allMail[id].status = index.searchMail[i].status : undefined;
                                            }
                                        }
                                    }

                                    this.style.color = mail.status === 1 ? "grey" : "black";
                                    this.style.backgroundColor = mail.status === 1 ? "#eaeafa" : "#e7e7ff";
                                }
                            });
                    }

                    e.stopPropagation();
                });

                $("#search-mail-select"+i).click(function(e) {
                    const mail = index.searchMail[i];
                    const id = JSON.stringify({id: mail.id, uri: mail.uri, from: mail.addressFrom, to: mail.addressTo});
                    index.searchMailSelected[id] = !index.searchMailSelected[id] === true;
                    e.stopPropagation();
                });
            }
        }
    }

    showHideDownloadButton(){
        if(this.file){
            const fileName = this.getFileName(this.fileName);
            document.getElementsByClassName("download-file")[0].innerHTML = "Download " + fileName.fileName + "." + fileName.extension;
            shared.showClassName("download-file",0);
        }
        else{
            shared.hideClassName("download-file",0);
        }
    }

    getFileName(nameAndExtension){
        if(nameAndExtension){
            const dot = nameAndExtension.lastIndexOf(".") > -1 ? nameAndExtension.lastIndexOf(".") : nameAndExtension.length;
            let fileName = nameAndExtension.substring(0, dot);
            let extension = nameAndExtension.substring(dot);
            if(extension.length > Constants.EXTENSION_LENGTH){
                extension = extension.substring(extension.length - Constants.EXTENSION_LENGTH);
            }

            if(nameAndExtension.length > Constants.FILENAME_MAX_LENGTH){
                const end = fileName.substring(fileName.length - Constants.EXTENSION_LENGTH);
                fileName = utils.getEllipsis(fileName, Constants.FILENAME_MAX_LENGTH, end);
                return {fileName: fileName, extension: extension};
            }
            else{
                return {fileName: fileName, extension: extension};
            }
        }
        else{
            return {fileName: null, extension: null};
        }
    }

    rowInboxList(i){
        const inbox = this.inbox[i];
        const status = inbox.status;
        const checked = inbox.checked;
        return "<li class=\"list-group-item border-0 d-flex flex-wrap justify-content-center p-0 g-0\">" +
            "<div id='inbox-list" + i + "' class=\"list-item d-flex justify-content-center align-items-center m-0 p-0 g-0\" style='color:" + (status === 1 ? "grey" : "black") + "; background-color: " + (status === 1 ? "#eaeafa" : "#e7e7ff") + ";'>" +
            "<div class='col d-flex justify-content-start align-items-center m-0 p-0 g-0'>" +
            "<div class='d-flex justify-content-center align-items-center m-0 p-0 g-0' style='width: 10%; height: 100%;'>" +
            "<input class='form-check-input m-0 p-0 g-0' type='checkbox' id='inbox-select" + i + "'" + (checked === true ? " checked" : "") + ">" +
            "</div>" +
            "<label id='inbox-from" + i + "' class='d-flex justify-content-center align-items-center fw-bold' style='width: 20%; cursor: pointer; text-align: center;'></label>" +
            "<label id='inbox-subject" + i + "' class='d-flex justify-content-start align-items-center fw-bold' style='width: 40%; cursor: pointer; text-align: start;'></label>" +
            "<div id='inbox-file" + i + "' class='g-0 p-0 m-0 d-flex justify-content-center align-items-center h-75' style='width: 0'>" +
            "<img class='img-fluid img-for-button' src='../images/attach_file_black_48dp.svg'/>" +
            "</div>" +
            "<div class='row g-0 p-0 m-0' style='width: 15%;'>" +
            "<label id='inbox-date" + i + "' class='d-flex justify-content-center align-items-center fw-bold w-100' style='cursor: pointer; text-align: center;'></label>" +
            "<label id='inbox-time" + i + "' class='d-flex justify-content-center align-items-center fw-bold w-100' style='cursor: pointer; text-align: center;'></label>" +
            "</div>" +
            "<label id='inbox-paid" + i + "' class='d-flex justify-content-center align-items-center fw-bold' style='width: 15%; cursor: pointer; text-align: center;'></label>" +
            "</div>" +
            "</div>" +
            "</li>";
    }

    rowSentList(i){
        const sent = this.sent[i];
        const status = sent.to === this.address ? sent.status : 1;
        const checked = sent.checked;
        return "<li class=\"list-group-item border-0 d-flex flex-wrap justify-content-center p-0 g-0\">" +
            "<div id='sent-list" + i + "' class=\"list-item d-flex justify-content-center align-items-center m-0 p-0 g-0\" style='color:" + (status === 1 ? "grey" : "black") + "; background-color: " + (status === 1 ? "#eaeafa" : "#e7e7ff") + ";'>" +
            "<div class='col d-flex justify-content-start align-items-center m-0 p-0 g-0'>" +
            "<div class='d-flex justify-content-center align-items-center m-0 p-0 g-0' style='width: 10%; height: 100%;'>" +
            "<input class='form-check-input m-0 p-0 g-0' type='checkbox' id='sent-select" + i + "'" + (checked === true ? " checked" : "") + ">" +
            "</div>" +
            "<label id='sent-to" + i + "' class='d-flex justify-content-center align-items-center fw-bold' style='width: 20%; cursor: pointer; text-align: center;'></label>" +
            "<label id='sent-subject" + i + "' class='d-flex justify-content-start align-items-center fw-bold' style='width: 40%; cursor: pointer; text-align: start;'></label>" +
            "<div id='sent-file" + i + "' class='g-0 p-0 m-0 d-flex justify-content-center align-items-center h-75' style='width: 0'>" +
            "<img class='img-fluid img-for-button' src='../images/attach_file_black_48dp.svg'/>" +
            "</div>" +
            "<div class='row g-0 p-0 m-0' style='width: 15%;'>" +
            "<label id='sent-date" + i + "' class='d-flex justify-content-center align-items-center fw-bold w-100' style='cursor: pointer; text-align: center;'></label>" +
            "<label id='sent-time" + i + "' class='d-flex justify-content-center align-items-center fw-bold w-100' style='cursor: pointer; text-align: center;'></label>" +
            "</div>" +
            "<label id='sent-paid" + i + "' class='d-flex justify-content-center align-items-center fw-bold' style='width: 15%; cursor: pointer; text-align: center;'></label>" +
            "</div>" +
            "</div>" +
            "</li>";
    }

    rowAllMailList(i){
        const allMail = this.allMail[i];
        const status = allMail.status;
        const checked = allMail.checked;
        return "<li class=\"list-group-item border-0 d-flex flex-wrap justify-content-center p-0 g-0\">" +
            "<div id='all-mail-list" + i + "' class=\"list-item d-flex justify-content-center align-items-center m-0 p-0 g-0\" style='color:" + (status === 1 ? "grey" : "black") + "; background-color: " + (status === 1 ? "#eaeafa" : "#e7e7ff") + ";'>" +
            "<div class='col d-flex justify-content-start align-items-center m-0 p-0 g-0'>" +
            "<div class='d-flex justify-content-center align-items-center m-0 p-0 g-0' style='width: 10%; height: 100%;'>" +
            "<input class='form-check-input m-0 p-0 g-0' type='checkbox' id='all-mail-select" + i + "'" + (checked === true ? " checked" : "") + ">" +
            "</div>" +
            "<label id='all-mail-from" + i + "' class='d-flex justify-content-center align-items-center fw-bold' style='width: 20%; cursor: pointer; text-align: center;'></label>" +
            "<label id='all-mail-subject" + i + "' class='d-flex justify-content-start align-items-center fw-bold' style='width: 40%; cursor: pointer; text-align: start;'></label>" +
            "<div id='all-mail-file" + i + "' class='g-0 p-0 m-0 d-flex justify-content-center align-items-center h-75' style='width: 0'>" +
            "<img class='img-fluid img-for-button' src='../images/attach_file_black_48dp.svg'/>" +
            "</div>" +
            "<div class='row g-0 p-0 m-0' style='width: 15%;'>" +
            "<label id='all-mail-date" + i + "' class='d-flex justify-content-center align-items-center fw-bold w-100' style='cursor: pointer; text-align: center;'></label>" +
            "<label id='all-mail-time" + i + "' class='d-flex justify-content-center align-items-center fw-bold w-100' style='cursor: pointer; text-align: center;'></label>" +
            "</div>" +
            "<label id='all-mail-paid" + i + "' class='d-flex justify-content-center align-items-center fw-bold' style='width: 15%; cursor: pointer; text-align: center;'></label>" +
            "</div>" +
            "</div>" +
            "</li>";
    }

    rowTrashList(i){
        return "<li class=\"list-group-item border-0 d-flex flex-wrap justify-content-center p-0 g-0\">" +
            "<div id='burned-list" + i + "' class=\"list-item d-flex justify-content-center align-items-center m-0 p-0 g-0\" style='color: grey; background-color: #eaeafa;'>" +
            "<div class='col d-flex justify-content-start align-items-center m-0 p-0 g-0'>" +
            "<div class='d-flex justify-content-center align-items-center m-0 p-0 g-0' style='width: 10%; height: 100%;'>" +
            "</div>" +
            "<label id='burned-from" + i + "' class='d-flex justify-content-center align-items-center fw-bold' style='width: 20%; cursor: pointer; text-align: center;'></label>" +
            "<label id='burned-subject" + i + "' class='d-flex justify-content-start align-items-center fw-bold' style='width: 40%; cursor: pointer; text-align: start;'></label>" +
            "<div id='burned-file" + i + "' class='g-0 p-0 m-0 d-flex justify-content-center align-items-center h-75' style='width: 0'>" +
            "<img class='img-fluid img-for-button' src='../images/attach_file_black_48dp.svg'/>" +
            "</div>" +
            "<div class='row g-0 p-0 m-0' style='width: 15%;'>" +
            "<label id='burned-date" + i + "' class='d-flex justify-content-center align-items-center fw-bold w-100' style='cursor: pointer; text-align: center;'></label>" +
            "<label id='burned-time" + i + "' class='d-flex justify-content-center align-items-center fw-bold w-100' style='cursor: pointer; text-align: center;'></label>" +
            "</div>" +
            "<label id='burned-paid" + i + "' class='d-flex justify-content-center align-items-center fw-bold' style='width: 15%; cursor: pointer; text-align: center;'></label>" +
            "</div>" +
            "</div>" +
            "</li>";
    }

    rowBlockedUsersList(i){
        const blockedUser = this.blockedUsers[i];
        const checked = blockedUser.checked;
        return "<li class=\"list-group-item border-0 d-flex flex-wrap justify-content-center p-0 g-0\">" +
            "<div id='blocked-users-list" + i + "' class=\"list-item d-flex justify-content-center align-items-center m-0 p-0 g-0\">" +
            "<div class='col d-flex justify-content-start align-items-center m-0 p-0 g-0'>" +
            "<div class='d-flex justify-content-center align-items-center m-0 p-0 g-0' style='width: 10%; height: 100%;'>" +
            "<input class='form-check-input m-0 p-0 g-0' type='checkbox' id='blocked-users-select" + i + "'" + (checked === true ? " checked" : "") + ">" +
            "</div>" +
            "<label id='blocked-users-address" + i + "' class='d-flex justify-content-center align-items-center fw-bold' style='width: 40%; cursor: pointer; text-align: center;'></label>" +
            "<button id='blocked-users-unblock" + i + "' class='btn btn-primary ms-5 mt-1 mb-1' type='button' style='width: auto;'>Unblock</button>" +
            "</div>" +
            "</div>" +
            "</li>";
    }

    rowFeedsList(i){
        return "<li class=\"list-group-item border-0 d-flex flex-wrap justify-content-center p-0 g-0\">" +
            "<div id='feeds-list" + i + "' class=\"list-item d-flex justify-content-center align-items-center m-0 p-0 g-0;\"'>" +
            "<div class='col d-flex justify-content-start align-items-center m-0 p-0 g-0'>" +
            "<label id='feeds-name" + i + "' class='d-flex justify-content-center align-items-center fw-bold' style='width: 42.5%; cursor: pointer; text-align: center;'></label>" +
            "<label id='feeds-price" + i + "' class='d-flex justify-content-center align-items-center fw-bold' style='width: 12.5%; cursor: pointer; text-align: center;'></label>" +
            "<label id='feeds-rating" + i + "' class='d-flex justify-content-center align-items-center fw-bold' style='width: 15%; cursor: pointer; text-align: center;'></label>" +
            "<button id='feeds-address" + i + "' class='btn btn-secondary d-flex justify-content-center align-items-center fw-bold' style='width: 15%; cursor: pointer;'>" +
                "<div class='d-flex justify-content-center align-items-center row g-0 p-0 m-0 w-100 h-100'>"+
                    "<div class='g-0 p-0 m-0 d-flex justify-content-center align-items-center w-25' style='height: 1.25rem'>" +
                        "<img class='img-fluid img-for-button' src='../images/content_copy_white_48dp.svg'/>" +
                    "</div>" +
                    "<div id='feeds-address-text" + i + "' class='g-0 p-0 m-0 d-flex justify-content-start align-items-center w-75 h-100'>" +
                    "</div>" +
                "</div>" +
            "</button>" +
            "<div class='d-flex justify-content-center align-items-center' style='width: 15%;'>" +
            "<button id='feeds-subscribe" + i + "' class='btn btn-primary mt-1 mb-1' type='button' style='width: 75%;'>Subscribe</button>" +
            "</div>" +
            "</div>" +
            "</div>" +
            "</li>";
    }

    rowSubscriptionsList(i){
        return "<li class=\"list-group-item border-0 d-flex flex-wrap justify-content-center p-0 g-0\">" +
            "<div id='subscriptions-list" + i + "' class=\"list-item d-flex justify-content-center align-items-center m-0 p-0 g-0;\"'>" +
            "<div class='col d-flex justify-content-start align-items-center m-0 p-0 g-0'>" +
            "<label id='subscriptions-name" + i + "' class='d-flex justify-content-center align-items-center fw-bold' style='width: 55%; cursor: pointer; text-align: center;'></label>" +
            "<label id='subscriptions-owner" + i + "' class='d-flex justify-content-center align-items-center fw-bold' style='width: 15%; cursor: pointer; text-align: center;'></label>" +
            "<button id='subscriptions-rating" + i + "' class='btn btn-secondary d-flex justify-content-center align-items-center fw-bold' style='width: 15%; cursor: pointer;'>" +
                "<div class='d-flex justify-content-center align-items-center row g-0 p-0 m-0 w-100 h-100'>"+
                    "<div class='g-0 p-0 m-0 d-flex justify-content-center align-items-center w-25' style='height: 1.25rem'>" +
                        "<img class='img-fluid img-for-button' src='../images/star_white_48dp.svg'/>" +
                    "</div>" +
                    "<div class='g-0 p-0 m-0 d-flex justify-content-start align-items-center w-75 h-100'>" +
                        "Set Rating" +
                    "</div>" +
                "</div>" +
            "</button>" +
            "<div class='d-flex justify-content-center align-items-center' style='width: 15%;'>" +
            "<button id='subscriptions-subscribe" + i + "' class='btn btn-primary mt-1 mb-1' type='button' style='width: 75%;'>Subscribe</button>" +
            "</div>" +
            "</div>" +
            "</div>" +
            "</li>";
    }

    rowContactsList(i){
        const contact = this.contacts[i];
        const checked = contact.checked;
        return "<li class=\"list-group-item border-0 d-flex flex-wrap justify-content-center p-0 g-0\">" +
            "<div id='contacts-list" + i + "' class=\"list-item d-flex justify-content-center align-items-center m-0 p-0 g-0\">" +
            "<div class='col d-flex justify-content-start align-items-center m-0 p-0 g-0'>" +
            "<div class='d-flex justify-content-center align-items-center m-0 p-0 g-0' style='width: 10%; height: 100%;'>" +
            "<input class='form-check-input m-0 p-0 g-0' type='checkbox' id='contacts-select" + i + "'" + (checked === true ? " checked" : "") + ">" +
            "</div>" +
            "<label id='contacts-network" + i + "' class='d-flex justify-content-center align-items-center fw-bold' style='width: 15%; cursor: pointer; text-align: center;'></label>" +
            "<label id='contacts-address" + i + "' class='d-flex justify-content-center align-items-center fw-bold' style='width: 15%; cursor: pointer; text-align: center;'></label>" +
            "<label id='contacts-nickname" + i + "' class='d-flex justify-content-start align-items-center fw-bold ps-1' style='width: 40%; cursor: pointer; text-align: start;'></label>" +
            "<div class='d-flex justify-content-end align-items-center m-0 p-0 g-0' style='width: 20%; height: 100%;'>" +
            "<button id='contacts-edit" + i + "' class='btn btn-primary ms-2 mt-1 mb-1' type='button' style='width: auto;'>Edit</button>" +
            "<button id='contacts-delete" + i + "' class='btn btn-primary ms-2 me-2 mt-1 mb-1' type='button' style='width: auto;'>Delete</button>" +
            "</div>" +
            "</div>" +
            "</div>" +
            "</li>";
    }

    rowSearchMailList(i){
        const searchMail = this.searchMail[i];
        const status = searchMail.status;
        const checked = searchMail.checked;
        return "<li class=\"list-group-item border-0 d-flex flex-wrap justify-content-center p-0 g-0\">" +
            "<div id='search-mail-list" + i + "' class=\"list-item d-flex justify-content-center align-items-center m-0 p-0 g-0\" style='color:" + (status === 1 ? "grey" : "black") + "; background-color: " + (status === 1 ? "#eaeafa" : "#e7e7ff") + ";'>" +
            "<div class='col d-flex justify-content-start align-items-center m-0 p-0 g-0'>" +
            "<div class='d-flex justify-content-center align-items-center m-0 p-0 g-0' style='width: 10%; height: 100%;'>" +
            "<input class='form-check-input m-0 p-0 g-0' type='checkbox' id='search-mail-select" + i + "'" + (checked === true ? " checked" : "") + ">" +
            "</div>" +
            "<label id='search-mail-from" + i + "' class='d-flex justify-content-center align-items-center fw-bold' style='width: 20%; cursor: pointer; text-align: center;'></label>" +
            "<label id='search-mail-subject" + i + "' class='d-flex justify-content-start align-items-center fw-bold' style='width: 40%; cursor: pointer; text-align: start;'></label>" +
            "<div id='search-mail-file" + i + "' class='g-0 p-0 m-0 d-flex justify-content-center align-items-center h-75' style='width: 0'>" +
            "<img class='img-fluid img-for-button' src='../images/attach_file_black_48dp.svg'/>" +
            "</div>" +
            "<div class='row g-0 p-0 m-0' style='width: 15%;'>" +
            "<label id='search-mail-date" + i + "' class='d-flex justify-content-center align-items-center fw-bold w-100' style='cursor: pointer; text-align: center;'></label>" +
            "<label id='search-mail-time" + i + "' class='d-flex justify-content-center align-items-center fw-bold w-100' style='cursor: pointer; text-align: center;'></label>" +
            "</div>" +
            "<label id='search-mail-paid" + i + "' class='d-flex justify-content-center align-items-center fw-bold' style='width: 15%; cursor: pointer; text-align: center;'></label>" +
            "</div>" +
            "</div>" +
            "</li>";
    }

    async sendMail(receiverAddress){
        shared.showLoading();
        receiverAddress = await utils.checkAddress(receiverAddress);
        if(!receiverAddress){
            utils.showAlert("Error: invalid 'To' address.");
            index.sendingTx = false;
            return;
        }

        let customFee = document.getElementsByClassName('fee')[0].value;
        const subject = document.getElementsByClassName('subject')[0].value;
        const message = index.writeMessage.root.innerHTML;

        if(!subject && !await confirm("Send mail without subject?")){
            shared.hideLoading();
            index.sendingTx = false;
            return;
        }

        if(!message && !await confirm("Send mail without message?")){
            shared.hideLoading();
            index.sendingTx = false;
            return;
        }

        let senderMailBoxCid = null;
        index.sendingTx = true;
        let mailBoxInfo = await index.mailContract.methods.getMailBoxInfo(index.address).call();
        const senderUri = mailBoxInfo[1];

        mailBoxInfo = await index.mailContract.methods.getMailBoxInfo(receiverAddress).call();
        const receiverUri = mailBoxInfo[1];
        let fee = mailBoxInfo[2];
        const isPaid = mailBoxInfo[3];

        let fromToInfo = await index.mailContract.methods.getFromToInfo(index.address, receiverAddress, 0, 1).call();
        const totalSentFrom = fromToInfo[0];
        const isFreeMail = fromToInfo[2];

        fromToInfo = await index.mailContract.methods.getFromToInfo(receiverAddress, index.address, 0, 1).call();
        const totalSentTo = fromToInfo[0];

        const extensionAddress = await index.mailContract.methods.getExtensionInfo(receiverAddress).call();
        const isPaymentWithToken = extensionAddress !== Constants.ZERO_ADDRESS;
        let feeEther = this.web3.utils.fromWei(fee.toString(), "ether");
        let tokenSymbol = Constants.DEFAULT_TOKEN_SYMBOL;

        if(parseInt(fee) > 0 && (isNaN(parseFloat(customFee.toString())) || !customFee || customFee === "") && !isPaymentWithToken){
            utils.showAlert("Error: invalid 'Fee'.");
            index.sendingTx = false;
            return;
        }

        if(isPaymentWithToken){
            const extensionContract = await utils.getContract(extensionAddress);
            const decimals = await extensionContract.methods.getTokenDecimals().call();
            const unit = utils.findUnit(decimals, this.web3);
            feeEther = this.web3.utils.fromWei(fee.toString(), unit);

            if((isPaid && !isFreeMail) || (totalSentFrom.toString() === '0' && totalSentTo.toString() === '0')){
                if((await utils.getBigNumber(this.web3.utils.toWei(customFee.toString(), unit))).gte(await utils.getBigNumber(fee))){
                    customFee = this.web3.utils.toWei(customFee.toString(), unit);
                }
                else{
                    tokenSymbol = await extensionContract.methods.getTokenSymbol().call();
                    utils.showAlert("Error: fee below the minimum ("+feeEther+" "+tokenSymbol+").");
                    return;
                }
            }
            else if(isFreeMail){
                customFee = 0;
            }
            else{
                customFee = this.web3.utils.toWei(customFee.toString(), unit);
            }

            const tokenAddress = await extensionContract.methods.getTokenAddress().call();
            const tokenContract = await utils.getContract(tokenAddress);
            const isERC721 = await tokenContract.methods.supportsInterface(Constants.ERC721_INTERFACE_ID).call();
            const secondaryFees = await extensionContract.methods.getSecondaryFees(0).call();
            const secondaryFeeValue = secondaryFees[3];
            const secondaryFeeOr = secondaryFees[4];

            if(isERC721){
                if(secondaryFeeOr){
                    const balance = await tokenContract.methods.balanceOf(this.address).call();
                    if((await utils.getBigNumber(balance.toString())).lt(await utils.getBigNumber(customFee.toString()))){
                        fee = secondaryFeeValue;
                    }
                    else{
                        fee = 0;
                    }
                }
                else{
                    fee = secondaryFeeValue;
                }
            }
            else{
                if(secondaryFeeOr){
                    const allowance = await tokenContract.methods.allowance(this.address, extensionAddress).call();
                    if((await utils.getBigNumber(allowance.toString())).lt(await utils.getBigNumber(customFee.toString()))){
                        fee = secondaryFeeValue;
                    }
                    else{
                        fee = 0;
                    }
                }
                else{
                    fee = secondaryFeeValue;
                }
            }
        }
        else{
            if((isPaid && !isFreeMail) || (totalSentFrom.toString() === '0' && totalSentTo.toString() === '0')){
                if((await utils.getBigNumber(this.web3.utils.toWei(customFee.toString(), "ether"))).gte(await utils.getBigNumber(fee))){
                    fee = this.web3.utils.toWei(customFee.toString(), "ether");
                }
                else{
                    utils.showAlert("Error: fee below the minimum ("+feeEther+" "+tokenSymbol+").");
                    return;
                }
            }
            else if(isFreeMail){
                fee = 0;
            }
            else{
                fee = this.web3.utils.toWei(customFee.toString(), "ether");
            }
            customFee = 0;
        }

        let hasSenderMailBox = !!senderUri;
        if(hasSenderMailBox){
            this.waitCreatingEncryptedMessage(senderMailBoxCid, senderUri, receiverUri, receiverAddress, fee, customFee, subject,
                message, hasSenderMailBox)
                .then(() => {
                    index.onBackClicked();
                    index.sendingTx = false;
                    shared.hideLoading();
                })
                .catch(e => {
                    index.sendingTx = false;
                    if(e.code !== 4001 && e.status !== 413 && (!e.reason || !e.reason.includes(Errors.ADDRESS_BLOCKED))){
                        utils.showAlert("Error sending email.\n\n" +
                            "Check your internet connection and your digital wallet settings.\n" +
                            "Check if the fee amount is correct and if you have token(s) available in your digital wallet to use.");
                    }
                    else if(e.status === 413){
                        utils.showAlert("Error: mail size is larger than " + (Constants.MAX_MAIL_SIZE / (1024 * 1024)) + " MB.");
                    }
                    else{
                        utils.showAlert(e);
                    }
                });
        }
        else{
            index.sendingTx = false;
            const createAccount = await utils.showConfirm("You don't have an account." +
                "\n\nClick on the 'OK' button to Sign In and create your account or " +
                "\nclick on the 'Cancel' button to cancel.");

            if(createAccount){
                index.onSignInClicked()
                    .then(() => {
                        if(index.jwk){
                            index.showSignUpDialog();
                        }
                    })
                    .catch(e => utils.showAlert(e));
            }
        }
    }

    async waitCreatingEncryptedMessage(senderMailBoxCid, senderUri, receiverUri, receiverAddress, fee, customFee, subject, message,
                                       hasSenderMailBox){
        return new Promise(async function(resolve, reject) {
            try {
                await index.createEncryptedMessage(senderMailBoxCid, senderUri, receiverUri, receiverAddress, fee, customFee,
                    subject, message, hasSenderMailBox, resolve, reject);
            } catch (e) {
                reject(e);
            }
        });
    }

    async createEncryptedMessage(senderMailBoxCid, senderUri, receiverUri, receiverAddress, fee, customFee, subject, message,
                                 hasSenderMailBox, resolve, reject){
        if(!receiverUri && this.address === receiverAddress){
            receiverUri = senderUri;
        }

        const uris = [senderUri, receiverUri];
        index.getTexts(uris)
            .then(async mailBoxes => {
                const jwks = [];
                for(let i=0;i<uris.length;i++){
                    for(let j=0;j<mailBoxes.result.length;j++){
                        if(uris[i] === mailBoxes.result[j].cid) {
                            jwks.push(JSON.parse(mailBoxes.result[j].text));
                            break;
                        }
                    }
                }

                if(index.file){
                    index.decryptFile()
                        .then(decryptedFile => {
                            index.encryptMail(jwks, subject, message, decryptedFile, fee, customFee, receiverAddress, senderMailBoxCid,
                                senderUri, hasSenderMailBox, index.fileName, index.fileType, resolve, reject);
                        })
                        .catch(e => utils.showAlert(e));
                }
                else{
                    let file = "";
                    const fileAttached = document.getElementById("attach-file").files[0];
                    const reader = new FileReader();
                    reader.onload = async function() {
                        if(fileAttached.size <= Constants.MAX_FILE_SIZE){
                            file = reader.result;
                            try{
                                await index.encryptMail(jwks, subject, message, file, fee, customFee, receiverAddress, senderMailBoxCid,
                                    senderUri, hasSenderMailBox, fileAttached.name, fileAttached.type, resolve, reject);
                            }
                            catch (e) {
                                utils.showAlert(e);
                            }
                        }
                        else{
                            utils.showAlert("Error: file size is larger than " + (Constants.MAX_FILE_SIZE / (1024 * 1024)) + " MB.");
                        }
                    }

                    if(fileAttached){
                        reader.readAsDataURL(fileAttached);
                    }
                    else{
                        await index.encryptMail(jwks, subject, message, file, fee, customFee, receiverAddress, senderMailBoxCid, senderUri,
                            hasSenderMailBox, null, null, resolve, reject);
                    }
                }
            })
            .catch(e => reject(e));
    }

    async encryptMail(jwks, subject, message, file, fee, customFee, receiverAddress, senderMailBoxCid, senderUri, hasSenderMailBox,
                      fileName, fileType, resolve, reject){

        if(jwks.length < 2 || !jwks[0].n || !jwks[1].n || !jwks[0].e || !jwks[1].e){
            utils.showAlert("Error: invalid or nonexistent mailbox.");
            return;
        }

        let randomKey = utils.getRandomValues();
        const senderEncryptedKey = await rsa.encrypt(randomKey, null, jwks[0]);
        const senderEncryptedSubject = await aes.encryptData(subject, randomKey);
        const senderEncryptedMsg = await aes.encryptData(message, randomKey);
        const senderEncryptedFile = file ? await aes.encryptData(file, randomKey) : null;
        const senderFileName = await aes.encryptData(fileName, randomKey);
        const senderFileType = await aes.encryptData(fileType, randomKey);
        randomKey = utils.getRandomValues();
        const receiverEncryptedKey = await rsa.encrypt(randomKey, null, jwks[1]);
        const receiverEncryptedSubject = await aes.encryptData(subject, randomKey);
        const receiverEncryptedMsg = await aes.encryptData(message, randomKey);
        const receiverEncryptedFile = file ? await aes.encryptData(file, randomKey) : null;
        const receiverFileName = await aes.encryptData(fileName, randomKey);
        const receiverFileType = await aes.encryptData(fileType, randomKey);

        if(senderEncryptedFile && receiverEncryptedFile){
            this.sendText(senderEncryptedFile, 0)
                .then(senderFile => {
                    this.sendText(receiverEncryptedFile, 0)
                        .then(receiverFile => {
                            this.createMetadata(fee, customFee, receiverAddress, senderEncryptedKey, senderEncryptedSubject,
                                senderEncryptedMsg, senderFile.path, senderFileName, senderFileType, receiverEncryptedKey,
                                receiverEncryptedSubject, receiverEncryptedMsg, receiverFile.path, receiverFileName,
                                receiverFileType, senderMailBoxCid, senderUri, hasSenderMailBox,
                                resolve, reject);
                        })
                        .catch(e => reject(e));
                })
                .catch(e => reject(e));
        }
        else{
            this.createMetadata(fee, customFee, receiverAddress, senderEncryptedKey, senderEncryptedSubject, senderEncryptedMsg,
                "", "", "", receiverEncryptedKey, receiverEncryptedSubject,
                receiverEncryptedMsg, "","", "", senderMailBoxCid, senderUri,
                hasSenderMailBox, resolve, reject).catch(e => utils.showAlert(e));
        }
    }

    async createMetadata(fee, customFee, receiverAddress, senderEncryptedKey, senderEncryptedSubject, senderEncryptedMsg, senderFile,
                         senderFileName, senderFileType, receiverEncryptedKey, receiverEncryptedSubject, receiverEncryptedMsg,
                         receiverFile, receiverFileName, receiverFileType, senderMailBoxCid, senderUri, hasSenderMailBox,
                         resolve, reject){

        const data = {
            alg_key: Constants.ALG_KEY,
            alg_msg: Constants.ALG_MSG,
            sender: this.address,
            receiver: receiverAddress,
            sender_key: senderEncryptedKey,
            sender_subject: senderEncryptedSubject,
            sender_msg: senderEncryptedMsg,
            sender_file: senderFile,
            sender_file_name: senderFileName,
            sender_file_type: senderFileType,
            receiver_key: receiverEncryptedKey,
            receiver_subject: receiverEncryptedSubject,
            receiver_msg: receiverEncryptedMsg,
            receiver_file: receiverFile,
            receiver_file_name: receiverFileName,
            receiver_file_type: receiverFileType,
        };

        const mail = JSON.stringify(data);
        this.createTransaction(mail, receiverAddress, senderMailBoxCid, senderUri, fee, customFee, hasSenderMailBox, resolve, reject);
    }

    createTransaction(mail, receiverAddress, senderMailBoxCid, senderUri, fee, customFee, hasSenderMailBox, resolve, reject){
        this.sendText(mail, 0)
            .then(async senderMailCid => {
                const txValues = await utils.getTxValues();

                let tx;
                if(hasSenderMailBox){
                    tx = {
                        to: Constants.MAIL_CONTRACT_ADDRESS,
                        value: fee,
                        data: txValues.iface.encodeFunctionData("sendMail(address,string,uint256)", [
                            receiverAddress, senderMailCid.path, customFee
                        ])
                    };
                }
                else{
                    tx = {
                        to: Constants.MAIL_CONTRACT_ADDRESS,
                        value: fee,
                        data: txValues.iface.encodeFunctionData("sendMail(address,string,string,uint256)", [
                            receiverAddress, senderMailBoxCid.path, senderMailCid.path, 0
                        ])
                    };
                }

                txValues.signer.sendTransaction(tx)
                    .then(() => {
                        resolve(true);
                    })
                    .catch(e => reject({e}.e));
            }).catch(e => reject(e));
    }

    async sendFeed(feedAddress, addresses){
        const subject = document.getElementsByClassName('subject')[0].value;
        const message = index.writeMessage.root.innerHTML;

        shared.showLoading();
        this.sendingTx = true;
        let mailBoxInfo = await this.mailContract.methods.getMailBoxInfo(this.address).call();
        let senderUri = mailBoxInfo[1];

        if(!subject && !await confirm("Send mail without subject?")){
            shared.hideLoading();
            this.sendingTx = false;
            return;
        }

        if(!message && !await confirm("Send mail without message?")){
            shared.hideLoading();
            this.sendingTx = false;
            return;
        }

        let hasSenderMailBox = !!senderUri;
        if(hasSenderMailBox){
            this.waitCreatingEncryptedFeed(senderUri, addresses, subject, message, feedAddress, [])
                .then(() => {
                    this.sendingTx = false;
                    shared.hideLoading();
                })
                .catch(e => {
                    this.sendingTx = false;
                    utils.showAlert(e);
                });
        }
        else{
            utils.showAlert("Error: user doesn't have an account.");
            window.location.reload();
        }
    }

    async waitCreatingEncryptedFeed(senderUri, addresses, subject, message, feedAddress, mailCids){
        return new Promise(async function(resolve, reject) {
            try {
                const receiverAddress = addresses[mailCids.length];
                const mailBoxInfo = await index.mailContract.methods.getMailBoxInfo(receiverAddress).call();
                const receiverUri = mailBoxInfo[1];
                await index.createEncryptedFeed(senderUri, receiverUri, addresses, subject, message, feedAddress, mailCids, resolve, reject);
            } catch (e) {
                reject(e);
            }
        });
    }

    async createEncryptedFeed(senderUri, receiverUri, addresses, subject, message, feedAddress, mailCids, resolve, reject){
        const uris = [senderUri, receiverUri];
        this.getTexts(uris)
            .then(async mailBoxes => {
                const jwks = [];
                for(let i=0;i<uris.length;i++){
                    for(let j=0;j<mailBoxes.result.length;j++){
                        if(uris[i] === mailBoxes.result[j].cid) {
                            jwks.push(JSON.parse(mailBoxes.result[j].text));
                            break;
                        }
                    }
                }

                if(index.file){
                    index.decryptFile()
                        .then(decryptedFile => {
                            index.encryptFeed(jwks, subject, message, decryptedFile,
                                addresses, senderUri, index.fileName,
                                index.fileType, feedAddress, mailCids, resolve, reject);
                        })
                        .catch(e => utils.showAlert(e));
                }
                else{
                    let file = "";
                    const fileAttached = document.getElementById("attach-file").files[0];
                    const reader = new FileReader();
                    reader.onload = async function() {
                        if(fileAttached.size <= Constants.MAX_FILE_SIZE){
                            file = reader.result;
                            try{
                                await index.encryptFeed(jwks, subject, message, file,
                                    addresses, senderUri, fileAttached.name,
                                    fileAttached.type, feedAddress, mailCids, resolve, reject);
                            }
                            catch (e) {
                                utils.showAlert(e);
                            }
                        }
                        else{
                            utils.showAlert("Error: file size is larger than " + (Constants.MAX_FILE_SIZE / (1024 * 1024)) + " MB.");
                        }
                    }

                    if(fileAttached){
                        reader.readAsDataURL(fileAttached);
                    }
                    else{
                        await index.encryptFeed(jwks, subject, message, file,
                            addresses, senderUri, null,
                            null, feedAddress, mailCids, resolve, reject);
                    }
                }
            })
            .catch(e => reject(e));
    }

    async encryptFeed(jwks, subject, message, file, addresses, senderUri, fileName, fileType, feedAddress, mailCids, resolve, reject){
        if(jwks.length < 2 || !jwks[0].n || !jwks[1].n || !jwks[0].e || !jwks[1].e){
            utils.showAlert("Error: invalid or nonexistent mailbox.");
            return;
        }

        let randomKey = utils.getRandomValues();
        const senderEncryptedKey = await rsa.encrypt(randomKey, null, jwks[0]);
        const senderEncryptedSubject = await aes.encryptData(subject, randomKey);
        const senderEncryptedMsg = await aes.encryptData(message, randomKey);
        const senderEncryptedFile = file ? await aes.encryptData(file, randomKey) : null;
        const senderFileName = await aes.encryptData(fileName, randomKey);
        const senderFileType = await aes.encryptData(fileType, randomKey);
        randomKey = utils.getRandomValues();
        const receiverEncryptedKey = await rsa.encrypt(randomKey, null, jwks[1]);
        const receiverEncryptedSubject = await aes.encryptData(subject, randomKey);
        const receiverEncryptedMsg = await aes.encryptData(message, randomKey);
        const receiverEncryptedFile = file ? await aes.encryptData(file, randomKey) : null;
        const receiverFileName = await aes.encryptData(fileName, randomKey);
        const receiverFileType = await aes.encryptData(fileType, randomKey);

        if(senderEncryptedFile && receiverEncryptedFile){
            this.sendText(senderEncryptedFile, 0)
                .then(senderFile => {
                    this.sendText(receiverEncryptedFile, 0)
                        .then(receiverFile => {
                            this.createFeedMetadata(addresses, subject, message, file,
                                senderEncryptedKey, senderEncryptedSubject, senderEncryptedMsg, senderFile.path,
                                senderFileName, senderFileType, receiverEncryptedKey,
                                receiverEncryptedSubject, receiverEncryptedMsg, receiverFile.path, receiverFileName,
                                receiverFileType, senderUri, feedAddress, mailCids,
                                resolve, reject);
                        })
                        .catch(e => reject(e));
                })
                .catch(e => reject(e));
        }
        else{
            this.createFeedMetadata(addresses, subject, message, file, senderEncryptedKey,
                senderEncryptedSubject, senderEncryptedMsg, "", "", "",
                receiverEncryptedKey, receiverEncryptedSubject, receiverEncryptedMsg, "",
                "", "", senderUri, feedAddress, mailCids,
                resolve, reject);
        }
    }

    createFeedMetadata(addresses, subject, message, file, senderEncryptedKey, senderEncryptedSubject,
                       senderEncryptedMsg, senderFile, senderFileName, senderFileType, receiverEncryptedKey,
                       receiverEncryptedSubject, receiverEncryptedMsg, receiverFile, receiverFileName, receiverFileType,
                       senderUri, feedAddress, mailCids, resolve, reject){

        const data = {
            alg_key: Constants.ALG_KEY,
            alg_msg: Constants.ALG_MSG,
            sender: this.address,
            receiver: addresses[mailCids.length],
            sender_key: senderEncryptedKey,
            sender_subject: senderEncryptedSubject,
            sender_msg: senderEncryptedMsg,
            sender_file: senderFile,
            sender_file_name: senderFileName,
            sender_file_type: senderFileType,
            receiver_key: receiverEncryptedKey,
            receiver_subject: receiverEncryptedSubject,
            receiver_msg: receiverEncryptedMsg,
            receiver_file: receiverFile,
            receiver_file_name: receiverFileName,
            receiver_file_type: receiverFileType,
        };

        const mail = JSON.stringify(data);
        this.createFeedTransaction(mail, addresses, senderUri, subject, message, feedAddress, mailCids, resolve, reject);
    }

    createFeedTransaction(mail, addresses, senderUri, subject, message, feedAddress, mailCids, resolve, reject){
        index.sendText(mail, 0)
            .then(async mailCid => {
                const txValues = await utils.getTxValues();

                mailCids.push(mailCid.path);
                if(mailCids.length >= addresses.length){
                    let tx;
                    tx = {
                        to: Constants.MAIL_CONTRACT_ADDRESS,
                        data: txValues.iface.encodeFunctionData("sendFeed(address,address[],string[])", [
                            feedAddress, addresses, mailCids
                        ])
                    };

                    txValues.signer.sendTransaction(tx)
                        .then(() => resolve(true))
                        .catch(e => reject({e}.e));
                }
                else{
                    const receiverAddress = addresses[mailCids.length];
                    const mailBoxInfo = await index.mailContract.methods.getMailBoxInfo(receiverAddress).call();
                    const receiverUri = mailBoxInfo[1];
                    await this.createEncryptedFeed(senderUri, receiverUri, addresses, subject, message, feedAddress, mailCids, resolve, reject);
                }
            }).catch(e => reject(e));
    }

    async createAccount(){
        const signHash = await utils.getSha256(this.signature);
        const privateKey = await this.createPrivateKey(this.signature);
        const password = utils.get32BytesPassword(this.signature, this.address);
        const obj = await aes.decryptData(privateKey.encryptedpk, password);
        if(obj.includes('"n"') && obj.includes('"e"')){
            this.jwk = JSON.parse(obj.toString());
        }
        else{
            utils.showAlert("Error on loading private key.");
            return;
        }

        const senderJwk = privateKey.jwk;
        if (senderJwk) {
            const text = privateKey.encryptedpk.toString();
            index.sendEncryptedPK(text, signHash)
                .then(() => {
                    const senderMailBoxUri = JSON.stringify(senderJwk);
                    this.sendText(senderMailBoxUri, 0)
                        .then(senderMailBoxCid => {
                            const senderUri = senderMailBoxCid.path;
                            this.waitCreatingEncryptedMessage(senderMailBoxCid, senderUri, senderUri, this.address,
                                0, 0, Constants.DEFAULT_SUBJECT_ACCOUNT_CREATION,
                                Constants.DEFAULT_MESSAGE_ACCOUNT_CREATION, false)
                                .then(() => {
                                    this.hideDialog();
                                    shared.hideLoading();
                                    shared.enableAll(true);
                                    this.loadItems(false, true, this.option);
                                })
                                .catch(e => utils.showAlert(e));
                        })
                        .catch(e => utils.showAlert(e));
                })
                .catch(e => utils.showAlert(e));
        } else {
            utils.showAlert("Error: invalid private key.");
        }
    }

    showCookieDialog(){
        const isAllowedCookie = utils.getCookie("allowed-cookie");
        if(!isAllowedCookie || isAllowedCookie === "false" || isAllowedCookie === ""){
            document.getElementsByClassName("custom-title-warning")[1].innerHTML = "Terms and Privacy";
            document.getElementsByClassName("custom-text-warning")[2].innerHTML = 'We use cookies to ensure you get the<br>best experience on our website.<br><br>By clicking on the button \'OK\' you agree<br>the <a href="/terms" target="_blank">Terms of Services</a> and the <a href="/privacy" target="_blank">Privacy Policy</a>.';
            document.getElementsByClassName("custom-btn-warning")[2].innerHTML = "OK";
            shared.hideClassName("custom-text-warning", 3);
            shared.hideClassName("custom-btn-warning", 1);
            shared.showClassName("custom-btn-warning", 2);
            shared.showClassName("dialog-background", 0);
            shared.showClassName("custom-dialog-warning-medium", 0);
            shared.hideLoading();
        }
    }

    showWelcomeDialog(){
        document.getElementsByClassName("custom-title-warning")[1].innerHTML = "Welcome";
        document.getElementsByClassName("custom-text-warning")[2].innerHTML = 'Welcome to HashBox Mail!<br>Check our <a href="/help" target="_blank">Help</a> and <a href="/faq" target="_blank">FAQ</a> before<br>you start using the application<br>and add the website to favorites.';
        document.getElementsByClassName("custom-btn-warning")[1].innerHTML = "OK";
        shared.hideClassName("custom-text-warning", 3);
        shared.showClassName("custom-btn-warning", 1);
        shared.hideClassName("custom-btn-warning", 2);
        shared.showClassName("dialog-background", 0);
        shared.showClassName("custom-dialog-warning-medium", 0);
        shared.hideLoading();
    }

    showSignUpDialog(){
        index.actionType = Constants.ACTION_SIGNUP;
        document.getElementsByClassName("custom-title-warning")[2].innerHTML = "Sign Up";
        document.getElementsByClassName("custom-text-warning")[4].innerHTML = "Click on the 'Sign Up' button<br>and confirm the transaction on MetaMask<br>to create your HashBox Mail account.";
        document.getElementsByClassName("custom-btn-warning")[3].innerHTML = "SIGN UP";
        shared.hideClassName("custom-text-warning", 5);
        shared.showClassName("custom-btn-warning", 3);
        shared.hideClassName("custom-btn-warning", 4);
        shared.showClassName("dialog-background", 0);
        shared.showClassName("custom-dialog-warning-small", 0);
        shared.hideLoading();
    }

    showConnectWalletDialog(){
        index.actionType = Constants.ACTION_CONNECT;
        document.getElementsByClassName("custom-title-warning")[2].innerHTML = "Connect Wallet";
        document.getElementsByClassName("custom-text-warning")[4].innerHTML = 'You must connect to MetaMask first.<br><br>Click on the \'Connect\' button<br>to connect to MetaMask.';
        document.getElementsByClassName("custom-btn-warning")[3].innerHTML = "CONNECT";
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
        shared.hideClassName("custom-dialog-credits", 0);
        shared.hideClassName("custom-dialog-feed", 0);
        shared.hideClassName("custom-dialog-rating", 0);
        shared.hideClassName("custom-dialog-contacts", 0);
        shared.hideClassName("custom-dialog-send-money", 0);
        if(index.oldBalanceTimeoutId !== 0){
            clearTimeout(index.oldBalanceTimeoutId);
        }
        if(index.oldCreditsToSellTimeoutId !== 0){
            clearTimeout(index.oldCreditsToSellTimeoutId);
        }
        if(index.oldCreditsToDepositTimeoutId !== 0){
            clearTimeout(index.oldCreditsToDepositTimeoutId);
        }
    }

    closeDialog(){
        index.actionType = 0;
        index.actionNext = 0;
        index.hideDialog();
    }

    disablePageButtons(option, page, total){
        if(this.option === option){
            if(total > Constants.ITEMS_OFFSET){
                document.getElementsByClassName("page-forward")[0].disabled = page + Constants.ITEMS_OFFSET >= total;
                document.getElementsByClassName("page-back")[0].disabled = page === 0;
            }
            else{
                document.getElementsByClassName("page-forward")[0].disabled = true;
                document.getElementsByClassName("page-back")[0].disabled = true;
            }
        }
    }

    async getNickname(value){
        const symbol = Constants.DEFAULT_TOKEN_SYMBOL.toString().trim().toLowerCase();
        const hash = await utils.getSha256(symbol + value.toString().trim().toLowerCase() + this.signature);
        const encryptedNickname = await this.contactsContract.methods.getNicknameFromAddress(this.address, hash).call();
        if(encryptedNickname){
            const privateKey = utils.get32BytesPassword(this.signature, this.address);
            value = await aes.decryptData(encryptedNickname, privateKey);
        }
        return value;
    }

    async getAddress(value){
        if(!this.contactsContract){
            this.contactsContract = await utils.getContract(Constants.CONTACTS_ADDRESS);
        }

        const symbol = Constants.DEFAULT_TOKEN_SYMBOL.toString().trim().toLowerCase();
        const hash = await utils.getSha256(symbol + utils.getNameNormalized(value) + this.signature);
        const encryptedAddress = await this.contactsContract.methods.getAddressFromNickname(this.address, hash).call();
        if(encryptedAddress){
            const privateKey = utils.get32BytesPassword(this.signature, this.address);
            value = await aes.decryptData(encryptedAddress, privateKey);
        }
        return value;
    }

    async createPrivateKey(){
        const keys = await rsa.generateKey();

        const jwk = {
            "n": keys.jwk.n,
            "e": keys.jwk.e,
        };

        const privateKey = utils.get32BytesPassword(this.signature, this.address);
        const encryptedpk = await aes.encryptData(JSON.stringify(keys.jwk), privateKey);

        return {jwk: jwk, encryptedpk: encryptedpk};
    }

    async getMailEncryptedPK(){
        return new Promise(async function(resolve, reject) {
            try{
                const signHash = await utils.getSha256(index.signature);
                index.mailContract = await utils.getContract(Constants.MAIL_CONTRACT_ADDRESS);
                let mailBoxInfo = await index.mailContract.methods.getMailBoxInfo(index.address).call();
                let uri = mailBoxInfo[1];
                if(uri){
                    index.getEncryptedPK(signHash)
                        .then(async result => {
                            let encryptedpk = "";
                            if(result && result.data && result.data.length > 0 && result.data[0].text){
                                encryptedpk = result.data[0].text;
                            }

                            if(encryptedpk && encryptedpk !== "null"){
                                const privateKey = utils.get32BytesPassword(index.signature, index.address);
                                const obj = await aes.decryptData(encryptedpk, privateKey);
                                if(obj.includes('"n"') && obj.includes('"e"')){
                                    index.checkBackupStatus(result.data && result.data.length > 0 && result.data[0].backedUp === 1);
                                    resolve(JSON.parse(obj.toString()));
                                }
                                else{
                                    resolve(undefined);
                                }
                            }
                            else{
                                resolve(undefined);
                            }
                        })
                        .catch(e => reject(e));
                }
                else{
                    index.sendEncryptedPK("",signHash)
                        .then(() => resolve(null))
                        .catch(e => reject(e));
                }
            }
            catch (e) {
                reject(e);
            }
        });
    }

    async backupPrivateKey(){
        if(!index.address){
            index.showAddressError();
            return;
        }
        if(!index.signature){
            utils.showAlert("Error: you must sign in first.");
            return;
        }

        const signHash = await utils.getSha256(index.signature);
        index.getEncryptedPK(signHash)
            .then(async result => {
                let encryptedpk = "";
                if(result && result.data && result.data.length > 0 && result.data[0].text){
                    encryptedpk = result.data[0].text;
                }

                if(encryptedpk && encryptedpk !== "null"){
                    const privateKey = utils.get32BytesPassword(index.signature, index.address);
                    const obj = await aes.decryptData(encryptedpk, privateKey);
                    if(obj.includes('"n"') && obj.includes('"e"')){
                        const filename = index.address + "_backup.dat";
                        utils.saveFile(encryptedpk, filename, "text/plain");
                        index.setBackedUpStatus(1, signHash).catch(e => utils.showAlert(e));
                        index.checkBackupStatus(true);
                    }
                    else{
                        utils.showAlert("Error: invalid signature or account not found.");
                    }
                }
                else{
                    utils.showAlert("Error: invalid signature or account not found.");
                }
            })
            .catch(e => utils.showAlert(e));
    }

    async backupMailBox(){
        if(!index.address){
            index.showAddressError();
            return;
        }
        if(!index.signature){
            utils.showAlert("Error: you must sign in first.");
            return;
        }

        const signHash = await utils.getSha256(index.signature);
        index.getMailBox(signHash)
            .then(result => {
                let mailbox = null;
                if(result && result.data && result.data){
                    mailbox = JSON.parse(result.data);
                }
                if(mailbox && mailbox.n && mailbox.e){
                    utils.saveFile(result.data, index.address + "_mailbox.dat", "text/plain");
                }
                else{
                    utils.showAlert("Error: invalid signature or account not found.");
                }
            })
            .catch(e => utils.showAlert(e));
    }

    onSetRPCServerClicked(){
        const rpcServerLink = document.getElementsByClassName('rpc-server')[0].value;
        utils.setCookie("rpc-server", rpcServerLink);
        Constants.RPC_PROVIDER = rpcServerLink;
        index.web3 = new Web3(rpcServerLink);
        shared.showToast("Saved Successfully!", 0);
    }

    onSetIPFSServerClicked(){
        const ipfsServerLink = document.getElementsByClassName('ipfs-server')[0].value;
        utils.setCookie("ipfs-server", document.getElementsByClassName('ipfs-server')[0].value);
        Constants.IPFS_SERVER_URL = ipfsServerLink;
        shared.showToast("Saved Successfully!", 0);
    }

    async onRestoreDefaults(){
        const confirmed = await utils.showConfirm("Do you want to restore some values to default?" +
            "\n\nNote: Only 'Show Nicknames Instead of Addresses', 'RPC Provider', 'IPFS Server' and 'Use Localhost Settings' values will be restored.");
        if(confirmed){
            utils.setCookie("use-nickname", "false");
            utils.setCookie("rpc-server", "null");
            utils.setCookie("ipfs-server", "null");
            utils.setCookie("use-localhost", "null");
            Constants.RPC_PROVIDER = Constants.DEFAULT_RPC_PROVIDER;
            Constants.IPFS_SERVER_URL = Constants.DEFAULT_IPFS_SERVER_URL;
            Constants.IS_LOCALHOST = false;
            this.web3 = new Web3(Constants.DEFAULT_RPC_PROVIDER);
            utils.web3 = new Web3(Constants.DEFAULT_RPC_PROVIDER);
            document.getElementsByClassName('rpc-server')[0].value = Constants.DEFAULT_RPC_PROVIDER;
            document.getElementsByClassName('ipfs-server')[0].value = Constants.DEFAULT_IPFS_SERVER_URL;
            document.getElementById("use-localhost").checked = Constants.IS_LOCALHOST;
            shared.showToast("Restored Successfully!", 0);
        }
    }

    async blockUsers(users, values){
        const uniqUsers = [...new Set(users)];
        const notBlockedUsers = [];
        const notBlockedValues = [];

        for(let i=0;i<uniqUsers.length;i++){
            const fromToInfo = await this.mailContract.methods.getFromToInfo(uniqUsers[i], this.address, 0, 1).call();
            const isBlocked = fromToInfo[3];
            if(values[i] && !isBlocked){
                notBlockedUsers.push(uniqUsers[i]);
                notBlockedValues.push(values[i]);
            }
            else if(!values[i] && isBlocked){
                notBlockedUsers.push(uniqUsers[i]);
                notBlockedValues.push(values[i]);
            }
        }

        shared.showLoading();
        const txValues = await utils.getTxValues();

        let tx;
        tx = {
            to: Constants.MAIL_CONTRACT_ADDRESS,
            data: txValues.iface.encodeFunctionData("blockUsers(address[],bool[])", [
                notBlockedUsers, notBlockedValues
            ])
        };

        txValues.signer.sendTransaction(tx)
            .then(() => {
                this.removeSelects();
                this.sendingTx = false;
                shared.hideLoading();
            })
            .catch(e => {
                this.sendingTx = false;
                utils.showAlert({e}.e);
            });
    }

    async deleteMails(mailIds){
        shared.showLoading();
        const txValues = await utils.getTxValues();

        let tx;
        tx = {
            to: Constants.MAIL_CONTRACT_ADDRESS,
            data: txValues.iface.encodeFunctionData("burnMails(uint256[])", [
                mailIds
            ])
        };

        txValues.signer.sendTransaction(tx)
            .then(() => {
                this.removeSelects();
                this.sendingTx = false;
                shared.hideLoading();
            })
            .catch(e => {
                this.sendingTx = false;
                utils.showAlert({e}.e);
            });
    }

    async addCredits(amount){
        amount = this.web3.utils.toWei(amount.toString(), "ether");
        this.sendingTx = true;
        const txValues = await utils.getTxValues();

        let tx;
        tx = {
            to: Constants.CREDITS_CONTRACT_ADDRESS,
            data: txValues.iface.encodeFunctionData("increaseAllowance(address,uint256)", [
                Constants.MAIL_CONTRACT_ADDRESS, amount
            ])
        };

        txValues.signer.sendTransaction(tx)
            .then(() => {
                if(this.actionType === Constants.ACTION_ADD_CREDITS_TO_SEND_MAIL ||
                    this.actionType === Constants.ACTION_ADD_CREDITS_TO_CONTACTS ||
                    this.actionType === Constants.ACTION_ADD_CREDITS_TO_FEEDS){
                    this.checkBalanceToUseCredits().catch(e => utils.showAlert(e));
                }
                else{
                    this.sendingTx = false;
                    this.actionType = 0;
                    shared.hideLoading();
                }
            })
            .catch(e => {
                this.sendingTx = false;
                utils.showAlert({e}.e);
            });
    }

    async buyCredits(amount){
        const BN = this.web3.utils.BN;
        amount = this.web3.utils.toWei(amount.toString(), "ether");
        const priceInWei = this.web3.utils.toWei(this.price.toString(), "ether");
        const total = ((new BN(amount)).mul(new BN(priceInWei))).div(new BN(this.web3.utils.toWei("1", "ether")));
        const balance = await this.web3.eth.getBalance(this.address);
        if((new BN(balance)).lt(total)){
            utils.showAlert("Error: the user balance is less than the total.");
            return;
        }

        this.sendingTx = true;
        const txValues = await utils.getTxValues();

        let tx;
        tx = {
            to: Constants.LAUNCHPAD_CONTRACT_ADDRESS,
            value: await utils.getBigNumber(total.toString()),
            data: txValues.iface.encodeFunctionData("buyToken(uint256)", [
                amount
            ])
        };

        txValues.signer.sendTransaction(tx)
            .then(() => {
                this.hideDialog();
                this.checkBalanceToBuy().catch(e => utils.showAlert(e));
            })
            .catch(e => {
                this.sendingTx = false;
                utils.showAlert({e}.e);
            });
    }

    async approveToDepositSellCredits(amount){
        amount = this.web3.utils.toWei(amount.toString(), "ether");
        this.sendingTx = true;
        const txValues = await utils.getTxValues();

        let tx;
        tx = {
            to: Constants.CREDITS_CONTRACT_ADDRESS,
            data: txValues.iface.encodeFunctionData("increaseAllowance(address,uint256)", [
                Constants.LAUNCHPAD_CONTRACT_ADDRESS, amount
            ])
        };

        txValues.signer.sendTransaction(tx)
            .then(() => {
                this.hideDialog();
                if(index.actionNext === Constants.ACTION_DEPOSIT_CREDITS){
                    this.checkCreditsToDeposit().catch(e => utils.showAlert(e));
                }
                else if(index.actionNext === Constants.ACTION_SELL_CREDITS){
                    this.checkCreditsToSell().catch(e => utils.showAlert(e))
                }
                else{
                    this.sendingTx = false;
                    utils.hideLoading();
                }
            })
            .catch(e => {
                this.sendingTx = false;
                this.actionType = 0;
                this.actionNext = 0;
                utils.showAlert({e}.e);
            });
    }

    async depositCredits(amount){
        amount = this.web3.utils.toWei(amount.toString(), "ether");
        this.sendingTx = true;
        const txValues = await utils.getTxValues();

        let tx;
        tx = {
            to: Constants.LAUNCHPAD_CONTRACT_ADDRESS,
            data: txValues.iface.encodeFunctionData("depositToken(uint256)", [
                amount
            ])
        };

        txValues.signer.sendTransaction(tx)
            .then(() => {
                this.sendingTx = false;
                this.actionType = 0;
                this.actionNext = 0;
                shared.hideLoading();
            })
            .catch(e => {
                this.sendingTx = false;
                utils.showAlert({e}.e);
            });
    }

    async sellCredits(amount){
        amount = this.web3.utils.toWei(amount.toString(), "ether");
        this.sendingTx = true;
        const txValues = await utils.getTxValues();

        let tx;
        tx = {
            to: Constants.LAUNCHPAD_CONTRACT_ADDRESS,
            data: txValues.iface.encodeFunctionData("sellToken(uint256)", [
                amount
            ])
        };

        txValues.signer.sendTransaction(tx)
            .then(() => {
                this.sendingTx = false;
                this.actionType = 0;
                this.actionNext = 0;
                shared.hideLoading();
            })
            .catch(e => {
                this.sendingTx = false;
                utils.showAlert({e}.e);
            });
    }

    async withdrawEther(amount){
        amount = this.web3.utils.toWei(amount.toString(), "ether");
        this.sendingTx = true;
        const txValues = await utils.getTxValues();

        let tx;
        tx = {
            to: Constants.LAUNCHPAD_CONTRACT_ADDRESS,
            data: txValues.iface.encodeFunctionData("withdrawEther(uint256)", [
                amount
            ])
        };

        txValues.signer.sendTransaction(tx)
            .then(() => {
                this.sendingTx = false;
                this.actionType = 0;
                shared.hideLoading();
            })
            .catch(e => {
                this.sendingTx = false;
                utils.showAlert({e}.e);
            });
    }

    async withdrawToken(amount){
        amount = this.web3.utils.toWei(amount.toString(), "ether");
        this.sendingTx = true;
        const txValues = await utils.getTxValues();

        let tx;
        tx = {
            to: Constants.LAUNCHPAD_CONTRACT_ADDRESS,
            data: txValues.iface.encodeFunctionData("withdrawToken(uint256)", [
                amount
            ])
        };

        txValues.signer.sendTransaction(tx)
            .then(() => {
                this.sendingTx = false;
                this.actionType = 0;
                shared.hideLoading();
            })
            .catch(e => {
                this.sendingTx = false;
                utils.showAlert({e}.e);
            });
    }

    async removeMailApprovals(){
        if(!index.address){
            index.showAddressError();
            return;
        }

        shared.showLoading();
        if(!index.creditsContract){
            index.creditsContract = await utils.getContract(Constants.CREDITS_CONTRACT_ADDRESS);
        }

        const allowance = await index.creditsContract.methods.allowance(index.address, Constants.MAIL_CONTRACT_ADDRESS).call();
        index.sendingTx = true;
        const txValues = await utils.getTxValues();

        let tx;
        tx = {
            to: Constants.CREDITS_CONTRACT_ADDRESS,
            data: txValues.iface.encodeFunctionData("decreaseAllowance(address,uint256)", [
                Constants.MAIL_CONTRACT_ADDRESS, allowance
            ])
        };

        txValues.signer.sendTransaction(tx)
            .then(() => {
                index.sendingTx = false;
                shared.hideLoading();
            })
            .catch(e => {
                index.sendingTx = false;
                utils.showAlert({e}.e);
            });
    }

    async removeLaunchpadApprovals(){
        if(!index.address){
            index.showAddressError();
            return;
        }

        shared.showLoading();
        if(!index.creditsContract){
            index.creditsContract = await utils.getContract(Constants.CREDITS_CONTRACT_ADDRESS);
        }

        const allowance = await index.creditsContract.methods.allowance(index.address, Constants.LAUNCHPAD_CONTRACT_ADDRESS).call();
        index.sendingTx = true;
        const txValues = await utils.getTxValues();

        let tx;
        tx = {
            to: Constants.CREDITS_CONTRACT_ADDRESS,
            data: txValues.iface.encodeFunctionData("decreaseAllowance(address,uint256)", [
                Constants.LAUNCHPAD_CONTRACT_ADDRESS, allowance
            ])
        };

        txValues.signer.sendTransaction(tx)
            .then(() => {
                index.sendingTx = false;
                shared.hideLoading();
            })
            .catch(e => {
                index.sendingTx = false;
                utils.showAlert({e}.e);
            });
    }

    async deleteAccount(){
        if(!index.address){
            index.showAddressError();
            return;
        }

        shared.showLoading();
        index.sendingTx = true;
        const txValues = await utils.getTxValues();

        let tx;
        tx = {
            to: Constants.MAIL_CONTRACT_ADDRESS,
            data: txValues.iface.encodeFunctionData("burnMailBox()", [])
        };

        txValues.signer.sendTransaction(tx)
            .then(() => {
                window.location.reload();
            })
            .catch(e => {
                index.sendingTx = false;
                utils.showAlert({e}.e);
            });
    }

    async createMailFeed(name, description, timeInSecs, extensionAddress, price, maxSubscribers){
        this.sendingTx = true;
        const txValues = await utils.getTxValues();

        let tx;
        tx = {
            to: Constants.MAIL_CONTRACT_ADDRESS,
            data: txValues.iface.encodeFunctionData("createMailFeed(string[2],uint256,address,uint256,uint256)", [
                [name, description], timeInSecs, extensionAddress, price, maxSubscribers
            ])
        };

        txValues.signer.sendTransaction(tx)
            .then(() => {
                this.sendingTx = false;
                index.hideDialog();
                shared.hideLoading();
            })
            .catch(e => {
                this.sendingTx = false;
                utils.showAlert({e}.e);
            });
    }

    async onApproveTokensFeedClicked(feedExtensionAddress, tokenAddress, amount){
        this.sendingTx = true;
        const txValues = await utils.getTxValues();

        let tx;
        tx = {
            to: tokenAddress,
            data: txValues.iface.encodeFunctionData("approve(address,uint256)", [
                feedExtensionAddress, amount
            ])
        };

        txValues.signer.sendTransaction(tx)
            .then(() => {
                this.sendingTx = false;
                shared.hideLoading();
            })
            .catch(e => {
                this.sendingTx = false;
                utils.showAlert({e}.e);
            });
    }

    async subscribeFeed(feedAddress, price, isPaymentWithToken){
        if(!isPaymentWithToken){
            const BN = this.web3.utils.BN;
            const balance = await this.web3.eth.getBalance(this.address);
            if((new BN(balance)).lt(new BN(price))){
                utils.showAlert("Error: the user balance is less than the feed price.");
                return;
            }
        }

        this.sendingTx = true;
        const txValues = await utils.getTxValues();

        let tx;
        tx = {
            to: feedAddress,
            value: isPaymentWithToken ? 0 : price,
            data: txValues.iface.encodeFunctionData("subscribe()", [])
        };

        txValues.signer.sendTransaction(tx)
            .then(() => {
                this.sendingTx = false;
                shared.hideLoading();
            })
            .catch(e => {
                this.sendingTx = false;
                utils.showAlert({e}.e);
            });
    }

    async unsubscribeFeed(feedAddress){
        index.sendingTx = true;
        const txValues = await utils.getTxValues();

        let tx;
        tx = {
            to: feedAddress,
            data: txValues.iface.encodeFunctionData("unsubscribe()", [])
        };

        txValues.signer.sendTransaction(tx)
            .then(() => {
                index.sendingTx = false;
                shared.hideLoading();
            })
            .catch(e => {
                index.sendingTx = false;
                utils.showAlert({e}.e);
            });
    }

    async onBlockAddressFeedClicked(){
        const status = !document.getElementById("block-address").checked;
        const feedAddress = document.getElementsByClassName("block-subscriber-feed-address")[0].value;
        if(!feedAddress){
            utils.showAlert("Error: invalid feed address.");
            return;
        }
        if(!(await index.checkFeedAddress(feedAddress))){
            return;
        }

        let address = document.getElementsByClassName("block-subscriber-address")[0].value;
        if(!utils.isAddress(address) && !index.signature){
            utils.showAlert("Error: you must sign in before using a nickname to block address.");
            return;
        }
        else{
            address = await index.getAddress(address);
            address = await utils.checkAddress(address);
            if(!address){
                utils.showAlert("Error: invalid address.");
                return;
            }
        }

        index.sendingTx = true;
        const txValues = await utils.getTxValues();

        let tx;
        tx = {
            to: feedAddress,
            data: txValues.iface.encodeFunctionData("blockAddress(address,bool)", [
                address, status
            ])
        };

        txValues.signer.sendTransaction(tx)
            .then(() => {
                index.sendingTx = false;
                shared.hideLoading();
            })
            .catch(e => {
                index.sendingTx = false;
                utils.showAlert({e}.e);
            });
    }

    async onRemoveSubscriberFeedClicked(){
        const feedAddress = document.getElementsByClassName("remove-subscriber-feed-address")[0].value;
        if(!feedAddress){
            utils.showAlert("Error: invalid feed address.");
            return;
        }
        if(!(await index.checkFeedAddress(feedAddress))){
            return;
        }

        let subscriberAddress = document.getElementsByClassName("remove-subscriber-subscriber-address")[0].value;
        if(!utils.isAddress(subscriberAddress) && !index.signature){
            utils.showAlert("Error: you must sign in before using a nickname to remove subscriber.");
            return;
        }
        else{
            subscriberAddress = await index.getAddress(subscriberAddress);
            subscriberAddress = await utils.checkAddress(subscriberAddress);
            if(!subscriberAddress){
                utils.showAlert("Error: invalid subscriber address.");
                return;
            }
        }

        index.sendingTx = true;
        const txValues = await utils.getTxValues();

        let tx;
        tx = {
            to: feedAddress,
            data: txValues.iface.encodeFunctionData("removeSubscriber(address)", [
                subscriberAddress
            ])
        };

        txValues.signer.sendTransaction(tx)
            .then(() => {
                index.sendingTx = false;
                shared.hideLoading();
            })
            .catch(e => {
                index.sendingTx = false;
                utils.showAlert({e}.e);
            });
    }

    async onSetTimeFeedClicked(){
        shared.showLoading();

        const feedAddress = document.getElementsByClassName("set-time-address")[0].value;
        if(!(await index.checkFeedAddress(feedAddress))){
            return;
        }
        const feedContract = await utils.getContract(feedAddress);
        const info = await feedContract.methods.getInfo().call();
        const price = info[2];
        const extensionAddress = await feedContract.methods.getExtensionInfo().call();

        const time = document.getElementsByClassName("feed-time")[0].value;
        if(isNaN(time) || parseInt(time) < 0 || !time || time === ""){
            utils.showAlert("Error: invalid time.");
            return;
        }

        index.sendingTx = true;
        const txValues = await utils.getTxValues();

        let tx;
        tx = {
            to: feedAddress,
            data: txValues.iface.encodeFunctionData("setInfo(address,uint256,uint256)", [
                extensionAddress, time, price
            ])
        };

        txValues.signer.sendTransaction(tx)
            .then(() => {
                index.sendingTx = false;
                shared.hideLoading();
            })
            .catch(e => {
                index.sendingTx = false;
                utils.showAlert({e}.e);
            });
    }

    async onSetExtensionAddressFeedClicked(){
        shared.showLoading();

        const feedAddress = document.getElementsByClassName("set-extension-feed-address")[0].value;
        if(!(await index.checkFeedAddress(feedAddress))){
            return;
        }
        const feedContract = await utils.getContract(feedAddress);
        const info = await feedContract.methods.getInfo().call();
        const time = info[0];
        const price = info[2];

        const extensionAddress = document.getElementsByClassName("set-extension-address")[0].value;
        if(extensionAddress !== Constants.ZERO_ADDRESS && !(await index.checkExtensionAddress(extensionAddress))){
            return;
        }

        index.sendingTx = true;
        const txValues = await utils.getTxValues();

        let tx;
        tx = {
            to: feedAddress,
            data: txValues.iface.encodeFunctionData("setInfo(address,uint256,uint256)", [
                extensionAddress, time, price
            ])
        };

        txValues.signer.sendTransaction(tx)
            .then(() => {
                index.sendingTx = false;
                shared.hideLoading();
            })
            .catch(e => {
                index.sendingTx = false;
                utils.showAlert({e}.e);
            });
    }

    async onSetPriceFeedClicked(){
        shared.showLoading();

        const feedAddress = document.getElementsByClassName("set-price-address")[0].value;
        if(!(await index.checkFeedAddress(feedAddress))){
            return;
        }
        const feedContract = await utils.getContract(feedAddress);
        const info = await feedContract.methods.getInfo().call();
        const time = info[0];
        let unit = "ether";
        const extensionAddress = await feedContract.methods.getExtensionInfo().call();
        if(extensionAddress !== Constants.ZERO_ADDRESS){
            const extensionContract = await utils.getContract(extensionAddress);
            const tokenDecimals = await extensionContract.methods.getTokenDecimals().call();
            unit = utils.findUnit(tokenDecimals, index.web3);
        }

        let price = document.getElementsByClassName("feed-price")[0].value;
        if(isNaN(price) || parseInt(price) < 0 || !price || price === ""){
            utils.showAlert("Error: invalid price.");
            return;
        }
        price = index.web3.utils.toWei(price, unit);

        index.sendingTx = true;
        const txValues = await utils.getTxValues();

        let tx;
        tx = {
            to: feedAddress,
            data: txValues.iface.encodeFunctionData("setInfo(address,uint256,uint256)", [
                extensionAddress, time, price
            ])
        };

        txValues.signer.sendTransaction(tx)
            .then(() => {
                index.sendingTx = false;
                shared.hideLoading();
            })
            .catch(e => {
                index.sendingTx = false;
                utils.showAlert({e}.e);
            });
    }

    async onRenewFeedClicked(){
        const feedAddress = document.getElementsByClassName("renew-feed-address")[0].value;
        if(!(await index.checkFeedAddress(feedAddress))){
            return;
        }

        index.sendingTx = true;
        const txValues = await utils.getTxValues();

        let tx;
        tx = {
            to: Constants.MAIL_CONTRACT_ADDRESS,
            data: txValues.iface.encodeFunctionData("renewMailFeeds(address[])", [
                [feedAddress]
            ])
        };

        txValues.signer.sendTransaction(tx)
            .then(() => {
                index.sendingTx = false;
                shared.hideLoading();
            })
            .catch(e => {
                index.sendingTx = false;
                utils.showAlert({e}.e);
            });
    }

    async onDeleteFeedClicked(){
        const feedAddress = document.getElementsByClassName("delete-feed-address")[0].value;
        if(!(await index.checkFeedAddress(feedAddress))){
            return;
        }

        index.sendingTx = true;
        const txValues = await utils.getTxValues();
        const mailFeeds = await index.mailContract.methods.getMailFeedsAddress().call();

        let tx;
        tx = {
            to: mailFeeds,
            data: txValues.iface.encodeFunctionData("deleteMailFeeds(address[])", [
                [feedAddress]
            ])
        };

        txValues.signer.sendTransaction(tx)
            .then(() => {
                index.sendingTx = false;
                shared.hideLoading();
            })
            .catch(e => {
                index.sendingTx = false;
                utils.showAlert({e}.e);
            });
    }

    async onWithdrawETHFeedClicked(){
        const feedAddress = document.getElementsByClassName("withdraw-eth-feed-address")[0].value;
        if(!(await index.checkFeedAddress(feedAddress))){
            return;
        }
        let amount = document.getElementsByClassName("withdraw-eth-feed-amount")[0].value;
        if(isNaN(amount) || parseInt(amount) < 0 || !amount || amount === ""){
            utils.showAlert("Error: invalid amount.");
            return;
        }
        amount = shared.getWei(amount, index.web3);
        if(!amount){
            return;
        }

        index.sendingTx = true;
        const txValues = await utils.getTxValues();

        let tx;
        tx = {
            to: feedAddress,
            data: txValues.iface.encodeFunctionData("withdrawEther(uint256)", [
                amount
            ])
        };

        txValues.signer.sendTransaction(tx)
            .then(() => {
                index.sendingTx = false;
                shared.hideLoading();
            })
            .catch(e => {
                index.sendingTx = false;
                utils.showAlert({e}.e);
            });
    }

    async onWithdrawTokenFeedClicked(){
        const feedAddress = document.getElementsByClassName("withdraw-token-feed-address")[0].value;
        if(!(await index.checkFeedAddress(feedAddress))){
            return;
        }
        let amount = document.getElementsByClassName("withdraw-token-feed-amount")[0].value;
        if(isNaN(amount) || parseInt(amount) < 0 || !amount || amount === ""){
            utils.showAlert("Error: invalid amount.");
            return;
        }

        const feedContract = await utils.getContract(feedAddress);
        const extensionAddress = await feedContract.methods.getExtensionInfo().call();
        if(extensionAddress !== Constants.ZERO_ADDRESS){
            const extensionContract = await utils.getContract(extensionAddress);
            const tokenDecimals = await extensionContract.methods.getTokenDecimals().call();
            const unit = utils.findUnit(tokenDecimals, index.web3);
            amount = index.web3.utils.toWei(amount.toString(), unit);
            const amountInHex = index.web3.utils.padLeft(index.web3.utils.toHex(amount), 64);
            let args = index.address;
            args = args + amountInHex.replace("0x","");

            index.sendingTx = true;
            const txValues = await utils.getTxValues();

            let tx;
            tx = {
                to: feedAddress,
                data: txValues.iface.encodeFunctionData("withdrawToken(bytes)", [
                    args
                ])
            };

            txValues.signer.sendTransaction(tx)
                .then(() => {
                    index.sendingTx = false;
                    shared.hideLoading();
                })
                .catch(e => {
                    index.sendingTx = false;
                    utils.showAlert({e}.e);
                });
        }
        else{
            utils.showAlert("Error: Feed without extension added.");
        }
    }

    async onSetFeeClicked(){
        if(!index.jwk){
            utils.showAlert("Error: you must sign in first.");
            return;
        }

        shared.showLoading();
        let fee = document.getElementsByClassName("fee")[1].value;
        fee = shared.getWei(fee, index.web3);
        if(!fee){
            return;
        }
        const status = document.getElementById("always-paid").checked;

        const extensionAddress = await index.mailContract.methods.getExtensionInfo(index.address).call();
        index.sendingTx = true;
        const txValues = await utils.getTxValues();

        let tx;
        tx = {
            to: Constants.MAIL_CONTRACT_ADDRESS,
            data: txValues.iface.encodeFunctionData("setFee(address,uint256,bool,address,bool)", [
                extensionAddress, fee, status, Constants.ZERO_ADDRESS, false
            ])
        };

        txValues.signer.sendTransaction(tx)
            .then(() => {
                index.sendingTx = false;
                shared.hideLoading();
            })
            .catch(e => {
                index.sendingTx = false;
                utils.showAlert({e}.e);
            });
    }

    async onSetFreeMailClicked(){
        shared.showLoading();
        let address = document.getElementsByClassName("free-address")[0].value;
        address = await index.getAddress(address);
        address = await utils.checkAddress(address);
        if(!address){
            utils.showAlert("Error: invalid address.");
            return;
        }
        const status = !document.getElementById("free-mails").checked;

        const mailBoxInfo = await index.mailContract.methods.getMailBoxInfo(index.address).call();
        const feeInfo = mailBoxInfo[2];
        const isPaidInfo = mailBoxInfo[3];
        const extensionAddress = await index.mailContract.methods.getExtensionInfo(index.address).call();
        index.sendingTx = true;
        const txValues = await utils.getTxValues();

        let tx;
        tx = {
            to: Constants.MAIL_CONTRACT_ADDRESS,
            data: txValues.iface.encodeFunctionData("setFee(address,uint256,bool,address,bool)", [
                extensionAddress, feeInfo, isPaidInfo, address, status
            ])
        };

        txValues.signer.sendTransaction(tx)
            .then(() => {
                index.sendingTx = false;
                shared.hideLoading();
            })
            .catch(e => {
                index.sendingTx = false;
                utils.showAlert({e}.e);
            });
    }

    async onSetRating(rating){
        shared.showLoading();
        if(parseInt(rating) < 1 || parseInt(rating) > 10){
            utils.showAlert("Error: invalid rating.");
            return;
        }
        index.hideDialog();

        this.sendingTx = true;
        const txValues = await utils.getTxValues();

        let tx;
        tx = {
            to: this.subscriptionAddress,
            data: txValues.iface.encodeFunctionData("setRating(uint8)", [
                rating
            ])
        };
        this.subscriptionAddress = "";

        txValues.signer.sendTransaction(tx)
            .then(() => {
                this.sendingTx = false;
                shared.hideLoading();
            })
            .catch(e => {
                this.sendingTx = false;
                utils.showAlert({e}.e);
            });
    }

    async onAddContact(symbol, address, nickname){
        shared.showLoading();
        const privateKey = utils.get32BytesPassword(this.signature, this.address);
        const encryptedAddress = await aes.encryptData(address, privateKey);
        const encryptedNickname = await aes.encryptData(nickname, privateKey);
        address = address.toString().trim().toLowerCase();
        nickname = utils.getNameNormalized(nickname);
        const addressToNickname = await utils.getSha256(symbol.toString().trim().toLowerCase() + address + this.signature);
        const nicknameToAddress = await utils.getSha256(symbol.toString().trim().toLowerCase() + nickname + this.signature);

        this.sendingTx = true;
        const txValues = await utils.getTxValues();

        let tx;
        tx = {
            to: Constants.MAIL_CONTRACT_ADDRESS,
            data: txValues.iface.encodeFunctionData("addContact(address,string[5])", [
                Constants.CONTACTS_ADDRESS, [symbol, encryptedAddress, encryptedNickname, addressToNickname, nicknameToAddress]
            ])
        };

        txValues.signer.sendTransaction(tx)
            .then(() => {
                this.sendingTx = false;
                shared.hideLoading();
            })
            .catch(e => {
                this.sendingTx = false;
                utils.showAlert({e}.e);
            });
    }

    async editContact(symbol, address, nickname){
        const privateKey = utils.get32BytesPassword(this.signature, this.address);
        const encryptedAddress = await aes.encryptData(address, privateKey);
        const encryptedNickname = await aes.encryptData(nickname, privateKey);
        address = address.toString().trim().toLowerCase();
        nickname = utils.getNameNormalized(nickname);
        const addressToNickname = await utils.getSha256(symbol.toString().trim().toLowerCase() + address + this.signature);
        const nicknameToAddress = await utils.getSha256(symbol.toString().trim().toLowerCase() + nickname + this.signature);

        const contacts = await this.contactsContract.methods.getContacts(this.address, "", this.idContact, 1).call();
        const contact = contacts[0];
        const oldSymbol = contact[1];
        let oldAddress = contact[2];
        let oldNickname = contact[3];
        oldAddress = await aes.decryptData(oldAddress, privateKey);
        oldNickname = await aes.decryptData(oldNickname, privateKey);
        const oldAddressToNickname = await utils.getSha256(oldSymbol.toString().trim().toLowerCase() + oldAddress.toString().trim().toLowerCase() + this.signature);
        const oldNicknameToAddress = await utils.getSha256(oldSymbol.toString().trim().toLowerCase() + utils.getNameNormalized(oldNickname) + this.signature);

        this.sendingTx = true;
        const txValues = await utils.getTxValues();

        let tx;
        tx = {
            to: Constants.CONTACTS_ADDRESS,
            data: txValues.iface.encodeFunctionData("setContact(uint256,string[7])", [
                this.idContact, [symbol, encryptedAddress, encryptedNickname, addressToNickname, nicknameToAddress,
                    oldAddressToNickname, oldNicknameToAddress]
            ])
        };
        this.idContact = 0;

        txValues.signer.sendTransaction(tx)
            .then(() => {
                this.sendingTx = false;
                shared.hideLoading();
            })
            .catch(e => {
                this.sendingTx = false;
                utils.showAlert({e}.e);
            });
    }

    async removeContacts(ids, args){
        this.sendingTx = true;
        const txValues = await utils.getTxValues();

        let tx;
        tx = {
            to: Constants.CONTACTS_ADDRESS,
            data: txValues.iface.encodeFunctionData("removeContacts(uint256[],string[])", [
                ids, args
            ])
        };

        txValues.signer.sendTransaction(tx)
            .then(() => {
                this.removeSelects();
                this.sendingTx = false;
                shared.hideLoading();
            })
            .catch(e => {
                this.sendingTx = false;
                utils.showAlert({e}.e);
            });
    }

    async sendMoney(tokenAddress, to, amount){
        shared.showLoading();
        this.sendingTx = true;
        const txValues = await utils.getTxValues();

        let tx;
        if(tokenAddress){
            tx = {
                to: tokenAddress,
                data: txValues.iface.encodeFunctionData("transfer(address,uint256)", [
                    to, amount
                ])
            };
        }
        else{
            tx = {
                to: to,
                value: amount
            };
        }

        txValues.signer.sendTransaction(tx)
            .then(() => {
                this.sendingTx = false;
                shared.hideLoading();
            })
            .catch(e => {
                this.sendingTx = false;
                utils.showAlert({e}.e);
            });
    }

    async checkBalanceToBuy(){
        let balance = await this.creditsContract.methods.balanceOf(this.address).call();
        balance = parseInt(this.web3.utils.fromWei(balance.toString(), "ether")) - this.credits;

        if(this.oldValue === undefined){
            this.oldValue = balance;
        }

        this.oldBalanceTimeoutId = setTimeout(async () => {
           if(this.oldValue === balance){
               this.checkBalanceToBuy().catch(e => utils.showAlert(e));
           }
           else{
               this.sendingTx = false;
               this.oldValue = undefined;
               if(this.actionType === Constants.ACTION_ADD_CREDITS){
                   this.showAddCreditsDialog(Constants.ACTION_ADD_CREDITS).catch(e => utils.showAlert(e));
               }
               else if(this.actionType === Constants.ACTION_ADD_CREDITS_TO_CONTACTS){
                   this.showAddCreditsToContactsDialog().catch(e => utils.showAlert(e));
               }
               shared.hideLoading();
           }
        }, Constants.CHECK_BALANCE_TIMEOUT);
    }

    async checkCreditsToDeposit(){
        let allowance = await this.creditsContract.methods.allowance(this.address, Constants.LAUNCHPAD_CONTRACT_ADDRESS).call();
        allowance = parseInt(this.web3.utils.fromWei(allowance.toString(), "ether"));

        if(this.oldValue === undefined){
            this.oldValue = allowance;
        }

        this.oldCreditsToDepositTimeoutId = setTimeout(async () => {
            if(this.oldValue === allowance){
                this.checkCreditsToDeposit().catch(e => utils.showAlert(e));
            }
            else{
                this.sendingTx = false;
                this.oldValue = undefined;
                this.showDepositCreditsDialog().catch(e => utils.showAlert(e));
                shared.hideLoading();
            }
        }, Constants.CHECK_VALUES_TIMEOUT);
    }

    async checkCreditsToSell(){
        let allowance = await this.creditsContract.methods.allowance(this.address, Constants.LAUNCHPAD_CONTRACT_ADDRESS).call();
        allowance = parseInt(this.web3.utils.fromWei(allowance.toString(), "ether"));

        if(this.oldValue === undefined){
            this.oldValue = allowance;
        }

        this.oldCreditsToSellTimeoutId = setTimeout(async () => {
            if(this.oldValue === allowance){
                this.checkCreditsToSell().catch(e => utils.showAlert(e));
            }
            else{
                this.sendingTx = false;
                this.oldValue = undefined;
                this.showSellCreditsDialog().catch(e => utils.showAlert(e));
                shared.hideLoading();
            }
        }, Constants.CHECK_VALUES_TIMEOUT);
    }

    async checkBalanceToUseCredits(){
        let allowance = await this.creditsContract.methods.allowance(this.address, Constants.MAIL_CONTRACT_ADDRESS).call();
        allowance = parseInt(this.web3.utils.fromWei(allowance.toString(), "ether"));

        if(this.oldValue === undefined){
            this.oldValue = allowance;
        }

        this.oldBalanceTimeoutId = setTimeout(async () => {
            if(this.oldValue === allowance && allowance < 1){
                this.checkBalanceToUseCredits().catch(e => utils.showAlert(e));
            }
            else{
                this.sendingTx = false;
                this.oldValue = undefined;
                this.actionType = 0;
                shared.hideLoading();
                this.showNowYouCanSendMailDialog();

            }
        }, Constants.CHECK_BALANCE_TIMEOUT);
    }

    getChecked(array, selected){
        for(let i=0;i<array.length;i++){
            const mail = array[i];
            const selectedId = JSON.stringify({id: mail.id, uri: mail.uri, from: mail.addressFrom, to: mail.addressTo});
            if(selected[selectedId]){
                array[i].checked = true;
            }
        }
        return array;
    }

    getItemChecked(array, selected){
        for(let i=0;i<array.length;i++){
            const item = array[i];
            const selectedId = item.address;
            if(selected[selectedId]){
                array[i].checked = true;
            }
        }
        return array;
    }

    getContactChecked(array, selected){
        for(let i=0;i<array.length;i++){
            const item = array[i];
            const selectedId = JSON.stringify({id: item.id, info: item.info});
            if(selected[selectedId]){
                array[i].checked = true;
            }
        }
        return array;
    }

    checkBackupStatus(isBackedUp){
        if(isBackedUp){
            document.getElementsByClassName('backup')[0].classList.remove("btn-primary");
            document.getElementsByClassName('backup')[0].classList.add("btn-secondary");
        }
        else{
            document.getElementsByClassName('backup')[0].classList.remove("btn-secondary");
            document.getElementsByClassName('backup')[0].classList.add("btn-primary");
        }
    }

    setAccountAddress(){
        const end = this.address.substring(this.address.length-Constants.FROM_TO_END_LENGTH);
        document.getElementsByClassName('account')[0].innerHTML = utils.getEllipsis(this.address, Constants.ADDRESS_MAX_LENGTH, end);
    }

    async checkValues(){
        await index.getCredits();
        await index.getDeFiValues();
        clearTimeout(index.creditsTimeoutId);
        index.creditsTimeoutId = setTimeout(() => {
            index.checkValues();
        }, Constants.CHECK_VALUES_TIMEOUT);
    }

    async getCredits(onInit){
        if(!index.address){
            if(!onInit){
                index.showAddressError();
            }
            return;
        }

        if(!index.creditsContract){
            index.creditsContract = await utils.getContract(Constants.CREDITS_CONTRACT_ADDRESS);
        }

        const balance = await index.creditsContract.methods.balanceOf(index.address).call();
        let formattedCredits = "0";
        if(index.web3.utils.fromWei(balance.toString(), "ether") >= Constants.MIN_CREDITS){
            index.credits = await index.creditsContract.methods.allowance(index.address, Constants.MAIL_CONTRACT_ADDRESS).call();
            index.credits = index.web3.utils.fromWei(index.credits.toString(), "ether");
            const formatter = Intl.NumberFormat('en', {notation: 'compact', maximumSignificantDigits: Constants.MAX_SIGNIFICANT_DIGITS});
            formattedCredits = formatter.format(parseInt(index.credits));
        }
        else{
            index.credits = 0;
        }
        document.getElementsByClassName('credits')[0].innerHTML = formattedCredits + "&nbsp;";
    }

    async getCreditsPrice(){
        if(!this.launchpadContract){
            this.launchpadContract = await utils.getContract(Constants.LAUNCHPAD_CONTRACT_ADDRESS);
        }

        this.price = await this.launchpadContract.methods.getCreditsPrice().call();
        this.price = this.web3.utils.fromWei(this.price.toString(), "ether");
    }

    async setTotalPrice(creditsAmount){
        if(!isNaN(creditsAmount) && parseFloat(creditsAmount) > 0 && creditsAmount && creditsAmount !== ""){
            if(!index.launchpadContract){
                index.launchpadContract = await utils.getContract(Constants.LAUNCHPAD_CONTRACT_ADDRESS);
            }

            const total = parseFloat(creditsAmount) * parseFloat(index.price);
            document.getElementsByClassName("total-label")[0].innerHTML = "Total:&nbsp;";
            document.getElementsByClassName("total")[1].innerHTML = total.toFixed(Constants.MAX_LENGTH_PRICE) + "&nbsp;" + Constants.DEFAULT_TOKEN_SYMBOL;
            this.creditsAmount = creditsAmount;
        }
        else{
            document.getElementsByClassName("total-label")[0].innerHTML = "Total:&nbsp;";
            document.getElementsByClassName("total")[1].innerHTML = "0&nbsp;" + Constants.DEFAULT_TOKEN_SYMBOL;
            this.creditsAmount = 0;
        }
    }

    async getDeFiValues(){
        if(!this.address){
            this.showAddressError();
            return;
        }

        if(!this.creditsContract){
            this.creditsContract = await utils.getContract(Constants.CREDITS_CONTRACT_ADDRESS);
        }

        if(!this.launchpadContract){
            this.launchpadContract = await utils.getContract(Constants.LAUNCHPAD_CONTRACT_ADDRESS);
        }

        let totalApproved = await this.creditsContract.methods.allowance(this.address, Constants.LAUNCHPAD_CONTRACT_ADDRESS).call();
        totalApproved = this.web3.utils.fromWei(totalApproved.toString(), "ether");
        document.getElementsByClassName('total-approved')[0].innerHTML = "<label class='fw-semibold'>" + totalApproved + "&nbsp;" + Constants.CREDITS_SYMBOL + "s</label>";

        document.getElementsByClassName('credits-price')[0].innerHTML = "<label class='fw-semibold'>" + this.price + "&nbsp;" + Constants.DEFAULT_TOKEN_SYMBOL + "</label>";
        const price = this.web3.utils.toWei(this.price.toString(), "ether");
        let minAmount = await this.launchpadContract.methods.getMinCreditsAmount().call();
        minAmount = this.web3.utils.fromWei(minAmount.toString(), "ether");
        const totalDeposited = await this.launchpadContract.methods.getTotalDeposits(this.address).call();
        const totalCreditsToWithdraw = this.web3.utils.fromWei(totalDeposited.toString(), "ether");
        document.getElementsByClassName('min-amount')[0].innerHTML = "<label class='fw-semibold'>" + minAmount + "&nbsp;" + Constants.CREDITS_SYMBOL + "s</label>";
        document.getElementsByClassName('total-token-withdraw')[0].innerHTML = "<label class='fw-semibold'>" + totalCreditsToWithdraw + "&nbsp;" + Constants.CREDITS_SYMBOL + "s</label>";

        let totalETHToWithdraw = ((await utils.getBigNumber(totalDeposited)).mul(await utils.getBigNumber(price))).div(await utils.getBigNumber(this.web3.utils.toWei("1", "ether")));
        totalETHToWithdraw = this.web3.utils.fromWei(totalETHToWithdraw.toString(), "ether");
        let available = await this.web3.eth.getBalance(Constants.LAUNCHPAD_CONTRACT_ADDRESS);
        available = this.web3.utils.fromWei(available.toString(), "ether");
        const value = parseFloat(available) < parseFloat(totalETHToWithdraw) ? available : totalETHToWithdraw;
        document.getElementsByClassName('label-total-eth-withdraw')[0].innerHTML = "Total&nbsp;" + Constants.DEFAULT_TOKEN_SYMBOL + "s to Withdraw:&nbsp;";
        document.getElementsByClassName('total-eth-withdraw')[0].innerHTML = "<label class='fw-semibold'>" + value + "&nbsp;" + Constants.DEFAULT_TOKEN_SYMBOL + "s</label>";

        let balance = await this.creditsContract.methods.balanceOf(Constants.LAUNCHPAD_CONTRACT_ADDRESS).call();
        balance = this.web3.utils.fromWei(balance.toString(), "ether");
        document.getElementsByClassName('total-token-stored')[0].innerHTML = "<label class='fw-semibold'>" + balance + "&nbsp;" + Constants.CREDITS_SYMBOL + "s</label>";
        document.getElementsByClassName('label-total-eth-stored')[0].innerHTML = "Total&nbsp;" + Constants.DEFAULT_TOKEN_SYMBOL + "s Stored in Contract:&nbsp;";
        document.getElementsByClassName('total-eth-stored')[0].innerHTML = "<label class='fw-semibold'>" + available + "&nbsp;" + Constants.DEFAULT_TOKEN_SYMBOL + "s</label>";
    }

    disableSignInButton(){
        document.getElementsByClassName("sign-in")[0].classList.add("shadow-none");
        utils.disableButton("sign-in", 0);
        document.getElementsByClassName('sign-in-text')[0].innerHTML = "Signed In";
    }

    showAddressError(){
        utils.showAlert("Error: connect to MetaMask first.");
        if(window.ethereum){
            window.ethereum.on('accountsChanged', (accounts) => {
                if (accounts.length === 0) {
                    utils.showAlert('Error: please connect to MetaMask.');
                }
                else{
                    this.address = accounts[0];
                    window.location.reload();
                }
            });
        }
    }

    async checkExtensionAddress(extensionAddress){
        try{
            const extensionFeedContract = await utils.getContract(extensionAddress);
            const tokenAddress = await extensionFeedContract.methods.getTokenAddress().call();
            if(tokenAddress === ""){
                utils.showAlert("Error: invalid token address.");
                return false;
            }
            else {
                const feedAddress = await extensionFeedContract.methods.getFeedAddress().call();
                if(feedAddress !== Constants.ZERO_ADDRESS) {
                    utils.showAlert("Error: Feed extension already used.");
                    return false;
                }
                else{
                    return true;
                }
            }
        }
        catch (e) {
            utils.showAlert("Error: invalid extension address.");
            return false;
        }
    }

    async checkFeedAddress(feedAddress){
        try{
            const feedContract = await utils.getContract(feedAddress);
            const owner = await feedContract.methods.owner().call();
            return owner === this.address;
        }
        catch (e) {
            utils.showAlert("Error: invalid Feed address.");
            return false;
        }
    }

    async checkTokenAddress(tokenAddress){
        try{
            const tokenContract = await utils.getContract(tokenAddress);
            await tokenContract.methods.balanceOf(this.address).call();
            await tokenContract.methods.allowance(this.address, this.address).call();
            await tokenContract.methods.symbol().call();
            return true;
        }
        catch (e) {
            utils.showAlert("Error: invalid Token address.");
            return false;
        }
    }

    disableComposeMailControls(status, feeDisabled){
        document.getElementsByClassName('fee')[0].disabled = feeDisabled;
        document.getElementsByClassName('subject')[0].disabled = status;
        document.getElementsByClassName('send')[0].disabled = status;
        document.getElementsByClassName('btn-attach-file')[0].classList.add("disabled");
        document.getElementsByClassName('to')[0].disabled = !status;
        document.getElementById('editor').disabled = status;
        this.writeMessage.enable(false);
        if(!status){
            document.getElementsByClassName('btn-attach-file')[0].classList.remove("disabled");
            document.getElementsByClassName('ok')[0].innerHTML = "Change Address";
            document.getElementsByClassName('subject')[0].focus();
            this.writeMessage.enable(true);
        }
    }

    setPKName(filename){
        filename = index.getFileName(filename);
        document.getElementsByClassName("filename-pk")[0].innerHTML = "Imported " + filename.fileName + "." + filename.extension;
    }

    disableMailControls(status){
        document.getElementsByClassName('to')[0].disabled = status;
        if(status){
            document.getElementsByClassName('ok')[0].innerHTML = "Change Address";
        }
        else{
            document.getElementsByClassName('ok')[0].innerHTML = "OK";
        }
    }

    onCookieClicked(){
        utils.setCookie("allowed-cookie","true", Constants.COOKIE_EXPIRY_TIME);
        const isWelcome = utils.getCookie("welcome");
        if(!isWelcome || isWelcome === "false" || isWelcome === ""){
            index.showWelcomeDialog();
        }
        else{
            if(index.actionType === Constants.ACTION_CONNECT){
                index.showConnectWalletDialog();
            }
            else{
                index.hideDialog();
            }
        }
    }

    onWelcomeClicked(){
        utils.setCookie("welcome","true");
        if(index.actionType === Constants.ACTION_CONNECT){
            index.showConnectWalletDialog();
        }
        else{
            index.hideDialog();
        }
    }

    async sendEncryptedPK(text, signHash){
        const url = Constants.IPFS_SERVER_URL + "replace-user";
        return fetch(url, {
            body: JSON.stringify({
                text: text,
                signHash: signHash,
                address: this.address,
                termsMessage: this.termsMessage,
                termsSign: this.termsSign,
            }),
            method: 'post',
            headers: {
                'Content-Type': 'application/json',
            },
        }).then(async function(response) {
            return await utils.returnResponse(response);
        }).catch(error => {
            return Promise.reject(error);
        });
    }

    async getEncryptedPK(signHash){
        const url = Constants.IPFS_SERVER_URL + "get-user" + "?";
        return fetch(url + new URLSearchParams({
            signHash: signHash,
            table: "users",
        }), {
            method: 'get',
            headers: {
                'Content-Type': 'application/json',
            },
        }).then(async function(response) {
            return await utils.returnResponse(response);
        }).catch(error => {
            return Promise.reject(error);
        });
    }

    async getTerms(signHash){
        const url = Constants.IPFS_SERVER_URL + "get-terms" + "?";
        return fetch(url + new URLSearchParams({
            address: this.address,
            signHash: signHash
        }), {
            method: 'get',
            headers: {
                'Content-Type': 'application/json',
            },
        }).then(async function(response) {
            return await utils.returnResponse(response);
        }).catch(error => {
            return Promise.reject(error);
        });
    }

    async sendTerms(message, termsSign){
        const url = Constants.IPFS_SERVER_URL + "post-terms";
        return fetch(url, {
            body: JSON.stringify({
                message: message,
                termsSign: termsSign,
                address: this.address,
            }),
            method: 'post',
            headers: {
                'Content-Type': 'application/json',
            },
        }).then(async function(response) {
            return await utils.returnResponse(response);
        }).catch(error => {
            return Promise.reject(error);
        });
    }

    async sendText(text, status){
        const url = Constants.IPFS_SERVER_URL + "add";
        return fetch(url, {
            body: JSON.stringify({
                text: text,
                status: status,
            }),
            method: 'post',
            headers: {
                'Content-Type': 'application/json',
            },
        }).then(async function(response) {
            return await utils.returnResponse(response);
        }).catch(error => {
            return Promise.reject(error);
        });
    }

    async getTexts(cids){
        const url = Constants.IPFS_SERVER_URL + "cats" + "?";
        return fetch(url + new URLSearchParams({
            cids: cids,
        }), {
            method: 'get',
            headers: {
                'Content-Type': 'application/json',
            },
        }).then(async function(response) {
            return await utils.returnResponse(response);
        }).catch(error => {
            return Promise.reject(error);
        });
    }

    async getFile(cid, ext){
        const url = Constants.IPFS_SERVER_URL + "file" + "?";
        return fetch(url + new URLSearchParams({
            cid: cid,
            ext: ext,
        }), {
            method: 'get',
            headers: {
                'Content-Type': 'application/json',
            },
        }).then(async function(response) {
            return await utils.returnResponse(response);
        }).catch(error => {
            return Promise.reject(error);
        });
    }

    async setStatus(id, cid, status, signHash, option){
        const url = Constants.IPFS_SERVER_URL + "post-status";
        return fetch(url, {
            body: JSON.stringify({
                id: id,
                cid: cid,
                status: status,
                signHash: signHash,
                address: this.address,
                option: option,
            }),
            method: 'post',
            headers: {
                'Content-Type': 'application/json',
            },
        }).then(async function(response) {
            return await utils.returnResponse(response);
        }).catch(error => {
            return Promise.reject(error);
        });
    }

    async setStatuses(ids, cids, status, signHash, option){
        const url = Constants.IPFS_SERVER_URL + "post-statuses";
        return fetch(url, {
            body: JSON.stringify({
                ids: ids,
                cids: cids,
                status: status,
                signHash: signHash,
                address: this.address,
                option: option,
            }),
            method: 'post',
            headers: {
                'Content-Type': 'application/json',
            },
        }).then(async function(response) {
            return await utils.returnResponse(response);
        }).catch(error => {
            return Promise.reject(error);
        });
    }

    async setBackedUpStatus(status, signHash){
        const url = Constants.IPFS_SERVER_URL + "update-status";
        return fetch(url, {
            body: JSON.stringify({
                status: status,
                signHash: signHash,
                address: this.address,
            }),
            method: 'post',
            headers: {
                'Content-Type': 'application/json',
            },
        }).then(async function(response) {
            return await utils.returnResponse(response);
        }).catch(error => {
            return Promise.reject(error);
        });
    }

    async deleteAccountServer(signHash, message, signature){
        const url = Constants.IPFS_SERVER_URL + "delete-account";
        return fetch(url, {
            body: JSON.stringify({
                address: this.address,
                signHash: signHash,
                message: message,
                signature: signature,
            }),
            method: 'post',
            headers: {
                'Content-Type': 'application/json',
            },
        }).then(async function(response) {
            return await utils.returnResponse(response);
        }).catch(error => {
            return Promise.reject(error);
        });
    }

    async downloadLink(link){
        return fetch(link, {
            method: 'get',
        }).then(async function(response) {
            if(response.status === 200){
                return response.text();
            }
            else{
                const error = {
                    status: response.status,
                    message: "Fetch error",
                    response: await response.text()
                }
                return Promise.reject(error);
            }
        }).catch(error => {
            return Promise.reject(error);
        });
    }

    async sendFee(id, date, hour, value, symbol, isMixed, signHash){
        const url = Constants.IPFS_SERVER_URL + "post-fee";
        return fetch(url, {
            body: JSON.stringify({
                id: id,
                date: date,
                hour: hour,
                value: value,
                symbol: symbol,
                isMixed: isMixed,
                address: this.address,
                signHash: signHash,
                option: this.option,
            }),
            method: 'post',
            headers: {
                'Content-Type': 'application/json',
            },
        }).then(async function(response) {
            return await utils.returnResponse(response);
        }).catch(error => {
            return Promise.reject(error);
        });
    }

    async getFee(id){
        const url = Constants.IPFS_SERVER_URL + "get-fee" + "?";
        return fetch(url + new URLSearchParams({
            address: this.address,
            id: id,
            option: this.option,
        }), {
            method: 'get',
            headers: {
                'Content-Type': 'application/json',
            },
        }).then(async function(response) {
            return await utils.returnResponse(response);
        }).catch(error => {
            return Promise.reject(error);
        });
    }

    async getMailBox(signHash){
        const url = Constants.IPFS_SERVER_URL + "get-mailbox";
        return fetch(url, {
            body: JSON.stringify({
                address: this.address,
                signHash: signHash,
            }),
            method: 'post',
            headers: {
                'Content-Type': 'application/json',
            },
        }).then(async function(response) {
            return await utils.returnResponse(response);
        }).catch(error => {
            return Promise.reject(error);
        });
    }
}
const index = new Index();
export {index};