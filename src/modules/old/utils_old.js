"use strict";

import {Constants} from "../shared/constants.mjs";
import {utils} from "../utils/utils.mjs";
import {CID} from "../../imports/old/cid/cid_min-9.7.0";
import {shared} from "../shared/shared.mjs";

class UtilsOld{
    getTokenInfo(contractAddress, marketplaceAddress, id){
        return new Promise(async function(resolve, reject) {
            try{
                await utils.loadToken(contractAddress, marketplaceAddress, id, resolve);
            }
            catch (e) {
                reject(e);
            }
        });
    }

    async loadToken(contractAddress, marketplaceAddress, id, resolve){
        let uri = "";
        let originalUri = "";
        let approved = false;
        let owner = "";
        const contract = await this.getContract(contractAddress);
        if(!contract){return;}
        const ercType = await this.getERCType(contract);

        if(ercType.toString() === Constants.ERC_721.toString()) {
            owner = await contract.methods.ownerOf(id).call();
        }
        else if(ercType.toString() === Constants.ERC_1155.toString()){
            owner = (await utils.getTokenOwner(contract, contractAddress, id.toString())).address;
        }

        if(!owner || owner === Constants.ZERO_ADDRESS){
            const data = {
                ercType: ercType,
                id: id,
                owner: owner,
                originalUri: "",
                currentPrice: 0,
                fullPrice: 0,
                isForSale: false,
                metadata: null
            }
            resolve(data);
        }

        if(ercType.toString() === Constants.ERC_721.toString()) {
            approved = (await contract.methods.getApproved(id).call()) === marketplaceAddress;
        }
        else if(ercType.toString() === Constants.ERC_1155.toString()){
            approved = await contract.methods.isApprovedForAll(owner, marketplaceAddress).call();
        }

        if(ercType.toString() === Constants.ERC_721.toString()){
            uri = await contract.methods.tokenURI(id).call();
            originalUri = uri;
        }
        else if(ercType.toString() === Constants.ERC_1155.toString()){
            uri = await contract.methods.uri(id).call();
            originalUri = uri;
            if(uri.toString().includes("{id}")){
                uri = uri.toString().replace("{id}", this.getHexId(id).toString());
            }
        }

        if(uri === "" || !isNaN(uri)){
            const data = {
                ercType: ercType,
                id: id,
                owner: owner,
                originalUri: "",
                currentPrice: 0,
                fullPrice: 0,
                isForSale: approved,
                metadata: null
            }
            resolve(data);
        }

        if(uri.toString().startsWith(Constants.IPFS_PROTOCOL)){
            uri = uri.toString().replace(Constants.IPFS_PROTOCOL, Constants.DEFAULT_IPFS_GATEWAY_PREFIX);
        }
        uri = await this.setProtocol(uri);

        const BN = this.web3.utils.BN;
        const royalty = await contract.methods.getRoyalty(id, 0).call();
        const currentPrice = await royalty[4];
        const fullPrice = royalty[5];
        const percentPerTransfer = await royalty[6];
        const price = (new BN(currentPrice.toString())).add((((new BN(currentPrice.toString())).mul((new BN(percentPerTransfer.toString())))).div(new BN(this.web3.utils.toWei("100", "ether").toString()))));

        const data = {
            ercType: ercType,
            id: id,
            owner: owner,
            originalUri: originalUri,
            currentPrice: price.toString(),
            fullPrice: fullPrice.toString(),
            isForSale: approved,
            metadata: uri
        }
        resolve(data);
    }

    async getFirstTransfer721(contract, fromBlock, toBlock, contractAddress, tokenId){
        return new Promise(async function(resolve, reject) {
            try {
                await contract.getPastEvents('Transfer', {
                    filter: {tokenId: tokenId},
                    fromBlock: fromBlock,
                    toBlock: toBlock
                }, function(e, events){
                    if(!e){
                        for(let i=0;i<events.length;i++) {
                            if (events[i].returnValues.from.toString().toLowerCase() === Constants.ZERO_ADDRESS.toLowerCase()) {
                                const data = {
                                    address: events[i].returnValues.to,
                                    block: events[i].blockNumber
                                }
                                resolve(data);
                                break;
                            }
                        }
                        resolve({block: -1});
                    }
                    reject(e);
                });
            } catch (e) {
                reject(e);
            }
        });
    }

    async getFirstTransfer1155(type, contract, fromBlock, toBlock, tokenId){
        return new Promise(async function(resolve, reject) {
            try {
                await contract.getPastEvents(type, {
                    fromBlock: fromBlock,
                    toBlock: toBlock
                }, function(e, events){
                    if(!e){
                        for(let i=0;i<events.length;i++) {
                            if (events[i].returnValues.ids.includes(tokenId) &&
                                events[i].returnValues.from.toString().toLowerCase() === Constants.ZERO_ADDRESS.toLowerCase()) {
                                const data = {
                                    address: events[i].returnValues.to,
                                    block: events[i].blockNumber
                                }
                                resolve(data);
                                break;
                            }
                        }
                        resolve({block: -1});
                    }
                    reject(e);
                });
            } catch (e) {
                reject(e);
            }
        });
    }

    async isOwner(contractAddress, id, currentAddress){
        const contract = await this.getContract(contractAddress);
        if(!contract){return;}
        const ercType = await this.getERCType(contract);

        if(ercType.toString() === Constants.ERC_721.toString()){
            const owner = await contract.methods.ownerOf(id).call();
            return owner.toString().toLowerCase() === currentAddress.toString().toLowerCase();
        }
        else if(ercType.toString() === Constants.ERC_1155.toString()){
            const balance = await contract.methods.balanceOf(currentAddress, id).call();
            return balance > 0;
        }
    }

    async getApprovalsFromRPC(contract, spender, ercType, creationBlock, toBlock, owners, allowances, resolve, reject){
        const MAX_BLOCKS = await this.getMaxBlocks();
        let fromBlock = toBlock - MAX_BLOCKS;
        if(fromBlock < creationBlock - MAX_BLOCKS){
            resolve(-1);
            return;
        }

        //console.log("fromBlock "+fromBlock+" toBlock "+toBlock)

        if(ercType.toString() === Constants.ERC_721.toString()){
            await contract.getPastEvents('Approval', {
                filter: {spender: spender},
                fromBlock: fromBlock,
                toBlock: toBlock,
            }, async function(e, events){
                if(!e){
                    for(let i=0;i<events.length;i++){
                        const owner = events[i].returnValues.owner;
                        const allowance = await contract.methods.allowance(owner, spender).call();

                        if(allowance > 0 && !owners.includes(owner)){
                            owners.push(owner);
                            allowances.push(allowance);
                        }
                    }

                    if(fromBlock <= creationBlock){
                        resolve({
                            owners: owners,
                            allowances: allowances
                        });
                    }
                    else{
                        utils.getApprovals(contract, spender, ercType, creationBlock, fromBlock, owners, allowances, resolve, reject).catch(e => reject(e));
                    }
                }
                else{
                    reject(e);
                }
            });
        }
        else if(ercType.toString() === Constants.ERC_1155.toString()){
            await contract.getPastEvents('ApprovalForAll', {
                filter: {operator: spender},
                fromBlock: fromBlock,
                toBlock: toBlock,
            }, async function(e, events){
                if(!e){
                    for(let i=0;i<events.length;i++){
                        const account = events[i].returnValues.account;
                        const isApprovedForAll = await contract.methods.isApprovedForAll(account, spender).call();

                        if(isApprovedForAll && !owners.includes(account)){
                            owners.push(account);
                            allowances.push(-1);
                        }
                    }

                    if(fromBlock <= creationBlock){
                        resolve({
                            owners: owners,
                            allowances: allowances
                        });
                    }
                    else{
                        utils.getApprovals(contract, spender, ercType, creationBlock, fromBlock, owners, allowances, resolve, reject).catch(e => reject(e));
                    }
                }
                else{
                    reject(e);
                }
            });
        }
    }

    async waitGettingApprovalsFromRPC(contractAddress, spender, id){
        return new Promise(async function(resolve, reject) {
            try{
                const contract = await utils.getContract(contractAddress);
                if(!contract){return;}
                const ercType = await utils.getERCType(contract);

                let mintBlock;
                if(ercType.toString() === Constants.ERC_721.toString()){
                    mintBlock = await utils.waitGettingMintBlockERC721(contractAddress, id);
                }
                else if(ercType.toString() === Constants.ERC_1155.toString()){
                    mintBlock = await utils.waitGettingMintBlockERC1155(contractAddress, id);
                }

                if(mintBlock < 0){
                    resolve(-1);
                    return;
                }
                await utils.getApprovals(contract, spender, ercType, mintBlock, await utils.getLastBlock(), [], [], resolve, reject);
            }
            catch (e) {
                reject(e);
            }
        });
    }

    async waitGettingApprovals(contractAddress, toAddress, topic0){
        return new Promise(async function(resolve, reject) {
            try{
                await utils.getApprovals(contractAddress, toAddress, topic0, resolve, reject);
            }
            catch (e) {
                reject(e);
            }
        });
    }

    async getApprovals(contractAddress, toAddress, topic0, resolve, reject){
        const contract = await utils.getContract(contractAddress);
        if(!contract){return;}
        const ercType = await utils.getERCType(contract);
        utils.waitGettingEventsFromAPI(contract, contractAddress, toAddress, topic0, ercType, utils.web3)
            .then(response => resolve(response))
            .catch(e => reject(e));
    }

    waitGettingEventsFromAPI(contract, contractAddress, toAddress, topic0, ercType, web3){
        return new Promise(async function(resolve, reject) {
            try{
                await utils.getEventsFromAPI(contract, contractAddress, toAddress, topic0, ercType, web3, resolve, reject);
            }
            catch (e) {
                reject(e);
            }
        });
    }

    getEventsFromAPI(contract, contractAddress, toAddress, topic0, ercType, web3, resolve, reject){
        utils.waitLoadingAPI(contractAddress, toAddress, topic0)
            .then(async response => {
                const result = response[0];
                if(result.status === "1"){
                    const owners = [];
                    const allowances = [];
                    const approvals = result.result;

                    for(let i=0;i<approvals.length;i++){
                        const transaction = approvals[i];
                        const topics = transaction.topics;

                        if(topics.length > 2){
                            const owner = web3.eth.abi.decodeParameter('address', topics[1]);
                            const spender = web3.eth.abi.decodeParameter('address', topics[2]);

                            if(ercType.toString() === Constants.UNKNOWN.toString()){
                                const allowance = await contract.methods.allowance(owner, spender).call();
                                if(allowance > 0 && !owners.includes(owner)){
                                    owners.push(owner);
                                    allowances.push(allowance);
                                }
                            }
                            else if(ercType.toString() === Constants.ERC_1155.toString()){
                                const isApprovedForAll = await contract.methods.isApprovedForAll(owner, spender).call();
                                if(isApprovedForAll && !owners.includes(owner)){
                                    owners.push(owner);
                                    allowances.push(-1);
                                }
                            }
                        }
                    }

                    resolve({
                        owners: owners,
                        allowances: allowances,
                    });
                }
                else{
                    resolve(result.message);
                }
            })
            .catch(e => reject(e));
    }

    async getTokenMintBlock(contract, contractAddress, tokenId){
        const ercType = await this.getERCType(contract);
        const MAX_BLOCKS = await this.getMaxBlocks();
        let toBlock = await this.getLastBlock();
        let fromBlock = toBlock - MAX_BLOCKS;
        let data = {block: -1};
        if(fromBlock < 0){
            fromBlock = toBlock;
        }

        if(ercType.toString() === Constants.ERC_721.toString()){
            while(fromBlock >= 0 && data.block < 0){
                data = await this.getFirstTransfer721(contract, fromBlock, toBlock, contractAddress, tokenId);
                toBlock = fromBlock - 1;
                fromBlock = toBlock - MAX_BLOCKS;
            }
        }
        else if(ercType.toString() === Constants.ERC_1155.toString()){
            while(fromBlock >= 0 && data.block < 0){
                const dataSingle = await this.getFirstTransfer1155("TransferSingle", contract, fromBlock, toBlock, tokenId);
                const dataBatch = await this.getFirstTransfer1155("TransferBatch", contract, fromBlock, toBlock, tokenId);
                if(dataSingle.block > dataBatch.block){
                    data = dataSingle;
                }
                else{
                    data = dataBatch;
                }
                toBlock = fromBlock - 1;
                fromBlock = toBlock - MAX_BLOCKS;
            }
        }

        return data;
    }

    async getTokenOwner(contract, contractAddress, tokenId){
        const ercType = await this.getERCType(contract);
        const MAX_BLOCKS = await this.getMaxBlocks();
        let toBlock = await this.getLastBlock();
        let fromBlock = toBlock - MAX_BLOCKS;
        let data = {block: -1};
        if(fromBlock < 0){
            fromBlock = toBlock;
        }

        if(ercType.toString() === Constants.ERC_721.toString()){
            while(fromBlock >= 0 && data.block < 0){
                data = await this.getLastTransfer721(contract, fromBlock, toBlock, contractAddress, tokenId);
                toBlock = fromBlock - 1;
                fromBlock = toBlock - MAX_BLOCKS;
            }
        }
        else if(ercType.toString() === Constants.ERC_1155.toString()){
            while(fromBlock >= 0 && data.block < 0){
                const dataSingle = await this.getLastTransfer1155("TransferSingle", contract, fromBlock, toBlock, tokenId);
                const dataBatch = await this.getLastTransfer1155("TransferBatch", contract, fromBlock, toBlock, tokenId);
                if(dataSingle && dataBatch && dataSingle.block > dataBatch.block){
                    data = dataSingle;
                }
                else{
                    data = dataBatch;
                }
                toBlock = fromBlock - 1;
                fromBlock = toBlock - MAX_BLOCKS;
            }
        }

        return data;
    }

    async getLastTransfer721(contract, fromBlock, toBlock, contractAddress, tokenId){
        return new Promise(async function(resolve, reject) {
            try {
                await contract.getPastEvents('Transfer', {
                    filter: {tokenId: tokenId},
                    fromBlock: fromBlock,
                    toBlock: toBlock
                }, function(e, events){
                    if(!e){
                        if (events.length > 0) {
                            const data = {
                                address: events[0].returnValues.to,
                                block: events[0].blockNumber
                            }
                            resolve(data);
                        }
                        resolve({block: -1});
                    }
                    reject(e);
                });
            } catch (e) {
                reject(e);
            }
        });
    }

    async getLastTransfer1155(type, contract, fromBlock, toBlock, tokenId){
        return new Promise(async function(resolve, reject) {
            try {
                await contract.getPastEvents(type, {
                    fromBlock: fromBlock,
                    toBlock: toBlock
                }, function(e, events){
                    if(!e){
                        for(let i=events.length-1;i>=0;i--) {
                            if (events[i].returnValues.ids.includes(tokenId)) {
                                const data = {
                                    address: events[i].returnValues.to,
                                    block: events[i].blockNumber
                                }
                                resolve(data);
                                break;
                            }
                        }
                        resolve({block: -1});
                    }
                    reject(e);
                });
            } catch (e) {
                reject(e);
            }
        });
    }

    async checkUpdates(instance, smartContractAddress, latestUri, checkUri){
        return new Promise(function(resolve, reject) {
            try {
                if(instance){
                    utils.getContract(smartContractAddress)
                        .then(async contract => {
                            const versionUri = await contract.methods.getVersionURI().call();
                            if(versionUri !== latestUri || checkUri){
                                const uri = await utils.setProtocol(versionUri);
                                utils.loadUri(uri)
                                    .then(data => {
                                        instance.onNotUpdated(data);
                                        resolve(true);
                                    })
                                    .catch(e => reject(e));
                            }
                            else{
                                instance.onUpdated();
                            }
                        })
                        .catch(e => reject(e));
                }
            } catch (e) {
                reject(e);
            }
        });
    }

    async getERCType(contract){
        try{
            const is721 = await contract.methods.supportsInterface('0x80ac58cd').call();
            if(is721){
                return "ERC-721";
            }
            const is1155 = await contract.methods.supportsInterface('0xd9b67a26').call();
            if(is1155){
                return "ERC-1155";
            }
            return "UNKNOWN";
        }
        catch (e) {
            return "UNKNOWN";
        }
    }

    getHexId(id){
        let hexId = "0";
        try{
            hexId = parseInt(id).toString(16);
        }
        catch (e) {
            return "";
        }
        return this.web3.utils.padLeft(hexId, 64);
    }

    async getNetwork(isForLink){
        return new Promise(async function(resolve, reject) {
            try{
                window.ethereum.request({ method: 'net_version' })
                    .then(version => {
                        utils.getNetworkName(version, Constants.DEFAULT_RPC_PROVIDER, isForLink, resolve, reject);
                    })
                    .catch(e => reject(e));
            }
            catch (e) {
                reject(e);
            }
        });
    }

    async showPrompt(message, _default){
        try{
            this.showedAlert = true;
            await this.hideLoading();
            const r = prompt(message, _default);
            this.showedAlert = false;
            return r;
        }
        catch (e) {
            this.showAlert(e);
        }
        return undefined;
    }

    async setProtocol(uri){
        //verifies if the uri has IPFS CID but not the protocol (http, https or ipfs)
        //if it hasn't -> insert the protocol
        //if it has -> change the protocol based on the stored value
        const cid = await this.getCIDByURI(uri);
        if(cid && (!uri.toString().startsWith(Constants.HTTPS_PROTOCOL) || !uri.toString().startsWith(Constants.HTTP_PROTOCOL)
            || !uri.toString().startsWith(Constants.IPFS_PROTOCOL))){
            const suffix = uri.substring(uri.indexOf(cid) + cid.length);
            return Constants.DEFAULT_IPFS_GATEWAY_PREFIX + cid + suffix;
        }
        else if(cid && uri.toString().startsWith(Constants.IPFS_PROTOCOL)){
            return uri.replace(Constants.IPFS_PROTOCOL, Constants.DEFAULT_IPFS_GATEWAY_PREFIX);
        }
        return uri;
    }

    async getCIDByURI(uri){
        const words = this.getWords(uri);
        let cidFound = "";

        for(let j=0;j<words.length;j++){
            if(await this.isCID(words[j])){
                cidFound = words[j];
                break;
            }
        }

        return cidFound;
    }

    getWords(url){
        let start = 0;
        let end = -1;
        const words = [];

        if(url){
            const word = url.toString();
            while(end < word.length){
                start = end + 1;
                end = word.indexOf("/", start);

                if(end > -1){
                    const slash = word.substring(start, end);
                    if(!words.includes(slash) && slash !== ""){
                        words.push(slash);
                    }
                }
                else{
                    end = word.length;
                    const blank = word.substring(start, end);
                    if(!words.includes(blank) && blank !== ""){
                        words.push(blank);
                    }
                }
            }
        }

        return words;
    }

    async isCID(word){
        try{
            const cid = CID.parse(word);
            if(CID.asCID(cid)){
                return true;
            }
        }
        catch (e) {
            return false;
        }
    }

    waitVerifyingTx(contractAddress, address, block, nonce, timeout){
        return new Promise(async function(resolve, reject) {
            try{
                await utils.verifyTx(contractAddress, address, block, nonce, timeout, resolve, reject);
            }
            catch (e) {
                reject(e);
            }
        });
    }

    async verifyTx(contractAddress, address, block, nonce, timeout, resolve, reject){
        try{
            const web3 = await this.getWeb3();
            if(!web3){return;}
            const currentBlock = await this.getLastBlock();
            let maxBlocks = await this.getMaxBlocks();
            let fromBlock = block;
            let toBlock;

            let difference = currentBlock - block;
            if(difference > 0 && difference >= maxBlocks){
                toBlock = block + maxBlocks;
            }
            else if(difference > 0 && difference < maxBlocks){
                toBlock = currentBlock;
            }
            else{
                toBlock = block;
            }
            let hash = null;

            //console.log("from "+fromBlock+" to "+toBlock+" difference "+difference);

            const txs = await web3.eth.getPastLogs({
                fromBlock: fromBlock,
                toBlock: toBlock,
                address: contractAddress
            });

            if(txs){
                for(let i=0;i<txs.length;i++){
                    const tx = await web3.eth.getTransaction(txs[i].transactionHash);
                    if(tx && tx.nonce === nonce && tx.from === address){
                        hash = tx.hash;
                        break;
                    }
                }
            }

            if(hash){
                resolve(hash);
            }
            else{
                block = toBlock;
                setTimeout(function() {
                    utils.verifyTx(contractAddress, address, block, nonce, timeout, resolve, reject);
                }, timeout);
            }
        }
        catch (e){
            //omitted to avoid error messages when the user cancels the timeout
        }
    }

    async getStatusTx(hash){
        try{
            const web3 = await this.getWeb3();
            if(!web3){return;}
            const receipt = await web3.eth.getTransactionReceipt(hash);
            return receipt.status;
        }
        catch (e) {
            return null;
        }
    }

    async waitGettingMintBlockERC721(contractAddress, id){
        return new Promise(async function(resolve, reject) {
            try{
                const block = await utils.waitGettingFirstContractEvent(contractAddress);

                if(block < 0){
                    resolve(-1);
                    return;
                }
                await utils.getMintBlockERC721(utils.web3, contractAddress, id, block, await utils.getLastBlock(), resolve, reject);
            }
            catch (e) {
                reject(e);
            }
        });
    }

    async waitGettingMintBlockERC1155(contractAddress, id){
        return new Promise(async function(resolve, reject) {
            try{
                const block = await utils.waitGettingFirstContractEvent(contractAddress);

                if(block < 0){
                    resolve(-1);
                    return;
                }
                await utils.getMintBlockERC1155(utils.web3, contractAddress, id, block, await utils.getLastBlock(), resolve, reject);
            }
            catch (e) {
                reject(e);
            }
        });
    }

    async waitGettingFirstContractEvent(contractAddress){
        return new Promise(async function(resolve, reject) {
            try{
                await utils.getFirstContractEvent(utils.web3, contractAddress, await utils.getLastBlock(), resolve, reject);
            }
            catch (e) {
                reject(e);
            }
        });
    }

    async getFirstContractEvent(web3, contractAddress, toBlock, resolve, reject){
        const MAX_BLOCKS = await this.getMaxBlocks();
        let fromBlock = toBlock - MAX_BLOCKS;
        if(fromBlock < 0){
            resolve(-1);
            return;
        }

        const transactions = await web3.eth.getPastLogs({
            fromBlock: 0,
            toBlock: "latest",
            address: contractAddress,
        });

        if(!transactions || transactions.length === 0){
            utils.getFirstContractEvent(web3, contractAddress, fromBlock, resolve, reject).catch(e => reject(e));
        }
        else{
            resolve(transactions[0].blockNumber);
        }
    }

    async getMintBlockERC1155(web3, contractAddress, id, creationBlock, toBlock, resolve, reject){
        const MAX_BLOCKS = await this.getMaxBlocks();
        let fromBlock = toBlock - MAX_BLOCKS;
        if(fromBlock < creationBlock - MAX_BLOCKS){
            resolve(-1);
            return;
        }

        //console.log("fromBlock "+fromBlock+" toBlock "+toBlock)

        const transactions = await web3.eth.getPastLogs({
            fromBlock: fromBlock,
            toBlock: toBlock,
            address: contractAddress,
            topics: [null,
                null,
                web3.utils.padLeft(Constants.ZERO_ADDRESS, 64),
                null]
        });

        let ids = [];
        let block = 0;
        for(let i=0;i<transactions.length;i++){
            const idsAndAmounts = utils.getIdsAndAmountsERC1155(transactions[i], ids, [], web3);
            ids = idsAndAmounts.ids;

            if(ids.includes(id)){
                block = transactions[i].blockNumber;
                break;
            }
        }

        if(block > 0){
            resolve(block);
        }
        else{
            utils.getMintBlockERC1155(web3, contractAddress, id, creationBlock, fromBlock, resolve, reject).catch(e => reject(e));
        }
    }

    async getMintBlockERC721(web3, contractAddress, id, creationBlock, toBlock, resolve, reject){
        const MAX_BLOCKS = await this.getMaxBlocks();
        let fromBlock = toBlock - MAX_BLOCKS;
        if(fromBlock < creationBlock - MAX_BLOCKS){
            resolve(-1);
            return;
        }

        //console.log("fromBlock "+fromBlock+" toBlock "+toBlock)

        const transactions = await web3.eth.getPastLogs({
            filter: {tokenId: id},
            fromBlock: fromBlock,
            toBlock: toBlock,
            address: contractAddress,
            topics: [null,
                web3.utils.padLeft(Constants.ZERO_ADDRESS, 64),
                null],
        });

        if(!transactions || transactions.length === 0){
            utils.getMintBlockERC721(web3, contractAddress, id, creationBlock, fromBlock, resolve, reject).catch(e => reject(e));
        }
        else{
            resolve(transactions[0].blockNumber);
        }
    }

    async getMaxBlocks(){
        try{
            return Constants.DEFAULT_MAX_BLOCKS;
        }
        catch (e) {
            return await this.getLastBlock();
        }
    }

    async getLastBlock(){
        const web3 = await this.getWeb3();
        if(!web3){return;}
        return await web3.eth.getBlockNumber();
    }

    setStyleButton(className, index, style){
        const currentStyle = this.getButtonStyle(className, index);
        document.getElementsByClassName(className)[index].classList.remove(currentStyle);
        document.getElementsByClassName(className)[index].classList.add(style);
    }

    getEllipsisByWidth(text, originalWidth){
        if(window.matchMedia('(min-width: 1199.98px)').matches){
            return utils.getEllipsis(text, originalWidth - 10);
        }
        else if(window.matchMedia('(min-width: 992px) and (max-width: 1199.98px)').matches){
            return utils.getEllipsis(text, originalWidth - 15);
        }
        else if(window.matchMedia('(min-width: 768px) and (max-width: 991.98px)').matches){
            return utils.getEllipsis(text, originalWidth - 22);
        }
        else if(window.matchMedia('(min-width: 576px) and (max-width: 767.98px)').matches){
            return utils.getEllipsis(text, originalWidth - 15);
        }
        else if(window.matchMedia('(min-width: 480px) and (max-width: 575.98px)').matches){
            return utils.getEllipsis(text, originalWidth - 20);
        }
        else if(window.matchMedia('(min-width: 360px) and (max-width: 479.98px)').matches){
            return utils.getEllipsis(text, originalWidth - 5);
        }
        else if(window.matchMedia('(min-width: 240px) and (max-width: 359.98px)').matches){
            return utils.getEllipsis(text, originalWidth - 20);
        }
        else if(window.matchMedia('(max-width: 239.98px)').matches){
            return utils.getEllipsis(text, originalWidth - 25);
        }
    }

    isString(value){
        return typeof value === 'string' || value instanceof String;
    }

    downloadFile(url, fileName, extension, timeout){
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName + (extension.toString().startsWith(".") ? extension : "." + extension);
        document.body.append(link);
        link.click();
        link.remove();
        setTimeout(() => URL.revokeObjectURL(link.href), timeout);
    }

    getMerkleTree(mainLeaf){
        const randomLeaf1 = this.getRandomValues();
        const randomLeaf2 = this.getRandomValues();
        const randomLeaf3 = this.getRandomValues();
        const leaves = [mainLeaf, randomLeaf1, randomLeaf2, randomLeaf3].map(v => keccak256(v));
        const tree = new MerkleTree(leaves, keccak256,{sort: true});
        return {root: tree.getHexRoot(), proof: tree.getHexProof(keccak256(mainLeaf))};
    }

    isJson(text){
        const trimmed = text.trim();
        if(trimmed.startsWith("\"{") || trimmed.startsWith("{") || trimmed.startsWith("\"[") || trimmed.startsWith("[")){
            if (typeof text !== 'string') return false;
            try {
                let result = JSON.parse(text);
                let type = Object.prototype.toString.call(result);
                return type.toString().includes('[object');
            } catch (err) {
                return false;
            }
        }
        return false;
    }

    async unsavedChanges(){
        window.onbeforeunload = event => {
            if(!this.showedAlert && !shared.showedAlert){
                if(event){
                    event.returnValue = "";
                }
                return "";
            }
        };
    }

    getIdsAndAmountsERC1155(transaction, ids, amounts, web3){
        const data = transaction.data.replace("0x","");

        let idsLocation = data.substring(0, 64);
        let amountsLocation = data.substring(64, 128);
        idsLocation = web3.eth.abi.decodeParameter('uint256', idsLocation);
        amountsLocation = web3.eth.abi.decodeParameter('uint256', amountsLocation);

        let startIds = idsLocation * 2;
        let endIds = (idsLocation * 2) + 64;
        let idsTotal = data.substring(startIds, endIds);

        let startAmounts = amountsLocation * 2;
        let endAmounts = (amountsLocation * 2) + 64;
        let amountsTotal = data.substring(startAmounts, endAmounts);

        idsTotal = web3.eth.abi.decodeParameter('uint256', idsTotal);
        amountsTotal = web3.eth.abi.decodeParameter('uint256', amountsTotal);

        for(let i=0;i<idsTotal;i++){
            startIds = startIds + 64;
            endIds = endIds + 64;
            const id = data.substring(startIds, endIds);
            ids.push(web3.eth.abi.decodeParameter('uint256', id));
        }

        for(let i=0;i<amountsTotal;i++){
            startAmounts = startAmounts + 64;
            endAmounts = endAmounts + 64;
            const amount = data.substring(startAmounts, endAmounts);
            amounts.push(web3.eth.abi.decodeParameter('uint256', amount));
        }

        return {ids: ids, amounts: amounts};
    }

    async waitLoadingAPI(contractAddress, toAddress, topic0){
        return new Promise(async function(resolve, reject) {
            try{
                await utils.loadingAPI(contractAddress, toAddress, 1, 0, Constants.ETHERSCAN_API_OFFSET, topic0, [], resolve, reject);
            }
            catch (e) {
                reject(e);
            }
        });
    }

    loadingAPI(contractAddress, toAddress, page, fromBlock, offset, topic0, results, resolve, reject){
        const api = "https://" + Constants.ETHERSCAN_API_NETWORK + "/api?module=logs&action=getLogs&address=" + contractAddress + "&fromBlock=" + fromBlock + "&toBlock=latest&page=" + page + "&offset=" + offset + "&apikey=" + Constants.ETHERSCAN_API_KEY + "&topic0=" + topic0  + "&topic2=" + toAddress;
        utils.loadAPI(api)
            .then(response => {
                if (response.result){
                    results.push(response);
                }
                else{
                    resolve(results);
                }

                if(response.result.length === offset) {
                    page++;
                    utils.loadingAPI(contractAddress, page, fromBlock, offset, topic0, results, resolve, reject);
                }
                else{
                    resolve(results);
                }
            })
            .catch(e => reject(e));
    }

    async loadAPI(api){
        return fetch(api, {
            method: 'get',
        }).then(async function(response) {
            if(response.status === 200){
                return response.json();
            }
            else{
                const error = {
                    status: response.status,
                    message: "API error",
                    response: await response.text()
                }
                return Promise.reject(error);
            }
        }).catch(error => {
            return Promise.reject(error);
        });
    }

    getNetworkName(version, rpcProvider, isForLink, resolve, reject){
        switch (version) {
            case '1': {
                resolve ? resolve("") : undefined;//mainnet
                return "Ethereum";
            }
            case '3': {
                resolve ? resolve("ropsten") : undefined;
                return "Ropsten";
            }
            case '4': {
                resolve ? resolve("rinkeby") : undefined;
                return "Rinkeby";
            }
            case '5': {
                resolve ? resolve("goerli") : undefined;
                return "Goerli";
            }
            case '42': {
                resolve ? resolve("kovan") : undefined;
                return "Kovan";
            }
            case '56': {
                if(rpcProvider === Constants.TYPE_BINANCE){
                    if(isForLink){
                        resolve ? resolve("") : undefined;//BSC mainnet
                    }
                    else{
                        resolve ? resolve("bsc-dataseed") : undefined;//BSC mainnet
                    }
                }
                else if(rpcProvider === Constants.TYPE_GETBLOCK){
                    if(isForLink){
                        resolve ? resolve("") : undefined;//BSC mainnet
                    }
                    else{
                        resolve ? resolve("bsc") : undefined;//BSC mainnet
                    }
                }
                return "BSC";
            }
            case '97': {
                if(rpcProvider === Constants.TYPE_BINANCE){
                    if(isForLink){
                        resolve ? resolve("testnet") : undefined;//BSC testnet
                    }
                    else{
                        resolve ? resolve("data-seed-prebsc-1-s1") : undefined;//BSC testnet
                    }
                }
                else if(rpcProvider === Constants.TYPE_GETBLOCK){
                    if(isForLink){
                        resolve ? resolve("testnet") : undefined;//BSC testnet
                    }
                    else{
                        resolve ? resolve("bsc") : undefined;//BSC testnet
                    }
                }
                return "BSC Testnet";
            }
            case '137': {
                resolve ? resolve("") : undefined;
                return "MATIC";
            }
            case '80001': {
                resolve ? resolve("mumbai") : undefined;
                return "Mumbai";
            }
            default: {
                reject ? reject(undefined) : undefined;
                return undefined;
            }
        }
    }
}
const utilsOld = new UtilsOld();
export {utilsOld};