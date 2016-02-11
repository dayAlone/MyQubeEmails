/*
let mandrill = require('node-mandrill')('qhcD56rRZIu7OeqqfXD6PQ') // AbYry6AUdFi5yV7WV0Xmfw
export default function* (user, template, vars, callback = false) {
	let { email, name } = user
	let fields = {
		message: {
			to: [{ email: email, name: name }],
			merge: true,
			inline_css: true,
			merge_language: 'handlebars',
			global_merge_vars: [
				{
					name: 'user_name',
					content: name
				},
				...vars
			]
		},
		template_content: [],
		template_name: template //'u-creative' //'theatr' //'u-creative'

	}
	yield new Promise((fulfill, reject) => {
		mandrill('/messages/send-template', fields, (error, response) => {
			if (callback && !error) callback()
			if (error) console.log(error)

			if (error) reject(error)
			fulfill(response)
		})
	})
}
*/

/*
let mailgun = require('mailgun-js')({ apiKey: 'key-fdfef8c3783ef2aa7a1c4a407df62e4a', domain: 'myqube.ru' })
export default function* (user, template, vars, callback = false) {
	let { email, name } = user
	let data = {
		from: 'MyQube.ru <no-replay@myqube.ru>',
		to: email,
		subject: 'Тестовое сообщение',
		text: 'Добрый день, это тестовое сообщение от сайта MyQube.ru'
	}
	yield new Promise((fulfill, reject) => {
		mailgun.messages().send(data, function (error, response) {
			if (callback && !error) callback()
			if (error) console.log(error)

			if (error) reject(error)
			fulfill(response)
		})
	})
}
*/

/*
import sendpulse from './sendpulse.js'

export default function* (user, template, vars, callback = false) {
	let { email, name } = user
	sendpulse.init('3eaa4dd9973ab5e7eb1babb795caad26', 'adbb4bf0aa560aea97e6c8a29db424b3')
	let fields = {
		html: '<p>Your email content goes here</p>',
		text: 'Your email text version goes here',
		subject: 'Testing SendPulse API',
		from: {
			name: 'Your Sender Name',
			email: 'ak@radia.ru'
		},
		to: [{
			name: name,
			email: email
		}]
	}
	yield new Promise((fulfill, reject) => {

		sendpulse.smtpSendMail(response => {
			if (callback) callback()

			fulfill(response)
			console.log(response)
		}, fields)
	})

}
*/

const Mailjet = require('node-mailjet').connect('4275ba309f633460053c0e3539e7a419', 'a23233599b78beeae1665cf0fbb172e2')

export default function* (user, template, vars, callback = false) {
	let { email, name } = user
	var sendEmail = Mailjet.post('send')

	var emailData = {
		FromEmail: 'ak@radia.ru',
		FromName: 'My Name',
		Subject: 'Test with the NodeJS Mailjet wrapper',
		'Html-part': 'Hello NodeJs !',
		Recipients: [{
			Email: email,
			Name: name
		}],
		'Mj-campaign': 'SendAPI_campaign',
		'Mj-deduplicatecampaign': 1
	}
	yield new Promise((fulfill, reject) => {
		sendEmail
			.request(emailData)
			.on('success', response => {
				if (callback) callback()

				fulfill(response)

			})
			.on('error', error => {
				console.log(error)
				reject(error)
			})
	})
}
