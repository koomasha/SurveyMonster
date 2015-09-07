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
	creatorId: {type: Schema.Types.ObjectId, ref: 'User'},
	ownerIds: [{type: Schema.Types.ObjectId, ref: 'User'}],
	allowedUsers: [{type: Schema.Types.ObjectId, ref: 'User'}],
	isPublic:Boolean,
	surveyTemplate:[Field],
	createDate:Date
});

// Get validation helper for the User model, in order to validate the user IDs received with the request.
var ValidationHelper = idValidation.getValidationHelperModel('User');
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
		
		// Generate a validation helper object from the received model.
		var helper = new ValidationHelper({userIds: userIds});
		
		// Performa validation of the received array of user IDs.
		helper.validate(function(err){
			if (err)
			{
				console.log("User ID validation error");
				console.log(err.errors);
				callback("At least one invalid User ID detected");
				return;
			}
			
			// Reaching here means that the validation passed successfully. Update the required survey.
			SurveyModel.update({_id:surveyId, ownerIds:{"$in":[session.userId]}}, 
												 {$set: { allowedUsers:userIds.map(function(o){return mongoose.Types.ObjectId(o);}) }},
												 callback);
		});
	},
	getSurveyByOwnerId: function(id,filter,callback) {
		filter.ownerIds={ $in:[mongoose.Types.ObjectId(id)]};
		console.log(filter);
		SurveyModel.find(filter).
			exec(callback);
	},
	// Gets surveys a user is allowed to submit answers to.
	getSurveyByAllowedId: function(id,filter,callback) {
		filter.allowedUsers={ $in: [mongoose.Types.ObjectId(id)] };
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

/*TEST*/