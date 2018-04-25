Offline.options = {checks: {xhr: {url: '/connection-test'}}};

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
		if (state != null && state.position == 0 && state.duration == 0 && state.paused == true) {
			socket.emit('nextTrack');
		}

	});

	// Ready
	player.addListener('ready', ({
		device_id
	}) => {
		socket.emit('getPlayingState');
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

	socket.on('getState', function(playIndex, currentTrack, playStatus) {
		addPlayerDetails(currentTrack);
		togglePlayerButtons(playStatus);
		setActiveTrack(currentTrack);
	});

	socket.on('play', function(playIndex, currentTrack, playStatus) {
		play({
			playerInstance: player,
			spotify_uri: currentTrack.uri,
		});
		addPlayerDetails(currentTrack);
		togglePlayerButtons(playStatus);
		setActiveTrack(currentTrack);
	});


	function setActiveTrack(currentTrack) {
		var tracks = document.querySelectorAll('.playlist__track');
		for (var i = 0; i < tracks.length; i++) {
			if (tracks[i].getAttribute("data-id") === currentTrack._id) {
				tracks[i].classList.add('active');
			} else {
				tracks[i].classList.remove('active');
			}
		}

	}

	socket.on('nextTrack', function(playIndex, currentTrack, playStatus) {
		play({
			playerInstance: player,
			spotify_uri: currentTrack.uri,
		});
		addPlayerDetails(currentTrack);
		togglePlayerButtons(playStatus);
		setActiveTrack(currentTrack);
	});

	socket.on('prevTrack', function(playIndex, currentTrack, playStatus) {
		play({
			playerInstance: player,
			spotify_uri: currentTrack.uri,
		});
		addPlayerDetails(currentTrack);
		togglePlayerButtons(playStatus);
		setActiveTrack(currentTrack);
	});

	socket.on('pause', function(playStatus) {
		player.pause();
		togglePlayerButtons(playStatus);
	});

	socket.on('resume', function() {
		player.resume();
	});


};

function addPlayerDetails(currentTrack) {
	var trackNameEl = document.querySelector('.player-details__track-name');
	var artistsEl = document.querySelector('.player-details__artist-name');
	var imgEl = document.querySelector('.player-details__track-img');
	artistNames = currentTrack.artists.map(a => a.name);
	artistNames.toString();
	trackNameEl.textContent = currentTrack.name;
	artistsEl.textContent = artistNames.join(', ');
	imgEl.src = currentTrack.images[1].url;
}

var playButton = document.querySelector('.play-button');
var stopButton = document.querySelector('.stop-button');
var nextButton = document.querySelector('.next-button');
var prevButton = document.querySelector('.prev-button');

//Events
playButton.addEventListener('click', function() {
	socket.emit('play');
});

nextButton.addEventListener('click', function() {
	socket.emit('nextTrack');
});

prevButton.addEventListener('click', function() {
	socket.emit('prevTrack');
});

stopButton.addEventListener('click', function() {
	socket.emit('pause');
});

// document.querySelector('.resume-button').addEventListener('click', function() {
// 	socket.emit('resume');
// });

window.addEventListener('load', function() {
	socket.emit('getState');
});

function togglePlayerButtons(playing) {
	if (playing == true) {
		playButton.classList.add("hidden");
		stopButton.classList.remove("hidden");
	} else {
		stopButton.classList.add("hidden");
		playButton.classList.remove("hidden");
	}
}

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
	removeButton.classList.add('remove-button');
	removeButton.setAttribute("data-id", data._id);
	item.appendChild(removeButton);
	removeButton.addEventListener('click', removeFromPlaylist);

	var icon = document.createElement('img');
	icon.src = 'icons/cancel.svg';
	removeButton.appendChild(icon);
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

//Offline server handling

var serverError = document.querySelector('.server-offline-error');
var playerControls = document.querySelector('.player-controls');

socket.on('connect_error', function() {
	//show error
	serverError.classList.remove('hidden');
	//hide controls
	for (var i = 0; i < removeButton.length; i++) {
		removeButton[i].classList.add('hidden');
	}
	for (i = 0; i < addButton.length; i++) {
		addButton[i].classList.add('hidden');
	}
	//Remove player controls
	playerControls.classList.add('hidden');
  console.log('Is The Server Online? ' + socket.connected);
});

socket.on('connect', function() {
	//remove error
	serverError.classList.add('hidden');
	//show controls
	for (var i = 0; i < removeButton.length; i++) {
		removeButton[i].classList.remove('hidden');
	}
	for (i = 0; i < addButton.length; i++) {
		addButton[i].classList.remove('hidden');
	}
	//Add player controls
	playerControls.classList.remove('hidden');
	socket.emit('getState');
  console.log('Is The Server Online? ' + socket.connected);
});

//Offline client handling

Offline.on('up', function() {
    socket.emit('getState');
});

Offline.on('down', function() {
	for (var i = 0; i < removeButton.length; i++) {
		removeButton[i].classList.add('hidden');
	}
	for (i = 0; i < addButton.length; i++) {
		addButton[i].classList.add('hidden');
	}
	//Remove player controls
	playerControls.classList.add('hidden');
});
