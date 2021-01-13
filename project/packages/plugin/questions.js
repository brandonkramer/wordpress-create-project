/**
 * @type Questions : Used to gather user data to create the project
 * @docs https://github.com/SBoudrias/Inquirer.js
 */
const Questions = {
    // Used for plugin name occurrences
    projectName: {
        type:     'text',
        name:     'projectName',
        describe: 'Please enter your project name (e.g. The Plugin Name):',
    },
    // Used for plugin description occurrences
    description: {
        type:     'text',
        name:     'description',
        describe: 'The plugin description:',
    },
    // Used for plugin version occurrences
    pluginVersion: {
        type:     'text',
        name:     'pluginVersion',
        default:  '1.0.0',
        describe: 'The plugin version (default: 1.0.0):',
    },
    // Used for plugin license occurrences
    license: {
        type:     'text',
        name:     'license',
        default:  'MIT',
        describe: 'The plugin license (default: MIT):',
    },
    // Used for author name occurrences
    author: {
        type:     'text',
        name:     'author',
        describe: 'The plugin author\'s name (e.g. The Dev Company):',
    },
    // Used for author email occurrences
    authorEmail: {
        type:     'text',
        name:     'authorEmail',
        describe: 'The plugin author\'s e-mail address (e.g. hello@the-dev-company.com):',
    },
    // Used for author url & plugin url occurrences
    url: {
        type:     'text',
        name:     'url',
        describe: 'The author url without https:// (e.g. the-dev-company.com):',
    },
    // Include webpack tooling files
    webpack: {
        name:     'webpack',
        describe: 'Use WebPack for front-end (SCSS/JS) tooling (Y/n)',
        type:     'list',
        yesNo:    true,
        choices:  [ 'yes', 'no' ]
    },
    // Include PHPCodeSniffer composer configurations
    codesniffer: {
        name:     'codesniffer',
        describe: 'Use PHP CodeSniffer with WP Coding Standards to validate the code for WordPress (Y/n)',
        type:     'list',
        yesNo:    true,
        choices:  [ 'yes', 'no' ]
    },
    // Include Codeception files
    codeception: {
        name:     'codeception',
        describe: 'Use Codeception for functional, integration & acceptance tests (Y/n)',
        type:     'list',
        yesNo:    true,
        choices:  [ 'yes', 'no' ]
    },
    // Include TravisCI configuration
    travisCi: {
        name:     'travisCi',
        describe: 'Use Travis CI for automatic testing & continuous integration (Y/n)',
        type:     'list',
        yesNo:    true,
        choices:  [ 'yes', 'no' ]
    },
    // Used for composer.json
    vendor: {
        type:      'text',
        name:      'vendor',
        describe:  'Composer.json vendor name:',
        buildFrom: {
            name: 'author',
            how:  ( sourceArg ) => sourceArg.replace( /[^a-z0-9 -]/gi, '' ).toLowerCase().split( ' ' ).join( '-' ),
        },
    },
    // Used for name of the folder, text domain name
    package: {
        type:      'text',
        name:      'package',
        describe:  'Package name: name of the folder, text domain name (e.g. plugin-name):',
        buildFrom: {
            name: 'projectName',
            how:  ( sourceArg ) => sourceArg.replace( /[^a-z0-9 -]/gi, '' ).toLowerCase().split( ' ' ).join( '-' ),
        },
    },
    // Used for the namespace
    namespace: {
        type:      'text',
        name:      'namespace',
        describe:  'Namespace for your project / files (e.g. PackageName):',
        buildFrom: {
            name: 'projectName',
            how:  ( sourceArg ) => sourceArg
                .replace( /[^a-z0-9 _]/gi, '' ) // leave only digits, letters, spaces and underscores
                .toLowerCase()
                .split( /[ _]+/ ) // split on space and underscore
                .map( ( word ) => word.charAt( 0 ).toUpperCase() + word.slice( 1 ) ) // capitalize first letter of each word
                .join( '' ),
        },
    },
    // Prefix used for constant that uses uppercase letters
    prefix: {
        type:      'text',
        name:      'prefix',
        describe:  'Project prefix for any globals with uppercase letters. (e.g. PLUGIN_NAME):',
        buildFrom: {
            name: 'projectName',
            how:  ( sourceArg ) => sourceArg
                .replace( /[^a-z0-9 _]/gi, '' ) // leave only digits, letters, spaces and underscores
                .split( /[ _]+/ ) // split on space and underscore
                .map( ( word ) => word.charAt( 0 ) + word.slice( 1 ) ) // capitalize first letter of each word
                .join( '_' ).toUpperCase(),
        },
    },
    // Prefix used for actions, filters, file or global variables with lowercase letters
    lowerCasePrefix: {
        type:      'text',
        name:      'lowerCasePrefix',
        describe:  'Project prefix for any lowercase occurrences incl. actions, filters (e.g. plugin_name):',
        buildFrom: {
            name: 'prefix',
            how:  ( sourceArg ) => sourceArg.toLowerCase(),
        },
    },
};

module.exports = {
    Questions,
};