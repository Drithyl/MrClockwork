

/**While it is possible to host CoE4 games with this,
***Illwinter has not given it the proper support yet,
***so ongoing multiplayer games are not viable and
***won't work properly.*****************************/


const fs = require('fs');
const trans = require("../MrClockwork/translator.js");
const timer = require("../MrClockwork/timer.js");
const rw = require("../MrClockwork/reader_writer.js");
const config = require("../MrClockwork/config.json");

module.exports =
{
  create: function(myGuild)
  {
    var obj =
    {
      name: "",
      game: "CoE4",
      turn: -1,
      season: 0,
      port: 6666,
      mapWidth: 0,
      mapHeight: 0,
      society: 0,
      clusteredStart: "off",
      commonCause: "on",
      graphs: "off",
      tracked: false,
      guild: myGuild,
      channel: null,
      role: null,
      organizer: null,
      instance: null,
      lastHosted: 0,
      turnDir: "",
      players: [],
      teams: [],
      currentPlayer: 0,
      turnToSave: false,
      modifiedDateToIgnore: false,
      turnDirToGet: false,

      "init": init,
      "printSettings": printSettings,
      "printInfo": printInfo,
      "settingsToExeArguments": settingsToExeArguments,
      "setPort": setPort,
      "host": host,
      "track": track,
      "createChannelAndRole": createChannelAndRole,
      "untrack": untrack,
      "kill": kill,
      "lastHostTime": lastHostTime,
      "statusCheck": statusCheck,
      "preStartCheck": preStartCheck,
      "start": start,
      "announceStart": announceStart,
      "announceTurn": announceTurn,
      "deleteSave": deleteSave,
      "getLogInfo": getLogInfo,
      "getTurnDir": getTurnDir,
      "save": save
    };

    return obj;
  },

  revive: function(JSONdata)
  {
    var game;

    if (JSONdata.guild == null)
    {
      rw.log("Something is wrong, there is no guild information in the JSON data received to revive the game:\n\n\n" + JSONdata);
      return null;
    }

    game = this.create(JSONdata.guild);
    Object.assign(game, JSONdata);
    return game;
  }
}

function init(organizer, games, t = this)
{
  t.organizer = organizer;
  setPort(games, t);
  host([], t);
  save(t);
}

function printSettings(t = this)
{
  var str = "";

  for (var setting in t)
  {
    var translated = trans.translateCoE4Setting(setting, t[setting]);

    if (typeof t[setting] === "function")
    {
      continue;
    }

    if (/\S+/.test(translated) == false)
    {
      continue;
    }

    str += translated + "\n";
  }

  return str;
}

function printInfo(t = this)
{
  var info = t.name.width(25) + ("Port: " + t.port).width(12) + ("Game: " + t.game).width(30) + ("Organizer: " + t.organizer.user.username + " ").width(24);

  if (t.turn === -1)
  {
     info += "Has not started.".width(30);
  }

  else
  {
    info += ("Turn " + t.turn + ".").width(30);
  }

  if (t.tracked)
  {
    info += "Tracked.".width(15);
  }

  else info += "Not tracked.".width(15);

  return info + "\n";
}

function settingsToExeArguments(t = this)
{
  var args = ["--window", "--nofade", "--server", "--port=" + t.port, "--gamelog=" + "games/" + t.name + "/status", "--rename"];

  if (t.clusterStart === "on")
  {
    args.push("--clusterstart");
  }

  else args.push("--noclusterstart");

  if (t.commonCause === "on")
  {
    args.push("--commoncause");
  }

  if (t.graphs === "on")
  {
    args.push("--graphs");
  }

  args.push("--mapw=" + t.mapWidth,
            "--maph=" + t.mapHeight,
            "--society=" + t.society);

  return args;
}

function setPort(games, t = this)
{
  var defPort = 7650;
  var usedPorts = [];

  for (var key in games)
  {
    usedPorts.push(games[key].port);
  }

  while (usedPorts.includes(defPort) === true)
  {
    defPort++;

    if (games[key].port == defPort)
    {
      defPort++;
    }
  }

  t.port = defPort;
}

function host(extraArgs = [], t = this)
{
  var spawn = require('child_process').spawn;
  var args;

  if (t.turn < 0)
  {
    args = settingsToExeArguments(t).concat(extraArgs);
    args.push("--newgame");
  }

  else
  {
    args = ["--loadgame=" + t.name, "--server", "--textonly", "--port=" + t.port];
    t.modifiedDateToIgnore = true;
    t.turnDirToGet = true;
  }

  args.push("-d");

  if (t.instance)
  {
    rw.log(t.name + " is already up and running.");
    return;
  }

	t.instance = spawn(config.coe4RootPath + "coe4.exe", args);

  //If the window is closed manually
	t.instance.on('close', (code, signal) =>
	{
    t.instance = null;
    rw.log("CoE4 game " + t.name + " terminated. Deleting its instance.");
	});
}

function track(t = this)
{
  t.tracked = true;
  var msg = "The game is now being tracked. ";

  if (t.channel == null)
  {
    for (var [k, v] of t.guild.channels)
    {
      if (v.name.toLowerCase() == t.name.toLowerCase() + "_game" && v.type === "text")
      {
        t.channel = v;
        msg += "Found an existing channel for this game, assigning it for its announcements: " + v.name + " (id " + v.id + "). ";
        rw.log("Assigned channel " + v.name + ": " + v.id);
        break;
      }
    }
  }

  if (t.role == null)
  {
    for (var [k, v] of t.guild.roles)
    {
      if (v.name.toLowerCase() == t.name.toLowerCase() + " Player" || v.name.toLowerCase() == t.name.toLowerCase() + " player")
      {
        t.role = v;
        msg += "Found an existing role for this game, assigning it for its announcements: " + v.name + " (id " + v.id + "). ";
        rw.log("Assigned role " + v.name + ": " + v.id);
        break;
      }
    }
  }

  if (t.channel == null)
  {
    msg += "No existing channel found to make announcements. Make sure you create it. You can use `%record " + t.name + "` to create both a channel and a role automatically. ";
  }

  if (t.role == null)
  {
    msg += "No existing role found to make mentions during the announcements. Make sure you create it. You can use `%record " + t.name + "` to create both a channel and a role automatically. ";
  }

  return msg;
}

function createChannelAndRole(t = this)
{
  t.guild.createRole ({name: t.name + " Player"}).then(role =>
	{
		role.setMentionable(true);
    t.role = role;

    t.guild.createChannel (t.name + "_game", "text").then(channel =>
  	{
      t.channel = channel;
      channel.overwritePermissions(t.organizer, {READ_MESSAGES: true, READ_MESSAGE_HISTORY: true, SEND_MESSAGES: true, MANAGE_MESSAGES: true, EMBED_LINKS: true, ATTACH_FILES: true});
      channel.overwritePermissions(config.modID, {READ_MESSAGES: true, READ_MESSAGE_HISTORY: true, SEND_MESSAGES: true, MANAGE_MESSAGES: true, EMBED_LINKS: true, ATTACH_FILES: true});
      channel.overwritePermissions(config.gmID, {READ_MESSAGES: true, READ_MESSAGE_HISTORY: true, SEND_MESSAGES: true, MANAGE_MESSAGES: true, EMBED_LINKS: true, ATTACH_FILES: true});
      channel.overwritePermissions(config.botRoleID, {READ_MESSAGES: true, READ_MESSAGE_HISTORY: true, SEND_MESSAGES: true, EMBED_LINKS: true, ATTACH_FILES: true});
      channel.overwritePermissions(role, {READ_MESSAGES: true, READ_MESSAGE_HISTORY: true, SEND_MESSAGES: true, EMBED_LINKS: true, ATTACH_FILES: true});
      channel.overwritePermissions(config.myGuildID, {SEND_MESSAGES: false, EMBED_LINKS: false, ATTACH_FILES: false});  //guild ID is equal to the @everyone role ID

    }).catch(error =>
  	{
  		rw.log("The channel for game " + t.name + " could not be created: " + error);
      role.delete();
      t.role = null;
  	});

	}).catch(error =>
	{
		rw.log("The player role for game " + t.name + " could not be created: " + error);
	});
}

function untrack(t = this)
{
  t.tracked = false;
  t.channel = null;
  t.role = null;
}

function kill(t = this)
{
  //Kill and relaunch the dom4 instance with the full default timer
	t.instance.kill("SIGKILL");
}

function lastHostTime(t = this)
{
	try
	{
		var stats = fs.statSync(t.turnDir);
		return stats.mtime.getTime();
	}

	catch (err)
	{
		rw.log("Either the game hasn't started or an error occurred while processing it:\n\n" + err);
		return -1;
	}
}

function statusCheck(t = this)
{
  if (t.tracked === true)
  {
    if (t.turnDirToGet === true)
    {
      //game hosted, catch save path in debug log
      getTurnDir(null, t);
    }

    if (t.turn < 0)
    {
      preStartCheck(t);
    }

    else if (t.lastHosted < lastHostTime(t))
    {
      t.lastHosted = lastHostTime(t);

      if (t.modifiedDateToIgnore === true)
      {
        console.log("Modification ignored.");
        t.modifiedDateToIgnore = false;
        return;
      }

      else
      {
        t.turnToSave = true;
        announceTurn(t);
      }
    }
  }

  save(t);
}

function preStartCheck(t = this)
{
  getLogInfo(function(info)
  {
    var parsedInfo = parseLogInfo(info);

    if (parsedInfo.turn === 0)
    {
      if (!t.players.length || t.players.length <= 0)
      {
        t.players = parsePlayers(info);
      }

      //game started, catch save path in debug log
      getTurnDir(function()
      {
        start(parsedInfo, t);

      }, t);
    }

  }, t);
}

function start(startInfo, t = this)
{
  t.turn = startInfo.turn;
  t.season = startInfo.season;
  //kill(t);
  //setTimeout(function()
  //{
    //host([], t);
    announceStart(t);
    t.lastHosted = lastHostTime(t);
  //}, 10000);
}

function announceStart(t = this)
{
  if (t.channel == null)
  {
    //rw.log("The channel for the game " + t.name + " could not be found. Impossible to announce changes.");
    return;
  }

  if (t.role == null)
  {
    //rw.log("The role for the game " + t.name + " could not be found.");
  }

  rw.log(t.name + ": game started! The turn directory is: " + t.turnDir);
  t.channel.send(t.role + " Game started! " + t.players[0].name + " (" + t.players[0].class + ") is now in control.");
}

function announceTurn(t = this)
{
  if (t.channel == null)
  {
    //rw.log("The channel for the game " + t.name + " could not be found. Impossible to announce changes.");
    return;
  }

  if (t.role == null)
  {
    //rw.log("The role for the game " + t.name + " could not be found.");
  }

  if (t.currentPlayer === t.players.length - 1)
  {
    t.turn++;
    t.season++;
    t.currentPlayer = 0;
    rw.log(t.name + ": new turn " + t.turn + "! " + t.players[0].name + " (" + t.players[0].class + ") is up.");
    t.channel.send(t.role + " A month has passed (" + t.turn + "). 'Tis " + trans.getSeason(t.season) + ". " + t.players[0].name + " (" + t.players[0].class + ") is now in control.");
  }

  else
  {
    t.currentPlayer++;
    rw.log(t.name + ": " + t.players[t.currentPlayer].name + " (" + t.players[t.currentPlayer].class + ") is up.");
    t.channel.send(t.role + " " + t.players[t.currentPlayer].name + " (" + t.players[t.currentPlayer].class + ") is now in control.");
  }
}

function deleteSave(cb, t = this)
{
  var files = fs.readdirSync("games/" + t.name, "utf8");
  
  kill(function()
  {
    for (var i = 0; i < files.length; i++)
    {
      fs.unlinkSync("games/" + t.name + "/" + files[i]);
    }

    fs.rmdirSync("games/" + t.name);
  }, t);
}

function getLogInfo(cb, t = this)
{
  fs.readFile("games/" + t.name + "/status", "utf8", (err, data) =>
  {
    if (err)
    {
      if (err.message.includes("ENOENT")) //Path not found error; file doesn't exist so game has not started
      {
        cb("", t);
        return;
      }

      else
      {
        rw.log("An error occurred when retrieving " + t.name + "'s turn info:\n\n" + err);
        return;
      }
    }

    cb(data);
  });
}

function getTurnDir(cb, t = this)
{
  fs.readFile("log.txt", "utf8", (err, data) =>
  {
    if (err)
    {
      rw.log("An error occurred when retrieving " + t.name + "'s turn path from the debug log:\n\n" + err);
      return;
    }

    if (data.lastIndexOf("putfile2:") == -1)
    {
      return;
    }

    var pathIndex = data.lastIndexOf("putfile2:") + 9;
    var path = data.slice(pathIndex, data.indexOf("\n", pathIndex)).trim();
    path = path.replace(/\\/g, "/");
    path = path.replace(/C\:\/Users\/\w+\//i, "C:/Users/" + config.pcUser + "/");
    t.turnDir = path;
    rw.copyFileSync(path, config.coe4DataPath + "saves/" + t.name);
    //t.teams = parseTeams(data, t);
    fs.unlinkSync("log.txt");
    console.log("Got new turn directory: " + path);
    t.turnDirToGet = false;

    if (cb != null)
    {
      cb();
    }
  });
}

function parseTeams(dLog, t = this)
{
  var teams = [];

  for (var i = 0; i < t.players.length; i++)
  {
    var changeTeamIndex = dLog.lastIndexOf("change team " + i + " ");

    if (changeTeamIndex != -1 && dLog.lastIndexOf("change team " + i + " -1") == -1)
    {
      var line = dLog.slice(changeTeamIndex, dLog.indexOf("\n", changeTeamIndex));
      var teamNumber = line.replace(/\s\d+\s/, "");
      teamNumber = +line.slice(0, line.indexOf("c-")).replace(/\D+/g, "");

      if (teams[teamNumber] == null)
      {
        teams[teamNumber] = [];
      }

      teams[teamNumber].push(i);
    }
  }

  console.log("teams: " + teams);
  return teams;
}

function save(t = this)
{
  //if directory with game name does not exist, create it.
  if (fs.existsSync("games/" + t.name) == false)
  {
    fs.mkdirSync("games/" + t.name);
  }

  rw.saveJSON("games/" + t.name + "/data.json", t);

  if (t.turnToSave === true)
  {
    rw.copyFile(t.turnDir, config.coe4DataPath + "saves/" + t.name, function(err)
    {
      if (err)
      {
        rw.log(t.name + ": something went wrong when trying to save turn data: " + err);
        return;
      }

      rw.log(t.name + ": new turn info saved successfully.");
      t.turnToSave = false;
    });
  }
}

function parsePlayers(info)
{
  var counter = 0;
  var players = [];

  while (info.indexOf("Player " + counter + ", Name ") !== -1)
  {
    var playerIndex = info.indexOf("Player " + counter + ", Name ");
    var line = info.slice(playerIndex, info.indexOf(", Army strength", playerIndex));

    if (line.slice(line.indexOf(","), line.indexOf(", Class")).includes("Human") === true)
    {
      var nameIndex = line.indexOf("Name ") + 5;
      var humanIndex = line.indexOf(", Human");
      var classIndex = line.indexOf("Class ", humanIndex) + 6;
      players.push({name: line.slice(nameIndex, humanIndex), class: line.slice(classIndex, line.indexOf(", Units", classIndex)), type: "human"});
    }

    else
    {
      var nameIndex = line.indexOf("Name ") + 5;
      var endNameIndex = line.indexOf(", ", nameIndex);
      var classIndex = line.indexOf(", Class ") + 8;
      players.push({name: line.slice(nameIndex, endNameIndex), class: line.slice(classIndex, line.indexOf(", Units", classIndex)), type: "AI"});
    }

    counter++;
  }

  console.log("Players parsed: ");
  console.log(players);
  return players;
}

function parseLogInfo(info)
{
  if (info == null || /\S+/.test(info) === false)
  {
    return {turn: -1, season: 0};
  }

  var newTurnIndex = info.lastIndexOf("turn: ");
  var newSeasonIndex = info.indexOf("season ", newTurnIndex);
  var newTurn = +(info.slice(newTurnIndex, newSeasonIndex).replace(/\D+/g, ""));
  var newSeason = +(info.slice(newSeasonIndex, info.indexOf("Player", newSeasonIndex)).replace(/\D+/g, ""));
  return {turn: newTurn, season: newSeason};
}
