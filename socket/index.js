var Playlist = require('../models/playlist');

module.exports = function(io, spotifyApi) {
	var playIndex = 0;
	var playing = false;
	io.on('connection', function(socket) {

		socket.on('play', function(playIndex) {
			console.log(playIndex);
			io.sockets.emit('play', playIndex);
			playing = true;

		});

		socket.on('nextTrack', function(playList) {
			if (playIndex >= (playList.length - 1)) {
				playIndex = 0;
			} else {
				playIndex++;
			}
			io.sockets.emit('nextTrack', playIndex);
		});

		socket.on('prevTrack', function(playList) {
			if (playIndex > 0) {
				playIndex--;
			} else if (playIndex === 0) {
				playIndex = (playList.length - 1);
			}
			io.sockets.emit('prevTrack', playIndex);
		});

		socket.on('addToPlaylist', function(track) {
			spotifyApi.getTrack(track)
				.then(function(data) {

					var addedTrack = new Playlist({
							id: data.body.id,
							uri: data.body.uri,
							name: data.body.name,
						})
						.save()
						.then(function(addedTrack) {
							io.sockets.emit('addToPlaylist', addedTrack);
						});

				}).catch(function(error) {
					console.error(error);
				});
		});

		socket.on('removeFromPlaylist', function(trackId) {
			var removedTrack = trackId;
			Playlist.find({
					_id: trackId
				}).remove()
				.then(function(trackId) {

					io.sockets.emit('removeFromPlaylist', removedTrack);
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
			io.sockets.emit('totalUsers', {
				count: io.engine.clientsCount
			});
		});
	});
};
