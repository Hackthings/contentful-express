/**
 *
 * @module init
 * @description Handle contentful sync errors
 *
 */
var lager = require( "./lager" );



/**
 *
 * @method error
 * @param {object} err The Error from Contentful
 * @description Handle contentful sync errors
 *
 */
var error = function ( err ) {
    var msg = "Somethind went wrong, sorry...";

    if ( err.sys.id === "AccessTokenInvalid" ) {
        msg = "Make sure you have the correct \"accessToken\" set in your config.js";

    } else if ( err.sys.id === "NotFound" ) {
        msg = "Make sure you have the correct \"space\" id set in your config.js";
    }

    lager( "error", msg );
};



/******************************************************************************
 * Export
*******************************************************************************/
module.exports = error;