'use strict';

var Testable = function Testable() {
	this.addFunction = function(functionName, functionObj) {
		this[functionName] = function () {
			var args = Array.prototype.slice.call(arguments, 0); //this turns arguments object into a regular Array, explanation here: https://shifteleven.com/articles/2007/06/28/array-like-objects-in-javascript/
			var returnValue = functionObj.apply(this,args);
			var testItem = this.setUpTestItem(functionName, returnValue);
			return testItem;
		};
	};

	this.setUpTestItem = function(functionName, resultToTest) {
		if (this.testItems[functionName]) {
			this.testItems[functionName].actual = resultToTest;
		} else {
			this.testItems[functionName] = new TestItem(resultToTest);
		}
		return this.testItems[functionName];
	}

	// entries in this object look like this
	// {myFunctionName: 'some result to test', etc}
	this.testItems = {};
}

/****
* A TestItem receives a result from a Testable object and
* runs one of more of its tests on it (reporting is done into the console);
* The last function needs to be endTests() which will pass through the result, even if the test(s) failed
****/
var TestItem = function(resultToTest) {
	this.actual = resultToTest;
	this.iterations = 0;

	this.describe = function(description) {
		this.log('\n**********\n' + description);
		return this;
	}

	this.expectToBe = function(expectedValue, iterationLimit) {
		if (this.checkIterations(iterationLimit)) {
			if (this.actual == expectedValue) {
			this.log(this.passString + ' has the expected value:\n' + expectedValue);
			} else {
				this.log(this.failString + ' has the value:\n' + this.actual
					+ '\n...but it was expected to be:\n' + expectedValue + '\n');
			}
		}
		return this;
	}

	// QQQQQQQQQ checkIterations system doesn't work because every time we are creating a new TestItem
	// ....solution is probably to check if there is an existing TestItem and use that instead of creating a new one
	/*
	* Check to see whether the current number of iterations is less than the iterationLimit
	* return true if it is, false if we have reached the iterationLimit
	* or if no iterationLimit is given, return true, as any number of iterations is OK
	*/
	this.checkIterations = function(iterationLimit) {
		if(iterationLimit) {
			if (this.iterations <= iterationLimit) {
				this.iterations++;
				return true;
			} else {
				this.iterations = 0;
				return false;
			}
		} else {
			return true;
		}
	}

	this.expectType = function(expectedType) {
		if (this.actual instanceof expectedType) {
			this.log(this.passString + ' is an instance of the expected type\n');
		} else {
			this.log(this.failString + ' is NOT an instance of the expected type\n');
		}
		return this;
	}

	this.expectContains = function(expectedValue) {
		if (this.actual.indexOf(expectedValue) == -1) {
			this.log(this.failString + ' does not contain the expected value:\n'
				+ expectedValue + '\n');
		} else {
			this.log(this.passString + ' contains the expected value:\n' + expectedValue + '\n');
		}
		return this;
	}

	this.expectDoesNotContain = function(unexpectedValue) {
		if (this.actual.indexOf(unexpectedValue) == -1) {
			this.log(this.passString + ' did not contain the incorrect value:\n' + unexpectedValue + '\n');
		} else {
			this.log(this.failString + ' contained the unexpected value:\n'
				+ unexpectedValue + '\n');
		}
		return this;
	}

	this.printActual = function() {
		this.log('\n Actual result is:\n' + this.actual.toString() + '\n');
		return this;
	}

	this.log = function(message) {
		if (this.loggingOn) {
			console.log(message);
		}
	}

	this.loggingOn = true;

	this.passString = '\nPass: the actual result ';
	this.failString = '\n***FAIL: the actual result ';

	this.endTests = function() {
		this.log('**********\n');
		return this.actual;
	}
}