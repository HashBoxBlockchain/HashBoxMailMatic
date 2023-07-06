# HashBox Mail - Matic

What is HashBox Mail?

It's a mail built on the blockchain using smart contracts to send and receive messages and files, eliminating the need for middlemen controlling the data. Without intermediaries, data cannot be changed or censored by a company.

### Installation

- Install Node.js: https://nodejs.org/en/download/;
- Clone the repository;
- Install all the dependencies (IPFS, Truffle, Express and etc.).

To start the application using your PC, type in the command prompt:

```
cd hashboxmailmatic
node app
```

To start the server using your PC, type in the command prompt:

```
cd hashboxmailmatic/src/server
start /b ipfs daemon & node server
```

Note: For your server to work, you must change the server url in the Settings to your localhost url.

### Tests

- Install Ganache to test the smart contracts: https://trufflesuite.com/ganache/;
- Start the Ganache;
- Choose "Quickstart Ethereum".

Type:

```
cd hashboxmailmatic
truffle test
```
