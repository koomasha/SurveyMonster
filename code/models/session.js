var mongoose = require('mongoose'),
	Guid = require('guid'),
    Schema = mongoose.Schema;

var Session = new Schema({
    userId: String,
    expireAt: Date,
    token: String
});

Session.index({ expireAt: 1 }, { expireAfterSeconds: 0 });

var SessionModel = mongoose.model('Session', Session);

module.exports = {
	add: function(userId,callback) {
		var expireAt = new Date(new Date().getTime() + 30*60*1000);
		var token = Guid.create().value;

		var s = {userId:userId,expireAt:expireAt,token:token};
    	console.log(s);
		var result = new SessionModel(s); 

    	result.save(callback);
	},
	get: function(token,callback) {
		var expireAt = new Date(new Date().getTime() + 30*60*1000);
		SessionModel.findOneAndUpdate({token:token}, {expireAt:expireAt}, {}, callback);
	},
};

/*TEST*/