/**
 *
 * @module db
 * @description Manages the instance of `lowdb`
 * @schema `data`
 *
 */
var fs = require( "fs" );
var path = require( "path" );
var config = require( path.join( process.cwd(), "config.js" ) );
var storage = require( "lowdb/file-async" );
var lowdb = require( "lowdb" );
var db = lowdb( path.join( process.cwd(), "db.json" ), {
    storage: storage
});
var excludeTables = [
    "space",
    "assets",
    "contentTypes"
];



/**
 *
 * @method getDataMapping
 * @param {string} id The matched route
 * @param {object} json The base template data json
 * @description Apply data mapping based on config
 * @returns {object}
 *
 */
db.getDataMapping = function ( id, json ) {
    if ( config.mapping[ id ] ) {
        if ( Array.isArray( config.mapping[ id ] ) ) {
            config.mapping[ id ].forEach(function ( type ) {
                json[ type ] = db( type ).chain().value();
            });

        } else {
            var lookup = {};
                lookup.fields = {};
                lookup.fields[ config.mapping[ id ].entry.field ] = config.mapping[ id ].entry.value;
            json[ config.mapping[ id ].type ] = db( config.mapping[ id ].type )
                                                    .chain()
                                                    .find( lookup )
                                                    .value();
        }
    }

    return json;
};



/**
 *
 * @method getTemplateData
 * @description Normalized JSON objects exposed in templates
 * @returns {object}
 *
 */
db.getTemplateData = function () {
    return db._.cloneDeep({
        space: db( "space" ).chain().find( { sys: { id: config.contentful.space } } ).value(),
        static: {
            js: config.static.js,
            css: config.static.css,
        },
        staticPages: db.getStaticPages().map(function ( page ) {
            return { id: page, url: (page === "index" ? "/" : "/" + page + "/") };
        }),
        contentTypes: db( "contentTypes" ).chain().value()
    });
};



/**
 *
 * @method getContentRoutes
 * @description Just the content types mapped to routes
 * @returns {object}
 *
 */
db.getContentRoutes = function () {
    var data = db._.cloneDeep( db.object );

    excludeTables.forEach(function ( table ) {
        delete data[ table ];
    });

    return data;
};



/**
 *
 * @method getStaticPages
 * @description Just the static pages like index.html OR about.html
 * @returns {array}
 *
 */
db.getStaticPages = function () {
    var pages = [];

    fs.readdirSync( path.join( config.template.root ) ).forEach(function ( file ) {
        if ( /\.html$/.test( file ) ) {
            pages.push( file.replace( /\.html$/, "" ) );
        }
    });

    return pages;
};



/******************************************************************************
 * Export
*******************************************************************************/
module.exports = db;