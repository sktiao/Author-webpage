var bgArray = ['bg-top-1.png','bg-top-2.jpg'];
var bgIndex = 0;
//window.setInterval(rotateTopBg, 3000);

function rotateTopBg() {
	$('#section-top').css({'background-image':'url(\'../img/'+bgArray[bgIndex++]+'\')'});
	if (bgIndex >= bgArray.length) {
		bgIndex = 0;
	}
}
