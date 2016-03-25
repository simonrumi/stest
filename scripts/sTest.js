'use strict';

/**
* @example
* To use do something like this:
*
* 	var myTestableObj = new Testable();
*
* 	myTestableObj.addFunction('addNums', function(num1, num2) {
* 		// write your function as usual here
* 		return num1 + num2;
* 	});
*
* use the function with tests in-line like this:
*
* 	var fourPlusFive = myTestableObj.addNums(4,5)
*		.describe('Testing addNums(4,5)')
*		.expect('something')
*		.expect('toBe', 9)
*		.endTests();
*
* ...note that you always have to end with endTests(), even if you ran no tests, in order to return the value output by the function.
*
* If you want to test just a raw value (rather than the output of a function) you can do this:
*
* 	var myTestableObj = new Testable();
*	myTestableObject.testRawValue(myValue)
*		.describe('testing myValue')
*		.expect('something')
*		.expect('toBe', 'The answser is 42')
*		.endTests();
*
* For a listing of all the available tests, look at TestItem -> Attributes (the available tests aren't really attributes, but 'Attributes' was a place to list them)
*
* @module STest
*
* @class Testable
* @constructor
*/
var Testable = function Testable() {
	/**
	* Each Testable object keeps a collection of TestItems, where the key is the name of the function and the value is the TestItem. This is only for internal use by Testable
	*
	* @property {Object} _testItems
	* @private
	*/
	this._testItems = {};

	/**
	* Set to false to turn testing off for all functions in the Testable object.
	*
	* @property {Boolean} _testingOn
	* @default true
	* @private
	*/
	this._testingOn = true;
	
	/**
	* Set to false to avoid logging passes to the console.
	*
	* @property {Boolean} _logPasses
	* @default false
	* @private
	*/
	this._logPasses = true;

	/**
	* Used by testRawValue below, this value is a TestItem for testing raw values (rather than for testing functions)
	*
	* @property {TestItem} __testableSelf
	* @private
	*/
	this.__testableSelf;
}

/**
* Wraps a function so that it runs and can have its result tested
*
* @method addFunction
* @return {TestItem} A TestItem that contains the function
*/
Testable.prototype.addFunction = function(functionName, functionObj) {
	// put this function into the master collection of TestItems
	this.registerTestItem(functionName);

	// here we create the function as a property of this current instance (a Testable object)
	// so you can run the function as something like myTestableObject.myFunction()
	this[functionName] = function () {
		var args = Array.prototype.slice.call(arguments, 0); //this turns arguments object into a regular Array, explanation here: https://shifteleven.com/articles/2007/06/28/array-like-objects-in-javascript/
		var returnValue = functionObj.apply(this,args); //run the function, supplying whatever arguments were passed in, but save the returned result in returnValue
		var testItem = this.registerTestItem(functionName, returnValue); // associate the returnValue to be tested with the testItem in our collection of testItems
		return testItem; // return the testItem, which now knows the result to be tested and the name of the function that generated the result
	};
}

/**
* This is used by addFunction to register TestItems in the _testItems collection
* and associate the result being tested with it. (If the TestItem has previously been added to _testItems, it is not added twice)
*
* @method registerTestItem
* @param {String} functionName The name of the function
* @param {any} resultToTest The value returned by the function that is to be tested
* @return {TestItem} The TestItem, now registered and with the resultToTest associated with it
* @private
*/
Testable.prototype.registerTestItem = function(functionName, resultToTest) {
	if (this._testItems[functionName]) {
		this._testItems[functionName].actual = resultToTest;
	} else {
		this._testItems[functionName] = new TestItem(resultToTest, this._testingOn, this._logPasses);
	}
	return this._testItems[functionName];
}

/**
* As well as testing values returned by functions as they are executed, we also want the ability to run tests on values that we have gotten from a means other than by running Testable functions.
* Hence testRawValue allows you to run all the TestItem tests on just a raw value that you hand it
*
* @method testRawValue
* @param {any} rawValue A value or object to test
* @return {any} returns the rawValue you gave it.
*/
Testable.prototype.testRawValue = function(rawValue) {
	// register a TestItem to represent this Testable object.
	// Usually registerTestItem is used to register functions, but here we are giving it a key name of '__testableSelf' in order to get back a TestItem that we can sue for testing
	this.__testableSelf = this.registerTestItem('__testableSelf', rawValue);
	return this.__testableSelf;
}

/**
* Used for turning tests on or off
*
* @method setTestingOn
* @param {Boolean} testingOn Set to true to turn testing on or false to turn testing off
* @param {String} functionName [optional] If given this turns testing on/off for just the given function, otherwise all functions will have their testing turned on/off TODO currently not working
*/
Testable.prototype.setTestingOn = function(testingOn, functionName) {
	var i;
	if (functionName) {
		this._testItems[functionName].testingOn = testingOn;
	} else {
		for (i in this._testItems) {
			this._testItems[i].testingOn = testingOn;
		}
		this._testingOn = testingOn;
	}
}

/**
* If true passed to this, then only the tests that fail will be logged to the screen, for all tests. If false is passed, then both passes and fails will be logged
*
* @method logPasses
* @param {Boolean} logPassesBool If false then Passes will not be logged to the console, if true, then both passes & failures will be logged.
*/
Testable.prototype.logPasses = function (logPassesBool) {
	this._logPasses = logPassesBool;
}
/**
* An object that knows the name of a function and a result, generated by that function, to be tested. It also contains the logic for a series of tests.
* It is expected to be given a result from a Testable object and to run one or more of its tests on it. Reporting is printed to the console;
* The last function called needs to be endTests() which will pass through the result, even if the test(s) failed.
* If a test is called within a looping function, the number of tests run can be reduced by adding an iteration limit.
* This will stop the test results printing after that limit, but won't stop the function executing.
* The iteration limit is added as the last parameter to the test function.
*
* @class TestItem
* @constructor
* @param {any} resultToTest the value that has been generated by some function which is being tested against an expected value
* @param {Boolean} testingOn true if tests are to be run, false if not
* @param {Boolean} logPasses true if passes are to be logged to the console, false if not
*/
var TestItem = function(resultToTest, testingOn, logPasses) {
	this.actual = resultToTest;
	this._testingOn = testingOn;
	this._logPasses = logPasses;
	this._failString = this._failAsFailString; // initialize the defalut value of the _failString

	// this.iterations will be populated with the number of iterations for each test, like this
	// {'toBe': 2, 'type': 1, etc}
	this.iterations = {};
};

/**
* Print out a description of the test(s)
*
* @method describe
* @return This TestItem (to be passed to other tests)
*/
TestItem.prototype.describe = function(description, iterationLimit) {
	if (this._testingOn && this.checkIterations('describe', iterationLimit)) {
		this.log('\n____________________\n' + description);
	}
	return this;
};

/**
* An object that contains functions which are the individual tests that are to be run, in turn, by the expect() function
* Any new tests needed should be coded in here.
* Note that the name 'iterationLimit' is a special name and should not be varied
*
* See the Attributes section for a listing of all the tests
*
* @property tests
* @type Object
*/
TestItem.prototype.tests = {

	/**
	* Logs a PASS if the result being tested returns anything that is not null or an empty string, Logs a FAIL if not
	*
	* @example
	* 	var fourPlusFive = myTestableObj.addNums(4,5)
	*		.describe('Testing addNums(4,5)')
	*		.expect('something')
	*		.endTests();
	*
	* @attribute something
	*/
	'something': {
	args: ['iterationLimit'],
	func: function() {
			if (this.actual == null || this.actual === '') {
				this.log(this._failString + ' has no value\n');
			} else {
				this.log(this._passString + ' has some value\n');
			}
		},
	},

	/**
	* Logs a PASS if the result being tested returns true, Logs a FAIL if not
	*
	* @example
	* 	var isCorrect = myTestableObj.checkForCorrectness(myValue)
	*		.describe('Testing checkForCorrectness()')
	*		.expect('true')
	*		.endTests();
	*
	* @attribute true
	*/
	'true': {
		args: ['iterationLimit'],
		func: function() {
			if (this.actual) {
				this.log(this._passString + ' is true or has a truthy value\n');
			} else {
				this.log(this._failString + ' is false or has a falsey value, whereas "true" was expected\n');
			}
		},
	},

	/**
	* Logs a PASS  if the result being tested returns false, Logs a FAIL if not
	*
	* @example
	* 	var isNotCorrect = myTestableObj.checkForIncorrectness(myValue)
	*		.describe('Testing checkForIncorrectness()')
	*		.expect('false')
	*		.endTests();
	*
	* @attribute false
	*/
	'false': {
		args: ['iterationLimit'],
		func: function() {
			if (!this.actual) {
				this.log(this._passString + ' is false or has a falsey value\n');
			} else {
				this.log(this._failString + ' is true or has a truthy value, whereas "false" was expected\n');
			}
		},
	},

	/**
	* Logs a PASS  if the result being tested equals the expected value (the 2nd parameter), Logs a FAIL if not
	*
	* @example
	* 	var mySum = myTestableObj.addNums(4,5)
	*		.describe('Testing addNums(4,5)')
	*		.expect('toBe', 9)
	*		.endTests();
	*
	* @attribute toBe
	*/
	'toBe': {
		args: ['expectedValue', 'iterationLimit'],
		func: function(expectedValue, iterationLimit) {
			if (this.actual == expectedValue) {
				this.log(this._passString + ' has the expected value:\n' + expectedValue);
			} else {
				this.log(this._failString + ' has the value:\n' + this.actual
					+ '\n...but it was expected to be:\n' + expectedValue + '\n');
			}
		},
	},

	/**
	* Logs a PASS  if the result being tested is an object of the expected type (the 2nd parameter), Logs a FAIL if not.
	* Note that you can check for a fundamental type by passing in the 1st parameter as either String, Array, Number or Boolean
	* or by passing in a string, like 'number', 'string', etc (the strings are case insensitive)
	*
	* @example
	* 	var myCar = myTestableObj.getCarObj()
	*		.describe('Testing getCarObj()')
	*		.expect('type', Car)
	*		.endTests();
	*
	* @attribute type
	*/
	'type': {
		args: ['expectedType', 'iterationLimit'],
		func: function(expectedType, iterationLimit) {
			var typeofActual = typeof this.actual;
			var expectedTypeRegex;

			if ((typeof expectedType).match(/string/i)) {
				// in this case the expectedType is a string with the name of a javascript core type - 'number', 'string', 'boolean', (and maybe 'null', 'undefined',  or 'symbol')
				expectedTypeRegex = new RegExp(expectedType, 'i');
				if (typeofActual.match(expectedTypeRegex)) {
					this.log(this._passString + ' is of the expected type ' + expectedType + '\n');
				} else if (expectedType.match(/Array/i)) {
					// this is for dealing with the forgivable error that you thought an Array was a core type (like String or Number)
					// Then you might pass in expectedType as the string 'Array'
					if(this.actual instanceof Array) {
						this.log(this._passString + ' is an Array\n');
					} else {
						this.log(this._failString + ' is NOT an Array\n');
					}
				} else {
					this.log(this._failString + ' is NOT of the expected type ' + expectedType + ', it is of type ' + typeofActual + '\n');
				}
			} else {
				// in this case the expectedType is actually an object of some sort and we use instanceof to check for a match
				if (this.actual instanceof expectedType) {
					this.log(this._passString + ' is an instance of the expected type\n');
				} else if (expectedType.name) {
					// for some types (particularly Sting, Boolean and Number) you can't do, for example:
					// 	myString instanceof String
					// ...and get the expected answer, so instead we do this
					expectedTypeRegex = new RegExp(expectedType.name, 'i');
					if (typeofActual.match(expectedTypeRegex)) {
						this.log(this._passString + ' is of the expected type ' + expectedType.name + '\n');
					} else {
						this.log(this._failString + ' is NOT of the expected type ' + expectedType.name + ', it is of type ' + typeofActual + '\n');
					}
				} else {
					this.log(this._failString + ' is NOT an instance of the expected type\n');
				}
			}
		},
	},

	/**
	* Logs a PASS if the result being tested is an HTMLElement.
	* If a 2nd parameter is given specifying the particular element then a PASS will be given only if the result is exactly that type.
	* Logs a FAIL otherwise
	*
	* @example
	* 	var myDiv = myTestableObj.getContainerDiv('#container')
	*		.describe('Attempting to get the div with the id #container')
	*		.expect('htmlElement', HTMLDivElement)
	*		.endTests();
	*
	* @attribute htmlElement
	*/
	'htmlElement': {
		args: ['expectedType', 'iterationLimit'],
		func: function(expectedType, iterationLimit) {
			if (!expectedType) {
				expectedType = HTMLElement;
			}
			if (this.actual instanceof expectedType) {
				this.log(this._passString + ' is an HTML element of the type ' + expectedType.name + '\n');
			} else {
				this.log(this._failString + ' is NOT an HTML element of the type ' + expectedType.name + '\n');
			}
		},
	},

	/**
	* Logs a PASS if the String being tested contains the String given as the 2nd parameter.
	* Logs a FAIL otherwise
	*
	* @example
	* 	var fullName = myTestableObj.getFullName()
	*		.describe("Getting Bob's full name")
	*		.expect('contains', 'Bob')
	*		.endTests();
	*
	* @attribute contains
	*/
	'contains': {
		args: ['expectedValue', 'iterationLimit'],
		func: function(expectedValue, iterationLimit) {
			if (this.actual.toString().indexOf(expectedValue) == -1) {
				this.log(this._failString + ' does not contain the expected value:\n'
					+ expectedValue + '\n');
			} else {
				this.log(this._passString + ' contains the expected value:\n' + expectedValue + '\n');
			}
		},
	},

	/**
	* Logs a PASS if the String being tested contains the String given as the 2nd parameter.
	* Logs a FAIL otherwise
	*
	* @example
	* 	var fullName = myTestableObj.getFullName()
	*		.describe('Getting the full name of someone other than Mary')
	*		.expect('doesNotContain', 'Mary')
	*		.endTests();
	*
	* @attribute doesNotContain
	*/
	'doesNotContain': {
		args: ['unexpectedValue', 'iterationLimit'],
		func: function(unexpectedValue, iterationLimit) {
			if (this.actual.toString().indexOf(unexpectedValue) == -1) {
				this.log(this._passString + ' did not contain the incorrect value:\n' + unexpectedValue + '\n');
			} else {
				this.log(this._failString + ' contained the unexpected value:\n' + unexpectedValue + '\n');
			}
		},
	},
};

/**
* The function that runs the test of the given name and prints the result to the console
*
* @method expect
* @param testName The name of the test
* @param expectedValue [optional - needed for some tests but not others] The expected value to test the actual value against
* @param iterationLimit [optional] The maximum number of times to run this particular test. Once over the maximum the test won't be run. If not given, then the maximum is infinite.
* @return This TestItem (to be passed to other tests)
*/
TestItem.prototype.expect = function(testName, expectedValue, iterationLimit) {
	var testingFunction;
	var args;
	if (this._testingOn) {
		if (testName in this.tests) {
			args = Array.prototype.slice.call(arguments, 1); // the args to send to the test function don't include the testName which is in arguments[0]
			iterationLimit = this.getIterationLimit(testName, args);
			if (this.checkIterations(testName, iterationLimit)) {
				testingFunction = this.tests[testName].func; //using the testName as the key, we get back a function that runs that test
				testingFunction.apply(this,args); //now we run the test function, passing on the args (but without the testName included)
			}
		} else {
			this.log(this._errorString + testName + '" is not the name of a known test\n');
		}
	}
	return this; // after having run the test, we return "this", which is the TestItem object, so that further tests can be run
}

/**
* Finds the current iteration limit for the current test
*
* @method getIterationLimit
* @return The iteration limit (an integer) - can be undefined if no iteration limit was given
*/
TestItem.prototype.getIterationLimit = function(testName, argArray) {
	var testArgs = this.tests[testName].args;
	var iterationLimitIndex = testArgs.indexOf('iterationLimit');
	return argArray[iterationLimitIndex];
}

/**
* Simply prints the actual value (the value being tested) to the console
*
* @method printActual
* @return This TestItem (to be passed to other tests)
*/
TestItem.prototype.printActual = function(iterationLimit) {
	if (this._testingOn && this.checkIterations('printActual', iterationLimit)) {
		this.log('\n Actual result is:\n' + this.actual.toString() + '\n');
	}
	return this;
}

/**
* Prints the given message to the console if testing is turned On. Also checks to see whether we should only log failures.
*
* @method log
* @param message
*/
TestItem.prototype.log = function(message) {
	var passStringRegex;
	if (this._testingOn) {
		if (this._logPasses) {
			// we are logging messages whether or not they are passes
			console.log(message);
		} else {
			// only print to the console if the passString is not in the message
			passStringRegex = new RegExp(this._passString);
			if (!passStringRegex.test(message)) {
				console.log(message);
			} 
		}
	}
}

/**
* Prints the test failures as warnings instead of outright failures
*
* @method printAsWarning
* @return This TestItem (to be passed to other tests)
*/
TestItem.prototype.printAsWarning = function() {
	if (this._testingOn) {
		this._failString = this._failAsWarningString;
	}
	return this;
}


/**
* The beginning of the line printed when a test passes
*
* @property _passString
* @type String
* @private
*/
TestItem.prototype._passString = '\nPass: the returned result ';

/**
* The beginning of the line printed when a test fails but we just want to call it a warning
*
* @property _failAsWarningString
* @type String
* @private
*/
TestItem.prototype._failAsWarningString = '\n** WARNING: the returned result ';

/**
* The beginning of the line printed when a test fails and we want to call it a failure
*
* @property _failAsFailString
* @type String
* @private
*/
TestItem.prototype._failAsFailString = '\n*** FAIL: the returned result ';

/**
* The beginning of the line printed when there is an error attempting to run a test.
* This is set as either the _failAsWarningString or _failAsFailString
*
* @property _failString
* @type String
* @default The value of the property _failAsFailString
* @private
*/
TestItem.prototype._failString = TestItem._failAsFailString;

/**
* The beginning of the line printed when there is an error attempting to run a test
*
* @property _errorString
* @type String
* @private
*/
TestItem.prototype._errorString = '\n*** sTest ERROR: ';



/**
* This method should be called at the end of a chain of tests to return the value that was being tested, just as if the function was called without any tests attached
*
* @method endTests
* @return {any} the original value, returned by the function, that has been tested
*/
TestItem.prototype.endTests = function() {
	this._failString = this._failAsFailString; // resetting this in case it was set to _failAsWarningString
	return this.actual;
}

/**
* Checks to see whether the current number of iterations is less than the iterationLimit
* return true if it is, false if we have reached the iterationLimit
* or if no iterationLimit is given, return true, as any number of iterations is OK
*
* @method checkIterations
* @param {String} testName The test being run
* @param {int} iterationLimit The max number of iterations allowed for running the current test
* @return {Boolean} false if the iteration limit has been reached, true if not
* @private
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
* Resets the iteration number of the given test to 0. Or if there is no testName given, reset all iteration numbers for all tests
*
* @method resetIterations
* @param {String} [optional] testName The test for which to reset the iterations
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
