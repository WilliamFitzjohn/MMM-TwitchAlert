Module.register("MMM-TwitchAlert",{
	// Setting module config
	defaults: {
		streamerData: {},
	},

	// Get api token using the client info
	getToken: function(){
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

	start: function(){
		Log.info('Starting module: '+this.name);
	},

	// Displaying the object to the mirror
	getDom: function(){
		if(this.config.apiToken == ""){
			this.getToken();
			this.config.apiToken = " ";
		}
		console.log(this);
		var wrapper = document.createElement("div");
		wrapper.innerHTML = this.config.text;
		return wrapper;
	},
});