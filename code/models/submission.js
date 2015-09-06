var mongoose = require('mongoose'),
    Schema = mongoose.Schema;
var Survey = require('./survey');

var Submission = new Schema({
    userId: {type: Schema.Types.ObjectId, ref: 'User'},
    surveyId: {type: Schema.Types.ObjectId, ref: 'Survey'},
    answers: [String],
    date: Date
});

var SubmissionModel = mongoose.model('Submission', Submission);

module.exports = {
	// Adds a submission (answer for a given survey).
	submit: function(session, submission, callback) {
			console.log(JSON.stringify(submission));
		if(!submission.surveyId && typeof submission.surveyId !== "String")
			callback("Missing or invalid surveyId");
		if(!submission.answers && Array.isArray(submission.answers))
			callback("Missing or invalid answers");
		else
		{
			var filter = {};

			// Logged in users can submit answers to public surveys as well as to any survey that they are specifically allowed.
			if(session && session.userId)
				filter= {"$or":[{isPublic:true},{allowedUsers:{"$in":[session.userId]}}]};
			else // Guest users can only submit answers to public surveys.
				filter= {isPublic:true};
			filter._id= mongoose.Types.ObjectId(submission.surveyId); 
			Survey.findOne(filter,function(err,survey){

				if (!survey)
				{
					callback("Invalid Survey ID");
					return;
				}
				
				if (err)
				{
					callback(err);
					return;
				}

				// Check that the number of submitted answers matches the number of querstions in the survey.
				var temp = survey.surveyTemplate;
				var ans = submission.answers;
				if(temp.length != ans.length)
				{
					callback("Wrong number of answers");
					return;
				}

				// Check that the types of the anwers match the corresponding questions in the survey.
				for(var i = 0;i<temp.length;i++)
					if(!temp[i].other && temp[i].answers.indexOf(ans[i]) == -1)
					{
						callback("Not valid answer for question \"" + temp[i].question + "\"");
						return;
					}

				// If logged in user, set user ID in the submission.
				submission.userId = session && session.userId ? mongoose.Types.ObjectId(session.userId) : null;
				submission.date = new Date();
				if(submission.userId)
				{
					// If logged in user, perform an "upsert" query which either adds a new submission,
					// or updates an existing one if the user already submitted for this survey in the past.
					SubmissionModel.update({surveyId:submission.surveyId, 
											userId:submission.userId},
											submission,{upsert:true},callback);
				}
				else
				{
					// If guest user, add a submission to the survey. No user ID is specified for the submission.
					var result = new SubmissionModel(submission);
					result.save(callback);
				}
			});
		}
	},	
	// Gets all submissions associated with the specified survey.
	getSubmissionsBySurvey: function(surveyId, callback) {
    console.log({name:'getSubmissionsBySurvey',surveyId:surveyId});
		SubmissionModel.find({surveyId:surveyId}).exec(callback);
	},
	// This function is for internal use only and will not be exposed via a url in routes.js.
	// It is assumed that the calling context already has an active session, 
	// and that the function is called while deleting a survey by an authorized user.
	deleteSubmissionsBySurvey: function(surveyId, callback) {
		console.log({name:'deleteSubmissionsBySurvey', surveyId:surveyId});
		SubmissionModel.find({surveyId:mongoose.Types.ObjectId(surveyId)}).remove().exec(callback);
	}
};
