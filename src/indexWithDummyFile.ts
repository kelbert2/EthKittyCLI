#!/usr/bin/env node
// For use testing with dummy queries to ensure that sectioning up request into increments properly.

// Command-Line Interface
import yargs from 'yargs';
import Web3 from 'web3';

import fs from 'fs';
import config from './config.json'; // infura project id, x-api-token for cryptokitties developers
import { CORE_ABI, ADDRESS } from './contract';

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
        default: 2
    })
    .option("e", {
        alias: "end",
        describe: "ending block",
        type: "number",
        default: 22
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
const storage = options.f;
const dummy = './dummy_data.json';
const useFile = !options.n;
const verbose = options.v;
const difference = 0;

if (useFile) {
    try {
        fs.existsSync(storage);
        fs.existsSync(dummy);
        if (verbose) console.log("Using file from " + storage);
        if (verbose) console.log("Using dummy file from " + dummy);
    } catch (err) {
        console.error("Storage or dummy file not found: " + err);
    }
}

const web3: Web3 = new Web3(new Web3.providers.HttpProvider("https://mainnet.infura.io/v3/" + config.id)); // http://localhost:8545 for local
const kittyContract = new web3.eth.Contract(CORE_ABI, ADDRESS);

let totalPregnancyCount = 0;
let totalMommaMap = new Map<string, number>();

searchBlocks(options.s, options.e).then(() => {
    console.log("Total number of pregnancies within range: " + totalPregnancyCount);
    // get max momma(s)
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
            console.log("Matron id: " + maxMatronId[i]);
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
        let end = endBlock;

        if (verbose) console.log((start - difference) + " - " + (nextIncrement - difference) + " - " + (end - difference));

        // If too small for an increment that would be stored in the storage file
        // ideally will only have to get logs for the first < rangeSize and last < rangeSize, as the rest of the data will be in the file.
        if (start <= end) {

            if (end < nextIncrement) {
                if (verbose) console.log("looking between blocks " + start + " and " + end);

                if (start === nearestNextIncrement && end === nextIncrement - 1) {
                    await checkFile(start, nextIncrement);
                } else {
                    await queryInfura(start, end, false);
                }
            } else {
                // Stats from start to increment, if start itself is not at an increment
                if (start < nextIncrement && nextIncrement - 1 <= end) {
                    if (verbose) console.log("looking between blocks " + start + " and " + (nextIncrement - 1));
                    if (start === nearestNextIncrement) {
                        await checkFile(start, nextIncrement);
                    } else {
                        console.log("Without writing");
                        await queryInfura(start, nextIncrement - 1, false); // in order to avoid overlap with next call, subtract one here.
                    }
                }
                if (end === nextIncrement) {
                    if (verbose) console.log("looking between blocks with no writing " + end + " and " + (end));
                    await queryInfura(end, end, false);
                }
            }
        }
        // attempt at solving for edge case where end falls on an increment - don't want it to be skipped as increments are only counted when start = increment
        blockNumberIter = nextIncrement;
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
                        // console.log("found in file:");
                        // console.log(json[start]);
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
function queryInfura(start: number, end: number, write = false) {
    // only use if writing
    let pregnancyCount = 0;
    let mommaMap = new Map<string, number>();

    if (verbose) console.log("Querying Infura to communicate with the blockchain...");

    try {
        let result: Log[];
        const data = fs.readFileSync('./dummy_data.json');
        console.log("Parsing dummy data");
        result = JSON.parse(data.toString());

        if (verbose) console.log("Queried from Infura for blocks " + (start - difference) + " to " + (end - difference));
        // console.log(result);

        for (let i = 0; i < result.length; i++) {
            // chop off the first two 0x from the string, then divide into 64-character parameters
            let data = result[i].data.substring(2).match(/[\s\S]{1,64}/g);

            let matronId = data ? data[2].replace(/^0+(?!$)/, "") : null;
            // choosing not to parseInt to convert hex string (without a 0x prefix) to decimal number so can convert mommaMap to a json object with string keys
            // will need to convert in order to get biggest momma kitty by id
            // if (verbose) console.log("Found matronId: 0x" + matronId);
            if (matronId != null) {
                let initialValue = mommaMap.get(matronId) ?? 0;
                mommaMap.set(matronId, ++initialValue);
                pregnancyCount++;

                // TODO: may move after this then so can apply even if get data from file
                let totalInitialValue = totalMommaMap.get(matronId) ?? 0;
                totalMommaMap.set(matronId, ++totalInitialValue);
                totalPregnancyCount++;
                // if (verbose) console.log("Current total pregnancy count: " + totalPregnancyCount);
            }
        }
    } catch (e) {
        console.log("JSON parsing error: " + e);
    }
}