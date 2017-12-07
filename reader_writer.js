const fs = require("fs");
const event = require("../MrClockwork/emitter.js");
const config = require("../MrClockwork/config.json");

module.exports =
{
	domcmd: function(commands, game, cb = null)
	{
	  var path = config.dom5DataPath + "savedgames/" + game.name + "/domcmd";

	  fs.writeFile(path, commands, function(err)
	  {
	    if (err)
	    {
	      game.channel.send("An error occurred when trying to change the timer or start the game. Contact the Admin as soon as possible, or have the game organizer or any GM or above use the `%kill gamename` command if there is little time left.");
	      rw.log("An error occurred when creating the domcmd file for game " + game.name + ":\n\n" + err);
	      return;
	    }

	    if (cb != null)
	    {
	      cb();
	    }
	  });
	},

	copyFile: function(source, target, cb)
	{
		var cbCalled = false;
		var rd;

	  this.checkAndCreateDir(target);
		rd = fs.createReadStream(source);

		rd.on("error", function(err)
		{
		  done(err);
		});

		var wr = fs.createWriteStream(target);
		wr.on("error", function(err)
		{
		  done(err);
		});

		wr.on("close", function(ex)
		{
		  done();
		});

		rd.pipe(wr);
		function done(err)
		{
		  if (!cbCalled)
			{
		    cb(err, source);
		    cbCalled = true;
		  }
		}
	},

	copyFileSync: function(source, target)
	{
		var data = fs.readFileSync(source);

		if (data == null)
		{
			rw.log("An error occurred when sync reading the file at " + source);
			return;
		}

	  this.checkAndCreateDir(target);
		fs.writeFileSync(target, data);
	},

	checkAndCreateDir: function(filepath)
	{
		var splitPath = filepath.split("/");
		var compoundPath = splitPath.shift();

		//It's length >= 1 because we don't want the last element of the path, which will be a file, not a directory
		while (splitPath.length && splitPath.length >= 1)
		{
			if (fs.existsSync(compoundPath) == false)
		  {
		    fs.mkdirSync(compoundPath);
		  }

			compoundPath += "/" + splitPath.shift();
		}
	},

	readJSON: function(savePath, callback, reviver = null)
	{
		var obj = {};

		fs.readFile(savePath, "utf8", (err, data) =>
	 	{
			if (err)
			{
				this.log("There was an error while trying to read the JSON file " + savePath + ":\n\n" + err);
				return null;
			}

			if (data == null)
			{
				this.log("Couldn't extract any data from " + savePath);
				return null;
			}

			if (/[\w\d]/.test(data) == false)
			{
				this.log("Data in " + savePath + " is empty.");
				return null;
			}

			if (reviver == null)
			{
				obj = JSON.parse(data);
			}

			else
			{
				obj = JSON.parse(data, reviver);
			}

			callback(obj);
		});
	},

	saveJSON: function(filePath, obj, keysToFilter)
  {
  	fs.writeFile(filePath, objToJSON(obj), (err) =>
  	{
  		if (err)
  		{
  			this.log("Save failed for the following char data: " + filePath + "\nThe error given is: " + err);
  			return;
  		}
  	});
  },

	log: function(input)
	{
		var d = new Date().toString().replace(" (W. Europe Standard Time)", "");
		d = d.replace(" (Central European Standard Time)", "");

		console.log (d + "\n-- " + input + "\n");

		fs.appendFile("bot.log.report", d + "\r\n-- " + input + "\r\n\n", function (err)
		{
			if (err)
			{
				console.log(err);
			}
		});
	}
}

/*******************READING SAVED DATA**********************/
function objToJSON(obj, keysToFilter = {"instance": null, "guild": "id", "channel": "id", "role": "id", "organizer": "id"})
{
	var copyObj = Object.assign({}, obj);

	for (var key in keysToFilter)
	{
		if (copyObj[key] == null)
		{
			continue;
		}

		if (keysToFilter[key] == null)
		{
			delete copyObj[key];
			continue;
		}

		if (copyObj[key][keysToFilter[key]])
		{
			copyObj[key] = copyObj[key][keysToFilter[key]];
		}
	}

	return JSON.stringify(copyObj);
}
