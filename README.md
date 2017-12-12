# MrClockwork
The bot that is used in the Discord group Clockwork Hounds to host and support Dominions 4 and 5 games (and hopefully Conquest of Elysium 4 games soon).

"games" and "backups" are the folders where the bot stores the information of saved games and their backups. To be clear, this is not the Dominions of CoE save files, just json data of the timers, turns, settings, etc.

All .js files are the actual working code. The entry point is MrClockwork.js. It's all kicked off specifically at the "ready" event trigger, where things are initialized and stored games are revived through several callbacks.

"ecosystem.config.js" and "MrHound - pm2.bat" are files used specifically for integrating the bot in pm2, so not strictly necessary to run the bot.

The token that the bot uses to log in to Discord has been hidden. The variable can be found in the config.json code file, along with the data paths that the bot uses. These would have to be modified to the proper ones for the bot to work.

DIRECTORY STRUCTURE

Node.js has to be installed one directory upwards from where all the files sit. This can of course be changed by altering the path of all the 'require' statements in each of the .js files. The root path of those statements is the MrClockwork.js file.

KNOWN BUGS:

Game servers hosted in textonly mode get stuck every so often, requiring to be killed and launched again to work. Clients can connect to them, so it isn't a crash, but they get stuck in "Waiting for game info" systematically. This is likely a Dominions-related bug.
