"use strict";

class Constants{
    static DEFAULT_IPFS_SERVER_URL = "https://mail.hashbox.app:8444/";
    static IPFS_SERVER_URL = Constants.DEFAULT_IPFS_SERVER_URL;
    static IS_LOCALHOST = false;
    static USE_DYNAMIC_LENGTH = true;
    static DEFAULT_LENGTH = 1000;
    static TYPE_INFURA = 0;
    static TYPE_ALCHEMY = 1;
    static TYPE_BINANCE = 2;
    static TYPE_GETBLOCK = 3;
    static TYPE_ANKR = 4;
    static TYPE_POLYGON = 5;
    static TOTAL_DECIMALS_EVM = 18;
    static ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
    static CREDITS_CONTRACT_ADDRESS = "0x52C65C17F538a194fdb163e54482082642467A1E";
    static LAUNCHPAD_CONTRACT_ADDRESS = "0xBcda69fDD807E5e2c2fdbc01E04aDe79f93260E9";
    static MAIL_CONTRACT_ADDRESS = "0x0ab0989084cBA9cE02EcD36D02A4FF322f1cBF5F";
    static CONTACTS_ADDRESS = "0xA242C2e7Cf279D2bb34B434CaeC710F1b722f5AA";
    static PARTNER_MAIL_EXTENSION = "";
    static CREATE_MAIL_ERC721_EXTENSION = "";
    static TOKEN_CONTRACT_0_ADDRESS = "";
    static TOKEN_CONTRACT_1_ADDRESS = Constants.CREDITS_CONTRACT_ADDRESS;
    static TOKEN_CONTRACT_2_ADDRESS = "0xc2132D05D31c914a87C6611C10748AEb04B58e8F";
    static TOKEN_CONTRACT_3_ADDRESS = "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174";
    static TOKEN_CONTRACT_4_ADDRESS = "0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6";
    static DEFAULT_RPC_PROVIDER = "https://polygon.llamarpc.com";
    static RPC_PROVIDER = Constants.DEFAULT_RPC_PROVIDER;
    static ALG_KEY = "RSA-OAEP-256";
    static ALG_MSG = "AES-GCM-256";
    static FROM_TO_MAX_LENGTH = 11;
    static FROM_TO_END_LENGTH = 3;
    static ETH_MAX_LENGTH = 11;
    static ADDRESS_MAX_LENGTH = 15;
    static ADDRESS_MIN_LENGTH = 12;
    static FEED_NAME_MAX_LENGTH = 45;
    static SIGN_IN_MESSAGE = "DO NOT SHOW YOUR HASHBOX MAIL SIGNATURE TO ANYONE.\n\nSign in to HashBox Mail.";
    static TERMS_VERSION = 1.0;
    static TERMS_MESSAGE = "By signing this message, you agree to HashBox's Terms of Services and acknowledge that you have read and understood the HashBox Privacy Policy.\n\n{\"Version\": " + Constants.TERMS_VERSION + ", \"Signed\": ";
    static DELETION_MESSAGE = "By signing this message, you agree that all received messages and files will be deleted from the database (including your mail private key) and you won't be able to read or download them anymore.\n\nAre you sure?\n\nSigned at: ";
    static SUBJECT_MAX_LENGTH = 45;
    static ITEMS_OFFSET = 9;
    static CHECK_NEW_MAILS_TIMEOUT = 15000;
    static OPTION_INBOX = 0;
    static OPTION_SENT = 1;
    static OPTION_ALL_MAIL = 2;
    static OPTION_TRASH = 3;
    static OPTION_BLOCKED_USERS = 4;
    static OPTION_FEEDS = 5;
    static OPTION_SUBSCRIPTIONS = 6;
    static OPTION_CONTACTS = 7;
    static OPTION_SEARCH_MAIL = 8;
    static MAX_CHARACTERS_SUBJECT_DELETE_MAIL = 40;
    static DEFAULT_TOKEN_NAME = "Polygon";
    static DEFAULT_TOKEN_SYMBOL = "MATIC";
    static CREDITS_SYMBOL = "HBM";
    static DEFAULT_SUBJECT_ACCOUNT_CREATION = "Welcome to HashBox Mail";
    static DEFAULT_MESSAGE_ACCOUNT_CREATION = "Congratulations, you received and sent your first HashBox Mail!";
    static CHECK_VALUES_TIMEOUT = 15000;
    static MIN_CREDITS = 1;
    static MIN_CONTACTS_CREDITS = 10;
    static MAX_LENGTH_PRICE = 9;
    static CHECK_BALANCE_TIMEOUT = 15000;
    static ACTION_ADD_CREDITS = 1;
    static ACTION_BUY_CREDITS = 2;
    static ACTION_APPROVE_TO_DEPOSIT_CREDITS = 3;
    static ACTION_DEPOSIT_CREDITS = 4;
    static ACTION_SELL_CREDITS = 5;
    static ACTION_WITHDRAW_ETHER = 6;
    static ACTION_WITHDRAW_TOKEN = 7;
    static ACTION_CREATE_FEED = 8;
    static ACTION_APPROVE_TOKENS = 9;
    static ACTION_SET_RATING = 10;
    static ACTION_ADD_CREDITS_TO_CONTACTS = 11;
    static ACTION_ADD_CONTACT = 12;
    static ACTION_EDIT_CONTACT = 13;
    static ACTION_SIGNUP = 14;
    static ACTION_CONNECT = 15;
    static ACTION_ADD_CREDITS_TO_SEND_MAIL = 16;
    static ACTION_ADD_CREDITS_TO_FEEDS = 17;
    static ACTION_CREATE_EXTENSION_WARNING = 18;
    static FILENAME_MAX_LENGTH = 16;
    static EXTENSION_LENGTH = 3;
    static NETWORK_MAX_LENGTH = 8;
    static ADDRESS_CONTACT_MAX_LENGTH = 11;
    static NICKNAME_CONTACT_MAX_LENGTH = 50;
    static MAX_FILE_SIZE = 1024 * 1024;
    static MAX_MAIL_SIZE = 2 * 1024 * 1024;
    static NO_METAMASK_TITLE = "MetaMask is not installed or enabled";
    static NO_METAMASK = 'This website works on the blockchain and you need a provider for it.<br>Please install or enable MetaMask extension (add-on).<br>Click on the link below to download:';
    static METAMASK_DOWNLOAD_URL = 'https://metamask.io/download';
    static COOKIE_EXPIRY_TIME = 180;
    static MAX_SIGNIFICANT_DIGITS = 4;
    static MAX_CHARACTERS_SYMBOL = 5;
    static MAX_CHARACTERS_DIALOGS = 10;
    static CHECK_NEW_EXTENSION_TIMEOUT = 5000;
    static FEED_MIN_RATING = 5;
    static DOWNLOAD_ENDPOINT = "download";
    static BUFFER_SIZE = 1024;
    static FILES_FOLDER = "files";
    static RAM_PERCENT = 33;
    static MAX_FEED_PRICE_LENGTH = 8;
    static ERC721_INTERFACE_ID = "0x80ac58cd";
}
export {Constants};