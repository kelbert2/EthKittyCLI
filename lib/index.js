#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Command-Line Interface
const yargs_1 = __importDefault(require("yargs"));
const web3_1 = __importDefault(require("web3"));
const config_json_1 = __importDefault(require("./config.json")); // infura project id
const KITTIES_URL = 'https://api/cryptokitties.co';
const ADDRESS = "0x06012c8cf97BEaD5deAe237070F9587f8E7A266d";
const BIRTH_TOPIC = "0x0a5311bd2a6608f08a180df2ee7c5946819a649b204b554bb8e39825b2c50ad5";
const options = yargs_1.default
    .usage("Usage: $0 [options] -s [num] -e [num]")
    .option("s", {
    alias: "start",
    describe: "starting block",
    type: "number",
    default: 6607985
})
    .option("e", {
    alias: "end",
    describe: "ending block",
    type: "number",
    default: 7028323
})
    .argv;
let web3 = new web3_1.default(new web3_1.default.providers.HttpProvider("https://mainnet.infura.io/v3/" + config_json_1.default.id)); // http://localhost:8545 for local
// connect to local or remote node
let pregnancyCount = 0;
let mommaMap = new Map();
// if (typeof web3 !== 'undefined') {
//     web3 = new Web3(web3.currentProvider);
//    } else {
//     // set the provider you want from Web3.providers
//     web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
// }
// web3.eth.getBlock(options.s, function(error, result){
//     if(!error)
//         console.log("Reponse:" + JSON.stringify(result));
//     else
//         console.error("Error: " + error);
//  });
// Test
// blockNumber: 10195151
// matronId: 548192
// hex data: 
/*
0x000000000000000000000000093108180ea5e76b8d937fb7c445354c28a534d7
  00000000000000000000000000000000000000000000000000000000001d88f8
  0000000000000000000000000000000000000000000000000000000000085d60 // matronId
  00000000000000000000000000000000000000000000000000000000001d888b
  00007ad8b29086580ce30d683dc421b92a585d01a5ef7198800ce54a58c6bdc4
*/
// https://etherscan.io/tx/0x1952402d33cc3f0d98b8a23db68c1e1724d4e534972cfe00a07e5fa5777559d1#eventlog
web3.eth.getPastLogs({
    address: ADDRESS,
    topics: [BIRTH_TOPIC],
    fromBlock: 10195151,
    toBlock: 10195151
}, (err, result) => {
    if (err) {
        console.log("Error: " + err);
    }
}).then(result => {
    var _a;
    pregnancyCount++;
    for (let i = 0; i < result.length; i++) {
        // chop off the first two 0x from the string, then divide into 64-character parameters
        let data = result[i].data.substring(2).match(/[\s\S]{1,64}/g);
        let matronId = data ? parseInt(("0x" + data[2].replace(/^0+(?!$)/, ""))) : null;
        if (matronId != null) {
            let initialValue = (_a = mommaMap.get(matronId)) !== null && _a !== void 0 ? _a : 0;
            mommaMap.set(matronId, ++initialValue);
        }
    }
    // console.log(result);
}).then(() => {
    console.log("Pregnancy Count: " + pregnancyCount);
    // get max momma
    let maxBirths;
    let maxMatronId;
    for (const [key, value] of mommaMap.entries()) {
        if (!maxBirths || maxBirths < value) {
            maxBirths = value;
            maxMatronId = key;
        }
    }
    console.log("Max matron: " + maxMatronId + " with " + maxBirths);
    // TODO: Fetch kitty stats from api
});
// console.log("start: " + options.s);
// console.log("end: " + options.e);
// if (options.m) {
//     console.log("Got m!");
// }
// if (options.n) {
//     console.log("Got n!");
// }
// console.log("Got stats!");
// geth
// infura
// parity
let blockNumberIter = options.s;
