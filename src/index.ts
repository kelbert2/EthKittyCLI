#!/usr/bin/env node

// TODO
// Add querying of cryptokitties API to get relevant stats on the biggest momma
// Refactor increment logic

// Command-Line Interface
import yargs from 'yargs';
import Web3 from 'web3';

import axios from 'axios';
import fs from 'fs';
import config from './config.json'; // infura project id, x-api-token for cryptokitties developers
import { CORE_ABI } from './contract';
import * as abi from './abi.json';

const ADDRESS = '0x06012c8cf97BEaD5deAe237070F9587f8E7A266d';
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
        default: 10207460
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

// Establish storage file =================================================
let storage = options.f;
let useFile = !options.n;
let verbose = options.v;
let difference = 0;

if (useFile) {
    try {
        fs.existsSync(storage);
    } catch (err) {
        console.error("Storage file not found: " + err);
    }

    if (verbose) console.log("Using file from " + storage);
}


let web3: Web3 = new Web3(new Web3.providers.HttpProvider("https://mainnet.infura.io/v3/" + config.id)); // http://localhost:8545 for local
const kittyContract = new web3.eth.Contract(CORE_ABI, ADDRESS);
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
    console.log("Number of pregnancies within range: " + totalPregnancyCount);
    // get max momma
    let maxBirths = 0;
    let maxMatronId: string[] = []; // in case there's a tie
    for (const [key, value] of totalMommaMap.entries()) {
        if (!maxBirths || maxBirths <= value) {
            if (maxBirths === value) {
                maxMatronId.push(key);
            } else {
                maxBirths = value;
                maxMatronId = [key];
            }
        }
    }

    if (maxMatronId.length > 0) {
        if (maxMatronId.length > 1) {
            console.log("Found some big mommas with " + maxBirths + " birth" + + (maxBirths > 1 ? "s " : " ") + "within range.");
        } else {
            console.log("Found a big momma with " + maxBirths + " birth" + (maxBirths > 1 ? "s " : " ") + "within range.");
        }

        for (let i = 0; i < maxMatronId.length; i++) {
            let generation: number;
            let birthTime: string;

            axios({
                'method': 'GET',
                'url': KITTIES_URL + parseInt("0x" + maxMatronId[i]),
                'headers': {
                    'x-api-token': config.token
                }
            })
                .then((response: KittyResponse) => {

                    console.log("The " + response.data.color + " " + response.data.kittyType + " " + response.data.name + " has enhanced cattributes:");
                    console.log(response.data.enhancedCattributes);
                })
                .catch((err) => console.log("Error in api request: " + err))
                .then(kittyContract.methods.getKitty("0x" + maxMatronId[i]).call()
                    .then((res: KittyEth) => {
                        console.log("Generation: " + res.generation);
                        console.log("Birth: " + (new Date(res.birthTime)).toUTCString());

                        console.log("Genes for cat with matronId " + parseInt("0x" + maxMatronId[i]) + ":");
                        console.log(res.genes);
                        // To decode the genome: 
                        // https://medium.com/newtown-partners/cryptokitties-genome-mapping-6412136c0ae4
                        // https://public.api.cryptokitties.co/v1/cattributes/eyes/12
                        // or just plug in the id: https://kittycalc.co/read/?k1=462838&k2=461679
                    })
                    .catch((err: any) => {
                        console.log("Error querying getKitty: " + err);
                    })).then(() => {
                        if (verbose) console.log("Matron id: " + parseInt("0x" + maxMatronId[i]))
                    });
        }
    } else {
        console.log("Found no mommas within range.");
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
interface KittyResponse {
    status: number;
    data: {
        id: number;
        name: string;
        generation: number;
        created_at: string;
        color: string;
        kittyType: string;
        enhancedCattributes: string[];
        isExclusive: boolean;
    }
}
interface KittyEth {
    isGestating: boolean;
    isReady: boolean;
    cooldownIndex: string;
    nextActionAt: string;
    siringWithId: string;
    birthTime: string;
    matronId: string;
    sireId: string;
    generation: string;
    genes: string;
}
interface Kitty {
    birth: Date;
    name: string;
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

    // TODO: refactor logic
    // Cases
    // start < increment
    // start = increment
    // end = increment
    // end > increment
    // end < increment
    for (let blockNumberIter = startBlock; blockNumberIter < endBlock;) {
        let start = blockNumberIter;
        let incrementDifference = start % RANGE_SIZE; // if start is rangeSize, will just get rangeSize + start, so need to check so will get start instead
        // let increment = (incrementDifference === 0) ? start : RANGE_SIZE - incrementDifference + start; // next higher than start that is a stored increment unless start is at an increment
        let nextIncrement = RANGE_SIZE - incrementDifference + start;
        let nearestNextIncrement = (incrementDifference === 0) ? start : nextIncrement;
        let end = (nextIncrement + RANGE_SIZE) > endBlock ? endBlock : nextIncrement + RANGE_SIZE;

        if (verbose) console.log((start - difference) + " - " + (nextIncrement - difference) + " - " + (end - difference));

        // If too small for an increment that would be stored in the storage file
        // ideally will only have to get logs for the first < rangeSize and last < rangeSize, as the rest of the data will be in the file.
        if (start <= end && end < nextIncrement) {
            if (verbose) console.log("looking between blocks " + start + " and " + end);
            
            if (start === nearestNextIncrement && end === nextIncrement - 1) {
                await checkFile(start, nextIncrement);
            } else {
                await queryInfura(start, end, false);
            }
        } else {
            // Stats from start to increment, if start itself is not at an increment
            if (start < nextIncrement && nextIncrement < end) {
                if (verbose) console.log("looking between blocks without writing" + start + " and " + (nextIncrement - 1));
                await queryInfura(start, nextIncrement - 1, false); // in order to avoid overlap with next call, subtract one here.
            }

            // Stats from increment to end
            if (end > nextIncrement) {
                if (verbose) console.log("looking between blocks " + nextIncrement + " and " + (end - 1));
                await checkFile(nextIncrement, end);
            } else if (end === nextIncrement) {
                if (verbose) console.log("looking between blocks with no writing " + nextIncrement + " and " + (end));
                await queryInfura(start, end, false);
            }
        }
        // attempt at solving for edge case where end falls on an increment - don't want it to be skipped as increments are only counted when start = increment
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

        try {
            for (let i = 0; i < result.length; i++) {
                // chop off the first two 0x from the string, then divide into 64-character parameters
                let data = result[i].data.substring(2).match(/[\s\S]{1,64}/g);

                let matronId = data ? data[2].replace(/^0+(?!$)/, "") : null;
                // choosing not to parseInt to convert hex string (without a 0x prefix) to decimal number so can convert mommaMap to a json object with string keys
                // will need to convert in order to get biggest momma kitty by id
                if (verbose) console.log("Found matronId: 0x" + matronId);
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