import mongoose from 'mongoose'

export default (table) => {
	mongoose.connect('mongodb://localhost/myQube')
	const params = {
		first_name: String,
		second_name: String,
		third_name: String,
		email: String,
		sended: Boolean,
		rejected: Boolean
	}
	const Email = mongoose.model(table, params)
	return Email
}
