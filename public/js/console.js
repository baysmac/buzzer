var quizId, 
pubnub;

$(function() {	
	quizId = $('#quiz-id').val();
	hostConsole.init();   	 
});

var hostConsole = {
	$log: $('#log ol'),
	$rawLog: $('#raw-log ol'), 
	$teamList: $('#teams ol'), 
	init: function() {
		var self = this;
		self.setUpChannel();	
		self.setHeights();
		self.setUpLeaderboard();
	}, 
	playingMembers: [], 
	setUpChannel: function() {
		var self = this;
		pubnub = PUBNUB.init({
			publish_key: 'pub-c-05acf469-af6d-47ad-8387-0d34d02d0d6e',
			subscribe_key: 'sub-c-80adaa22-b46b-11e3-890f-02ee2ddab7fe'
		});
		
		pubnub.subscribe({
			channel: quizId,
			callback: function (message) {
				var d = new Date();
				self.$rawLog.prepend('<li>' + d.toString() + '<br/>' + (JSON.stringify(message)).replace(/,/gi, ', ') + '</li>');
				if(message.type == 1 && message.teamName) {
					self.logTeamJoin(d, message.teamName);
					self.addTeam(message.teamName);
				}
				if(message.type == 6 && message.doublePointsRoundTitle) {
					self.logTeamDoublePointsSelection(d, message.teamName, message.doublePointsRoundTitle);
				}
				if(message.type == 2 && message.round) {
					self.logRoundDisplay(d, message.round);
				}
				if(message.type == 2 && message.answer) {
					self.logTeamAnswerSubmission(d, message.teamName, message.answer);
				}
				if(message.type == 3 && message.question) {
					self.logQuestionDisplay(d, message.question);					
				}
				if(message.type == 4 && message.answer) {
					self.logAnswerReveal(d, message.answer);
				}
				if(message.type == 6 && message.teams) {
					self.playingMembers = message.teams;
					self.updateTeamList();
				}
				if(message.type == 7 && message.team) {
					self.logUpdatedTeam(d, message.team);
				}			
			}
		});
	}, 
	setHeights: function() {
		var self = this, 
			windowHeight = $(window).height(), 
			headerHeight = $('header[role=banner]').outerHeight(), 
			contentHeight = $('main').outerHeight(), 
			height = (windowHeight - headerHeight - contentHeight) + 'px';
			
		self.$log.parent().css({ 'height': height });
		self.$rawLog.parent().css({ 'height': height });
		self.$teamList.parent().css({ 'height': height });
		
	}, 
	logTeamJoin: function(d, teamName) {
		var self = this, 
			html = '';
		
		html += '<article>';
		html += '<header>';
		html += '<h1>Team joined</h1>';
		html += '<time>' + d.toString() + '</time>';
		html += '</header>';
		html += '<dl>';
		html += '<dt>Name</dt>';
		html += '<dd>' + teamName + '</dd>';
		html += '</dl>';
		html += '</article>';
		
		self.$log.prepend('<li>' + html + '</li>');
	}, 
	logTeamDoublePointsSelection: function(d, teamName, doublePointsRoundTitle) {
		var self = this, 
			html = '';
		
		html += '<article>';
		html += '<header>';
		html += '<h1>Double point round selected</h1>';
		html += '<time>' + d.toString() + '</time>';
		html += '</header>';
		html += '<dl>';
		html += '<dt>Team</dt>';
		html += '<dd>' + teamName + '</dd>';
		html += '<dt>Round selected</dt>';
		html += '<dd>' + doublePointsRoundTitle + '</dd>';
		html += '</dl>';
		html += '</article>';
		
		self.$log.prepend('<li>' + html + '</li>');		
	}, 
	logRoundDisplay: function(d, round) {
		var self = this, 
			html = '';
		
		html += '<article>';
		html += '<header>';
		html += '<h1>Displayed round</h1>';
		html += '<time>' + d.toString() + '</time>';
		html += '</header>';
		html += '<dl>';
		html += '<dt>Round title</dt>';
		html += '<dd>' + round.title + '</dd>';
		html += '<dt>Number of questions</dt>';
		html += '<dd>' + round.questions.length + '</dd>';
		html += '<dt>Display order</dt>';
		html += '<dd>' + round.displayOrder + '</dd>';
		html += '</dl>';
		html += '</article>';
		
		self.$log.prepend('<li>' + html + '</li>');
		
	}, 
	logTeamAnswerSubmission: function(d, teamName, answer) {
		var self = this, 
			html = '';
		
		html += '<article>';
		html += '<header>';
		html += '<h1>Double point round selected</h1>';
		html += '<time>' + d.toString() + '</time>';
		html += '</header>';
		html += '<dl>';
		html += '<dt>Team</dt>';
		html += '<dd>' + teamName + '</dd>';
		html += '<dt>Answer</dt>';
		html += '<dd>' + answer + '</dd>';
		html += '</dl>';
		html += '</article>';
		
		self.$log.prepend('<li>' + html + '</li>');		
	}, 
	logQuestionDisplay: function(d, question) {
		var self = this, 
			html = '';
		
		html += '<article>';
		html += '<header>';
		html += '<h1>Displayed question</h1>';
		html += '<time>' + d.toString() + '</time>';
		html += '</header>';
		html += '<dl>';
		html += '<dt>Type</dt>';
		html += '<dd>' + question.type + '</dd>';
		
		if(question.type == 'text' || question.type == 'multiple') {
			html += '<dt>Question</dt>';
			html += '<dd>' + question.questionText + '</dd>';
		} else {
			html += '<dt>Image path</dt>';
			html += '<dd>' + question.image + '</dd>';			
		}
		
		if(question.type == 'multiple') {
			html += '<dt>Answer options</dt>';
			html += '<dd>' + question.answerOptions.join(', ') + '</dd>';			
		}
		
		html += '<dt>Answer</dt>';
		html += '<dd>' + question.answer + '</dd>';
		html += '<dt>Time limit (seconds)</dt>';
		html += '<dd>' + question.timeInSeconds + '</dd>';
		html += '<dt>Display order</dt>';
		html += '<dd>' + question.displayOrder + '</dd>';
		html += '</dl>';
		html += '</article>';
		
		self.$log.prepend('<li>' + html + '</li>');
		
	}, 
	logAnswerReveal: function(d, answer) {
		var self = this, 
			html = '';
		
		html += '<article>';
		html += '<header>';
		html += '<h1>Revealed answer</h1>';
		html += '<time>' + d.toString() + '</time>';
		html += '</header>';
		html += '<dl>';
		html += '<dt>Answer</dt>';
		html += '<dd>' + answer + '</dd>';
		html += '</dl>';
		html += '</article>';
		
		self.$log.prepend('<li>' + html + '</li>');
		
	}, 
	logUpdatedTeam: function(d, updatedTeam) {
		var self = this, 
			html = '';
		
		html += '<article>';
		html += '<header>';
		html += '<h1>Updated team score</h1>';
		html += '<time>' + d.toString() + '</time>';
		html += '</header>';
		html += '<dl>';
		html += '<dt>Team</dt>';
		html += '<dd>' + updatedTeam.name + '</dd>';
		html += '<dt>Updated score</dt>';
		html += '<dd>' + updatedTeam.score + '</dd>';
		html += '</dl>';
		html += '</article>';
		
		self.$log.prepend('<li>' + html + '</li>');
		
	}, 
	setUpLeaderboard: function() {
		var self = this;
		
		self.$teamList.mixItUp({
			layout: {
				display: 'block'
			}
		});
		
		
		self.$teamList.on('click', 'button', function(e) {
			var $this = $(this), 
				$scoreInput = $this.siblings('input'), 
				score = parseInt($scoreInput.val()), 
				teamName = $this.closest('li').find('span.team-name').html();
			
			if($this.hasClass('minus') && score != 0) {
				$scoreInput.val(--score);
			} else if($this.hasClass('plus')) {
				$scoreInput.val(++score);
			}
			
			for(var i = 0; i < self.playingMembers.length; i++) {
				if(self.playingMembers[i].name == teamName) {
					self.playingMembers[i].score = score;
		
			    	pubnub.publish({
			        	channel: quizId, 
			        	message: {
			        		type: 7, 
			        		team: self.playingMembers[i]
			        	}
			    	});
				    	
					break;
				}
			}
			
			self.updateTeamList();
			
			e.preventDefault();
		});
		
		self.$teamList.on('blur', 'input', function(e) {
			var $this = $(this);
			
			if($this.val() != '') {
				var score = parseInt($this.val()), 
					teamName = $this.closest('li').find('span.team-name').html();
					
				for(var i = 0; i < self.playingMembers.length; i++) {
					if(self.playingMembers[i].name == teamName) {
						self.playingMembers[i].score = score;	
		
				    	pubnub.publish({
				        	channel: quizId, 
				        	message: {
				        		type: 7, 
				        		team: self.playingMembers[i]
				        	}
				    	});
				    	
						break;
					}
				}
				
				self.updateTeamList();
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
			var team = new Team(teamName, self.playingMembers.length+1), 
			html = '';
			self.playingMembers.push(team);
			
			html += '<li class="mix" data-position="' + team.position + '">';
			html += '<span class="team-name">' + team.name + '</span>';
			html += '<div class="score actions">';
			html += '<button class="minus">-</button>';
			html += '<input type="text" value="' + team.score + '" />';
			html += '<button class="plus">+</button>';
			html += '</div>';
			html += '</li>';
			
			
			self.$teamList.append(html);
		}
	}, 
	updateTeamList: function() {
		var self = this;
		
		self.playingMembers.sort(compare);
		
		for(var i = 0; i < self.playingMembers.length; i++) {
			var team = self.playingMembers[i];
			team.position = i+1;
			self.$teamList.children('li').each(function(index, value) {
				var $team = $(this);
				if($team.find('span.team-name').html() == team.name) {
					$team.find('input').val(team.score);
					$team.attr('data-position', team.position);
				}
			});	
		}	
		
		self.$teamList.mixItUp('sort', 'position:asc');	
		
	}
}

function Team(name, position) {
	this.name = name || "";
	this.score = 0;
	this.scoreSheet = [];
	this.position = position || 0;
	this.doublePointsRoundId = 0;
}

function compare(a,b) {
	if (a.score > b.score)
	 return -1;
	if (a.score < b.score)
	return 1;
	return 0;
}