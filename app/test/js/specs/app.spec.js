define(
	['jquery', 'chai', 'sinon', 'app'],
	function($, chai, Sinon, App) {
		var expect = chai.expect;
		
		describe('App', function() {
			before(function(done) {
				sinon.spy(App, 'loadHeader');
				sinon.spy(App, 'loadFooter');
				App.run(function() {
					done();
				});
			});

			after(function() {
				App.loadHeader.restore();
				App.loadFooter.restore();
			});

			it('Provides the app object', function() {
				expect(App).to.be.an('object');
			});

			it('Can initialize Sharingear', function() {
				sinon.assert.calledOnce(App.loadHeader);
				sinon.assert.calledOnce(App.loadFooter);

				expect(App.router.currentViewController.name).to.equal('home');
			});

			it('Has correct routes', function() {
				var router = App.router;
				expect(router.routeExists('home')).to.equal(true);
				expect(router.routeExists('listyourgear')).to.equal(true);
				expect(router.routeExists('profile')).to.equal(true);
				expect(router.routeExists('yourgear')).to.equal(true);
				expect(router.routeExists('yourreservations')).to.equal(true);
			});
		});
	}
);
