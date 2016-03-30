/**
 *
 * @module lager
 * @param {string} context The log type for colorization
 * @param {string} message The log message to display
 * @description Normalize logging for the app
 *
 */
var lager = function ( context, message ) {
    var format = formats[ context ];
    var name = colors.grey( "> lager" );

    if ( typeof message !== "object" ) {
        if ( typeof format === "function" ) {
            message = format( message );

        } else {
            message = format.info( message );
        }
    }

    console.log( name, message );
};
var colors = require( "colors" );
var formats = {
    template: function ( msg ) {
        return colors.cyan( msg );
    },

    server: function ( msg ) {
        return colors.magenta( msg );
    },

    cache: function ( msg ) {
        return colors.green( msg );
    },

    error: function ( msg ) {
        return colors.red( msg );
    },

    warn: function ( msg ) {
        return colors.yellow( msg );
    },

    info: function ( msg ) {
        return colors.white( msg );
    }
};



/******************************************************************************
 * Export
*******************************************************************************/
module.exports = lager