#!/usr/bin/env node
"use strict";
// TODO
// Add own log of data for each x range of blocks for cache-like behavior (as Infura will limit the number of calls that can be made)
// Test querying of ranges larger than one
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Add querying of cryptokitties API to get relevant stats on the biggest momma
// optimization: only store increments - like 1000 to 2000 rather than 1001 to 1019
// so that ideally will only have to get logs for the first < rangeSize and last < rangeSize 
// Command-Line Interface
const yargs_1 = __importDefault(require("yargs"));
const web3_1 = __importDefault(require("web3"));
const config_json_1 = __importDefault(require("./config.json")); // infura project id
const fs_1 = __importDefault(require("fs"));
const KITTIES_URL = 'https://api/cryptokitties.co';
const ADDRESS = "0x06012c8cf97BEaD5deAe237070F9587f8E7A266d";
const BIRTH_TOPIC = "0x0a5311bd2a6608f08a180df2ee7c5946819a649b204b554bb8e39825b2c50ad5";
const options = yargs_1.default
    .usage('$0 <path> -s [num] -e [num]', 'get births and fetch biggest momma within range')
    .option('_', {
    default: ['./storage.json'],
    describe: 'Path to a storage.json file. If no path is supplied, the current directory is used.'
})
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
let storage = options._[1];
console.log("Using file from " + storage);
let web3 = new web3_1.default(new web3_1.default.providers.HttpProvider("https://mainnet.infura.io/v3/" + config_json_1.default.id)); // http://localhost:8545 for local
// connect to local or remote node
let rangeSize = 10;
let totalPregnancyCount = 0;
let totalMommaMap = new Map();
// if (typeof web3 !== 'undefined') {
//     web3 = new Web3(web3.currentProvider);
//    } else {
//     // set the provider you want from Web3.providers
//     web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
// }
// https://web3js.readthedocs.io/en/v1.2.7/web3-eth.html#getpastlogs
// 
for (let blockNumberIter = options.s; blockNumberIter <= options.e;) {
    let start = blockNumberIter;
    let end = (start + rangeSize > options.e) ? options.e : start + rangeSize;
    let startIncrementDifference = start % rangeSize; // if start is rangeSize, will just get rangeSize + start, so need to check so will get start instead
    let startIncrement = (startIncrementDifference === 0) ? start : (rangeSize - startIncrementDifference) + start; // next higher than start that is a stored increment
    let endIncrement = end - end % rangeSize; // next lower than end that is a stored increment, can be 0
    // start <= startIncrement
    // endIncrement < end
    if (start < end && end < startIncrement) {
        queryInfura(start, end, false);
    }
    else {
        // Stats from start to startIncrement
        if (start < startIncrement && startIncrement < end) {
            queryInfura(start, startIncrement - 1, false); // as the range is inclusive and don't want overlap
        }
        // Stats from startIncrement to endIncrement
        if (endIncrement > startIncrement) {
            // check if file has stats for this range
            let processed = false; // jump functions don't work inside read file
            fs_1.default.readFile(storage, (err, data) => {
                if (err) {
                    console.log("Error reading file " + storage + ": " + err);
                }
                else {
                    let json = JSON.parse(data.toString());
                    if (json[start]) {
                        // Add to total stats
                        if (json[start].endBlock === endIncrement) {
                            console.log("Found in file!");
                            totalPregnancyCount += json[start].totalBirths;
                            mergeObjectIntoMap(totalMommaMap, json[start].mommaMap);
                            processed = true;
                        }
                    }
                }
            });
            if (!processed) {
                queryInfura(startIncrement, endIncrement - 1, true);
            }
        }
        // Stats from endIncrement to end
        if (start < endIncrement && endIncrement < end) {
            queryInfura(endIncrement, end - 1, false);
        }
    }
    blockNumberIter = end;
}
console.log("Pregnancy Count: " + totalPregnancyCount);
// get max momma
let maxBirths;
let maxMatronId;
for (const [key, value] of totalMommaMap.entries()) {
    if (!maxBirths || maxBirths < value) {
        maxBirths = value;
        maxMatronId = key;
    }
}
console.log("Max matron: " + maxMatronId + " with " + maxBirths);
function mergeMaps(to, from) {
    from.forEach((value, key) => { var _a, _b; return to.set(key, ((_a = to.get(key)) !== null && _a !== void 0 ? _a : 0) + ((_b = from.get(key)) !== null && _b !== void 0 ? _b : 0)); });
}
function mergeObjectIntoMap(to, from) {
    var _a;
    for (const key in from) {
        to.set(key, ((_a = to.get(key)) !== null && _a !== void 0 ? _a : 0) + from[key]);
    }
}
function strMapToObj(strMap) {
    let obj = Object.create(null);
    for (let [key, value] of strMap) {
        obj[key] = value;
    }
    return obj;
}
function objToStrMap(obj) {
    let strMap = new Map();
    for (let key of Object.keys(obj)) {
        strMap.set(key, obj[key]);
    }
    return strMap;
}
// Returns a promise after querying and writing
// write only if within increments
function queryInfura(start, end, write = true) {
    // only use if writing
    let pregnancyCount = 0;
    let mommaMap = new Map();
    // return
    // web3.eth.getPastLogs({
    //     address: ADDRESS,
    //     topics: [BIRTH_TOPIC],
    //     fromBlock: start,
    //     toBlock: end
    // }, (err, result) => {
    //     if (err) {
    //         console.log("Error getting logs: " + err);
    //     }
    let result;
    fs_1.default.readFile('./dummy_data.json', (err, data) => {
        var _a, _b;
        if (err) {
            console.log("Error reading file " + storage + ": " + err);
        }
        else {
            result = JSON.parse(data.toString());
            // }).then(result => {
            // for each log in the result
            for (let i = 0; i < result.length; i++) {
                // chop off the first two 0x from the string, then divide into 64-character parameters
                let data = result[i].data.substring(2).match(/[\s\S]{1,64}/g);
                let matronId = data ? data[2].replace(/^0+(?!$)/, "") : null;
                // choosing not to parseInt to convert hex string (without a 0x prefix) to decimal number so can convert mommaMap to a json object with string keys
                // will need to convert in order to get biggest momma kitty by id
                if (matronId != null) {
                    let initialValue = (_a = mommaMap.get(matronId)) !== null && _a !== void 0 ? _a : 0;
                    mommaMap.set(matronId, ++initialValue);
                    pregnancyCount++;
                    // TODO: may move after this then so can apply even if get data from file
                    totalPregnancyCount++;
                    let totalInitialValue = (_b = totalMommaMap.get(matronId)) !== null && _b !== void 0 ? _b : 0;
                    totalMommaMap.set(matronId, ++totalInitialValue);
                }
            }
            if (write) {
                // write statistics to file so won't have to call for the same range again
                let stats = {
                    startBlock: start,
                    endBlock: end,
                    totalBirths: pregnancyCount,
                    mommaMap: strMapToObj(mommaMap)
                };
                fs_1.default.readFile(storage, (err, data) => {
                    if (err)
                        console.log("Error reading file " + storage + ": " + err);
                    let json = JSON.parse(data.toString());
                    json.push(start + ': ' + stats);
                    fs_1.default.writeFile(storage, JSON.stringify(json), (err) => {
                        if (err)
                            console.log("Error writing to file " + storage + ": " + err);
                    });
                });
            }
        }
    });
}
