var mongodb = require('mongodb') 
  , mongoose = require('mongoose')
  , bcrypt = require('bcrypt')
  , SALT_WORK_FACTOR = 10;
  
mongoose.connect('mongodb://localhost/buzzer');

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback () {
  console.log('Connected to DB');
});

/* Users / Teams */

var userSchema = mongoose.Schema({
	username: { type: String, required: true, unique: true }, 
	password: { type: String, required: true }, 
	admin: { type: Boolean, default: false }
});

userSchema.pre('save', function(next) {
	var user = this;
	if(!user.isModified('password')) return next();
	
	bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
		if(err) return next(err);

		bcrypt.hash(user.password, salt, function(err, hash) {
			if(err) return next(err);
			user.password = hash;
			next();
		});
	});
});

userSchema.methods.comparePassword = function(candidatePassword, cb) {
	bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
		if(err) return cb(err);
		cb(null, isMatch);
	});
};

var User = mongoose.model('User', userSchema);
exports.User = User;

/* Questions */

var questionSchema = mongoose.Schema({
	type: { type: String, default: 'text' }, 
	questionText: { type: String, default: 'Question' }, 
	image: { type: String, default: '' }, 
	answer: { type: String, default: 'Answer' }, 
	answerSupportingImage: { type: String, default: '' }, 
	points: { type: Number, default: 1 }, 
	timeInSeconds: { type: Number, default: 10 }, 
	displayOrder: { type: Number, default: 0 }
});

var Question = mongoose.model('Question', questionSchema);
exports.Question = Question;

/* Rounds */

var roundSchema = mongoose.Schema({
	title: { type: String, default: 'New round' }, 
	displayOrder: { type: Number, default: 0 }, 
	questions: [questionSchema]
});

var Round = mongoose.model('Round', roundSchema);
exports.Round = Round;

/* Quizzes */

var quizSchema = mongoose.Schema({
	title: { type: String, required: true, default: 'New quiz' }, 
	rounds: [roundSchema], 
	active: { type: Boolean, default: false }
});

var Quiz = mongoose.model('Quiz', quizSchema);
exports.Quiz = Quiz;