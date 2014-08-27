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
				expect(router.routeExists('dashboard')).to.equal(true);
				expect(router.routeExists('dashboard/profile')).to.equal(true);
				expect(router.routeExists('dashboard/yourgear')).to.equal(true);
				expect(router.routeExists('dashboard/yourreservations')).to.equal(true);
				expect(router.routeExists('dashboard/calendar')).to.equal(true);
				expect(router.routeExists('dashboard/settings')).to.equal(true);
				expect(router.routeExists('gearprofile')).to.equal(true);
				expect(router.routeExists('aboutus')).to.equal(true);
				expect(router.routeExists('contactus')).to.equal(true);
				expect(router.routeExists('insurance')).to.equal(true);
				expect(router.routeExists('privacy')).to.equal(true);
				expect(router.routeExists('editgear')).to.equal(true);
				expect(router.routeExists('gearpricing')).to.equal(true);
			});
		});
	}
);
