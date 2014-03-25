var flash = require('connect-flash')
  , passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy
  , db = require('../config/db');

exports.index = function(req, res) {
	res.render('index', { title: '', user: req.user });	
}; 

exports.login = function(req, res) {
	res.render('login', { title: 'Login', user: req.user, message: req.flash('error') });	
}; 

exports.loginSubmit = function(req, res, next) {
	passport.authenticate('local', function(err, user, info) {
		if (err) { return next(err); }
		if (!user) {
		  req.flash('error', [info.message]);			
		  return res.redirect('/login');
		}
		req.logIn(user, function(err) {
		  if (err) { return next(err); }  
		  if(user.admin) {
		  	return res.redirect('/admin');
		  } {
		  	return res.redirect('/');
		  }
		});
	})(req, res, next);
};

exports.logout = function(req, res){
	req.logout();
	res.redirect('/login');
};

exports.register = function(req, res, next) {
	var user = new db.User({
		username: req.body.register_username, 
		password: req.body.register_password
	});
	user.save(function(err) {
		if (err) { 
			return next(err)
		} else {
			req.login(user, function(err) {
			  if (err) { return next(err); }  
			  return res.redirect('/');
			});
		}		
	});
};