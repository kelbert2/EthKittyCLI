#!/usr/bin/env node

// TODO
// Add own log of data for each x range of blocks for cache-like behavior (as Infura will limit the number of calls that can be made)
// Test querying of ranges larger than one

// Add querying of cryptokitties API to get relevant stats on the biggest momma

// optimization: only store increments - like 1000 to 2000 rather than 1001 to 1019
// so that ideally will only have to get logs for the first < rangeSize and last < rangeSize 

// Command-Line Interface
import yargs from 'yargs';
import Web3 from 'web3';
import config from './config.json'; // infura project id
import fs from 'fs';
const KITTIES_URL = 'https://api/cryptokitties.co';
const ADDRESS = "0x06012c8cf97BEaD5deAe237070F9587f8E7A266d";
const BIRTH_TOPIC = "0x0a5311bd2a6608f08a180df2ee7c5946819a649b204b554bb8e39825b2c50ad5";

const options = yargs
    .usage('$0 [options] <path> -s [num] -e [num]', 'get births and fetch biggest momma within range')
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
let web3: Web3 = new Web3(new Web3.providers.HttpProvider("https://mainnet.infura.io/v3/" + config.id)); // http://localhost:8545 for local
// connect to local or remote node
let rangeSize = 10;
let totalPregnancyCount = 0;
let totalMommaMap = new Map<string, number>();

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
    } else {

        // Stats from start to startIncrement
        if (start < startIncrement && startIncrement < end) {
            queryInfura(start, startIncrement - 1, false); // as the range is inclusive and don't want overlap
        }

        // Stats from startIncrement to endIncrement
        if (endIncrement > startIncrement) {
            // check if file has stats for this range
            let processed = false; // jump functions don't work inside read file

            fs.readFile(storage, (err, data) => {
                if (err) {
                    console.log("Error reading file " + storage + ": " + err);
                } else {
                    let json = JSON.parse(data.toString());

                    if (json[start] as StorageItem) {
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

// TODO: Fetch kitty stats from api


// eth_getLogs( fromBlock, toBlock, topics [])
// get log entries between the blocks that correspond to birth events
// topics: compute signature of event with keccak256(“Birth(address,uint256,uint256,uint256,uint256)”) =
// 0x0a5311bd2a6608f08a180df2ee7c5946819a649b204b554bb8e39825b2c50ad5



// create file of stats in 10,000 block increments (the max an infura request will return)
// number of births
// map of mommas
// check to see if range includes a block increment within the file



interface StorageItem {
    startBlock: number;
    endBlock: number;
    totalBirths: number;
    mommaMap: mapObject<number>;
}

interface Kitty {
    birth: Date;
    generation: number;
    genes: string; // web3 receives uint256 as strings, or could use BigNumber.js to parse
}

function mergeMaps(to: Map<string, number>, from: Map<string, number>) {
    from.forEach((value, key) => to.set(key, (to.get(key) ?? 0) + (from.get(key) ?? 0)));
}
function mergeObjectIntoMap(to: Map<string, number>, from: mapObject<number>) {
    for (const key in from) {
        to.set(key, (to.get(key) ?? 0) + from[key]);
    }
}
function strMapToObj<T>(strMap: Map<string, T>) {
    let obj = Object.create(null) as mapObject<T>;
    for (let [key, value] of strMap) {
        obj[key] = value;
    }
    return obj;
}
function objToStrMap<T>(obj: mapObject<T>) {
    let strMap = new Map<string, T>();
    for (let key of Object.keys(obj)) {
        strMap.set(key, obj[key]);
    }
    return strMap;
}
type mapObject<T> = {
    [key: string]: T;
}

// Returns a promise after querying and writing
// write only if within increments
function queryInfura(start: number, end: number, write = true) {
    // only use if writing
    let pregnancyCount = 0;
    let mommaMap = new Map<string, number>();

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

    let result: DummyLog[];

    fs.readFile('./dummy_data.json', (err, data) => {
        if (err) {
            console.log("Error reading file " + storage + ": " + err);
        } else {
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
                    let initialValue = mommaMap.get(matronId) ?? 0;
                    mommaMap.set(matronId, ++initialValue);
                    pregnancyCount++;

                    // TODO: may move after this then so can apply even if get data from file
                    totalPregnancyCount++;
                    let totalInitialValue = totalMommaMap.get(matronId) ?? 0;
                    totalMommaMap.set(matronId, ++totalInitialValue);
                }
            }

            if (write) {
                // write statistics to file so won't have to call for the same range again
                let stats: StorageItem = {
                    startBlock: start,
                    endBlock: end,
                    totalBirths: pregnancyCount,
                    mommaMap: strMapToObj(mommaMap)
                }
                fs.readFile(storage, (err, data) => {
                    if (err) console.log("Error reading file " + storage + ": " + err);
                    let json = JSON.parse(data.toString());
                    json.push(start + ': ' + stats);

                    fs.writeFile(storage, JSON.stringify(json), (err) => {
                        if (err) console.log("Error writing to file " + storage + ": " + err);
                    });
                });
            }

        }
    });
}

interface DummyLog {
    address: string;
    blockHash: string;
    blockNumber: number;
    data: string;
    logIndex: number;
    removed: boolean;
    topics: string[];
    transactionHash: string;
    transactionIndex: number;
    id: string;
}