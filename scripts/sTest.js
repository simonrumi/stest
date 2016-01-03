'use strict';

var Testable = function Testable() {
	this.addFunction = function(functionName, functionObj) {
		// in case we need this, this regex is apparently how Angular gets argument names for its Dependency Injection system
		// see http://krasimirtsonev.com/blog/article/Dependency-injection-in-JavaScript
		//var funcDeclarationRegex = /^function\s*[^\(]*\(\s*([^\)]*)\)/;
		//var argumentListAsString = functionObj.toString().match(funcDeclarationRegex)[1]; //this gets us a string like 'arg1, arg2, arg3'
		//var argumentsArray = argumentListAsString.replace(/ /g, '').split(','); //remove the spaces, then split on the commas to get an array of the arguments

		this[functionName] = function () {
			var args = Array.prototype.slice.call(arguments, 0); //this turns arguments object into a regular Array, explanation here: https://shifteleven.com/articles/2007/06/28/array-like-objects-in-javascript/
			var returnValue = functionObj.apply(this,args);
			//this.test(returnValue, testCollection); // here we need the testCollection somehow - it will be known each time the function is run, not when the function is created
			return new TestItem(returnValue);
		};

	};
}

/****
* A TestItem receives a result from a Testable object,
* runs some tests on it (reporting is done into the console),
* then passes through the result, even if the test(s) failed
****/
var TestItem = function(resultToTest) {
	this.actual = resultToTest;

	this.expectToBe = function(expectedValue, lastTest) {
		if (this.actual == expectedValue) {
			this.log('\n-->PASS: the actual result has the expected value:\n' + expectedValue);
		} else {
			this.log('\n-->FAIL: the actual result has the value:\n' + this.actual
				+ '\n...but it was expected to be:\n' + expectedValue + '\n');
		}
		return this;
	}

	this.expectType = function(expectedType, lastTest) {
		if (this.actual instanceof expectedType) {
			this.log('\n-->PASS: the actual result is an instance of the expected type ' + expectedType + '\n');
		} else {
			this.log('\n-->FAIL: the actual result is NOT an instance of the expected type ' + expectedType + '\n');
		}
		return this;
	}

	this.expectContains = function(expectedValue, lastTest) {
		if (this.actual.indexOf(expectedValue) == -1) {
			this.log('\n-->FAIL: the actual result does not contain the expected value:\n'
				+ expectedValue + '\n...as it is:\n' + this.actual + '\n');
		} else {
			this.log('\n-->PASS: the actual result contains the expected value:\n' + expectedValue + '\n');
		}
		return this;
	}

	this.log = function(message) {
		if (this.loggingOn) {
			console.log(message);
		}
	}

	this.loggingOn = true;

	this.endTests = function() {
		return this.actual;
	}
}