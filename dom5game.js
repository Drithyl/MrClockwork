
const fs = require('fs');
const mail = require('mail.js');
const trans = require("../MrClockwork/translator.js");
const timer = require("../MrClockwork/timer.js");
const rw = require("../MrClockwork/reader_writer.js");
const config = require("../MrClockwork/config.json");

module.exports =
{
  guild: null,
  list: null,

  init: function(games, guild)
  {
    this.list = games;
    this.guild = guild;
    return this;
  },

  create: function(member, settingsPack = {})
  {
    var game =
    {
      game: "Dom5",
      name: "",
      port: 6666,
      mapfile: "",
      mods: "none",
      era: 1,
      research: 1,
      startingresearch: "random",
      hofsize: 15,
      indepstr: 5,
      magicsites: 50,
      thrones: {lvl1: 3, lvl2: 2, lvl3: 1, ap: 5},
      cataclysm: "off",
      eventrarity: 1,
      storyevents: "minor",
      globalslots: 5,
      scoregraphs: "off",
      masterpassword: "",
      aiplayers: "none",
      defaulttimer: timer.create(),
      currenttimer: null,
      tracked: false,
      guild: this.guild,
      channel: null,
      role: null,
      organizer: member,
      instance: null,
      reminders: {},
      emails: [],
      runtime: 0,
      lastHosted: 0,
      firstHosted: Date.now(),
      wasStarted: false,

      "initGame": initGame,
      "printInfo": printInfo,
      "printSettings": printSettings,
      "settingsToExeArguments": settingsToExeArguments,
      "setPort": setPort,
      "start": start,
      "host": host,
      "track": track,
      "findChannel": findChannel,
      "findRole": findRole,
      "createChannel": createChannel,
      "record": record,
      "untrack": untrack,
      "kill": kill,
      "changeCurrentTimer": changeCurrentTimer,
      "changeDefaultTimer": changeDefaultTimer,
      "addReminder": addReminder,
      "stopReminder": stopReminder,
      "printReminders": printReminders,
      "sendReminders": sendReminders,
      "lastHostTime": lastHostTime,
      "sendTurnEmail": sendTurnEmail,
      "sendStales": sendStales,
      "statusCheck": statusCheck,
      "updateAndSave": updateAndSave,
      "updateTurnInfo": updateTurnInfo,
      "announceTurn": announceTurn,
      "announceNearTurn": announceNearTurn,
      "deleteSave": deleteSave,
      "deleteDomSave": deleteDomSave,
      "getTurnInfo": getTurnInfo,
      "getCurrentTimer": getCurrentTimer,
      "parseDump": parseDump,
      "save": save
    };

    Object.assign(game, settingsPack);
    return game;
  },

  revive: function(JSONData)
  {
    var game;

    if (JSONData.guild == null)
    {
      rw.log("Something is wrong, there is no guild information in the JSON data received to revive the game:\n\n\n" + JSONData);
      return null;
    }

    if (JSONData.organizer == null)
    {
      rw.log("Something is wrong, there is no organizer information in the JSON data received to revive the game:\n\n\n" + JSONData);
      return null;
    }

    game = this.create(JSONData.organizer, JSONData);

    if (game.currenttimer.turn > 0 && (game.wasStarted == null || game.wasStarted === false))
    {
      game.wasStarted = true;
    }

    else if (game.wasStarted == null || game.currenttimer.turn === 0)
    {
      game.wasStarted = false;
    }

    return game;
  }
}

function initGame(t = this)
{
  setPort(t);
  save(t);
  host(t.defaulttimer, [], t);
}

function printSettings(t = this)
{
  var str = "";

  for (var setting in t)
  {
    var translated = trans.translateDom5Setting(setting, t[setting]);

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
  var info = t.name.width(25) + ("Port: " + t.port + ".").width(13) + ("Game: " + t.game + ".").width(15);

  if (t.wasStarted === false)
  {
     info += "Has not started.".width(30);
  }

  else
  {
    if (t.currenttimer.isPaused === true)
    {
      info += (t.currenttimer.print() + ". ").width(30);
    }

    else info += (t.currenttimer.print() + " left. ").width(30);
  }

  if (t.tracked)
  {
    info += "Tracked.".width(15);
  }

  else info += "Not tracked.".width(15);

  info += "Organizer: " + t.organizer.user.username;

  return info + "\n";
}

function settingsToExeArguments(t = this)
{
  var args = [t.name, "--nosound", "--textonly", "--window", "--tcpserver", "--port", t.port, "--statuspage", "games/" + t.name + "/status", "--noclientstart", "--renaming", "--statusdump"];

  if (t.mapfile.includes(".map") == false)
  {
    args.push("--randmap", t.mapfile.replace(/\D+/g, ""), "--vwrap");
  }

  else args.push("--mapfile", t.mapfile);

  if (Array.isArray(t.mods) && t.mods.length)
  {
    for (var i = 0; i < t.mods.length; i++)
    {
      args.push("--enablemod", t.mods[i]);
    }
  }

  else args.push("--nomods");

  if (typeof t.aiplayers === "object")
  {
    for (var nation in t.aiplayers)
    {
      if (t.aiplayers[nation].toLowerCase() === "easy")
      {
        args.push("--easyai", nation);
      }

      else if (t.aiplayers[nation].toLowerCase() === "normal")
      {
        args.push("--normai", nation);
      }

      else if (t.aiplayers[nation].toLowerCase() === "difficult")
      {
        args.push("--diffai", nation);
      }

      else if (t.aiplayers[nation].toLowerCase() === "mighty")
      {
        args.push("--mightyai", nation);
      }

      else if (t.aiplayers[nation].toLowerCase() === "master")
      {
        args.push("--masterai", nation);
      }

      else if (t.aiplayers[nation].toLowerCase() === "impossible")
      {
        args.push("--impai", nation);
      }
    }
  }

  if (t.startingresearch === "spread")
  {
    args.push("--norandres");
  }

  if (t.scoregraphs == "on")
  {
    args.push("--scoregraphs");
  }

  else if (t.scoregraphs == "disabled")
  {
    args.push("--nonationinfo");
  }

  if (t.storyevents === "off")
  {
    args.push("--nostoryevents");
  }

  if (t.storyevents === "minor")
  {
    args.push("--storyevents");
  }

  else if (t.storyevents === "full")
  {
    args.push("--allstoryevents");
  }

  if (isNaN(t.cataclysm) === false)
  {
    args.push("--cataclysm", t.cataclysm);
  }


  args.push("--era", t.era,
            "--research", t.research,
            "--hofsize", t.hofsize,
            "--indepstr", t.indepstr,
            "--magicsites", t.magicsites,
            "--eventrarity", t.eventrarity,
            "--thrones", t.thrones.lvl1, t.thrones.lvl2, t.thrones.lvl3,
            "--requiredap", t.thrones.ap,
            "--globals", t.globalslots,
            "--masterpass", t.masterpassword);

  return args;
}

function setPort(t = this)
{
  var defPort = 6750;
  var usedPorts = [];

  for (var key in module.exports.list)
  {
    usedPorts.push(module.exports.list[key].port);
  }

  while (usedPorts.includes(defPort) === true)
  {
    defPort++;
  }

  t.port = defPort;
}

function start(t = this)
{
  rw.domcmd("settimeleft 60", t, function()
  {
    t.wasStarted = true;
    t.currenttimer = Object.assign({}, t.defaulttimer);
  });
}

/******HACK while the domcmd timer changes get fixed, hopefully*******/
function host(timer = this.currenttimer, extraArgs = [], t = this)
{
  var spawn = require('child_process').spawn;
  var args = settingsToExeArguments(t).concat(extraArgs);
  var path = config.dom5RootPath + "Dominions5.exe";

  if (fs.existsSync(path) === false)
  {
    rw.log("The Dominions5.exe path does not seem correct! Could not host game!");
    return;
  }

  if (t.currenttimer == null)
  {
    if (t.defaulttimer.isPaused === true)
    {
      //random number of hours, will get changed below anyway. This is for blitzes to work with timers
      args.push("--hours", 3);
    }

    else
    {
      args = args.concat(t.defaulttimer.toExeArguments());
    }
  }

  else if (t.currenttimer.isPaused === true)
  {
    //random number of hours, will get changed below anyway. This is for blitzes to work with timers
    args.push("--hours", 3);
  }

  else
  {
    args = args.concat(t.currenttimer.toExeArguments());
  }

  if (t.instance)
  {
    rw.log(t.name + " is already up and running.");
    return;
  }

	t.instance = spawn(path, args, {stdio: 'ignore'});

  if (t.wasStarted === true)
  {
    rw.log(t.name + ": Timer changed through hack: " + timer.print());
    changeCurrentTimer(timer, t);
  }

  /*t.instance.stdout.on('data', (data) =>
  {
    rw.log(`stdout: ${data}`);
  });

  t.instance.stderr.on('data', (data) =>
  {
    rw.log(`stderr: ${data}`);
  });*/

  //If the window is closed manually
	t.instance.on('close', (code, signal) =>
	{
    t.runtime = 0;
    t.instance = null;
    rw.log("Dom5 game " + t.name + " terminated. Deleting its instance.");
	});
}

/*function host(timer = this.currenttimer, extraArgs = [], t = this)
{
  var spawn = require('child_process').spawn;
  var timerArgs;
  var args;

  if (timer == null)
  {
    timerArgs = [];
  }

  else timerArgs = timer.toExeArguments();

  args = settingsToExeArguments(t).concat(timerArgs, extraArgs);

  if (t.instance)
  {
    rw.log(t.name + " is already up and running.");
    return;
  }

	t.instance = spawn(config.dom5RootPath + "Dominions5.exe", args);

  //If the window is closed manually
	t.instance.on('close', (code, signal) =>
	{
    t.runtime = 0;
    t.instance = null;
    rw.log("Dom5 game " + t.name + " terminated. Deleting its instance.");
	});
}*/

function track(t = this)
{
  t.tracked = true;
  var msg = "The game is now being tracked. ";

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

function record(message, t = this)
{
  findRole(t);
  findChannel(t);

  if (t.role == null)
  {
    t.guild.createRole({name: t.name + " Player"}).then(role =>
  	{
  		role.setMentionable(true);
      t.role = role;

      if (t.channel == null)
      {
        createChannel(message, t);
      }

      else message.reply("An existing Channel was found and assigned to this game.");

      message.reply("A new Role was created and assigned to this game.");

  	}).catch(error =>
  	{
  		rw.log("The player role for game " + t.name + " could not be created: " + error);
      message.reply("An error occurred and the Player Role for game " + t.name + " could not be created.");
  	});
  }

  else
  {
    message.reply("An existing Role was found and assigned to this game.");

    if (t.channel == null)
    {
      createChannel(message, t);
    }

    else message.reply("An existing Channel was found and assigned to this game.");
  }
}

function findRole(t = this)
{
  for (var [k, v] of t.guild.roles)
  {
    if (v.name.toLowerCase() == t.name.toLowerCase() + " player")
    {
      t.role = v;
      return true;
    }
  }
}

function findChannel(t = this)
{
  for (var [k, v] of t.guild.channels)
  {
    if (v.name.toLowerCase() == t.name.toLowerCase() + "_game")
    {
      t.channel = v;
    }
  }
}

function createChannel(message, t = this)
{
  t.guild.createChannel(t.name + "_game", "text").then(channel =>
  {
    t.channel = channel;
    channel.overwritePermissions(t.organizer, {READ_MESSAGES: true, READ_MESSAGE_HISTORY: true, SEND_MESSAGES: true, MANAGE_MESSAGES: true, EMBED_LINKS: true, ATTACH_FILES: true});
    channel.overwritePermissions(config.modID, {READ_MESSAGES: true, READ_MESSAGE_HISTORY: true, SEND_MESSAGES: true, MANAGE_MESSAGES: true, EMBED_LINKS: true, ATTACH_FILES: true});
    channel.overwritePermissions(config.gmID, {READ_MESSAGES: true, READ_MESSAGE_HISTORY: true, SEND_MESSAGES: true, MANAGE_MESSAGES: true, EMBED_LINKS: true, ATTACH_FILES: true});
    channel.overwritePermissions(config.botRoleID, {READ_MESSAGES: true, READ_MESSAGE_HISTORY: true, SEND_MESSAGES: true, EMBED_LINKS: true, ATTACH_FILES: true});
    channel.overwritePermissions(config.myGuildID, {SEND_MESSAGES: false, EMBED_LINKS: false, ATTACH_FILES: false});  //guild ID is equal to the @everyone role ID
    channel.overwritePermissions(t.role, {READ_MESSAGES: true, READ_MESSAGE_HISTORY: true, SEND_MESSAGES: true, EMBED_LINKS: true, ATTACH_FILES: true});
    message.reply("A new Channel was created and assigned to this game.");

  }).catch(error =>
  {
    rw.log("The channel for game " + t.name + " could not be created: " + error);
    message.reply("An error occurred and the Channel for game " + t.name + " could not be created.");
  });
}

function untrack(t = this)
{
  t.tracked = false;
}

function kill(cb = null, t = this)
{
  //Kill and relaunch the dom5 instance with the full default timer
  if (t.instance != null)
  {
    t.instance.kill("SIGKILL");

    if (cb != null)
    {
      setTimeout(triggerCallback , 600);
    }
  }

  else if (cb != null)
  {
    cb();
  }

  function triggerCallback()
  {
    if (t.instance == null)
    {
      cb();
    }

    else setTimeout(triggerCallback, 600);
  }
}

function changeCurrentTimer(timer, t = this)
{
  rw.domcmd("settimeleft " + timer.getTotalSeconds(), t, function()
  {
    t.currenttimer.days = timer.days;
    t.currenttimer.hours = timer.hours;
    t.currenttimer.minutes = timer.minutes;
    t.currenttimer.seconds = timer.seconds;
    t.currenttimer.isPaused = timer.isPaused;
  });
}

function changeDefaultTimer(timer, t = this)
{
  var data = "setinterval " + timer.getTotalMinutes() + "\nsettimeleft " + t.currenttimer.getTotalSeconds();

  rw.domcmd(data, t, function()
  {
    t.defaulttimer = Object.assign(timer);
  });
}

function addReminder(user, hoursLeft, t = this)
{
  var defaultHours = t.defaulttimer.getTotalHours();
  if (defaultHours <= hoursLeft)
  {
    return "The default timer for this game is of " + defaultHours + " hours. You cannot set a reminder at more or the same than that (since there are already new turn reminders for everyone).";
  }

  if (t.reminders[user.id] == null)
  {
    t.reminders[user.id] = [hoursLeft];
  }

  else
  {
    t.reminders[user.id].push(hoursLeft);
  }

  return "The reminder has been set. Every time there are " + hoursLeft + " hours left for a turn to roll, I will send you a DM.";
}

function stopReminder(user, hoursLeft = 0, t = this)
{
  if (t.reminders[user.id] == null)
  {
    return "You do not have any reminders set for this game.";
  }

  if (t.reminders[user.id].includes(hoursLeft) == -1)
  {
    return "You do not have any reminders set for this game set at " + hoursLeft + " hours left.";
  }

  if (hoursLeft == 0)
  {
    delete t.reminders[user.id];
    return "All your reminders for this game have been removed.";
  }

  t.reminders[user.id].splice(t.reminders[user.id].indexOf(hoursLeft), 1);
  return "The reminder at " + hoursLeft + " hours has been removed. Current reminders left:\n\n" + printReminders(user, t);
}

function printReminders(user, t = this)
{
  var str = "";

  if (t.reminders[user.id] == null)
  {
    return "You have no reminders set for this game.";
  }

  for (var i = 0; i < t.reminders[user.id].length; i++)
  {
    str += "At " + t.reminders[user.id][i] + " hours left.\n";
  }

  return str;
}

function sendReminders(hoursLeft, t = this)
{
  for (id in t.reminders)
  {
    var member = t.guild.members.get(id);

    if (t.reminders[id].includes(hoursLeft) === false)
    {
      continue;
    }

    if (member == null)
    {
      rw.log("Member " + id + " could not be found, so the reminder at " + hoursLeft + " hours left for the game " + t.name + " was skipped.");
      continue;
    }

    member.send("This is an automated reminder to do your turn in the game " + t.name + ". There are " + hoursLeft + " hours left for the turn to roll. If you have already done your turn, you can safely ignore this (or double check that your turn went through just in case!).").catch((err) => {rw.log(err);});
  }
}

function lastHostTime(t = this)
{
	try
	{
		var stats = fs.statSync(config.dom5DataPath + "savedgames/" + t.name + "/ftherlnd");
		return stats.mtime.getTime();
	}

	catch (err)
	{
		rw.log("Either the game hasn't started or an error occurred while processing it:\n\n" + err);
		return -1;
	}
}

function sendTurnEmail(t = this)
{
  var subject = t.name + ": turn " + t.currenttimer.turn;
	var msg = t.name + ": new turn " + t.currenttimer.turn + ". " + t.currenttimer.print() + " left for the next turn.";

  if (t.emails == null || !t.emails.length)
  {
    return;
  }

	mail.send(null, msg, subject, t.emails, "clockworkhoundsforest@gmail.com");
}

function sendStales(t = this)
{
  var staleCount = 0;
  var aiCount = 0;
  var staleMsg = "**" + t.name + ": the nations below staled this turn.**\n\n";
  var aiMsg = "**The nations below are AI:**\n\n";

  var files = fs.readdirSync(config.dom5DataPath + "savedgames/" + t.name, "utf8");

  if (files == null)
  {
    rw.log("An error occurred while reading the save files of " + t.name + " to check stales.");
    t.lastHosted = lastHostTime(t);
    return;
  }

  if (t.organizer == null)
  {
    rw.log("Could not find an organizer to send the stale data for game " + t.name);
    t.lastHosted = lastHostTime(t);
    return;
  }

  for (var i = 0; i < files.length; i++)
	{
		//Only check the files with the .2h extension
		if (files[i].slice(files[i].indexOf(".")) == ".2h")
		{
			var stats = fs.statSync(config.dom5DataPath + "savedgames/" + t.name + "/" + files[i]);
      var dump = parseDump(t);

			if (stats == null)
			{
				rw.log("An error occurred while checking the stats of the file " + files[i] + " for stales for the game " + t.name + ".");
				continue;
			}

			if (stats.mtime.getTime() < t.lastHosted)
			{
        if (dump == null || dump[files[i]] == null)
        {
          if (trans.dom5NationFilesToNames[files[i]] == null)
          {
            staleMsg += "- " + files[i] + " (possible stale, could not be verified)\n";
          }

          else staleMsg += "- " + trans.dom5NationFilesToNames[files[i]] + " (possible stale, could not be verified)\n";
          staleCount++;
        }

        else
        {
          if (dump[files[i]].controller == 1) //human controller
          {
            staleMsg += "- " + dump[files[i]].nationName + "\n";
            staleCount++;
          }

          else if (dump[files[i]].controller == 2) //ai
          {
            aiMsg += "- " + dump[files[i]].nationName + "\n";
            aiCount++;
          }
        }
			}

      else if (dump[files[i]].controller == 2)
      {
        aiMsg += "- " + dump[files[i]].nationName + " (Nation **just** went AI this turn!)\n";
        aiCount++;
      }
		}
	}

  t.lastHosted = lastHostTime(t);

  if (staleCount > 0 && aiCount > 0)
	{
    t.organizer.send(staleMsg + "\n\n" + aiMsg);
	}

  else if (staleCount > 0)
  {
    t.organizer.send(staleMsg);
  }

  else if (aiCount > 0)
  {
    t.organizer.send("**" + t.name + ":** " + aiMsg);
  }
}

function statusCheck(t = this)
{
  t.runtime += 60; //1 minute in seconds
  getTurnInfo(updateAndSave, t);
}

function updateAndSave(info, t)
{
  try
  {
    updateTurnInfo(info, t);
    save(t);
  }

  catch(err)
  {
    rw.log("An error occurred when updating the turn info of " + t.name + ":\n\n" + err);
  }
}

function updateTurnInfo(info, t = this)
{
  var newTimerInfo = timer.parse(info);

  if (t.tracked === false)
  {
    t.currenttimer = Object.assign({}, newTimerInfo);
    return;
  }

  if (t.channel == null)
  {
    //rw.log("The channel for the game " + t.name + " could not be found. Impossible to announce changes.");
    return;
  }

  if (t.role == null)
  {
    //rw.log("The role for the game " + t.name + " could not be found.");
  }

  if (newTimerInfo.turn === 0 || t.wasStarted === false)
  {
    return;
  }

  if (newTimerInfo.turn > t.currenttimer.turn)
  {
    announceTurn(newTimerInfo, t);
    t.currenttimer.turn = newTimerInfo.turn;
    changeCurrentTimer(t.defaulttimer, t);
    return;
  }

  //An hour went by, so check and send necessary reminders
  else if (t.currenttimer.getTotalHours() != newTimerInfo.getTotalHours())
  {
    sendReminders(newTimerInfo.getTotalHours(), t);

    if (newTimerInfo.getTotalHours() <= 0 && newTimerInfo.getTotalSeconds() != 0)
    {
      announceNearTurn(newTimerInfo, t);
    }
  }

  t.currenttimer = Object.assign({}, newTimerInfo);
}

function announceTurn(newTimerInfo, t = this)
{
  if (newTimerInfo.turn === 1)
  {
    rw.log(t.name + ": game started! The default turn timer is of " + t.defaulttimer.print() + ".");
    t.channel.send(t.role + " Game started! The default turn timer is of " + t.defaulttimer.print() + ".");
  }

  else
  {
    rw.log(t.name + ": new turn " + newTimerInfo.turn + "! " + t.defaulttimer.print() + " left for the next turn.");
    t.channel.send(t.role + " New turn " + newTimerInfo.turn + " is here! " + t.defaulttimer.print() + " left for the next turn.");
    sendStales(t);
  }
}

function announceNearTurn(newTimerInfo, t = this)
{
  var dump = parseDump(t);
  var undoneCount = 0;
  var unfinishedCount = 0;
  var undoneNations = "**The nations below have not yet checked or done their turn:**\n\n";
  var unfinishedNations = "**The nations below have their turn marked as unfinished (this is probably fine, and if not, is the players' responsibility):**\n\n";

  rw.log(t.name + ": 1h or less left for the next turn.");

  if (dump == null)
  {
    return;
  }

  for (var nation in dump)
  {
    if (dump[nation].controller != 1)
    {
      continue;
    }

    if (dump[nation].turnPlayed == 0)
    {
      undoneCount++;
      undoneNations += "- " + dump[nation].nationName + "\n";
    }

    else if (dump[nation].turnPlayed == 1)
    {
      unfinishedCount++;
      unfinishedNations += "- " + dump[nation].nationName + "\n";
    }
  }

  if (undoneCount > 0 && unfinishedCount > 0)
  {
    t.channel.send(t.role + " There are " + newTimerInfo.getTotalMinutes() + " minutes left for the new turn. " + undoneNations + "\n\n" + unfinishedNations);
  }

  else if (undoneCount > 0)
  {
    t.channel.send(t.role + " There are " + newTimerInfo.getTotalMinutes() + " minutes left for the new turn. " + undoneNations);
  }

  else if (unfinishedCount > 0)
  {
    t.channel.send(t.role + " There are " + newTimerInfo.getTotalMinutes() + " minutes left for the new turn. " + unfinishedNations);
  }
}

function deleteSave(t = this)
{
  var files;
  var path = "games/" + t.name;

	if (fs.existsSync(path) === false)
	{
		files = null;
	}

  else files = fs.readdirSync(path, "utf8");

  kill(function()
  {
    if (files == null)
    {
      rw.log("The files for game " + t.name + " don't exist, no need to delete them.");
      return;
    }

    for (var i = 0; i < files.length; i++)
    {
      fs.unlinkSync(path + "/" + files[i]);
    }

    fs.rmdirSync(path);
  }, t);
}

function deleteDomSave(t = this)
{
  var files;
  var name = t.name;
  var path = config.dom5DataPath + "savedgames/" + name;

	if (fs.existsSync(path) === false)
	{
		files = null;
	}

  else files = fs.readdirSync(path, "utf8");

  kill(function()
  {
    if (files == null)
    {
      rw.log("The dominions 5 save files for game " + name + " don't exist, no need to delete them.");
      return;
    }

    for (var i = 0; i < files.length; i++)
    {
      fs.unlinkSync(path + "/" + files[i]);
    }

    fs.rmdirSync(path);
    rw.log(name + ": deleted the dom save files.");

  }, t);
}

function getTurnInfo(cb, t = this)
{
  fs.readFile("games/" + t.name + "/status", "utf8", (err, data) =>
  {
    if (err)
    {
      if (err.message.includes("ENOENT") === true) //Path not found error; file doesn't exist so game has not started
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

    cb(data, t);
  });
}

function getCurrentTimer(cb, t = this)
{
  getTurnInfo(function(data)
  {
    cb(timer.parse(data));
  }, t);
}

function save(t = this)
{
  //if directory with game name does not exist, create it.
  if (fs.existsSync("games/" + t.name) == false)
  {
    fs.mkdirSync("games/" + t.name);
  }

  rw.saveJSON("games/" + t.name + "/data.json", t);
}

function parseDump(t = this)
{
  var dump;
  var lines;
  var lineNumbers = "";
  var dumpObj = {};
  var path = config.dom5DataPath + "savedgames/" + t.name + "/statusdump.txt";

	if (fs.existsSync(path) === false)
	{
    rw.log("Could not find the path of the dump data of " + t.name);
    return null;
	}

  dump = fs.readFileSync(path, "utf-8");

  lines = dump.split("\n");

  for (var i = 0; i < lines.length; i++)
  {
    if (/Nation/i.test(lines[i]) === false || /Status/i.test(lines[i]) === true)
    {
      continue;
    }

    var nationFilenameStart = lines[i].replace(/Nation\s+(\-?\d+\s+)+/, "");
    var nationFilename = nationFilenameStart.slice(0, nationFilenameStart.search(/\s+/)).trim() + ".2h";
    var nationName = nationFilenameStart.slice(nationFilenameStart.search(/\s+/)).trim().replace("\t", ", ");
    dumpObj[nationFilename] = {};
    lineNumbers = lines[i].match(/\-?\d+/g);
    dumpObj[nationFilename].nationName = nationName;
    dumpObj[nationFilename].nationNbr = +lineNumbers[0];
    dumpObj[nationFilename].pretenderNbr = +lineNumbers[1];
    dumpObj[nationFilename].controller = +lineNumbers[2];
    dumpObj[nationFilename].aiLevel = +lineNumbers[3];
    dumpObj[nationFilename].turnPlayed = +lineNumbers[4];
  }

  return dumpObj;
}
