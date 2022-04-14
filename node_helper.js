var NodeHelper = require("node_helper");
const fs = require('fs')

module.exports = NodeHelper.create({
    start(){
        console.log("Starting module helper: "+this.name);
    },

    // Talking to frontend js
    socketNotificationReceived(notification, payload) {
        // console.log(notification,payload)
        let path = process.cwd()+'/modules/MMM-TwitchAlert/API.txt';
		// Checking message type
		if (notification === 'STORE_API_TOKEN') {
            console.log('Storing token: ', payload);
            // Storing the API key in an unsafe way (I'll change this ~eventually~)
            let res = fs.writeFileSync(path, payload, err => {
                if (err) {
                    console.error(err)
                    return false;
                }
                return true;
            })
			// Sending message back to frontend
            this.sendSocketNotification('STORE_API_TOKEN_RES', res ? 'SUCCESS' : 'FAILURE');
		}else if (notification === 'RETREIVE_API_TOKEN') {
            let res = 'FAILURE';
            if(!fs.existsSync(path)){
                res = 'DNE';
            }else{
                // Storing the API key in an unsafe way (I'll change this ~eventually~)
                try{
                    res = fs.readFileSync(path,{encoding:'utf8', flag:'r'});
                }catch(e){
                    console.log(this.name + ': Error reading file')
                }
            }
            console.log('Accessing token: ', res);
            this.sendSocketNotification("RETREIVE_API_TOKEN_RES", res);
		}
	},
});