let cron = require("node-cron")

let database = require('./database.js')
let config = require("./config.json")
let poster = require('./poster.js')
let online = require('./online.js')
let status = require('./status.js')

class VKSheduler{

	constructor(_log=console.log){

		this.database = new database(config.db_name, config.db_key)
		this.poster = new poster()
		this.online = new online()
		this.status = new status()
		this.cron = null
		this._log = _log
	}

	async run(){

		this.cron = cron.schedule('* * * * *', async () => {
			this._runWithTimeout(this.job())
		});
		
	}

	async _runWithTimeout(f) {
		let startTime = Date.now();
		const timeout = new Promise((resolve, reject) => {
			setTimeout(() => reject("Timeout"), 60000);
		});

		try {
			await Promise.race([f, timeout]);
			let duration = Date.now() - startTime;
			this.log("SUCCESS_CRON", `cron successfully completed in ${duration} ms`)

		}catch(error){

			if(error === "Timeout"){
				this.log("FAILED_CRON", "cron timed out")
			}else{
				this.log("FAILED_CRON", "cron failed")
			}

		}
	}

	async job(){

		let accounts = await this.database.getAccounts();

		for (let account of accounts) {

			let params = account.data.params;
			if (params.poster.enabled) {
				this.log("SUCCESS_JOB", "poster @ "+account.uid)
				let file = await this.poster.pushText(params.poster.file, params.poster.text, params.poster.x, params.poster.y, params.poster.font);
				this.poster.uploadCover(file, account.data.access_token);
			}

			if (params.online.enabled) {
				this.log("SUCCESS_JOB", "online @ "+account.uid)
				this.online.set(account.data.access_token);
			}

			if (params.status.enabled) {
				this.log("SUCCESS_JOB", "status @ "+account.uid)
				let text = await this.status.process(params.status.text);
				this.status.set(text, account.data.access_token);
			}
		}


	}

	log(type, data){
		this._log(type, data)
	}


}