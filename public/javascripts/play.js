var quizId, 
	pubnub, 
	teamName,
	scoreSheet = [];

$(function() {	
	quizId = $('#quiz-id').val();
	teamName = $('footer[role=contentinfo] p em').html();
	playQuiz.init();   
});

var playQuiz = {
	$container: $('section#quiz'), 
	currentRound: null, 
	currentQuestion: null, 
	init: function() {
		var self = this;
		self.setUpChannel();	
		self.setUpAnswerForm();
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
				if(message.type == 2 && message.question) {
					self.displayQuestion(message.question);					
				}
				if(message.type == 3 && message.answer) {
					self.checkAnswer(message.answer);
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
		
		self.$container.on('submit', 'form', function(e) {
			var answer = $(this).find('input[type=text]').val();
			self.submitAnswer(answer);
			$(this).hide();
			e.preventDefault();
		});
	}, 
	displayQuestion: function(question) {
		var self = this,
		html = new EJS({url: '/partials/question.ejs'}).render({ question: question, withInput: true });
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
		currentQuestion = scoreSheet[scoreSheet.length-1];
		if(answer.toLowerCase() == currentQuestion.submittedAnswer.toLowerCase()) {
			currentQuestion.correct = true;
			self.$container.html('<p>Correct!</p>');
		}
		else {
			currentQuestion.correct = false;
			self.$container.html('<p>Wrong!</p>');
		}
	}
}