var mongoose = require('mongoose'),
	Guid = require('guid'),
    Schema = mongoose.Schema;

var Session = new Schema({
    userId: String,
    expireAt: Date,
    token: String
});

var getExpireAt = function()
{
	return new Date(new Date().getTime() + 30*60*1000);
}

Session.index({ expireAt: 1 }, { expireAfterSeconds: 0 });

var SessionModel = mongoose.model('Session', Session);

module.exports = {
	add: function(userId,callback) {
		var token = Guid.create().value;
		var s = {userId:userId,expireAt:getExpireAt(),token:token};
    	console.log(s);
		var result = new SessionModel(s); 

    	result.save(callback);
	},
	get: function(token,callback) {
		SessionModel.findOneAndUpdate({token:token}, {expireAt:getExpireAt()}, {}, callback);
	},
	remove: function(token,callback) {
		SessionModel.findOneAndRemove({token:token},function(err,data){

			if(!data) 
				callback("Invalid token");
			else 
				callback(err,data);
		});
	},
};

/*TEST*/