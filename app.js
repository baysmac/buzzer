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

// Admin routes
app.get('/admin', pass.ensureAuthenticated, pass.ensureAdmin(), admin.index);
app.get('/admin/quiz/add', pass.ensureAuthenticated, pass.ensureAdmin(), admin.addQuiz);
app.get('/admin/quiz/edit/:id', pass.ensureAuthenticated, pass.ensureAdmin(), admin.editQuiz);

app.post('/admin/quiz/:quizId/rounds', admin.addRound);
app.put('/admin/quiz/:quizId/rounds/:id', admin.editRound);
app.delete('/admin/quiz/:quizId/rounds/:id', admin.deleteRound);

app.post('/admin/quiz/:quizId/rounds/:roundId/questions', admin.addQuestion);
app.put('/admin/quiz/:quizId/rounds/:roundId/questions/:id', admin.editQuestion);
app.delete('/admin/quiz/:quizId/rounds/:roundId/questions/:id', admin.deleteQuestion);

var server = require('http').createServer(app)
  , io = require('socket.io').listen(server);

server.listen(3000, function() {
  console.log('Express server listening on port ' + app.get('port'));
});

io.sockets.on('connection', function (socket) {
    socket.on('message', function (msg) {
        socket.broadcast.emit('message', msg);
    });
});