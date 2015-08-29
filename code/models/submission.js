var mongoose = require('mongoose'),
    Schema = mongoose.Schema;
var Survey = require('./survey');

var Submission = new Schema({
    userId: String,
    surveyId: String,
    answers: [String],
    date: Date
});

var SubmissionModel = mongoose.model('Submission', Submission);

module.exports = {
	submit: function(session, submission, callback) {
			console.log(JSON.stringify(submission));
		if(!submission.surveyId && typeof submission.surveyId !== "String")
			callback("Missing or invalid surveyId");
		if(!submission.answers && Array.isArray(submission.answers))
			callback("Missing or invalid answers");
		else
		{
			var filter = {};
			if(session && session.userId)
				filter= {"$or":[{isPublic:true},{allowedUsers:{"$in":[session.userId]}}]};
			else
				filter= {isPublic:true};
			filter._id= mongoose.Types.ObjectId(submission.surveyId); 
			Survey.findOne(filter,function(err,survey){

				if(err)
				{
					callback(err);
					return;
				}

				//Check Answers
				var temp = survey.surveyTemplate;
				var ans = submission.answers;
				if(temp.length != ans.length)
				{
					callback("Wrong number of answers");
					return;
				}

				for(var i = 0;i<temp.length;i++)
					if(!temp[i].other && temp[i].answers.indexOf(ans[i]) == -1)
					{
						callback("Not valid answer for question \"" + temp[i].question + "\"");
						return;
					}

				submission.userId = session && session.userId ? session.userId : null;
				submission.date = new Date();
				if(submission.userId)
				{
					SubmissionModel.update({surveyId:submission.surveyId,userId:submission.userId},
						submission,{upsert:true},callback);
				}
				else
				{
					var result = new SubmissionModel(submission);
					result.save(callback);
				}
			});
		}
	},	
	getSubmissionsBySurvey: function(surveyId, callback) {
    console.log({name:'getSubmissionsBySurvey',surveyId:surveyId});
		SubmissionModel.find({surveyId:surveyId}).exec(callback);
	},
	// This function is for internal use only and will not be exposed via a url in routes.js.
	// It is assumed that the calling context already has an active session, 
	// and that the function is called while deleting a survey by an authorized user.
	deleteSubmissionsBySurvey: function(surveyId, callback) {
		console.log({name:'deleteSubmissionsBySurvey', surveyId:surveyId});
		SubmissionModel.find({surveyId:surveyId}).remove().exec(callback);
	}
};
