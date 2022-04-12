Module.register("MMM-TwitchAlert",{
	// Setting module config
	defaults: {
		streamerData: {},
	},

	// Get api token using the client info
	getNewToken: function(){
		var xmlhttp = new XMLHttpRequest();
		// Callback when it gets the api token
		xmlhttp.onreadystatechange = function() {
			if (xmlhttp.readyState === 4) {
				Log.info(xmlhttp.response);
			}
		}
		xmlhttp.open("POST", "https://id.twitch.tv/oauth2/token");
		xmlhttp.setRequestHeader("Content-Type", "application/json");
		xmlhttp.send(JSON.stringify({
			"client_id": this.config.client_id,
			"client_secret": this.config.client_secret,
			"grant_type":"client_credentials",
		}));
	},

	// Make an api call to get data about a streamer
	getStreamerData: function(streamerName){

	},

	// Update the streamer
	updateStreamsData: function(){

	},
	
	notificationReceived: function(notification, payload, sender) {
		if(notification === "RETREIVE_API_TOKEN_RES"){
			if(payload === 'DNE' || payload === 'FAILURE'){
				// make request to twitch api to get new token
				// this.config.apiToken = payload;
			}else{
				this.config.apiToken = payload;
			}
		}else if(notification === "STORE_API_TOKEN_RES"){
			//respond if good
		}
	},
	
	// Starting module
	start: function(){
		Log.info('Starting module: '+this.name);
		this.sendSocketNotification("RETREIVE_API_TOKEN",null);
		
	},

	// Displaying the object to the mirror
	getDom: function(){
		if(this.config.apiToken == ""){
			this.getNewToken();
			this.config.apiToken = " ";
		}
		console.log(this);
		var wrapper = document.createElement("div");
		wrapper.innerHTML = this.config.text;
		return wrapper;
	},
});