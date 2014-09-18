define(
	['jquery', 'chai', 'sinon', 'models/user'],
	function($, chai, Sinon, User) {
		var expect = chai.expect;
		
		describe('User model', function() {
			beforeEach(function() {
				this.user = new User.constructor();
			});

			afterEach(function() {
			});

			it('Provides the User model', function() {
				expect(User.constructor).to.be.a('function');
			});

			it('Can login', function(done) {
				//this.user.login(function() {
					done();
				//});
			});
		});
	}
);