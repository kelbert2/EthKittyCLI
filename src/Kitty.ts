// max 13 if starting at gen 0. Cannot 
function getMinNumberOfChildren(kitty: KittyResponse) {
    return (kitty.status.cooldown_index - Math.floor(kitty.generation / 2));
    // if cooldownIndex is 13, giving a minimum, cannot tell the exact number unless search through all kittens and get sire or matron ids
}

function getBiggestMommaInRange(startingId: number, endingId: number) {
    // go through each Kitty and add one to a counter in a hashmap for the kitties that appear as matron.
}


interface KittyResponse {
    id: number;
    generation: number;
    status: {
        cooldown: Date;
        cooldown_index: number;
    }
    matron: KittyResponse | {};
    sire: KittyResponse | {};
}

// https://guide.cryptokitties.co/guide/cat-features/cooldown-speed
// uint32
// in minutes
const COOLDOWN_TIME = [
    1,
    2,
    5,
    10,
    30,
    60,
    120,
    4 * 60,
    8 * 60,
    16 * 60,
    24 * 60,
    48 * 60,
    4 * 24 * 60,
    7 * 24 * 60
];

function getCooldwonTime(cooldownIndex: number) {
    switch (cooldownIndex) {
        case 0: return 1;
        case 1: return 2;
        case 2: return 5;
        case 3: return 10;
        case 4: return 30;
        case 5: return 60;
        case 6: return 120;
        case 7: return 4 * 60;
        case 8: return 8 * 60;
        case 9: return 16 * 60;
        case 10: return 24 * 60;
        case 11: return 48 * 60;
        case 12: return 4 * 24 * 60;
        default: return 7 * 24 * 60;
    }
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