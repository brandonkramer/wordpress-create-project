/**
 * @type replace : A simple utility to quickly replace text in one or more files or globs.
 * @type path : The path module provides utilities for working with file and directory paths.
 * @type del : Delete files and directories using globs
 */
const replace = require( 'replace-in-file' );
const path    = require( 'path' );
const { existsSync, writeFileSync, readFile, mkdirSync }
              = require( 'fs' );
const fs      = require( 'fs-extra' );
const { promisify }
              = require( 'util' );
const del     = require( 'del' );

/**
 * The scanner class
 */
class Scanner {
    /**
     * Gets the full path of where the
     * project is being created
     * @returns {string}
     */
    getFullPath() {
        return path.join( process.cwd() );
    }

    /**
     * Replacer
     * @param pathToFolder - folder to search in
     * @param files - files to replace
     * @param from - target to replace
     * @param to - the replacement
     * @returns {Promise<*>}
     */
    async replacer( files, from, to, pathToFolder ) {
        return replace( {
            files:  files,
            from:   from,
            to:     to,
            ignore: [
                path.join( `${ pathToFolder }/node_modules/**/*` ),
                path.join( `${ pathToFolder }/vendor/**/*` ),
                path.join( `${ pathToFolder }/packages/**/*` ),
            ],
        } )
    }

    /**
     * https://github.com/adamreisnz/replace-in-file
     * @param data
     * @param projectPath
     * @returns {Promise<void>}
     */
    async searchReplace( data, projectPath ) {
        const phpFiles         = [
            path.join( projectPath, 'the-plugin-name.php' ),
            path.join( projectPath, 'classes', 'bootstrap.php' ),
            path.join( projectPath, 'classes', 'App', '**', '*.php' ),
            path.join( projectPath, 'classes', 'Common', '**', '*.php' ),
            path.join( projectPath, 'classes', 'Compatibility', '**', '*.php' ),
            path.join( projectPath, 'classes', 'Config', '**', '*.php' ),
            path.join( projectPath, 'classes', 'Integrations', '**', '*.php' ),
            path.join( projectPath, 'templates', '*.php' )
        ];
        const codeceptionFiles = [
            path.join( projectPath, 'tests', 'wpunit.suite.yml' ),
            path.join( projectPath, '.env.testing' ),
            path.join( projectPath, 'codeception.dist.yml' ),
        ];
        const codesnifferFiles = [
            path.join( projectPath, 'phpcs.xml.dist' ),
        ];
        const travisCiFiles    = [
            path.join( projectPath, '.travis.yml' ),
        ];
        const bootstrapFile    = path.join( projectPath, 'classes', 'bootstrap.php' );
        const composerFile     = path.join( projectPath, 'composer.json' );
        const pathEntryFile    = path.join( projectPath, `the-plugin-name.php` );

        // PHP Files
        if ( data.projectName && data.description && data.url && data.package &&
            data.author && data.authorEmail && data.license ) {
            /**
             * All occurrences
             */
            await this.replacer( // Plugin name used in file meta, translation functions etc.
                phpFiles, /{{The Plugin Name}}/g, `${ data.projectName }`, projectPath
            );
            await this.replacer( // Plugin description used in main file meta as "Description" for example
                phpFiles, /{{plugin_description}}/g, `${ data.description }`, projectPath
            );
            await this.replacer(  // Plugin url used in main file meta as "Plugin URI" for example
                phpFiles, /{{plugin_url}}/g, `https://${ data.url }`, projectPath
            );
            await this.replacer(  // Package name used in PHP doc @package for example
                phpFiles, /{{the-plugin-name}}/g, `${ data.package }`, projectPath
            );
            await this.replacer(  // Plugin author used in PHP doc @author for example
                phpFiles, /{{author_name}}/g, `${ data.author }`, projectPath
            );
            await this.replacer(  // Plugin author used in PHP doc @author for example
                phpFiles, /{{version}}/g, `${ data.pluginVersion }`, projectPath
            );
            await this.replacer(  // Plugin author email used in PHP doc @author for example
                phpFiles, /{{author_email}}/g, `${ data.authorEmail }`, projectPath
            );
            await this.replacer(  // Plugin author link used in PHP doc @link for example
                phpFiles, /{{author_url}}/g, `https://${ data.url }`, projectPath
            );
            await this.replacer(  // Plugin copyright used in PHP doc @copyright for example
                phpFiles, /{{author_copyright}}/g, `${ new Date().getFullYear() } ${ data.projectName }`, projectPath
            );
            await this.replacer(  // Plugin license used in PHP doc @licence for example
                phpFiles, /{{author_license}}/g, `${ data.license }`, projectPath
            );

            /**
             * Meta
             */
            await this.replacer(  // PHP plugin meta text domain in "the-plugin-name.php"
                phpFiles,
                /^ \* Text Domain:.*$/m, ` * Text Domain:     ${ data.package + '-text-domain' }`, projectPath
            );
            await this.replacer(  // PHP plugin meta text namespace in "the-plugin-name.php"
                phpFiles,
                /^ \* Namespace:.*$/m, ` * Namespace:       ${ data.namespace }`, projectPath
            );
            /**
             * Translation functions
             */
            await this.replacer(  // text domain in translation functions
                phpFiles, /the-plugin-name-text-domain/g, `${ data.package + '-text-domain' }`, projectPath
            );
            /**
             * Namespace
             */
            await this.replacer(  // File namespace
                phpFiles, /namespace ThePluginName/g, `${ 'namespace ' + data.namespace }`, projectPath
            );
            await this.replacer(  // Namespace called in various occurrences
                phpFiles, /ThePluginName\\/g, `${ data.namespace + '\\' }`, projectPath
            );
            /**
             * Functions, constants, variables
             */
            await this.replacer(  // Constants with prefixes
                phpFiles, /_THE_PLUGIN_NAME_/g, `${ data.prefix + '_' }`, projectPath
            );
            await this.replacer(  // File or global variables with prefixes
                phpFiles, /\$the_plugin_name_/g, `${ '$' + data.lowerCasePrefix + '_' }`, projectPath
            );
            await this.replacer(  // Plugin database settings variable in classes/Config/Plugin.php
                phpFiles, /get_option\( 'the-plugin-name-/g, `${ 'get_option( \'' + data.package + '-' }`, projectPath
            );
            await this.replacer(  // external template folder name in classes/Config/Plugin.php
                phpFiles, /=> 'the-plugin-name-templates/g, `${ '=> \'' + data.package + '-templates' }`, projectPath
            );
            await this.replacer(  // External function (only in the-plugin-name.php)
                phpFiles, /the_plugin_name\(\)/g, `${ data.lowerCasePrefix + '()' }`, projectPath
            );

            /**
             * Filters & actions
             */
            await this.replacer(  // Filters
                phpFiles, /apply_filters\( 'the_plugin_name_/g, `${ 'apply_filters( \'' + data.lowerCasePrefix + '_' }`, projectPath
            );
            await this.replacer(  // Actions
                phpFiles, /do_action\( 'the_plugin_name_/g, `${ 'do_action( \'' + data.lowerCasePrefix + '_' }`, projectPath
            );
        }

        /**
         * Codeception
         */
        if ( data.codeception === 'yes' ) {
            await this.replacer(
                codeceptionFiles, /the-plugin-name\/the-plugin-name.php/g, `${ data.package + '/' + data.package }.php`, projectPath
            );
        } else {
            // delete files and folders if not needed
            await del( codeceptionFiles );
            await del( projectPath + '/tests' );
        }

        /**
         * PHPCodeSniffer ~ PHPCS
         */
        if ( data.codesniffer === 'yes' ) {
            await this.replacer(
                codesnifferFiles, /<ruleset name="The Plugin Name ruleset">/g, `<ruleset name="${ data.projectName } ruleset">`, projectPath
            );
            await this.replacer(
                codesnifferFiles, /<description>Ruleset for the The Plugin Name.<\/description>/g, `<description>Ruleset for the ${ data.projectName }.</description>`, projectPath
            );
            await this.replacer(
                codesnifferFiles, /<element value="ThePluginName"\/>/g, `<element value="${ data.namespace }"/>`, projectPath
            );
            await this.replacer(
                codesnifferFiles, /<element value="_THE_PLUGIN_NAME"\/>/g, `<element value="${ data.prefix }"/>`, projectPath
            );
            await this.replacer(
                codesnifferFiles, /<element value="the_plugin_name"\/>/g, `<element value="${ data.lowerCasePrefix }"/>`, projectPath
            );
            await this.replacer(
                codesnifferFiles, /<file>the-plugin-name.php<\/file>/g, `<file>${ data.package }.php</file>`, projectPath
            );
            await this.replacer(
                codesnifferFiles, /<element value="the-plugin-name-text-domain"\/>/g, `<element value="${ data.package }-text-domain"/>`, projectPath
            );
        } else {
            // delete files and folders if not needed
            await del( codesnifferFiles );
            if ( data.travisCi === 'yes' ) {
                await this.replacer(
                    travisCiFiles, [
                        /  - composer phpcs/g,
                        /  # Run PHPCS\./g
                    ], ``, projectPath
                );
            }
        }

        if ( data.travisCi === 'no' ) {
            await del( travisCiFiles );
        }

        /**
         * Composer.json
         */
        await this.replacer(
            composerFile, /ThePluginName\\/g, `${ data.namespace }\\`, projectPath
        );
        await this.replacer(
            composerFile, /wpstrap\/wordpress-plugin-boilerplate/g, `${ data.vendor }/${ data.package }`, projectPath
        );
        await this.replacer(
            composerFile, /Wordpress Plugin Boilerplate/g, `${ data.description }`, projectPath
        );
        await this.replacer(
            composerFile, /0\.1\.1/g, `${ data.pluginVersion }`, projectPath
        );
        await this.replacer(
            composerFile, /https:\/\/wp-strap.com/g, `https://${ data.url }`, projectPath
        );
        await this.replacer(
            composerFile, /WP-Strap/g, `${ data.author }`, projectPath
        );
        await this.replacer(
            composerFile, /hello@wp-strap.com/g, `${ data.authorEmail }`, projectPath
        );

        /**
         * Modify composer.json dependencies based on prior conditions
         */
        const readComposer = promisify( readFile );
        const composerData = JSON.parse( await readComposer( composerFile, 'utf-8' ) );
        if ( data.codesniffer === 'no' ) {
            delete composerData[ 'require-dev' ][ 'dealerdirect/phpcodesniffer-composer-installer' ];
            delete composerData[ 'require-dev' ][ 'wp-coding-standards/wpcs' ];
            delete composerData[ 'require-dev' ][ 'automattic/phpcs-neutron-ruleset' ];
            delete composerData[ 'require-dev' ][ 'phpcompatibility/phpcompatibility-wp' ];
            delete composerData[ 'scripts' ][ 'phpcs' ];
        }
        if ( data.codeception === 'no' ) {
            delete composerData[ 'require-dev' ][ 'lucatume/function-mocker' ];
            delete composerData[ 'require-dev' ][ 'lucatume/wp-browser' ];
            delete composerData[ 'require-dev' ][ 'codeception/lib-innerbrowser' ];
            delete composerData[ 'require-dev' ][ 'codeception/module-asserts' ];
            delete composerData[ 'require-dev' ][ 'codeception/module-phpbrowser' ];
            delete composerData[ 'require-dev' ][ 'codeception/module-webdriver' ];
            delete composerData[ 'require-dev' ][ 'codeception/module-db' ];
            delete composerData[ 'require-dev' ][ 'codeception/module-filesystem' ];
            delete composerData[ 'require-dev' ][ 'codeception/module-cli' ];
            delete composerData[ 'require-dev' ][ 'codeception/module-rest' ];
            delete composerData[ 'require-dev' ][ 'codeception/util-universalframework' ];
            delete composerData[ 'require-dev' ][ 'codeception/codeception-progress-reporter' ];
            delete composerData[ 'scripts' ][ 'codecept' ];
            delete composerData[ 'scripts' ][ 'run:wpunit' ];
            delete composerData[ 'scripts' ][ 'run:functional' ];
            delete composerData[ 'scripts' ][ 'run:acceptance' ];
            delete composerData[ 'scripts' ][ 'generate:wpunit' ];
            delete composerData[ 'scripts' ][ 'generate:functional' ];
            delete composerData[ 'scripts' ][ 'generate:acceptance' ];
        }
        writeFileSync( composerFile, JSON.stringify( composerData, null, 4 ) );

        /**
         * Rename the plugin entry file
         */
        if ( await fs.pathExists( pathEntryFile ) ) {
            fs.rename( pathEntryFile, path.join( projectPath, `${ data.package }.php` ) );
        }
    }
}

module.exports = { Scanner };