var flash = require('connect-flash')
  , express = require('express') 
  , app = express()
  , db = require('./config/db')
  , pass = require('./config/pass')
  , passport = require('passport')
  , routes = require('./routes')
  , admin = require('./routes/admin')
  , http = require('http')
  , path = require('path');

app.configure(function() {
	app.use(flash());
	app.set('port', process.env.PORT || 3000);
	app.set('views', __dirname + '/views');
	app.set('view engine', 'ejs');
	app.engine('ejs', require('ejs-locals'));
	app.use(express.logger());
	app.use(express.cookieParser());
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	app.use(express.cookieParser());
	app.use(express.session({ secret: 'ben macgowan' }));
	app.use(passport.initialize());
	app.use(passport.session());
	app.use(app.router);	
	app.use(express.static(path.join(__dirname, 'public')));
	app.use('/partials', express.static(__dirname + '/views/partials'));
});

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

// Basic routes
app.get('/', pass.ensureAuthenticated, routes.index);

// User routes
app.get('/login', routes.login);
app.post('/login', routes.loginSubmit);
app.post('/register', routes.register);
app.get('/logout', routes.logout);

app.get('/play/:id', pass.ensureAuthenticated, routes.play);

// Admin routes
app.get('/admin', pass.ensureAuthenticated, pass.ensureAdmin(), admin.index);
app.get('/admin/quiz/add', pass.ensureAuthenticated, pass.ensureAdmin(), admin.addQuiz);
app.get('/admin/quiz/edit/:id', pass.ensureAuthenticated, pass.ensureAdmin(), admin.editQuiz);
app.post('/admin/quiz/edit/:id', pass.ensureAuthenticated, pass.ensureAdmin(), admin.editQuizSubmit);
app.get('/admin/quiz/host/:id', pass.ensureAuthenticated, pass.ensureAdmin(), admin.hostQuiz);
app.get('/admin/quiz/console/:id', pass.ensureAuthenticated, pass.ensureAdmin(), admin.console);
app.post('/admin/quiz/:quizId/activate/:activeFlag', admin.toggleQuizActive);

app.get('/admin/quiz/:quizId/round/add', pass.ensureAuthenticated, pass.ensureAdmin(), admin.addRound);
app.get('/admin/quiz/edit/:quizId/round/edit/:id', pass.ensureAuthenticated, pass.ensureAdmin(), admin.editRound);
app.post('/admin/quiz/edit/:quizId/round/edit/:id', pass.ensureAuthenticated, pass.ensureAdmin(), admin.editRoundSubmit);
app.get('/admin/quiz/edit/:quizId/round/delete/:id', pass.ensureAuthenticated, pass.ensureAdmin(), admin.deleteRound);

app.get('/admin/quiz/:quizId/rounds', admin.getRounds);
app.get('/admin/quiz/:quizId/rounds/next/:displayOrder', admin.getNextRound);

app.get('/admin/quiz/:quizId/round/edit/:roundId/question/add', pass.ensureAuthenticated, pass.ensureAdmin(), admin.addQuestion);
app.get('/admin/quiz/edit/:quizId/round/edit/:roundId/question/edit/:id', pass.ensureAuthenticated, pass.ensureAdmin(), admin.editQuestion);
app.post('/admin/quiz/edit/:quizId/round/edit/:roundId/question/edit/:id', pass.ensureAuthenticated, pass.ensureAdmin(), admin.editQuestionSubmit);
app.get('/admin/quiz/edit/:quizId/round/edit/:roundId/question/delete/:id', pass.ensureAuthenticated, pass.ensureAdmin(), admin.deleteQuestion);

app.get('/admin/quiz/:quizId/rounds/:roundId/questions/next/:displayOrder', admin.getNextQuestion);

var server = require('http').createServer(app);

server.listen(3000, function() {
  console.log('Express server listening on port ' + app.get('port'));
});