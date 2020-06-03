// max 13 if starting at gen 0. Cannot 
function getMinNumberOfChildren(kitty: Kitty) {
    return (kitty.cooldownIndex - Math.floor(kitty.generation / 2));
    // if cooldownIndex is 13, giving a minimum, cannot tell the exact number unless search through all kittens and get sire or matron ids
}

function getBiggestMommaInRange(startingId, endingId) {
    // go through each Kitty and add one to a counter in a hashmap for the kitties that appear as matron.
}


class KittyResponse {
id: number;
status: {
    cooldown: Date;
    cooldown_index: number;
}
matron: KittyResponse | {};
sire: KittyResponse | {};
}


class KittyResponseVerbose {
    id: number;
    name: string;
    bio: string;
    imageUrl: string;
    imageUrlCdn: string;
    imageUrlPng: string;
    imagePath: string;
    generation: number; // uint16
    createdAt: Date; // UTC timestamp
    color: string;
    isFancy: boolean;
    isExclusive: boolean;
    fancyType: string;
    language: string; // ISO Language Code
    enhancedCattributes: Cattribute[];
    status: Status;
    purrs: PurrStat;
    watchList: {
        count: number;
        isWatchlisted: boolean;
    };
    hatched: boolean;
    isPrestige: boolean;
    prestigeType: null;
    prestigeRanking: null;
    prestigeTimeLimit: null;
    auction: {};
    matron: Kitty | {}; // empty object if generation 0
    sire: Kitty | {};
    owner: {
        address: string; // hexadecimal
};
}

// https://gist.github.com/arpit/071e54b95a81d13cb29681407680794f
class Kitty {
    uint256 genes;
    uint64 birthTime; // timestamp
    uint64 cooldownEndBlock; // timestamp after which can breed again
    uint32 matronId; // 0 if gen0
    uint32 sireId;
    uint32v siringWithId; // ID of sire for pregnant matrons, otherwise 0
    uint16 cooldownIndex; // floor(generation/2) + 1 for each breeding action, max 13
    uint16 generation; // max(matron.generation, sire.generation) + 1
}

class Cattribute {
    type: string;
    description: string;
    position: number;
    kittyId: number;
}
class Status {
    cooldown: Date;
    cooldownIndex: number;
    isReady: boolean;
    isGestating: boolean;
}
class PurrStat {
    count: number;
    isPurred: boolean;
}
class watchListStat {

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
    4*60,
    8*60,
    16*60,
    24*60,
    48*60,
    4*24*60,
    7*24*60
];

function getCooldwonTime(cooldownIndex: number) {
    switch(cooldownIndex) {
        case 0: return 1;
        case 1: return 2;
        case 2: return 5;
        case 3: return 10;
        case 4: return 30;
        case 5: return 60;
        case 6: return 120;
        case 7: return 4*60;
        case 8: return 8*60;
        case 9: return 16*60;
        case 10: return 24*60;
        case 11: return 48*60;
        case 12: return 4*24*60;
        default: return 7*24*60;
    }
}

