"use strict";

import {create} from "ipfs-http-client";
import {BufferList} from "bl";
import {utils} from '../utils/utils.mjs';
import {Constants} from './../../../../modules/shared/constants.mjs';
import Web3 from 'web3';
import {toString as uint8ArrayToString} from 'uint8arrays/to-string';
import {concat as uint8ArrayConcat} from 'uint8arrays/concat';
import all from 'it-all';

let ipfs = null;
let mailContract = null;

class Shared{

    constructor(){
        this.baseUrl = "";
    }

    setBaseUrl(url){
        this.baseUrl = url;
    }

    createIPFS(url){
        ipfs = create(url);
    }

    async postAdd(req, res){
        const params = {
            text: req.body.text,
        };
        this.common(this.add, params, res);
    }

    async getPinned(req, res){
        const params = {
            cid: req.query.cid,
        };
        this.common(this.pinned, params, res);
    }

    async getCat(req, res){
        const params = {
            cid: req.params.cid,
        };
        this.common(this.cat, params, res);
    }

    async getCats(req, res, mysqlPool){
        const params = {
            id: 0,
            cids: req.query.cids,
            result: req.query.result,
            mysqlPool: mysqlPool,
            texts: []
        };
        this.common(this.cats, params, res);
    }

    async getFile(req, res){
        const params = {
            cid: req.query.cid,
            ext: req.query.ext,
        };
        this.common(this.file, params, res);
    }

    getRam(req, res){
        const params = {};
        this.common(this.ram, params, res);
    }

    async getDownload(req, res){
        const filePath = "./" + req.params.folder + "/" + req.params.file;
        this.download(filePath, res, utils);
    }

    download(filePath, res, serverUtils){
        try{
            res.download(filePath, (e) => {
                if (e) {
                    serverUtils.internalServerError(res, e);
                }
            });
        }
        catch (e) {
            serverUtils.internalServerError(res, e);
        }
    }

    async file(params, res){
        try{
            const cid = params.cid;
            const ext = params.ext;

            const chunks = [];
            for await (const chunk of ipfs.cat(cid)) {
                chunks.push(chunk);
            }

            let start = 0;
            let end = Constants.BUFFER_SIZE;
            if(end > chunks.length){
                end = chunks.length;
            }
            const bl = BufferList();

            while(start !== end){
                const buffer = Buffer.from(chunks.slice(start, end).toString());
                bl.append(buffer);

                start = start + Constants.BUFFER_SIZE;
                if(start > chunks.length){
                    start = chunks.length;
                }

                end = end + Constants.BUFFER_SIZE;
                if(end > chunks.length){
                    end = chunks.length;
                }
            }

            utils.getDownloadLink(shared.baseUrl, Constants.DOWNLOAD_ENDPOINT, Constants.FILES_FOLDER, bl, cid, ext)
                .then(link => utils.ok(res, {link: link}))
                .catch(e => utils.internalServerError(res, e));
        }
        catch (e) {
            utils.internalServerError(res, e);
        }
    }

    async catsSQL(mysqlPool, req, res){
        try{
            const cids = utils.getArray(req.query.cids);
            const cidsArray = [];
            for(let i=0;i<cids.length;i++){
                const cid = cids[i];
                if(!cidsArray.includes(cid)){
                    cidsArray.push(cid);
                }
            }

            mysqlPool.getConnection(function(err, connection) {
                if (err) {
                    utils.internalServerError(res, err);
                }
                else{
                    connection.query("SELECT * FROM Messages WHERE cid IN (?)", [cidsArray], function (err, result,) {
                        connection.release();
                        if (err){
                            utils.internalServerError(res, err);
                        }
                        else if(result.length === cidsArray.length){
                            utils.ok(res, {result: result});
                        }
                        else{
                            req.query.cids = cids;
                            req.query.result = result;
                            shared.getCats(req, res, mysqlPool).catch(e => utils.internalServerError(res, e));
                        }
                    });
                }
            });
        }
        catch (e) {
            utils.internalServerError(res, e);
        }
    }

    createDB(mysqlPool, req, res){
        if(req.body.adminPassword === process.env.ADMIN_PASSWORD){
            mysqlPool.getConnection(function(err, connection) {
                if (err) {
                    utils.internalServerError(res, err);
                }
                else{
                    connection.query("CREATE DATABASE ??",[req.body.database], function (err,) {
                        connection.release();
                        if (err) {
                            utils.internalServerError(res, err);
                        }
                        else{
                            utils.ok(res, {data: "Database created!"});
                        }
                    });
                }
            });
        }
        else{
            utils.unauthorized(res);
        }
    }

    createMessages(mysqlPool, req, res){
        if(req.body.adminPassword === process.env.ADMIN_PASSWORD){
            mysqlPool.getConnection(function(err, connection) {
                if (err) {
                    utils.internalServerError(res, err);
                }
                else{
                    connection.query("CREATE TABLE Messages (cid VARCHAR(255) NOT NULL, text LONGTEXT, status TINYINT(1), PRIMARY KEY (cid))", function (err,) {
                        connection.release();
                        if (err) {
                            utils.internalServerError(res, err);
                        }
                        else{
                            utils.ok(res, {data: "Table created!"});
                        }
                    });
                }
            });
        }
        else{
            utils.unauthorized(res);
        }
    }

    replace(mysqlPool, cid, text, status, res){
        cid = utils.cleanSQL(cid);
        text = utils.cleanSQL(text);
        status = utils.cleanSQL(status);
        if(cid.length > 255 || status.length > 1){
            utils.internalServerError(res, "Invalid values.");
        }

        mysqlPool.getConnection(function(err, connection) {
            if (err) {
                utils.internalServerError(res, err);
            }
            else{
                connection.query("REPLACE INTO Messages (cid, text, status) VALUES (?, ?, ?)", [cid, text, status], function (err,) {
                    connection.release();
                    if (err) {
                        utils.internalServerError(res, err);
                    }
                });
            }
        });
    }

    postStatus(mysqlPool, req, res){
        mysqlPool.getConnection(function(err, connection) {
            if (err) {
                utils.internalServerError(res, err);
            }
            else{
                connection.query("SELECT address FROM Users WHERE signHash = ?", [req.body.signHash], async function (err, result,) {
                    connection.release();
                    if (err) {
                        utils.internalServerError(res, err);
                    }
                    else{
                        if(Constants.IS_LOCALHOST || (result && result.length > 0 && result[0].address === req.body.address)){
                            if(!mailContract){
                                mailContract = utils.getContract(Constants.RPC_PROVIDER, Constants.MAIL_CONTRACT_ADDRESS);
                            }
                            const mailInfo = await mailContract.methods.getMailInfo(req.body.address, req.body.id, req.body.option).call();
                            const mailId = mailInfo[1];

                            try{
                                const owner = await mailContract.methods.ownerOf(mailId).call();
                                if(owner === req.body.address){
                                    const status = utils.cleanSQL(req.body.status);
                                    const cid = utils.cleanSQL(req.body.cid);
                                    if(cid.length > 255 || status.length > 1){
                                        utils.internalServerError(res, "Invalid values.");
                                    }

                                    mysqlPool.getConnection(function(err, connection) {
                                        if (err) {
                                            utils.internalServerError(res, err);
                                        }
                                        else{
                                            connection.query("UPDATE Messages SET status = ? WHERE cid = ?", [status, cid],  function (err,) {
                                                connection.release();
                                                if (err) {
                                                    utils.internalServerError(res, err);
                                                }
                                                else{
                                                    utils.ok(res, {data: "Data updated!"});
                                                }
                                            });
                                        }
                                    });
                                }
                                else{
                                    utils.ok(res, {data: null});
                                }
                            }
                            catch (e) {
                                utils.ok(res, {data: null});
                            }
                        }
                        else{
                            utils.unauthorized(res);
                        }
                    }
                });
            }
        });
    }

    postStatuses(mysqlPool, req, res){
        const signHash = utils.cleanSQL(req.body.signHash);

        mysqlPool.getConnection(function(err, connection) {
            if (err) {
                utils.internalServerError(res, err);
            }
            else{
                connection.query("SELECT address FROM Users WHERE signHash = ?", [signHash], async function (err, result,) {
                    connection.release();
                    if (err) {
                        utils.internalServerError(res, err);
                    }
                    else{
                        if(Constants.IS_LOCALHOST || (result && result.length > 0 && result[0].address === req.body.address)){
                            const ids = utils.getArray(req.body.ids);
                            const cids = utils.getArray(req.body.cids);
                            if(!mailContract){
                                mailContract = utils.getContract(Constants.RPC_PROVIDER, Constants.MAIL_CONTRACT_ADDRESS);
                            }

                            for(let i=0;i<ids.length;i++){
                                const id = ids[i];
                                const cid = cids[i];
                                const mailInfo = await mailContract.methods.getMailInfo(req.body.address, id, req.body.option).call();
                                const mailId = mailInfo[1];

                                try{
                                    const owner = await mailContract.methods.ownerOf(mailId).call();
                                    if(owner === req.body.address){
                                        const status = utils.cleanSQL(req.body.status);
                                        if(cid.length > 255 || status.length > 1){
                                            utils.internalServerError(res, "Invalid values.");
                                        }

                                        mysqlPool.getConnection(function(err, connection) {
                                            if (err) {
                                                utils.internalServerError(res, err);
                                            }
                                            else{
                                                connection.query("UPDATE Messages SET status = ? WHERE cid = ?", [status, cid], function (err,) {
                                                    connection.release();
                                                    if (err) {
                                                        utils.internalServerError(res, err);
                                                    }
                                                    else{
                                                        utils.ok(res, {data: "Data updated!"});
                                                    }
                                                });
                                            }
                                        });
                                    }
                                    else{
                                        utils.ok(res, {data: null});
                                    }
                                }
                                catch (e) {
                                    utils.ok(res, {data: null});
                                }
                            }
                        }
                        else{
                            utils.unauthorized(res);
                        }
                    }
                });
            }
        });
    }

    dropTable(mysqlPool, req, res){
        if(req.body.adminPassword === process.env.ADMIN_PASSWORD){
            mysqlPool.getConnection(function(err, connection) {
                if (err) {
                    utils.internalServerError(res, err);
                }
                else{
                    connection.query("DROP TABLE ??", [req.body.table], function (err, result,) {
                        connection.release();
                        if (err) {
                            utils.internalServerError(res, err);
                        }
                        else{
                            utils.ok(res, {data: result});
                        }
                    });
                }
            });
        }
        else{
            utils.unauthorized(res);
        }
    }

    dropDB(mysqlPool, req, res){
        if(req.body.adminPassword === process.env.ADMIN_PASSWORD){
            mysqlPool.getConnection(function(err, connection) {
                if (err) {
                    utils.internalServerError(res, err);
                }
                else{
                    connection.query("DROP DATABASE ??", [req.body.database], function (err, result,) {
                        connection.release();
                        if (err) {
                            utils.internalServerError(res, err);
                        }
                        else{
                            utils.ok(res, {data: result});
                        }
                    });
                }
            });
        }
        else{
            utils.unauthorized(res);
        }
    }

    createUsers(mysqlPool, req, res){
        if(req.body.adminPassword === process.env.ADMIN_PASSWORD){
            mysqlPool.getConnection(function(err, connection) {
                if (err) {
                    utils.internalServerError(res, err);
                }
                else{
                    connection.query("CREATE TABLE Users (signHash VARCHAR(132) NOT NULL, address VARCHAR(42) NOT NULL, backedUp TINYINT(1), text LONGTEXT, PRIMARY KEY (signHash))", function (err,) {
                        connection.release();
                        if (err) {
                            utils.internalServerError(res, err);
                        }
                        else{
                            utils.ok(res, {data: "Table created!"});
                        }
                    });
                }
            });
        }
        else{
            utils.unauthorized(res);
        }
    }

    async replaceUser(mysqlPool, signHash, address, text, termsMessage, termsSign, res){
        let recovered;
        try{
            const web3 = new Web3(Constants.RPC_PROVIDER);
            termsMessage = termsMessage.replaceAll("''","'");
            recovered = web3.eth.accounts.recover(termsMessage, termsSign);
        }
        catch (_) {}

        if(Constants.IS_LOCALHOST || recovered === address){
            signHash = utils.cleanSQL(signHash);
            address = utils.cleanSQL(address);
            text = utils.cleanSQL(text);
            if(signHash.length > 132 || address.length > 42){
                utils.internalServerError(res, "Invalid values.");
            }

            mysqlPool.getConnection(function(err, connection) {
                if (err) {
                    utils.internalServerError(res, err);
                }
                else{
                    connection.query("REPLACE INTO Users (signHash, address, backedUp, text) VALUES (?, ?, ?, ?)", [signHash, address, 0, text], function (err,) {
                        connection.release();
                        if (err) {
                            utils.internalServerError(res, err);
                        }
                        else{
                            utils.ok(res, {data: "Data replaced!"});
                        }
                    });
                }
            });
        }
        else{
            utils.unauthorized(res);
        }
    }

    getUser(mysqlPool, req, res){
        const signHash = utils.cleanSQL(req.query.signHash);

        mysqlPool.getConnection(function(err, connection) {
            if (err) {
                utils.internalServerError(res, err);
            }
            else{
                connection.query("SELECT text, backedUp FROM Users WHERE signHash = ?", [signHash], function (err, result,) {
                    connection.release();
                    if (err) {
                        utils.internalServerError(res, err);
                    }
                    else{
                        utils.ok(res, {data: result});
                    }
                });
            }
        });
    }

    updateStatus(mysqlPool, req, res){
        const signHash = utils.cleanSQL(req.body.signHash);
        if(signHash.length > 132){
            utils.internalServerError(res, "Invalid values.");
        }

        mysqlPool.getConnection(function(err, connection) {
            if (err) {
                utils.internalServerError(res, err);
            }
            else{
                connection.query("SELECT address FROM Users WHERE signHash = ?", [signHash], function (err, result,) {
                    connection.release();
                    if (err) {
                        utils.internalServerError(res, err);
                    }
                    else{
                        if(Constants.IS_LOCALHOST || (result && result.length > 0 && result[0].address === req.body.address)){
                            const status = utils.cleanSQL(req.body.status);
                            if(status.length > 1){
                                utils.internalServerError(res, "Invalid values.");
                            }

                            mysqlPool.getConnection(function(err, connection) {
                                if (err) {
                                    utils.internalServerError(res, err);
                                }
                                else{
                                    connection.query("UPDATE Users SET backedUp = ? WHERE signHash = ?", [status, signHash], function (err,) {
                                        connection.release();
                                        if (err) {
                                            utils.internalServerError(res, err);
                                        }
                                        else{
                                            utils.ok(res, {data: "Data updated!"});
                                        }
                                    });
                                }
                            });
                        }
                        else{
                            utils.unauthorized(res);
                        }
                    }
                });
            }
        });
    }

    createTerms(mysqlPool, req, res){
        if(req.body.adminPassword === process.env.ADMIN_PASSWORD){
            mysqlPool.getConnection(function(err, connection) {
                if (err) {
                    utils.internalServerError(res, err);
                }
                else{
                    connection.query("CREATE TABLE Terms (address VARCHAR(42) NOT NULL, message LONGTEXT, signature VARCHAR(132), version VARCHAR(4), status TINYINT(1), PRIMARY KEY (address))", function (err,) {
                        connection.release();
                        if (err) {
                            utils.internalServerError(res, err);
                        }
                        else{
                            utils.ok(res, {data: "Table created!"});
                        }
                    });
                }
            });
        }
        else{
            utils.unauthorized(res);
        }
    }

    getTerms(mysqlPool, req, res){
        const signHash = utils.cleanSQL(req.query.signHash);
        const address = utils.cleanSQL(req.query.address);

        mysqlPool.getConnection(function(err, connection) {
            if (err) {
                utils.internalServerError(res, err);
            }
            else{
                connection.query("SELECT address FROM Users WHERE signHash = ?", [signHash], function (err, result,) {
                    connection.release();
                    if (err) {
                        utils.internalServerError(res, err);
                    }
                    else{
                        if(result && result.length > 0 && result[0].address === address){
                            mysqlPool.getConnection(function(err, connection) {
                                if (err) {
                                    utils.internalServerError(res, err);
                                }
                                else{
                                    connection.query("SELECT status, message, signature FROM Terms WHERE address = ? AND version = ?", [address, Constants.TERMS_VERSION], function (err, r,) {
                                        connection.release();
                                        if (err) {
                                            utils.internalServerError(res, err);
                                        }
                                        else{
                                            if(r && r.length > 0){
                                                utils.ok(res, {status: r[0].status === 1, message: r[0].message, signature: r[0].signature});
                                            }
                                            else{
                                                utils.ok(res, {status: false, message: null, signature: null});
                                            }
                                        }
                                    });
                                }
                            });
                        }
                        else{
                            utils.ok(res, {status: null, message: null, signature: null});
                        }
                    }
                });
            }
        });
    }

    async postTerms(mysqlPool, req, res){
        const address = utils.cleanSQL(req.body.address);
        const message = utils.cleanSQL(req.body.message);
        const signature = utils.cleanSQL(req.body.termsSign);
        if(address.length > 42 || signature.length > 132){
            utils.internalServerError(res, "Invalid values.");
        }

        if(req.body.message.toString().includes(Constants.TERMS_MESSAGE)){
            let version = 0;
            const open = message.toString().indexOf("{");
            const close = message.toString().indexOf("}") + 1;
            if(open > -1 && close > open){
                try{
                    const json = JSON.parse(message.toString().substring(open, close));
                    version = json.Version;
                }
                catch (e) {
                    utils.internalServerError(res, e);
                }
            }

            const web3 = new Web3(Constants.RPC_PROVIDER);
            const recovered = web3.eth.accounts.recover(req.body.message, signature);
            if(recovered === address){
                mysqlPool.getConnection(function(err, connection) {
                    if (err) {
                        utils.internalServerError(res, err);
                    }
                    else{
                        connection.query("REPLACE INTO Terms (address, message, signature, version, status) VALUES (?, ?, ?, ?, ?)", [address, message, signature, version, '1'], function (err,) {
                            connection.release();
                            if (err) {
                                utils.internalServerError(res, err);
                            }
                            else{
                                utils.ok(res, {data: "Data updated!"});
                            }
                        });
                    }
                });
            }
            else{
                utils.unauthorized(res);
            }
        }
        else{
            utils.unauthorized(res);
        }
    }

    createFees(mysqlPool, req, res){
        if(req.body.adminPassword === process.env.ADMIN_PASSWORD){
            mysqlPool.getConnection(function(err, connection) {
                if (err) {
                    utils.internalServerError(res, err);
                }
                else{
                    connection.query("CREATE TABLE Fees (address_id_option VARCHAR(256) NOT NULL, date VARCHAR(15), hour VARCHAR(15), value VARCHAR(256), symbol VARCHAR(5), isMixed TINYINT(1), PRIMARY KEY (address_id_option))", function (err,) {
                        connection.release();
                        if (err) {
                            utils.internalServerError(res, err);
                        }
                        else{
                            utils.ok(res, {data: "Table created!"});
                        }
                    });
                }
            });
        }
        else{
            utils.unauthorized(res);
        }
    }

    async getFee(mysqlPool, req, res){
        const address = utils.cleanSQL(req.query.address);
        const id = utils.cleanSQL(req.query.id);
        const option = utils.cleanSQL(req.query.option);

        mysqlPool.getConnection(function(err, connection) {
            if (err) {
                utils.internalServerError(res, err);
            }
            else{
                connection.query("SELECT date, hour, value, symbol, isMixed FROM Fees WHERE address_id_option = ?", [address + "_" + id + "_" + option], function (err, result,) {
                    connection.release();
                    if (err) {
                        utils.internalServerError(res, err);
                    }
                    else{
                        utils.ok(res, {data: result});
                    }
                });
            }
        });
    }

    async postFee(mysqlPool, req, res){
        const address = utils.cleanSQL(req.body.address);
        const id = utils.cleanSQL(req.body.id);
        const date = utils.cleanSQL(req.body.date);
        const hour = utils.cleanSQL(req.body.hour);
        const value = utils.cleanSQL(req.body.value);
        const symbol = utils.cleanSQL(req.body.symbol);
        const isMixed = utils.cleanSQL(req.body.isMixed);
        const signHash = utils.cleanSQL(req.body.signHash);
        const option = utils.cleanSQL(req.body.option);
        if((address + "_" + id + "_" + option).length > 256 || date.length > 15 || hour.length > 15 ||
            value.length > 256 || symbol.length > 5 || isMixed.length > 1){
            utils.ok(res, {data: null});
            return;
        }

        mysqlPool.getConnection(function(err, connection) {
            if (err) {
                utils.ok(res, {data: null});
            } else {
                connection.query("SELECT address FROM Users WHERE signHash = ?", [signHash], async function (err, result,) {
                    connection.release();
                    if (err) {
                        utils.ok(res, {data: null});
                    } else {
                        if (Constants.IS_LOCALHOST || (result && result.length > 0 && result[0].address === address)) {
                            try {
                                mysqlPool.getConnection(function(err, connection) {
                                    if (err) {
                                        utils.ok(res, {data: null});
                                    } else {
                                        connection.query("REPLACE INTO Fees (address_id_option, date, hour, value, symbol, isMixed) VALUES (?, ?, ?, ?, ?, ?)", [address + "_" + id + "_" + option, date, hour, value, symbol, isMixed], function (err,) {
                                            connection.release();
                                            if (err) {
                                                utils.ok(res, {data: null});
                                            }
                                            else{
                                                utils.ok(res, {data: "Data updated!"});
                                            }
                                        });
                                    }
                                });
                            }
                            catch (e) {
                                utils.ok(res, {data: null});
                            }
                        }
                        else{
                            utils.ok(res, {data: null});
                        }
                    }
                });
            }
        });
    }

    deleteAccount(mysqlPool, req, res){
        const address = utils.cleanSQL(req.body.address);
        const signature = utils.cleanSQL(req.body.signature);

        if(req.body.message.toString().includes(Constants.DELETION_MESSAGE)){
            const web3 = new Web3(Constants.RPC_PROVIDER);
            const recovered = web3.eth.accounts.recover(req.body.message, signature);

            if(recovered === address){
                mysqlPool.getConnection(function(err, connection) {
                    if (err) {
                        utils.internalServerError(res, err);
                    }
                    else{
                        connection.query("SELECT address FROM Users WHERE signHash = ?", [req.body.signHash], function (err, result,) {
                            connection.release();
                            if (err) {
                                utils.internalServerError(res, err);
                            } else {

                                if (result && result.length > 0 && result[0].address === address) {
                                    mysqlPool.getConnection(function(err, connection) {
                                        if (err) {
                                            utils.internalServerError(res, err);
                                        }
                                        else{
                                            connection.query("DELETE FROM Users WHERE signHash = ?", [req.body.signHash], function (err, r,) {
                                                connection.release();
                                                if (err) {
                                                    utils.internalServerError(res, err);
                                                } else {

                                                    mysqlPool.getConnection(function(err, connection) {
                                                        if (err) {
                                                            utils.internalServerError(res, err);
                                                        }
                                                        else{
                                                            connection.query("DELETE FROM Terms WHERE address = ?", [address], function (err,) {
                                                                connection.release();
                                                                if (err) {
                                                                    utils.internalServerError(res, err);
                                                                } else {

                                                                    mysqlPool.getConnection(function(err, connection) {
                                                                        if (err) {
                                                                            utils.internalServerError(res, err);
                                                                        }
                                                                        else{
                                                                            connection.query("DELETE FROM Fees WHERE address_id_option LIKE ?", [address], function (err, r,) {
                                                                                connection.release();
                                                                                if (err) {
                                                                                    utils.internalServerError(res, err);
                                                                                } else {
                                                                                    utils.ok(res, {data: "Data deleted!"});
                                                                                }
                                                                            });
                                                                        }
                                                                    });
                                                                }
                                                            });
                                                        }
                                                    });
                                                }
                                            });
                                        }
                                    });
                                } else {
                                    utils.unauthorized(res);
                                }
                            }
                        });
                    }
                });
            }
            else{
                utils.unauthorized(res);
            }
        }
    }

    async cat(params, res){
        try{
            const cid = params.cid;
            const cidIsOK = await utils.checkCID(cid, ipfs, Constants.RAM_PERCENT, res);
            if(!cidIsOK){
                return;
            }

            const chunks = uint8ArrayConcat(await all(ipfs.cat(cid)));
            const text = uint8ArrayToString(chunks);
            const obj = utils.isJson(text);
            utils.ok(res,obj ? obj : text);
        }
        catch (e) {
            utils.internalServerError(res, e);
        }
    }

    async cats(params, res){
        const cid = params.cids[params.id];
        try{
            let status = 0;
            for(let i=0;i<params.result.length;i++){
                if(params.result[i].cid === cid){
                    status = params.result[i].status;
                    break;
                }
            }

            const cidIsOK = await utils.checkCID(cid, ipfs, Constants.RAM_PERCENT, res);
            if(!cidIsOK){
                return;
            }

            const chunks = uint8ArrayConcat(await all(ipfs.cat(cid)));
            const text = uint8ArrayToString(chunks);
            shared.replace(params.mysqlPool, cid, text, status, res);
            params.texts.push({cid: cid, text: text, status: status});

            params.id++;
            if(params.id >= params.cids.length){
                utils.ok(res, {result: params.texts});
            }
            else{
                await shared.cats(params, res);
            }
        }
        catch (_) {
            shared.replace(params.mysqlPool, cid.substring(0, 255), "Invalid", 0, res);
            params.texts.push({cid: cid.substring(0, 255), text: "Invalid", status: 0});

            params.id++;
            if(params.id >= params.cids.length){
                utils.ok(res, {result: params.texts});
            }
            else{
                await shared.cats(params, res);
            }
        }
    }

    async getMailBox(mysqlPool, req, res){
        const signHash = utils.cleanSQL(req.body.signHash);

        mysqlPool.getConnection(function(err, connection) {
            if (err) {
                utils.internalServerError(res, err);
            } else {
                connection.query("SELECT address FROM Users WHERE signHash = ?", [signHash], async function (err, result,) {
                    connection.release();
                    if (err) {
                        utils.internalServerError(res, err);
                    } else {
                        if (Constants.IS_LOCALHOST || (result && result.length > 0 && result[0].address === req.body.address)) {
                            if(!mailContract){
                                mailContract = utils.getContract(Constants.RPC_PROVIDER, Constants.MAIL_CONTRACT_ADDRESS);
                            }
                            const mailBoxInfo = await mailContract.methods.getMailBoxInfo(req.body.address).call();
                            const cid = mailBoxInfo[1];
                            mysqlPool.getConnection(function(err, connection) {
                                if (err) {
                                    utils.internalServerError(res, err);
                                } else {
                                    connection.query("SELECT text FROM Messages WHERE cid = ?", [cid], function (err, result,) {
                                        connection.release();
                                        if (err) {
                                            utils.internalServerError(res, err);
                                        } else {
                                            if(result && result.length > 0){
                                                utils.ok(res, {data: result[0].text});
                                            }
                                            else{
                                                utils.ok(res, {data: null});
                                            }
                                        }
                                    });
                                }
                            });
                        }
                        else{
                            utils.unauthorized(res);
                        }
                    }
                });
            }
        });
    }

    async pinned(params, res){
        try{
            const cid_ = params.cid;

            let isPinned = false;
            for await (const {cid} of ipfs.pin.ls()) {
                if(cid.toString().includes(cid_)){
                    isPinned = true;
                    break;
                }
            }

            utils.ok(res, {isPinned: isPinned});
        }
        catch (e) {
            utils.internalServerError(res, e);
        }
    }

    add(params, res){
        try{
            const text = params.text;
            ipfs.add(text)
                .then(cid => {
                    ipfs.pin.add(cid.cid)
                        .then(() => utils.ok(res, cid))
                        .catch(e => utils.internalServerError(res, e));
                })
                .catch(e => utils.internalServerError(res, e));
        }
        catch (e) {
            utils.internalServerError(res, e);
        }
    }

    ram(params, res){
        utils.ok(res, {total: utils.getTotalRAM(), free: utils.getFreeRAM()});
    }

    common(function_, params, res){
        function_(params, res);
    }
}
const shared = new Shared();
export {shared};