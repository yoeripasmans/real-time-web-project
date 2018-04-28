// grab the things we need
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// create a schema
var trackSchema = new Schema({
   name: String,
   id: String,
   uri: String,
   artists: Object,
   images: Array
}, {timestamps: true});
// the schema is useless so far
// we need to create a model using it
var playlist = mongoose.model('playlist', trackSchema);

// make this available to our users in our Node applications
module.exports = playlist;
