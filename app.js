"use strict";

const http = require('http');
const hostname = '127.0.0.1';
const port = 3000;
const express = require('express');
const app = express();
const server = http.createServer(app);
const cors = require('cors');
const path = require('path');

let utils = null;
let shared = null;
let Constants = null;

server.listen(port, hostname, async () => {
    utils = (await import('./src/server/src/modules/utils/utils.mjs')).utils;
    shared = (await import('./src/server/src/modules/shared/shared.mjs')).shared;
    Constants = (await import('./src/modules/shared/constants.mjs')).Constants;
    console.log(`Server running at http://${hostname}:${port}/`);
});

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(function(e, req, res, next) {});
app.use(cors());
app.set('views', path.join(__dirname, 'src/'));
app.use(express.static(__dirname + '/src/'));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

app.get('/', function(req, res) {
    res.render('pages/landing.html');
});

app.get('/mail', function(req, res) {
    res.render('pages/index.html');
});

app.get('/help', function(req, res) {
    res.render('pages/help.html');
});

app.get('/help-pt-br', function(req, res) {
    res.render('pages/helpptbr.html');
});

app.get('/privacy', function(req, res) {
    res.render('pages/privacy.html');
});

app.get('/privacy-pt-br', function(req, res) {
    res.render('pages/privacyptbr.html');
});

app.get('/white-paper', function(req, res) {
    shared.download(__dirname + '/src/documents/HashBox-Mail.pdf', res, utils);
});

app.get('/terms', function(req, res) {
    res.render('pages/terms.html');
});

app.get('/terms-pt-br', function(req, res) {
    res.render('pages/termsptbr.html');
});

app.get('/faq', function(req, res) {
    res.render('pages/faq.html');
});

app.get('/faq-pt-br', function(req, res) {
    res.render('pages/faqptbr.html');
});

app.get('/address/:to', function(req, res) {
    res.render('pages/index.html');
});

app.get('*', function(req, res){
    res.render('pages/404.html');
});