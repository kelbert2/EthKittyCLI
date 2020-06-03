#!/usr/bin/env node
"use strict";
// Command-Line Interface
// npm install 
var yargs = require("yargs");
var DEFAULT_URL = 'https://api/cryptokitties.co';
var options = yargs
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
// api client
