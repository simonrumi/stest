'use strict';

//// temporary tests of the testing functions
var tempTest = new Testable();

tempTest.addFunction('addNums', function(num1, num2) {
	return num1 + num2;
});
console.log('addNums 1,2  = ' + tempTest.addNums(6,7).expectToBe(13).endTests());

tempTest.addFunction('concatStrings', function(str1, str2) {
	return str1.concat(str2);
});
console.log('concatStrings result ' + tempTest.concatStrings('foo','bar').expectContains('not this').expectToBe('foobar').endTests());

tempTest.addFunction('loopingFn', function() {
	var i;
	for(i=0; i<100; i++) {
		tempTest.addNums(0,i).expectToBe(2,3).endTests();
	}
});
tempTest.loopingFn();
//// end test

var animatedString = new Testable();

animatedString.addFunction('putCharactersIntoDivs', function(containingElementId) {
	var i;
	var divId;
	var textInDivs = '';
	var animatableChar;
	var originalText = $(containingElementId).text();
	for (i=0; i<originalText.length; i++) {
		divId = 'char_' + i;
		if (originalText.charAt(i) === ' ') {
			animatableChar = '&nbsp;';
		} else {
			animatableChar = originalText.charAt(i);
		}
		textInDivs += '<div id="' + divId + '" class="animatable-text-div">' + animatableChar + '</div>'; //.animatable-text-div sets position = relative
	}
	$(containingElementId).html(textInDivs);
	return textInDivs;
});

animatedString.addFunction('prepareAnimTimeline', function(containingElementId, testObj) {
	var i;
	var arrayOfDivs;
	arrayOfDivs = $(containingElementId + " > div");
	var rippleTextTimeline = new TimelineLite();
	rippleTextTimeline
    	.staggerTo(arrayOfDivs, 3.0, {
    		rotation: 360,
    		y: -300,
    		opacity: 0,
    		ease: Elastic.easeOut
    	}, 0.1)
    	.staggerTo(arrayOfDivs, 3.0, {
    		rotation: 0,
    		y: 0,
    		opacity: 1.0,
    		ease: Elastic.easeOut
    	}, 0.1);
    return rippleTextTimeline;
});

$(window).load(function() {
	var elementToAnimate = '#explanation';

	animatedString.putCharactersIntoDivs(elementToAnimate)
		.describe('Testing animatedString.putCharactersIntoDivs for the div ' + elementToAnimate)
		.expectContains('<div id="char_0" class="animatable-text-div">a</div>')
		.expectContains('<div id="char_1" class="animatable-text-div">')
		.expectContains('<div id="char_16" class="animatable-text-div">t</div>')
		.expectDoesNotContain('<div id="char_16" class="animatable-text-div">t</div>')
		.endTests();

	var timeline = animatedString.prepareAnimTimeline(elementToAnimate)
		.describe('Testing animatedString.prepareAnimTimeline')
		.expectType(TimelineLite)
		.printActual()
		.endTests();

	$('#explanation').bind('mouseover', function(event) {
		if (timeline.isActive()) {
			timeline.pause();
		} else if (timeline.paused()) {
			timeline.resume();
		} else {
			timeline.restart();
		}
	});

	$('#explanation').bind('mouseout', function(event) {
		if (timeline.paused()) {
			timeline.resume();
		}
	});
});