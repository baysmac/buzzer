var quizId, 
	pubnub, 
	teamName,
	scoreSheet = [];

$(function() {	
	quizId = $('#quiz-id').val();
	teamName = $('#team-username').val();
	playQuiz.init();   
});

var playQuiz = {
	$body: $('body'), 
	$container: $('main[role=main]'), 
	currentRound: null, 
	currentQuestion: null, 
	init: function() {
		var self = this;
		self.setUpChannel();	
		self.setUpAnswerForm();
		self.getRounds();
	}, 
	setUpChannel: function() {
		var self = this;
		
		pubnub = PUBNUB.init({
			publish_key: 'pub-c-05acf469-af6d-47ad-8387-0d34d02d0d6e',
			subscribe_key: 'sub-c-80adaa22-b46b-11e3-890f-02ee2ddab7fe'
		});
		
		pubnub.subscribe({
			channel: quizId,
			callback: function (message) {
				if(message.type == 2 && message.round) {
					self.displayRound(message.round);
				}
				if(message.type == 3 && message.question) {
					self.displayQuestion(message.question);					
				}
				if(message.type == 4 && message.answer) {
					self.checkAnswer(message.answer);
				}
				if(message.type == 5 && message.teams) {
					self.displayFinalScore(message.teams);
				}
			}, 
			connect: function() {
				pubnub.publish({
					channel: quizId, 
					message: {
						type: 1, 
						teamName: teamName
					}
				});
			}
		});
	}, 
	setUpAnswerForm: function() {
		var self = this;
		
		self.$container.on('submit', 'form#question-answer', function(e) {
			var answer = '';
			
			if($('input[name=options]').length > 0) {
				answer = $(this).find('input[name=options]:checked').val();
				$('input[name=options]').prop('disabled', true);
			}
			else {
				answer = $(this).find('input[type=text]').val();
				$(this).find('input[type=text]').prop('disabled', true);
			}
			
			self.submitAnswer(answer);
			
			$(this).find('input[type=submit]').fadeOut(250);
			e.preventDefault();
		});
	},
	getRounds: function() {
		var self = this;
		$.ajax({
			type: 'GET',
	        url: '/admin/quiz/' + quizId + '/rounds',						
	        success: function(data) {
	        	self.chooseDoubleRoundDisplay(data);
	        }
	    }); 	
	}, 
	chooseDoubleRoundDisplay: function(rounds) {
		var self = this;
		html = new EJS({url: '/partials/round-display.ejs'}).render({ rounds: rounds });
		self.$container.html(html);
		
		self.$container.on('submit', 'form#double-points', function(e) {
			var $this = $(this), 
				chosenRound = $this.find('input[type=radio]:checked').val();
				
			pubnub.publish({
				channel: quizId, 
				message: {
					type: 6, 
					teamName: teamName, 
					doublePointsRoundId: chosenRound
				}
			});
			
			self.wait();
			
			e.preventDefault();
		});
				
	}, 
	wait: function() {
		var self = this;
		html = new EJS({url: '/partials/waiting.ejs'}).render();
		self.$container.html(html);
	}, 
	displayRound: function(round) {
		var self = this, 
		html = new EJS({url: '/partials/round.ejs'}).render({ round: round });
		self.$body.removeClass('incorrect correct');
		self.$container.html(html);
	}, 
	displayQuestion: function(question) {
		var self = this,
		html = new EJS({url: '/partials/question.ejs'}).render({ question: question, withInput: true });
		self.$body.removeClass('incorrect correct');
		self.$container.html(html);	
		scoreSheet.push(question);	
	}, 
	submitAnswer: function(answer) {
		var self = this;
		
		scoreSheet[scoreSheet.length-1].submittedAnswer = answer;
		
		pubnub.publish({
			channel: quizId, 
			message: {
				type: 2, 
				teamName: teamName, 
				answer: answer
			}
		});
		
	}, 
	checkAnswer: function(answer) {
		var self = this, 
		currentQuestion = scoreSheet[scoreSheet.length-1], 
		answers = [$.trim(answer.toLowerCase())], 
		answer = '';
		
		if(currentQuestion.submittedAnswer) {
			answer = $.trim(currentQuestion.submittedAnswer.toLowerCase());
		}
		
		var results = fuzzy.filter(answer, answers), 
		matches = results.map(function(el) { return el.string; });
		if(currentQuestion.submittedAnswer) {
			if(matches.length == 1) {
				self.$body.removeClass('incorrect').addClass('correct');
				currentQuestion.correct = true;
				self.$container.html('<h1>Question ' + (currentQuestion.displayOrder+1) + '</h1><p class="highlight">Horray!<br/>Correct answer!</p>');
			}
			else {
				self.$body.addClass('incorrect').removeClass('correct');
				currentQuestion.correct = false;
				self.$container.html('<h1>Question ' + (currentQuestion.displayOrder+1) + '</h1><p class="highlight">Oops!<br/>Sorry, wrong answer!</p>');
			}
		}
		else {
			self.$body.addClass('incorrect').removeClass('correct');
			currentQuestion.correct = false;				
			self.$container.html('<h1>Question ' + (currentQuestion.displayOrder+1) + '</h1><p class="highlight">Oops!<br/>Sorry, wrong answer!</p>');
		}
	}, 
	displayFinalScore: function(teams) {
		var self = this;
		for(var i = 0; i < teams.length; i++) {
			if(teams[i].name == teamName) {				
				self.$container.html('<h1>You came ' + positionSuffix(teams[i].position) + '!</h1><p class="highlight">In total you scored ' + teams[i].score + ' points. Awesome.</p>');
			}
		}
	}
}

function positionSuffix(number) {
	if(number> 3 && number<21) return number+'th';
    var suffix= number%10;
    switch(suffix){
        case 1:return number+'st';
        case 2:return number+'nd';
        case 3:return number+'rd';
        default:return number+'th';
    }
}