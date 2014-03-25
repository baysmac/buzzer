var flash = require('connect-flash')
  , passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy
  , db = require('../config/db');
  
exports.index = function(req, res) {
	db.Quiz.find().exec(function(err, foundQuizzes) {
		if (err) return handleError(err);
		res.render('admin/index', { title: 'Dashboard', user: req.user, quizzes: foundQuizzes });		
	});		
};

exports.addQuiz = function(req, res) {
	var quiz = new db.Quiz({
		title: 'Quiz'
	});
	quiz.save();	
	return res.redirect('/admin/quiz/edit/' + quiz._id);
};

exports.editQuiz = function(req, res) {	
	db.Quiz.findOne({ _id: req.route.params.id }, function(err, foundQuiz) {
		if (err) { return next(err) };
		if(foundQuiz) {
			db.Round.find({ quizId: new RegExp(foundQuiz._id, "i")}).sort('displayOrder').exec(function(err, foundRounds) {
				if (err) return handleError(err);
				res.render('admin/quiz-edit', { title: 'Edit Quiz', user: req.user, quiz: foundQuiz });			
			});		
		} else {
			return res.redirect('/admin');					
		}
	});	
};

exports.addRound = function(req, res, next) {
	db.Quiz.findOne({ _id: req.params.quizId }, function(err, foundQuiz) {
		var round = foundQuiz.rounds.create();
		foundQuiz.rounds.push(round);
		foundQuiz.save(function(err) {
			return res.json(round);			
		});
	});
};

exports.editRound = function(req, res, next) {
	db.Quiz.findOne({ _id: req.params.quizId }, function(err, foundQuiz) {
		var round = foundQuiz.rounds.id(req.params.id);
		round.title = req.body.title;
		foundQuiz.save(function(err) {
			return res.json(round);
		});
	});
};

exports.deleteRound = function(req, res, next) {
	db.Quiz.findOne({ _id: req.params.quizId }, function(err, foundQuiz) {
		foundQuiz.rounds.id(req.params.id).remove();
		foundQuiz.save(function(err) {
			return res.json({
				message: 'Deleted'
			})
		});
	});
}

exports.addQuestion = function(req, res, next) {
	db.Quiz.findOne({ _id: req.params.quizId }, function(err, foundQuiz) {
		var round = foundQuiz.rounds.id(req.params.roundId),
		question = round.questions.create();
		round.questions.push(round);
		foundQuiz.save(function(err) {
			return res.json(question);			
		});
	});
};

exports.editQuestion = function(req, res, next) {
/*
	db.Quiz.findOne({ _id: req.params.quizId }, function(err, foundQuiz) {
		var round = foundQuiz.rounds.id(req.params.id);
		round.title = req.body.title;
		foundQuiz.save(function(err) {
			return res.json(round);
		});
	});
*/
};

exports.deleteQuestion = function(req, res, next) {
	/*
db.Quiz.findOne({ _id: req.params.quizId }, function(err, foundQuiz) {
		foundQuiz.rounds.id(req.params.id).remove();
		foundQuiz.save(function(err) {
			return res.json({
				message: 'Deleted'
			})
		});
	});
*/
}