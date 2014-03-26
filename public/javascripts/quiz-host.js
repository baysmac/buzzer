var quizId, 
pubnub;

$(function() {	
	quizId = $('#quiz-id').val();
	hostQuiz.init();   	 
});

var hostQuiz = {
	$container: $('section#quiz'), 
	currentRound: null, 
	currentQuestion: null, 
	showingAnswer: false, 
	playingMembers: [],
	$teamList: $('ul#teams'), 
	init: function() {
		var self = this;
		self.setUpNavigation();	
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
				if(message.type == 1 && message.teamName) {
					self.addTeam(message.teamName);
				}
			},
			connect: function () {	
				$.ajax({
					type: 'POST',
			        url: '/admin/quiz/' + quizId + '/true',						
			        success: function(data) {
			        	console.log(data);
			        }
			    });
			}
		});
	}, 
	setUpNavigation: function() {
		var self = this;
		$('body').keyup(function(e){
			if(e.keyCode == 32){
				if(!self.currentRound) {					
					self.getNextRound(0);
				}
				else {
					if(!self.currentQuestion) {
						self.getNextQuestion(0);
					}
					else {
						if(!self.showingAnswer) {
							self.revealAnswer();
						}
						else {
							self.getNextQuestion(self.currentQuestion.displayOrder+1);
						}
					}
				}
				e.preventDefault();
			}
		});
	}, 
	finish: function() {
		var self = this;
		alert('finished');
	}, 
	getNextRound: function(displayOrder) {
		var self = this;
		$.ajax({
			type: 'GET',
	        url: '/admin/quiz/' + quizId + '/rounds/next/' + displayOrder,						
	        success: function(data) {
	        	if(data.message && data.message == '-1') {
	        		self.finish();
				}
	        	else {
					var html = new EJS({url: '/partials/round.ejs'}).render({ round: data });
		        	self.$container.html(html);
		        	self.currentRound = data;
	        	}
	        }
	    }); 		
	}, 
	getNextQuestion: function(displayOrder) {
		var self = this;
		$.ajax({
			type: 'GET',
	        url: '/admin/quiz/' + quizId + '/rounds/' + self.currentRound._id + '/questions/next/' + displayOrder,						
	        success: function(data) {
	        	if(data.message && data.message == '-1') {
	        		self.getNextRound(self.currentRound.displayOrder+1);
	        		self.currentQuestion = null;
				}
				else {
					var html = new EJS({url: '/partials/question.ejs'}).render({ question: data });
					self.$container.html(html);
					self.currentQuestion = data;	
		        	pubnub.publish({
			        	channel: quizId, 
			        	message: {
			        		type: 2, 
			        		question: data
			        	}
		        	});				
				}
				self.showingAnswer = false;	
	        }
	    }); 		
	}, 
	revealAnswer: function() {
		var self = this;
		self.$container.find('p.answer').show();
		self.showingAnswer = true;		
	}, 
	addTeam: function(teamName) {
		var self = this, 
		existingTeam = false;	
		console.log(self.playingMembers);
		for(var i = 0; i < self.playingMembers.length; i++) {
			console.log(self.playingMembers[i]);
			if(self.playingMembers[i] && self.playingMembers[i].name == teamName) {
				existingTeam = true;
				break;
			}
		}
		if(existingTeam == false) {
			var team = new Team(teamName);
			self.playingMembers.push(team);
			self.$teamList.append('<li>' + team.name + '</li>');
		}
	}
}


function Team(name) {
	this.name = name || "";
	this.currentScore = 0;
}