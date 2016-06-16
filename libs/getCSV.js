import fs from 'fs'
import parse from 'csv-parse'

export default function * (file, symbol) {

    return yield new Promise((fulfill, reject) => {
        let output = []
        let parser = parse({ delimiter: symbol ? symbol : ';' })
        let input = fs.createReadStream(file)


        parser.on('readable', function () {
            output.push(parser.read())
        })
        parser.on('finish', function () {
            fulfill(output)
        })

        input.pipe(parser)

    })

        /*
        for (let i = 0; i < output.length; i++) {
            let item = output[i]
            if (item) {

                Email.update({
                    email: item[1]
                }, {
                    $set: {
                        sended: true,
                        rejected: item[4] !== 'sent'
                    }
                }, ()=> {
                    console.log(item[1])
                })

                /*item[0] = item[0].replace(/\s/, '')
                if (!validateEmail(item[1])) errors++
                else {
                    Email.collection.insert({
                        first_name: item[0],
                        //second_name: capitalizeFirstLetter(item[0]),
                        //third_name: capitalizeFirstLetter(item[2]),
                        email: item[1],
                        sended: false
                    })
                }
            }*/

}
