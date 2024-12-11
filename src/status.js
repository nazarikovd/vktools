let { API } = require('vk-io')

module.exports = class VKStatus{

	async process(text){
		//to do
		return text
	}

	async set(text, token){

		let vkapi = new API({
		    token: token
		});

		let res = await vkapi.status.set({
			"text": text
		})

		return true

	}

}