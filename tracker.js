
const fs = require("fs");
const event = require("../MrClockwork/emitter.js");
const rw = require("../MrClockwork/reader_writer.js");

module.exports =
{
  init: function()
  {
    setTimeout(update, msToNextSecond());
    return this;
  }
}

function msToNextHour()
{
  var d = new Date();
  d.setHours(d.getHours() + 1);
  d.setMinutes(0);
  d.setSeconds(0);

  return d.getTime() - Date.now();
}

function msToNextMinute()
{
  var d = new Date();
  d.setMinutes(d.getMinutes() + 1);
  d.setSeconds(0);
  return d.getTime() - Date.now();
}

function msToNextSecond()
{
  var d = new Date();
  d.setSeconds(d.getSeconds() + 1);
  return d.getTime() - Date.now();
}

function update()
{
  var d = new Date();

  if (d.getMinutes() == 0)
  {
    event.e.emit("hour");
  }

  if (d.getMinutes() % 5 == 0)
  {
    event.e.emit("5 minutes");
  }

  if (d.getSeconds() == 0)
  {
    event.e.emit("minute");
  }

  if (d.getSeconds() % 5 == 0)
  {
    event.e.emit("5 seconds");
  }

  //event.e.emit("second");

  setTimeout(update, msToNextSecond());
}
