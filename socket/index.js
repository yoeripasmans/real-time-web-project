var Playlist = require('../models/playlist');

module.exports = function(io, spotifyApi) {
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

		socket.on('addToPlaylist', function(track) {
			spotifyApi.getTrack(track)
				.then(function(data) {
					var addedTrack = data.body;
					console.log(addedTrack);
					new Playlist({
						id: addedTrack.id,
						uri: addedTrack.uri,
						name: addedTrack.name,
					}).save();

					io.sockets.emit('addToPlaylist', addedTrack);
				}).catch(function(error) {
					console.error(error);
				});
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
};
