"use strict";

import Web3 from 'web3';
import path from "path";
import fs from "fs-extra";
import MD5 from "crypto-js/md5.js";
import os from "os";
import {webcrypto} from 'crypto';
import {createHash} from "node:crypto";

class Utils{
    getABI(){
        return [
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
            {"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"}],
                "name":"ownerOf",
                "outputs":[{"internalType":"address","name":"","type":"address"}],
                "stateMutability":"view","type":"function"},
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
        ];
    }

    getContract(rpcLink, contractAddress){
        const web3 = new Web3(rpcLink);
        return new web3.eth.Contract(this.getABI(), contractAddress);
    }

    getDownloadLink(baseUrl, downloadEndpoint, filesFolder, bufferList, cid, ext){
        return new Promise(function(resolve, reject) {
            try {
                const randomValue = utils.getRandomValues();
                const fileId = MD5(randomValue).toString();
                const slashIndex = cid.indexOf("/");
                cid = slashIndex > -1 ? cid.substring(0, slashIndex) : cid;
                const fileName =  fileId + "_" + cid + "." + ext;
                const path_ = path.join('./' + filesFolder + "/", fileName);
                const pathRel = './' + filesFolder + "/";

                fs.ensureDirSync(pathRel);
                fs.writeFile(path_, utils.getBufferFromBufferList(bufferList), (error) => {
                    if(!error){
                        resolve(baseUrl + downloadEndpoint + "/" + filesFolder + "/" + fileName);
                    }
                    else{
                        reject(error);
                    }
                });
            } catch (e) {
                return null;
            }
        });
    }

    getBufferFromBufferList(bufferList){
        const uint8Array = new Uint8Array(bufferList.length);
        for(let i=0;i<uint8Array.byteLength;i++){
            uint8Array.set([bufferList.get(i)], i);
        }
        return Buffer.from(uint8Array, "hex");
    }

    ok(res, obj){
        if(res && !res.headersSent) {
            res.status(200).send(obj);
        }
    }

    internalServerError(res, e){
        if(res && !res.headersSent) {
            res.status(500).send(e);
        }
    }

    unauthorized(res){
        if(res && !res.headersSent) {
            res.status(401).send("Invalid credentials.");
        }
    }

    forbidden(res){
        if(res && !res.headersSent) {
            res.status(403).send("Dear user," +
                "\n\nWe regret to inform you that your IP address has been blocked from accessing our services." +
                "\n\nThis action is due to the fact that the country you are located in does not allow the use of cryptocurrencies.");
        }
    }

    payloadTooLarge(res){
        if(res && !res.headersSent) {
            res.status(413).send("Payload too large.");
        }
    }

    getArray(obj){
        if(obj && !Array.isArray(obj)){
            if(obj.includes(",")){
                obj = obj.split(',');
            }
            else{
                obj = [obj];
            }
        }
        return obj;
    }

    getRandomValues(){
        return webcrypto.getRandomValues(new Uint8Array(1024)).toString();
    }

    getTotalRAM(){
        return os.totalmem() / 1024 / 1024;
    }

    getFreeRAM(){
        return os.freemem() / 1024 / 1024;
    }

    async checkCID(cid, ipfs, ramPercent, res){
        const stats = await ipfs.files.stat('/ipfs/'+cid);
        const size = stats.cumulativeSize / 1024 / 1024;
        const maxRamSize = (this.getFreeRAM() * ramPercent) / 100;
        if(size >= maxRamSize){
            this.payloadTooLarge(res);
            return false;
        }
        return true;
    }

    cleanSQL(text){
        return text.toString().replaceAll("'","''");
    }

    isJson(item) {
        let value = typeof item !== "string" ? JSON.stringify(item) : item;
        try {
            value = JSON.parse(value);
        } catch (e) {
            return null;
        }
        if(typeof value === "object" && value !== null){
            return value;
        }
        return null;
    }

    sha256(content) {
        return createHash('sha256').update(content).digest('hex');
    }
}
const utils = new Utils();
export {utils};