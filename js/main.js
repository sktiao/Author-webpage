$(document).on('click', '.navbar-link, .navbar-brand', function(e) {
  e.preventDefault();
  $('html,body').stop().animate({scrollTop:$($(this).attr('href')).offset().top-50}, 500);
  $('.navbar-collapse').removeClass('in');
});

$(document).on('click', '.section-top-arrow', function() {
  $('html,body').stop().animate({scrollTop:$('#section-about').offset().top-50}, 500);
  $('.navbar-collapse').removeClass('in');
});
