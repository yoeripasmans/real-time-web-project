var Playlist = require('../models/playlist');

module.exports = function(io, spotifyApi) {
	var playIndex = 0;
	var playing = false;
	var playList = [];

	Playlist.find({}).then(function(results) {
		playList = results;
	}).catch(function(error){
		console.log(error);
	});

	var currentTrack = playList[playIndex];

	io.on('connection', function(socket) {

		socket.on('getState', function(device_id) {
			currentTrack = playList[playIndex];
			io.sockets.emit('getState', playIndex, currentTrack, playing);

			// if (playing === true) {
			// 	io.sockets.emit('play', playIndex, currentTrack, playing);
			// 	playing = true;
			// }

		});

		socket.on('play', function() {
			currentTrack = playList[playIndex];
			playing = true;
			io.sockets.emit('play', playIndex, currentTrack, playing);
		});

		socket.on('nextTrack', function() {
			if (playIndex >= (playList.length - 1)) {
				playIndex = 0;
			} else {
				playIndex++;
			}
			currentTrack = playList[playIndex];
			playing = true;
			io.sockets.emit('nextTrack', playIndex, currentTrack, playing);
		});

		socket.on('prevTrack', function() {
			if (playIndex > 0) {
				playIndex--;
			} else if (playIndex === 0) {
				playIndex = (playList.length - 1);
			}
			currentTrack = playList[playIndex];
			playing = true;
			io.sockets.emit('prevTrack', playIndex, currentTrack, playing);
		});

		socket.on('addToPlaylist', function(track) {
			//Get track details
			spotifyApi.getTrack(track)
				.then(function(data) {
					//Add track to the database
					var addedTrack = new Playlist({
							id: data.body.id,
							uri: data.body.uri,
							name: data.body.name,
							artists: data.body.artists,
							images: data.body.album.images,
						})
						.save()
						.then(function(addedTrack) {
							playList.push(addedTrack);
							io.sockets.emit('addToPlaylist', addedTrack);
						});

				}).catch(function(error) {
					console.error(error);
				});
		});

		socket.on('removeFromPlaylist', function(trackId) {

			var removedTrack = trackId;
			//Remove track from database
			Playlist.find({
					_id: trackId
				}).remove()
				.then(function(trackId) {

					//Filter out the removed item
					playList = playList.filter(function(el) {
						return el._id != removedTrack;
					});

					io.sockets.emit('removeFromPlaylist', removedTrack);
				}).catch(function(error) {
					console.error(error);
				});
		});

		socket.on('pause', function() {
			io.sockets.emit('pause');
			playing = false;
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
