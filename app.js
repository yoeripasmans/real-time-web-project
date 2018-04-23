var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');
var router = require('./router/index');
var passport = require('passport');
var db = require('./models/index');

var SpotifyWebApi = require('spotify-web-api-node');
var spotifyApi = new SpotifyWebApi();

var app = express(),
  server = require('http').createServer(app),
  socket = require('./socket');

var io = require('socket.io').listen(server);

socket(io, spotifyApi);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({
	extended: false
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
	secret: 'anything'
}));

app.use(passport.initialize());
app.use(passport.session());

// Make spotifyApi accessible to our router
app.use(function(req,res,next){
    req.spotifyApi = spotifyApi;
    next();
});

app.use('/', router);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
	next(createError(404));
});

server.listen(process.env.PORT || '8888', function() {
	console.log('listening on port:8888');
});
