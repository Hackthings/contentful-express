/**
 *
 * @module app
 * @description Manages the instance of `express`
 * @routes `contentTypes`
 * @route /contentType/
 * @route /contentType/:id
 *
 */
var path = require( "path" );
var config = require( path.join( process.cwd(), "config.js" ) );
var sync = require( "./sync" );
var db = require( "./db" );
var lager = require( "./lager" );
var template = require( "./template" );
var express = require( "express" );
var app = express();



/**
 *
 * @method getJson
 * @description Normalized JSON objects exposed in templates
 * @returns {object}
 *
 */
var getJson = function () {
    return db._.cloneDeep({
        space: db( "space" ).chain().find( { sys: { id: config.contentful.space } } ).value(),
        static: {
            js: config.static.js,
            css: config.static.css
        }
    });
};



/**
 *
 * @method handleEntry
 * @param {object} req The express request
 * @param {object} res The express response
 * @description Serves a single entry by contentType
 *
 */
var handleEntry = function ( req, res ) {
    var id = req.params.id;
    var type = req.path.replace( /^\/|\/$/g, "" ).split( "/" ).shift();
    var json = getJson();
        json.entry = db( type ).chain().find( { sys: { id: id } } ).value();

    if ( req.query.format === "json" ) {
        res.status( 200 ).json( json );

    } else {
        template.render( type, "entry", json ).then(function ( html ) {
            res.status( 200 ).send( html );
        });
    }
};



/**
 *
 * @method handleEntries
 * @param {object} req The express request
 * @param {object} res The express response
 * @description Serves a list of entries by contentType
 *
 */
var handleEntries = function ( req, res ) {
    var type = req.path.replace( /^\/|\/$/g, "" ).split( "/" ).shift();
    var json = getJson();
        json.entries = db( type ).value();

    if ( req.query.format === "json" ) {
        res.status( 200 ).json( json );

    } else {
        template.render( type, "entries", json ).then(function ( html ) {
            res.status( 200 ).send( html );
        });
    }
};



/**
 *
 * @method handleIndex
 * @param {object} req The express request
 * @param {object} res The express response
 * @description Serves the index.html as homepage
 *
 */
var handleIndex = function ( req, res ) {
    if ( req.query.format === "json" ) {
        res.status( 200 ).json( {} );

    } else {
        template.render( "", "index", {} ).then(function ( html ) {
            res.status( 200 ).send( html );
        });
    }
};



/******************************************************************************
 * Export
*******************************************************************************/
module.exports = function () {
    /**
     *
     * @description Perform a contentful data sync, then bind routes by contentType
     *
     */
    sync().then(function ( data ) {
        lager( "cache", "Contentful sync success!" );

        app.use( express.static( config.static.root ) );

        app.get( "/", handleIndex );

        for ( var route in data ) {
            app.get( "/" + route, handleEntries );
            app.get( "/" + route + "/:id", handleEntry );
        }

        app.listen( config.server.port );

        lager( "server", "Server running on port " + config.server.port );

    }).catch(function ( error ) {
        require( "./error" )( error );
    });
};