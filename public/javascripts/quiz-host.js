$(function() {
	function PubNub() {
	    this.publishKey = 'pub-c-05acf469-af6d-47ad-8387-0d34d02d0d6e';
	    this.subscribeKey = 'sub-c-80adaa22-b46b-11e3-890f-02ee2ddab7fe';
	    this.subscriptions = localStorage["pn-subscriptions"] || [];
	
	    if(typeof this.subscriptions == 'string') {
	      this.subscriptions = this.subscriptions.split(',');
	    }
	    this.subscriptions = $.unique(this.subscriptions);
	}	
	
	PubNub.prototype.connect = function(username) {
		this.username = username;
		this.connection = PUBNUB.init({
			publish_key: this.publishKey,
			subscribe_key: this.subscribeKey,
			uuid: this.username
		});
	};
	
	PubNub.prototype.addSubscription = function(quiz) {
		this.subscriptions.push(quiz);
		this.subscriptions = $.unique(this.subscriptions);
	};
	
	PubNub.prototype.removeSubscription = function(quiz) {
		if (this.subscriptions.indexOf(quiz) !== -1) {
			this.subscriptions.splice(this.subscriptions.indexOf(quiz), 1);
		}
		this.saveSubscriptions();
	};
	
	PubNub.prototype.saveSubscriptions = function() {
		localStorage["pn-subscriptions"] = this.subscriptions;
	};
	
	PubNub.prototype.subscribe = function(options) {
		this.connection.subscribe.apply(this.connection, arguments);
		this.addSubscription(options.channel);
		this.saveSubscriptions();
	};
	
	PubNub.prototype.unsubscribe = function(options) {
		this.connection.unsubscribe.apply(this.connection, arguments);
	};
	
	PubNub.prototype.publish = function() {
		this.connection.publish.apply(this.connection, arguments);
	};
	
	PubNub.prototype.history = function() {
		this.connection.history.apply(this.connection, arguments);
	};
	
	var pubnub = new PubNub(), 
	username = $('footer[role=contentinfo] p em').html(), 
	quizId = $('input#quiz-id').val(), 
	teams = [], 
	$teamList = $('ul#teams');
	
	localStorage['username'] = username;
	
	pubnub.connect(username);
	
	pubnub.unsubscribe({
      channel: quizId
    });
    
    pubnub.subscribe({
      channel: quizId,
      message: function() {
      	alert('message');
      },
      presence   : function( message, env, channel ) {
      	console.log('hi');
        if (message.action == "join") {
          teams.push(message.uuid);
          $teamList.append("<li data-username='" + message.uuid + "'>" + message.uuid + "</li>");
        } else {
          teams.splice(teams.indexOf(message.uuid), 1);
          $teamList.find('[data-username="' + message.uuid + '"]').remove();
        }
      }
    });
    
    
    
    $container = $('section#quiz');
	rounds.init();
    
    $('body').keyup(function(e){
		if(e.keyCode == 32){
			if(!currentQuestion) {
				questions.getInitial();
			}
			else {
				if(!revealAnswer) {
					questions.revealAnswer();
				}
				else {
					questions.getNext();
				}
			}
			e.preventDefault();
		}
	});
	
	
});

var $container, currentRound, currentQuestion, 
revealAnswer = false;
    
var rounds = {
    init: function() {
		$.ajax({
			type: 'GET',
	        url: '/admin/quiz/' + quizId + '/rounds',						
	        success: function(data) {
				var html = new EJS({url: '/partials/round.ejs'}).render({ round: data });
	        	$container.html(html);
	        	currentRound = data._id;
	        }
	    }); 
    }
}

var questions = {
	getInitial: function() {
		$.ajax({
			type: 'GET',
	        url: '/admin/quiz/' + quizId + '/rounds/' + currentRound + '/questions',						
	        success: function(data) {
				var html = new EJS({url: '/partials/question.ejs'}).render({ question: data });
	        	$container.html(html);
	        	currentQuestion = data._id;
	        }
	    }); 
	}, 
	getNext: function() {
		$.ajax({
			type: 'GET',
	        url: '/admin/quiz/' + quizId + '/rounds/' + currentRound + '/questions/next/' + currentQuestion,						
	        success: function(data) {
				var html = new EJS({url: '/partials/question.ejs'}).render({ question: data });
	        	$container.html(html);
	        	currentQuestion = data._id;
	        }
	    }); 		
	}, 
	revealAnswer: function() {
		$container.find('p.answer').show();
		revealAnswer = false;
	}
}