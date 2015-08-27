var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var Survey = new Schema({
    subject: String,
    expiryDate: Date,
    creatorId: String,
    ownerIds:[],
    allowedUsers:[],
    isPublic:Boolean,
    surveyTemplate:Array,
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
};

/*TEST*/