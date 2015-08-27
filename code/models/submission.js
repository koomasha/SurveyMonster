var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var Submission = new Schema({
    userId: String,
    surveyId: Date,
    submitDetails: [],
    date: Date
});

var SubmissionModel = mongoose.model('Submission', Submission);

module.exports = {
	
	submit: 
		function(submission, callback) {
			//submission.userId = session ? session.userId : null;
			submission.date = new Date();
			var result = new SubmissionModel(submission);
			result.save(callback);
		},
	
	getSubmissionsBySurvey: 
		function(surveyId, filter, callback) {
			filter.surveyId = surveyId;
			console.log(filter);
			SubmissionModel.find(filter).exec(callback);
		}
};
