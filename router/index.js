var express = require('express');
var dotenv = require('dotenv').config();
var passport = require('passport');
var SpotifyWebApi = require('spotify-web-api-node');
var auth = require('../auth/index').auth();
var router = express.Router();

router.get('/', ensureAuthenticated, function(req, res) {
			var spotifyApi = new SpotifyWebApi();

			spotifyApi.setAccessToken(req.user.accessToken);

			spotifyApi.getMyTopTracks()
			
				.then(function(data) {
					res.render('index', {
						user: req.user,
						tracks: data.body.items
					});
						return data;
					}).then(function(data) {
						spotifyApi.play({
							uris: [data.body.items[Math.floor(Math.random() * data.body.items.length)].uri]
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
				scope: ['user-read-private user-read-email user-read-playback-state user-modify-playback-state user-top-read'],
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
