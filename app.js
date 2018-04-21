var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');
var router = require('./router/index');
var passport = require('passport');
var db = require('./models/index');

var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

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
	secret: 'keyboard cat'
}));

app.use(passport.initialize());
app.use(passport.session());

// Make io accessible to our router
app.use(function(req,res,next){
    req.io = io;
    next();
});

app.use('/', router);


io.on('connection', function(socket) {
	var currentTrack;

	socket.on('play', function(id) {
		currentTrack = id;
		console.log(currentTrack);
		io.sockets.emit('play', currentTrack);
	});

	socket.on('nextTrack', function() {
		currentTrack++;
		console.log(currentTrack);
		io.sockets.emit('nextTrack', currentTrack);
	});

	socket.on('prevTrack', function() {
		currentTrack--;
		console.log(currentTrack);
		io.sockets.emit('prevTrack', currentTrack);
	});

	socket.on('pause', function() {
		io.sockets.emit('pause');
	});

	socket.on('resume', function() {
		io.sockets.emit('resume');
	});
	//Disconnect
	socket.on('disconnect', function(data) {
		//added this below
		io.sockets.emit('totalUsers', {
			count: io.engine.clientsCount
		});
	});
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
	next(createError(404));
});

http.listen(process.env.PORT || '8888', function() {
	console.log('listening on port:8888');
});
