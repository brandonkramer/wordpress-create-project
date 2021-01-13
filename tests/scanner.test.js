/**
 * Testing the scanner with JestJS
 * @docs https://jestjs.io/docs/en/getting-started
 **/
const del     = require( 'del' );
const path    = require( 'path' );
const { existsSync, writeFileSync, readFile, mkdirSync }
              = require( 'fs' );
const { readdir }
              = require( 'fs-extra' );
const { promisify }
              = require( 'util' );
const { Scanner }
              = require( '../project/packages/plugin/scanner.js' );
const scanner = new Scanner();

/**
 * Define test files and folders
 */
const testFiles = {
    dir:         path.join( `${ scanner.getFullPath() }/the-plugin-test-folder` ),
    dirEmpty:    path.join( `${ scanner.getFullPath() }/the-plugin-test-folderEmpty` ),
    file:        path.join( `${ scanner.getFullPath() }/the-plugin-test-folder/test.json` ),
    file2:       path.join( `${ scanner.getFullPath() }/the-plugin-test-folder/test2.json` ),
    ignoredDir:  path.join( `${ scanner.getFullPath() }/the-plugin-test-folder/node_modules` ),
    ignoredFile: path.join( `${ scanner.getFullPath() }/the-plugin-test-folder/node_modules/test.json` ),
}

/**
 * Fake data to test with
 */
const fakeData = {
    name:            'WordPress Replacer Plugin',
    desc:            'A plugin to replace strings in posts',
    url:             'www.wp-replacers.com',
    package:         'wordpress-replacer-plugin',
    author:          'WPReplacers',
    authorEmail:     'hello@wp-replacers.com',
    license:         'MIT',
    namespace:       'WordpressReplacerPlugin',
    prefix:          'WORDPRESS_REPLACER_PLUGIN',
    lowerCasePrefix: 'wordpress_replacer_plugin'
}

/**
 * Plugin data occurrences
 */
const testPluginData = {
    name:    'name: {{The Plugin Name}}',
    f_name1: 'name: {{The Plugin False Name}}',
    f_name2: 'The Plugin Name',
    desc:    'desc: {{plugin_description}}',
    f_desc1: 'desc: {{plugin_false_description}}',
    f_desc2: 'plugin_description',
    p_url:   'url: {{plugin_url}}',
    p_name:  'name: {{the-plugin-name}}',
    author:  'author: {{author_name}}',
    email:   'email: {{author_email}}',
    url:     'url: {{author_url}}',
    copy:    'copyright: {{author_copyright}}',
    license: 'license: {{author_license}}',
}

const testString = {
    randomString: 'This is a random test string.',
}

/**
 * Translation functions
 */
const testPluginTranslationFunctions = {
    text_domain_in_func: '\'this is test string\', \'the-plugin-name-text-domain\''
}

/**
 * Namespaces
 */
const testPluginNamespace = {
    ns_variant_1: 'namespace ThePluginName',
    ns_variant_2: 'ThePluginName\\App\\Cli'
}

/**
 * Filters & actions
 */
const testFiltersHooks = {
    filter: 'apply_filters( \'the_plugin_name_test_filter\', \'test_filter_function\')',
    action: 'do_action( \'the_plugin_name_test_filter\', \'test_filter_function\')'
}

/**
 * Functions, constants, variables
 */
const testPluginPrefixes = {
    constant:   '_THE_PLUGIN_NAME_TEST_CONSTANT',
    variable:   '$the_plugin_name_test_variable',
    db_option:  'get_option( \'the-plugin-name-test-option\' )',
    template:   '\'template\' => \'the-plugin-name-templates\'',
    x_function: 'the_plugin_name()',
}

/**
 * Create test files, folders and strings
 */
beforeEach( () => {
    if ( !existsSync( testFiles.dir ) ) {
        mkdirSync( testFiles.dir );
    }
    if ( !existsSync( testFiles.dirEmpty ) ) {
        mkdirSync( testFiles.dirEmpty );
    }
    if ( !existsSync( testFiles.ignoredDir ) ) {
        mkdirSync( testFiles.ignoredDir );
    }

    const testData = {
        ...testString, ...testPluginData, ...testPluginNamespace, ...testPluginPrefixes,
        ...testPluginTranslationFunctions, ...testFiltersHooks
    }
    writeFileSync( testFiles.file, JSON.stringify( testData ) );
    writeFileSync( testFiles.file2, JSON.stringify( testData ) );
    writeFileSync( testFiles.ignoredFile, JSON.stringify( testData ) );
} );

afterEach( async () => {
    await del( testFiles.dir );
    await del( testFiles.dirEmpty );
} );

const replacements = async () => {
    /**
     * All occurrences
     */
    await scanner.replacer(
        path.join( testFiles.dir, '**', '*.json' ), /{{The Plugin Name}}/g, `${ fakeData.name }`, testFiles.dir );
    await scanner.replacer(
        path.join( testFiles.dir, '**', '*.json' ), /{{plugin_description}}/g, `${ fakeData.desc }`, testFiles.dir );
    await scanner.replacer(
        path.join( testFiles.dir, '**', '*.json' ), /{{plugin_url}}/g, `https://${ fakeData.url }`, testFiles.dir );
    await scanner.replacer(
        path.join( testFiles.dir, '**', '*.json' ), /{{the-plugin-name}}/g, `${ fakeData.package }`, testFiles.dir );
    await scanner.replacer(
        path.join( testFiles.dir, '**', '*.json' ), /{{author_name}}/g, `${ fakeData.author }`, testFiles.dir );
    await scanner.replacer(
        path.join( testFiles.dir, '**', '*.json' ), /{{author_email}}/g, `${ fakeData.authorEmail }`, testFiles.dir );
    await scanner.replacer(
        path.join( testFiles.dir, '**', '*.json' ), /{{author_url}}/g, `https://${ fakeData.url }`, testFiles.dir );
    await scanner.replacer(
        path.join( testFiles.dir, '**', '*.json' ), /{{author_copyright}}/g, `${ new Date().getFullYear() } ${ fakeData.name }`, testFiles.dir );
    await scanner.replacer(
        path.join( testFiles.dir, '**', '*.json' ), /{{author_license}}/g, `${ fakeData.license }`, testFiles.dir );
    /**
     * Translation functions
     */
    await scanner.replacer(
        path.join( testFiles.dir, '**', '*.json' ), /the-plugin-name-text-domain/g, `${ fakeData.package + '-text-domain' }`, testFiles.dir );
    /**
     * Namespace
     */
    await scanner.replacer(
        path.join( testFiles.dir, '**', '*.json' ), /namespace ThePluginName/g, `${ 'namespace ' + fakeData.namespace }`, testFiles.dir );
    await scanner.replacer(
        path.join( testFiles.dir, '**', '*.json' ), /ThePluginName\\/g, `${ fakeData.namespace + '\\' }`, testFiles.dir );
    /**
     * Functions, constants, variables
     */
    await scanner.replacer(
        path.join( testFiles.dir, '**', '*.json' ), /_THE_PLUGIN_NAME_/g, `${ fakeData.prefix + '_' }`, testFiles.dir );
    await scanner.replacer(
        path.join( testFiles.dir, '**', '*.json' ), /\$the_plugin_name_/g, `${ '$' + fakeData.lowerCasePrefix + '_' }`, testFiles.dir );
    await scanner.replacer(
        path.join( testFiles.dir, '**', '*.json' ), /get_option\( 'the-plugin-name-/g, `${ 'get_option( \'' + fakeData.package + '-' }`, testFiles.dir );
    await scanner.replacer(
        path.join( testFiles.dir, '**', '*.json' ), /=> 'the-plugin-name-templates/g, `${ '=> \'' + fakeData.package + '-templates' }`, testFiles.dir );
    await scanner.replacer(
        path.join( testFiles.dir, '**', '*.json' ), /the_plugin_name\(\)/g, `${ fakeData.lowerCasePrefix + '()' }`, testFiles.dir );
    /**
     * Filters & actions
     */
    await scanner.replacer(
        path.join( testFiles.dir, '**', '*.json' ), /apply_filters\( 'the_plugin_name_/g, `${ 'apply_filters( \'' + fakeData.lowerCasePrefix + '_' }`, testFiles.dir );
    await scanner.replacer(
        path.join( testFiles.dir, '**', '*.json' ), /do_action\( 'the_plugin_name_/g, `${ 'do_action( \'' + fakeData.lowerCasePrefix + '_' }`, testFiles.dir );

}

/**
 * Tests
 */
test( 'Check if the replacement results returns the right amount of occurrences', async () => {
    const results = await scanner.replacer(
        path.join( testFiles.dir, '**', '*.json' ),
        /{{The Plugin Name}}/g,
        'WPStrap Plugin',
        testFiles.dir );
    expect(
        results.length === 2
    ).toBe( true )
} );
test( 'Check if the (right) plugin data gets replaced', async () => {
    await replacements();
    const readFileAsync = promisify( readFile );
    const fileContents  = JSON.parse( await readFileAsync( testFiles.file, 'utf-8' ) );
    [
        [ fileContents.name, testPluginData.name ],
        [ fileContents.desc, testPluginData.desc ],
        [ fileContents.p_url, testPluginData.p_url ],
        [ fileContents.p_name, testPluginData.p_name ],
        [ fileContents.author, testPluginData.author ],
        [ fileContents.email, testPluginData.email ],
        [ fileContents.url, testPluginData.url ],
        [ fileContents.copy, testPluginData.copy ],
        [ fileContents.license, testPluginData.license ],
        [ fileContents.text_domain_in_func, testPluginTranslationFunctions.text_domain_in_func ],
        [ fileContents.ns_variant_1, testPluginNamespace.ns_variant_1 ],
        [ fileContents.ns_variant_2, testPluginNamespace.ns_variant_2 ],
        [ fileContents.filter, testFiltersHooks.filter ],
        [ fileContents.action, testFiltersHooks.action ],
        [ fileContents.constant, testPluginPrefixes.constant ],
        [ fileContents.variable, testPluginPrefixes.variable ],
        [ fileContents.db_option, testPluginPrefixes.db_option ],
        [ fileContents.template, testPluginPrefixes.template ],
        [ fileContents.x_function, testPluginPrefixes.x_function ],
    ].forEach( function ( data ) {
        expect( data[ 0 ] ).not.toMatch( data[ 1 ] );
    } );
    [
        [ fileContents.f_name1, testPluginData.f_name1 ],
        [ fileContents.f_name2, testPluginData.f_name2 ],
        [ fileContents.f_desc1, testPluginData.f_desc1 ],
        [ fileContents.f_desc2, testPluginData.f_desc2 ],
    ].forEach( function ( data ) {
        expect( data[ 0 ] ).toMatch( data[ 1 ] );
    } );
} );
test( 'Check if the plugin data gets replaced with the right string', async () => {
    await replacements();
    const readFileAsync = promisify( readFile );
    const fileContents  = JSON.parse( await readFileAsync( testFiles.file, 'utf-8' ) );
    [
        [ fileContents.name, 'name: ' + fakeData.name ],
        [ fileContents.desc, 'desc: ' + fakeData.desc ],
        [ fileContents.p_url, 'url: https://' + fakeData.url ],
        [ fileContents.p_name, 'name: ' + fakeData.package ],
        [ fileContents.author, 'author: ' + fakeData.author ],
        [ fileContents.email, 'email: ' + fakeData.authorEmail ],
        [ fileContents.url, 'url: https://' + fakeData.url ],
        [ fileContents.copy, 'copyright: ' + new Date().getFullYear() + ' ' + fakeData.name ],
        [ fileContents.license, 'license: ' + fakeData.license ],
        [ fileContents.text_domain_in_func, '\'this is test string\', \'' + fakeData.package + '-text-domain\'' ],
        [ fileContents.ns_variant_1, 'namespace ' + fakeData.namespace ],
        [ fileContents.ns_variant_2, fakeData.namespace + '\\App\\Cli' ],
        [ fileContents.filter, 'apply_filters( \'' + fakeData.lowerCasePrefix + '_test_filter\', \'test_filter_function\')' ],
        [ fileContents.action, 'do_action( \'' + fakeData.lowerCasePrefix + '_test_filter\', \'test_filter_function\')' ],
        [ fileContents.constant, fakeData.prefix + '_TEST_CONSTANT' ],
        [ fileContents.variable, '$' + fakeData.lowerCasePrefix + '_test_variable' ],
        [ fileContents.db_option, 'get_option( \'' + fakeData.package + '-test-option\' )' ],
        [ fileContents.template, '\'template\' => \'' + fakeData.package + '-templates\'' ],
        [ fileContents.x_function, fakeData.lowerCasePrefix + '()' ],
    ].forEach( function ( data ) {
        expect( data[ 0 ] ).toMatch( data[ 1 ] );
    } );
} );
test( 'Check if the replacement works in multiple files', async () => {
    await replacements();
    const readFileAsync = promisify( readFile );
    const fileContents  = JSON.parse( await readFileAsync( testFiles.file2, 'utf-8' ) );
    [
        [ fileContents.name, 'name: ' + fakeData.name ],
        [ fileContents.desc, 'desc: ' + fakeData.desc ],
        [ fileContents.p_url, 'url: https://' + fakeData.url ],
        [ fileContents.p_name, 'name: ' + fakeData.package ],
        [ fileContents.author, 'author: ' + fakeData.author ],
        [ fileContents.email, 'email: ' + fakeData.authorEmail ],
        [ fileContents.url, 'url: https://' + fakeData.url ],
        [ fileContents.copy, 'copyright: ' + new Date().getFullYear() + ' ' + fakeData.name ],
        [ fileContents.license, 'license: ' + fakeData.license ],
        [ fileContents.text_domain_in_func, '\'this is test string\', \'' + fakeData.package + '-text-domain\'' ],
        [ fileContents.ns_variant_1, 'namespace ' + fakeData.namespace ],
        [ fileContents.ns_variant_2, fakeData.namespace + '\\App\\Cli' ],
        [ fileContents.filter, 'apply_filters( \'' + fakeData.lowerCasePrefix + '_test_filter\', \'test_filter_function\')' ],
        [ fileContents.action, 'do_action( \'' + fakeData.lowerCasePrefix + '_test_filter\', \'test_filter_function\')' ],
        [ fileContents.constant, fakeData.prefix + '_TEST_CONSTANT' ],
        [ fileContents.variable, '$' + fakeData.lowerCasePrefix + '_test_variable' ],
        [ fileContents.db_option, 'get_option( \'' + fakeData.package + '-test-option\' )' ],
        [ fileContents.template, '\'template\' => \'' + fakeData.package + '-templates\'' ],
        [ fileContents.x_function, fakeData.lowerCasePrefix + '()' ],
    ].forEach( function ( data ) {
        expect( data[ 0 ] ).toMatch( data[ 1 ] );
    } );
} );
test( 'Check if no replacements are being made in ignored folder', async () => {
    await replacements();
    const readFileAsync = promisify( readFile );
    const fileContents  = JSON.parse( await readFileAsync( testFiles.ignoredFile, 'utf-8' ) );
    [
        [ fileContents.name, 'name: ' + fakeData.name ],
        [ fileContents.desc, 'desc: ' + fakeData.desc ],
        [ fileContents.p_url, 'url: https://' + fakeData.url ],
        [ fileContents.p_name, 'name: ' + fakeData.package ],
        [ fileContents.author, 'author: ' + fakeData.author ],
        [ fileContents.email, 'email: ' + fakeData.authorEmail ],
        [ fileContents.url, 'url: https://' + fakeData.url ],
        [ fileContents.copy, 'copyright: ' + new Date().getFullYear() + ' ' + fakeData.name ],
        [ fileContents.license, 'license: ' + fakeData.license ],
        [ fileContents.text_domain_in_func, '\'this is test string\', \'' + fakeData.package + '-text-domain\'' ],
        [ fileContents.ns_variant_1, 'namespace ' + fakeData.namespace ],
        [ fileContents.ns_variant_2, fakeData.namespace + '\\App\\Cli' ],
        [ fileContents.filter, 'apply_filters( \'' + fakeData.lowerCasePrefix + '_test_filter\', \'test_filter_function\')' ],
        [ fileContents.action, 'do_action( \'' + fakeData.lowerCasePrefix + '_test_filter\', \'test_filter_function\')' ],
        [ fileContents.constant, fakeData.prefix + '_TEST_CONSTANT' ],
        [ fileContents.variable, '$' + fakeData.lowerCasePrefix + '_test_variable' ],
        [ fileContents.db_option, 'get_option( \'' + fakeData.package + '-test-option\' )' ],
        [ fileContents.template, '\'template\' => \'' + fakeData.package + '-templates\'' ],
        [ fileContents.x_function, fakeData.lowerCasePrefix + '()' ],
    ].forEach( function ( data ) {
        expect( data[ 0 ] ).not.toMatch( data[ 1 ] );
    } );
} );
