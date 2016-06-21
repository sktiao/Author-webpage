$(function() {
	var winH = window.innerHeight;
	$('section').height(winH);
	
	var resizeTimeout;
	$(window).on('resize', function() {
		window.clearTimeout(resizeTimeout);
		resizeTimeout = window.setTimeout(function() {
			winH = window.innerHeight;
			$('section').height(winH);
			$('.frame').css({'top':-currentSection*winH});
			window.clearTimeout(resizeTimeout);
		}, 100);
	});
	
	$('<img/>').on('load', function() {
		$('.loading-mask').addClass('done');
	}).attr('src','img/city-lightblue.png');
	
	var currentSection = 0;
	var sectionMax = 3;
	function scrollTo(id) {
		currentSection = id;
		if (id === 0) {
			$('.sectionIndicator').removeClass('active');
		} else {
			$('.sectionIndicator').addClass('active');
		}
		$('.frame').css({'top':-id*winH});
		$('section').removeClass('active').eq(id).addClass('active');
		$('.sectionIndicator-dot').removeClass('active').eq(id).addClass('active');
	}
	
	var canScroll = true;
	var scrollTimeout;
	$(window).on('mousewheel DOMMouseScroll', function(e) {
		e.preventDefault();
		if (canScroll) {
			var dir = (e.originalEvent.wheelDelta || -e.originalEvent.detail);
			if (dir > 0) {
				if (currentSection > 0) {
					canScroll = false;
					scrollTo(currentSection - 1);
					window.clearTimeout(scrollTimeout);
					scrollTimeout = window.setTimeout(function() {
						canScroll = true;
						window.clearTimeout(scrollTimeout);
					}, 500);
				}
			} else {
				if (currentSection < sectionMax) {
					canScroll = false;
					scrollTo(currentSection + 1);
					window.clearTimeout(scrollTimeout);
					scrollTimeout = window.setTimeout(function() {
						canScroll = true;
						window.clearTimeout(scrollTimeout);
					}, 500);
				}
			}
		}
	});
	
	$('.sectionIndicator-dot').on('click', function() {
		scrollTo($(this).index());
	});
	
	$('.top-down-arrow-image').on('click', function(e) {
		e.preventDefault();
		scrollTo(1);
	});
	
	$('.link-about').on('click', function(e) {
		e.preventDefault();
		scrollTo(1);
	});
	
	$('.link-projects').on('click', function(e) {
		e.preventDefault();
		scrollTo(2);
	});
	
	$('.link-contact').on('click', function(e) {
		e.preventDefault();
		scrollTo(3);
	});
	
	// projects
	$('.projects-content-project-name').on('click', function() {
		$('.projects-content-project-details-container').children().removeClass('active');
		$('.projects-content-project-details').eq($(this).index()).addClass('active');
	});
});