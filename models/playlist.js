// grab the things we need
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// create a schema
var trackSchema = new Schema({
   spotifyId: String,
   username: String,
   email: String,
   accessToken: String,
   profilePic: String,
   refreshToken: String

});
// the schema is useless so far
// we need to create a model using it
var playlist = mongoose.model('playlist', trackSchema);

// make this available to our users in our Node applications
module.exports = playlist;
