import mongoose from 'mongoose'

export default (table) => {
	mongoose.connect(process.env.NODE_ENV === 'production' ? 'mongodb://emails:emails@ds055875.mongolab.com:55875/heroku_hf0jx47p' : 'mongodb://localhost/myQube')
	const params = {
		first_name: String,
		second_name: String,
		third_name: String,
		email: String,
		sended: Boolean,
		rejected: Boolean,
		rejected2: Boolean,
		checked: Boolean
	}
	const Email = mongoose.model(table, params)
	return Email
}
