var flash = require('connect-flash')
  , passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy
  , db = require('../config/db')
  , fs = require('fs')
  , im = require('imagemagick')
  
exports.index = function(req, res) {
	db.Quiz.find().exec(function(err, foundQuizzes) {
		if (err) return handleError(err);
		res.render('admin/index', { title: 'Dashboard', user: req.user, quizzes: foundQuizzes, successMessage: req.flash('success') });		
	});		
};
  
exports.console = function(req, res) {
	db.Quiz.findOne({ _id: req.route.params.id }, function(err, foundQuiz) {
		if (err) { return next(err) };
		if(foundQuiz) {
			res.render('admin/console', { title: foundQuiz.title, user: req.user, quiz: foundQuiz });			
		} else {
			return res.redirect('/admin');					
		}
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
				res.render('admin/quiz-edit', { title: 'Edit Quiz', user: req.user, quiz: foundQuiz, successMessage: req.flash('success') });			
			});		
		} else {
			return res.redirect('/admin');					
		}
	});	
};

exports.editQuizSubmit = function(req, res) {
	db.Quiz.findOne({ _id: req.route.params.id }, function(err, foundQuiz) {
		foundQuiz.title = req.body.title;
		foundQuiz.save(function(err) {
		  	req.flash('success', '\'' + foundQuiz.title + '\' was edited successfully');
			return res.redirect('/admin');		
		});
	});	
};

exports.addRound = function(req, res, next) {
	db.Quiz.findOne({ _id: req.params.quizId }, function(err, foundQuiz) {
		var round = foundQuiz.rounds.create();
		foundQuiz.rounds.push(round);
		foundQuiz.save(function(err) {
		  	req.flash('success', 'Round added successfully');
		  	return res.redirect('/admin/quiz/edit/' + req.params.quizId);	
		});
	});
};

exports.editRound = function(req, res, next) {
	db.Quiz.findOne({ _id: req.params.quizId }, function(err, foundQuiz) {
		if (err) { return next(err) };
		var foundRound = foundQuiz.rounds.id(req.params.id);
		if(foundRound) {
			res.render('admin/round-edit', { title: 'Edit Round', user: req.user, quiz: foundQuiz, round: foundRound, successMessage: req.flash('success') });		
		} else {
		  	return res.redirect('/admin/quiz/edit/' + req.params.quizId);					
		}
	});
};

exports.editRoundSubmit = function(req, res, next) {
	db.Quiz.findOne({ _id: req.route.params.quizId }, function(err, foundQuiz) {
		if (err) { return next(err) };
		var foundRound = foundQuiz.rounds.id(req.params.id);
		foundRound.title = req.body.title;
		foundQuiz.save(function(err) {
		  	req.flash('success', '\'' + foundRound.title + '\' was edited successfully');
		  	return res.redirect('/admin/quiz/edit/' + req.params.quizId);	
		});
	});	
};

exports.deleteRound = function(req, res, next) {
	db.Quiz.findOne({ _id: req.params.quizId }, function(err, foundQuiz) {
		foundQuiz.rounds.id(req.params.id).remove();
		foundQuiz.save(function(err) {
		  	req.flash('success', 'Round deleted successfully');
		  	return res.redirect('/admin/quiz/edit/' + req.params.quizId);	
		});
	});
};

exports.addQuestion = function(req, res, next) {
	db.Quiz.findOne({ _id: req.params.quizId }, function(err, foundQuiz) {
		var round = foundQuiz.rounds.id(req.params.roundId),
		question = round.questions.create();
		round.questions.push(question);
		foundQuiz.save(function(err) {
		  	req.flash('success', 'Question added successfully');
		  	return res.redirect('/admin/quiz/edit/' + req.params.quizId + '/round/edit/' + req.params.roundId);	
		});
	});
};

exports.editQuestion = function(req, res, next) {
	db.Quiz.findOne({ _id: req.params.quizId }, function(err, foundQuiz) {
		if (err) { return next(err) };
		var foundRound = foundQuiz.rounds.id(req.params.roundId), 
		foundQuestion = foundRound.questions.id(req.params.id);
		if(foundQuestion) {
			res.render('admin/question-edit', { title: 'Edit Question', user: req.user, quiz: foundQuiz, round: foundRound, question: foundQuestion, successMessage: req.flash('success') });		
		} else {
		  	return res.redirect('/admin/quiz/edit/' + req.params.quizId + '/round/edit/' + req.params.roundId);					
		}
	});
};

exports.editQuestionSubmit = function(req, res, next) {
	db.Quiz.findOne({ _id: req.route.params.quizId }, function(err, foundQuiz) {
		if (err) { return next(err) };
		var foundRound = foundQuiz.rounds.id(req.params.roundId), 
		foundQuestion = foundRound.questions.id(req.params.id);
		foundQuestion.type = req.body.type;
		foundQuestion.answer = req.body.answer;
		foundQuestion.timeInSeconds = req.body.timeInSeconds;
		foundQuestion.points = req.body.points;
		foundQuestion.displayOrder = req.body.displayOrder;
		if(foundQuestion.type == 'text') {
			foundQuestion.questionText = req.body.question;	
			foundQuestion.image = '';	
			foundQuestion.answerSupportingImage = '';
			imageUploaded = true;
			answerImageUploaded = true;	
			saveQuiz(req, res, next, foundQuiz);
		}
		else {
			foundQuestion.questionText = '';	
			if(req.files.image.name && req.files.answerSupportingImage.name) {
				uploadImage(req.files.image, function(newPath) {
					foundQuestion.image = newPath;
					uploadImage(req.files.answerSupportingImage, function(newPath) {
						foundQuestion.answerSupportingImage = newPath;
						saveQuiz(req, res, next, foundQuiz);
					});
				});
			} else if(req.files.image.name) {
				uploadImage(req.files.image, function(newPath) {
					foundQuestion.image = newPath;
					saveQuiz(req, res, next, foundQuiz);
				});
			} else if(req.files.answerSupportingImage.name) {
				uploadImage(req.files.answerSupportingImage, function(newPath) {
					foundQuestion.answerSupportingImage = newPath;
					saveQuiz(req, res, next, foundQuiz);
				});
			} else {
				saveQuiz(req, res, next, foundQuiz);
			}		
		}
	});
};

var saveQuiz = function(req, res, next, quiz) {
	quiz.save(function(err) {
		req.flash('success', 'Question was edited successfully');
		res.redirect('/admin/quiz/edit/' + req.params.quizId + '/round/edit/' + req.params.roundId);	
	});
}

var uploadImage = function(image, callback) {
	fs.readFile(image.path, function (err, data) {
		if(image.name) {
			var newPath = '/images/uploads/fullsize/' + image.name 
				thumbPath = '/images/uploads/thumbs/' + image.name, 
				root = require('path').dirname(require.main.filename) + '/public';
				
			fs.writeFile(root + newPath, data, function (err) {
			 	im.resize({
			 		srcPath: root + newPath,
			 		dstPath: root + thumbPath,
			 		width:   200
			 	}, function(err, stdout, stderr) {
			 		if (err) throw err;
				});
				if (callback && typeof(callback) == 'function') {
					callback(newPath);
				}
			});
		}
	});
}

exports.deleteQuestion = function(req, res, next) {
	db.Quiz.findOne({ _id: req.params.quizId }, function(err, foundQuiz) {
		if (err) { return next(err) };
		var foundRound = foundQuiz.rounds.id(req.params.roundId);		 
		foundRound.questions.id(req.params.id).remove();
		foundQuiz.save(function(err) {
		  	req.flash('success', 'Question deleted successfully');
		  	return res.redirect('/admin/quiz/edit/' + req.params.quizId + '/round/edit/' + req.params.roundId);		
		});
	});
}

exports.toggleQuizActive = function(req, res) {
	db.Quiz.findOne({ _id: req.route.params.quizId }, function(err, foundQuiz) {
		foundQuiz.active = req.route.params.activeFlag;
		foundQuiz.save(function(err) {
			return res.json({
				message: '1'
			});			
		});
	});	
};

exports.hostQuiz = function(req, res) {
	db.Quiz.findOne({ _id: req.route.params.id }, function(err, foundQuiz) {
		if (err) { return next(err) };
		if(foundQuiz) {
			res.render('admin/quiz-host', { title: foundQuiz.title, user: req.user, quiz: foundQuiz });			
		} else {
			return res.redirect('/admin');					
		}
	});	
};

exports.getRounds = function(req, res, next) {
	db.Quiz.findOne({ _id: req.params.quizId }, function(err, foundQuiz) {
		var result = foundQuiz.rounds;
		return res.json(result);
	});
};

exports.getNextRound = function(req, res, next) {
	db.Quiz.findOne({ _id: req.params.quizId }, function(err, foundQuiz) {
		var result = { message: '-1' };
		
		for(var i=0; i < foundQuiz.rounds.length;i++){
			if(foundQuiz.rounds[i].displayOrder == req.params.displayOrder){
				result = foundQuiz.rounds[i];
			}		
		}
		return res.json(result);	
		
	});
};

exports.getNextQuestion = function(req, res, next) {
	db.Quiz.findOne({ _id: req.params.quizId }, function(err, foundQuiz) {
		var round = foundQuiz.rounds.id(req.params.roundId),  
		result = { message: '-1' };		
		for(var i=0; i < round.questions.length;i++){
			if(round.questions[i].displayOrder == req.params.displayOrder){
				result = round.questions[i];
			}		
		}			
		return res.json(result);	
		
	});
};