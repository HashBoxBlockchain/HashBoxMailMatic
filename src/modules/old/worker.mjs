import Web3 from 'web3';
import {parentPort, workerData} from "node:worker_threads";

const web3 = new Web3(workerData.rpcLink);
const contract = new web3.eth.Contract(workerData.abi, workerData.contractAddress);
const mailInfo = await contract.methods.getMailInfo(workerData.address, workerData.id).call();
const block = mailInfo[3];
const paid = mailInfo[5];
const date = await getBlockDate();
const payment = web3.utils.fromWei(paid.toString(), "ether");

parentPort.postMessage({id: workerData.id, date: date, paid: payment});

async function getBlockDate(){
    const dateTimeStamp = (await web3.eth.getBlock(block)).timestamp;
    const d = new Date(dateTimeStamp * 1000);
    return d.toDateString();
}