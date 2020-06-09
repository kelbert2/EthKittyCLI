#!/usr/bin/env node
"use strict";
// TODO
// Refactor increment logic
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
        fs_1.default.existsSync(storage);
        if (verbose)
            console.log("Using file from " + storage);
    }
    catch (err) {
        console.error("Storage file not found: " + err);
    }
}
// Connect to Ethereum ====================================================
if (verbose)
    console.log("Connecting to Ethereum...");
const web3 = new web3_1.default(new web3_1.default.providers.HttpProvider("https://mainnet.infura.io/v3/" + config_json_1.default.id)); // http://localhost:8545 for local
const kittyContract = new web3.eth.Contract(contract_1.CORE_ABI, contract_1.ADDRESS);
// Get Statistics =========================================================
let totalPregnancyCount = 0;
let totalMommaMap = new Map();
searchBlocks(options.s, options.e).then(() => {
    console.log("Total number of pregnancies within range: " + totalPregnancyCount);
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
            console.log("Found some big mommas with " + maxBirths + " birth" + ((maxBirths > 1) ? "s " : " ") + "within range.");
        }
        else {
            console.log("Found a big momma with " + maxBirths + " birth" + ((maxBirths > 1) ? "s " : " ") + "within range.");
        }
        for (let i = 0; i < maxMatronId.length; i++) {
            let cryptoKittiesResponse;
            let ethResponse;
            console.log("");
            axios_1.default({
                'method': 'GET',
                'url': KITTIES_URL + parseInt("0x" + maxMatronId[i]),
                'headers': {
                    'x-api-token': config_json_1.default.token
                }
            })
                .then((response) => {
                if (verbose)
                    console.log("Querying CryptoKitties API...");
                cryptoKittiesResponse = response;
            })
                .catch((err) => console.error("Error querying CryptoKitties API: " + err)) // using catch to continue execution even after error
                .then(() => kittyContract.methods.getKitty("0x" + maxMatronId[i]).call()
                .then((res) => {
                if (verbose)
                    console.log("Querying Ethereum Blockchain...");
                ethResponse = res;
            })
                .catch((err) => {
                console.error("Error querying Ethereum blockchain: " + err);
            }))
                .then(() => {
                var _a, _b, _c;
                console.log("Matron ID: " + parseInt("0x" + maxMatronId[i]));
                if (cryptoKittiesResponse.data.name)
                    console.log("Name: " + cryptoKittiesResponse.data.name);
                if (cryptoKittiesResponse.data.color)
                    console.log("Color: " + cryptoKittiesResponse.data.color);
                if (cryptoKittiesResponse.data.kittyType)
                    console.log("Kitty type: " + cryptoKittiesResponse.data.kittyType);
                if (cryptoKittiesResponse.data.enhancedCattributes) {
                    console.log("Enhanced cattributes: ");
                    console.log(cryptoKittiesResponse.data.enhancedCattributes);
                }
                console.log((_b = (_a = "Generation: " + ethResponse.generation) !== null && _a !== void 0 ? _a : cryptoKittiesResponse.data.generation) !== null && _b !== void 0 ? _b : "Unknown.");
                console.log("Birth: " + (ethResponse.birthTime
                    ? (new Date(parseInt(ethResponse.birthTime) * 1000)).toUTCString()
                    : cryptoKittiesResponse.data.created_at
                        ? (new Date(cryptoKittiesResponse.data.created_at)).toUTCString()
                        : "unknown"));
                // ethResponse.birthTime is a timestamp string
                // cryptoKittiesResponse.data.created_at is a UTC string
                console.log("Genes:");
                console.log((_c = ethResponse.genes) !== null && _c !== void 0 ? _c : "Not found.");
                // To decode the genome: 
                // https://medium.com/newtown-partners/cryptokitties-genome-mapping-6412136c0ae4
                // https://public.api.cryptokitties.co/v1/cattributes/eyes/12
                // or just plug in the id: https://kittycalc.co/read/?k1=462838&k2=461679
            });
        }
    }
    else {
        console.log("Found no mommas within range.");
    }
});
// Helpers ================================================================
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
// Querying Methods =======================================================
// Ideally will only have to get logs for the first < rangeSize and last < rangeSize, as the rest of the data will be in the file.
function searchBlocks(startBlock, endBlock) {
    return __awaiter(this, void 0, void 0, function* () {
        if (startBlock > endBlock) {
            if (verbose)
                console.log("Start block number must be smaller than end. Switching them to continue execution.");
            let temp = endBlock;
            endBlock = startBlock;
            startBlock = temp;
        }
        if (verbose)
            console.log("Searching range: " + startBlock + " - " + endBlock);
        for (let blockNumberIter = startBlock; blockNumberIter < endBlock;) {
            let start = blockNumberIter;
            let incrementDifference = start % RANGE_SIZE;
            let nextIncrement = RANGE_SIZE - incrementDifference + start;
            let nearestNextIncrement = (incrementDifference === 0) ? start : nextIncrement; // next higher than start that is a stored increment unless start is at an increment
            if (start <= endBlock) {
                if (endBlock < nextIncrement) {
                    if (verbose)
                        console.log("Looking between blocks " + start + " and " + endBlock);
                    if (start === nearestNextIncrement && endBlock === nextIncrement - 1) {
                        yield checkFile(start, nextIncrement);
                    }
                    else {
                        yield queryInfura(start, endBlock, false);
                    }
                }
                else {
                    if (start < nextIncrement && nextIncrement - 1 <= endBlock) {
                        if (verbose)
                            console.log("Looking between blocks " + start + " and " + (nextIncrement - 1));
                        if (start === nearestNextIncrement) {
                            yield checkFile(start, nextIncrement);
                        }
                        else {
                            yield queryInfura(start, nextIncrement - 1, false); // in order to avoid overlap with next call, subtract one here.
                        }
                    }
                    if (endBlock === nextIncrement) {
                        if (verbose)
                            console.log("Looking between blocks with no writing " + endBlock + " and " + endBlock);
                        yield queryInfura(endBlock, endBlock, false);
                    }
                }
            }
            blockNumberIter = nextIncrement;
        }
    });
}
function checkFile(start, end) {
    return __awaiter(this, void 0, void 0, function* () {
        let processed = false; // jump functions don't work inside read file
        if (useFile) {
            try {
                let data = fs_1.default.readFileSync(storage);
                let json = JSON.parse(data.toString());
                if (json[start]) {
                    if (verbose)
                        console.log("Looking in file " + storage + "...");
                    if (json[start].endBlock === end - 1) {
                        totalPregnancyCount += json[start].totalBirths;
                        mergeObjectIntoMap(totalMommaMap, json[start].mommaMap);
                        processed = true;
                    }
                }
            }
            catch (err) {
                console.error("Error reading file " + storage + ": " + err);
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
        console.log("Querying Infura to communicate with the blockchain for blocks " + start + " - " + end + "...");
    return web3.eth.getPastLogs({
        address: contract_1.ADDRESS,
        topics: [contract_1.BIRTH_TOPIC],
        fromBlock: start,
        toBlock: end
    }, (err, result) => {
        var _a, _b;
        if (err) {
            console.error("Error getting logs: " + err);
        }
        try {
            for (let i = 0; i < result.length; i++) {
                // chop off the first two 0x from the string, then divide into 64-character parameters
                let data = result[i].data.substring(2).match(/[\s\S]{1,64}/g);
                let matronId = data ? data[2].replace(/^0+(?!$)/, "") : null;
                // choosing not to parseInt to convert hex string (without "0x" prefix) to decimal number so can convert mommaMap to a json object with string keys
                if (verbose)
                    console.log("Found matronId: 0x" + matronId);
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
                    console.log("writing " + pregnancyCount + " births to file for blocks " + start + " to " + end);
                let stats = {
                    "startBlock": start,
                    "endBlock": end,
                    "totalBirths": pregnancyCount,
                    "mommaMap": strMapToObj(mommaMap)
                };
                try {
                    let data = fs_1.default.readFileSync(storage);
                    let json = JSON.parse(data.toString());
                    // TODO: Right now need the file to be {} at start - find a way to check if empty first so can create the object to add to
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
