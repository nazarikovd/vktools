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
            const account = await this.decrypt(encryptedAccount)
            return account

        }catch(err){

            if (err.notFound) {

                return null

            }

            console.error('Error getting account by UID:', err)
            return null
        }
    }

    async createAccount(uid, access_token, params){

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

    async close(){

        await this.db.close()

    }
}