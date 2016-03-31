/**
 *
 * @module help
 * @description Display info about this tool
 *
 */
var fs = require( "fs" );
var path = require( "path" );
var colors = require( "colors" );



/**
 *
 * @method help
 * @description Display info about this tool
 *
 */
var help = function () {
    var package = JSON.parse( fs.readFileSync( path.join( __dirname, "../package.json" ) ) );

    console.log( colors.magenta( package.title ) );
    console.log( colors.cyan( package.description ) );
    console.log( colors.cyan( "Version " + package.version ) );
    console.log();
    console.log( colors.white( "Commands:" ) );
    console.log( colors.white( "contentful-express init       Initialize project scaffold" ) );
    console.log( colors.white( "contentful-express server     Start local express dev server" ) );
    console.log( colors.white( "contentful-express build      Generate a static site build" ) );
    console.log( colors.white( "contentful-express sync       Perform data sync with Contentful" ) );
    console.log();
    process.exit();
};



/******************************************************************************
 * Export
*******************************************************************************/
module.exports = help;