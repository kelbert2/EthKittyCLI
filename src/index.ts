#!/usr/bin/env node

// TODO
// Add querying of cryptokitties API to get relevant stats on the biggest momma

// Command-Line Interface
import yargs from 'yargs';
import Web3 from 'web3';
import axios from 'axios';
import fs from 'fs';
import config from './config.json'; // infura project id, x-api-token for cryptokitties developers

const ADDRESS = "0x06012c8cf97BEaD5deAe237070F9587f8E7A266d";
const BIRTH_TOPIC = "0x0a5311bd2a6608f08a180df2ee7c5946819a649b204b554bb8e39825b2c50ad5";
const KITTIES_URL = 'https://public.api.cryptokitties.co/v1/kitties/'; // append kitty id to fetch
const RANGE_SIZE = 10;

const options = yargs
    .usage('Usage: $0 [options] -f [/path/to/file.json] -s [starting-block-number] -e [ending-block-number] -n -v')
    .example('$0 -f ../path/storage.json -s 0 -e 3', 'get births and fetch biggest momma between blocks 0 - 3 inclusive, using stored statistics from ../path/storage.json')
    .option("f", {
        alias: "file",
        describe: 'Path to a storage .json file. If no path is supplied, the current directory is used.',
        type: "string",
        default: './storage.json'
    })
    .option("s", {
        alias: "start",
        describe: "starting block",
        type: "number",
        default: 10207400
    })
    .option("e", {
        alias: "end",
        describe: "ending block",
        type: "number",
        default: 10207461
    })
    .option("n", {
        alias: "no-file",
        describe: "Will not read or write to a storage file",
        type: "boolean",
        default: false
    })
    .option("v", {
        alias: "verbose",
        describe: "descriptive log of process",
        type: "boolean",
        default: false
    })
    .argv;
// default blocks: 6607985, 7028323

// TODO: make file writing and reading optional 
// Establish storage file =================================================
let storage = options.f;
let useFile = !options.n;
let verbose = options.v;
let difference = Math.abs(options.e - options.s);

if (useFile) {
    try {
        fs.existsSync(storage);
    } catch (err) {
        console.error("Storage file not found: " + err);
    }

    if (verbose) console.log("Using file from " + storage);
}


let web3: Web3 = new Web3(new Web3.providers.HttpProvider("https://mainnet.infura.io/v3/" + config.id)); // http://localhost:8545 for local

let totalPregnancyCount = 0;
let totalMommaMap = new Map<string, number>();

// if (typeof web3 !== 'undefined') {
//     web3 = new Web3(web3.currentProvider);
//    } else {
//     // set the provider you want from Web3.providers
//     web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
// }

// https://web3js.readthedocs.io/en/v1.2.7/web3-eth.html#getpastlogs
searchBlocks(options.s, options.e).then(() => {
    console.log("Pregnancy Count: " + totalPregnancyCount);
    // get max momma
    let maxBirths;
    let maxMatronId: number[] = []; // in case there's a tie
    for (const [key, value] of totalMommaMap.entries()) {
        if (!maxBirths || maxBirths <= value) {
            if (maxBirths === value) {
                maxMatronId.push(parseInt("0x" + key)); // convert from hex string to decimal. Stored as hex string in file to avoid excess conversions and maintain string keys in the map for easier JSON conversion.
            } else {
                maxBirths = value;
                maxMatronId = [parseInt("0x" + key)];
            }
        }
    }

    for (let i = 0; i < maxMatronId.length; i++) {
        console.log("Biggest momma id: " + maxMatronId[i] + " with " + maxBirths + " births within range.");

        // TODO: maybe await on the result of this or add a finally with birth stats so the all of the array's results from above don't appear before any api query result
        // const apiClient = axios.create({
        //     baseURL: KITTIES_URL,
        //     responseType: 'json',
        //     headers: {
        //         'x-api-token': 'ABC'
        //     }
        // });
        // apiClient.get<Kitty>().then(res => console.log(res));
        axios({
            'method': 'GET',
            'url': KITTIES_URL + maxMatronId[i],
            'headers': {
                'x-api-token': config.token
            }
        })
            .then((response) => console.log(response))
            .catch((err) => console.log("Error in api request: " + err));
    }
});


type MapObject<T> = {
    [key: string]: T;
}
interface StorageItem {
    startBlock: number;
    endBlock: number;
    totalBirths: number;
    mommaMap: MapObject<number>;
}
interface Kitty {
    birth: Date;
    generation: number;
    genes: string; // web3 receives uint256 as strings, or could use BigNumber.js to parse
}

function mergeObjectIntoMap(to: Map<string, number>, from: MapObject<number>) {
    for (const key in from) {
        to.set(key, (to.get(key) ?? 0) + from[key]);
    }
}
function strMapToObj<T>(strMap: Map<string, T>) {
    let obj = Object.create(null) as MapObject<T>;
    for (let [key, value] of strMap) {
        obj[key] = value;
    }
    return obj;
}

async function searchBlocks(startBlock: number, endBlock: number) {
    if (startBlock > endBlock) {
        // switch
        if (verbose) console.log("Start block number must be smaller than end. Switching them to continue execution.");
        let temp = endBlock;
        endBlock = startBlock;
        startBlock = temp;
    }

    for (let blockNumberIter = startBlock; blockNumberIter < endBlock;) {
        let start = blockNumberIter;
        let startIncrementDifference = start % RANGE_SIZE; // if start is rangeSize, will just get rangeSize + start, so need to check so will get start instead
        // let startIncrement = (startIncrementDifference === 0) ? start : (rangeSize - startIncrementDifference) + start; // next higher than start that is a stored increment
        let startIncrement = RANGE_SIZE - startIncrementDifference + start;
        let end = (startIncrement + RANGE_SIZE) > endBlock ? endBlock : startIncrement + RANGE_SIZE;

        if (verbose) console.log((start - difference) + " - " + (startIncrement - difference) + " - " + (end - difference));

        // If too small for an increment that would be stored in the storage file
        // ideally will only have to get logs for the first < rangeSize and last < rangeSize, as the rest of the data will be in the file.
        if (start < end && end < startIncrement) {
            if (verbose) console.log("looking between blocks " + start + " and " + end + " with no writing to file.");
            await queryInfura(start, end, false);
        } else {
            // Stats from start to startIncrement
            if (start < startIncrement && startIncrement < end) {
                if (verbose) console.log("looking between blocks " + start + " and " + (startIncrement - 1));
                await checkFile(start, startIncrement);
            }

            // Stats from startIncrement to endIncrement
            if (end > startIncrement) {
                if (verbose) console.log("looking between blocks " + startIncrement + " and " + (end - 1));
                await checkFile(startIncrement, end);
            }
        }

        blockNumberIter = end;
    }
}

async function checkFile(start: number, end: number) {
    // check if file has stats for this range
    let processed = false; // jump functions don't work inside read file

    if (useFile) {
        try {
            let data = fs.readFileSync(storage)
            let json = JSON.parse(data.toString());

            if (json[start] as StorageItem) {
                // Add to total stats
                if (verbose) console.log("Looking in file " + storage);
                if (json[start].endBlock === end - 1) {
                    if (verbose) {
                        console.log("found in file:");
                        console.log(json[start]);
                    }
                    totalPregnancyCount += json[start].totalBirths;
                    mergeObjectIntoMap(totalMommaMap, json[start].mommaMap);
                    processed = true;
                }
            }
        } catch (err) {
            console.log("Error reading file " + storage + ": " + err);
        }
    }

    if (!processed) {
        await queryInfura(start, end - 1, true); // as the range is inclusive and don't want overlap, subtracking one
    }
}

// Returns a promise after querying and writing
// write should be true only if start and end are increments of RANGE_SIZE
function queryInfura(start: number, end: number, write = true) {
    // only use if writing
    let pregnancyCount = 0;
    let mommaMap = new Map<string, number>();

    if (verbose) console.log("Preparing to query Infura.");

    return web3.eth.getPastLogs({
        address: ADDRESS,
        topics: [BIRTH_TOPIC],
        fromBlock: start,
        toBlock: end
    }, (err, result) => {
        if (err) {
            console.log("Error getting logs: " + err);
        }
        if (verbose) console.log("Queried from Infura for blocks " + (start - difference) + " to " + (end - difference));
        console.log(result);

        // let result: DummyLog[]; // using dummy log with its extensive looping, get 69

        // const data = fs.readFileSync('./dummy_data.json');
        // console.log("Parsing dummy data");
        try {
            // let result = JSON.parse(data.toString());

            // }).then(result => {
            // for each log in the result
            for (let i = 0; i < result.length; i++) {
                // chop off the first two 0x from the string, then divide into 64-character parameters
                let data = result[i].data.substring(2).match(/[\s\S]{1,64}/g);

                let matronId = data ? data[2].replace(/^0+(?!$)/, "") : null;
                // choosing not to parseInt to convert hex string (without a 0x prefix) to decimal number so can convert mommaMap to a json object with string keys
                // will need to convert in order to get biggest momma kitty by id
                if (verbose) console.log("found matronId: " + matronId);
                if (matronId != null) {
                    let initialValue = mommaMap.get(matronId) ?? 0;
                    mommaMap.set(matronId, ++initialValue);
                    pregnancyCount++;

                    // TODO: may move after this then so can apply even if get data from file
                    let totalInitialValue = totalMommaMap.get(matronId) ?? 0;
                    totalMommaMap.set(matronId, ++totalInitialValue);
                    totalPregnancyCount++;
                    if (verbose) console.log("Current total pregnancy count: " + totalPregnancyCount);
                }
            }

            if (useFile && write) {
                // write statistics to file so won't have to call for the same range again
                if (verbose) console.log("writing " + pregnancyCount + " births to file for blocks " + (start - difference) + " to " + (end - difference));
                let stats: StorageItem = {
                    "startBlock": start,
                    "endBlock": end,
                    "totalBirths": pregnancyCount,
                    "mommaMap": strMapToObj(mommaMap)
                }
                try {
                    let data = fs.readFileSync(storage);
                    let json = JSON.parse(data.toString());

                    // TODO: Right now need the file to be [] at start - find a way to check if empty first so can create the array to push to
                    if (!json[start]) {
                        json[start] = stats;

                        fs.writeFileSync(storage, JSON.stringify(json));
                    }
                } catch (e) {
                    console.log("Error with file " + storage + ": " + e);
                }
            }
        } catch (e) {
            console.log("JSON parsing error: " + e);
        }
    });
}

// eth_getLogs( fromBlock, toBlock, topics [])
// get log entries between the blocks that correspond to birth events
// topics: compute signature of event with keccak256(“Birth(address,uint256,uint256,uint256,uint256)”) =
// 0x0a5311bd2a6608f08a180df2ee7c5946819a649b204b554bb8e39825b2c50ad5



// create file of stats in 10,000 block increments (the max an infura request will return)
// number of births
// map of mommas
// check to see if range includes a block increment within the file