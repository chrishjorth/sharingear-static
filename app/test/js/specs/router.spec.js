/**
 * @author: Chris Hjorth
 */

'use strict';

define(
	['jquery', 'chai', 'sinon', 'router', 'viewloader'],
	function($, chai, Sinon, Router, ViewLoader) {
		var expect = chai.expect;
		
		describe('Router', function() {
			before(function() {
				sinon.stub(ViewLoader, 'loadView', function(view, path, data, callback) {
					callback(null, {
						name: view
					});
				});
				this.loadModalViewStub = sinon.stub(ViewLoader, 'loadModalView', function(view, path, data, callback) {
					if(ViewLoader.currentModalViewController !== null) {
						//Simulate close
						ViewLoader.openModalViews.pop();
						Router.currentViewController = null;
					}
					ViewLoader.currentModalViewController = {
						name: view,
						close: function() {}
					};
					callback(null, ViewLoader.currentModalViewController);
				});
			});

			beforeEach(function() {
				
			});

			afterEach(function() {
				
			});

			after(function() {
				ViewLoader.loadView.restore();
				ViewLoader.loadModalView.restore();
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
				Router.navigateTo('home', null, function() {
					expect(Router.currentViewController.name).to.equal('home');
					done();
				});
			});

			it('Can navigate to path', function(done) {
				Router.addRoutes('dashboard');
				Router.navigateTo('dashboard/profile', null, function() {
					expect(Router.currentViewController.name).to.equal('dashboard');
					done();
				});
			});

			it('Can navigate to view with querystring', function(done) {
				Router.navigateTo('home?key=value', null, function() {
					expect(Router.currentViewController.name).to.equal('home');
					done();
				});
			});

			it('Can handle modal views', function(done) {
				var spec = this,
					passed = false;

				Router.openModalView('home', null, function() {
					expect(Router.currentModalViewController.name).to.equal('home');
					expect(ViewLoader.openModalViews.length).to.equal(1);
					
					Router.openModalSiblingView('dashboard', null, function() {
						if(passed === false) { //This callback will be triggered again by the last close modal view, since it will resurface this view
							passed = true;
							expect(Router.currentModalViewController.name).to.equal('dashboard');
							expect(ViewLoader.openModalViews.length).to.equal(1);
						
							Router.openModalView('home', null, function() {
								//This one does not trigger a load modal view because it gets queued instead
								expect(Router.currentModalViewController.name).to.equal('dashboard');
								expect(ViewLoader.openModalViews.length).to.equal(2);
								
								Router.closeModalView(function() {
									expect(spec.loadModalViewStub.callCount).to.equal(3);
									expect(ViewLoader.openModalViews.length).to.equal(1);
									done();
								});
							});
						}
					});
				});
			});

			it('Has default error route', function() {
				expect(Router.routeExists('error')).to.equal(true);
			});

			it('Can handle URL hash change', function() {
				expect(window.onhashchange).to.be.a('function');
				sinon.stub(Router, 'handleHashChange', function() {
					var navigateToSpy;
					Router.handleHashChange.restore();

					navigateToSpy = sinon.spy(Router, 'navigateTo');
					Router.handleHashChange();
					sinon.assert.calledOnce(navigateToSpy);
					Router.navigateTo.restore();

					done();
				});
				window.location.hash = '#dashboard';
			});
		});
	}
);
