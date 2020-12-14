# Responder Discord Bot
Responder allows for users to add custom responses to trigger phrases. !helpresp

## Setup Heroku
1. Create new application.
2. Go to deploy tab.
3. Connect git repo.
4. Deploy main branch.
5. Go to resources tab.
6. Click edit workder npm run start button. Turn on Toggle. Confirm.

## Setup Atlas
1. Create new cluster.
2. Click connect button. Add ip 0.0.0.0/0. Create user.
3. Create new database called RESPONDER.
4. Go to Settings tab in heroku. Add config vars `ATLASPASS` and `ATLASUSER`.

## Setup Bot
1. Go to [DiscordApps](discord.com/developers/applications)
2. Create new application.
3. Open application, copy client ID, click bot, copy token.
4. Go to Settings tab in heroku. Add config var `TOKEN`.
7. Go to `https://discord.com/oauth2/authorize?client_id=&scope=bot` with your client ID and add bot to your server.
