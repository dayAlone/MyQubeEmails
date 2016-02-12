import dns from 'dns-then'
import net from 'net'
import validator from 'email-validator'

export const verify = function * (email, options) {

	const domain = email.split(/[@]/)[1]


	let result = (success, info = '') => ({
		success: false,
		info: info,
		email: email
	})

	options = {
		port: 25,
		sender: 'name@example.org',
		timeout: 0,
		fqdn: 'mail.example.org',
		ignore: false,
		...options
	}
	if (!validator.validate(email)) return result(false, 'Invalid Email Structure')

	let addresses = []
	try {
		addresses = yield dns.resolveMx(domain)
	} catch (e) {
		return result(false, 'Domain not fount')
	}

	if (addresses && addresses.length === 0) return result(false, 'No MX Records')

	const smtp = addresses.sort((a, b) => (b.priority - a.priority)).map(el => (el.exchange))[0]
	const response = yield new Promise((fulfill, reject) => {
		const socket = net.createConnection(options.port, smtp)
		let step = 0
		socket.setTimeout(options.timeout, () => {
			fulfill({ result: false, info: 'Connection Timed Out' })
			socket.destroy()
		})
		socket
			.on('data', response => {
				response = response.toString()
				console.log(response, step)
				if (response.slice(-1) === '\n') {
					switch (step) {
					case 0:
						if (response.indexOf('220') > -1) socket.write(`EHLO ${options.fqdn}\r\n`, () => (step++))
						else socket.end()
						break
					case 1:
						if (response.indexOf('250') > -1) socket.write(`MAIL FROM:<${options.sender}>\r\n`, () => (step++))
						else socket.end()
						break
					case 2:
						if (response.indexOf('250') > -1) socket.write(`RCPT TO:<${email}>\r\n`, () => (step++))
						else socket.end()
						break
					case 3:
						if (response.indexOf('250') > -1)  {
							socket.write(`DATA\nSubject: Test letter\n\nHello! It is test!\n.\n`, () => (step++))
						} else fulfill({ result: false, info: 'The email account does not exist' })
						break
					case 4:
						if (response.indexOf('550') === -1)  {
							fulfill({ result: true, info: 'The email account exist' })
						} else fulfill({ result: true, info: 'Unknown error' })
						break
					default:
						fulfill({ result: true, info: 'Unknown error' })
					}
				}
			})
			.on('error', error => {
				fulfill({ result: false, info: error.message })
			})
	})

	//yield assertTimeout(next, '5 seconds')

	console.log(response)
}
