var quizId, 
pubnub;

$(function() {	
	quizId = $('#quiz-id').val();
	hostQuiz.init();   	 
});

var hostQuiz = {
	$container: $('div#content'), 
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
				else if(message.type == 2 && message.answer) {
					self.logAnswer(message.teamName, message.answer);
				}
			},
			connect: function () {	
				$.ajax({
					type: 'POST',
			        url: '/admin/quiz/' + quizId + '/true'
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
					var html = new EJS({url: '/partials/question.ejs'}).render({ question: data, withAnswer: true });
					self.$container.html(html);
					self.currentQuestion = data;						
					for(var i = 0; i < self.playingMembers.length; i++) {
						self.playingMembers[i].scoreSheet.push(data);
					}
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
		var self = this, 
		$answer = self.$container.find('p.answer'), 
		answerValue = $answer.html();
		$answer.show();
		self.showingAnswer = true;				
    	pubnub.publish({
        	channel: quizId, 
        	message: {
        		type: 3, 
        		answer: answerValue
        	}
    	});	
	}, 
	addTeam: function(teamName) {
		var self = this, 
		existingTeam = false;	
		for(var i = 0; i < self.playingMembers.length; i++) {
			if(self.playingMembers[i].name == teamName) {
				existingTeam = true;
				break;
			}
		}
		if(existingTeam == false) {
			var team = new Team(teamName);
			self.playingMembers.push(team);
			self.$teamList.append('<li><img src="http://lorempixel.com/81/61/people/" alt="' + team.name + '" /> <span class="team-name">' + team.name + '</span> <span class="score">0</span></li>');
		}
	}, 
	logAnswer: function(teamName, answer) {
		var self = this;
		for(var i = 0; i < self.playingMembers.length; i++) {
			if(self.playingMembers[i].name == teamName && !self.playingMembers[i].submittedAnswer) {
				self.playingMembers[i].scoreSheet[self.playingMembers[i].scoreSheet.length-1].submittedAnswer = answer;
				console.log('logging answer');
				self.checkAnswer(teamName);
			}
		}
	}, 
	checkAnswer: function(teamName) {
		var self = this;
		for(var i = 0; i < self.playingMembers.length; i++) {
			if(self.playingMembers[i].name == teamName) {
				var team = self.playingMembers[i], 
				currentQuestion = team.scoreSheet[self.playingMembers[i].scoreSheet.length-1];
				if(currentQuestion.answer.toLowerCase() == currentQuestion.submittedAnswer.toLowerCase()) {
					currentQuestion.correct = true;
					team.currentScore = team.currentScore + currentQuestion.points;
					console.log(team);
				}
				else {
					currentQuestion.correct = false;
				}
			}
		}		
	}
}

function Team(name) {
	this.name = name || "";
	this.currentScore = 0;
	this.scoreSheet = [];
}