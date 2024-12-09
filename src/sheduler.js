let cron = require("node-cron")

let database = require('./database.js')
let config = require("./config.json")
let poster = require('./poster.js')
let online = require('./online.js')
let status = require('./status.js')

class VKSheduler{

	constructor{

		this.database = new database("accounts", config.key)
		this.poster = new poster()
		this.online = new online()
		this.status = new status()

	}

	async run(){

		//todo cron(job())
		
	}
	async job(){

		let accounts = this.database.getAccounts()
		for(let account of accounts){

			let params = account.params

			if(params.poster.enabled == true){

				let file = await this.poster.pushText(params.poster.file, params.poster.text, params.poster.x, params.poster.y, params.poster.font)
				this.poster.uploadCover(file, account.access_token)

			}

			if(account.params.online.enabled == true){

				this.online.set(account.access_token)

			}

			if(account.params.status.enabled == true){

				let text = await this.status.process(params.status.text)
				this.status.set(text, account.access_token)

			}

		}

	}


}