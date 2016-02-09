import initMongoose from './libs/mongoose'
import chalk from 'chalk'
import co from 'co'
import sendMessage from './libs/sendMessage'
import getCSV from './libs/getCSV'
import verifier from 'email-verify'
import validateEmail from './libs/validateEmail'
import capitalizeFirstLetter from './libs/capitalizeFirstLetter'

const Email = initMongoose('u_creative')
const TEMPLATE = 'theatr4'
const TEST = false
const VARS = [
	{
		name: 'start',
		content: 7
	},
	{
		name: 'start_time',
		content: '19:00'
	}
]

let testEmails = [
	//{ first_name: 'Юлия', email: 'julia.borzova@coralpromo.ru' },
	//{ first_name: 'Юлия', email: 'yulchan-b@yandex.ru' },
	//{ first_name: 'Юлия', email: 'Yuliya.work4608@gmail.com' },
	//{ first_name: 'Дмитрий', email: 'dp@radia.ru' },
	{ first_name: 'Андрей', email: 'andrey.slider@gmail.com' },
]

const Action = function *(test = false) {

	let emails = test ? testEmails : yield Email.find({ sended: false }).sort({ _id: 1 })//.limit(1000).skip(4200)

	console.log(`Total recivers: ${emails.length}`)

	for (let i = 0; i < emails.length; i++) {
		let el = emails[i]
		yield sendMessage(
			{
				name: el.first_name,
				email: el.email
			},
			TEMPLATE,
			VARS,
			() => {
				if (test) {
					console.log(`${i + 1}. ${el.email}`)
				} else {
					Email.update({ _id: el._id }, { $set: { sended: true } }, (err, data) => {
						console.log(`${i + 1}. ${el.email}`)
					})
				}
			}
		)
	}

}

const Import = function * () {
	let items = yield getCSV(__dirname + '/csv/' + 'rejects-3.csv', ',')

	for (let i = 0; i < items.length; i++) {
		let item = items[i]
		if (item) {
			item[1] = item[1].replace(/\s/, '')
			if (validateEmail(item[1])) {
				Email.collection.insert({
					first_name: item[0],
					email: item[1],
					sended: false
				})
			} else {
				console.log(item[1])
			}
		}
	}
}

const Clear = function * () {
	let items = yield getCSV(__dirname + '/csv/' + 'rejects-3.csv', ',')

	for (let i = 0; i < items.length; i++) {
		let item = items[i]
		if (item) {
			yield Email.update({
				email: item[0]
			}, {
				$set: {
					rejected: true
				}
			})
			console.log(item[0])
		}
	}
}

const Verify = function * () {
	let emails = yield Email.find({ }).sort({ _id: 1 }).skip(13)
	let errors = 0
	let simmilar = 0
	let total = 0
	console.log(`Verifying ${emails.length} emails`)
	for (let i = 0; i < emails.length; i++) {
		total++
		let el = emails[i]

		let status = yield new Promise((fulfill, reject) => {
			verifier.verify(el.email, {
				sender: 'andrey.slider@gmail.com',
				//fdqn: 'gmail.com',
				timeout: 2000
			}, (err, info) => {
				if (!err) fulfill(info)
			})
		})
		if (!status.success) {
			yield Email.update({
				email: el.email
			}, {
				$set: {
					rejected2: true
				}
			})
			//errors++
			//if (el.rejected) simmilar++
			console.log(chalk.red(el.email), chalk.gray(status.info.replace(el.email + ' ', '')), el.rejected ? chalk.green(el.rejected) : chalk.red(false))
		}


	}

}

co(function*() {
	//yield Email.update({ sended: true }, { $set: { sended: false } }, { multi: true })
	//yield Action(TEST)


	//yield Import()
	//yield Clear()
	yield Verify()

}).then(() => {
	console.log('All sended')
}).catch(e => (console.error(e.stack)))
