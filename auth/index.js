var passport = require('passport');
var SpotifyStrategy = require('passport-spotify').Strategy;

var client_id = process.env.CLIENT_ID; // Your client id
var client_secret = process.env.CLIENT_SECRET; // Your secret
var redirect_uri = process.env.REDIRECT_URI; // Your redirect uri

function auth(){

passport.serializeUser(function(user, done) {
	done(null, user);
});

passport.deserializeUser(function(obj, done) {
	done(null, obj);
});

passport.use(new SpotifyStrategy({
		clientID: client_id,
		clientSecret: client_secret,
		callbackURL: redirect_uri
	},
	function(accessToken, refreshToken, expires_in, profile, done) {
		// asynchronous verification, for effect...
		process.nextTick(function() {

			profile.accessToken = accessToken;
			return done(null, profile);
		});
}));
}

module.exports.auth = auth;
