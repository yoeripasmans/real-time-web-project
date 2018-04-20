var passport = require('passport');
var SpotifyStrategy = require('passport-spotify').Strategy;
var refresh = require('spotify-refresh');
var User = require('../models/user');

var client_id = process.env.CLIENT_ID; // Your client id
var client_secret = process.env.CLIENT_SECRET; // Your secret
var redirect_uri = process.env.REDIRECT_URI; // Your redirect uri

function auth() {

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
				console.log(profile);

				User.findOne({
					spotifyId: profile.id
				}).then(function(currentUser) {
					if (currentUser) {
						console.log('currentuser');
						currentUser.accessToken = accessToken;
						currentUser.save().then(function(currentUser) {
							return done(null, currentUser);
						}).catch(function(err) {
							console.log(err);
						});

					} else {
						new User({
							spotifyId: profile.id,
							username: profile.username,
							displayName: profile.displayName,
							email: profile.emails[0].value,
							profilePic: profile.photos[0],
							accessToken: accessToken,
							refreshToken: refreshToken,
						}).save().then(function(newUser) {
							console.log('newuser');
							return done(null, newUser);
						}).catch(function(err) {
							console.log(err);
						});
					}
				});

				// User.findOrCreate({
				// 	spotifyId: profile.id,
				// 	username: profile.username,
				// 	displayName: profile.displayName,
				// 	email: profile.emails[0].value,
				// 	profilePic: profile.photos[0],
				// 	accessToken: accessToken,
				// 	refreshToken: refreshToken,
				// }, function(err, user) {
				// 	console.log('A new uxer from "%s" was inserted', user.spotifyId);
				// 	return done(null, user);
				// });


				// profile.accessToken = accessToken;
				// return done(null, profile);
			});
		}));

}

module.exports.auth = auth;
