"use strict";

const http = require('http');
const express = require('express');
const app = express();
const server = http.createServer(app);
const cors = require('cors');
const bodyParser = require('body-parser');

const HOSTNAME = '127.0.0.1';
const PORT = 3001;
const BASE_URL = "http://" + HOSTNAME + ":" + PORT + "/";
const IPFS_API = "/ip4/127.0.0.1/tcp/5002";

let utils = null;
let shared = null;

server.listen(PORT, HOSTNAME, async () => {
    utils = (await import('./src/modules/utils/utils.mjs')).utils;
    shared = (await import('./src/modules/shared/shared.mjs')).shared;
    shared.setBaseUrl(BASE_URL);
    shared.createIPFS(IPFS_API);
    console.log(`Server running at `+ BASE_URL);
});

const mysql = require('mysql2');
const mysqlPool = mysql.createPool({
    connectionLimit : 10,
    host: "localhost",
    user: 'root',
    password: process.env.ADMIN_PASSWORD,
    database: "Mails",
    multipleStatements: false
});

app.use(bodyParser.json({limit: '2mb'}));
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cors());
app.use(function(e, req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();

    switch (e.type.toString()) {
        case "entity.too.large": utils.payloadTooLarge(res);
    }
});

app.post('/add', async function(req, res) {
    shared.postAdd(req, res).catch(e => utils.internalServerError(res, e));
});

app.get('/ipfs/:cid', async function(req, res) {
    shared.getCat(req, res).catch(e => utils.internalServerError(res, e));
});

app.get('/cats', async function(req, res) {
    shared.catsSQL(mysqlPool, req, res).catch(e => utils.internalServerError(res, e));
});

app.get('/file', async function(req, res) {
    shared.getFile(req, res).catch(e => utils.internalServerError(res, e));
});

app.get('/download/:folder/:file', async function(req, res) {
    shared.getDownload(req, res).catch(e => utils.internalServerError(res, e));
});

app.post('/create-db', async function(req, res) {
    shared.createDB(mysqlPool, req, res);
});

app.post('/create-messages', async function(req, res) {
    shared.createMessages(mysqlPool, req, res);
});

app.post('/create-users', async function(req, res) {
    shared.createUsers(mysqlPool, req, res);
});

app.post('/replace-user', async function(req, res) {
    shared.replaceUser(mysqlPool, req.body.signHash, req.body.address, req.body.text, req.body.termsMessage, req.body.termsSign, res);
    utils.ok(res, {data: "Data replaced!"});
});

app.get('/get-user', async function(req, res) {
    shared.getUser(mysqlPool, req, res);
});

app.post('/post-status', async function(req, res) {
    shared.postStatus(mysqlPool, req, res);
});

app.post('/post-statuses', async function(req, res) {
    shared.postStatuses(mysqlPool, req, res);
});

app.post('/update-status', async function(req, res) {
    shared.updateStatus(mysqlPool, req, res);
});

app.post('/create-terms', async function(req, res) {
    shared.createTerms(mysqlPool, req, res);
});

app.get('/get-terms', async function(req, res) {
    shared.getTerms(mysqlPool, req, res);
});

app.post('/post-terms', async function(req, res) {
    shared.postTerms(mysqlPool, req, res).catch(e => utils.internalServerError(res, e));
});

app.post('/delete-account', async function(req, res) {
    shared.deleteAccount(mysqlPool, req, res);
});

app.post('/drop-table', async function(req, res) {
    shared.dropTable(mysqlPool, req, res);
});

app.post('/drop-db', async function(req, res) {
    shared.dropDB(mysqlPool, req, res);
});

app.get('/pinned', async function(req, res) {
    shared.getPinned(req, res).catch(e => utils.internalServerError(res, e));
});

app.get('/ram', async function(req, res) {
    shared.getRam(req, res);
});

app.post('/create-fees', async function(req, res) {
    shared.createFees(mysqlPool, req, res);
});

app.post('/post-fee', async function(req, res) {
    shared.postFee(mysqlPool, req, res).catch(e => utils.internalServerError(res, e));
});

app.get('/get-fee', async function(req, res) {
    shared.getFee(mysqlPool, req, res).catch(e => utils.internalServerError(res, e));
});

app.post('/get-mailbox', async function(req, res) {
    shared.getMailBox(mysqlPool, req, res).catch(e => utils.internalServerError(res, e));
});
