$(function() {
	var $question = $('.question'), 
		$image = $('.image'), 
		$answerImage = $('.answer-image'), 
		$multipleChoices = $('.multiple-choices');
	
	
	$('input[name=type]').click(function() {
		var target = $(this).val();		
		if(target == 'text') {
			$question.removeClass('hidden');
			$image.addClass('hidden');
			$answerImage.addClass('hidden');
			$multipleChoices.addClass('hidden');		
		} else if(target == 'image') {
			$question.addClass('hidden');
			$image.removeClass('hidden');
			$answerImage.removeClass('hidden');	
			$multipleChoices.addClass('hidden');			
		} else {
			$question.removeClass('hidden');
			$image.addClass('hidden');
			$answerImage.addClass('hidden');
			$multipleChoices.removeClass('hidden');			
		}	
	});
	
	$multipleChoices.next('dd').on('click', 'button.add', function(e) {
		var $this = $(this), 
			$parent = $multipleChoices.next('dd'), 
			$input = $parent.find('input[type=text]'), 
			value = $input.val(), 
			$list = $parent.find('ul.list'), 
			$added = $parent.find('input[name=options_added]'), 
			addedCurrentVal = $added.val();
			
		$list.append('<li><span class="heading">' + value + '</span><div class="actions"><button class="cta delete">Delete</button></a></li>');
		$added.val(addedCurrentVal + value + ',');
		$input.val('');
			
		e.preventDefault();
	});
	
	$multipleChoices.next('dd').on('click', 'ul.list button.delete', function(e) {
		var $this = $(this), 		
			$parent = $multipleChoices.next('dd'),
			$removed = $parent.find('input[name=options_removed]'), 
			removedCurrentVal = $removed.val(), 
			value = $.trim($this.closest('li').find('span.heading').text());
			
		$this.closest('li').remove();
		$removed.val(removedCurrentVal + value + ',');
			
		e.preventDefault();		
	});
});