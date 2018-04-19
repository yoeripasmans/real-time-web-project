var socket = io();

console.log(playList);

window.onSpotifyWebPlaybackSDKReady = () => {
	const player = new Spotify.Player({
		name: 'Web Playback SDK Quick Start Player',
		getOAuthToken: cb => {
			cb(token);
		}
	});

	// Error handling
	player.addListener('initialization_error', ({
		message
	}) => {
		console.error(message);
	});
	player.addListener('authentication_error', ({
		message
	}) => {
		console.error(message);
	});
	player.addListener('account_error', ({
		message
	}) => {
		console.error(message);
	});
	player.addListener('playback_error', ({
		message
	}) => {
		console.error(message);
	});

	// Playback status updates
	player.addListener('player_state_changed', state => {
		console.log(state);
	});

	// Ready
	player.addListener('ready', ({
		device_id
	}) => {
		console.log('Ready with Device ID', device_id);
	});


	// Connect to the player!
	player.connect();

		console.log(player);

	const play = ({
		spotify_uri,
		playerInstance: {
			_options: {
				getOAuthToken,
				id
			}
		}
	}) => {
		getOAuthToken(token => {

			fetch(`https://api.spotify.com/v1/me/player/play?device_id=${id}`, {
				method: 'PUT',
				body: JSON.stringify({
					uris: [spotify_uri]
				}),
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${token}`
				},
			});
		});
	};
	document.querySelector('.play-button').addEventListener('click', function() {
		socket.emit('play');
	});

	document.querySelector('.pause-button').addEventListener('click', function() {
		socket.emit('pause');
	});

	document.querySelector('.resume-button').addEventListener('click', function() {
		socket.emit('resume');
	});

	document.querySelector('.next-button').addEventListener('click', function() {
		socket.emit('nextTrack');
	});

	document.querySelector('.prev-button').addEventListener('click', function() {
		socket.emit('prevTrack');
	});

	socket.on('play', function() {
		play({
			playerInstance: player,
			spotify_uri: playList[1].uri,
		});
	});

	socket.on('pause', function() {
		player.pause();
	});

	socket.on('resume', function() {
		player.resume();
	});

	socket.on('nextTrack', function() {
		player.nextTrack();
	});

	socket.on('prevTrack', function() {
		player.previousTrack();
	});

};

socket.on('playList', function(data) {
	playList = data.playList;
	//Create playlist
	var list = document.createElement('ul');
	document.body.appendChild(list);

	for (var i = 0; i < playList.length; i++) {
		var item = document.createElement('li');
		item.textContent = playList[i].name;
		list.appendChild(item);
	}
	console.log(data);
});
