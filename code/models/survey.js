var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var Field = new Schema({
	question : String,
	answers : [String],
	other:Boolean
});

var Survey = new Schema({
	subject: String,
	creatorId: String,
	ownerIds:[String],
	allowedUsers:[String],
	isPublic:Boolean,
	surveyTemplate:[Field],
	createDate:Date
});

var SurveyModel = mongoose.model('Survey', Survey);

module.exports = {
	saveSurvey: function(session,newSurvey,callback) {
		newSurvey.creatorId = session.userId;		
		if(!newSurvey.ownerIds) newSurvey.ownerIds = [];
		newSurvey.ownerIds.push(newSurvey.creatorId);
		newSurvey.createDate = new Date();

		var result = new SurveyModel(newSurvey); 
		result.save(callback);
	},
	deleteSurvey: function(session,surveyId,callback) {
		if (!session || !session.userId)
			callback("Unauthorized to perform the survey delete operation.");
		else
		{
			SurveyModel.findOneAndRemove({ownerIds:{"$in":[session.userId]}, _id:mongoose.Types.ObjectId(surveyId)}, function(err, data) 
			{
				console.log('SURVEYID:');
				console.log(surveyId);
				console.log('USERID:');
				console.log(session.userId);
				if(!data) 
				{
					callback("Invalid surveyId");
				}
				else 
				{
					console.log("DATA:");
					console.log(data);
					callback(err,data);
				}
			});
		}
	},
	updateOwners: function(session, surveyId, userIds, callback) {
		// TODO: Implement.
		SurveyModel.update({surveyId:surveyId, ownerIds:{"$in":[session.userId]}}, {$set: { ownerIds:userIds }})
	},
	updateAllowedUsers: function(session, surveyId, userIds, callback) {
		// TODO: Implement.
		SurveyModel.update({surveyId:surveyId, ownerIds:{"$in":[session.userId]}}, {$set: { allowedIds:userIds }});
	},
	getSurveyByOwnerId: function(id,filter,callback) {
		filter.ownerIds={ $in:[id]};
		console.log(filter);
		SurveyModel.find(filter).
			exec(callback);
	},
	getSurveyByAllowedId: function(id,filter,callback) {
		filter.allowedUsers={ $in: [id] };
		SurveyModel.find(filter).
			select({ subject: 1, expiryDate: 1, isPublic: 1, surveyTemplate: 1, createDate: 1 }).
			exec(callback);
	},
	getPublicSurvey: function(filter,callback) {
		filter.isPublic=true
		console.log(filter);
		SurveyModel.find(filter).
			select({ subject: 1, expiryDate: 1, isPublic: 1, surveyTemplate: 1, createDate: 1 }).
			exec(callback);
	},
	findOne: function(filter,callback) {

		SurveyModel.findOne(filter,callback);
	},
};

/*TEST*/