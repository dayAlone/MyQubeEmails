import chalk from 'chalk'
import co from 'co'
import getCSV from './libs/getCSV'

import initMongoose from './libs/mongoose'
const Email = initMongoose('emails')

import { verify } from './libs/emailVerifier'
import validateEmail from './libs/validateEmail'

const Import = function* (filename) {
    const items = yield getCSV(`${__dirname}/csv/${filename}`, ';')

    for (let i = 0; i < items.length; i++) {
        const item = items[i]
        if (item) {
            item[0] = item[0].replace(/\s/, '')
            if (validateEmail(item[0])) {
                yield Email.collection.insert({
                    first_name: item[2],
                    second_name: item[3],
                    city: item[1],
                    email: item[0],
                    checked: false
                })
            } else {
                console.log(item[0])
            }
        }
    }
}

/*

    import stringify from 'csv-stringify'

    import getCSV from './libs/getCSV'


    import sendMessage from './libs/sendMessage'
    import validateEmail from './libs/validateEmail'
    import capitalizeFirstLetter from './libs/capitalizeFirstLetter'

    const Email = initMongoose('u_creative')

    const TEMPLATE = 'theatr4'
    const CAMPAIGN = {
        template: 'mail-2.3',
        subject: 'Интерактивный спектакль от победителей U_Concept: лучшие моменты',
        code: 'U_Creative theater photos',
        sender: 'no-reply@myqube.ru',
        from: 'MyQube.ru'
    }

    const TEST = true
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
        //{ first_name: 'Дмитрий', email: 'radia.interactive@gmail.com' },
        { first_name: 'Андрей', email: 'ak@radia.ru' },
    ]


    const Action = function *(test = false) {

        let emails = test ? testEmails : yield Email.find({ sended: false, rejected: false }).sort({ _id: 1 })//.limit(1000).skip(2700)

        console.log(`Total recivers: ${emails.length}`)

        for (let i = 0; i < emails.length; i++) {
            let el = emails[i]
            yield sendMessage(
                {
                    name: el.first_name,
                    email: el.email
                },
                CAMPAIGN,
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
        let items = yield getCSV(__dirname + '/csv/' + 'activity-2-1.csv', ';')

        for (let i = 0; i < items.length; i++) {
            let item = items[i]
            if (item) {
                yield Email.update({
                    email: item[1]
                }, {
                    $set: {
                        rejected: item[4] !== 'sent'
                    }
                }, { multi: true })
                console.log(item[1])
            }
        }
    }

*/

const Verify = function * () {
    const emails = yield Email.find({ checked: false }).sort({ _id: 1 })
    // yield getCSV(`${__dirname}/csv/emails.csv`, ';')
    // , email: { $not: /mail|bk|list|inbox/ }
    console.log(`Verifying ${emails.length} emails`)
    for (let i = 0; i < emails.length; i++) {

        const el = emails[i]

        console.log(el.email)

        const status = yield verify(el.email, {
            sender: 'test@test.tmweb.ru',
            timeout: 4000
        })

        status.info = status.info.replace(`${el.email} `, '')
        console.log(
            status.success ? chalk.green(status.success) : chalk.red(status.success),
            chalk.gray(status.info),
            '\n\n'
        )

        if (
            //status.info.indexOf('ECONNREFUSED') === -1
            //&& status.info.indexOf('Connection Timed Out') === -1
            status.info.indexOf('spam') === -1
            && status.info.indexOf('Ratelimit') === -1
            && status.info.indexOf('Please try again later') === -1) {
            yield Email.update({
                email: el.email
            }, {
                $set: {
                    rejected: !status.success,
                    rejected_message: status.info,
                    checked: true
                }
            }, { multi: true })
        }

    }

    //
    /*


    */
}

co(function*() {
    //yield Email.update({ }, { $set: { sended: false } }, { multi: true })
    //yield Action(TEST)

    //yield Import('emails.csv')
    //yield Clear()
    /*
        yield Email.update({
            rejected_message: /Connection Timed Out/
        }, {
            $set: {
                rejected: null,
                rejected_message: null,
                checked: false
            }
        }, { multi: true })
    */

    yield Verify()

}).then(() => {
    console.log('All sended')
}).catch(e => (console.error(e.stack)))
