module.exports = {
  /**
   * Application configuration section
   * http://pm2.keymetrics.io/docs/usage/application-declaration/
   */
  apps : [

  //This is the file that's run by pm2 to execute the bot process.
  //It is necessary because it allows to specify exactly what it has to watch,
  //in this case only the bot's code file, because otherwise it will close and restart the process
  //when it finds a change in ANY file of the whole directory, which is pointless since the bot itself
  //makes file changes.
    {
		//The name you want the process to show with
		name: 			"Mr. Clockwork",
		
		//The actual file that you're executing
		script: 		"MrClockwork.js",
		
		//Watches a path, an array of paths, or a full directory when using bool (true)
		watch: 			"D:/Google Drive/Clockwork Hounds stuff/Bots/MrClockwork/v11/MrClockwork.js",
		
		//Ignore specific file changes when watching
		ignore_watch: 	[],
		watch_options: 	
		{
			followSymlinks: false
		}
	}
  ],

  /**
   * Deployment section
   * http://pm2.keymetrics.io/docs/usage/deployment/
   */
  deploy : {
    production : {
      user : "node",
      host : "212.83.163.1",
      ref  : "origin/master",
      repo : "git@github.com:repo.git",
      path : "/var/www/production",
      "post-deploy" : "npm install && pm2 startOrRestart ecosystem.json --env production"
    },
    dev : {
      user : "node",
      host : "212.83.163.1",
      ref  : "origin/master",
      repo : "git@github.com:repo.git",
      path : "/var/www/development",
      "post-deploy" : "npm install && pm2 startOrRestart ecosystem.json --env dev",
      env  : {
        NODE_ENV: "dev"
      }
    }
  }
}
