# MMM-TwitchAlert
![Node Badge](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white) ![Node Badge](https://img.shields.io/badge/Twitch-9146FF?style=for-the-badge&logo=twitch&logoColor=white)

### Screenshot
Will be provided once development is complete

### Prerequisites
This modules uses the free Twitch API. You will need to do some additional steps before the module runs.\
Don't worry, this is easy and well documented if you have troubles!

### Installation
1. `cd modules` from your MagicMirror folder
2. `git clone https://github.com/WilliamFitzjohn/MMM-TwitchAlert.git`
3. `cd MMM-TwitchAlert`
4. `npm i` to install the module

### API Key
1. Navigate to https://dev.twitch.tv/login and login using your twitch account.
2. Go into your account settings and enable 2FA. It is required to get your API key.
3. Go to https://dev.twitch.tv/console and click `Register Your Application` under the Applications tab <br> <img src="public/imgs/readme_register_application.png" alt="Registering An Application" width="450"/>
    1. Set `Name` to something like `MagicMirror`
    2. Set `OAuth Redirect URLs` to `http://localhost`
    3. Set `Category` to `Application Integration`
    4. Click `Create`
4. Now open up your new application <br> <img src="public/imgs/readme_open_application.png" alt="Opening The Application Manager" width="450"/>
5. Click `New Secret` and copy the Client ID and Client Secret into the MagicMirror config <br> <img src="public/imgs/readme_get_keys.png" alt="Getting The API Keys" width="450"/>

### Config
Add this to your MagicMirror config file
```json
{
    module: "MMM-TwitchAlert",
    position: "bottom_left",
    config: {
        client_id: "INSERT_CLIENT_ID_HERE",
        client_secret: "INSERT_CLIENT_SECRET_HERE",
        streamers: [
            "papashlomo",
        ],
    },
},
```

### Config Arguments
Argument | Type | Description | Required | Default Value
-|-|-|-|-
client_id | string | Client ID of your application in the Twitch API | Yes | N/A
client_secret | string | Client Secret of your application in the Twitch API | Yes | N/A
streamers | string[] | List of streamers you wish to track | Yes | N/A
