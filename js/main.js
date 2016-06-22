$(function() {
	var resizeTimeout;
	var winH, winW;
	function resizing() {
		window.clearTimeout(resizeTimeout);
		resizeTimeout = window.setTimeout(function() {
			winH = window.innerHeight;
			winW = window.innerHeight;
			if (winW > 767) {
				$('section').height(winH);
			} else {
				$('section').height('auto').css({'min-height':winH});
				$('.section-top').height(winH);
				$('.frame').css({'top':0});
			}
			window.clearTimeout(resizeTimeout);
		}, 100);
	}
	
	$(window).on('resize', resizing);
	resizing();
	
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
		if (canScroll && winW > 767) {
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
	
	$('.top-down-arrow').on('click', function() {
		if (winW > 767) {
			scrollTo(1);
		} else {
			$('body').stop().animate({'scrollTop':$('#section-about').offset().top},500);
		}
	});
	
	$('.link-about').on('click', function() {
		if (winW > 767) {
			scrollTo(1);
		} else {
			$('body').stop().animate({'scrollTop':$('#section-about').offset().top},500);
		}
	});
	
	$('.link-projects').on('click', function() {
		if (winW > 767) {
			scrollTo(2);
		} else {
			$('body').stop().animate({'scrollTop':$('#section-projects').offset().top},500);
		}
	});
	
	$('.link-contact').on('click', function() {
		if (winW > 767) {
			scrollTo(3);
		} else {
			$('body').stop().animate({'scrollTop':$('#section-contact').offset().top},500);
		}
	});
	
	// projects
	$('.projects-content-project-name').on('click', function() {
		if (winW > 767) {
			$('.projects-content-project-details-container').children().removeClass('active');
			$('.projects-content-project-details').eq($(this).index()).addClass('active');
		} else {
			$(this).children('.projects-content-project-name-text').hide();
			$('.projects-content-project-details-mobile').eq($(this).index()).addClass('active');
		}
	});
});