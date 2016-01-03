'use strict';

var animatedString = new STester();

// trying to use the addFunction system
var addNumsTestCollection = {
	'value': 13,
}

animatedString.addFunction('addNums', addNumsTestCollection, function(num1, num2) {
	return num1 + num2;
});

console.log('addNums 6,7  = ' + animatedString.addNums(6,7));

//end addFunction test


$(window).load(function() {
	var elementToAnimate = '#explanation';

	var putCharactersIntoDivsTest = {
		'value': 'this is the wrong value',
		'contains': '<div id="char_0" class="animatable-text-div">a</div>'
	};
	animatedString.putCharactersIntoDivs(elementToAnimate, putCharactersIntoDivsTest);

	var timelineTest = {
		'type': TimelineLite,
		'numberOfTests': 1,
		//'value':
		//'length':
		//etc
	};
	var timeline = animatedString.prepareAnimTimeline(elementToAnimate, timelineTest);

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

// QQQ currently we are having to write this.test() just before the return value
// somehow we want the functions to automatically run that just before the return value
// or maybe just after the return value
// Also, the testObj is being made manually - instead want to make some kind of class
// so you would do new TestParams('value', nubmeroftests, etc)
///////
// Getting the above worked out - see sTest.js addFunction()

animatedString.putCharactersIntoDivs = function(containingElementId, testObj) {
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
	//this.test(textInDivs, testObj);
	return textInDivs;
};

animatedString.prepareAnimTimeline = function(containingElementId, testObj) {
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
    //this.test(rippleTextTimeline, testObj);
    return rippleTextTimeline;
};