var express = require('express');
var dotenv = require('dotenv').config();
var passport = require('passport');
var SpotifyWebApi = require('spotify-web-api-node');
var auth = require('../auth/index').auth();
var router = express.Router();


var playList = ["6gBFPUFcJLzWGx4lenP6h2", "6sTDhYVVXU3HSDuG7mBLRU", "3qKCDFZp192KBEEtFj7fDa"];
var topTracks;
var spotifyApi = new SpotifyWebApi();

router.get('/', ensureAuthenticated, function(req, res) {

	console.log(playList);
	//Set the acces token of the user
	spotifyApi.setAccessToken(req.user.accessToken);

	spotifyApi.getMyTopTracks()

		.then(function(data) {
			topTracks = data.body.items;
			return spotifyApi.getTracks(playList);
		}).then(function(data) {
			var playList = data.body.tracks;
			console.log(playList);
			// req.io.on('connection', function(socket) {
			// 	socket.emit('playList', {
			// 		playList: playList
			// 	});
			// });
			
			res.render('index', {
				user: req.user,
				tracks: topTracks,
				playList: playList
			});

		}).catch(function(error) {
			console.error(error);
		});

});

router.get('/account', ensureAuthenticated, function(req, res) {
	res.render('account', {
		user: req.user
	});
});

router.get('/login', function(req, res) {
	res.render('login', {
		user: req.user
	});
});

router.get('/auth/spotify',
	passport.authenticate('spotify', {
		scope: ['streaming user-read-birthdate user-read-private user-read-email user-read-playback-state user-modify-playback-state user-top-read'],
		showDialog: true
	}),
	function(req, res) {
		// The request will be redirected to spotify for authentication, so this
		// function will not be called.
	});

router.get('/callback',
	passport.authenticate('spotify', {
		failureRedirect: '/login'
	}),
	function(req, res) {
		res.redirect('/');
	});

router.get('/logout', function(req, res) {
	req.logout();
	res.redirect('/');
});

function ensureAuthenticated(req, res, next) {
	if (req.isAuthenticated()) {
		return next();
	}
	res.redirect('/login');
}

module.exports = router;
