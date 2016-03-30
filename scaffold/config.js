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
        "css": "/css/screen.css",
        "js": "/js/app.js",
        "img": "",
        "fonts": ""
    },


    "source": {
        "root": path.join( __dirname, "source" )
    },


    "languages": [
        "en-US"
    ]
};