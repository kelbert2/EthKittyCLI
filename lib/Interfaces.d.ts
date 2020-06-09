declare type MapObject<T> = {
    [key: string]: T;
};
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
    };
}
interface KittyEthResponse {
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
