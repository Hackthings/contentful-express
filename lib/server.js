/**
 *
 * @module app
 * @description Manages the instance of `express`
 * @routes `contentTypes`
 * @route /contentType/
 * @route /contentType/:id
 *
 */
var fs = require( "fs" );
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
 * @method handleEntry
 * @param {object} req The express request
 * @param {object} res The express response
 * @description Serves a single entry by contentType
 *
 */
var handleEntry = function ( req, res ) {
    var id = req.params.id;
    var type = req.path.replace( /^\/|\/$/g, "" ).split( "/" ).shift();
    var json = db.getTemplateData();
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
    var json = db.getTemplateData();
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
 * @method handleStaticPage
 * @param {object} req The express request
 * @param {object} res The express response
 * @description Serves static pages, like index.html or about.html
 *
 */
var handleStaticPage = function ( req, res ) {
    var json = db.getTemplateData();
    var page = req.path.replace( /^\/|\/$/g, "" );

    if ( req.query.format === "json" ) {
        res.status( 200 ).json( json );

    } else {
        // Will evaluate to "index" for "/" OR "{page}" for "/{page}"
        template.render( "", (page || "index"), json ).then(function ( html ) {
            res.status( 200 ).send( html );
        });
    }
};



/**
 *
 * @method routeStaticPages
 * @description Bind routes for static pages
 *
 */
var routeStaticPages = function () {
    var staticPages = db.getStaticPages();

    staticPages.forEach(function ( page ) {
        app.get( "/" + (page === "index" ? "" : page), handleStaticPage );
    });
};



/**
 *
 * @method routeContentTypes
 * @description Bind routes for contentTypes
 *
 */
var routeContentTypes = function () {
    var contentTypes = db.getContentRoutes();

    for ( var route in contentTypes ) {
        app.get( "/" + route, handleEntries );
        app.get( "/" + route + "/:id", handleEntry );
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
    sync().then(function () {
        lager( "cache", "Contentful sync success!" );

        app.use( express.static( config.static.root ) );

        routeStaticPages();
        routeContentTypes();

        app.listen( config.server.port );

        lager( "server", "Server running on port " + config.server.port );

    }).catch(function ( error ) {
        require( "./error" )( error );
    });
};