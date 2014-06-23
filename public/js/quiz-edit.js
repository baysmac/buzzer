var quizId;

$(function() {

	var $roundList = $('ul.list.rounds');
	quizId = $('#quiz-id').val();

	$('button#add-round').click(function(e) {
		rounds.add(function(data) {	
			if($roundList.length > 0) {
				var html = new EJS({url: '/partials/rounds.ejs'}).render({ quiz: { rounds: [data] }, withoutWrapper: true });	
				$roundList.append(html);				
			}
			else {
				var html = new EJS({url: '/partials/rounds.ejs'}).render({ quiz: { rounds: [data] } });
				$('p.no-results').after(html).remove();
			}
		});
		e.preventDefault();
	});
	
	$roundList.on('click', 'button.delete', function(e) {
		var $this = $(this), 
		$round = $this.closest('li');
		rounds.delete($round.find('input[name=id]').val(), function(data) {
			$round.remove();
		});
		e.preventDefault();
	});
	
	$roundList.on('submit', 'form', function(e) {
		var $this = $(this), 
		$round = $this.closest('li');
		rounds.edit($round.find('input[name=id]').val(), $this, function(data) {
			var html = new EJS({url: '/partials/rounds.ejs'}).render({ quiz: { rounds: [data] }, withoutWrapper: true });	
			$round.replaceWith(html);
		});
		e.preventDefault();
	});
	
	$roundList.on('click', 'button.add-question', function(e) {
		var $this = $(this), 
		$round = $this.closest('li'), 
		roundId = $round.find('input[name=id]').val(), 
		$questionList = $round.find('ul.list.questions');
		
		questions.add(roundId, function(data) {
			if($questionList.length > 0) {				
				var html = new EJS({url: '/partials/questions.ejs'}).render({ round: { questions: [data] }, withoutWrapper: true });	
				$questionList.append(html);				
			}
			else {
				var html = new EJS({url: '/partials/rounds.ejs'}).render({ round: { questions: [data] } });
				$round.find('p.no-results').after(html).remove();
			}
		});
		
		e.preventDefault();
	});
	
	$roundList.on('click', 'button.delete-question', function(e) {
		var $this = $(this), 
		$question = $this.closest('li'), 
		questionId = $question.find('input[name=question_id]').val(), 
		$round = $question.closest('article.round').parent(), 
		roundId = $round.find('input[name=id]').val(), 
		$questionList = $round.find('ul.list.questions');
		
		console.log($round);
		
		questions.delete(questionId, roundId, function(data) {
			$question.remove();
		});
		
		e.preventDefault();
	});
	
});

var rounds = {
	add: function(callback) {	
		$.ajax({
			type: 'POST',
            url: '/admin/quiz/' + quizId + '/rounds',						
            success: function(data) {
            	if (callback && typeof(callback) === "function") { callback(data); }
            }
        });     
	}, 
	delete: function(roundId, callback) {	
		$.ajax({
			type: 'DELETE',
            url: '/admin/quiz/' + quizId + '/rounds/' + roundId,						
            success: function(data) {
            	if (callback && typeof(callback) === "function") { callback(data); }
            }
        });  		
	}, 
	edit: function(roundId, $form, callback) {	
		$.ajax({
			type: 'PUT',
			data: $form.serialize(),
            url: '/admin/quiz/' + quizId + '/rounds/' + roundId,						
            success: function(data) {
            	if (callback && typeof(callback) === "function") { callback(data); }
            }
        });  
	}
}

var questions = {
	add: function(roundId, callback) {	
		$.ajax({
			type: 'POST',
            url: '/admin/quiz/' + quizId + '/rounds/' + roundId + '/questions',						
            success: function(data) {
            	if (callback && typeof(callback) === "function") { callback(data); }
            }
        });     
	}, 
	delete: function(questionId, roundId, callback) {
		console.log(roundId);	
		$.ajax({
			type: 'DELETE',
            url: '/admin/quiz/' + quizId + '/rounds/' + roundId + '/questions/' + questionId,						
            success: function(data) {
            	if (callback && typeof(callback) === "function") { callback(data); }
            }
        });  		
	}, 
	edit: function(roundId, $form, callback) {	
		$.ajax({
			type: 'PUT',
			data: $form.serialize(),
            url: '/admin/quiz/' + quizId + '/rounds/' + roundId + '/questions/' + questionId,							
            success: function(data) {
            	if (callback && typeof(callback) === "function") { callback(data); }
            }
        });  
	}	
}