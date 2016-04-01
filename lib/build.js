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
var execSync = require( "child_process" ).execSync;



/**
 *
 * @method renderEntry
 * @param {string} id The contentType ID
 * @param {string} dir The file directory
 * @param {string} uri The sub folder to create
 * @param {object} json The template json data
 * @description Renders an entry by contentType and writes it to a build file
 *
 */
var renderEntry = function ( id, dir, uri, json ) {
    template.pushQueue( id, "entry", json, function ( html ) {
        var sub = path.join( dir, uri );

        fs.mkdirSync( sub );
        fs.writeFileSync( path.join( sub, "index.html" ), html );

        lager( "template", "Created build file: build/" + id + "/" + uri + "/index.html" );
    });
};



/**
 *
 * @method renderEntries
 * @param {string} id The contentType ID
 * @param {string} dir The file directory
 * @param {object} json The template json data
 * @description Renders entries by contentType and writes it to a build file
 *
 */
var renderEntries = function ( id, dir, json ) {
    template.pushQueue( id, "entries", json, function ( html ) {
        fs.writeFileSync( path.join( dir, "index.html" ), html );

        lager( "template", "Created build file: build/" + id + "/index.html" );
    });
};



/**
 *
 * @method renderStaticPage
 * @param {string} page The slug name for the page such as "index"
 * @description Renders static pages like index.html or about.html
 *
 */
var renderStaticPage = function ( page ) {
    template.pushQueue( "", page, db.getTemplateData(), function ( html ) {
        if ( page === "index" ) {
            fs.writeFileSync( path.join( config.build.root, "index.html" ), html );
            lager( "template", "Created build file: build/index.html" );

        } else {
            fs.mkdirSync( path.join( config.build.root, page ) );
            fs.writeFileSync( path.join( config.build.root, page, "index.html" ), html );
            lager( "template", "Created build file: build/" + page + "/index.html" );
        }
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
        var contentTypes = db.getContentRoutes();
        var staticPages = db.getStaticPages();

        if ( fs.existsSync( config.build.root ) ) {
            rimraf.sync( config.build.root );
        }

        // @build - root
        fs.mkdirSync( config.build.root );

        // @build - static/js static/css
        makeStatic( config.static.js );
        makeStatic( config.static.css );
        makeStatic( config.static.fonts );
        makeStatic( config.static.images );

        execSync( "cp -R " + config.static.root + config.static.js + " " + config.build.root + config.static.js );
        lager( "template", "Created static dir: build" + config.static.js );

        execSync( "cp -R " + config.static.root + config.static.css + " " + config.build.root + config.static.css );
        lager( "template", "Created static dir: build" + config.static.css );

        execSync( "cp -R " + config.static.root + config.static.fonts + " " + config.build.root + config.static.fonts );
        lager( "template", "Created static dir: build" + config.static.fonts );

        execSync( "cp -R " + config.static.root + config.static.images + " " + config.build.root + config.static.images );
        lager( "template", "Created static dir: build" + config.static.images );

        // @build - index.html {page}/index.html
        staticPages.forEach(function ( page ) {
            renderStaticPage( page );
        });

        // @build - content types
        for ( var id in contentTypes ) {
            if ( config.ignore.indexOf( id ) === -1 ) {
                var dir = path.join( config.build.root, id );

                fs.mkdirSync( dir );

                var json1 = db.getTemplateData();
                    json1.entries = db.getEntries( id );

                json1 = db.getDataMapping( id, json1 );
    
                renderEntries( id, dir, json1 );

                contentTypes[ id ].forEach(function ( entry ) {
                    var uri = db.getSlug( entry );
                    var json2 = db.getTemplateData();
                        json2.entry = db.getEntry( id, uri );

                    json2 = db.getDataMapping( id, json2 );

                    renderEntry( id, dir, uri, json2 );
                });
            }
        }

        template.execQueue(function () {
            resolve();
        });
    });
};



/******************************************************************************
 * Export
*******************************************************************************/
module.exports = build;