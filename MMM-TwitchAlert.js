Module.register('MMM-TwitchAlert',{
	// Setting module config
	defaults: {
		streamerData: [],
		loading: true,
	},

	// Get api token using the client info
	getNewToken: function(callback){
		console.log('MMM-TwitchAlert: Requesting new token from Twitch');
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
	validateOldToken: function(token){
		var xmlhttp = new XMLHttpRequest();
		let module = this;
		// Callback when it gets the api token
		xmlhttp.onreadystatechange = function(){
			if(xmlhttp.readyState === 4){
				if(xmlhttp.status == 200){// Authorized
					//good
					// console.log('Token Authorized');
					module.updateStreamersData(module);
					// module.updateDom();
				}else if(xmlhttp.status == 401){// Unauthorized
					// console.log('Token Unauthorized')
					module.getNewToken(module.updateStreamersData);
				}
			}
		}
		xmlhttp.open('GET', 'https://id.twitch.tv/oauth2/validate');
		xmlhttp.setRequestHeader('Authorization', 'OAuth ' + token);
		xmlhttp.send();
	},

	// Checks if a token is valid
	validateToken: function(token){
		var xmlhttp = new XMLHttpRequest();
		let module = this;
		// Callback when it gets the api token
		xmlhttp.onreadystatechange = function(){
			if(xmlhttp.readyState === 4){
				if(xmlhttp.status == 401){// Unauthorized
					module.getNewToken(null);
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
		module.config.streamerData = [];
		for(s in module.config.streamers){
			module.getStreamerData(module.config.streamers[s]);
		}
		setTimeout(()=>{module.config.loading = false, module.updateDom()},2500);
	},

	// Make an api call to get data about a streamer
	getStreamerData: function(streamer){
		// Making request & Callback when it gets the api responds
		var xmlhttp = new XMLHttpRequest();
		let module = this;
		xmlhttp.onreadystatechange = function(){
			if(xmlhttp.readyState === 4){
				if(xmlhttp.status == 401){// unauthorized

				}
				module.config.streamerData.push(JSON.parse(xmlhttp.response).data[0]);
			}
		}
		xmlhttp.open('GET', 'https://api.twitch.tv/helix/search/channels?query='+streamer.toLowerCase()+'&first=1');
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
				this.validateOldToken(this.config.apiToken);
			}
		}else if(notification === 'STORE_API_TOKEN_RES'){
			//respond if good
		}
	},

	getStyles: function(){
		return ["modules/MMM-TwitchAlert/public/MMM-TwitchAlert.css"];
	},
	
	// Starting module
	start: function(){
		Log.info('Starting module: '+this.name);

		// Setting default / extreme values
		if(!('live_only' in this.config)){
			this.config.live_only = true;
		}
		if(!('show_live_badge' in this.config)){
			this.config.show_live_badge = true;
		}

		if(!('show_streamer_image' in this.config)){
			this.config.show_streamer_image = true;
		}

		if(!('update_interval' in this.config)){
			this.config.update_interval = 5;
		}else{
			if(parseInt(this.config.update_interval) == null){
				this.config.update_interval = 5;
			}else if(parseInt(this.config.update_interval) < 1){
				this.config.update_interval = 1;
			}
		}
		if(!('alignment' in this.config)){
			this.config.alignment = 'left';
		}else{
			if(this.config.alignment.toLowerCase() != 'left' && this.config.alignment.toLowerCase() != 'right'){
				this.config.alignment = 'left';
			}else{
				this.config.alignment = this.config.alignment.toLowerCase();
			}
		}
		
		// Getting API token from backend
		this.sendSocketNotification('RETREIVE_API_TOKEN',null);

		// Setting Update Interval
		let module = this;
		setInterval(()=>{
			module.validateToken(module.config.apiToken);
			setTimeout(()=>{module.updateStreamersData(module);},2000);
		},module.config.update_interval*60000);
	},

	// Displaying the object to the mirror
	getDom: function(){
		var container = document.createElement('div');
		container.className = "mmm-twitchalert-container";

		// if still loading data
		if(this.config.loading){
			container.innerHTML = 'Loading...';
			return container;
		}

		// Create html objects for streamers
		for(n in this.config.streamerData){
			// Finding correct streamer
			let i = 0;
			for(search_i in this.config.streamerData){
				if(this.config.streamers[n].toLowerCase() === this.config.streamerData[search_i].broadcaster_login){
					i = search_i;
				}
			}
			const streamer = this.config.streamerData[i];
			
			if(!this.config.live_only || streamer.is_live){
				// Streamer object
				let li = document.createElement('li');
				li.className = 'mmm-twitchalert-li' + (this.config.alignment === 'right' ? ' mmm-twitchalert-right-align' : '');
				container.appendChild(li);
				
				// Add image div for case a: streamer is live and we need live badge AND / OR need streamer image
				if((streamer.is_live && this.config.show_live_badge) || (streamer.is_live && this.config.show_streamer_image)) {
					var imgDiv = document.createElement('div');
					imgDiv.className = 'mmm-twitchalert-imgdiv';
					li.appendChild(imgDiv);
				}

				// Add image
				if(streamer.is_live && this.config.show_streamer_image){
					let img = document.createElement('img');
					img.src = streamer.thumbnail_url;
					if(!streamer.is_live && this.config.show_streamer_image){img.className='mmm-twitchalert-grayscale'}
					imgDiv.appendChild(img);
				}

				// Add live badge
				if(streamer.is_live && this.config.show_live_badge){
					let live = document.createElement('h3');
					live.innerHTML = 'LIVE';
					live.className = 'mmm-twitchalert-live';
					imgDiv.appendChild(live);
				}
	
				// Add text div
				let txtDiv = document.createElement('div');
				txtDiv.className = 'mmm-twitchalert-txtdiv';
				li.appendChild(txtDiv);
	
				// Add header
				let title = document.createElement('h3');
				title.innerHTML = streamer.display_name;
				txtDiv.appendChild(title);
	
				// Add game
				let game = document.createElement('p');
				if(streamer.is_live){
					game.innerHTML = 'Playing ' + streamer.game_name;
				}else{
					game.innerHTML = 'OFFLINE';
				}
				txtDiv.appendChild(game);
			}
		}

		return container;
	},
});
