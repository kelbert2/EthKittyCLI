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
        created_at: string; // UTC string
        color: string;
        kittyType: string;
        enhancedCattributes: string[];
        isExclusive: boolean;
    }
}

interface KittyEthResponse {
    isGestating: boolean;
    isReady: boolean;
    cooldownIndex: string;
    nextActionAt: string;
    siringWithId: string;
    birthTime: string; // timestamp 
    matronId: string;
    sireId: string;
    generation: string;
    genes: string;
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