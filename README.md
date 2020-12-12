# Responder Discord Bot
Responder allows for users to add custom responses to trigger phrases.

## Setup
1. Go to [DiscordApps](discord.com/developers/applications)
2. Create new application.
3. Open application, copy client ID, click bot, copy token.
4. In your Responder folder, create a .env file with this line: `TOKEN=` and add your token.
5. `npm install`
6. `node index.js`
7. Go to `https://discord.com/oauth2/authorize?client_id=&scope=bot` with your client ID and add bot to your server.