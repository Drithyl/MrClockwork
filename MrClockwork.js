
//Dependencies
const Discord = require('discord.js');
const fs = require('fs');
const mail = require('mail.js');
const config = require("../MrClockwork/config.json");
const event = require("../MrClockwork/emitter.js");
const rw = require("../MrClockwork/reader_writer.js");
const dom4game = require("../MrClockwork/dom4game.js");
const coe4game = require("../MrClockwork/coe4game.js");
const timer = require("../MrClockwork/timer.js");
const trans = require("../MrClockwork/translator.js");
const dice = require("../MrClockwork/dice.js");
const tracker = require("../MrClockwork/tracker.js").init();
const dom5game = require("../MrClockwork/dom5game.js");			//to be initialized after loading the games data.
const dom4Host = require("../MrClockwork/dom4_hosting.js");	//to be initialized after loading the games data.
const dom5Host = require("../MrClockwork/dom5_hosting.js");	//to be initialized after loading the games data.
const coe4Host = require("../MrClockwork/coe4_hosting.js");	//to be initialized after loading the games data.

//The Bot
const bot = new Discord.Client();

Number.isFloat = function(n)
{
	return Number(n) === n && n % 1 !== 0;
}

String.prototype.capitalize = function()
{
	return this.charAt(0).toUpperCase() + this.slice(1);
}

String.prototype.width = function (space, spaceFirst = false, spacingChar = " ")
{
	var arrL = space - this.length + 1;

	if (arrL < 1)	arrL = 1;

	if (spaceFirst) return Array(arrL).join(spacingChar) + this;
	else 						return this + Array(arrL).join(spacingChar);
}

String.prototype.toBox = function()
{
	if (this !== "" && this != null && this.length && /\S+/.test(this))
	{
		return "```" + this + "```";
	}

	else return this;
}

Number.prototype.cap = function(limit)
{
	if (this > limit)
	{
		return limit;
	}

	else return this;
}

Number.prototype.lowerCap = function(limit)
{
	if (this < limit)
	{
		return limit;
	}

	else return this;
}

var owner;
var myGuild;
var houndsRole;
var blitzerRole;

var games = {};
var maxGames = 25;

//Will switch to true when the on.ready event first triggers so that certain bits of code don't get re-executed when the bot reconnects and goes through on.ready again
var wasInitialized = false;
var didNotReconnect = false;

//Stuff starts to happen after the 'ready' event is sent, so code is put here. Kinda like a constructor or main function.
bot.on("ready", () =>
{
	rw.log("I am ready!");
	didNotReconnect = false;
	owner = bot.users.get(config.ownerID);
	myGuild = bot.guilds.get(config.myGuildID);

	if (owner == null)
	{
		rw.log("Something went wrong; cannot find the owner of the guild.");
		return;
	}

	if (myGuild == null)
	{
		rw.log("Something went wrong; cannot find myGuild.");
		return;
	}

	houndsRole = myGuild.roles.get(config.houndsID);

	if (houndsRole == null)
	{
		rw.log("Something went wrong; cannot find the Hounds role object in this guild.");
	}

	blitzerRole = myGuild.roles.get(config.blitzerID);

	if (blitzerRole == null)
	{
		rw.log("Something went wrong; cannot find the Blitzer role object in this guild.");
	}

	owner.send("I am ready!").catch((err) => {rw.log(err);});

	if (wasInitialized == false)
	{
		initialize();
	}
});

//On messages sent to channels
bot.on('message', message =>
{
	//Convert them all to uppercase to ignore capitals or lowercases
	var input = message.content;
	var username = message.author.username;
	var member = myGuild.members.get(message.author.id);

	if (message.author.bot === true)
	{
		return;
	}

	if (member == null)
	{
		rw.log("Could not find the GuildMember object of user " + username + ". His input was '" + input + "' in channel " + message.channel.name + ".");
	}

	//dice roller
	if (/^(\%|\?)[d0-9\+]+$/ig.test(input) === true)
	{
		var rollStr;

		try
		{
			rollStr = dice.processRolls(input);
			message.channel.send(rollStr);
		}

		catch (err)
		{
			rw.log("An error occurred when trying to roll " + input + ":\n\n\n" + err);
			message.channel.send("Ooops, something went wrong in the code here.").catch((err) => {rw.log(err);});
		}
	}

	else if (/\%GAMES/i.test(input))
	{
		var onlineGames = "";
		var offlineGames = "";

		if (message.channel.type != "dm")
		{
			message.reply("This command must be used through a Direct Message (DM) to me.");
			return;
		}

		for (var key in games)
		{
			if (games[key].instance == null)
			{
				offlineGames += games[key].printInfo();
			}

			else
			{
				onlineGames += games[key].printInfo();
			}
		}

		if (offlineGames === "" && onlineGames === "")
		{
			message.channel.send("There are no games hosted.").catch((err) => {rw.log(err);});
			return;
		}

		if (offlineGames === "")
		{
			message.channel.send("All currently saved games are **online**:\n" + onlineGames.toBox(), {split: {prepend: "```", append: "```"}});
			return;
		}

		if (onlineGames === "")
		{
			message.channel.send("All currently saved games are **offline**:\n" + offlineGames.toBox(), {split: {prepend: "```", append: "```"}});
			return;
		}

		//When both online and offline games contain stuff, it *has* to be done like this instead of
		//using the usual split message option, because those are async and it messes up the order in
		//which the game list appears
		if (onlineGames.length > 1900)
		{
			var l = Math.ceil(onlineGames.length / 1500);
			message.channel.send("The following games are **online**:\n").catch((err) => {rw.log(err);});

			for (var i = 0; i < l; i++)
			{
				var nextBreak = onlineGames.indexOf("\n", (i+1) * 1500);

				if (i == l - 1)
				{
					message.channel.send(onlineGames.slice(onlineGames.indexOf("\n", i * 1500)).toBox());
				}

				else message.channel.send(onlineGames.slice(i * 1500, nextBreak).toBox());
			}
		}

		else message.channel.send("The following games are **online**:\n" + offlineGames.toBox());

		if (offlineGames.length > 1900)
		{
			var l = Math.ceil(offlineGames.length / 1500);
			message.channel.send("\n\nThe following games are saved, but **currently offline**:\n").catch((err) => {rw.log(err);});

			for (var i = 0; i < l; i++)
			{
				var nextBreak = offlineGames.indexOf("\n", (i+1) * 1500);

				if (i == l - 1)
				{
					message.channel.send(offlineGames.slice(offlineGames.indexOf("\n", i * 1500)).toBox());
				}

				else message.channel.send(offlineGames.slice(i * 1500, nextBreak).toBox());
			}
		}

		else message.channel.send("\n\nThe following games are saved, but **currently offline**:\n" + offlineGames.toBox());
	}

	else if (/\%MODS DOM4/i.test(input))
	{
		var msg = "";
		var path = config.dom4DataPath + "mods";

		if (fs.existsSync(path) === false)
		{
			message.author.send("An error occurred. No mods directory was found on the server.").catch((err) => {rw.log(err);});
			return;
		}

		fs.readdir(path, "utf8", (err, files) =>
		{
			if (err)
			{
				rw.log("An error occurred while reading the mods directory:\n\n" + err);
				message.author.send("An error occurred while reading the mods directory.").catch((err) => {rw.log(err);});
				return;
			}

			message.author.send("Here are the mods available on the server:\n\n").catch((err) => {rw.log(err);});

			for (var i = 0; i < files.length; i++)
			{
				//Only check the files with the .2h extension
				if (files[i].slice(files[i].lastIndexOf(".")) == ".dm")
				{
					msg += (files[i]).width(24) + "\n";
				}
			}

			message.author.send(msg.toBox(), {split: {prepend: "```", append: "```"}});
		});
	}

	else if (/\%MODS DOM5/i.test(input))
	{
		var msg = "";
		var path = config.dom5DataPath + "mods";

		if (fs.existsSync(path) === false)
		{
			message.author.send("An error occurred. No mods directory was found on the server.").catch((err) => {rw.log(err);});
			return;
		}

		fs.readdir(path, "utf8", (err, files) =>
		{
			if (err)
			{
				rw.log("An error occurred while reading the mods directory:\n\n" + err);
				message.author.send("An error occurred while reading the mods directory.").catch((err) => {rw.log(err);});
				return;
			}

			message.author.send("Here are the mods available on the server:\n\n").catch((err) => {rw.log(err);});

			for (var i = 0; i < files.length; i++)
			{
				//Only check the files with the .2h extension
				if (files[i].slice(files[i].lastIndexOf(".")) == ".dm")
				{
					msg += (files[i]).width(24) + "\n";
				}
			}

			message.author.send(msg.toBox(), {split: {prepend: "```", append: "```"}});
		});
	}

	else if (/\%MAPS DOM4/i.test(input))
	{
		var msg = "";
		var provCount;
		var path = config.dom4DataPath + "maps";

		if (fs.existsSync(path) === false)
		{
			message.author.send("An error occurred. No maps directory was found on the server.").catch((err) => {rw.log(err);});
			return;
		}

		fs.readdir(path, "utf8", (err, files) =>
		{
			if (err)
			{
				rw.log("An error occurred while reading the maps directory:\n\n" + err);
				message.author.send("An error occurred while reading the maps directory.").catch((err) => {rw.log(err);});
				return;
			}

			message.author.send("Here are the maps available on the server:\n\n").catch((err) => {rw.log(err);});

			for (var i = 0; i < files.length; i++)
			{
				//Only check the files with the .2h extension
				if (files[i].slice(files[i].lastIndexOf(".")) == ".map")
				{
					provCount = trans.getProvinceCount(fs.readFileSync(config.dom4DataPath + "maps/" + files[i], "utf8"));
					msg += (files[i]).width(48) + "(" + provCount.land.toString().width(4) + " land + " + provCount.sea.toString().width(3) + " sea).\n";
				}
			}

			message.author.send(msg.toBox(), {split: {prepend: "```", append: "```"}});
		});
	}

	else if (/\%MAPS DOM5/i.test(input))
	{
		var msg = "";
		var provCount;
		var path = config.dom5DataPath + "maps";

		if (fs.existsSync(path) === false)
		{
			message.author.send("An error occurred. No maps directory was found on the server.").catch((err) => {rw.log(err);});
			return;
		}

		fs.readdir(path, "utf8", (err, files) =>
		{
			if (err)
			{
				rw.log("An error occurred while reading the maps directory:\n\n" + err);
				message.author.send("An error occurred while reading the maps directory.").catch((err) => {rw.log(err);});
				return;
			}

			message.author.send("Here are the maps available on the server:\n\n").catch((err) => {rw.log(err);});

			for (var i = 0; i < files.length; i++)
			{
				//Only check the files with the .2h extension
				if (files[i].slice(files[i].lastIndexOf(".")) == ".map")
				{
					provCount = trans.getProvinceCount(fs.readFileSync(config.dom5DataPath + "maps/" + files[i], "utf8"));
					msg += (files[i]).width(48) + "(" + provCount.land.toString().width(4) + " land + " + provCount.sea.toString().width(3) + " sea).\n";
				}
			}

			message.author.send(msg.toBox(), {split: {prepend: "```", append: "```"}});
		});
	}

	else if (/\%NATIONS DOM4/i.test(input))
	{
		var str = "";

		for (id in trans.dom4NationNumbersToNames)
		{
			str += (id + ": ").width(10) + trans.dom4NationNumbersToNames[id] + "\n";
		}

		message.author.send(str.toBox(), {split: {prepend: "```", append: "```"}});
	}

	else if (/\%NATIONS DOM5/i.test(input))
	{
		var str = "";

		for (id in trans.dom5NationNumbersToNames)
		{
			str += (id + ": ").width(10) + trans.dom5NationNumbersToNames[id] + "\n";
		}

		message.author.send(str.toBox(), {split: {prepend: "```", append: "```"}});
	}

	else if (/^\%REMOVE\s*(\w+)?\s*(\w+)?/i.test(input) && message.channel.type != "dm")
	{
		var command = input.replace(/%REMOVE/i, "").toLowerCase();
		var nation = command.replace(/(\w+)?\s*(\w+)?/, "$1");
		var gameKey;

		if (message.channel.name.includes("_game") === false)
		{
			gameKey = command.replace(/(\w+)?\s*(\w+)?/, "$2");
		}

		else gameKey = message.channel.name.replace("_game", "").toLowerCase();

		if (games[gameKey] == null)
		{
			message.reply("The game is not in my list of saved games. If it's a game with a channel, the channel name might not be matching. Otherwise, make sure you check your spelling. The game name should come at the end of the command, separated by a space.");
			return;
		}

		if (games[gameKey].game != "Dom5")
		{
			message.reply("Only Dominions 5 games support this function.");
			return;
		}

		if (checkPermissions(message.author.id, member, games[gameKey]) === false)
		{
			message.reply("Sorry, you do not have the permissions to do this. Only this game's organizer (" + games[gameKey].organizer + ") or Admins, Pretenders or GMs can do this.");
			return;
		}

		if (games[gameKey].wasStarted === true)
		{
			message.reply("You cannot remove a nation from a game when it has already started. Use this only for when players change nations in the lobby.");
			return;
		}

		message.reply(games[gameKey].removeNation(nation));
	}

	else if (/^\%TIMER$/i.test(input) && message.channel.type != "dm")
	{
		var gameKey = message.channel.name.replace("_game", "").toLowerCase();

		if (message.channel.name.includes("_game") === false)
		{
			gameKey = input.replace(/%TIMER\s*/i, "").replace(/\d*/g, "").trim().toLowerCase();
		}

		if (games[gameKey] == null)
		{
			message.reply("The game is not in my list of saved games. If it's a game with a channel, the channel name might not be matching. Otherwise, make sure you check your spelling.");
			return;
		}

		if (games[gameKey].game != "Dom4" && games[gameKey].game != "Dom5")
		{
			message.reply("Unfortunately, only Dominions 4 or 5 games have a timer available.");
			return;
		}

		rw.log(username + " requested to know the timer.");

		games[gameKey].getCurrentTimer(function(currTimer)
		{
			if (currTimer.turn === 0 || games[gameKey].wasStarted === false)
		  {
		    message.reply("The game has not started yet!");
		  }

			else if (games[gameKey].instance == null)
			{
				message.reply("The game's instance isn't online, so the timer isn't moving. " + "It is turn " + currTimer.turn + ", and there are " + currTimer.print() + " left for it to roll.");
			}

			else if (currTimer.isPaused === true)
			{
				message.reply("It is turn " + currTimer.turn + ", and the timer is paused.");
			}

			else if (currTimer.getTotalSeconds() > 0)
			{
				message.reply("It is turn " + currTimer.turn + ", and there are " + currTimer.print() + " left for it to roll.");
			}

			else
			{
				message.reply("Unless something's wrong, one minute or less remains for the turn to roll. It might even be processing right now. The new turn announcement should come soon.");
			}
		});
	}

	else if (/\%TIMER\s*(\d+\w*\d*\w*\d*\w*\d*\w*)\s*(\w*)?/i.test(input) && message.channel.type != "dm")
	{
		var command = input.replace(/%TIMER/i, "").trim().toLowerCase();
		var newTimer = timer.createFromInput(command.replace(/(\d+\w*\d*\w*\d*\w*\d*\w*)\s*(\w*)?/, "$1"));
		var gameKey;

		if (message.channel.name.includes("_game") === false)
		{
			gameKey = command.replace(/(\d+\w*)\s*(\w*)?/, "$2");

			if (games[gameKey] == null)
			{
				message.reply("The game can't be found. Make sure you type the timer first and the game name last in the %timer command, like `timer 1d12h6m Humongous_Tragedy`.");
				return;
			}
		}

		else gameKey = message.channel.name.replace("_game", "").toLowerCase();

		if (games[gameKey] == null)
		{
			message.reply("The game can't be found. The channel name might be incorrect.");
			return;
		}

		if (games[gameKey].game != "Dom4" && games[gameKey].game != "Dom5")
		{
			message.reply("Only Dominions games have a timer.");
			return;
		}

		if (games[gameKey].instance == null)
		{
			message.reply("There is no instance of this game online. It might be in the process of a timer change if someone else used the command, in which case you'll need to wait a few seconds.");
			return;
		}

		if (checkPermissions(message.author.id, member, games[gameKey]) === false)
		{
			message.reply("Sorry, you do not have the permissions to do this. Only this game's organizer (" + games[gameKey].organizer + ") or Admins, Pretenders or GMs can do this.");
			return;
		}

		if (games[gameKey].instance == null)
		{
			message.reply("The game's instance isn't online, so the timer cannot be changed right now (it's not ticking down either). An organizer, GM, Pretender or Admin can fire up the game instance by using the command `%launch <gamename>` by pm.");
			return;
		}

		if (games[gameKey].wasStarted === false)
		{
			message.reply("The game hasn't been started yet.");
			return;
		}

		games[gameKey].changeCurrentTimer(newTimer);

		if (newTimer.isPaused == true)
		{
			rw.log(message.author.username + " paused the timer: " + input);
			message.reply(mentionRole(games[gameKey].role) + " The timer has been paused. This might take a few seconds to update ingame.");
		}

		else
		{
			rw.log(username + " requested a timer change: " + input);
			message.reply(mentionRole(games[gameKey].role) + " The timer has been changed. Now " + newTimer.print() + " remain for the new turn to arrive. This might take a few seconds to update ingame.");
		}
	}

	else if (/\%DTIMER\s*\w*\s*\d+\s*\w*/i.test(input) && message.channel.type != "dm")
	{
		var gameKey = message.channel.name.replace("_game", "").toLowerCase();
		var newTimer = timer.createFromInput(input.replace(/\%dtimer/i, ""));

		if (message.channel.name.includes("_game") === false)
		{
			gameKey = input.replace(/%DTIMER\s*/i, "").replace(/\d*/g, "").trim().toLowerCase();
		}

		if (games[gameKey] == null)
		{
			message.reply("The game is not in my list of saved games. If it's a game with a channel, the channel name might not be matching. Otherwise, make sure you check your spelling.");
			return;
		}

		if (games[gameKey].game != "Dom4" && games[gameKey].game != "Dom5")
		{
			message.reply("Unfortunately, only Dominions 4 or 5 games have a timer available.");
			return;
		}

		if (checkPermissions(message.author.id, member, games[gameKey]) === false)
		{
			message.reply("Sorry, you do not have the permissions to do this. Only this game's organizer (" + games[gameKey].organizer + ") or Admins, Pretenders or GMs can do this.");
			return;
		}

		if (games[gameKey].wasStarted === false)
		{
			message.reply("The game hasn't been started yet.");
			return;
		}

		games[gameKey].changeDefaultTimer(newTimer);

		if (newTimer.isPaused == true)
		{
			rw.log(message.author.username + " set the default timer to zero (unlimited turn times): " + input);
			message.reply(mentionRole(games[gameKey].role) + " The default timer has been paused.");
		}

		else
		{
			rw.log(username + " requested a default timer change: " + input);
			message.reply(mentionRole(games[gameKey].role) + " The default timer has been set to " + newTimer.print() + ".");
		}
	}

	else if (/^\%ADD ROLE/i.test(input) && message.channel.type != "dm")
	{
		var gameKey = message.channel.name.replace("_game", "").toLowerCase();
		var membersMap = message.mentions.members;
		var rolesMap = myGuild.roles;

		if (message.channel.name.includes("_game") === false)
		{
			var roles = input.replace(/%ADD ROLE/i, "").trim().toLowerCase();

			if (rolesMap.size <= 0)
			{
				message.reply("No role is available in the guild.");
				return;
			}

			for (var [k, v] of rolesMap)
			{
				if (roles.includes(v.name.toLowerCase()) === false)
				{
					continue;
				}

				//only works if the member's highest role is higher than the other roles he tries to give himself.
				if (v.name.toLowerCase().includes(" player") === true)
				{
					message.reply("Only the game's organizer or an Admin, Pretender or GM can give the role " + v.name + " to you.");
				}

				else if (member.highestRole.comparePositionTo(v) > 0)
				{
					member.addRole(v);
					message.reply("The role " + v.name + " was added.");
				}

				else
				{
					message.reply("You do not have permissions to add the role " + v.name + " to yourself. You can only add roles lower than yours.");
				}
			}

			return;
		}

		if (games[gameKey] == null)
		{
			message.reply("The game is not in my list of saved games. Are you sure this channel name is correct? (it should be the game name + '_game', like 'midnight_game' or 'total_expression_game').");
			return;
		}

		if (checkPermissions(message.author.id, member, games[gameKey]) === false)
		{
			message.reply("Sorry, you do not have the permissions to do this. Only this game's organizer (" + games[gameKey].organizer + ") or Admins, Pretenders or GMs can do this.");
			return;
		}

		if (games[gameKey].role == null)
		{
			message.reply("There doesn't seem to be a role created for this game yet. You can use the `%record mygamename` command PMed to me to create one automatically.");
			return;
		}

		if (membersMap.size <= 0)
		{
			message.reply("You did not mention any user. Use @ to mention a user to whom you want to give the role.");
			return;
		}

		for (var [k, v] of membersMap)
		{
			v.addRole(games[gameKey].role);
		}

		message.reply("The roles were added.");
	}

	else if (/^\%REMOVE ROLE/i.test(input) && message.channel.type != "dm")
	{
		var gameKey = message.channel.name.replace("_game", "").toLowerCase();
		var membersMap = message.mentions.members;
		var rolesMap = member.roles;

		if (message.channel.name.includes("_game") === false)
		{
			var roles = input.replace(/%REMOVE ROLE/i, "").trim().toLowerCase();

			if (rolesMap.size <= 0)
			{
				message.reply("You do not have any role.");
				return;
			}

			for (var [k, v] of rolesMap)
			{
				if (roles.includes(v.name.toLowerCase()) === false)
				{
					continue;
				}


				member.removeRole(v);
				message.reply("The role " + v.name + " was removed.");
			}

			return;
		}

		if (games[gameKey] == null)
		{
			message.reply("The game is not in my list of saved games. Are you sure this channel name is correct? (it should be the game name + '_game', like 'midnight_game' or 'total_expression_game').");
			return;
		}

		if (checkPermissions(message.author.id, member, games[gameKey]) === false)
		{
			message.reply("Sorry, you do not have the permissions to do this. Only this game's organizer (" + games[gameKey].organizer + ") or Admins, Pretenders or GMs can do this.");
			return;
		}

		if (games[gameKey].role == null)
		{
			message.reply("There doesn't seem to be a role created for this game yet. You can use the `%record mygamename` command PMed to me to create one automatically.");
			return;
		}

		if (membersMap.size <= 0)
		{
			message.reply("You did not mention any user. Use @ to mention a user from whom you want to remove the role.");
			return;
		}

		for (var [k, v] of membersMap)
		{
			v.removeRole(games[gameKey].role);
		}

		message.reply("The roles were removed.");
	}

	else if (/^\%START/i.test(input))
	{
		var gameKey = input.replace(/\%start/i, "").trim().toLowerCase();

		if (games[gameKey] == null)
		{
			message.reply("The game is not in my list of saved games. Are you sure the game name is correct? (you can check the current saved games with `%games`).");
			return;
		}

		if (games[gameKey].game != "Dom4" && games[gameKey].game != "Dom5")
		{
			message.reply("Unfortunately, only Dominions 4 or 5 games can be started remotely.");
			return;
		}

		if (checkPermissions(message.author.id, member, games[gameKey]) === false)
		{
			message.reply("Sorry, you do not have the permissions to do this. Only this game's organizer (" + games[gameKey].organizer + ") or Admins, Pretenders or GMs can do this.");
			return;
		}

		if (games[gameKey].currenttimer != null && games[gameKey].currenttimer.turn != 0)
		{
			message.reply("The game was already started, it's on turn " + games[gameKey].currenttimer.turn + ".");
			return;
		}

		games[gameKey].start();
		message.reply("The game will start in about a minute.");
		rw.log(message.author.username + " started " + games[gameKey].name + ".");
	}

	else if (/^\%DELETE/i.test(input))
	{
		var gameKey = input.replace(/\%delete/i, "").trim().toLowerCase();

		if (games[gameKey] == null)
		{
			message.reply("I do not have the game " + gameKey + " on my list. Please make sure you have written it correctly (letter case doesn't matter).");
			return;
		}

		if (checkPermissions(message.author.id, member, games[gameKey]) === false)
		{
			message.reply("Sorry, you do not have the permissions to do this. Only this game's organizer (" + games[gameKey].organizer + ") or Admins, Pretenders or GMs can do this.");
			return;
		}

		rw.log(username + " requested to delete " + gameKey + ".");
		games[gameKey].deleteSave();
		delete games[gameKey];
		message.channel.send("The game " + gameKey + " and its data files have been deleted (the dom/coe save files still remain).").catch((err) => {rw.log(err);});
	}

	else if (/^\%KILL/i.test(input))
	{
		var gameKey = input.replace(/\%kill/i, "").trim().toLowerCase();

		if (gameKey === "dom5" && member.roles.has(config.adminID) === true)
		{
			for (var key in games)
			{
				if (games[key].game != "Dom5" || games[key].instance == null)
				{
					continue;
				}

				games[key].kill();
			}

			message.reply("All Dominions 5 games have been killed.");
			return;
		}

		if (games[gameKey] == null)
		{
			message.reply("I do not have the game on my list. Please make sure you have written it correctly (letter case doesn't matter).");
			return;
		}

		if (games[gameKey].instance == null)
		{
			message.reply("There is no instance online to be killed. To launch a game's instance, use `%launch <game name>`.");
			return;
		}

		if (checkPermissions(message.author.id, member, games[gameKey]) === false)
		{
			message.reply("Sorry, you do not have the permissions to do this. Only this game's organizer (" + games[gameKey].organizer + ") or Admins, Pretenders or GMs can do this.");
			return;
		}

		rw.log(message.author.username + " requested to kill " + games[gameKey].name + ".");
		games[gameKey].kill();
		message.channel.send(games[gameKey].name + "'s process has been killed (the save files still remain).");
	}

	else if (/^\%LAUNCH/i.test(input))
	{
		var gameKey = input.replace(/\%launch/i, "").trim().toLowerCase();

		if (gameKey === "dom5" && member.roles.has(config.adminID) === true)
		{
			for (var key in games)
			{
				if (games[key].game != "Dom5" || games[key].instance != null)
				{
					continue;
				}

				games[key].host();
			}

			message.reply("All Dominions 5 games have been launched.");
			return;
		}

		if (games[gameKey] == null)
		{
			message.reply("I do not have the game on my list. Please make sure you have written it correctly (letter case doesn't matter).");
			return;
		}

		if (games[gameKey].instance != null)
		{
			message.reply("This game's instance is already online.");
			return;
		}

		if (checkPermissions(message.author.id, member, games[gameKey]) === false)
		{
			message.reply("Sorry, you do not have the permissions to do this. Only this game's organizer (" + games[gameKey].organizer + ") or Admins, Pretenders or GMs can do this.");
			return;
		}

		rw.log(message.author.username + " requested to launch " + games[gameKey].name + ".");
		games[gameKey].host();
		message.channel.send(games[gameKey].name + "'s process has been launched.");
	}

	else if (/^\%HOST\s*/i.test(input) && message.channel.type != "dm")
	{
		var arg = input.replace(/\%HOST\s*/i, "").trim().toLowerCase();

		if (member == null || member.highestRole.position < houndsRole.position)
		{
			message.reply("Sorry, you do not have enough permissions to host a game. Only those with the " + houndsRole.name + " can do this.");
			return;
		}

		if (gamesOnline() >= maxGames)
		{
			message.reply("Server capacity has been reached. You will have to wait until one other game finishes before hosting.");
			return;
		}

		if (arg.includes("blitz") === true)
		{
			message.reply(dom5Host.blitz(arg.replace("blitz", "").trim(), member));
			return;
		}

		if (dom4Host.instances[username] || dom5Host.instances[username] || coe4Host.instances[username])
		{
			message.reply("You are already in the middle of an Assisted Hosting Instance. Please finish that one first. If you wish to cancel it, just type '%cancel' directly via private message to me.");
			return;
		}

		if (arg === "dom4")
		{
			rw.log(username + " requested the Dom4 Assisted Hosting.");
			message.reply("command received! Look at your pms to start with the Dom4 Assisted Hosting System.");
			message.author.send(dom4Host.start(message.author));
		}

		else if (arg === "dom5")
		{
			rw.log(username + " requested the Dom5 Assisted Hosting.");
			message.reply("command received! Look at your pms to start with the Dom5 Assisted Hosting System.");
			message.author.send(dom5Host.start(message.author));
		}

		else if (arg === "coe4")
		{
			rw.log(username + " requested the CoE4 Assisted Hosting.");
			message.reply("command received! Look at your pms to start with the CoE4 Assisted Hosting System.");
			message.author.send(coe4Host.start(message.author));
		}

		else
		{
			message.reply("you need to specify whether you'd like to host a Dominions 4 or 5 game or a Conquest of Elysium 4 game. You can use `%host dom4` or `%host dom5` or `%host coe4`.");
		}
	}

	else if (message.channel.type == "dm")
	{
		if (/^\%TEST$/i.test(input))
		{
			rw.copyFileSync("C:/Users/Jacob/AppData/Roaming/coe4/saves/tmp_turn", "C:/Users/Jacob/AppData/Roaming/coe4/saves/tmp_turn_decoded");
		}

		else if (/^\%READY$/i.test(input))
		{
			if (member.roles.has(config.blitzerID))
			{
				member.removeRole(blitzerRole);
				message.reply("You are no longer ready to blitz. Role removed.");
			}

			else
			{
				member.addRole(blitzerRole);
				message.reply("You are now ready to blitz. Type `ready` again to remove this.");
			}
		}

		else if (/^\%REMINDERS\s+\w+$/i.test(input))
		{
			var gameKey = input.replace(/\%reminders/i, "").toLowerCase().trim();

			if (games[gameKey] == null)
			{
				message.reply("The game is not in my list of saved games. Type `%games` to see which games I have saved.");
				return;
			}

			if (games[gameKey].game != "Dom4" && games[gameKey].game != "Dom5")
			{
				message.reply("Unfortunately, only Dominions 4 or 5 games have a timer available.");
				return;
			}

			message.reply(games[gameKey].printReminders(message.author));
		}

		else if (/^\%REMINDER\s+\w+\s+\d+/i.test(input))
		{
			var gameKey = input.replace(/(\%reminder)|(\d)/gi, "").toLowerCase().trim();
			var hoursLeft = +input.replace(/\D/g, "");

			if (games[gameKey] == null)
			{
				message.reply("The game is not in my list of saved games. Type `%games` to see which games I have saved.");
				return;
			}

			if (games[gameKey].game != "Dom4" && games[gameKey].game != "Dom5")
			{
				message.reply("Unfortunately, only Dominions 4 or 5 games have a timer available.");
				return;
			}

			if (games[gameKey].tracked == false)
			{
				message.reply("You can only set reminders for games that are being tracked (i.e. those with a text channel and a Player role). You can see which are tracked when you use the command `%games`.");
				return;
			}

			if (isNaN(+hoursLeft) || Number.isInteger(+hoursLeft) == false)
			{
				message.reply("Reminders are set for when there are X hours left for a turn to roll. X must be an integer.");
				return;
			}

			message.reply(games[gameKey].addReminder(message.author, +hoursLeft));
		}

		else if (/^\%STOP\s*REMINDER\s*\w+/i.test(input))
		{
			var gameKey = input.replace(/(\%stop\s*reminder)|(\d)/gi, "").toLowerCase().trim();
			var hoursLeft = +input.replace(/\D/g, "") || 0;

			if (games[gameKey] == null)
			{
				message.reply("The game is not in my list of saved games. Type `%games` to see which games I have saved.");
				return;
			}

			if (games[gameKey].game != "Dom4" && games[gameKey].game != "Dom5")
			{
				message.reply("Unfortunately, only Dominions 4 or 5 games have a timer available.");
				return;
			}

			if (isNaN(hoursLeft) || Number.isInteger(hoursLeft) == false)
			{
				message.reply("Reminders are set for when there are X hours left for a turn to roll. X must be an integer.");
				return;
			}

			message.reply(games[gameKey].stopReminder(message.author, hoursLeft));
		}

		else if (/^\%TRACK/i.test(input))
		{
			var gameKey = input.replace(/\%track/i, "").trim().toLowerCase();

			if (games[gameKey] == null)
			{
				message.reply("The game does not exist. Please double-check the spelling (capitalization does not matter). You can also type `%games` to see a list of all games hosted.");
				return;
			}

			if (checkPermissions(message.author.id, member, games[gameKey]) === false)
			{
				message.reply("Sorry, you do not have the permissions to do this. Only this game's organizer (" + games[gameKey].organizer + ") or Admins, Pretenders or GMs can do this.");
				return;
			}

			if (games[gameKey].tracked === true)
			{
				message.reply("The game is already being tracked. If there is no channel or role for it, someone must have deleted it (check the audit log).");
				return;
			}

			message.author.send(games[gameKey].track());
		}

		else if (/^\%RECORD/i.test(input))
		{
			var gameKey = input.replace(/\%record/i, "").trim().toLowerCase();

			if (games[gameKey] == null)
			{
				message.reply("The game does not exist. Please double-check the spelling (capitalization does not matter). You can also type `%games` to see a list of all games hosted.");
				return;
			}

			if (checkPermissions(message.author.id, member, games[gameKey]) === false)
			{
				message.reply("Sorry, you do not have the permissions to do this. Only this game's organizer (" + games[gameKey].organizer + ") or Admins, Pretenders or GMs can do this.");
				return;
			}

			if (games[gameKey].role != null && games[gameKey].channel != null)
			{
				message.reply("The game already has a role and channel assigned: " + games[gameKey].role.name + ". If untracked, you just need to use `%track " + games[gameKey].name + "` to track it.");
				return;
			}

			games[gameKey].record(message);
		}

		else if (/^\%UNTRACK/i.test(input))
		{
			var gameKey = input.replace(/\%untrack/i, "").trim().toLowerCase();

			if (games[gameKey] == null)
			{
				message.reply("The game does not exist. Please double-check the spelling (capitalization does not matter). You can also type `%games` to see a list of all games hosted.");
				return;
			}

			if (checkPermissions(message.author.id, member, games[gameKey]) === false)
			{
				message.reply("Sorry, you do not have the permissions to do this. Only this game's organizer (" + games[gameKey].organizer + ") or Admins, Pretenders or GMs can do this.");
				return;
			}

			if (games[gameKey].tracked == false)
			{
				message.reply("The game is already **un**tracked. If there is still a channel or role for it, you will need to delete them manually.");
				return;
			}

			games[gameKey].untrack();
			message.author.send("The game is now no longer tracked. Turn and timer announcements will stop, although you will have to delete the channel and player role manually if you so wish.").catch((err) => {rw.log(err);});
		}

		else if (dom4Host.instances[username] != null)
		{
			if (/^\%CANCEL$/i.test(input))
			{
				delete dom4Host.instances[username];
				message.reply("The Dom4 Assisted Hosting has been cancelled. You can start anew anytime by using the `%host dom4` command.");
				return;
			}

			else 	//this must be input for the assisted hosting, so validate it
			{
				message.author.send(dom4Host.validateInput(message.content, member));
			}
		}

		else if (dom5Host.instances[username] != null)
		{
			if (/^\%CANCEL$/i.test(input))
			{
				delete dom5Host.instances[username];
				message.reply("The Dom5 Assisted Hosting has been cancelled. You can start anew anytime by using the `%host dom5` command.");
				return;
			}

			else 	//this must be input for the assisted hosting, so validate it
			{
				message.author.send(dom5Host.validateInput(message.content, member));
			}
		}

		else if (coe4Host.instances[username] != null)
		{
			if (/^\%CANCEL$/i.test(input))
			{
				delete coe4Host.instances[username];
				message.reply("The CoE4 Assisted Hosting has been cancelled. You can start anew anytime by using the `%host coe4` command.");
				return;
			}

			else 	//this must be input for the assisted hosting, so validate it
			{
				message.author.send(coe4Host.validateInput(message.content, member));
			}
		}
	}
});

event.e.on("minute", () =>
{
	for (inst in games)
	{
		if (games[inst].game === "Dom4" || games[inst].game === "Dom5")
		{
			games[inst].statusCheck();
		}
	}
});

event.e.on("5 seconds", () =>
{
	for (inst in games)
	{
		if (games[inst].game === "CoE4")
		{
			games[inst].statusCheck();
		}
	}
});

event.e.on("hour", () =>
{
	//being backed up externally by Cobian
	//backup();

	for (var key in games)
	{
		if (games[key].game === "CoE4")
		{
			continue;
		}

		if (games[key].wasStarted === false && games[key].channel == null && games[key].role == null && games[key].currenttimer != null && games[key].currenttimer.turn === 0 && Date.now() - games[key].firstHosted > 3600000)
		{
			rw.log("More than an hour has passed and " + games[key].name + " has not started, neither does it have a channel. Cleaning it up.");
			games[key].deleteDomSave();
			games[key].deleteSave();
			delete games[key];
		}
	}
});

function gamesOnline()
{
	var total = 0;

	for (inst in games)
	{
		if (games[inst].instance != null)
		{
			total++;
		}
	}

	return total;
}

function checkPermissions(id, member, game)
{
	if (id === game.organizer.id || id === config.ownerID)
	{
		return true;
	}

	else if (member == null)
	{
		return false;
	}

	else if (member.roles.has(config.adminID) === true || member.roles.has(config.modID) === true || member.roles.has(config.gmID) === true)
	{
		return true;
	}

	else return false;
}

function mentionRole(role)
{
	if (role == null)
	{
		return "";
	}

	else return role;
}

function backup()
{
	for (inst in games)
	{
		rw.copyFile("games/" + games[inst].name + "/data.json", "backups/" + games[inst].name + "/data.json", function(err)
		{
			if (err)
			{
				rw.log("An error occurred when trying to backup " + inst + "'s data:\n\n" + err);
			}

			else rw.log(inst + " was backed up successfully.");
		});
	}
}

function initialize()
{
	var files;
	var subFiles;
	var path = "games";

	if (fs.existsSync(path) === false)
	{
		rw.log("An error occurred when initializing the games. No games directory was found. Could not complete initialization.");
		return;
	}

	files = fs.readdirSync(path, "utf8");

	if (files == null)
	{
		rw.log("An error occurred while reading the games directory.");
		return;
	}

	loadGame(files, function finalCb()
	{
		dom5game.init(games, myGuild);
		dom4Host.init(games, myGuild);
		dom5Host.init(games, myGuild);
		coe4Host.init(games, myGuild);
		wasInitialized = true;
	});
}

function loadGame(files, finalCb)
{
	var file;
	var subFiles;

	if (!files.length || files.length <= 0)
	{
		finalCb();
		return;
	}

	file = files.shift();

	if (fs.lstatSync("games/" + file).isDirectory() == false)
	{
		loadGame(files, finalCb);	//continue with next games
		return;
	}

	subFiles = fs.readdirSync("games/" + file, "utf8");

	if (subFiles == null)
	{
		rw.log("An error occurred while reading the directory of game " + file + ".");
		loadGame(files, finalCb);	//continue with next games
		return;
	}

	rw.readJSON("games/" + file + "/data.json", function callback(gameJSON)
	{
		if (gameJSON != null)
		{
			if (gameJSON.game === "Dom4")
			{
				games[gameJSON.name.toLowerCase()] = dom4game.revive(gameJSON);
			}

			else if (gameJSON.game === "Dom5")
			{
				games[gameJSON.name.toLowerCase()] = dom5game.revive(gameJSON);
			}

			else if (gameJSON.game === "CoE4")
			{
				games[gameJSON.name.toLowerCase()] = coe4game.revive(gameJSON);
			}

			else
			{
				rw.log("The type of game for " + gameJSON.name + " could not be determined. Unable to call the proper revive() function.");
				return;
			};

			if (games[gameJSON.name.toLowerCase()] != null)
			{
				var delay = 250 * (Object.keys(games).length || 0);
				setTimeout(games[gameJSON.name.toLowerCase()].host.bind(games[gameJSON.name.toLowerCase()]), delay);
		    rw.log(gameJSON.name + " data was loaded and revived, will be launched in " + delay + " milliseconds.");
			}
		}

		loadGame(files, finalCb);	//continue with next games
	},

	function reviver(key, value)	//this is a callback!
	{
		if (key === "defaulttimer" || key === "currenttimer")
		{
			return timer.revive(value);
		}

		else if (key === "guild")
		{
			return myGuild;
		}

		else if (key === "organizer" && value != null)
		{
			return myGuild.members.get(value);
		}

		else if (key === "channel" && value != null)
		{
			return myGuild.channels.get(value);
		}

		else if (key === "role" && value != null)
		{
			return myGuild.roles.get(value);
		}

		else return value;
	});
}

function reconnect (token)
{
	if (didNotReconnect == true)
	{
		bot.login(token);
		rw.log("Manual attempt to reconnect...");
	}
}

//Login to the server, always goes at the end of the document, don't ask me why
bot.login(config.token);


bot.on("disconnect", () =>
{
	didNotReconnect = true;
	rw.log("I have been disconnected!");
	setTimeout (reconnect.bind(null, config.token), reconnectInterval);

	if (owner)
	{
		owner.send("I have been disconnected!").catch((err) => {rw.log(err);});
	}
});

bot.on("reconnecting", () =>
{
	rw.log("Trying to reconnect...");

	if (owner)
	{
		//owner.send("Trying to reconnect...").catch((err) => {rw.log(err);});
	}
});

bot.on("debug", info =>
{
	//rw.log("DEBUG: " + info);
});

bot.on("warn", warning =>
{
	rw.log("WARN: " + warning);
});

bot.on("error", () =>
{
	rw.log("An error occurred. This is from the 'on.error' event.");

	if (owner)
	{
		owner.send("Something went wrong! I am dying D':").catch((err) => {rw.log(err);});
	}
});

//This simple piece of code catches those pesky unhelpful errors and gives you the line number that caused it!
process.on("unhandledRejection", err =>
{
  rw.log("Uncaught Promise Error: \n" + err.stack);

	if (owner)
	{
		owner.send("Uncaught Promise Error: \n" + err.stack);
	}
});
