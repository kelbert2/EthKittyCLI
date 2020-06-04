declare function getMinNumberOfChildren(kitty: KittyResponse): number;
declare function getBiggestMommaInRange(startingId: number, endingId: number): void;
interface KittyResponse {
    id: number;
    generation: number;
    status: {
        cooldown: Date;
        cooldown_index: number;
    };
    matron: KittyResponse | {};
    sire: KittyResponse | {};
}
declare const COOLDOWN_TIME: number[];
declare function getCooldwonTime(cooldownIndex: number): number;
interface Block {
    number: string | null;
    hash: string | null;
    parentHash: string;
    nonce: string | null;
    sha3Uncles: string | null;
    logsBloom: string | null;
    transactionsRoot: string;
    stateRoot: string;
    receiptsRoot: string;
    miner: string;
    difficulty: string;
    totalDifficulty: string;
    extraData: string;
    size: string;
    gasLimit: string;
    gasUsed: string;
    timestamp: string;
    transactions: Transactions[] | string[];
    uncles: string[];
}
interface Transactions {
    blockHash: string | null;
    blockNumber: string | null;
    from: string;
    gas: string;
    gasPrice: string;
    hash: string;
    input: string;
    nonce: string;
    to: string | null;
    transactionIndex: string | null;
    value: string;
    v: string;
    r: string;
    s: string;
}
interface Log {
    address: string;
    blockHash: string | null;
    blockNumber: number | null;
    data: string;
    logIndex: number;
    removed: boolean;
    topics: string[];
    transactionHash: string;
    transactionIndex: number;
    id: string;
}
