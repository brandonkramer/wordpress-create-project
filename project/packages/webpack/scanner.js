/**
 * @type replace : A simple utility to quickly replace text in one or more files or globs.
 * @type path : The path module provides utilities for working with file and directory paths.
 */
const replace = require( 'replace-in-file' );
const path    = require( 'path' );
const fs      = require( 'fs-extra' );

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
     * Removes folder
     * @param folder
     * @returns {Promise<void>}
     */
    async removeFolder( folder ) {
        try {
            await fs.remove( folder )
        } catch ( err ) {
            console.error( err )
        }
    }

    /**
     * https://github.com/adamreisnz/replace-in-file
     * @param data
     * @param projectPath
     * @returns {Promise<void>}
     */
    async searchReplace( data, projectPath ) {
        const TranslationFile = path.join( projectPath, 'languages', 'wordpress-webpack.pot' );
        const packageJsonFile = path.join( projectPath, 'package.json' );
        /**
         * Package.json
         */
        await this.replacer( // translation --dest-file
            packageJsonFile, /languages\/wordpress-webpack.pot/g, `languages/${ data.package }.pot`, projectPath
        );
        await this.replacer( // translation --package
            packageJsonFile, /--package 'wordpress-webpack'/g, `--package '${ data.package }'`, projectPath
        );
        await this.replacer( // translation --domain
            packageJsonFile, /--domain 'wordpress-webpack-text-domain'/g, `--domain '${ data.package }-text-domain'`, projectPath
        );
        await this.replacer( // translation --last-translator
            packageJsonFile, /--last-translator '{{author_name}} <{{author_email}}>'/g, `--last-translator '${ data.author } <${ data.authorEmail }>'`, projectPath
        );
        await this.replacer( // translation --team
            packageJsonFile, /--team '{{author_name}} <{{author_email}}>'/g, `--team '${ data.author } <${ data.authorEmail }>'`, projectPath
        );
        await this.replacer( // translation --bug-report
            packageJsonFile, /--bug-report '{{author_url}}'/g, `--bug-report '${ data.url }'`, projectPath
        );
        /**
         * Rename the translation file
         */
        if ( await fs.pathExists( TranslationFile ) ) {
            fs.rename( TranslationFile, path.join( projectPath, 'languages', `${ data.package }.pot` ) );
        }

        /**
         * Move the current folder if chosen
         */
        if ( data.folder === 'Current folder' ) {
            await fs.move( projectPath + '/assets', './assets', console.error );
            await fs.move( projectPath + '/webpack', './webpack', console.error );
            await fs.move( projectPath + '/.gitignore', './.gitignore', console.error );
            await fs.move( projectPath + '/package.json', './package.json', console.error );
            await fs.move( projectPath + '/README.md', './README.md', console.error );
            await fs.move( projectPath + '/webpack.config.js', './webpack.config.js', console.error );
            await fs.move( projectPath + '/languages', './languages', console.error );
            await this.removeFolder( projectPath )
        }
    }

}

module.exports = { Scanner };