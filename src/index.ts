#!/usr/bin/env node

// TODO
// Refactor increment logic

// Command-Line Interface
import yargs from 'yargs';
import Web3 from 'web3';

import axios from 'axios';
import fs from 'fs';
import config from './config.json'; // infura project id, x-api-token for cryptokitties developers
import { CORE_ABI, ADDRESS, BIRTH_TOPIC } from './contract';

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
        default: 10207462
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
const useFile = !options.n;
const verbose = options.v;

if (useFile) {
    try {
        fs.existsSync(storage);
        if (verbose) console.log("Using file from " + storage);
    } catch (err) {
        console.error("Storage file not found: " + err);
    }
}

// Connect to Ethereum ====================================================
if (verbose) console.log("Connecting to Ethereum...");
const web3: Web3 = new Web3(new Web3.providers.HttpProvider("https://mainnet.infura.io/v3/" + config.id)); // http://localhost:8545 for local
const kittyContract = new web3.eth.Contract(CORE_ABI, ADDRESS);

// Get Statistics =========================================================
let totalPregnancyCount = 0;
let totalMommaMap = new Map<string, number>();

searchBlocks(options.s, options.e).then(() => {
    console.log("Total number of pregnancies within range: " + totalPregnancyCount);

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
            console.log("Found some big mommas with " + maxBirths + " birth" + ((maxBirths > 1) ? "s " : " ") + "within range.");
        } else {
            console.log("Found a big momma with " + maxBirths + " birth" + ((maxBirths > 1) ? "s " : " ") + "within range.");
        }

        for (let i = 0; i < maxMatronId.length; i++) {
            let generation: number, ethGeneration: string;
            let birthTimeUTC: string, ethTimestamp: string;

            console.log("");
            axios({
                'method': 'GET',
                'url': KITTIES_URL + parseInt("0x" + maxMatronId[i]),
                'headers': {
                    'x-api-token': config.token
                }
            })
                .then((response: KittyResponse) => {
                    if (verbose) console.log("Querying CryptoKitties API...");

                    if (response.data.name) console.log("Name: " + response.data.name);
                    if (response.data.color) console.log("Color: " + response.data.color);
                    if (response.data.kittyType) console.log("Kitty type: " + response.data.kittyType);
                    if (response.data.enhancedCattributes) {
                        console.log("Enhanced cattributes: ");
                        console.log(response.data.enhancedCattributes);
                    }
                    generation = response.data.generation;
                    birthTimeUTC = response.data.created_at;
                })
                .catch((err) => console.error("Error querying CryptoKitties API: " + err)) // using catch to continue execution even after error
                .then(() => kittyContract.methods.getKitty("0x" + maxMatronId[i]).call()
                    .then((res: KittyEth) => {
                        if (verbose) console.log("Querying Ethereum Blockchain...");

                        ethGeneration = res.generation;
                        ethTimestamp = res.birthTime;
                        console.log("Genes for cat with matronId " + parseInt("0x" + maxMatronId[i]) + ":");
                        console.log(res.genes ?? "Not found.");
                        // To decode the genome: 
                        // https://medium.com/newtown-partners/cryptokitties-genome-mapping-6412136c0ae4
                        // https://public.api.cryptokitties.co/v1/cattributes/eyes/12
                        // or just plug in the id: https://kittycalc.co/read/?k1=462838&k2=461679
                    })
                    .catch((err: any) => {
                        console.error("Error querying Ethereum blockchain: " + err);
                    }))
                .then(() => {
                    console.log("Generation: " + ethGeneration ?? generation ?? "unknown.");
                    console.log("Birth: " + (ethTimestamp ? (new Date(parseInt(ethTimestamp) * 1000)).toUTCString() : birthTimeUTC ? (new Date(birthTimeUTC)).toUTCString() : "unknown"));
                });
        }
    } else {
        console.log("Found no mommas within range.");
    }
});

// Types ================================================================
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

// Helpers ================================================================
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

// Querying Methods =======================================================

// Ideally will only have to get logs for the first < rangeSize and last < rangeSize, as the rest of the data will be in the file.
async function searchBlocks(startBlock: number, endBlock: number) {
    if (startBlock > endBlock) {
        if (verbose) console.log("Start block number must be smaller than end. Switching them to continue execution.");
        let temp = endBlock;
        endBlock = startBlock;
        startBlock = temp;
    }

    if (verbose) console.log("Searching range: " + startBlock + " - " + endBlock);

    for (let blockNumberIter = startBlock; blockNumberIter < endBlock;) {
        let start = blockNumberIter;
        let incrementDifference = start % RANGE_SIZE;
        let nextIncrement = RANGE_SIZE - incrementDifference + start;
        let nearestNextIncrement = (incrementDifference === 0) ? start : nextIncrement; // next higher than start that is a stored increment unless start is at an increment

        if (start <= endBlock) {
            if (endBlock < nextIncrement) {
                if (verbose) console.log("Looking between blocks " + start + " and " + endBlock);

                if (start === nearestNextIncrement && endBlock === nextIncrement - 1) {
                    await checkFile(start, nextIncrement);
                } else {
                    await queryInfura(start, endBlock, false);
                }
            } else {
                if (start < nextIncrement && nextIncrement - 1 <= endBlock) {
                    if (verbose) console.log("Looking between blocks " + start + " and " + (nextIncrement - 1));
                    if (start === nearestNextIncrement) {
                        await checkFile(start, nextIncrement);
                    } else {
                        await queryInfura(start, nextIncrement - 1, false); // in order to avoid overlap with next call, subtract one here.
                    }
                }
                if (endBlock === nextIncrement) {
                    if (verbose) console.log("Looking between blocks with no writing " + endBlock + " and " + endBlock);
                    await queryInfura(endBlock, endBlock, false);
                }
            }
        }
        blockNumberIter = nextIncrement;
    }
}

async function checkFile(start: number, end: number) {
    let processed = false; // jump functions don't work inside read file

    if (useFile) {
        try {
            let data = fs.readFileSync(storage)
            let json = JSON.parse(data.toString());

            if (json[start] as StorageItem) {
                if (verbose) console.log("Looking in file " + storage + "...");
                if (json[start].endBlock === end - 1) {
                    totalPregnancyCount += json[start].totalBirths;
                    mergeObjectIntoMap(totalMommaMap, json[start].mommaMap);
                    processed = true;
                }
            }
        } catch (err) {
            console.error("Error reading file " + storage + ": " + err);
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

    if (verbose) console.log("Querying Infura to communicate with the blockchain for blocks " + start + " - " + end + "...");

    return web3.eth.getPastLogs({
        address: ADDRESS,
        topics: [BIRTH_TOPIC],
        fromBlock: start,
        toBlock: end
    }, (err, result) => {
        if (err) {
            console.error("Error getting logs: " + err);
        }
        try {
            for (let i = 0; i < result.length; i++) {
                // chop off the first two 0x from the string, then divide into 64-character parameters
                let data = result[i].data.substring(2).match(/[\s\S]{1,64}/g);

                let matronId = data ? data[2].replace(/^0+(?!$)/, "") : null;
                // choosing not to parseInt to convert hex string (without "0x" prefix) to decimal number so can convert mommaMap to a json object with string keys
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
                if (verbose) console.log("writing " + pregnancyCount + " births to file for blocks " + start + " to " + end);
                let stats: StorageItem = {
                    "startBlock": start,
                    "endBlock": end,
                    "totalBirths": pregnancyCount,
                    "mommaMap": strMapToObj(mommaMap)
                }
                try {
                    let data = fs.readFileSync(storage);
                    let json = JSON.parse(data.toString());

                    // TODO: Right now need the file to be {} at start - find a way to check if empty first so can create the object to add to
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