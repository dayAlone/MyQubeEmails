import mongoose from 'mongoose'

export default (table) => {
	mongoose.connect(process.env.NODE_ENV === 'production' ? process.env.MONGOLAB_URI : 'mongodb://localhost/myQube')
	const params = {
		first_name: String,
		second_name: String,
		third_name: String,
		email: String,
		sended: Boolean,
		rejected: Boolean,
		rejected2: Boolean,
	}
	const Email = mongoose.model(table, params)
	return Email
}
