var passport = require('passport');
var User = require('./models/user');
var router = require('express').Router();
var Survey = require('./models/survey');

router.post('/register', function(req, res, next) {
  console.log('registering user');
  User.register(new User({ username: req.body.username, email: req.body.email }), req.body.password, function(err, data) {
    if (err) { console.log('error while user register!', err); res.json(err); }
    var result = {id : data._id};
    console.log('user registered!');

    res.json(result);
  });
});

router.post('/login', passport.authenticate('local'), function(req, res) {
    console.log('login user');
    var result = {id : res.req.user._id};
    console.log('user logged in!');
    res.json(result);
});


router.post('/survey/new', function(req, res) {
    console.log('creating new survey');
    var result = Survey.saveSurvey(req,res,function(err,data){
      if(err)res.json(err);
        console.log('survey created'); 
    });

});

module.exports = router;