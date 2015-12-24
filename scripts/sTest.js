'use strict';

var STester = function STester() {
	this.loggingOn = true;
}

STester.prototype = {
	log: function(message) {
		if (this.loggingOn) {
			console.log(message);
		}
	},

	test: function(result, testCollection) {
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
	},
}