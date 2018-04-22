var socket = io();

window.onSpotifyWebPlaybackSDKReady = () => {
	const player = new Spotify.Player({
		name: 'Web Playback SDK Quick Start Player',
		getOAuthToken: cb => {
			cb(token);
		},
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

	socket.on('play', function(playIndex, currentTrack) {
		console.log(currentTrack);
		play({
			playerInstance: player,
			spotify_uri: currentTrack.uri,
		});
		addPlayerDetails(currentTrack);
	});

	socket.on('nextTrack', function(playIndex, currentTrack) {
		play({
			playerInstance: player,
			spotify_uri: currentTrack.uri,
		});
		addPlayerDetails(currentTrack);
	});

	socket.on('prevTrack', function(playIndex, currentTrack) {
		play({
			playerInstance: player,
			spotify_uri: currentTrack.uri,
		});
		addPlayerDetails(currentTrack);
	});

	socket.on('pause', function() {
		player.pause();
	});

	socket.on('resume', function() {
		player.resume();
	});


};

function addPlayerDetails(currentTrack) {
	var trackNameEl = document.querySelector('.player-details__track-name');
	var artistsEl = document.querySelector('.player-details__artist-name');
	artistNames = currentTrack.artists.map(a => a.name);
	artistNames.toString();
	trackNameEl.textContent = currentTrack.name;
	artistsEl.textContent = artistNames;
	console.log(artistNames);
}

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

//Add track to playlist and add html elements to visually respresent the track.
socket.on('addToPlaylist', function(data) {

	var list = document.querySelector('.playlist');

	var item = document.createElement('li');
	item.classList.add("playlist__track");
	item.setAttribute("data-id", data._id);
	list.appendChild(item);

	var itemText = document.createElement('span');
	itemText.textContent = data.name;
	item.appendChild(itemText);

	var removeButton = document.createElement('button');
	removeButton.textContent = "Remove from playlist";
	removeButton.setAttribute("data-id", data._id);
	item.appendChild(removeButton);
	removeButton.addEventListener('click', removeFromPlaylist);
});

//Create eventlistener to add playbuttons
var removeButton = document.querySelectorAll('.remove-button');
for (var i = 0; i < removeButton.length; i++) {
	removeButton[i].addEventListener('click', removeFromPlaylist);
}

//Emit clicked track with the id of that track.
function removeFromPlaylist() {
	socket.emit('removeFromPlaylist', this.getAttribute('data-id'));
}

socket.on('removeFromPlaylist', function(id) {
	var playlist = document.querySelector('.playlist');
	var tracks = document.querySelectorAll(".playlist__track");

	//Delete the removed item
	for (var i = 0; i < tracks.length; i++) {
		if (tracks[i].getAttribute("data-id") === id) {
			playlist.removeChild(tracks[i]);
		}

	}
});
