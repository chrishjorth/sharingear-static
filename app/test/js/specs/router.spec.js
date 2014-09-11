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

			it('Can get route', function() {
				expect(Router.getRoute('home')).to.equal('home');
				expect(Router.getRoute('blahblah')).to.equal('error');
				expect(Router.getRoute('')).to.equal('error');
			});

			it('Can navigate to route', function(done) {
				Router.navigateTo('home', null, function() {
					expect(Router.currentViewController.name).to.equal('home');
					Router.navigateTo('error', null, function() {
						expect(Router.currentViewController.name).to.equal('error');
						Router.navigateTo('nonexistingroute', null, function() {
							console.log('ERROR');
							expect(Router.currentViewController.name).to.equal('error');
							done();
						});
					});
				});
			});

			it('Can navigate to path', function(done) {
				Router.addRoutes('dashboard');
				Router.navigateTo('dashboard/profile', null, function() {
					expect(Router.currentViewController.name).to.equal('dashboard');
					done();
				});
			});

			it('Can load a view', function(done) {
				Router.loadView('error', '', null, function() {
					expect(Router.currentViewController.name).to.equal('error');
					done();
				});
			});

			it('Can open a modal view', function(done) {
				Router.openModalView('error', function() {
					expect(Router.currentModalViewController.name).to.equal('error');
					done();
				});
			});

			it('Can load a modal view', function(done) {
				Router.loadModalView('error', '', function() {
					expect(Router.currentModalViewController.name).to.equal('error');
					done();
				});
			});

			it('Can close a modal view', function(done) {
				Router.loadModalView('error', '', function() {
					sinon.spy(Router.currentModalViewController, 'close');
					Router.closeModalView(function() {
						sinon.assert.calledOnce(Router.currentModalViewController.close);
						Router.currentModalViewController.close.restore();
						done();
					});
				});
			});
		});
	}
);
