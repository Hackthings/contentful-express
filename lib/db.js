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
var slug = require( "slug" );
var db = {
    spaces: lowdb( path.join( process.cwd(), "db", "spaces.json" ), {
        storage: storage
    }),
    assets: lowdb( path.join( process.cwd(), "db", "assets.json" ), {
        storage: storage
    }),
    entries: lowdb( path.join( process.cwd(), "db", "entries.json" ), {
        storage: storage
    }),
    contentTypes: lowdb( path.join( process.cwd(), "db", "contentTypes.json" ), {
        storage: storage
    }),
    urls: lowdb( path.join( process.cwd(), "db", "urls.json" ), {
        storage: storage
    })
};



const expandStatic = function ( dir, ext ) {
    var ret = {};

    fs.readdirSync( path.join( config.static.root, dir ) ).forEach(function ( file ) {
        var regex = new RegExp( "\\." + ext + "$" );

        if ( regex.test( file ) ) {
            ret[ file.replace( regex, "" ) ] = (dir + file);
        }
    });

    return ret;
};



/**
 *
 * @member _
 * @description Expose lodash to the {db} wrapper, just grab the ref from spaces.
 *
 */
db._ = db.spaces._;



/**
 *
 * @method mapUrl
 * @description Map a `slug` to an Entry ID
 *
 */
db.mapUrl = function ( entry ) {
    db.urls( "urls" ).push({
        id: entry.sys.id,
        slug: db.getSlug( entry )
    });
};



/**
 *
 * @method getSlug
 * @param {object} entry The Entry to lookup slug for
 * @description Get the slug for an Entry, defaults to ID
 * @returns {string}
 *
 */
db.getSlug = function ( entry ) {
    var uri = entry.sys.id;

    if ( config.urls.field ) {
        var regex = config.urls.field;

        for ( var field in entry.fields ) {
            if ( regex.test( field ) ) {
                uri = slug( entry.fields[ field ] ).toLowerCase();
                break;
            }
        }
    }

    return uri;
};



/**
 *
 * @method getStatic
 * @param {object} entry The Entry to add static.url to
 * @description Add the static.url field to an Entry
 * @returns {object}
 *
 */
db.getStatic = function ( entry ) {
    entry.static = {
        url: "/" + (entry.sys.contentType.sys.id + "/" + db.getSlug( entry )) + "/"
    };

    return entry;
};



/**
 *
 * @method getEntry
 * @param {string} type The contentType
 * @param {string} uri The :id or :slug
 * @description Get an entry by ID or slug URL mapping
 * @returns {object}
 *
 */
db.getEntry = function ( type, uri ) {
    var entry = db.entries( type ).chain().find( { sys: { id: uri } } ).value();

    if ( !entry && config.urls.field ) {
        uri = db.urls( "urls" ).chain().find( { slug: uri } ).value().id;

        entry = db.entries( type ).chain().find( { sys: { id: uri } } ).value()
    }

    return db._.cloneDeep( db.getStatic( entry ) );
};



/**
 *
 * @method getEntries
 * @param {string} type The contentType
 * @description Get all entries for a contentType
 * @returns {array}
 *
 */
db.getEntries = function ( type ) {
    var entries = db._.cloneDeep( db.entries( type ).value() );

    entries.forEach(function ( entry ) {
        entry = db.getStatic( entry );
    });

    return entries;
};



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
                json[ type ] = db.entries( type ).chain().value();
            });

        } else {
            var lookup = {};
                lookup.fields = {};
                lookup.fields[ config.mapping[ id ].entry.field ] = config.mapping[ id ].entry.value;
            json[ config.mapping[ id ].type ] = db.entries( config.mapping[ id ].type )
                                                    .chain()
                                                    .find( lookup )
                                                    .value();
        }
    }

    return db._.cloneDeep( json );
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
        space: db.spaces( "spaces" ).chain().find( { sys: { id: config.contentful.space } } ).value(),
        static: {
            js: expandStatic( config.static.js, "js" ),
            css: expandStatic( config.static.css, "css" ),
            fonts: config.static.fonts,
            images: config.static.images
        },
        staticPages: db.getStaticPages().map(function ( page ) {
            return { id: page, url: (page === "index" ? "/" : "/" + page + "/") };
        }),
        contentTypes: db.contentTypes( "contentTypes" ).chain().value()
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
    return db._.cloneDeep( db.entries.object );
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