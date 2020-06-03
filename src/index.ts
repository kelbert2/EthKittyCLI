#!/usr/bin/env node

// Command-Line Interface
// npm install 
import yargs from 'yargs';
const DEFAULT_URL = 'https://api/cryptokitties.co';

const options = yargs
    .usage("Usage: $0 [options]")
    .option("m", { alias: "momma", describe: "Display biggest momma", type: "boolean" })
    .option("c", { alias: "count", describe: "Display kitten count", type: "boolean" })
    .argv;

/*
--help
--version
*/
if (options.m) {
    console.log("Got m!");
}
if (options.n) {
    console.log("Got n!");
}

console.log("Got stats!");

// api client   