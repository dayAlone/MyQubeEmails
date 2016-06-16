import dns from 'dns-then'
import net from 'net'
import validator from 'email-validator'

export const verify = function * (email, options) {

    const domain = email.split(/[@]/)[1]


    const result = (success, info = '') => ({
        success,
        info,
        email
    })

    options = {
        port: 25,
        sender: 'ak@radia.ru',
        timeout: 0,
        fqdn: 's0s0.ru',
        ignore: false,
        ...options
    }
    if (!validator.validate(email)) return result(false, 'Invalid Email Structure')

    let addresses = []
    try {
        addresses = yield dns.resolveMx(domain)
    } catch (e) {
        return result(false, 'Domain not fount: ' + e.message)
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
                if (response.slice(-1) === '\n') {
                    response = response.replace('\r\n', '').replace(/["']/g, '')
                    switch (step) {
                    case 0:
                        if (response.indexOf('220') > -1) socket.write(`EHLO ${options.fqdn}\r\n`, () => (step++))
                        else fulfill({ result: false, info: 'Unknown error: ' + response })
                        break
                    case 1:
                        if (response.indexOf('250') > -1) socket.write(`MAIL FROM:<${options.sender}>\r\n`, () => (step++))
                        else fulfill({ result: false, info: 'Unknown error: ' + response })
                        break
                    case 2:
                        if (response.indexOf('250') > -1) socket.write(`RCPT TO:<${email}>\r\n`, () => (step++))
                        else fulfill({ result: false, info: 'Unknown error: ' + response })
                        break
                    case 3:
                        if (response.indexOf('250') > -1) {
                            if (
                                ['mail.ru', 'bk.ru', 'list.ru', 'inbox.ru', 'yahoo.com'].indexOf(domain) !== -1
                            ) {
                                socket.write(`DATA\r\n`)
                            } else {
                                fulfill({ result: true, info: 'The email account exist' })
                            }
                        } else if (response.indexOf('354') !== -1) {
                            socket.write(`Subject: Test letter\r\n\r\nHello ${email}! It is test, sorry for this:(\r\n.\r\n`, () => (step++))
                        } else if (response.indexOf('421') !== -1) {
                            fulfill({ result: false, info: 'Unknown error: ' + response })
                        }
                        else fulfill({ result: false, info: 'The email account does not exist: ' + response })
                        break
                    case 4:
                        if (response.indexOf('550') !== -1 || response.indexOf('554') !== -1) {
                            if (
                                response.indexOf('No such user') !== -1 // Yandex
                                || response.indexOf('invalid mailbox') !== -1 // Mail.ru
                                || response.indexOf('Addresses failed') !== -1 // Pochta.ru
                                || response.indexOf('This user doesnt have a yahoo.com account') !== -1 // yahoo.com
                            ) {
                                fulfill({ result: false, info: 'The email account does not exist: ' + response })
                            } else {
                                fulfill({ result: false, info: 'Unknown error: ' + response })
                            }
                        } else {
                            if (response.indexOf('250') !== -1) {
                                fulfill({ result: true, info: 'The email account exist' })
                            } else {
                                fulfill({ result: false, info: 'Unknown error: ' + response })
                            }
                        }
                        break
                    default:
                        fulfill({ result: false, info: 'Unknown error: ' + response })
                    }
                }
            })
            .on('error', error => {
                fulfill({ result: false, info: error.message })
            })
    })
    return result(response.result, response.info)
}
