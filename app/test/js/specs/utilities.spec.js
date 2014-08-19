/**
 * @author: Chris Hjorth
 */
define(
	['underscore', 'jquery', 'chai', 'sinon', 'utilities'],
	function(_, $, chai, Sinon, Utilities) {
		var expect = chai.expect;
		
		describe('Utilities', function() {
			it('Can inherit', function() {
				var testParent, testChildConstructor, testChild;

				function testParentConstructor(options) {
					this.testProperty = true;
					_.extend(this, options);
				}

				testChildConstructor = Utilities.inherit(testParentConstructor, {
					testProperty: false,
					anotherTestProperty: true
				});

				testParent = new testParentConstructor();
				testChild = new testChildConstructor();
				expect(testParent.testProperty).to.equal(true);
				expect(testChild.testProperty).to.equal(false);
				expect(testChild.anotherTestProperty).to.equal(true);
			});
		});
	}
);
