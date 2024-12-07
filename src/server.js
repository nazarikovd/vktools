const express = require('express')

const {
	VK,
	resolveResource
} = require("vk-io");

const app = express()
const port = 3000

app.get('/vkid/auth', (req, res) => {


});

app.get('/auth.do', (req, res) => {

	let check = checkQuery(req.query, ["access_token"])

	if(check !== true){

		errorResponse(res, `One of the parameters specified was missing or invalid: ${check} is undefined`)

	}else{

		//do auth
	}


});

app.get('/autostatus.setText', async (req, res) => {

	let check = checkQuery(req.query, ["kyoka_token", "text"])

	if(check !== true){

		errorResponse(res, `One of the parameters specified was missing or invalid: ${check} is undefined`)

	}else{

		//do setText
	}

});

app.get('/autostatus.getText', async (req, res) => {

	let check = checkQuery(req.query, ["kyoka_token"])

	if(check !== true){

		errorResponse(res, `One of the parameters specified was missing or invalid: ${check} is undefined`)

	}else{

		//do getText
	}

});

app.get('/online.set', async (req, res) => {

	let check = checkQuery(req.query, ["kyoka_token", "state"])

	if(check !== true){

		errorResponse(res, `One of the parameters specified was missing or invalid: ${check} is undefined`)

	}else{

		//do set
	}
	
});

app.get('/online.get', async (req, res) => {

	let check = checkQuery(req.query, ["kyoka_token"])

	if(check !== true){

		errorResponse(res, `One of the parameters specified was missing or invalid: ${check} is undefined`)

	}else{

		//do get
	}
	
});

app.get('/poster.setup', async (req, res) => {

	let check = checkQuery(req.query, ["kyoka_token", "poster", "font_type", "font_color"])

	if(check !== true){

		errorResponse(res, `One of the parameters specified was missing or invalid: ${check} is undefined`)

	}else{

		//do setup
	}

})

app.get('/poster.get', async (req, res) => {

	let check = checkQuery(req.query, ["kyoka_token"])

	if(check !== true){

		errorResponse(res, `One of the parameters specified was missing or invalid: ${check} is undefined`)

	}else{

		//do get
	}

})

app.get('/account.getStatus', async (req, res) => {

	let check = checkQuery(req.query, ["kyoka_token"])

	if(check !== true){

		errorResponse(res, `One of the parameters specified was missing or invalid: ${check} is undefined`)

	}else{

		//do getStatus
	}

})

function checkQuery(query, params){

	for(let param of params){

		if(!query.hasOwnProperty(param)){

			return param
		}
	}
	
	return true

}

function errorResponse(res, error){

	res.send({
		"success": false,
		"error": error
	})

}

app.listen(port, () => {
	console.log(`runnin on http://localhost:${port}`)
})