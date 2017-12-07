

/**While it is possible to host CoE4 games with this,
***Illwinter has not given it the proper support yet,
***so ongoing multiplayer games are not viable and
***won't work properly.*****************************/



const fs = require('fs');
const rw = require("../MrClockwork/reader_writer.js");
const coe4game = require("../MrClockwork/coe4game.js");
const config = require("../MrClockwork/config.json");

module.exports =
{
  games: null,
  guild: null,
  instances: {},

  cues:
  [
    "**Game name:** must not contain spaces or special characters other than underscores.",
    "**Map width:** a number between 10 and 90.",
    "**Map height:** a number between 10 and 90.",
    "**Society:** 0 = Random, 1 = Dark Ages, 2 = Agricultural, 3 = Empire, 4 = Fallen Empire, 5 = Monarchy, 6 = Dawn of a New Empire.",
    "**Clustered starts:** 'on' or 'off'.",
    "**Common cause:** 'on' or 'off' (our default is on, prevents players from being eliminated by losing all their commanders or citadels as long as their allies are still in the game).",
    "**Graphs:** 'on' or 'off' (our default is off)."
  ],

  checks: [validateName, validateWidth, validateHeight, validateSociety, validateClusteredStarts, validateCommonCause, validateGraphs],

  init: function(games, guild)
  {
    this.games = games;
    this.guild = guild;
    return this;
  },

  start: function(userObj)
  {
    this.instances[userObj.username] = {user: userObj, cues: this.cues.slice(), checks: this.checks.slice(), game: coe4game.create(this.guild)};
    return "Welcome to the Assisted CoE4 Hosting System! You can cancel it anytime by simply typing '%cancel' here. I will be asking you for a number of settings to host your game:\n\n" + this.instances[userObj.username].cues.shift();
  },

  validateInput: function(input, member)
  {
    var checkAndFeed;
    var result;
    var username = member.user.username;

    if (this.instances[username] == null)
    {
      return "Something went wrong. Cannot find your Assisted Hosting instance. Please type `%cancel` and start again.";
    }

    checkAndFeed = this.instances[username].checks.shift();
    result = checkAndFeed(input, username);

    if (result === true)
		{
      rw.log("Input '" + input + "' from user " + username + " validated.");

			if (!this.instances[username].cues.length)
			{
				return this.launch(member);
			}

			else
			{
				return this.instances[username].cues.shift();
			}
		}

		else
    {
      rw.log("Input '" + input + "' from user " + username + " was not correct.");
      this.instances[username].checks.unshift(checkAndFeed);
      return result;
    }
  },

  launch: function(member)
  {
    var gameKey = this.instances[member.user.username].game.name.toLowerCase();
    this.games[gameKey] = this.instances[member.user.username].game;
    this.games[gameKey].init(member, this.games);
    delete this.instances[member.user.username];
    return "The game has been hosted on the server. You can connect to it at IP 89.38.150.76 and Port " + this.games[gameKey].port + ". You can find the settings below:\n\n" + this.games[gameKey].printSettings().toBox();
  }
}

function validateName(name, username)
{
	if (name == null)
	{
    rw.log("Something went wrong when receiving the name input for the game. It appears null.");
    return "Game name MUST be specified.";
  }

	if (name.length > 24)
	{
    rw.log("Game name " + name + " is too long. CoE 4 allows for a maximum of 24 characters.");
    return "Game name " + name + " is too long. CoE 4 allows for a maximum of 24 characters.";
  }

	if (/[ !@#$%^&*()+\-=\[\]{};':"\\|,.<>\/?]/.test(name) == true)
	{
    rw.log("The game name " + name + " contains invalid characters. Only letters, numbers and underscores are allowed.");
    return "The game name " + name + " contains invalid characters. Only letters, numbers and underscores are allowed.";
  }

	for (var inst in module.exports.games)
	{
		if (name.toLowerCase() == module.exports.games[inst].name.toLowerCase())
		{
      rw.log("The game name " + name + " is already used by a different game. Please choose one that's free.");
			return "The game name " + name + " is already used by a different game. Please choose one that's free.";
		}
	}

  module.exports.instances[username].game.name = name;
	return true;
}

function validateWidth(width, username)
{
  if (isNaN(+width) || Number.isInteger(+width) === false || +width < 10 || +width > 90)
  {
    rw.log("Input " + width + " is incorrect. Width must be between 10 and 90.");
    return "Input " + width + " is incorrect. Width must be between 10 and 90.";
  }

  module.exports.instances[username].game.mapWidth = width;
	return true;
}

function validateHeight(height, username)
{
  if (isNaN(+height) || Number.isInteger(+height) === false || +height < 10 || +height > 90)
  {
    rw.log("Input " + height + " is incorrect. Height must be between 10 and 90.");
    return "Input " + height + " is incorrect. Height must be between 10 and 90.";
  }

  module.exports.instances[username].game.mapHeight = height;
	return true;
}

function validateSociety(society, username)
{
  if (isNaN(+society) || Number.isInteger(+society) == false || +society < 0 || +society > 6)
  {
    rw.log("Input " + society + " is incorrect. Society must be one of the following: 0 = Random, 1 = Dark Ages, 2 = Agricultural, 3 = Empire, 4 = Fallen Empire, 5 = Monarchy, 6 = Dawn of a New Empire.");
    return "Input " + society + " is incorrect. Society must be one of the following: 0 = Random, 1 = Dark Ages, 2 = Agricultural, 3 = Empire, 4 = Fallen Empire, 5 = Monarchy, 6 = Dawn of a New Empire.";
  }

  module.exports.instances[username].game.society = society;
	return true;
}

function validateClusteredStarts(clustered, username)
{
  if (clustered.toLowerCase() === "on" || clustered.toLowerCase() === "off")
	{
    module.exports.instances[username].game.clusteredStart = clustered.toLowerCase();
		return true;
	}

	else
	{
    rw.log("Input " + clustered + " is incorrect. Clustered starts must be 'on' or 'off'.")
		return "Input " + clustered + " is incorrect. Clustered starts must be 'on' or 'off'.";
	}
}

function validateCommonCause(cause, username)
{
  if (cause.toLowerCase() === "on" || cause.toLowerCase() === "off")
	{
    module.exports.instances[username].game.commonCause = cause.toLowerCase();
		return true;
	}

	else
	{
    rw.log("Input " + cause + " is incorrect. Common cause must be 'on' or 'off'.")
		return "Input " + cause + " is incorrect. Common cause must be 'on' or 'off'.";
	}
}

function validateGraphs(graphs, username)
{
  if (graphs.toLowerCase() === "on" || graphs.toLowerCase() === "off")
	{
    module.exports.instances[username].game.graphs = graphs.toLowerCase();
		return true;
	}

	else
	{
    rw.log("Input " + graphs + " is incorrect. Graphs must be 'on' or 'off'.")
		return "Input " + graphs + " is incorrect. Graphs must be 'on' or 'off'.";
	}
}
