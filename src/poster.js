let { API, Upload } = require('vk-io')

module.exports = class VKPoster{

	async pushText(file, text, x, y, color, font){
		//to do
	}

	async uploadCover(file, token){

		let vkapi = new API({
		    token: token
		});

		let vkupload = new Upload({
		    token: token
		});

		let url = await vkapi.call('photos.getOwnerCoverPhotoUploadServer', {
			"crop_width": 1920,
			"crop_height": 768
		})

		let upload_url = url.upload_url

		let data = await vkupload.buildPayload({
			field: "file",
			values: [
				{
					value: file
				}
			]
		})

		let photo = await vkupload.upload(upload_url, {
			formData: data.formData
		})

		let res = await vkapi.call('photos.saveOwnerCoverPhoto', photo)

		return true

	}

}