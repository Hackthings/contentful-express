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

    lager( "cache", "Dropping lowdb databases..." );

    db.spaces.object = {};
    db.spaces.write();

    db.assets.object = {};
    db.assets.write();

    db.entries.object = {};
    db.entries.write();

    db.contentTypes.object = {};
    db.contentTypes.write();

    db.urls.object = {};
    db.urls.write();

    return new Promise(function ( resolve, reject ) {
        client.getSpace().then(function ( json ) {
            lager( "cache", "Sync: Space " + json.name + "..." );

            db.spaces( "spaces" ).push( json );

        }).catch(function ( error ) {
            reject( error );
        });

        client.getAssets().then(function ( json ) {
            lager( "cache", "Sync: Assets..." );

            db.assets( "assets" ).push( json );

        }).catch(function ( error ) {
            reject( error );
        });

        client.getContentTypes().then(function ( json ) {
            db.contentTypes( "contentTypes" ).push();
            db.urls( "urls" ).push();

            json.items.forEach(function ( item ) {
                lager( "cache", "Sync: Content Type: " + item.name + "..." );

                db.contentTypes( "contentTypes" ).push( item );
                db.entries( item.sys.id ).push();

                if ( config.ignore.indexOf( item.sys.id ) === -1 ) {
                    template.sync( item.sys.id ).then(function ( id ) {
                        lager( "template", "Created template files for contentType \"" + id + "\"" );
                    });
                }
            });

            client.getEntries().then(function ( json ) {
                json.items.forEach(function ( item ) {
                    lager( "cache", "Sync: Entry: " + item.sys.id + ": " + item.sys.contentType.sys.id + "..." );

                    db.entries( item.sys.contentType.sys.id ).push( item );

                    if ( config.urls.field ) {
                        db.mapUrl( item );
                    }
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