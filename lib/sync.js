/**
 *
 * @module sync
 * @description Manages the contentful data sync
 * @returns {Promise}
 *
 */
var lager = require( "./lager" );
var db = require( "./db" );
var template = require( "./template" );
var contentful = require( "contentful" );
var path = require( "path" );
var config = require( path.join( process.cwd(), "config.js" ) );



var sync = function () {
    var client = contentful.createClient( config.contentful );

    db.object = {};
    db.write();

    return new Promise(function ( resolve, reject ) {
        client.getSpace().then(function ( json ) {
            db( "space" ).push( json );

        }).catch(function ( error ) {
            reject( error );
        });

        client.getAssets().then(function ( json ) {
            db( "assets" ).push( json );

        }).catch(function ( error ) {
            reject( error );
        });

        client.getContentTypes().then(function ( json ) {
            db( "contentTypes" ).push();

            json.items.forEach(function ( item ) {
                db( "contentTypes" ).push( item );
                db( item.sys.id ).push();

                template.sync( item.sys.id ).then(function ( id ) {
                    lager( "template", "Created template files for contentType \"" + id + "\"" );
                });
            });

            client.getEntries().then(function ( json ) {
                json.items.forEach(function ( item ) {
                    db( item.sys.contentType.sys.id ).push( item );
                });

                resolve();

            }).catch(function ( error ) {
                reject( error );
            });

        }).catch(function ( error ) {
            reject( error );
        });
    });
};



/******************************************************************************
 * Export
*******************************************************************************/
module.exports = sync;