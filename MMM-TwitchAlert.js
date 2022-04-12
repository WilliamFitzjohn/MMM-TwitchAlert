Module.register('MMM-TwitchAlert',{
	// Setting module config
	defaults: {
		streamerData: {},
	},

	// Get api token using the client info
	getNewToken: function(){
		var xmlhttp = new XMLHttpRequest();
		let module = this;
		// Callback when it gets the api token
		xmlhttp.onreadystatechange = function(){
			if (xmlhttp.readyState === 4) {
				module.setNewToken(this);
			}
		}
		xmlhttp.open('POST', 'https://id.twitch.tv/oauth2/token');
		xmlhttp.setRequestHeader('Content-Type', 'application/json');
		xmlhttp.send(JSON.stringify({
			'client_id': this.config.client_id,
			'client_secret': this.config.client_secret,
			'grant_type':'client_credentials',
		}));
	},

	setNewToken: function(e){
		this.config.apiToken = JSON.parse(e.response).access_token;
		this.sendSocketNotification('STORE_API_TOKEN',this.config.apiToken);
	},

	// validateToken: function(token){
	// 	var xmlhttp = new XMLHttpRequest();
	// 	let module = this;
	// 	// Callback when it gets the api token
	// 	xmlhttp.onreadystatechange = function(){
	// 		if (xmlhttp.readyState === 4) {
	// 			module.setNewToken(this);
	// 		}
	// 	}
	// 	xmlhttp.open('GET', 'https://id.twitch.tv/oauth2/token');
	// 	xmlhttp.setRequestHeader('Content-Type', 'application/json');
	// 	xmlhttp.send(JSON.stringify({
	// 		'client_id': this.config.client_id,
	// 		'client_secret': this.config.client_secret,
	// 		'grant_type':'client_credentials',
	// 	}));
	// },
	
	// Make an api call to get data about a streamer
	getStreamerData: function(streamerName){

	},

	// Update the streamer
	updateStreamsData: function(){

	},
	
	socketNotificationReceived: function(notification, payload, sender) {
		// Log.info(notification,payload);
		if(notification === 'RETREIVE_API_TOKEN_RES'){
			if(payload === 'DNE' || payload === 'FAILURE'){
				// make request to twitch api to get new token
				this.getNewToken();
			}else{
				this.config.apiToken = payload;
				// this.validateToken(this.config.apiToken);
			}
		}else if(notification === 'STORE_API_TOKEN_RES'){
			//respond if good
		}
	},
	
	// Starting module
	start: function(){
		Log.info('Starting module: '+this.name);
		this.sendSocketNotification('RETREIVE_API_TOKEN',null);
	},

	// Displaying the object to the mirror
	getDom: function(){
		console.log(this);

		var wrapper = document.createElement('div');
		wrapper.innerHTML = this.config.apiToken;
		return wrapper;
	},
});