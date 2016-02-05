import initMongoose from './libs/mongoose'
import co from 'co'
import sendMessage from './libs/sendMessage'
import getCSV from './libs/getCSV'
import validateEmail from './libs/validateEmail'
import capitalizeFirstLetter from './libs/capitalizeFirstLetter'

const Email = initMongoose('ambs5')
const TEMPLATE = 'theatr2'
const TEST = false
const VARS = [
	{
		name: 'start',
		content: 5
	},
	{
		name: 'start_time',
		content: '20:00'
	}
]

let testEmails = [
	//{ first_name: 'Юлия', email: 'julia.borzova@coralpromo.ru' },
	//{ first_name: 'Юлия', email: 'yulchan-b@yandex.ru' },
	//{ first_name: 'Юлия', email: 'Yuliya.work4608@gmail.com' },
	//{ first_name: 'Дмитрий', email: 'dp@radia.ru' },
	//{ first_name: 'Андрей', email: 'andrey.slider@gmail.com' },
]

const Action = function *(test = false) {

	let emails = test ? testEmails : yield Email.find({ sended: false })

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
	let items = yield getCSV(__dirname + '/csv/' + 'amb07.csv', ';')

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

co(function*() {
	yield Action(TEST)

	//yield Email.update({ sended: true }, { $set: { sended: false } }, { multi: true })

	//yield Import()

}).then(() => {
	console.log('All sended')
}).catch(e => (console.error(e.stack)))
