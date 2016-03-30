/**
 *
 * @module build
 * @description Manages the contentful static site generation
 *
 */
var fs = require( "fs" );
var path = require( "path" );
var config = require( path.join( process.cwd(), "config.js" ) );
var lager = require( "./lager" );
var db = require( "./db" );
var rimraf = require( "rimraf" );
var template = require( "./template" );
var q = require( "q" );
var execSync = require( "child_process" ).execSync;



/**
 *
 * @method renderEntry
 * @param {string} id The contentType ID
 * @param {string} dir The file directory
 * @param {object} entry The entry by contentType
 * @description Renders an entry by contentType and writes it to a build file
 *
 */
var renderEntry = function ( id, dir, entry ) {
    return template.render( id, "entry", entry ).then(function ( html ) {
        var sub = path.join( dir, entry.sys.id );

        fs.mkdirSync( sub );
        fs.writeFileSync( path.join( sub, "index.html" ), html );

        lager( "template", "Created build file for build/" + id + "/" + entry.sys.id + "/index.html" );
    });
};



/**
 *
 * @method renderEntries
 * @param {string} id The contentType ID
 * @param {string} dir The file directory
 * @param {array} entries The entries by contentType
 * @description Renders entries by contentType and writes it to a build file
 *
 */
var renderEntries = function ( id, dir, entries ) {
    return template.render( id, "entries", entries ).then(function ( html ) {
        fs.writeFileSync( path.join( dir, "index.html" ), html );

        lager( "template", "Created build file for build/" + id + "/index.html" );
    });
};



/**
 *
 * @method renderIndex
 * @description Renders index.html as the homepage
 *
 */
var renderIndex = function () {
    template.render( "", "index", {} ).then(function ( html ) {
        fs.writeFileSync( path.join( config.build.root, "index.html" ), html );

        lager( "template", "Created build file for build/index.html" );
    });
};



/**
 *
 * @method makeStatic
 * @param {string} p The static dir path for js, css
 * @description Makes the directories for static js, css
 *
 */
var makeStatic = function ( p ) {
    var dir = null;

    p = p.replace( /^\/|\/$/g, "" ).split( "/" );

    p.pop();

    while ( p.length ) {
        dir = path.join( config.build.root, p.shift() );

        if ( !fs.existsSync( dir ) ) {
            fs.mkdirSync( dir );
        }
    }
};



/**
 *
 * @method build
 * @description Perform a static site build for all content entries in the DB
 * @returns {Promise}
 *
 */
var build = function () {
    return new Promise(function ( resolve, reject ) {
        var promises = [];
        var data = db._.cloneDeep( db.object );

        if ( fs.existsSync( config.build.root ) ) {
            rimraf.sync( config.build.root );
        }

        fs.mkdirSync( config.build.root );

        // Static js and css
        makeStatic( config.static.js );
        makeStatic( config.static.css );

        execSync( "cp " + config.static.root + config.static.js + " " + config.build.root + config.static.js );
        lager( "template", "Created build file for build" + config.static.js );

        execSync( "cp " + config.static.root + config.static.css + " " + config.build.root + config.static.css );
        lager( "template", "Created build file for build" + config.static.css );

        promises.push( renderIndex() );

        for ( var id in data ) {
            var entries = data[ id ];
            var dir = path.join( config.build.root, id );

            fs.mkdirSync( dir );

            promises.push(
                renderEntries( id, dir, entries )
            );

            entries.forEach(function ( entry ) {
                promises.push(
                    renderEntry( id, dir, entry )
                );
            });
        }

        q.all( promises ).done(function ( values ) {
            resolve();
        });
    });
};



/******************************************************************************
 * Export
*******************************************************************************/
module.exports = build;