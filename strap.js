#!/usr/bin/env node

/**
 * Yargs helps you build interactive command line tools, by parsing arguments and generating an elegant user interface.
 * @docs http://yargs.js.org/docs/
 */
require('yargs')
    // Apply command modules from a directory relative to the module calling this method.
    .commandDir('./project/commands')
    // Demand in context of commands. You can demand a minimum and a maximum number a user can have within your program, as well as provide corresponding error messages if either of the demands is not met.
    .demandCommand()
    // Configure an (e.g. --help) and implicit command that displays the usage string and exits the process.
    .help()
    // Get the arguments as a plain old object.
    .argv;

/**
 *  Internal testing:
 *  node ./strap.js plugin
 */