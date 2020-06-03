#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Command-Line Interface
// npm install 
var yargs_1 = __importDefault(require("yargs"));
var DEFAULT_URL = 'https://api/cryptokitties.co';
var options = yargs_1.default
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
