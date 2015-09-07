var mongoose = require('mongoose'),
		idValidation = require('../helpers/idValidation'),
    Schema = mongoose.Schema;

var Field = new Schema({
	question : String,
	answers : [String],
	other:Boolean
});

var Survey = new Schema({
	subject: String,
	creatorId: String,
	ownerIds: [String],
	allowedUsers: [String],
	isPublic:Boolean,
	surveyTemplate:[Field],
	createDate:Date
});

var SurveyModel = mongoose.model('Survey', Survey);

module.exports = {
	// Adds a new survey to the database.
	saveSurvey: function(session,newSurvey,callback) {
		newSurvey.creatorId = session.userId;		
		if (!newSurvey.ownerIds) 
			newSurvey.ownerIds = [];
		newSurvey.ownerIds.push(newSurvey.creatorId);
		newSurvey.createDate = new Date();

		var result = new SurveyModel(newSurvey); 
		result.save(callback);
	},
	// Deletes a survey from the database.
	deleteSurvey: function(session,surveyId,callback) {
		// Guest users are not permitted by definition to delete a survey.
		if (!session || !session.userId)
			callback("Unauthorized to perform the survey delete operation.");
		else
		{
			// Execute query.
			SurveyModel.findOneAndRemove({ownerIds:{"$in":[session.userId]}, _id:surveyId}, 
										 function(err, data) 
											{
												if (!data) 
													callback("Invalid Survey ID");
												else 
													callback(err,data);
											});
		}
	},
	// Updates the users that are allowed to submit their answers to a survey.
	updateAllowedUsers: function(session, surveyId, userIds, callback) { 

			SurveyModel.update({_id:surveyId, ownerIds:{"$in":[session.userId]}}, 
												 {$set: { allowedUsers:userIds}},
												 callback);
		});
	},
	getSurveyByOwnerId: function(id,filter,callback) {
		filter.ownerIds={ $in:[id]};
		console.log(filter);
		SurveyModel.find(filter).
			exec(callback);
	},
	// Gets surveys a user is allowed to submit answers to.
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
	// Gets survey by a custom filter (expected in JSON format).
	findOne: function(filter,callback) {
		SurveyModel.findOne(filter,callback);
	},
};
