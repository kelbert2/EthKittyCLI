class Kitty {
    uint256 genes;
    uint64 birthTime; // timestamp
    uint64 cooldownEndBlock; // timestamp after which can breed again
    uint32 matronId; // 0 if gen0
    uint32 sireId;
    uint32v siringWithId; // ID of sire for pregnant matrons, otherwise 0
    uint16 cooldownIndex; // floor(generation/2) + 1 for each breeding action,
    uint16 generation; // max(matron.generation, sire.generation) + 1
    }
