/**
 *
 * @module config
 * @description Configurable data to run the app
 *
 */
var path = require( "path" );



module.exports = {
    "contentful": {
        "host": "cdn.contentful.com",
        "space": "Your space ID",
        "secure": true,
        "accessToken": "Your access token"
    },


    "urls": {},


    "ignore": [],


    "mapping": {},


    "server": {
        "port": "1337"
    },


    "template": {
        "root": path.join( __dirname, "template" ),
        "lang": "ejs"
    },


    "build": {
        "root": path.join( __dirname, "build" )
    },


    "static": {
        "root": path.join( __dirname, "static" ),
        "css": "/css/",
        "js": "/js/",
        "images": "/images/",
        "fonts": "/fonts/"
    },


    "source": {
        "root": path.join( __dirname, "source" )
    },


    "languages": [
        "en-US"
    ]
};