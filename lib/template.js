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
var layout = path.join( config.template.root, "layout.html" );



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

        return consolidate[ config.template.lang ]( filename, json ).then(function ( html ) {
            json.body = html;

            return consolidate[ config.template.lang ]( layout, json );
        });
    }
};



/******************************************************************************
 * Export
*******************************************************************************/
module.exports = template;