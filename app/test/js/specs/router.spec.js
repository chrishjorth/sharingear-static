define(
	['jquery', 'chai', 'sinon', 'router'],
	function($, chai, Sinon, Router) {
		var expect = chai.expect;
		
		describe('Router', function() {
			it('Provides the router object', function() {
				expect(Router).to.be.an('object');
			});

			it('Can verify that a route exists', function() {
				expect(Router.routeExists('error')).to.equal(true);
				expect(Router.routeExists('test')).to.equal(false);
				expect(Router.routeExists()).to.equal(false);
				expect(Router.routeExists('')).to.equal(false);
				expect(Router.routeExists(null)).to.equal(false);
				expect(Router.routeExists('Error')).to.equal(false);
			});

			it('Has error route', function() {
				expect(Router.routeExists('error')).to.equal(true);
			});

			it('Can add routes', function() {
				Router.addRoutes('home');
				expect(Router.routeExists('home')).to.equal(true);
			});

			it('Can load a view', function(done) {
				Router.loadView('error', function() {
					expect(Router.currentViewController.name).to.equal('error');
					done();
				});
			});

			it('Can navigate to route', function(done) {
				Router.navigateTo('home', function() {
					expect(Router.currentViewController.name).to.equal('home');
					Router.navigateTo('error', function() {
						expect(Router.currentViewController.name).to.equal('error');
						Router.navigateTo('nonexistingroute', function() {
							expect(Router.currentViewController.name).to.equal('error');
							done();
						});
					});
				});
			});
		});
	}
);
