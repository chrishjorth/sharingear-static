define(
	['jquery', 'chai', 'sinon', 'viewcontrollers/contactus'],
	function($, chai, Sinon, ContactUs) {
		var expect = chai.expect;
		
		describe('Contact us ViewController', function() {
			it('Provides the Contact us ViewController', function() {
				var contactUsVC = new ContactUs();
				expect(ContactUs).to.be.a('function');
			});
		});
	}
);
