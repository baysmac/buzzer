$(function() {
	
	$('ul.tabs').on('click', 'a', function(e) {
		var $this = $(this), 
			target = $this.attr('href');
		$('.tabbed-content').hide();
		$('.tabbed-content' + target).show();
		$this.closest('ul.tabs').find('a').removeClass('active');
		$this.addClass('active');
		e.preventDefault();
	});
	
});