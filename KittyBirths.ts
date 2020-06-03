class KittyBirths {
    startingBlock;
    endingBlock;

    // startingBlock=6607985 and endingBlock=7028323  
    int numberOfBirths(startingBlock, endingBlock) {

    }
    Kitty biggestMommaInRange() {

    }

   // https://docs.api.cryptokitties.co/?version=latest

    getKittyById(id: number) {
        /* 
        curl --location --request GET 'https://public.api.cryptokitties.co/v1/kitties/1' \
--header 'x-api-token: ABC'
*/
/*

order by id desc

curl --location --request GET 'https://public.api.cryptokitties.co/v1/kitties?orderBy=kitties.id&orderDirection=desc' \
--header 'x-api-token: ABC'
*/
/*
Using an API token, if register as a developer, can filter for IDs within a certain range

curl --location --request GET 'https://public.api.cryptokitties.co/v1/kitties?kittyId=1000-2000' \
--header 'x-api-token: {{API_TOKEN}}'
*/
/*
By generation

curl --location --request GET 'https://public.api.cryptokitties.co/v1/kitties?gen=3-4' \
--header 'x-api-token: ABC'
*/

    }
}