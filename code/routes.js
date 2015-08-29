var passport = require('passport');
var User = require('./models/user');
var router = require('express').Router();
var Survey = require('./models/survey');
var Session = require('./models/session');
var Submission = require('./models/submission');
var mongoose = require('mongoose');

var callbackFunc = function(res)
{
  return function(err,data){
    console.log('callbackFunc');
    console.log(err);
    console.log(data);
    if (err) 
      res.json({success:false,error:err});
    else
		  res.json({success:true,data:data});
  };
}

var checkToken = function(usersOnly)
{
  return function(req,res,next){
    var token = req.headers.token;
    req._session = {};
    if( token && typeof token  === "string")
      Session.get(token,function(err,data)
      {
          if(!err)
            req._session = data;
          else
            console.log(err);

          if(!usersOnly ||(data !== null && data.userId !== null))
            next();
          else
            res.json({success:false,error:"invalid token."});
      });
    else if(!usersOnly)
      next();
    else
      res.json({success:false,error:"token required."});
  };
}

router.post('/register', function(req, res, next) {
  console.log('registering user');
  User.register(new User({ username: req.body.username, 
  												 password: req.body.password, 
  												 email: req.body.email }), req.body.password, function(err, data) {
    if (err) { console.log('error while user register!', err); res.json(err); }
    Session.add(data._id,callbackFunc(res));
    console.log('user registered!');
  });
});

router.post('/login', passport.authenticate('local'), function(req, res) {
  console.log('login');
    Session.add(res.req.user._id,callbackFunc(res));
});


router.post('/logout', //checkToken(true), 
  function(req, res) {
    Session.remove(req.headers.token,callbackFunc(res));
});

router.post('/survey/new',checkToken(true), function(req, res) {
    var result = Survey.saveSurvey(req._session,req.body,callbackFunc(res));
});

router.post('/survey/delete',checkToken(true),function(req, res) {
	 	if(!mongoose.Types.ObjectId.isValid(req.body.surveyId))
    	callbackFunc(res)("invalid surveyId arrived with the request.");
    	
    Survey.deleteSurvey(req._session, req.body.surveyId, function(err, data) {
			if (!data)
			{
				console.log('Delete survey: Failed.');
				callbackFunc(res)("Failed deleting survey. Will not proceed to delete submissions");
			}
			else
			{
				console.log('Delete survey: Success!');
				console.log('Deleting associated submissions...');
				Submission.deleteSubmissionsBySurvey(req.body.surveyId, callbackFunc(res));
			}
		});		
});

router.post('/survey/search/owner',checkToken(true), function(req, res) {
    Survey.getSurveyByOwnerId(req._session.userId,req.body,callbackFunc(res));
});

router.post('/survey/search/allowed',checkToken(true), function(req, res) {
    Survey.getSurveyByAllowedId(req._session.userId,req.body,callbackFunc(res));
});

router.post('/survey/search/public',checkToken(false), function(req, res) {
    Survey.getPublicSurvey(req.body,callbackFunc(res));
});

router.post('/survey/results',checkToken(true), function(req, res) {
  if(!mongoose.Types.ObjectId.isValid(req.body.surveyId))
    callbackFunc(res)("invalid surveyId");
  else
    Survey.getSurveyByOwnerId(req._session.userId,{_id:mongoose.Types.ObjectId(req.body.surveyId)},function(err,data)
    {
       console.log({name:'getSurveyByOwnerId',err:err,data:data});
      if(!err && data[0])
  		  Submission.getSubmissionsBySurvey(data[0]._id, callbackFunc(res));
      else
        callbackFunc(res)("invalid surveyId");

    });
});

router.post('/survey/submit', checkToken(false), function(req, res) {
		Submission.submit(req._session,req.body, callbackFunc(res));
});

module.exports = router;