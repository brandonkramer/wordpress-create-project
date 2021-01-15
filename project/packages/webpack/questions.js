/**
 * @type Questions : Used to gather user data to create the project
 * @docs https://github.com/SBoudrias/Inquirer.js
 */
const Questions = {
    // Used for name occurrences
    projectName: {
        type:     'text',
        name:     'projectName',
        describe: 'Please enter your Webpack project name:',
        default:  'The Project Name',
    },
    // Used for author name occurrences
    author: {
        type:     'text',
        name:     'author',
        describe: 'The author\'s name for the POT file:',
        default:  'The Dev Company',
    },
    // Used for author email occurrences
    authorEmail: {
        type:     'text',
        name:     'authorEmail',
        describe: 'The author\'s e-mail address for the POT file:',
        default:  'hello@the-dev-company.com',
    },
    // Used for author url & plugin url occurrences
    url: {
        type:     'text',
        name:     'url',
        describe: 'The author\'s url without https:// for the POT file:',
        default:  'the-dev-company.com',
    },
    // Used for name of the folder, text domain name
    package: {
        type:      'text',
        name:      'package',
        describe:  'Package name: name of the folder, POT file, text domain name (e.g. plugin-name):',
        buildFrom: {
            name: 'projectName',
            how:  ( sourceArg ) => sourceArg.replace( /[^a-z0-9 -]/gi, '' ).toLowerCase().split( ' ' ).join( '-' ),
        },
    },
    // Type of CSS
    css: {
        name:     'css',
        describe: 'Use Sass+PostCSS or PostCSS-only?',
        type:     'list',
        choices:  [ 'Sass+PostCSS', 'PostCSS-only' ]
    },
    // Install into the current folder or as a new folder
    folder: {
        name:     'folder',
        describe: 'Install the Webpack workflow into the current folder or as a new folder?',
        type:     'list',
        choices:  [ 'New folder', 'Current folder' ]
    },
};

module.exports = {
    Questions,
};