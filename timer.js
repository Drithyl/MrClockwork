
const rw = require("../MrClockwork/reader_writer.js");

module.exports =
{
  create: function()
  {
    var obj =
    {
      turn: 0,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      isPaused: false,

      getTotalHours: function()
      {
        return this.days * 24 + this.hours;
      },

      getTotalMinutes: function()
      {
        return (this.days * 24 * 60) + (this.hours * 60) + this.minutes;
      },

      getTotalSeconds: function()
      {
        return (this.days * 24 * 60 * 60) + (this.hours * 60 * 60) + (this.minutes * 60) + this.seconds;
      },

      print: function()
      {
        var str = "";

        if (this.isPaused)
        {
          return "Paused";
        }

        if (this.days > 0)
        {
          str += this.days + " day(s), "
        }

        if (this.hours > 0)
        {
          str += this.hours + " hour(s), "
        }

        if (this.minutes > 0)
        {
          str += this.minutes + " minute(s), "
        }

        if (this.seconds > 0)
        {
          str += this.seconds + " second(s)"
        }

        str = str.replace(/\,\s*$/, "");

        return  str;
      },

      toExeArguments: function()
      {
        var hours = this.getTotalHours();
        var minutes = this.getTotalMinutes();

        if (hours <= 0)
        {
          return ["--minutes", minutes.toString()];
        }

        else return ["--hours", (hours + 1).toString()];
      }

    };

    return obj;
  },

  revive: function(objJSON)
  {
    var timer = this.create();

    for (var key in objJSON)
    {
      if (timer[key] != null)
      {
        timer[key] = objJSON[key];
      }
    }

    return timer;
  },

  parse: function(data)
  {
    var timer = this.create();
    var statusInfo;
    var turn;
    var days;
    var hours;
    var minutes;
    var seconds;

    if (/\S+/.test(data) == false)
    {
      return timer;
    }

    statusInfo = data.slice(data.indexOf("turn"), data.indexOf("</td>", data.indexOf("turn")));
    turn = +statusInfo.match(/\d+/)[0];

    if (statusInfo.indexOf("day") != -1)
    {
      days = +statusInfo.slice(statusInfo.indexOf("time"), statusInfo.indexOf("day")).replace(/\D/g, "");
    }

    if (statusInfo.indexOf("hour") != -1)
    {
      hours = +statusInfo.slice(statusInfo.indexOf("and"), statusInfo.indexOf("hour")).replace(/\D/g, "");
    }

    if (statusInfo.indexOf("minute") != -1)
    {
      minutes = +statusInfo.slice(statusInfo.indexOf("time"), statusInfo.indexOf("minute")).replace(/\D/g, "");
    }

    if (statusInfo.indexOf("second") != -1)
    {
      seconds = +statusInfo.slice(statusInfo.indexOf("time"), statusInfo.indexOf("second")).replace(/\D/g, "");
    }

  	if (isNaN(turn) === false)
    {
      timer.turn = turn;
    }

    if (isNaN(days) === false)
    {
      timer.days = days;
    }

    if (isNaN(hours) === false)
    {
      timer.hours = hours;
    }

    if (isNaN(minutes) === false)
    {
      timer.minutes = minutes;
    }

    if (isNaN(seconds) === false)
    {
      timer.seconds = seconds;
    }

    if (timer.getTotalSeconds() <= 0)
    {
      timer.isPaused = true;
    }

  	return timer;
  },

  //Input must contain at least a digit
  createFromInput: function(input)
  {
    var timer = this.create();
    var days = input.match(/\d+d(ay)?/i);
    var hours = input.match(/\d+h(our)?/i);
    var minutes = input.match(/\d+m(inute)?/i);

    if (/(\d+|\d+d(ay)?|\d+h(our)?|\d+m(inute)?)/i.test(input) === false)
    {
      rw.log("The input to create a timer was incorrect: " + input);
      return null;
    }

    if (days && days.length)
    {
      timer.days = +days[0].replace(/\D/g, "");
    }

    if (hours && hours.length)
    {
      timer.hours = +hours[0].replace(/\D/g, "");
    }

    if (minutes && minutes.length)
    {
      timer.minutes = +minutes[0].replace(/\D/g, "");
    }

    if (days == null && hours == null && minutes == null)
    {
      timer.hours = +input.replace(/\D/g, "");
    }

    if (timer.minutes != null && timer.minutes > 60)
    {
      timer.hours = (timer.hours || 0) + Math.floor(timer.minutes / 60);
      timer.minutes = timer.minutes % 60;
    }

    if (timer.hours != null && timer.hours > 24)
    {
      timer.days = (timer.days || 0) + Math.floor(timer.hours / 24);
      timer.hours = timer.hours % 24;
    }

    if (timer.getTotalMinutes() <= 0)
    {
      timer.isPaused = true;
    }

    return timer;
  },

  difference: function(timer1, timer2)
  {
    return this.secondsToTimer(Math.abs(timer1.getTotalSeconds() - timer2.getTotalSeconds()));
  },

  secondsToTimer: function(seconds)
  {
    var timer = this.create();

    if (seconds <= 0)
    {
      return timer;
    }

    timer.days = Math.floor(seconds % 86400);
    seconds = (seconds - (timer.days * 86400)).lowerCap(0);

    timer.hours = Math.floor(seconds % 3600);
    seconds = (seconds - (timer.days * 3600)).lowerCap(0);

    timer.minutes = Math.floor(seconds % 60);
    seconds = (seconds - (timer.days * 60)).lowerCap(0);

    timer.seconds = seconds;
    return timer;
  }
}
