var quizId, 
pubnub;

$(function() {	
	quizId = $('#quiz-id').val();
	console.init();   	 
});

var console = {
	$log: $('ul#log'), 
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
				self.$log.append('<li>' + JSON.stringify(message) + '</li>');
			}
		});
	}
}