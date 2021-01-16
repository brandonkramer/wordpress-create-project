#!/usr/bin/env node
/**
 * @type path : The path module provides utilities for working with file and directory paths.
 */
const path = require( 'path' );

/**
 * @type Terminal : Setup that clears the terminal, set intro, predefined answers etc.
 * @type Operator : Prompts and process questions/answers, repo cloning, dependencies install & clean-up
 * @type Logger : Log text to user during project creation with needed colors if necessary
 */
const {
          terminal: { Terminal },
          operator: { Operator },
          logger:   { Logger },
      } = require( '../controllers' );

/**
 * @type Scanner : Get the project path after cloning repo, do search and replace, and deps install
 * @type Questions : Questions that the operator prompts
 */
const {
          scanner:   { Scanner },
          questions: { Questions },
      } = require( '../packages/webpack' );

/**
 * @docs http://yargs.js.org/docs/#api-reference-demandcommandmin1-max-minmsg-maxmsg
 * @type exports.command : Defines the command name for Yargs when running strap.js
 * @type exports.desc : Defines the command description for Yargs when running strap.js
 * @type exports.builder : Uses the questions to build the commands
 * @type exports.handler : Handler function, which will execute the terminal
 */
exports.command = 'webpack';
exports.desc    = 'Add a webpack workflow to your WP project.';
exports.builder = Questions;
exports.handler = async ( argv ) => {

    /**
     * Initialize the terminal, operator,
     * logger, and scanner controllers
     */
    const terminal = new Terminal();
    const operator = new Operator();
    const scanner  = new Scanner();
    const log      = new Logger();

    /**
     * Clear terminal, set intro and set
     * predefined answers from users input
     */
    await terminal.clear();
    await terminal.setIntro();
    await terminal.setPredefinedAnswers( Questions, argv );

    /**
     * Prompt user with unanswered questions
     * and get the project path where the git
     * project gets cloned to
     */
    const promptedInfo = await operator.prompt( Questions, argv );
    const projectPath  = path.join( scanner.getFullPath(), promptedInfo.package );
    const currentPath  = scanner.getFullPath();
    log.message( '' );

    /**
     * Clone the git repo into the
     * project path and set next step
     */
    await terminal.install( {
        describe: `${ terminal.step }. Operator is cloning repository`,
        event:    operator.getRepo( 'https://github.com/wp-strap/wordpress-webpack-workflow.git', projectPath ),
    } );
    terminal.setNextStep();

    /**
     * Install node dependencies
     * and set next step
     */
    await terminal.install( {
        describe: `${ terminal.step }. Operator is replacing project data with your input`,
        event:    scanner.searchReplace( promptedInfo, projectPath ),
    } );
    terminal.setNextStep();

    /**
     * Install node dependencies
     * and set next step
     */
    if ( promptedInfo.folder === 'Current folder' ) {
        await terminal.install( {
            describe: `${ terminal.step }. Operator is installing NPM dependencies, this may take a while..`,
            event:    operator.install( 'webpack', currentPath ),
        } );
    } else {
        await terminal.install( {
            describe: `${ terminal.step }. Operator is installing NPM dependencies, this may take a while..`,
            event:    operator.install( 'webpack', projectPath ),
        } );
    }
    terminal.setNextStep();

    /**
     * Install
     * and set next step
     */
    await terminal.install( {
        describe: `${ terminal.step }. Operator is cleaning up`,
        event:    operator.cleanUp( projectPath ),
    } );
    terminal.setNextStep();

    /**
     * Final message
     */
    log.message( '----------------' );
    log.message( `${ log.validation( '✔' ) } Project is created!` );
    log.message( '' );
    log.message( `Edit the BrowserSync settings in ${ log.variable( 'webpack.config.js' ) } if you want to utilise it.` );
    log.message( `You may want to configure the files in ${ log.variable( '/webpack/' ) } and ${ log.variable( 'webpack.config.js' ) } to better suite your needs.` );
    log.message( `Run ${ log.variable( 'yarn dev' ) } / ${ log.variable( 'yarn dev:watch' ) } or ${ log.variable( 'yarn prod' ) } / ${ log.variable( 'yarn prod:watch' ) } to start the build process.` );
    log.message( '' );
    log.message( `Please read the documentation ${ log.variable( 'https://github.com/wp-strap/wordpress-webpack-workflow' ) } if you run into any issues or if you have any questions.` );
    log.message( '' );
    log.message( 'Good luck!' );
    log.message( '----------------' );
    process.exit( 0 );
};