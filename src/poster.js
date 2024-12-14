let { API, Upload } = require('vk-io')

let fs = require('fs')
let Jimp = require('jimp-compact')
let config = require("./config.json")



module.exports = class VKPoster{


	async pushText(file, text, x, y, color, size) {

		try {

			let image = await Jimp.read(config.images+file)
			let font

			switch(size){

				case 8:
					font = await Jimp.loadFont(color === 1 ? Jimp.FONT_SANS_8_WHITE : Jimp.FONT_SANS_8_BLACK)
					break
				case 16:
					font = await Jimp.loadFont(color === 1 ? Jimp.FONT_SANS_16_WHITE : Jimp.FONT_SANS_16_BLACK)
					break
				case 32:
					font = await Jimp.loadFont(color === 1 ? Jimp.FONT_SANS_32_WHITE : Jimp.FONT_SANS_32_BLACK)
					break
				case 64:
					font = await Jimp.loadFont(color === 1 ? Jimp.FONT_SANS_64_WHITE : Jimp.FONT_SANS_64_BLACK)
					break
				case 128:
					font = await Jimp.loadFont(color === 1 ? Jimp.FONT_SANS_128_WHITE : Jimp.FONT_SANS_128_BLACK)
					break

			}

			image.print(font, x, y, text)
			let textedFile = `${file.split('.')[0]}${Date.now()}.${file.split('.')[1]}`
			await image.writeAsync(config.imagesPrc+textedFile)
			return textedFile

		}catch(error){

			//throw
		}
	}

	// async pushTextCenter128(file, text, color){

	// let image = await Jimp.read(config.images+file)
	// let font = await Jimp.loadFont('./1.fnt')
    // // Get the dimensions of the text
    // const textWidth = Jimp.measureText(font, text);
    // const textHeight = Jimp.measureTextHeight(font, text, image.bitmap.width);


    // const x = (image.bitmap.width / 2) - (textWidth / 2);
    // const y = (image.bitmap.height / 2) - (textHeight / 2);


    // image.print(font, x, y, text);

	// 	let textedFile = `${file.split('.')[0]}${Date.now()}.${file.split('.')[1]}`
	// 	await image.writeAsync(config.imagesPrc+textedFile)
	// 	return textedFile

	// }

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

