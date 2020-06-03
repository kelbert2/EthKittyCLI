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
