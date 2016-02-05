let mandrill = require('node-mandrill')('AbYry6AUdFi5yV7WV0Xmfw') //qhcD56rRZIu7OeqqfXD6PQ
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
