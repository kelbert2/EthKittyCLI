#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var yargs_1 = __importDefault(require("yargs"));
var options = yargs_1.default
    .usage("Usage -n <name>")
    .option("n", {
    alias: "name",
    describe: "Your name",
    type: "string",
    demandOption: true
})
    .argv;
var greeting = "Hello, " + options.name + "!";
console.log(greeting);
