'use strict';

/*
* First set of tests with simple functions start here
*/
var tempTest = new Testable();

tempTest.setTestingOn(true);

tempTest.addFunction('addNums', function(num1, num2) {
	return num1 + num2;
});

tempTest.addFunction('concatStrings', function(str1, str2) {
	return str1.concat(str2);
});

tempTest.setTestingOn(false, 'addNums');

var fourPlusFive = tempTest.addNums(4,5)
	.describe('Testing addNums(4,5)')
	.expect('something')
	.expect('true')
	.expect('toBe', 9)
	.expect('contains', 40)
	.expect('contains', 9)
	.expect('doesNotContain', 'a string')
	.endTests();

tempTest.testRawValue(42)
	.describe('testing the raw value 42')
	.expect('toBe', 42)
	.endTests();

var myString = 'the quality of mercy is not strained';
tempTest.testRawValue(myString)
	.describe('testing myString')
	.expect('contains', 'mercy')
	.expect('doesNotContain', 'stewed apples')
	.endTests();

var joinedStrings = tempTest.concatStrings('foo','bar')
	.describe("Testing concatStrings('foo','bar')")
	.expect('contains','not this')
	.expect('toBe', 'foobar')
	.endTests();

tempTest.addFunction('loopingFn', function() {
	var i;
	for(i=0; i<100; i++) {
		tempTest.addNums(0,i)
			.describe('Testing iteration limit', 1)
			.describe('Start Iteration', 6)
			.printActual(3, 5)
			.expect('something', 1)
			.expect('true', 3)
			.expect('false', 3)
			.expect('toBe', 2, 3)
			.expect('contains', 'This string is not in the answer', 5)
			.endTests();
	}
});
tempTest.loopingFn();

tempTest.addFunction('getBodyTag', function() {
	return document.getElementsByTagName("BODY")[0];
});

document.addEventListener("DOMContentLoaded", function(event) {
	var theBody = tempTest.getBodyTag()
		.describe('Getting the body tag')
		.expect('htmlElement')
		.expect('htmlElement', HTMLBodyElement)
		.expect('htmlElement', HTMLButtonElement)
		.endTests();
});


/*
* Testing of a more realistic set of functions, for displaying animated text, start here
*/
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
		.expect('contains', '<div id="char_0" class="animatable-text-div">a</div>')
		.expect('contains', '<div id="char_1" class="animatable-text-div">')
		.expect('contains', '<div id="char_16" class="animatable-text-div">t</div>')
		.expect('doesNotContain', '<div id="char_16" class="animatable-text-div">t</div>')
		.endTests();

	var timeline = animatedString.prepareAnimTimeline(elementToAnimate)
		.describe('Testing animatedString.prepareAnimTimeline')
		.expect('type', TimelineLite)
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