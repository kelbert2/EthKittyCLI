#!/usr/bin/env node

// Command-Line Interface
// npm install 
const yargs = require("yargs");
const DEFAULT_URL = 'https://api/cryptokitties.co';

const options = yargs
.usage("Usage")
.option("n", {alias: "name", describe: "Your name", type: "string", demandOption: true})
.option("m", {alias: "momma", describe: "Only display biggest momma", type: "boolean"}),
.option("c", alias: "count", describe: "Only display kitten count", type: "boolean"})
.argv;

/*
--help
--version
--n, --name
*/

const greeting = `Hello, ${options.name}!`;

console.log(greeting);


// api client