let { API } = require('vk-io')

module.exports = class VKStatus{

	async set(token){

		let vkapi = new API({
		    token: token
		});

		let res = await vkapi.call("account.setOnline")

		return true

	}

}