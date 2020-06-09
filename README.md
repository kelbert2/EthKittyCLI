# EthKittyCLI
CLI for querying Cryptokitties on the Ethereum blockchain. Writes to and reads data from an external file to avoid repeating past queries, called in regular increments.

## The Aim
Find the total number of CryptoKitty births within a certain range of Ethereum blocks, and find the kitty that gave birth the most often during that time.

## Installation
Add a `config.json` file to src with the following:
```JSON
    "id": <Infura project ID>
    "token": <CryptoKitties API token, optional>
```
Adding the CryptoKitties API token will return more information about the returned mothers, such as their name and primary color.

For caching and easier retrieval of data, add a `json` file with `{}` in it or use the `storage.json` provided, which contains data for 1,000 block increments so Infura will not have to be queried repeatedly for the same ranges. You can specify a file not named `storage.json` in the current directory with `kitten-stats -f /path/to/file.json`.

Then run the following commands:
```
npm run build
sudo npm i -g
```
This will compile the typescript files and install the command.

To uninstall the scripts:
```
npm uninstall -g kitten-stats
npm uninstall -g hello-kitty
```

### Example Usage
Result of command:  `kitten-stats -s 10207400 -e 10207462` (not verbose, for the block range 10207400 - 10207462):

```
Searching range: 10207400 - 10207462

Total number of pregnancies within range: 2
Found some big mommas with 1 birth within range.
There were 0 gen 0 cats added during this time.

Matron ID: 1935857
Name: Popo Maverickpet
Color: olive
Generation: 2
Birthday: Fri, 05 Jun 2020 13:48:24 GMT
Genes:
297060440275645027458572475832135781570660105525034848235791157343453316

Matron ID: 1393895
Name: Miss Perrfect
Color: cyan
Generation: 13
Birthday: Fri, 15 Feb 2019 06:27:36 GMT
Genes:
464801593674718185383774022982343334021953654200500795202568051653611630
```

Gen 0 cats have 0 for their matron ID, and their births are included in the total pregnancy count returned.

### Options
```
  --help         Show help                                             [boolean]
  --version      Show version number                                   [boolean]
  -f, --file     Path to a storage .json file. If no path is supplied, the
                 current directory is used. [string] [default: "./storage.json"]
  -s, --start    starting block                      [number] [default: 6607985]
  -e, --end      ending block                        [number] [default: 7028323]
  -n, --no-file  Will not read or write to a storage file
                                                      [boolean] [default: false]
  -v, --verbose  descriptive log of process           [boolean] [default: false]
```

## Rationale
Smart contracts can emit events and write logs to the blockchain upon mining a transaction. By querying the blockchain for logs of a certain topic, we can efficiently retrieve large amounts of data that will not change over time. This means we don't have to read blocks directly!

### Walkthrough
Getting logs from the Ethereum blockchain is easily done with a web3.eth query to pastLogs that pertain to the birth topic, computed with:
```JavaScript
keccak256(“Birth(address,uint256,uint256,uint256,uint256)”) =
0x0a5311bd2a6608f08a180df2ee7c5946819a649b204b554bb8e39825b2c50ad5
```
Query for a range from block start to end, inclusive, using the CryptoKitties address:
```JavaScript
Promise prom = web3.eth.getPastLogs({
        address: ADDRESS,
        topics: [BIRTH_TOPIC],
        fromBlock: start,
        toBlock: end
    }, (err, result) => {
      // do something
    }
});
```

Such a query returns an array of logs, such as the one below, also found at
 https://etherscan.io/tx/0x1952402d33cc3f0d98b8a23db68c1e1724d4e534972cfe00a07e5fa5777559d1#eventlog. This log has multiple events but only one birth event associated with it: 
```JSON
{
        "address": "0x06012c8cf97BEaD5deAe237070F9587f8E7A266d",
        "blockHash": "0xeec0f45b0eeb5975b6f907a506471feddf459e73dfa31ad8406a4f3293dbd470",
        "blockNumber": 10195151,
        "data": "0x000000000000000000000000093108180ea5e76b8d937fb7c445354c28a534d700000000000000000000000000000000000000000000000000000000001d88f80000000000000000000000000000000000000000000000000000000000085d6000000000000000000000000000000000000000000000000000000000001d888b00007ad8b29086580ce30d683dc421b92a585d01a5ef7198800ce54a58c6bdc4",
        "logIndex": 54,
        "removed": false,
        "topics": ["0x0a5311bd2a6608f08a180df2ee7c5946819a649b204b554bb8e39825b2c50ad5"],
        "transactionHash": "0x1952402d33cc3f0d98b8a23db68c1e1724d4e534972cfe00a07e5fa5777559d1",
        "transactionIndex": 94,
        "id": "log_abb68685"
    }
```
Looking back at the function we used to calcuate the topic hash, we can figure out which bits of data correspond to which parameters:
```Solidarity
event Birth (address owner, uint256 kittyId, uint256 matronId, uint256 sireId, uint256 genes);
```

The five parameters passed into the event are smooshed together into one big "data". We find the matron id in the hex value, which is padded with zeroes to have 64 characters in hex, making it a 256-bit integer:
 ```JSON
0x000000000000000000000000093108180ea5e76b8d937fb7c445354c28a534d7
  00000000000000000000000000000000000000000000000000000000001d88f8
  0000000000000000000000000000000000000000000000000000000000085d60 <- matronId
  00000000000000000000000000000000000000000000000000000000001d888b
  00007ad8b29086580ce30d683dc421b92a585d01a5ef7198800ce54a58c6bdc4
```
That's a long string! But the zeroes are there for padding - the real ID is only a uint32. We parse the matronId into decimal and get 548192. 

The kitties are stored according to the structure below:
```Solidarity
struct Kitty {
  uint256 genes;
  uint64 birthTime; // timestamp
  uint64 cooldownEndBlock; // timestamp after which can breed again
  uint32 matronId; // 0 if gen0
  uint32 sireId;
  uint32 siringWithId; // ID of sire for pregnant matrons, otherwise 0
  uint16 cooldownIndex; // initially floor(generation/2), + 1 for each breeding action, up to 13
  uint16 generation; // max(matron.generation, sire.generation) + 1
}
```
The number of pregnancies a cat has had is not directly tracked, although the cooldown index can be used to determine the minimum number of times the kitty has bred, such that up to `13 - floor(generation/2)` births can be seen using this metric, as the cooldown time is capped at one week and will not increase past that. Kitties also are not restricted to being exclusively matrons or sires - so the number of pregnancies a kitty has had can only be counted within a block range, not through querying information on the kitty itself.

To get more information on the kitty, we send a query to the CryptoKitties API. 
```JavaScript
{
  'method': 'GET',
  'url': 'https://public.api.cryptokitties.co/v1/kitties/' + decimalID,
  'headers': {
    'x-api-token': config.token
  }
```

The response looks something like this: 
 ```JavaScript
 { status: 200,
  statusText: 'OK',
  headers: {...},
  config: {...},
  request: ClientRequest {...},
  data:
   { id: 1393895,
     name: 'Miss Perrfect',
     bio: 'Hello, lover. You know that feeling you get when a Kitty is beautiful, not for their outward Cattributes, but for their inner hash? That\'s me, #{name}, the original catty cat. Some would say my heart is decentralized, but all I know for sure is the only thing more eternal than the blockchain is my love for you.',
     image_url: 'https://img.cryptokitties.co/0x06012c8cf97bead5deae237070f9587f8e7a266d/1393895.png',
     image_url_cdn: 'https://img.cn.cryptokitties.co/0x06012c8cf97bead5deae237070f9587f8e7a266d/1393895.png',
     image_url_png: 'https://img.cryptokitties.co/0x06012c8cf97bead5deae237070f9587f8e7a266d/1393895.png',
     image_path: '',
     generation: 13, // uint16 
     created_at: '2019-02-15T06:27:36Z', // UTC timestamp
     color: 'cyan',
     is_fancy: true,
     is_exclusive: false,
     fancy_type: 'MissPurrfect',
     language: 'en', // ISO Language Code
     kitty_type: 'fancy',
     enhanced_cattributes: [],
     status:
      { cooldown: 1591383102438,
        cooldown_index: 8,
        is_ready: true,
        is_gestating: false },
     purrs: { count: 4, is_purred: false },
     watchlist: { count: 0, is_watchlisted: false },
     hatched: true,
     is_prestige: false,
     prestige_type: null,
     prestige_ranking: null,
     fancy_ranking: 1276,
     prestige_time_limit: null,
     auction: { seller: null },
     matron: // empty object if generation 0
      { id: 1384192,
        name: 'Miss Purrfect',
        image_url: 'https://img.cryptokitties.co/0x06012c8cf97bead5deae237070f9587f8e7a266d/1384192.png',
        image_url_cdn: 'https://img.cn.cryptokitties.co/0x06012c8cf97bead5deae237070f9587f8e7a266d/1384192.png',
        image_url_png: 'https://img.cryptokitties.co/0x06012c8cf97bead5deae237070f9587f8e7a266d/1384192.png',
        generation: 7,
        created_at: '2019-02-10T09:20:27Z',
        color: 'dahlia',
        is_fancy: true,
        is_exclusive: false,
        fancy_type: 'MissPurrfect',
        language: 'en',
        status: [Object],
        owner: [Object] },
     sire: // empty object if generation 0
      { id: 1386694,
        name: 'Miss Purrfect',
        image_url: 'https://img.cryptokitties.co/0x06012c8cf97bead5deae237070f9587f8e7a266d/1386694.png',
        image_url_cdn: 'https://img.cn.cryptokitties.co/0x06012c8cf97bead5deae237070f9587f8e7a266d/1386694.png',
        image_url_png: 'https://img.cryptokitties.co/0x06012c8cf97bead5deae237070f9587f8e7a266d/1386694.png',
        generation: 12,
        created_at: '2019-02-11T09:50:00Z',
        color: 'cyan',
        is_fancy: true,
        is_exclusive: false,
        fancy_type: 'MissPurrfect',
        language: 'en',
        status: [Object],
        owner: [Object] },
     owner:
      { address: '0x7b8f5e737c576c5badb4d9f5a080ba544f4c336f',
        hasDapper: false },
     tricks: [],
     hatcher:
      { address: '0x0f794071c68dd16f8fd424808fcb20780c575576',
        image: '15',
        nickname: 'JaceMW | Discord #4122',
        hasDapper: false },
     is_special_edition: false,
     offer:
      { id: '',
        expires_at: null,
        bidder_address: '',
        eth_price: 0,
        status: '',
        accepted: false,
        rejected: true,
        approved: false } } }
```

Cattribute example: 
```JSON
{
  "description": "orangesoda",
  "type": null
 }
```

Querying the blockchain for information on the kitty through its ID yields more reliable (i.e. fewer undefined) data. Connecting an Ethereum node to a Web3 instance and querying the CryptoKitties address and its ABI (Application Binary Interface - which acts as an adaptor to allow interaction with the Ethereum virtual machine and the compile Ethereum smart contract):
```JavaScript
(new web3.eth.Contract(CORE_ABI, ADDRESS)).methods.getKitty("0x" + hexId).call();
```
To view the ABI and address, see `contract.ts`.

Response in JavaScript types:
```JavaScript
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
    genes: string; // uint256, can also be parsed as BigNumber
}
```
With the genes, we can see what the kitty is really made of!

The kitty genome has been mostly decoded. More information can be found:
https://medium.com/newtown-partners/cryptokitties-genome-mapping-6412136c0ae4

By individual attribute:
https://public.api.cryptokitties.co/v1/cattributes/eyes/12

By individual kitty id:
https://kittycalc.co/read/?k1=462838&k2=461679

# Resources
Creating a CLI:

https://itnext.io/how-to-create-your-own-typescript-cli-with-node-js-1faf7095ef89

https://developer.okta.com/blog/2019/06/18/command-line-app-with-nodejs

Deciphering Source Code:

https://medium.com/block-science/exploring-cryptokitties-part-1-data-extraction-1b1e35921f85

And verified here:

https://etherscan.io/address/0x06012c8cf97bead5deae237070f9587f8e7a266d#events

Operations:

https://web3js.readthedocs.io/en/v1.2.7/web3-eth.html#getpastlogs

https://hackernoon.com/understanding-ethereum-a-complete-guide-6f32ea8f5888