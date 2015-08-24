var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var Survey = new Schema({
    subject: String,
    expiryDate: Date,
    creatorId: String,
    ownerIds:[],
    allowedUsers:[],
    isPublic:Boolean,
    surveyTemplate:Array
});

var SurveyModel = mongoose.model('Survey', Survey);

module.exports = {
	saveSurvey: function(req,res) {
		var subject = req.body.subject;
		var expiryDate = req.body.expiryDate;
		var creatorId = req.body.creatorId;
		var ownerIds = req.body.ownerIds;
		if(!ownerIds) ownerIds = [];
		ownerIds.push(creatorId);
		var allowedUsers = req.body.allowedUsers;
		var isPublic = req.body.isPublic;
		var surveyTemplate = req.body.surveyTemplate

		var result = new SurveyModel({subject: subject, expiryDate: expiryDate, creatorId: creatorId, ownerIds: ownerIds, allowedUsers: allowedUsers, isPublic: isPublic});
    	result.save(function(err,data){
      		if(err){res.json(err);}
      		res.json(data);
    	});
	}
};