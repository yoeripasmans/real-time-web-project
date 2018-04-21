var socket = io();
console.log(playList);
var currentTrack;

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

	socket.on('play', function(currentTrack) {
		play({
			playerInstance: player,
			spotify_uri: playList[currentTrack].uri,
		});
	});

	socket.on('pause', function() {
		player.pause();
	});

	socket.on('resume', function() {
		player.resume();
	});

	socket.on('nextTrack', function(currentTrack) {
		console.log(currentTrack);
		play({
			playerInstance: player,
			spotify_uri: playList[currentTrack].uri,
		});
	});

	socket.on('prevTrack', function(currentTrack) {
		console.log(currentTrack);
		play({
			playerInstance: player,
			spotify_uri: playList[currentTrack].uri,
		});
	});

};

//Events
document.querySelector('.play-button').addEventListener('click', function() {
	socket.emit('play', 0);
});

document.querySelector('.next-button').addEventListener('click', function() {
	socket.emit('nextTrack');
});

document.querySelector('.prev-button').addEventListener('click', function() {
	socket.emit('prevTrack');
});

document.querySelector('.pause-button').addEventListener('click', function() {
	socket.emit('pause');
});

document.querySelector('.resume-button').addEventListener('click', function() {
	socket.emit('resume');
});

//Create eventlistener to add playbuttons
var addButton = document.querySelectorAll('.add-button');
for (var i = 0; i < addButton.length; i++) {
	addButton[i].addEventListener('click', addToPlaylist);
}

//Emit clicked track with the id of that track.
function addToPlaylist() {
	socket.emit('addToPlaylist', this.getAttribute('data-id'));
}

socket.on('addToPlaylist', function(data) {
	var list = document.querySelector('.playlist');
	var item = document.createElement('li');
	item.textContent = data.name;
	list.appendChild(item);
});
