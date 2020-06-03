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

