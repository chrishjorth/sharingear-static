define(
	['jquery', 'chai', 'sinon', 'router'],
	function($, chai, Sinon, Router) {
		var expect = chai.expect;
		
		describe('Router', function() {
			after(function() {
				//Reset routes
				Router.routes = ['error'];
				history.replaceState({}, '', window.location.pathname);
			});

			it('Provides the router object', function() {
				expect(Router).to.be.an('object');
				expect(Router.routes).to.be.an('array');
				expect(Router).to.have.property('currentViewController');
				expect(Router).to.have.property('currentModalViewController');
			});

			it('Can verify that a route exists', function() {
				expect(Router.routeExists).to.be.a('function');
				expect(Router.routeExists('error')).to.equal(true);
				expect(Router.routeExists('test')).to.equal(false);
				expect(Router.routeExists()).to.equal(false);
				expect(Router.routeExists('')).to.equal(false);
				expect(Router.routeExists(null)).to.equal(false);
				expect(Router.routeExists('Error')).to.equal(false);
			});

			/**
			 * @assertion: The app has a view, hence controller and template, for #home
			 */
			it('Can add routes', function() {
				expect(Router.addRoutes).to.be.a('function');
				Router.addRoutes('home');
				expect(Router.routeExists('home')).to.equal(true);
			});

			it('Can get route', function() {
				expect(Router.getRoute('home')).to.equal('home');
				expect(Router.getRoute('blahblah')).to.equal('error');
				expect(Router.getRoute('')).to.equal('error');
			});

			it('Can navigate to route', function(done) {
				sinon.stub(Router, 'loadView', function(view, path, data, callback) {
					Router.currentViewController = {
						name: view
					};
					callback();
				});
				Router.navigateTo('home', null, function() {
					expect(Router.currentViewController.name).to.equal('home');
					done();
				});
			});

			it.skip('Can navigate to path', function(done) {
				Router.addRoutes('dashboard');
				Router.navigateTo('dashboard/profile', null, function() {
					expect(Router.currentViewController.name).to.equal('dashboard');
					done();
				});
			});

			it.skip('Can load a view', function(done) {
				Router.loadView('error', '', null, function() {
					expect(Router.currentViewController.name).to.equal('error');
					done();
				});
			});

			it.skip('Can open a modal view', function(done) {
				Router.openModalView('error', null, function() {
					expect(Router.currentModalViewController.name).to.equal('error');
					done();
				});
			});

			it.skip('Can load a modal view', function(done) {
				Router.loadModalView('error', '', null, function() {
					expect(Router.currentModalViewController.name).to.equal('error');
					done();
				});
			});

			it.skip('Can close a modal view', function(done) {
				Router.loadModalView('error', '', null, function() {
					sinon.spy(Router.currentModalViewController, 'close');
					Router.closeModalView(function() {
						sinon.assert.calledOnce(Router.currentModalViewController.close);
						Router.currentModalViewController.close.restore();
						done();
					});
				});
			});

			it.skip('Has default error route', function() {
				expect(Router.routeExists('error')).to.equal(true);
			});
		});
	}
);
