# The Aim
build a program that takes a startingBlock and endingBlock as arguments and counts the total number of births that happened during that range. Finally, use that information to find the Kitty (birth timestamp, generation and their genes) that gave birth to the most kitties.

Need to add a config.json with {"id"=<infura project id>} to src.
 
Smart contracts can emit events and write logs to the blockchain upon mining a transaction.

# Initial Tests
Corresponding to log found at 
 https://etherscan.io/tx/0x1952402d33cc3f0d98b8a23db68c1e1724d4e534972cfe00a07e5fa5777559d1#eventlog
 
blockNumber: 10195151

 matronId: 548192

 hex data: 
* 0x000000000000000000000000093108180ea5e76b8d937fb7c445354c28a534d7
*  00000000000000000000000000000000000000000000000000000000001d88f8
*  0000000000000000000000000000000000000000000000000000000000085d60 <- matronId
*  00000000000000000000000000000000000000000000000000000000001d888b
*  00007ad8b29086580ce30d683dc421b92a585d01a5ef7198800ce54a58c6bdc4


2 - 3
2

 10 - 22 -> 10 - 20, 20 - 22
23

 2 - 22 -> 2 - 10, 10 - 20, 20 - 22
 21

 2 - 20 -> 2 - 10, 10 - 20
 19


# To Run
npm run build
npm run test

# Resources
Creating a CLI with Typescript:

https://itnext.io/how-to-create-your-own-typescript-cli-with-node-js-1faf7095ef89

Deciphering Source Code:

https://medium.com/block-science/exploring-cryptokitties-part-1-data-extraction-1b1e35921f85

And verified here:

https://etherscan.io/address/0x06012c8cf97bead5deae237070f9587f8e7a266d#events


https://medium.com/makersplace/are-you-a-maker-join-us-b53e5d9e5280

https://hackernoon.com/understanding-ethereum-a-complete-guide-6f32ea8f5888


https://developer.okta.com/blog/2019/06/18/command-line-app-with-nodejs

In general, tokens on the blockchain are fungible. The value of every token is the same and,
similar to cash, it doesn’t matter what token you receive. Because of this, blockchains track
counts of tokens instead of the specific tokens themselves. This works well for things like stocks
or currencies, but because CryptoKitties are genetically unique and breedable, we needed to
create a non-fungible token environment.

To mitigate this, we created a descending clock auction. Sellers choose a high opening bid, a
minimum closing bid, and a timeframe for which they’d like their auction to run. Buyers are able
to choose their purchase price along that spectrum by purchasing when the price aligns with
their perceived value of the CryptoKitty being sold – as long as someone else doesn’t buy it
before them. Buyers pay gas when they complete a purchase and sellers pay gas to initiate an
auction.

requesting
request-promise
https://github.com/io4/cryptokitties/blob/master/index.js
cryptokitties-contrib
https://github.com/scottie/cryptokats/blob/master/index.js

https://gist.github.com/arpit/071e54b95a81d13cb29681407680794f
```Solidarity
struct Kitty {
  uint256 genes;
  uint64 birthTime; // timestamp
  uint64 cooldownEndBlock; // timestamp after which can breed again
  uint32 matronId; // 0 if gen0
  uint32 sireId;
  uint32v siringWithId; // ID of sire for pregnant matrons, otherwise 0
  uint16 cooldownIndex; // floor(generation/2) + 1 for each breeding action
  uint16 generation; // max(matron.generation, sire.generation) + 1
}
```


uint16 cooldownIndex = uint16(_generation / 2);
        if (cooldownIndex > 13) {
            cooldownIndex = 13;
        }

class Cattribute {
          "type": "body",
          "description": "koladiviya",
          "position": 31,
          "kittyId": 129
}

    birth: timestamp;
    generation: number;
    genes
    _kittyId




     


cooldown {
increases every time it breeds

generation
case 0:
case 1:
return 1;
case 2:
case 3:
return 2;
case 4:
case 5:
return 5;
case 6:
case 7:
return 10;
case 8:
case 9:
return 30;
case 10:
case 11:
return 60;
case 12:
case 13:
return 120;
case 14:
case 15:
return 4*60;
case 16:
case 17:
return 8*60;
case 18:
case 19:
return 16*60;
case 20:
case 21:
return 24*60;
case 22:
case 23:
return 2*24*60;
case 24:
case 25:
return 4*24*60;
default:
return 7*24*60;

add 2 for each time they breed;

}

```
class Kitty {
    uint256 genes;
    uint64 birthTime; // timestamp
    uint64 cooldownEndBlock; // timestamp after which can breed again
    uint32 matronId; // 0 if gen0
    uint32 sireId;
    uint32 siringWithId; // ID of sire for pregnant matrons, otherwise 0
    uint16 cooldownIndex; // floor(generation/2) + 1 for each breeding action,
    uint16 generation; // max(matron.generation, sire.generation) + 1
}

```

```
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
```