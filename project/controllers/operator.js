/**
 * @type inquirer : A collection of common interactive command line user interfaces.
 * @type exec : https://github.com/jcoreio/promisify-child-process
 * @type del : Delete files and directories using globs
 * @type path : The path module provides utilities for working with file and directory paths.
 * @type Logger : Used to log text to user during project creation with needed colors if necessary
 */
const inquirer = require( 'inquirer' );
const { exec } = require( 'promisify-child-process' );
const del      = require( 'del' );
const { join } = require( 'path' );
const { Logger }
               = require( './logger' );

/**
 * The operator class
 */
class Operator {

    constructor() {
        this.getRepoTimeout = 45000;
    }

    /**
     * Returns the summary of answers
     * @param answers
     * @returns {Promise<*>}
     */
    async summary( answers ) {
        const logger = new Logger();
        logger.message( '' );
        logger.message( logger.validation( 'Summary: ' ) );
        Object.keys( answers ).forEach( ( key ) => {
            logger.message( `- ${ key }: ${ logger.variable( answers[ key ] ) }` );
        } );
        const { confirmSummary } = await inquirer.prompt( {
            name:    'confirmSummary',
            type:    'confirm',
            message: 'Looks good?',
        } );
        return confirmSummary;
    }

    /**
     * Should prompt the user for all questions.
     * @param questions – Array of defined script arguments
     * @param argv
     * @param skipSummary
     * @returns {Promise<{}>}
     */
    async prompt( questions, argv, skipSummary = false ) {
        const logger = new Logger();
        let answers  = {};
        let confirm  = false;
        if ( skipSummary === true ) {
            confirm = true;
        }
        do {
            for ( const argName in questions ) {
                if ( Object.prototype.hasOwnProperty.call( questions, argName ) ) {
                    const argument = {
                        ...questions[ argName ],
                        message: questions[ argName ].describe,
                    };
                    if ( argument.skipPrompt ) {
                        // Check if the question should be skipped
                        continue;
                    } else if ( argument.buildFrom ) {
                        // Check if the answer is being made automatically
                        const { how, name } = argument.buildFrom;
                        answers             = { ...answers, [ argument.name ]: how( answers[ name ] ) };
                    } else if ( argument.predefined ) {
                        // Check if there is a predefined answer
                        if ( argument.yesNo === true ) {
                            // Check if it's an yes or no answer
                            argument.predefined = this.checkYesNo( argument.predefined );
                        }
                        answers = { ...answers, [ argument.name ]: argument.predefined };
                    } else {
                        // Prompt question
                        const answer = await inquirer.prompt( argument );
                        // fill in answer
                        answers      = { ...answers, ...answer };
                    }
                }
            }
            if ( skipSummary === false ) {
                confirm = await this.summary( answers );
                logger.message( '' );
            }
        } while ( confirm !== true );

        return answers;
    }

    /**
     * Check if user confirms
     * @param answer
     * @returns {string}
     */
    checkYesNo( answer ) {
        if ( answer.toLowerCase() === 'y' ||
            answer.toLowerCase() === 'yes' ||
            answer.toLowerCase() === '1' ||
            answer.toLowerCase() === 'true' ||
            answer.toLowerCase() === 'confirm' ||
            answer.toLowerCase() === 'i do' ||
            answer.toLowerCase() === 'i am' ) {
            return 'yes';
        } else {
            return 'no';
        }
    }

    /**
     * Clones the repository to the project path
     */
    async getRepo( repo, folderName, branch = '',  ) {
        const repoCommand = branch.length ? `-b ${ branch } ${ repo }` : repo;
        const command     = `git clone ${ repoCommand } "${ folderName }"`;
        return exec( command, { timeout: this.getRepoTimeout } );
    }

    /**
     * Install task
     * @param what
     * @param projectPath
     * @returns {Promise<ChildProcess & Promise<Output>>}
     */
    async install( what, projectPath ) {
        const logger = new Logger();
        if ( what === 'webpack' ) {
            return exec( `cd "${ projectPath }" && yarn install` );
        } else if ( what === 'composer' ) {
            return exec( `cd "${ projectPath }" && composer install --ignore-platform-reqs` );
        } else {
            logger.message( 'Operator does not know how to install ' + what + '...' );
            logger.message( 'Exits...' );
            process.exit();
        }
    }

    /**
     * Delete files if necessary
     * @param projectPath
     * @returns {Promise<void>}
     */
    async cleanUp( projectPath ) {
        await del( join( projectPath, '.git' ) );
        await del( join( projectPath, '.github' ) );
        await del( join( projectPath, '.gitattributes' ) );
    }
}

module.exports = { Operator };