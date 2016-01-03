'use strict';

var STester = function STester() {
	this.loggingOn = true;

	this.addFunction = function(functionName, testCollection, functionObj) {
		// in case we need this, this regex is apparently how Angular gets argument names for its Dependency Injection system
		// see http://krasimirtsonev.com/blog/article/Dependency-injection-in-JavaScript
		//var funcDeclarationRegex = /^function\s*[^\(]*\(\s*([^\)]*)\)/;
		//var argumentListAsString = functionObj.toString().match(funcDeclarationRegex)[1]; //this gets us a string like 'arg1, arg2, arg3'
		//var argumentsArray = argumentListAsString.replace(/ /g, '').split(','); //remove the spaces, then split on the commas to get an array of the arguments

		this[functionName] = function () {
			var args = Array.prototype.slice.call(arguments, 0); //this turns arguments object into a regular Array, explanation here: https://shifteleven.com/articles/2007/06/28/array-like-objects-in-javascript/
			var returnValue = functionObj.apply(this,args);
			this.test(returnValue, testCollection); // here we need the testCollection somehow - it will be known each time the function is run, not when the function is created
			return returnValue;
		}
	};

	this.test = function(result, testCollection) {
		if (testCollection.type) {
			if (result instanceof testCollection.type) {
			this.log('\n-->PASS: the result is an instance of the expected type\n');
			} else {
				this.log('\n-->FAIL: the result is NOT an instance of the expected type\n');
			}
		}

		if (testCollection.value) {
			if (result == testCollection.value) {
			this.log('\n-->PASS: the result has the expected value:\n' + testCollection.value);
			} else {
				this.log('\n-->FAIL: the result has the value:\n' + result
					+ '\n...but it was expected to be:\n' + testCollection.value + '\n');
			}
		}

		if (testCollection.contains) {
			if (result.indexOf(testCollection.contains) == -1) {
				this.log('\n-->FAIL: the result does not contain the value:\n'
					+ testCollection.contains + '\n...as it is:\n' + result + '\n');
			} else {
				this.log('\n-->PASS: the result contains the expected value:\n' + testCollection.contains + '\n');

			}
		}
	};
}

STester.prototype = {
	log: function(message) {
		if (this.loggingOn) {
			console.log(message);
		}
	},
}