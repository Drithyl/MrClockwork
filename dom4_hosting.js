
const fs = require('fs');
const rw = require("../MrClockwork/reader_writer.js");
const dom4game = require("../MrClockwork/dom4game.js");
const timer = require("../MrClockwork/timer.js");
const config = require("../MrClockwork/config.json");

module.exports =
{
  games: null,
  guild: null,
  instances: {},

  cues:
  [
    "**Game name:** must not contain spaces or special characters other than underscores.",
    "**Map File:** must have the .map extension. Use `%maps dom4` to receive a list of the available ones.",
    "**Mods:** 'none' for no mods. Must have the .dm extension. Separate more than one mod with commas (,). Use `%mods dom4` to receive a list of the available ones.",
    "**Era:** 1 = Early Age, 2 = Middle Age, 3 = Late Age.",
    "**Research:** -1 = very easy, 0 = easy, 1 = normal, 2 = hard, 3 = very hard (our default is normal).",
    "**Hall of Fame Size:** any integer between 5 and 15 (our default is 15).",
    "**Independents' Strength:** any integer between 0 and 9 (our default is 5).",
    "**Magic Sites:** any integer between 0 and 75 (our default is 50).",
    "**Thrones:** level 1, level 2, and level 3 thrones, and the required ascension points. Separate each number with a comma (,). You can type 'auto' if you would like me to set them relative to the province count.",
    "**Event Rarity:** 1 = common, 2 = rare (our default is common).",
    "**Story Events:** 'on' or 'off' (our default is off).",
    "**Scoregraphs:** 'on', 'off', or 'disabled' (will remove any information on other nations, even through sites) (our default is off).",
    "**Master password:** must not contain spaces or special characters other than underscores.",
    "**AI nations:** 'none' for no AI. Separate each nation with a comma (,). The format is the following: 'nation number' 'difficulty', 'nation number' 'difficulty', etc. The difficulties are easy, normal, difficult, mighty, master, and impossible. Type `%nations dom4` to get the list of nations and their codes. An example would be: `82 impossible, 50 master, 45 difficult`.",
    "**Turn timer:** Use the following format: 1d12h30m, where d are the days, h the hours and m the minutes. If you type only an integer, like '32', it will be interpreted as hours."
  ],

  checks:
  [
    validateName, validateMap, validateMods, validateEra, validateResearch, validatehofsize,
    validateIndepStr, validateMagicSites, validateThrones, validateEventRarity, validateStoryEvents,
    validateScoreGraphs, validateMasterPassword, validateaiplayers, validateTimer
  ],

  init: function(games, guild)
  {
    this.games = games;
    this.guild = guild;
    return this;
  },

  start: function(userObj)
  {
    this.instances[userObj.username] = {user: userObj, cues: this.cues.slice(), checks: this.checks.slice(), game: dom4game.create(this.guild)};
    return "Welcome to the Assisted Dom4 Hosting System! You can cancel it anytime by simply typing '%cancel' here. I will be asking you for a number of settings to host your game:\n\n" + this.instances[userObj.username].cues.shift();
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
    rw.log("Game name " + name + " is too long. Dominions 4 allows for a maximum of 24 characters.");
    return "Game name " + name + " is too long. Dominions 4 allows for a maximum of 24 characters.";
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

function validateMap(mapfile, username)
{
	if (fs.existsSync(config.dom4DataPath + "maps/" + mapfile.toLowerCase()) == false || mapfile.includes(".map") == false)
	{
    rw.log("The map file " + mapfile + " could not be found.");
	  return "The map file " + mapfile + " could not be found. Please make sure you spelled it correctly (must include the .map extension) and that it exists on the server's dom4 data folder. You can check all existing maps by typing the command `%maps`.";
	}

  module.exports.instances[username].game.mapfile = mapfile.toLowerCase();
	return true;
}

function validateMods(mods, username)
{
  var modList = mods.toLowerCase().split(",");
  var finalMods = [];

  if (/\.dm/.test(mods) == false)
  {
    if (mods == "none")
    {
      module.exports.instances[username].game.mods = "none";
      return true;
    }

    rw.log("The extension .dm must be included for every mod file specified");
    return "The extension .dm must be included for every mod file specified; or simply type 'none' if you do not wish to use any mods.";
  }

	for (var i = 0; i < modList.length; i++)
	{
    if (/\S+/.test(modList[i]) == false)
    {
      continue;
    }

    modList[i] = modList[i].trim();

		if (fs.existsSync(config.dom4DataPath + "mods/" + modList[i]) == false)
		{
      rw.log("The mod file " + modList[i] + " could not be found.");
		  return "The mod file " + modList[i] + " could not be found. Please make sure you spelled it correctly (must include the .dm extension).";
		}

    finalMods.push(modList[i]);
	}

  module.exports.instances[username].game.mods = finalMods;
	return true;
}

function validateEra(era, username)
{
  if (isNaN(+era) || Number.isInteger(+era) == false || +era < 1 || +era > 3)
  {
    rw.log("Input " + era + " is incorrect. Era must be 1 (Early Age), 2 (Middle Age) or 3 (Late Age).");
    return "Input " + era + " is incorrect. Era must be 1 (Early Age), 2 (Middle Age) or 3 (Late Age).";
  }

  module.exports.instances[username].game.era = era;
	return true;
}

function validateResearch(research, username)
{
  if (isNaN(+research) || Number.isInteger(+research) == false || +research < -1 || +research > 3)
  {
    rw.log("Input " + research + " is incorrect. Research must be -1 (very easy), 0 (easy), 1 (normal), 2 (hard) or 3 (very hard).");
    return "Input " + research + " is incorrect. Research must be -1 (very easy), 0 (easy), 1 (normal), 2 (hard) or 3 (very hard).";
  }

  module.exports.instances[username].game.research = research;
	return true;
}

function validatehofsize(hofsize, username)
{
  if (isNaN(+hofsize) || Number.isInteger(+hofsize) == false || +hofsize < 5 || +hofsize > 15)
  {
    rw.log("Input " + hofsize + " is incorrect. Hall of Fame must be an integer between 5 and 15.");
    return "Input " + hofsize + " is incorrect. Hall of Fame must be an integer between 5 and 15.";
  }

  module.exports.instances[username].game.hofsize = hofsize;
	return true;
}

function validateIndepStr(indepstr, username)
{
  if (isNaN(+indepstr) || Number.isInteger(+indepstr) == false || +indepstr < 0 || +indepstr > 9)
  {
    rw.log("Input " + indepstr + " is incorrect. Independents' Strength must be an integer between 5 and 15.");
    return "Input " + indepstr + " is incorrect. Independents' Strength must be an integer between 5 and 15.";
  }

  module.exports.instances[username].game.indepstr = indepstr;
  return true;
}

function validateMagicSites(magicsites, username)
{
  if (isNaN(+magicsites) || Number.isInteger(+magicsites) == false || +magicsites < 0 || +magicsites > 75)
  {
    rw.log("Input " + magicsites + " is incorrect. Magic Sites must be an integer between 0 and 75.");
    return "Input " + magicsites + " is incorrect. Magic Sites must be an integer between 0 and 75.";
  }

  module.exports.instances[username].game.magicsites = magicsites;
  return true;
}

function validateEventRarity(eventrarity, username)
{
  if (isNaN(+eventrarity) || Number.isInteger(+eventrarity) == false || +eventrarity < 1 || +eventrarity > 2)
  {
    rw.log("Input " + eventrarity + " is incorrect. Event Rarity must be 1 (common) or 2 (rare).");
    return "Input " + eventrarity + " is incorrect. Event Rarity must be 1 (common) or 2 (rare).";
  }

  module.exports.instances[username].game.eventrarity = eventrarity;
  return true;
}

function validateThrones(thrones, username)
{
  var thronesList = thrones.replace(/\s/g, "").split(",");
  var obj;

	if (thrones == "auto")
	{
    module.exports.instances[username].game.autocalcThrones();
		return true;
	}

  if (thronesList.length < 4)
  {
    rw.log("You must specify all settings, separated by commas: level 1 thrones, level 2 thrones, level 3 thrones, required ascension points.");
    return "You must specify all settings, separated by commas: level 1 thrones, level 2 thrones, level 3 thrones, required ascension points.";
  }

  for (var i = 0; i < thronesList.length; i++)
  {
    if (isNaN(+thronesList[i]) || Number.isInteger(+thronesList[i]) == false)
    {
      rw.log("Thrones and APs must be an integer.");
      return "Thrones and APs must be an integer.";
    }
  }

	obj = {lvl1: +thronesList[0], lvl2: +thronesList[1], lvl3: +thronesList[2], ap: +thronesList[3]};

  if (obj.lvl1 < 0 || obj.lvl1 > 20)
  {
    rw.log("Level 1 thrones must be an integer between 0 and 20.");
    return "Level 1 thrones must be an integer between 0 and 20.";
  }

  if (obj.lvl2 < 0 || obj.lvl2 > 10)
  {
    rw.log("Level 2 thrones must be an integer between 0 and 10.");
    return "Level 2 thrones must be an integer between 0 and 10.";
  }

  if (obj.lvl3 < 0 || obj.lvl3 > 5)
  {
    rw.log("Level 3 thrones must be an integer between 0 and 5.");
    return "Level 3 thrones must be an integer between 0 and 5.";
  }

  if (obj.lvl1 + (obj.lvl2 * 2) + (obj.lvl3 * 3) < obj.ap)
  {
    rw.log("The total amount of throne points must be equal or higher than the Ascenscion Points required.");
    return "The total amount of throne points must be equal or higher than the Ascenscion Points required.";
  }

  module.exports.instances[username].game.thrones = Object.assign({}, obj);
  return true;
}

function validateStoryEvents(storyevents, username)
{
	if (storyevents.toLowerCase() == "on" || storyevents.toLowerCase() == "off")
	{
    module.exports.instances[username].game.storyevents = storyevents;
		return true;
	}

	else
	{
    rw.log("Input " + storyevents + " is incorrect. Story events must be 'on' or 'off'.")
		return "Input " + storyevents + " is incorrect. Story events must be 'on' or 'off'.";
	}
}

function validateScoreGraphs(scoregraphs, username)
{
	if (scoregraphs.toLowerCase() == "on" || scoregraphs.toLowerCase() == "off" || scoregraphs.toLowerCase() == "disabled")
	{
    module.exports.instances[username].game.scoregraphs = scoregraphs;
		return true;
	}

	else
	{
    rw.log("Input " + scoregraphs + " is incorrect. Score graphs must be 'on', 'off', or 'disabled'.")
		return "Input " + scoregraphs + " is incorrect. Score graphs must be 'on' or 'off' (this removes even the site and spell effects that provide graph info).";
	}
}

function validateMasterPassword(masterpassword, username)
{
	if (masterpassword.length > 40)
	{
    rw.log("Password " + masterpassword + " is too long. Dominions 4 allows for a maximum of 40 characters.");
    return "Password " + masterpassword + " is too long. Dominions 4 allows for a maximum of 40 characters.";
  }

  if (/[ !@#$%^&*()+\-=\[\]{};':"\\|,.<>\/?]/.test(masterpassword) == true)
  {
    rw.log("The password " + masterpassword + " contains invalid characters. Only letters , numbers and underscores are allowed.");
    return "The password " + masterpassword + " contains invalid characters. Only letters , numbers and underscores are allowed.";
  }

  module.exports.instances[username].game.masterpassword = masterpassword;
	return true;
}

function validateaiplayers(aiplayers, username)
{
  var obj = {};
  var list = aiplayers.split(",");

	if (aiplayers === "none")
  {
    return true;
  }

	for (var i = 0; i < list.length; i++)
	{
    var natNumber = list[i].replace(/\D/g, "");
    var difficulty = list[i].replace(/\d/g, "").trim().toLowerCase();

    if (isNaN(+natNumber))
    {
      rw.log("Each nation must be specified by its in-game number. To see a list, type `%nations`.");
      return "Each nation must be specified by its in-game number. To see a list, type `%nations`.";
    }

    if (difficulty != "easy" && difficulty != "normal" && difficulty != "difficult" && difficulty != "mighty" && difficulty != "master" && difficulty != "impossible")
    {
      rw.log(difficulty + " is not a valid diffulty. The options are easy, normal, difficult, mighty, master, and impossible.");
      return difficulty + " is not a valid diffulty. The options are easy, normal, difficult, mighty, master, and impossible.";
    }

		if (module.exports.instances[username].game.era == 1 && (natNumber < 5 || natNumber > 22) && (natNumber < 25 || natNumber > 31) && (natNumber < 83 || natNumber > 86) && natNumber != 95)
		{
			return "You can only add nations for the selected era (Early Age). To see a list, type `%nations`.";
		}

		if (module.exports.instances[username].game.era == 2 && (natNumber < 33 || natNumber > 56) && (natNumber < 57 || natNumber > 58) && (natNumber < 87 || natNumber > 90) && natNumber != 96)
		{
			return "You can only add nations for the selected era (Middle Age). To see a list, type `%nations`.";
		}

		if (module.exports.instances[username].game.era == 3 && (natNumber < 60 || natNumber > 81) && (natNumber < 91 || natNumber > 92))
		{
			return "You can only add nations for the selected era (Late Age). To see a list, type `%nations`.";
		}

    obj[natNumber] = difficulty;
  }

  module.exports.instances[username].game.aiplayers = Object.assign(obj);
	return true;
}

function validateTimer(input, username)
{
  var newTimer = timer.createFromInput(input);
  module.exports.instances[username].game.defaulttimer = Object.assign({}, newTimer);
  module.exports.instances[username].game.currenttimer = Object.assign({}, newTimer);
  return true;
}
