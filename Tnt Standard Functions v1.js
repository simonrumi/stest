/*******************************************************************************************
* Testable framework starts here. Don't edit this unless you've specifically received permission to do so.
********************************************************************************************/
/**
* @class Testable
* To use Testable do something like this:
*
* var myTestableObj = new Testable();
* myTestableObj.addFunction('addNums', function(num1, num2) {
*	// write your function as usual here
*	return num1 + num2;
* });
*
* use the function with tests in-line like this:
*
* var fourPlusFive = myTestableObj.addNums(4,5)
*	.describe('Testing myTestableObj(4,5)')
*	.expect('something')
*	.expect('toBe', 9)
*	.endTests();
*
* note that you always have to end with endTests()
*/
var Testable = function Testable() {
	/**
	* @property testItems Each Testable object keeps a collection of TestItems.
	* Entries in this object look like this
	* {
	*	myFunctionName: 'some result to test',
	*	etc,
	* }
	*/
	this.testItems = {};
}

/**
* @method addFunction Wraps a function so that it runs but also passes the result to any number of tests via TestItem (see below)
* @return a TestItem that contains the functions
*/
Testable.prototype.addFunction = function(functionName, functionObj) {
	this[functionName] = function () {
		var args = Array.prototype.slice.call(arguments, 0); //this turns arguments object into a regular Array, explanation here: https://shifteleven.com/articles/2007/06/28/array-like-objects-in-javascript/
		var returnValue = functionObj.apply(this,args);
		var testItem = this.registerTestItem(functionName, returnValue);
		return testItem;
	};
};

/**
* @method registerTestItem This is used by addFunction to register TestItems in the testItems collection
* and associate the result being tested with it. (If the TestItem has previously been added to testItems, it is not added twice)
*/
Testable.prototype.registerTestItem = function(functionName, resultToTest) {
	if (this.testItems[functionName]) {
		this.testItems[functionName].actual = resultToTest;
	} else {
		this.testItems[functionName] = new TestItem(resultToTest);
	}
	return this.testItems[functionName];
};

/**
* @class A TestItem receives a result from a Testable object and
* runs one of more of its tests on it (reporting is done into the console);
* The last function needs to be endTests() which will pass through the result, even if the test(s) failed.
* If a test is called within a looping function, the number of tests run can be reduced by adding an iteration limit.
* This will stop the test results printing after that limit, but won't stop the function executing.
* The iteration limit is added as the last parameter to the test function.
****/
var TestItem = function(resultToTest) {
	this.actual = resultToTest;
	this.testingOn = true;

	// this.iterations will be populated with the number of iterations for each test, like this
	// {'expectToBe': 2, 'expectType': 1}
	this.iterations = {};
};

/**
* @method describe Print out a description of the test(s)
* @return This TestItem (to be passed to other tests)
*/
TestItem.prototype.describe = function(description, iterationLimit) {
	if (this.testingOn && this.checkIterations('describe', iterationLimit)) {
		this.log('\n____________________\n' + description);
	}
	return this;
};

/**
* @property tests An object that contains functions which are the individual tests that are to be run, in turn, by the expect() function
* Any new tests in here can be coded in here.
* Note that the name 'iterationLimit' is a special name and should not be varied
*/
TestItem.prototype.tests = {
	'something': {
	args: ['iterationLimit'],
	func: function() {
			if (this.actual == null || this.actual === '') {
				this.log(this.failString + ' has no value\n');
			} else {
				this.log(this.passString + ' has some value\n');
			}
		},
	},

	'true': {
		args: ['iterationLimit'],
		func: function() {
			if (this.actual) {
				this.log(this.passString + ' is true or has a truthy value\n');
			} else {
				this.log(this.failString + ' is false or has a falsey value, whereas "true" was expected\n');
			}
		},
	},

	'false': {
		args: ['iterationLimit'],
		func: function() {
			if (!this.actual) {
				this.log(this.passString + ' is false or has a falsey value\n');
			} else {
				this.log(this.failString + ' is true or has a truthy value, whereas "false" was expected\n');
			}
		},
	},

	'toBe': {
		args: ['expectedValue', 'iterationLimit'],
		func: function(expectedValue, iterationLimit) {
			if (this.actual == expectedValue) {
				this.log(this.passString + ' has the expected value:\n' + expectedValue);
			} else {
				this.log(this.failString + ' has the value:\n' + this.actual
					+ '\n...but it was expected to be:\n' + expectedValue + '\n');
			}
		},
	},

	'type': {
		args: ['expectedType', 'iterationLimit'],
		func: function(expectedType, iterationLimit) {
			if (this.actual instanceof expectedType) {
				this.log(this.passString + ' is an instance of the expected type\n');
			} else {
				this.log(this.failString + ' is NOT an instance of the expected type\n');
			}
		},
	},

	'contains': {
		args: ['expectedValue', 'iterationLimit'],
		func: function(expectedValue, iterationLimit) {
			if (this.actual.toString().indexOf(expectedValue) == -1) {
				this.log(this.failString + ' does not contain the expected value:\n'
					+ expectedValue + '\n');
			} else {
				this.log(this.passString + ' contains the expected value:\n' + expectedValue + '\n');
			}
		},
	},

	'doesNotContain': {
		args: ['unexpectedValue', 'iterationLimit'],
		func: function(unexpectedValue, iterationLimit) {
			if (this.actual.toString().indexOf(unexpectedValue) == -1) {
				this.log(this.passString + ' did not contain the incorrect value:\n' + unexpectedValue + '\n');
			} else {
				this.log(this.failString + ' contained the unexpected value:\n' + unexpectedValue + '\n');
			}
		},
	},
};

/**
* @method expect The function that runs the test of the given name and prints the result to the console
* @param testName The name of the test
* @param expectedValue [optional - needed for some tests but not others] The expected value to test the actual value against
* @param iterationLimit [optional] The maximum number of times to run this particular test. Once over the maximum the test won't be run. If not given, then the maximum is infinite.
* @return This TestItem (to be passed to other tests)
*/
TestItem.prototype.expect = function(testName, expectedValue, iterationLimit) {
	var testingFunction;
	var args;
	if (this.testingOn) {
		if (testName in this.tests) {
			args = Array.prototype.slice.call(arguments, 1); // the args to send to the test function don't include the testName which is in arguments[0]
			iterationLimit = this.getIterationLimit(testName, args);
			if (this.checkIterations(testName, iterationLimit)) {
				testingFunction = this.tests[testName].func; //using the testName as the key, we get back a function that runs that test
				testingFunction.apply(this,args); //now we run the test function, passing on the args (but without the testName included)
			}
		} else {
			this.log('\n***Error: "' + testName + '" is not the name of a known test\n');
		}
	}
	return this; // after having run the test, we return "this", which is the TestItem object, so that further tests can be run
}

/**
* @method getIterationLimit Finds the current iteration limit for the current test
* @return The iteration limit (an integer) - can be undefined if no iteration limit was given
*/
TestItem.prototype.getIterationLimit = function(testName, argArray) {
	var testArgs = this.tests[testName].args;
	var iterationLimitIndex = testArgs.indexOf('iterationLimit');
	return argArray[iterationLimitIndex];
}

/**
* @method printActual Simply prints the actual value (the value being tested) to the console
* @return This TestItem (to be passed to other tests)
*/
TestItem.prototype.printActual = function(iterationLimit) {
	if (this.testingOn && this.checkIterations('printActual', iterationLimit)) {
		this.log('\n Actual result is:\n' + this.actual.toString() + '\n');
	}
	return this;
}

/**
* @method log Prints the given message to the console if testing is turned On
* @param message
*/
TestItem.prototype.log = function(message) {
	if (this.testingOn) {
		console.log(message);
	}
}


/**
* @parameter passString The beginning of the line printed when a test passes
*/
TestItem.prototype.passString = '\nPass: the returned result ';

/**
* @parameter failString The beginning of the line printed when a testfails
*/
TestItem.prototype.failString = '\n***FAIL: the returned result ';

/**
* @parameter errorString The beginning of the line printed when there is an error attempting to run a test
*/
TestItem.prototype.errorString = '\n***TnT ERROR: ';

/**
* @method endTests This method should be called at the end of a chain of tests to return the value that was being tested, just as if the function was called without any tests attached
*/
TestItem.prototype.endTests = function() {
	return this.actual;
}

/**
* @method checkIterations Checks to see whether the current number of iterations is less than the iterationLimit
* return true if it is, false if we have reached the iterationLimit
* or if no iterationLimit is given, return true, as any number of iterations is OK
* @param testName The test being run
* @param iterationLimit The max number of iterations allowed for running the current test
*/
TestItem.prototype.checkIterations = function(testName, iterationLimit) {
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

/**
* @method resetIterations Resets the iteration number of the given test to 0...or if there is no testName given, reset all iteration numbers for all tests
* @param testName The test for which to reset the iterations
*/
TestItem.prototype.resetIterations = function(testName) {
	var i;
	if (testName) {
		this.iterations[testName] = 0;
	} else {
		for (i in iterations) {
			this.iterations[i] = 0;
		}
	}
}