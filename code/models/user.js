var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    passportLocalMongoose = require('passport-local-mongoose');

var User = new Schema({
		username: String,
		password: String,
    email: String,
});

User.plugin(passportLocalMongoose);
//module.exports = mongoose.model('User', User);
UserModel = mongoose.model('User', User);

module.exports = 
{
	model: UserModel,
	
	getUser: function(filter, callback) {
		UserModel.find(filter).
			select({ _id: 1, username: 1, email: 1 }).
			exec(callback);
	}
};
