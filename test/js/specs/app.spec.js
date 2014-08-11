define(
	['jquery', 'chai', 'sinon', 'app'],
	function($, chai, Sinon, App) {
		var expect = chai.expect;
		
		describe('App', function() {
			beforeEach(function() {
				sinon.spy(App, 'loadHeader');
				sinon.spy(App, 'loadFooter');
			});

			afterEach(function() {
				App.loadHeader.restore();
				App.loadFooter.restore();
			});

			it('Provides the app object', function() {
				expect(App).to.be.an('object');
			});

			it('Can load header', function(done) {
				App.loadHeader(function() {
					done();
				});
			});

			it('Can load footer', function(done) {
				App.loadFooter(function() {
					done();
				});
			});

			it('Can initialize Sharingear', function(done) {
				App.run(function() {
					sinon.assert.calledOnce(App.loadHeader);
					sinon.assert.calledOnce(App.loadFooter);

					expect(App.router.currentViewController.name).to.equal('home');

					done();
				});
			});
		});
	}
);
