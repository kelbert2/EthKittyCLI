#!/usr/bin/env node
"use strict";
// For use testing with dummy queries to ensure that sectioning up request into increments properly.
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Command-Line Interface
const yargs_1 = __importDefault(require("yargs"));
const web3_1 = __importDefault(require("web3"));
const fs_1 = __importDefault(require("fs"));
const config_json_1 = __importDefault(require("./config.json")); // infura project id, x-api-token for cryptokitties developers
const contract_1 = require("./contract");
const RANGE_SIZE = 10;
const options = yargs_1.default
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
        fs_1.default.existsSync(storage);
        fs_1.default.existsSync(dummy);
        if (verbose)
            console.log("Using file from " + storage);
        if (verbose)
            console.log("Using dummy file from " + dummy);
    }
    catch (err) {
        console.error("Storage or dummy file not found: " + err);
    }
}
const web3 = new web3_1.default(new web3_1.default.providers.HttpProvider("https://mainnet.infura.io/v3/" + config_json_1.default.id)); // http://localhost:8545 for local
const kittyContract = new web3.eth.Contract(contract_1.CORE_ABI, contract_1.ADDRESS);
let totalPregnancyCount = 0;
let totalMommaMap = new Map();
searchBlocks(options.s, options.e).then(() => {
    console.log("Total number of pregnancies within range: " + totalPregnancyCount);
    // get max momma(s)
    let maxBirths = 0;
    let maxMatronId = []; // in case there's a tie
    for (const [key, value] of totalMommaMap.entries()) {
        if (!maxBirths || maxBirths <= value) {
            if (maxBirths === value) {
                maxMatronId.push(key);
            }
            else {
                maxBirths = value;
                maxMatronId = [key];
            }
        }
    }
    if (maxMatronId.length > 0) {
        if (maxMatronId.length > 1) {
            console.log("Found some big mommas with " + maxBirths + " birth" + +(maxBirths > 1 ? "s " : " ") + "within range.");
        }
        else {
            console.log("Found a big momma with " + maxBirths + " birth" + (maxBirths > 1 ? "s " : " ") + "within range.");
        }
        for (let i = 0; i < maxMatronId.length; i++) {
            console.log("Matron id: " + maxMatronId[i]);
        }
    }
    else {
        console.log("Found no mommas within range.");
    }
});
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
function searchBlocks(startBlock, endBlock) {
    return __awaiter(this, void 0, void 0, function* () {
        if (startBlock > endBlock) {
            // switch
            if (verbose)
                console.log("Start block number must be smaller than end. Switching them to continue execution.");
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
            if (verbose)
                console.log((start - difference) + " - " + (nextIncrement - difference) + " - " + (end - difference));
            // If too small for an increment that would be stored in the storage file
            // ideally will only have to get logs for the first < rangeSize and last < rangeSize, as the rest of the data will be in the file.
            if (start <= end) {
                if (end < nextIncrement) {
                    if (verbose)
                        console.log("looking between blocks " + start + " and " + end);
                    if (start === nearestNextIncrement && end === nextIncrement - 1) {
                        yield checkFile(start, nextIncrement);
                    }
                    else {
                        yield queryInfura(start, end, false);
                    }
                }
                else {
                    // Stats from start to increment, if start itself is not at an increment
                    if (start < nextIncrement && nextIncrement - 1 <= end) {
                        if (verbose)
                            console.log("looking between blocks " + start + " and " + (nextIncrement - 1));
                        if (start === nearestNextIncrement) {
                            yield checkFile(start, nextIncrement);
                        }
                        else {
                            console.log("Without writing");
                            yield queryInfura(start, nextIncrement - 1, false); // in order to avoid overlap with next call, subtract one here.
                        }
                    }
                    if (end === nextIncrement) {
                        if (verbose)
                            console.log("looking between blocks with no writing " + end + " and " + (end));
                        yield queryInfura(end, end, false);
                    }
                }
            }
            // attempt at solving for edge case where end falls on an increment - don't want it to be skipped as increments are only counted when start = increment
            blockNumberIter = nextIncrement;
        }
    });
}
function checkFile(start, end) {
    return __awaiter(this, void 0, void 0, function* () {
        // check if file has stats for this range
        let processed = false; // jump functions don't work inside read file
        if (useFile) {
            try {
                let data = fs_1.default.readFileSync(storage);
                let json = JSON.parse(data.toString());
                if (json[start]) {
                    // Add to total stats
                    if (verbose)
                        console.log("Looking in file " + storage);
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
            }
            catch (err) {
                console.log("Error reading file " + storage + ": " + err);
            }
        }
        if (!processed) {
            yield queryInfura(start, end - 1, true); // as the range is inclusive and don't want overlap, subtracking one
        }
    });
}
// Returns a promise after querying and writing
// write should be true only if start and end are increments of RANGE_SIZE
function queryInfura(start, end, write = false) {
    var _a, _b;
    // only use if writing
    let pregnancyCount = 0;
    let mommaMap = new Map();
    if (verbose)
        console.log("Querying Infura to communicate with the blockchain...");
    try {
        let result;
        const data = fs_1.default.readFileSync('./dummy_data.json');
        console.log("Parsing dummy data");
        result = JSON.parse(data.toString());
        if (verbose)
            console.log("Queried from Infura for blocks " + (start - difference) + " to " + (end - difference));
        // console.log(result);
        for (let i = 0; i < result.length; i++) {
            // chop off the first two 0x from the string, then divide into 64-character parameters
            let data = result[i].data.substring(2).match(/[\s\S]{1,64}/g);
            let matronId = data ? data[2].replace(/^0+(?!$)/, "") : null;
            // choosing not to parseInt to convert hex string (without a 0x prefix) to decimal number so can convert mommaMap to a json object with string keys
            // will need to convert in order to get biggest momma kitty by id
            // if (verbose) console.log("Found matronId: 0x" + matronId);
            if (matronId != null) {
                let initialValue = (_a = mommaMap.get(matronId)) !== null && _a !== void 0 ? _a : 0;
                mommaMap.set(matronId, ++initialValue);
                pregnancyCount++;
                // TODO: may move after this then so can apply even if get data from file
                let totalInitialValue = (_b = totalMommaMap.get(matronId)) !== null && _b !== void 0 ? _b : 0;
                totalMommaMap.set(matronId, ++totalInitialValue);
                totalPregnancyCount++;
                // if (verbose) console.log("Current total pregnancy count: " + totalPregnancyCount);
            }
        }
    }
    catch (e) {
        console.log("JSON parsing error: " + e);
    }
}
