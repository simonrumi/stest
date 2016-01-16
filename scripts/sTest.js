'use strict';

var Testable = function Testable() {
	/*
	* wrap a function so that it runs but also passes the result to any number of tests
	* via TestItem (see below)
	*/
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
* The last function needs to be endTests() which will pass through the result, even if the test(s) failed.
* If a test is called within a looping function, the number of tests run can be reduced by adding an iteration limit.
* This will stop the test results printing after that limit, but won't stop the function executing.
* The iteration limit is added as the last parameter to the test function.
****/
var TestItem = function(resultToTest) {
	this.actual = resultToTest;

	// this.iterations will be populated with the number of iterations for each test, like this
	// {'expectToBe': 2, 'expectType': 1}
	this.iterations = {};

	/*
	* Print out a description of the test(s)
	*/
	this.describe = function(description, iterationLimit) {
		if (this.testingOn && this.checkIterations('describe', iterationLimit)) {
			this.log('\n____________________\n' + description);
		}
		return this;
	}

	/*
	* These are the individual tests that are to be run by the expect() function below
	* Add any new tests in here
	*/
    this.tests = {
    	'something': function(expectedValue, iterationLimit) {
    		if (this.actual == null || this.actual === '') {
				this.log(this.failString + ' has no value\n');
			} else {
				this.log(this.passString + ' has some value\n');
			}
    	},

    	'true': function(expectedValue, iterationLimit) {
    		if (this.actual) {
				this.log(this.passString + ' is true or has a truthy value\n');
			} else {
				this.log(this.failString + ' is false or has a falsey value, whereas "true" was expected\n');
			}
    	},

    	'false': function(expectedValue, iterationLimit) {
    		if (!this.actual) {
				this.log(this.passString + ' is false or has a falsey value\n');
			} else {
				this.log(this.failString + ' is true or has a truthy value, whereas "false" was expected\n');
			}
    	},

    	'toBe': function(expectedValue, iterationLimit) {
    		if (this.actual == expectedValue) {
				this.log(this.passString + ' has the expected value:\n' + expectedValue);
			} else {
				this.log(this.failString + ' has the value:\n' + this.actual
					+ '\n...but it was expected to be:\n' + expectedValue + '\n');
			}
    	},

    	'type': function(expectedType, iterationLimit) {
    		if (this.actual instanceof expectedType) {
				this.log(this.passString + ' is an instance of the expected type\n');
			} else {
				this.log(this.failString + ' is NOT an instance of the expected type\n');
			}
    	},

    	'contains': function(expectedValue, iterationLimit) {
    		if (this.actual.toString().indexOf(expectedValue) == -1) {
				this.log(this.failString + ' does not contain the expected value:\n'
					+ expectedValue + '\n');
			} else {
				this.log(this.passString + ' contains the expected value:\n' + expectedValue + '\n');
			}
    	},

    	'doesNotContain': function(unexpectedValue, iterationLimit) {
    		if (this.actual.toString().indexOf(unexpectedValue) == -1) {
				this.log(this.passString + ' did not contain the incorrect value:\n' + unexpectedValue + '\n');
			} else {
				this.log(this.failString + ' contained the unexpected value:\n'
					+ unexpectedValue + '\n');
			}
    	}
    };

    /*
    * expect is the function that runs the test of the given name
    */
    this.expect = function(testName, expectedValue, iterationLimit) {
    	var functionObj;
    	var args;
    	if (this.testingOn) {
            if (testName in this.tests) {
                if (this.checkIterations(testName, iterationLimit)) {
                	functionObj = this.tests[testName]; //using the testName as the key, we get back a function that runs a test
                	args = Array.prototype.slice.call(arguments, 1); // the args to send to the test function don't include the testName which is in arguments[0]
                	functionObj.apply(this,args); //now we run the test function, passing on the args which are expectedValue and iterationLimit
                }
            } else {
                this.log('\n***Error: "' + testName + '" is not the name of a known test\n');
            }
        }
        return this; // after having run the test, we return "this", which is the TestItem object, so that further tests can be run
    }


/*
	this.expectSomething = function(iterationLimit) {
		if (this.testingOn && this.checkIterations('expectSomething', iterationLimit)) {
			if (this.actual == null || this.actual === '') {
				this.log(this.failString + ' has no value\n');
			} else {
				this.log(this.passString + ' has some value\n');
			}
		}
		return this;
	}

	this.expectTrue = function(iterationLimit) {
		if (this.testingOn && this.checkIterations('expectTrue', iterationLimit)) {
			if (this.actual) {
				this.log(this.passString + ' is true or has a truthy value\n');
			} else {
				this.log(this.failString + ' is false or has a falsey value\n');
			}
		}
		return this;
	}

	this.expectFalse = function(iterationLimit) {
		if (this.testingOn && this.checkIterations('expectFalse', iterationLimit)) {
			if (!this.actual) {
				this.log(this.passString + ' is false or has a falsey value\n');
			} else {
				this.log(this.failString + ' is true or has a truthy value\n');
			}
		}
		return this;
	}

	this.expectToBe = function(expectedValue, iterationLimit) {
		if (this.testingOn && this.checkIterations('expectToBe', iterationLimit)) {
			if (this.actual == expectedValue) {
			this.log(this.passString + ' has the expected value:\n' + expectedValue);
			} else {
				this.log(this.failString + ' has the value:\n' + this.actual
					+ '\n...but it was expected to be:\n' + expectedValue + '\n');
			}
		}
		return this;
	}

	this.expectType = function(expectedType, iterationLimit) {
		if (this.testingOn && this.checkIterations('expectType', iterationLimit)) {
			if (this.actual instanceof expectedType) {
				this.log(this.passString + ' is an instance of the expected type\n');
			} else {
				this.log(this.failString + ' is NOT an instance of the expected type\n');
			}
		}
		return this;
	}

	this.expectContains = function(expectedValue, iterationLimit) {
		if (this.testingOn && this.checkIterations('expectContains', iterationLimit)) {
			if (this.actual.toString().indexOf(expectedValue) == -1) {
				this.log(this.failString + ' does not contain the expected value:\n'
					+ expectedValue + '\n');
			} else {
				this.log(this.passString + ' contains the expected value:\n' + expectedValue + '\n');
			}
		}
		return this;
	}

	this.expectDoesNotContain = function(unexpectedValue, iterationLimit) {
		if (this.testingOn && this.checkIterations('expectDoesNotContain', iterationLimit)) {
			if (this.actual.indexOf(unexpectedValue) == -1) {
				this.log(this.passString + ' did not contain the incorrect value:\n' + unexpectedValue + '\n');
			} else {
				this.log(this.failString + ' contained the unexpected value:\n'
					+ unexpectedValue + '\n');
			}
		}
		return this;
	}
	*/

	this.printActual = function(iterationLimit) {
		if (this.testingOn && this.checkIterations('printActual', iterationLimit)) {
			this.log('\n Actual result is:\n' + this.actual.toString() + '\n');
		}
		return this;
	}

	this.log = function(message) {
		if (this.testingOn) {
			console.log(message);
		}
	}

	this.testingOn = true;

	this.passString = '\nPass: the actual result ';
	this.failString = '\n***FAIL: the actual result ';

	this.endTests = function() {
		return this.actual;
	}

	/*
	* Check to see whether the current number of iterations is less than the iterationLimit
	* return true if it is, false if we have reached the iterationLimit
	* or if no iterationLimit is given, return true, as any number of iterations is OK
	*/
	this.checkIterations = function(testName, iterationLimit) {
		if(iterationLimit) {
			if (!this.iterations[testName]) {
				this.iterations[testName] = 0;
			}
			if (this.iterations[testName] < iterationLimit) {
				this.iterations[testName]++;
				return true; // we have had less iterations than the iterationLimit, so we're OK to run the test again
			} else {
				return false; // we have reached the iterationLimit, so we can't run the test again
			}
		} else {
			return true; //there's no iterationLimit so we can run as many tests as we like
		}
	}

	/*
	* reset the iteration number of the given test to 0...or if there is no testName given, reset all iteration numbers for all tests
	*/
	this.resetIterations = function(testName) {
		var i;
		if (testName) {
			this.iterations[testName] = 0;
		} else {
			for (i in iterations) {
				this.iterations[i] = 0;
			}
		}
	}
}