/**
 *
 * @module template
 * @description Manages the contentful data templating
 *
 */
var db = require( "./db" );
var lager = require( "./lager" );
var fs = require( "fs" );
var path = require( "path" );
var config = require( path.join( process.cwd(), "config.js" ) );
var consolidate = require( "consolidate" );
var layout = path.join( config.template.root, "layouts", "index.html" );
var queue = [];



// Load the template engine if not using the packaged default `ejs`
if ( config.template.lang !== "ejs" && config.template.engine ) {
    consolidate.requires[ config.template.lang ] = config.template.engine;

} else {
    lager( "error", "You need to provide the module for the template engine: " + config.template.lang );
    process.exit();
}



var template = {
    /**
     *
     * @method sync
     * @param {string} id The contentType ID
     * @description Sync the template to all local contentTypes
     * @returns {Promise}
     *
     */
    sync: function ( id ) {
        var dir = path.join( config.template.root, id );

        return new Promise(function ( resolve, reject ) {
            fs.exists( dir, function ( isDir ) {
                if ( !isDir ) {
                    fs.mkdir( dir, function ( error ) {
                        if ( !error ) {
                            fs.writeFileSync( path.join( dir, "entry.html" ), "" );
                            fs.writeFileSync( path.join( dir, "entries.html" ), "" );

                            resolve( id );

                        } else {
                            reject( error );
                        }
                    });
                }
            });
        });
    },

    /**
     *
     * @method render
     * @param {string} type The contentType id
     * @param {string} file The file, either `entry` or `entries`
     * @param {object} json The data context for the entries
     * @description Render a template for contentType entries
     * @returns {Promise}
     *
     */
    render: function ( type, file, json ) {
        var filename = path.join( config.template.root, type, (file + ".html") );

        return new Promise(function ( resolve, reject ) {
            consolidate[ config.template.lang ]( filename, json, function ( error, html ) {
                if ( error ) {
                    reject( error );

                } else {
                    json.body = html;

                    consolidate[ config.template.lang ]( layout, json, function ( error, html ) {
                        if ( error ) {
                            reject( error );

                        } else {
                            resolve( html );
                        }
                    });
                }
            });
        });
    },

    /**
     *
     * @method pushQueue
     * @param {string} type The contentType id
     * @param {string} file The file, either `entry` or `entries`
     * @param {object} json The data context for the entries
     * @param {function} func The callback to handle the `render` promise
     * @description Push a set of render arguments to a queue stack
     *
     */
    pushQueue: function ( type, file, json, func ) {
        queue.push({
            type: type,
            file: file,
            json: json,
            func: func
        });
    },

    /**
     *
     * @method execQueue
     * @param {function} callback The callback fired when all renders are done
     * @description Synchronously handle the render queue
     *
     */
    execQueue: function ( callback ) {
        var __render = function ( q ) {
            template.render( q.type, q.file, q.json ).then(function ( html ) {
                q.func( html );

                if ( !queue.length ) {
                    queue = [];

                    callback();

                } else {
                    __render( queue.shift() );
                }
            });
        };

        __render( queue.shift() );
    }
};



/******************************************************************************
 * Export
*******************************************************************************/
module.exports = template;