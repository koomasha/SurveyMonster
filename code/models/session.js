var mongoose = require('mongoose'),
	Guid = require('guid'),
    Schema = mongoose.Schema;

var Session = new Schema({
    userId: String,
    expireAt: Date,
    token: String
});


// Returns a Date objects which represents exactly 30 munites into the future.
var getExpireAt = function()
{
	return new Date(new Date().getTime() + 30*60*1000);
}

// Define a TTL index on the Session collection, to support automatic session termination after idle time.
Session.index({ expireAt: 1 }, { expireAfterSeconds: 0 });


var SessionModel = mongoose.model('Session', Session);

module.exports = {

	// Adds a new session. Executed during a login).
	add: function(userId,callback) {
		var token = Guid.create().value;
		var s = {userId:userId,expireAt:getExpireAt(),token:token};
    	console.log(s);
		var result = new SessionModel(s); 
    	result.save(callback);
	},
	// Gets session by token received from the client. (Supporting authentication after initial login)
	get: function(token,callback) {
		SessionModel.findOneAndUpdate({token:token}, {expireAt:getExpireAt()}, {}, callback);
	},
	// Removes session by token. Executed during a logout.
	remove: function(token,callback) {
		SessionModel.findOneAndRemove({token:token},function(err,data){

			if(!data) 
				callback("Invalid token");
			else 
				callback(err,data);
		});
	},
};
