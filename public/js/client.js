var socket = io();

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
	document.querySelector('.play-button').addEventListener('click', function() {
		play({
			playerInstance: player,
			spotify_uri: favtrack,
		});
	});

	document.querySelector('.pauze-button').addEventListener('click', function() {
		player.pause().then(() => {
			console.log('Paused!');
		});
	});


};
