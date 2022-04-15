Module.register('MMM-TwitchAlert',{
	// Setting module config
	defaults: {
		streamerData: [],
		loading: true,
	},

	// Get api token using the client info
	getNewToken: function(callback){
		console.log('Requesting new token from Twitch');
		var xmlhttp = new XMLHttpRequest();
		let module = this;
		// Callback when it gets the api token
		xmlhttp.onreadystatechange = function(){
			if (xmlhttp.readyState === 4) {
				module.setNewToken(this,callback);
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

	// Callback used to set module variable
	setNewToken: function(e,callback){
		this.config.apiToken = JSON.parse(e.response).access_token;
		this.sendSocketNotification('STORE_API_TOKEN',this.config.apiToken);
		if(typeof(callback) === 'function'){
			callback(this);
		}
	},

	// Checks if a token is valid
	validateToken: function(token){
		var xmlhttp = new XMLHttpRequest();
		let module = this;
		// Callback when it gets the api token
		xmlhttp.onreadystatechange = function(){
			if(xmlhttp.readyState === 4){
				if(xmlhttp.status == 200){// Authorized
					//good
					console.log('Token Authorized');
					module.updateStreamersData(module);
					// module.updateDom();
				}else if(xmlhttp.status == 401){// Unauthorized
					console.log('Token Unauthorized')
					module.getNewToken(module.updateStreamersData);
				}
			}
		}
		xmlhttp.open('GET', 'https://id.twitch.tv/oauth2/validate');
		xmlhttp.setRequestHeader('Authorization', 'OAuth ' + token);
		xmlhttp.send();
	},
	
	// Update the streamer
	updateStreamersData: function(module){
		// Get data for all streams
		for(s in module.config.streamers){
			module.getStreamerData(module.config.streamers[s]);
		}
		setTimeout(()=>{loading = false, module.updateDom()},3000);
	},

	// Make an api call to get data about a streamer
	getStreamerData: function(streamer){
		// Making request & Callback when it gets the api responds
		var xmlhttp = new XMLHttpRequest();
		let module = this;
		xmlhttp.onreadystatechange = function(){
			if(xmlhttp.readyState === 4){
				module.config.streamerData.push(JSON.parse(xmlhttp.response).data[0]);
			}
		}
		xmlhttp.open('GET', 'https://api.twitch.tv/helix/search/channels?query='+streamer+'&first=1');
		xmlhttp.setRequestHeader('Authorization', 'Bearer ' + this.config.apiToken);
		xmlhttp.setRequestHeader('Client-Id', this.config.client_id);
		xmlhttp.send();
	},
	
	// Process messages from backend
	socketNotificationReceived: function(notification, payload, sender){
		// Log.info(notification,payload);
		if(notification === 'RETREIVE_API_TOKEN_RES'){
			if(payload === 'DNE' || payload === 'FAILURE'){
				// make request to twitch api to get new token
				this.getNewToken(null);
			}else{
				this.config.apiToken = payload;
				this.validateToken(this.config.apiToken);
			}
		}else if(notification === 'STORE_API_TOKEN_RES'){
			//respond if good
		}
	},

	getStyles: function(){
		return ["MMM-TwitchAlert.css"];
	},
	
	// Starting module
	start: function(){
		Log.info('Starting module: '+this.name);
		// if(!'live_only' in this.config){this.config.live_only = true}
		// console.log('live_only' in this.config, this.config);
		this.sendSocketNotification('RETREIVE_API_TOKEN',null);
	},

	// Displaying the object to the mirror
	getDom: function(){
		var container = document.createElement('div');
		container.className = "mmm-twitchalert-container";

		// if still loading data
		if(this.loading){
			container.innerHTML = 'Loading...';
			return container;
		}

		// Create html objects for streamers
		for(i in this.config.streamerData){
			const streamer = this.config.streamerData[i];
			
			if(!this.config.live_only || streamer.is_live){
				// Streamer object
				let li = document.createElement('li');
				li.className = "mmm-twitchalert-li";
				container.appendChild(li);
				
				// Add image
				let img = document.createElement('img');
				img.src = streamer.thumbnail_url;
				if(!streamer.is_live){img.className='mmm-twitchalert-grayscale'}
				li.appendChild(img);
	
				// Add text div
				let txtDiv = document.createElement('div');
				li.appendChild(txtDiv);
	
				// Add header
				let title = document.createElement('h3');
				title.innerHTML = streamer.display_name;
				txtDiv.appendChild(title);
	
				// Add game
				let game = document.createElement('p');
				game.innerHTML = 'Playing ' + streamer.game_name;
				txtDiv.appendChild(game);
			}
		}

		return container;
	},
});