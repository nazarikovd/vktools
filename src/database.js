const { Level } = require('level')
const crypto = require('crypto')
const { scrypt, randomBytes } = require('crypto');

module.exports = class VKDatabase {

    constructor(name, encryptionKey) {

        this.db = new Level(name, { valueEncoding: 'json' })
        this.encryptionKey = encryptionKey
    }

	async encrypt(data) {

	    const salt = randomBytes(16)
	    const key = await new Promise((resolve, reject) => {

	        scrypt(this.encryptionKey, salt, 32, (err, key) => {
	            if (err) reject(err)
	            else resolve(key)
	        })

	    })

	    const iv = randomBytes(16)
	    const cipher = crypto.createCipheriv('aes-256-ctr', key, iv)
	    let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex')
	    encrypted += cipher.final('hex')

	    return { iv: iv.toString('hex'), salt: salt.toString('hex'), encrypted: encrypted }

	}

    async decrypt(encryptedData){

	    const salt = Buffer.from(encryptedData.salt, 'hex')

	    const key = await new Promise((resolve, reject) => {

	        scrypt(this.encryptionKey, salt, 32, (err, key) => {

	            if (err) reject(err)
	            else resolve(key)
	        })

	    })

	    const iv = Buffer.from(encryptedData.iv, 'hex')
	    const decipher = crypto.createDecipheriv('aes-256-ctr', key, iv)
	    let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8')
	    decrypted += decipher.final('utf8')

	    try{

	        return JSON.parse(decrypted)

	    }catch(e){

	        console.error('Decryption failed', e)
	        return null

	    }

	}

	async getAccounts(){

	    const accounts = []

	    try {

            for await (const [key, value] of this.db.iterator()) {

                const decryptedValue = await this.decrypt(value)

                accounts.push({
                    "uid": key,
                    "data": decryptedValue
                });

            }

	    } catch (err) {

	        console.error('Error getting accounts:', err)
	        return []
	    }

	    return accounts
	}

	async getAccountByToken(kyoka_token){

	    let account

	    try{

	        for await (const [key, value] of this.db.iterator()){

                const decryptedValue = await this.decrypt(value)
                if (decryptedValue.kyoka_token === kyoka_token) {

                    account = decryptedValue;
                    break;

                }

	        }

	    }catch(err){

	        console.error('Error getting account by token:', err)
	    }
	    return account
	}

    async getAccountByUID(uid){

        try{

            const encryptedAccount = await this.db.get(uid)
            if(encryptedAccount === undefined){
            	return null
            }
            const account = await this.decrypt(encryptedAccount)
            return account

        }catch(err){

            console.error('Error getting account by UID:', err)
            return null
        }
    }

    async isExist(uid){

		let check = await this.getAccountByUID(uid)

    	if(check){

    		return check

    	}else{

    		return false
    	}
    }

    async createAccount(uid, access_token, params){

    	if(await this.isExist(uid)){
    		return false
    	}

        const kyoka_token = crypto.randomUUID()

        const account = {
            access_token: access_token,
            kyoka_token: kyoka_token,
            params: params
        }

        const encryptedAccount = await this.encrypt(account)

        try{

            await this.db.put(uid, encryptedAccount)
            return kyoka_token

        }catch(err){

            console.error('Error creating account:', err)
            return null

        }
    }

    async changeAccount(uid, data){

		if(!data){
			return false
		}

    	let acc = await this.isExist(uid)
    	console.log(acc)
    	if(!acc){
    		return false
    	}

	    const account = {
	        access_token: acc.access_token,
	        kyoka_token: acc.kyoka_token,
	        params: acc.params,
	        ...data
	    };

        const encryptedAccount = await this.encrypt(account)

        try{

            await this.db.put(uid, encryptedAccount)
            return true

        }catch(err){

            console.error('Error editing account:', err)
            return null

        }
    }

	async deleteAccount(uid){

    	if(!await this.isExist(uid)){
    		return false
    	}

        await this.db.del(uid);
        return true

    }

    async close(){

        await this.db.close()

    }
}