$(function() {
	$('input[name=type]').click(function() {
		var target = $(this).val();		
		if(target == 'text') {
			$('.question').removeClass('hidden');
			$('.image').addClass('hidden');
			$('.answer-image').addClass('hidden');
		} else {
			$('.question').addClass('hidden');
			$('.image').removeClass('hidden');
			$('.answer-image').removeClass('hidden');			
		}		
	});
});