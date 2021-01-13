/**
 * Testing the operator with JestJS
 * @docs https://jestjs.io/docs/en/getting-started
 **/
const del      = require( 'del' );
const path     = require( 'path' );
const { existsSync, mkdirSync }
               = require( 'fs' );
const { Operator }
               = require( '../project/controllers/operator.js' );
const operator = new Operator();

/**
 * Gets the full path of where the
 * project is being created
 * @returns {string}
 */
function getFullPath() {
    return path.join( process.cwd() );
}

/**
 * Define test files and folders
 */
const testFiles = {
    dir: path.join( `${ getFullPath() }/the-plugin-test-folder` ),
}

/**
 * Create test files, folders and strings
 */
beforeEach( () => {
    if ( !existsSync( testFiles.dir ) ) {
        mkdirSync( testFiles.dir );
    }
} );

afterEach( async () => {
    await del( testFiles.dir );
} );

/**
 * Tests
 */
test( 'Check if the git repo gets cloned and we can find the files to scan', async () => {
    await operator.getRepo( 'https://github.com/wp-strap/wordpress-plugin-boilerplate.git', testFiles.dir )
    expect( existsSync(
        path.join( testFiles.dir, 'the-plugin-name.php' )
    ) ).toBe( true );
    expect( existsSync(
        path.join( testFiles.dir, 'composer.json' )
    ) ).toBe( true );
    expect( existsSync(
        path.join( testFiles.dir, 'classes', 'Bootstrap.php' )
    ) ).toBe( true );
    expect( existsSync(
        path.join( testFiles.dir, 'classes', 'App', 'Frontend', 'Templates.php' )
    ) ).toBe( true );
} );