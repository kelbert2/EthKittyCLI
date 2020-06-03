#!/usr/bin/env node
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
// Command-Line Interface
// npm install 
var yargs = __importStar(require("yargs"));
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
