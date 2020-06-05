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

 CryptoKitties API example response: 

 ```
 { status: 200,
  statusText: 'OK',
  headers:
   { date: 'Fri, 05 Jun 2020 20:41:04 GMT',
     'content-type': 'application/json',
     'transfer-encoding': 'chunked',
     connection: 'close',
     'set-cookie':
      [ '__cfduid=db8d8aa433a9a8b31f4dc3b40c38d616a1591389663; expires=Sun, 05-Jul-20 20:41:03 GMT; path=/; domain=.cryptokitties.co; HttpOnly; SameSite=Lax; Secure' ],
     'access-control-allow-origin': '*',
     vary: 'Accept-Encoding',
     'x-request-id': 'e64cc1d4-bebe-48d5-8cfd-05be9c7fe2bb',
     'cf-cache-status': 'DYNAMIC',
     'cf-request-id': '0327d04a5200000fb3efa96200000001',
     'expect-ct': 'max-age=604800, report-uri="https://report-uri.cloudflare.com/cdn-cgi/beacon/expect-ct"',
     'strict-transport-security': 'max-age=15552000; includeSubDomains',
     'x-content-type-options': 'nosniff',
     server: 'cloudflare',
     'cf-ray': '59ecb656e8770fb3-SJC' },
  config:
   { url: 'https://public.api.cryptokitties.co/v1/kitties/1393895',
     method: 'get',
     headers:
      { Accept: 'application/json, text/plain, */*',
        'x-api-token': 'AlB5RLpww6cdcRf_q7PID0Y0SWZSvrw5SGivYOkUo3Q',
        'User-Agent': 'axios/0.19.2' },
     transformRequest: [ [Function: transformRequest] ],
     transformResponse: [ [Function: transformResponse] ],
     timeout: 0,
     adapter: [Function: httpAdapter],
     xsrfCookieName: 'XSRF-TOKEN',
     xsrfHeaderName: 'X-XSRF-TOKEN',
     maxContentLength: -1,
     validateStatus: [Function: validateStatus],
     data: undefined },
  request:
   ClientRequest {
     _events:
      { socket: [Function],
        abort: [Function],
        aborted: [Function],
        error: [Function],
        timeout: [Function],
        prefinish: [Function: requestOnPrefinish] },
     _eventsCount: 6,
     _maxListeners: undefined,
     output: [],
     outputEncodings: [],
     outputCallbacks: [],
     outputSize: 0,
     writable: true,
     _last: true,
     upgrading: false,
     chunkedEncoding: false,
     shouldKeepAlive: false,
     useChunkedEncodingByDefault: false,
     sendDate: false,
     _removedConnection: false,
     _removedContLen: false,
     _removedTE: false,
     _contentLength: 0,
     _hasBody: true,
     _trailer: '',
     finished: true,
     _headerSent: true,
     socket:
      TLSSocket {
        _tlsOptions: [Object],
        _secureEstablished: true,
        _securePending: false,
        _newSessionPending: false,
        _controlReleased: true,
        _SNICallback: null,
        servername: 'public.api.cryptokitties.co',
        npnProtocol: false,
        alpnProtocol: false,
        authorized: true,
        authorizationError: null,
        encrypted: true,
        _events: [Object],
        _eventsCount: 8,
        connecting: false,
        _hadError: false,
        _handle: null,
        _parent: null,
        _host: 'public.api.cryptokitties.co',
        _readableState: [ReadableState],
        readable: false,
        _maxListeners: undefined,
        _writableState: [WritableState],
        writable: false,
        _bytesDispatched: 217,
        _sockname: null,
        _pendingData: null,
        _pendingEncoding: '',
        allowHalfOpen: false,
        server: undefined,
        _server: null,
        ssl: null,
        _requestCert: true,
        _rejectUnauthorized: true,
        parser: null,
        _httpMessage: [Circular],
        _idleNext: null,
        _idlePrev: null,
        _idleTimeout: -1,
        [Symbol(res)]: [TLSWrap],
        [Symbol(asyncId)]: 37,
        [Symbol(lastWriteQueueSize)]: 0,
        [Symbol(bytesRead)]: 3689,
        [Symbol(connect-options)]: [Object] },
     connection:
      TLSSocket {
        _tlsOptions: [Object],
        _secureEstablished: true,
        _securePending: false,
        _newSessionPending: false,
        _controlReleased: true,
        _SNICallback: null,
        servername: 'public.api.cryptokitties.co',
        npnProtocol: false,
        alpnProtocol: false,
        authorized: true,
        authorizationError: null,
        encrypted: true,
        _events: [Object],
        _eventsCount: 8,
        connecting: false,
        _hadError: false,
        _handle: null,
        _parent: null,
        _host: 'public.api.cryptokitties.co',
        _readableState: [ReadableState],
        readable: false,
        _maxListeners: undefined,
        _writableState: [WritableState],
        writable: false,
        _bytesDispatched: 217,
        _sockname: null,
        _pendingData: null,
        _pendingEncoding: '',
        allowHalfOpen: false,
        server: undefined,
        _server: null,
        ssl: null,
        _requestCert: true,
        _rejectUnauthorized: true,
        parser: null,
        _httpMessage: [Circular],
        _idleNext: null,
        _idlePrev: null,
        _idleTimeout: -1,
        [Symbol(res)]: [TLSWrap],
        [Symbol(asyncId)]: 37,
        [Symbol(lastWriteQueueSize)]: 0,
        [Symbol(bytesRead)]: 3689,
        [Symbol(connect-options)]: [Object] },
     _header: 'GET /v1/kitties/1393895 HTTP/1.1\r\nAccept: application/json, text/plain, */*\r\nx-api-token: AlB5RLpww6cdcRf_q7PID0Y0SWZSvrw5SGivYOkUo3Q\r\nUser-Agent: axios/0.19.2\r\nHost: public.api.cryptokitties.co\r\nConnection: close\r\n\r\n',
     _onPendingData: [Function: noopPendingOutput],
     agent:
      Agent {
        _events: [Object],
        _eventsCount: 1,
        _maxListeners: undefined,
        defaultPort: 443,
        protocol: 'https:',
        options: [Object],
        requests: {},
        sockets: [Object],
        freeSockets: {},
        keepAliveMsecs: 1000,
        keepAlive: false,
        maxSockets: Infinity,
        maxFreeSockets: 256,
        maxCachedSessions: 100,
        _sessionCache: [Object] },
     socketPath: undefined,
     timeout: undefined,
     method: 'GET',
     path: '/v1/kitties/1393895',
     _ended: true,
     res:
      IncomingMessage {
        _readableState: [ReadableState],
        readable: false,
        _events: [Object],
        _eventsCount: 3,
        _maxListeners: undefined,
        socket: [TLSSocket],
        connection: [TLSSocket],
        httpVersionMajor: 1,
        httpVersionMinor: 1,
        httpVersion: '1.1',
        complete: true,
        headers: [Object],
        rawHeaders: [Array],
        trailers: {},
        rawTrailers: [],
        upgrade: false,
        url: '',
        method: null,
        statusCode: 200,
        statusMessage: 'OK',
        client: [TLSSocket],
        _consuming: true,
        _dumped: false,
        req: [Circular],
        responseUrl: 'https://public.api.cryptokitties.co/v1/kitties/1393895',
        redirects: [],
        read: [Function] },
     aborted: undefined,
     timeoutCb: null,
     upgradeOrConnect: false,
     parser: null,
     maxHeadersCount: null,
     _redirectable:
      Writable {
        _writableState: [WritableState],
        writable: true,
        _events: [Object],
        _eventsCount: 2,
        _maxListeners: undefined,
        _options: [Object],
        _redirectCount: 0,
        _redirects: [],
        _requestBodyLength: 0,
        _requestBodyBuffers: [],
        _onNativeResponse: [Function],
        _currentRequest: [Circular],
        _currentUrl: 'https://public.api.cryptokitties.co/v1/kitties/1393895' },
     [Symbol(isCorked)]: false,
     [Symbol(outHeadersKey)]:
      { accept: [Array],
        'x-api-token': [Array],
        'user-agent': [Array],
        host: [Array] } },
  data:
   { id: 1393895,
     name: 'Miss Perrfect',
     bio: 'Hello, lover. You know that feeling you get when a Kitty is beautiful, not for their outward Cattributes, but for their inner hash? That\'s me, #{name}, the original catty cat. Some would say my heart is decentralized, but all I know for sure is the only thing more eternal than the blockchain is my love for you.',
     image_url: 'https://img.cryptokitties.co/0x06012c8cf97bead5deae237070f9587f8e7a266d/1393895.png',
     image_url_cdn: 'https://img.cn.cryptokitties.co/0x06012c8cf97bead5deae237070f9587f8e7a266d/1393895.png',
     image_url_png: 'https://img.cryptokitties.co/0x06012c8cf97bead5deae237070f9587f8e7a266d/1393895.png',
     image_path: '',
     generation: 13,
     created_at: '2019-02-15T06:27:36Z',
     color: 'cyan',
     is_fancy: true,
     is_exclusive: false,
     fancy_type: 'MissPurrfect',
     language: 'en',
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
     matron:
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
     sire:
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

"cattributes": [{
  "description": "orangesoda",
  "type": null
 }, {
  "description": "simple",
  "type": null
 }, {
  "description": "granitegrey",
  "type": null
 }, {
  "description": "coffee",
  "type": null
 }, {
  "description": "pouty",
  "type": null
 }, {
  "description": "totesbasic",
  "type": null
 }, {
  "description": "topaz",
  "type": null
 }, {
  "description": "cymric",
  "type": null
 }]

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

Think of a blockchain as a massive public list of transactions. At its simplest, a single transaction would represent a transfer of something, perhaps a bitcoin or a cryptokitty, from one person to another. Every time a bunch of new transactions occur, we add another ‘block’ to the ‘chain’ containing these new transactions. This same public list is kept and updated by lots of different parties all around the world. This makes it very difficult for one single entity to try and manipulate this transaction list and therefore ensures the integrity of the list.

ABI (Application Binary Interface) as adapter to interact with the compiled Ethereum smart contract that the Ethereum virtual Machine (EVM) executes.

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