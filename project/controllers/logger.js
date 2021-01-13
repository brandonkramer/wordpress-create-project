/**
 * @type chalk : Terminal string styling (https://github.com/chalk/chalk)
 */
const chalk = require( 'chalk' );

/**
 * The logger class
 */
class Logger {
    /**
     * Log message
     * @param msg
     */
    message( msg ) {
        return console.log( msg );
    }

    /**
     * Color for error messages
     * @param msg
     */
    error( msg ) {
        return this.message( `${ chalk.bgRed( 'Error' ) }${ chalk.red( ' - ' ) }${ msg }` );
    }

    /**
     * Color for validation message
     * @param msg
     * @returns {*}
     */
    validation( msg ) {
        return chalk.green( msg );
    }

    /**
     * Color for variable type of strings
     * @param msg
     * @returns {*}
     */
    variable(msg) {
        return chalk.cyan( msg );
    }
}

module.exports = { Logger };