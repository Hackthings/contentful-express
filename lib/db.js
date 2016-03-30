/**
 *
 * @module db
 * @description Manages the instance of `lowdb`
 * @schema `data`
 *
 */
var storage = require( "lowdb/file-async" );
var lowdb = require( "lowdb" );
var path = require( "path" );
var db = lowdb( path.join( process.cwd(), "db.json" ), {
    storage: storage
});



/******************************************************************************
 * Export
*******************************************************************************/
module.exports = db;