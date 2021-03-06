const axios = require('axios');

class Idpay {
	/**
	 * Get an instance
	 * @constructs
	 * @param {string} api_key - Your API_KEY From Idpay.ir
	 * @param {Boolean} sandbox - Test Mode
	 */
	constructor(api_key, sandbox = false) {
		/**
		 * Your API_KEY From Idpay.ir
		 * @private
		 */
		this.api_key = api_key;

		/**
		 * Test Mode
		 * @private
		 */
		this.sandbox = sandbox ? 1 : 0;
	}

	/**
	 * Create Payment URL
	 * @param {String} order_id - Random OrderID Generated By You
	 * @param {Number} amount - in Rial
	 * @param {String} callback - Callback URL To Your Webservice
	 * @param {String|null} desc - Any Description
	 * @param {String|null} name - Customer's Name
	 * @param {String|null} phone - Customer's Phone
	 * @param {String|null} mail - Customer's Mail
	 * @returns {Promise<{id: String, link: String}>}
	 */
	async create(order_id, amount, callback, desc = '', name = '', phone = '', mail = '') {
		if (typeof amount !== 'number' || amount < 1000)
			throw new Error("Transaction's amount must be a number and equal/greater than 1000");
		else if (typeof callback !== 'string' || callback.length < 5)
			throw new Error('Callback (redirect) URL must be a string.');
		else if (callback.slice(0, 4) != 'http') throw new Error('Callback URL must start with http/https');

		const response = await axios({
			method: 'post',
			headers: {
				'Content-Type': 'application/json',
				'X-API-KEY': this.api_key,
				'X-SANDBOX': this.sandbox,
			},
			url: 'https://api.idpay.ir/v1.1/payment',
			data: {
				order_id: String(order_id),
				amount: parseInt(amount),
				name: name,
				phone: phone,
				mail: mail,
				desc: desc,
				callback: callback,
				reseller: null,
			},
		});
		return response.data;
	}

	/**
	 * Validate Payment
	 * @param {String} order_id - Random OrderID Generated By You
	 * @param {String} token - Payment Token, Sent to your webservice via POST Mwthod
	 * @returns {Promise<{status: Number, track_id: String, id: String, order_id: String, amount: String, date: String, payment: {track_id: String, amount: String, card_no: String, hashed_card_no: String, date: String}, verify: {date: Number}}>}
	 */
	async validate(order_id, token) {
		const response = await axios({
			method: 'post',
			headers: {
				'Content-Type': 'application/json',
				'X-API-KEY': this.api_key,
				'X-SANDBOX': this.sandbox,
			},
			url: 'https://api.idpay.ir/v1.1/payment/verify',
			data: {
				id: token,
				order_id: order_id,
			},
		});
		return response.data;
	}
}

module.exports = (api_key, sandbox) => new Idpay(api_key, sandbox);
