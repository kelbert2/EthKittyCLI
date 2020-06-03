#!/usr/bin/env node

// Command-Line Interface
import yargs from 'yargs';
import Web3 from 'web3';
import config from './config.json'; // infura project id
const KITTIES_URL = 'https://api/cryptokitties.co';
const ADDRESS = "0x06012c8cf97BEaD5deAe237070F9587f8E7A266d";
const BIRTH_TOPIC = "0x0a5311bd2a6608f08a180df2ee7c5946819a649b204b554bb8e39825b2c50ad5";



const options = yargs
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

let web3: Web3 = new Web3(new Web3.providers.HttpProvider("https://mainnet.infura.io/v3/" + config.id)); // http://localhost:8545 for local
// connect to local or remote node
let pregnancyCount = 0;
let mommaMap = new Map<number, number>();

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

    pregnancyCount++;

    for(let i = 0; i < result.length; i++) {
        // chop off the first two 0x from the string, then divide into 64-character parameters
        let data = result[i].data.substring(2).match(/[\s\S]{1,64}/g);
        
        let matronId = data ? parseInt(("0x" + data[2].replace(/^0+(?!$)/, ""))) : null;
        if (matronId != null) {
            let initialValue = mommaMap.get(matronId) ?? 0;
            mommaMap.set(matronId, ++initialValue);
        }
    }
    
    // console.log(result);
}
).then(() =>{
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

// eth_getLogs( fromBlock, toBlock, topics [])
// get log entries between the blocks that correspond to birth events
// topics: compute signature of event with keccak256(“Birth(address,uint256,uint256,uint256,uint256)”) =
// 0x0a5311bd2a6608f08a180df2ee7c5946819a649b204b554bb8e39825b2c50ad5

// if n - increment number of pregnancy events
// if m - look at matron ids and put them into treemap to find the max momma
// matron id is one of the inputs into the birth event
// data: divide into 5 256-bit parts or 64 hex chars. MatronId is the third one
// left-padded with zeroes, 32-bit uint


// create file of stats in 10,000 block increments (the max an infura request will return)
// number of births
// map of mommas
// check to see if range includes a block increment within the file

interface Log {
    address: string;
    blockHash: string | null; // null if pending
    blockNumber: number | null; // null if pending
    data: string; // 64-bit parameters scrunched together
    logIndex: number; // event index position within block
    removed: boolean;
    topics: string[];
    transactionHash: string; // 32 bytes
    transactionIndex: number; // 32 bytes
    id: string;
}

interface StorageItem {
    startBlock: string;
    endBlock: string;
    totalBirths: number;
    mommaMap: Map<string, number>;
}


interface Kitty {
    birth: Date;
    generation: number;
    genes: string; // web3 receives uint256 as strings, or could use BigNumber.js to parse
}

// Ethereum
// https://github.com/ethereum/wiki/wiki/JSON-RPC#eth_getblockbyhash
// curl -X POST --data '{"jsonrpc":"2.0","method":"eth_getBlockByNumber","params":["0x1b4", true],"id":1}
// all in hex
interface Block {
    number: string | null; // null if pending
    hash: string | null; // 32 bytes
    parentHash: string;
    nonce: string | null; // 8 bytes
    sha3Uncles: string | null; // 32 bytes
    logsBloom: string | null; // 256 bytes
    transactionsRoot: string; // 32 bytes, root of transaction trie of the block
    stateRoot: string; // 32 bytes, root of final state trie of block
    receiptsRoot: string; // 32 bytes, root of receipts trie of block
    miner: string; // 20 bytes
    difficulty: string; // integer
    totalDifficulty: string; // of the chain until this block
    extraData: string;
    size: string; // integer in bytes
    gasLimit: string;
    gasUsed: string; // total used of all transactions
    timestamp: string;
    transactions: Transactions[] | string[]; // or 32 byte hashes
    uncles: string[]; // array of uncle hashes
}
// Request
// curl -X POST --data '{"jsonrpc":"2.0","method":"eth_getTransactionByHash","params":["0x88df016429689c079f3b2f6ad39fa052532c56795b733da78a91ebe6a713944b"],"id":1}'
interface Transactions {
    blockHash: string | null; // 32 bytes, null if pending
    blockNumber: string | null;
    from: string; // 20 bytes, address of sender
    gas: string; // gas provided by sender
    gasPrice: string; // in Wei
    hash: string; // 32 bytes
    input: string; // data sent with transaction
    nonce: string; // number of transactions made by sender prior to this
    to: string | null; // 20 bytes, address of receiver, null if content creation transaction
    transactionIndex: string | null; // integer of index position in block, null if pending
    value: string; // value transfered in Wei
    v: string; // ECDSA recovery id
    r: string; // ECDSA signature r
    s: string; // ECDSA signature s
}
