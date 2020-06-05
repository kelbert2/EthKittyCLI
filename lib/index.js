#!/usr/bin/env node
"use strict";
// TODO
// Add querying of cryptokitties API to get relevant stats on the biggest momma
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
const axios_1 = __importDefault(require("axios"));
const fs_1 = __importDefault(require("fs"));
const config_json_1 = __importDefault(require("./config.json")); // infura project id, x-api-token for cryptokitties developers
const contract_1 = require("./contract");
const ADDRESS = '0x06012c8cf97BEaD5deAe237070F9587f8E7A266d';
const BIRTH_TOPIC = "0x0a5311bd2a6608f08a180df2ee7c5946819a649b204b554bb8e39825b2c50ad5";
const KITTIES_URL = 'https://public.api.cryptokitties.co/v1/kitties/'; // append kitty id to fetch
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
    default: 10207402
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
        fs_1.default.existsSync(storage);
    }
    catch (err) {
        console.error("Storage file not found: " + err);
    }
    if (verbose)
        console.log("Using file from " + storage);
}
let web3 = new web3_1.default(new web3_1.default.providers.HttpProvider("https://mainnet.infura.io/v3/" + config_json_1.default.id)); // http://localhost:8545 for local
let totalPregnancyCount = 0;
let totalMommaMap = new Map();
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
    for (let i = 0; i < maxMatronId.length; i++) {
        console.log("Biggest momma id: " + parseInt("0x" + maxMatronId[i]) + " with " + maxBirths + " births within range.");
        console.log("hex value: " + maxMatronId[i]);
        // TODO: maybe await on the result of this or add a finally with birth stats so the all of the array's results from above don't appear before any api query result
        const kittyContract = new web3.eth.Contract(contract_1.CORE_ABI, ADDRESS);
        kittyContract.methods.getKitty("0x" + maxMatronId[i]).call()
            .then((res) => {
            console.log("response from getKitty");
            console.log(res);
        })
            .catch((err) => {
            console.log("Error querying getKitty: " + err);
        });
        axios_1.default({
            'method': 'GET',
            'url': KITTIES_URL + parseInt("0x" + maxMatronId[i]),
            'headers': {
                'x-api-token': config_json_1.default.token
            }
        })
            .then((response) => console.log(response.data.name))
            .catch((err) => console.log("Error in api request: " + err));
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
        for (let blockNumberIter = startBlock; blockNumberIter < endBlock;) {
            let start = blockNumberIter;
            let incrementDifference = start % RANGE_SIZE; // if start is rangeSize, will just get rangeSize + start, so need to check so will get start instead
            let increment = (incrementDifference === 0) ? start : RANGE_SIZE - incrementDifference + start; // next higher than start that is a stored increment unless start is at an increment
            let end = (increment + RANGE_SIZE) > endBlock ? endBlock : increment + RANGE_SIZE;
            if (verbose)
                console.log((start - difference) + " - " + (increment - difference) + " - " + (end - difference));
            // If too small for an increment that would be stored in the storage file
            // ideally will only have to get logs for the first < rangeSize and last < rangeSize, as the rest of the data will be in the file.
            if (start < end && end < increment) {
                if (verbose)
                    console.log("looking between blocks " + start + " and " + end + " with no writing to file.");
                yield queryInfura(start, end, false);
            }
            else {
                // Stats from start to increment, if start itself is not at an increment
                if (start < increment && increment < end) {
                    if (verbose)
                        console.log("looking between blocks without writing" + start + " and " + (increment - 1));
                    yield queryInfura(start, increment, false);
                }
                // Stats from increment to end
                if (end > increment) {
                    if (verbose)
                        console.log("looking between blocks " + increment + " and " + (end - 1));
                    yield checkFile(increment, end);
                }
            }
            blockNumberIter = end;
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
                            console.log("found in file:");
                            console.log(json[start]);
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
function queryInfura(start, end, write = true) {
    // only use if writing
    let pregnancyCount = 0;
    let mommaMap = new Map();
    if (verbose)
        console.log("Preparing to query Infura.");
    return web3.eth.getPastLogs({
        address: ADDRESS,
        topics: [BIRTH_TOPIC],
        fromBlock: start,
        toBlock: end
    }, (err, result) => {
        var _a, _b;
        if (err) {
            console.log("Error getting logs: " + err);
        }
        if (verbose)
            console.log("Queried from Infura for blocks " + (start - difference) + " to " + (end - difference));
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
                if (verbose)
                    console.log("found matronId: " + matronId);
                if (matronId != null) {
                    let initialValue = (_a = mommaMap.get(matronId)) !== null && _a !== void 0 ? _a : 0;
                    mommaMap.set(matronId, ++initialValue);
                    pregnancyCount++;
                    // TODO: may move after this then so can apply even if get data from file
                    let totalInitialValue = (_b = totalMommaMap.get(matronId)) !== null && _b !== void 0 ? _b : 0;
                    totalMommaMap.set(matronId, ++totalInitialValue);
                    totalPregnancyCount++;
                    if (verbose)
                        console.log("Current total pregnancy count: " + totalPregnancyCount);
                }
            }
            if (useFile && write) {
                // write statistics to file so won't have to call for the same range again
                if (verbose)
                    console.log("writing " + pregnancyCount + " births to file for blocks " + (start - difference) + " to " + (end - difference));
                let stats = {
                    "startBlock": start,
                    "endBlock": end,
                    "totalBirths": pregnancyCount,
                    "mommaMap": strMapToObj(mommaMap)
                };
                try {
                    let data = fs_1.default.readFileSync(storage);
                    let json = JSON.parse(data.toString());
                    // TODO: Right now need the file to be [] at start - find a way to check if empty first so can create the array to push to
                    if (!json[start]) {
                        json[start] = stats;
                        fs_1.default.writeFileSync(storage, JSON.stringify(json));
                    }
                }
                catch (e) {
                    console.log("Error with file " + storage + ": " + e);
                }
            }
        }
        catch (e) {
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
