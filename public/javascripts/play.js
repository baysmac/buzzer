var quizId, 
pubnub;

$(function() {	
	quizId = $('#quiz-id').val();
	playQuiz.init();   
});

var playQuiz = {
	$container: $('section#quiz'), 
	currentRound: null, 
	currentQuestion: null, 
	init: function() {
		var self = this;
		self.setUpChannel();	
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
			}, 
			connect: function() {
				pubnub.publish({
					channel: quizId, 
					message: {
						type: 1, 
						teamName: $('footer[role=contentinfo] p em').html()
					}
				});
			}
		});
	}, 
	displayQuestion: function(question) {
		var self = this,
		html = new EJS({url: '/partials/question.ejs'}).render({ question: question });
		self.$container.html(html);		
	}
}