
const fs = require('fs');
const rw = require("../MrClockwork/reader_writer.js");
const dom5game = require("../MrClockwork/dom5game.js");
const timer = require("../MrClockwork/timer.js");
const config = require("../MrClockwork/config.json");
const settings = require("../MrClockwork/dom5settings.json");
const dom5profiles = require("../MrClockwork/dom5profiles.json");
const trans = require("../MrClockwork/translator.js");

module.exports =
{
  games: null,
  guild: null,
  instances: {},

  checks:
  {
    name: validateName,
    mapfile: validateMapfile,
    mods: validateMods,
    era: validateEra,
    research: validateResearch,
    startingresearch: validateStartingResearch,
    hofsize: validateHoFSize,
    indepstr: validateIndepStr,
    magicsites: validateMagicSites,
    thrones: validateThrones,
    cataclysm: validateCataclysm,
    eventrarity: validateEventRarity,
    storyevents: validateStoryEvents,
    globalslots: validateGlobalSlots,
    scoregraphs: validateScoregraphs,
    masterpassword: validateMasterPassword,
    aiplayers: validateAIPlayers,
    defaulttimer: validateTimer
  },

  init: function(games, guild)
  {
    this.games = games;
    this.guild = guild;
    return this;
  },

  blitz: function(era, member)
  {
    if (/(1)|(ea)|(early)/i.test(era) === true)
    {
      era = 1;
    }

    else if (/(2)|(ma)|(middle)/i.test(era) === true)
    {
      era = 2;
    }

    else if (/(3)|(la)|(late)/i.test(era) === true)
    {
      era = 3;
    }

    else
    {
      return "You must specify a correct era along with the 'blitz' argument, like so: `%host blitz 2` or `%host blitz ma`.";
    }

    var data = Object.assign({}, dom5profiles);
    data.era = era;
    return this.testAndLaunch(data, member);
  },

  start: function(userObj)
  {
    var username = userObj.username;
    this.instances[username] = {user: userObj, keys: settings.keys.slice(), currKey: "", settingsPack: {}};
    this.instances[username].currKey = this.instances[username].keys.shift();
    return "Welcome to the Assisted Dom4 Hosting System! You can cancel it anytime by simply typing '%cancel' here. I will be asking you for a number of settings to host your game:\n\n" + settings.cues[this.instances[username].currKey];
  },

  validateInput: function(input, member)
  {
    var result;
    var username = member.user.username;
    var currKey = this.instances[username].currKey;

    if (this.instances[username] == null)
    {
      return "Something went wrong. Cannot find your Assisted Hosting instance. Please type `%cancel` and start again.";
    }

    result = this.checks[currKey](input, username);

    if (result.success === true)
		{
      rw.log("Input '" + input + "' from user " + username + " validated.");
      this.instances[username].settingsPack[currKey] = result.data;

			if (!this.instances[username].keys.length)
			{
				return this.launch(this.instances[username].settingsPack, member);
			}

			else
			{
        this.instances[username].currKey = this.instances[username].keys.shift();
        rw.log("Sending next cue: " + settings.cues[this.instances[username].currKey]);
				return settings.cues[this.instances[username].currKey];
			}
		}

		else
    {
      rw.log("Input '" + input + "' from user " + username + " was not correct.");
      return result.data;
    }
  },

  testAndLaunch: function(data, member)
  {
    var settingsPack = {};
    var username = member.user.username;
    var gameName = randomizeName();
    var nameCheck = this.checks.name(gameName, username);
    var counter = 0;

    while (nameCheck.success === false && counter <= 25)
    {
      counter++;
      gameName = randomizeName();
      nameCheck = this.checks.name(gameName, username);
    }

    if (counter > 25 || nameCheck.success === false)
    {
      return "Sorry, after trying 25 different name combinations, all are already taken or something else is wrong with the name (" + nameCheck.data + "). What the fuck is going on here?!";
    }

    else data.name = gameName;

    for (var key in data)
    {
      if (this.checks[key] == null)
      {
        return "One or more settings in this profile are invalid. This can only be resolved by the admin.";
      }

      result = this.checks[key](data[key], username);

      if (result.success === true)
      {
        settingsPack[key] = result.data;
      }

      else return result.data;
    }

    return this.launch(settingsPack, member);
  },

  launch: function(settingsPack, member)
  {
    var username = member.user.username;
    var game = dom5game.create(member, settingsPack);
    var gameKey = game.name.toLowerCase();
    dom5game.list[gameKey] = game;
    dom5game.list[gameKey].initGame();

    if (this.instances[username] != null)
    {
      delete this.instances[username];
    }

    return "The game has been hosted on the server. You can connect to it at IP 89.38.150.76 and Port " + this.games[gameKey].port + ". You can find the settings below:\n\n" + this.games[gameKey].printSettings().toBox();
  }
}

function validateName(name, username)
{
  var result = {success: false, data: name};

	if (name == null)
	{
    rw.log("Something went wrong when receiving the name input for the game. It appears null.");
    result.data = "Game name MUST be specified.";
    return result;
  }

	if (name.length > 24)
	{
    rw.log("Game name " + name + " is too long. Dominions 4 allows for a maximum of 24 characters.");
    result.data = "Game name " + name + " is too long. Dominions 4 allows for a maximum of 24 characters.";
    return result;
  }

	if (/[^0-9a-zA-Z_~/.test(name) == true)
	{
    rw.log("The game name " + name + " contains invalid characters. Only letters, numbers and underscores are allowed.");
    result.data = "The game name " + name + " contains invalid characters. Only letters, numbers and underscores are allowed.";
    return result;
  }

  if (name === "dom5")
  {
    rw.log("Game name 'dom5' is a reserved keyword.");
    result.data = "Game name 'dom5' is a reserved keyword, please choose a different one.";
    return result;
  }

  for (var inst in module.exports.games)
	{
		if (name.toLowerCase() == module.exports.games[inst].name.toLowerCase())
		{
      rw.log("The game name " + name + " is already used by a different game. Please choose one that's free.");
			result.data = "The game name " + name + " is already used by a different game. Please choose one that's free.";
      return result;
    }
	}

  result.success = true;
	return result;
}

function validateMapfile(mapfile, username)
{
  var result = {success: false, data: mapfile};

  //test if the input is "random" to generate a random map
  if (/random\s*\d+/.test(mapfile) === true)
  {
    var provNbr = +mapfile.replace(/\D+/g, "");
    if (provNbr != 10 && provNbr != 15 && provNbr != 20 && provNbr != 25)
    {
      rw.log("The province per player must be 10, 15, 20 or 25.");
      result.data = "The province per player must be 10, 15, 20 or 25.";
      return result;
    }

    result.success = true;
    result.data = mapfile.toLowerCase();
  	return result;
  }

  if (mapfile.includes(".map") == false)
  {
    rw.log("The file name " + mapfile + " does not contain the .map extension.");
	  result.data = "The file name " + mapfile + " does not contain the .map extension. Please make sure you include the .map extension.";
    return result;
  }

	if (fs.existsSync(config.dom5DataPath + "maps/" + mapfile) == false)
	{
    rw.log("The map file " + mapfile + " could not be found.");
	  result.data = "The map file " + mapfile + " could not be found. Please make sure you spelled it correctly (must include the .map extension) and that it exists on the server's dom4 data folder. You can check all existing maps by typing the command `%maps`.";
    return result;
  }

  result.success = true;
  result.data = mapfile.toLowerCase();
  return result;
}

function validateMods(mods, username)
{
  var result = {success: false, data: mods};
  var modList = mods.toLowerCase().split(",");
  var finalMods = [];

  if (/\.dm/.test(mods) == false)
  {
    if (mods == "none")
    {
      result.success = true;
      return result;
    }

    rw.log("The extension .dm must be included for every mod file specified");
    result.data = "The extension .dm must be included for every mod file specified; or simply type 'none' if you do not wish to use any mods.";
    return result;
  }

	for (var i = 0; i < modList.length; i++)
	{
    if (/\S+/.test(modList[i]) == false)
    {
      continue;
    }

    modList[i] = modList[i].trim();

		if (fs.existsSync(config.dom5DataPath + "mods/" + modList[i]) == false)
		{
      rw.log("The mod file " + modList[i] + " could not be found.");
		  result.data = "The mod file " + modList[i] + " could not be found. Please make sure you spelled it correctly (must include the .dm extension).";
      return result;
    }

    finalMods.push(modList[i]);
	}

  result.success = true;
  result.data = finalMods;
  return result;
}

function validateEra(era, username)
{
  var result = {success: false, data: era};

  if (isNaN(+era) || Number.isInteger(+era) == false || +era < 1 || +era > 3)
  {
    rw.log("Input " + era + " is incorrect. Era must be 1 (Early Age), 2 (Middle Age) or 3 (Late Age).");
    result.data = "Input " + era + " is incorrect. Era must be 1 (Early Age), 2 (Middle Age) or 3 (Late Age).";
    return result
  }

  result.success = true;
  return result;
}

function validateResearch(research, username)
{
  var result = {success: false, data: research};

  if (isNaN(+research) || Number.isInteger(+research) == false || +research < 0 || +research > 4)
  {
    rw.log("Input " + research + " is incorrect. Research must be 0 (very easy), 1 (easy), 2 (normal), 3 (hard) or 4 (very hard).");
    result.data = "Input " + research + " is incorrect. Research must be 0 (very easy), 1 (easy), 2 (normal), 3 (hard) or 4 (very hard).";
    return result;
  }

  result.success = true;
  return result;
}

function validateStartingResearch(startingresearch, username)
{
  var result = {success: false, data: startingresearch.toLowerCase()};

	if (startingresearch.toLowerCase() === "random" || startingresearch.toLowerCase() === "spread")
	{
    result.success = true;
    return result;
	}

	else
	{
    rw.log("Input " + startingresearch + " is incorrect. Starting research must be 'random' or 'spread'.")
		result.data = "Input " + startingresearch + " is incorrect. Starting research must be 'random' or 'spread'.";
    return result;
	}
}

function validateHoFSize(hofsize, username)
{
  var result = {success: false, data: hofsize};

  if (isNaN(+hofsize) || Number.isInteger(+hofsize) == false || +hofsize < 5 || +hofsize > 20)
  {
    rw.log("Input " + hofsize + " is incorrect. Hall of Fame must be an integer between 5 and 20.");
    result.data = "Input " + hofsize + " is incorrect. Hall of Fame must be an integer between 5 and 20.";
    return result;
  }

  result.success = true;
  return result;
}

function validateIndepStr(indepstr, username)
{
  var result = {success: false, data: indepstr};

  if (isNaN(+indepstr) || Number.isInteger(+indepstr) == false || +indepstr < 0 || +indepstr > 9)
  {
    rw.log("Input " + indepstr + " is incorrect. Independents' Strength must be an integer between 5 and 15.");
    result.data = "Input " + indepstr + " is incorrect. Independents' Strength must be an integer between 5 and 15.";
    return result;
  }

  result.success = true;
  return result;
}

function validateMagicSites(magicsites, username)
{
  var result = {success: false, data: magicsites};

  if (isNaN(+magicsites) || Number.isInteger(+magicsites) == false || +magicsites < 0 || +magicsites > 75)
  {
    rw.log("Input " + magicsites + " is incorrect. Magic Sites must be an integer between 0 and 75.");
    result.data = "Input " + magicsites + " is incorrect. Magic Sites must be an integer between 0 and 75.";
    return result;
  }

  result.success = true;
  return result;
}

function validateThrones(thrones, username)
{
  var result = {success: false, data: thrones};
  var thronesList = thrones.replace(/\s/g, "").split(",");
  var thronesObj;

	if (thrones == "auto")
	{
    if (module.exports.instances[username].settingsPack.mapfile.includes(".map") == false)
    {
      rw.log("Auto-thrones cannot be used with random maps.");
      result.data = "You cannot use the 'auto' throne settings with a random map. Please specify the thrones separated by commas: level 1 thrones, level 2 thrones, level 3 thrones, required ascension points.";
      return result;
    }

    thronesObj = autocalcThrones(module.exports.instances[username].settingsPack.mapfile);

    if (thronesObj == null)
    {
      rw.log("An error occurred when auto-calculating thrones for this map. Is the mapfile correct?");
      result.data = "An error occurred when auto-calculating thrones for this map. Is the mapfile correct?";
      return result;
    }

    result.success = true;
    result.data = thronesObj;
    return result;
	}

  if (thronesList.length < 4)
  {
    rw.log("You must specify all settings, separated by commas: level 1 thrones, level 2 thrones, level 3 thrones, required ascension points.");
    result.data = "You must specify all settings, separated by commas: level 1 thrones, level 2 thrones, level 3 thrones, required ascension points.";
    return result;
  }

  for (var i = 0; i < thronesList.length; i++)
  {
    if (isNaN(+thronesList[i]) || Number.isInteger(+thronesList[i]) == false)
    {
      rw.log("Thrones and APs must be an integer.");
      result.data = "Thrones and APs must be an integer.";
      return result;
    }
  }

	thronesObj = {lvl1: +thronesList[0], lvl2: +thronesList[1], lvl3: +thronesList[2], ap: +thronesList[3]};

  if (thronesObj.lvl1 < 0 || thronesObj.lvl1 > 20)
  {
    rw.log("Level 1 thrones must be an integer between 0 and 20.");
    result.data = "Level 1 thrones must be an integer between 0 and 20.";
    return result;
  }

  if (thronesObj.lvl2 < 0 || thronesObj.lvl2 > 15)
  {
    rw.log("Level 2 thrones must be an integer between 0 and 10.");
    result.data = "Level 2 thrones must be an integer between 0 and 10.";
    return result;
  }

  if (thronesObj.lvl3 < 0 || thronesObj.lvl3 > 10)
  {
    rw.log("Level 3 thrones must be an integer between 0 and 5.");
    result.data = "Level 3 thrones must be an integer between 0 and 5.";
    return result;
  }

  if (thronesObj.lvl1 + (thronesObj.lvl2 * 2) + (thronesObj.lvl3 * 3) < thronesObj.ap)
  {
    rw.log("The total amount of throne points must be equal or higher than the Ascenscion Points required.");
    result.data = "The total amount of throne points must be equal or higher than the Ascenscion Points required.";
    return result;
  }

  result.success = true;
  result.data = thronesObj;
  return result;
}

function validateCataclysm(cataclysm, username)
{
  var result = {success: false, data: cataclysm.toLowerCase()};

  if ((isNaN(+cataclysm) || Number.isInteger(+cataclysm) == false) && cataclysm.toLowerCase() !== "off")
  {
    rw.log("Input " + cataclysm + " is incorrect. Cataclysm must be an integer, or 'off'.");
    result.data = "Input " + cataclysm + " is incorrect. Cataclysm must be an integer, or 'off'.";
    return result;
  }

  result.success = true;
  return result;
}

function validateEventRarity(eventrarity, username)
{
  var result = {success: false, data: eventrarity};

  if (isNaN(+eventrarity) || Number.isInteger(+eventrarity) == false || +eventrarity < 1 || +eventrarity > 2)
  {
    rw.log("Input " + eventrarity + " is incorrect. Event Rarity must be 1 (common) or 2 (rare).");
    result.data = "Input " + eventrarity + " is incorrect. Event Rarity must be 1 (common) or 2 (rare).";
    return result;
  }

  result.success = true;
  return result;
}

function validateStoryEvents(storyevents, username)
{
  var result = {success: false, data: storyevents.toLowerCase()};

	if (storyevents.toLowerCase() == "minor" || storyevents.toLowerCase() == "full" || storyevents.toLowerCase() == "off")
	{
    result.success = true;
    return result;
	}

	else
	{
    rw.log("Input " + storyevents + " is incorrect. Story events must be 'minor', 'full' or 'off'.")
		result.data = "Input " + storyevents + " is incorrect. Story events must be 'minor', 'full' or 'off'.";
    return result;
	}
}

function validateGlobalSlots(slots, username)
{
  var result = {success: false, data: slots};

  if (isNaN(+slots) || Number.isInteger(+slots) == false || +slots < 3 || +slots > 9)
  {
    rw.log("Input " + slots + " is incorrect. Global slots must be an integer between 3 and 9.");
    result.data = "Input " + slots + " is incorrect. Global slots must be an integer between 3 and 9.";
    return result;
  }

  result.success = true;
  return result;
}

function validateScoregraphs(scoregraphs, username)
{
  var result = {success: false, data: scoregraphs.toLowerCase()};

	if (scoregraphs.toLowerCase() == "on" || scoregraphs.toLowerCase() == "off" || scoregraphs.toLowerCase() == "disabled")
	{
    result.success = true;
    return result;
	}

	else
	{
    rw.log("Input " + scoregraphs + " is incorrect. Score graphs must be 'on', 'off', or 'disabled'.")
		result.data = "Input " + scoregraphs + " is incorrect. Score graphs must be 'on' or 'off' (this removes even the site and spell effects that provide graph info).";
    return result;
  }
}

function validateMasterPassword(masterpassword, username)
{
  var result = {success: false, data: masterpassword};

	if (masterpassword.length > 40)
	{
    rw.log("Password " + masterpassword + " is too long. Dominions 4 allows for a maximum of 40 characters.");
    result.data = "Password " + masterpassword + " is too long. Dominions 4 allows for a maximum of 40 characters.";
    return result;
  }

  if (/[ !@#$%^&*()+\-=\[\]{};':"\\|,.<>\/?]/.test(masterpassword) == true)
  {
    rw.log("The password " + masterpassword + " contains invalid characters. Only letters , numbers and underscores are allowed.");
    result.data = "The password " + masterpassword + " contains invalid characters. Only letters , numbers and underscores are allowed.";
    return result;
  }

  result.success = true;
  return result;
}

function validateAIPlayers(aiplayers, username)
{
  var obj = {};
  var list = aiplayers.split(",");
  var result = {success: false, data: aiplayers};

	if (aiplayers === "none")
  {
    result.success = true;
    return result;
  }

	for (var i = 0; i < list.length; i++)
	{
    var natNumber = +list[i].replace(/\D/g, "");
    var difficulty = list[i].replace(/\d/g, "").trim().toLowerCase();

    if (isNaN(natNumber) === true)
    {
      rw.log("Each nation must be specified by its in-game number. To see a list, type `%nations`.");
      result.data = "Each nation must be specified by its in-game number. To see a list, type `%nations`.";
      return result;
    }

    if (difficulty != "easy" && difficulty != "normal" && difficulty != "difficult" && difficulty != "mighty" && difficulty != "master" && difficulty != "impossible")
    {
      rw.log(difficulty + " is not a valid diffulty. The options are easy, normal, difficult, mighty, master, and impossible.");
      result.data = difficulty + " is not a valid diffulty. The options are easy, normal, difficult, mighty, master, and impossible.";
      return result;
    }

		if (module.exports.instances[username].settingsPack.era == 1 && (natNumber < 5 || natNumber > 22) && (natNumber < 24 || natNumber > 31) && (natNumber < 36 || natNumber > 40))
		{
			result.data = "You can only add nations for the selected era (Early Age). To see a list, type `%nations`.";
      return result;
    }

		if (module.exports.instances[username].settingsPack.era == 2 && (natNumber < 43 || natNumber > 68) && (natNumber < 73 || natNumber > 77))
		{
			result.data = "You can only add nations for the selected era (Middle Age). To see a list, type `%nations`.";
      return result;
    }

		if (module.exports.instances[username].settingsPack.era == 3 && (natNumber < 60 || natNumber > 81) && (natNumber < 91 || natNumber > 92))
		{
			result.data = "You can only add nations for the selected era (Late Age). To see a list, type `%nations`.";
      return result;
    }

    obj[natNumber] = difficulty;
  }

  result.success = true;
  result.data = obj;
  return result;
}

function validateTimer(input, username)
{
  var newTimer = timer.createFromInput(input);
  var result = {success: false, data: input};

  if (newTimer == null)
  {
    result.data = "The timer input is incorrect. Either use a single integer for a number of hours, or the following format: `1d12h`.";
    return result;
  }

  var result = {success: true, data: Object.assign({}, newTimer)};
  return result;
}

function randomizeName()
{
  return config.prefixes[Math.floor(Math.random() * config.prefixes.length)] + "_" + config.suffixes[Math.floor(Math.random() * config.suffixes.length)];
}

function autocalcThrones(mapfile)
{
  var provCount = trans.getProvinceCount(fs.readFileSync(config.dom5DataPath + "maps/" + mapfile, "utf8"));
  var obj = {};

  if (provCount == null)
  {
    rw.log("An error occurred when checking the province count to autocalc thrones for the map " + mapfile);
    return null;
  }

  obj.ap = Math.ceil(Math.log(provCount.total) * 1.3) + Math.floor(provCount.total / 75);
  obj.lvl1 = Math.ceil(obj.ap * 0.60);
  obj.lvl2 = Math.ceil(obj.ap * 0.35);
  obj.lvl3 = Math.ceil(obj.ap * 0.15);
  return obj;
}
