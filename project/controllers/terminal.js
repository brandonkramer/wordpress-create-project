/**
 * @type ora : Elegant terminal spinner
 * @type emoji : Simple emoji support for node.js projects
 * @type prompt : A sync prompt for node. very simple. no C++ bindings and no bash scripts.
 * @type figlet : A version of Figlet (FIGfont spec in JavaScript) with promises.
 */
const ora    = require( 'ora' );
const prompt = require( 'prompt-sync' )();
const { Logger }
             = require( './logger.js' );
const figlet = require( 'figlet-promised' );

/**
 * The terminal class
 */
class Terminal {

    /**
     * Set the current step
     */
    constructor() {
        this.step = 1;
    }

    /**
     * Set next step
     */
    setNextStep() {
        this.step++;
    }

    /**
     * Clear terminal
     */
    async clear() {
        process.stdout.write( '\x1Bc' );
    }

    /**
     * Set intro
     */
    async setIntro() {
        const log = new Logger();
        log.message( await figlet( 'WP-Strap' ) );
        log.message( 'Create a new WordPress project' );
    }

    /**
     * Set predefined answers from user input
     * @param questions
     * @param argv
     * @returns {Promise<void>}
     */
    async setPredefinedAnswers( questions, argv ) {
        for ( let predefinedAnswers = 0; predefinedAnswers < argv._.length; predefinedAnswers++ ) {
            let predefinedAnswer = argv._[ predefinedAnswers ].split( ':' );
            for ( const name in questions ) {
                if ( predefinedAnswer[ 0 ] === name && predefinedAnswer[ 1 ].length ) {
                    console.log( name + ': ' + predefinedAnswer[ 1 ] );
                    questions[ name ].predefined = predefinedAnswer[ 1 ];
                }
            }
        }
    }

    /**
     * Prompts a user for something
     * @param icon
     * @param title
     * @param promptLabel
     * @param minLength
     * @returns {*}
     */
    prompt( { icon = '', title, promptLabel, minLength = 0, } ) {
        let userInput = '';
        const log     = new Logger();
        log.validation( `${ title }` );
        do {
            userInput = prompt( `${ promptLabel }: ` );
            if ( userInput.length <= minLength ) {
                log.error( error );
            }
        } while ( userInput.length <= minLength && userInput !== 'exit' );
        log.validation( '' );
        if ( userInput === 'exit' ) {
            log.message( 'Exiting script...' );
            process.exit();
        }
        return userInput;
    };

    /**
     * Do installation
     * @param describe
     * @param event
     * @param timeout
     * @param isFatal
     * @returns {Promise<void>}
     */
    async install( { describe, event, timeout, isFatal = true } ) {
        const spinner = ora( describe ).start();
        const log     = new Logger();
        if ( !event ) {
            throw new Error( `Missing 'event' parameter for step ${ describe }, don't know what needs to be done at this step, aborting.` );
        }
        await event.then( () => {
            spinner.succeed();
        } ).catch( ( exception ) => {
            spinner.fail();
            log.error( exception );
            if ( isFatal ) {
                log.error( `'${ describe }' was a required step, exiting now.` );
                if( timeout ){
                    log.error( `git clone may have timed out. Your timeout setting is: '${ timeout }' milliseconds. Try again with a higher number.` );
                }
                process.exit( 1 );
            }
        } );
    }

    /**
     * Prompts the user for all things defined in whatToPromptFor
     * @param whatToPromptFor
     * @returns {Promise<{}>}
     */
    async whatToPrompt( whatToPromptFor ) {
        const data = {};
        whatToPromptFor.forEach( async ( singlePrompt ) => {
            data[ singlePrompt.key ] = this.prompt( singlePrompt );
        } );
        if ( data.name ) {
            data.packageName = data.name.toLowerCase().split( ' ' ).join( '-' );
            data.namespace   = this.capCase( data.packageName );
        }
        return data;
    }

    capCase( string ) {
        return string.toLowerCase().replace( /\W+/g, '_' ).split( '_' ).map( ( item ) => item[ 0 ].toUpperCase() + item.slice( 1 ) ).join( '_' );
    }
}

module.exports = { Terminal };