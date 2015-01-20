/**
 * @author: Chris Hjorth
 */

'use strict';

define(
	['jquery', 'chai', 'sinon', 'viewloader', 'router', 'app', 'googlemaps'],
	function($, chai, Sinon, ViewLoader, Router, App, GoogleMaps) {
		var expect = chai.expect;

		describe('ViewLoader', function() {
			before(function() {
				this.$fixtures = $('#fixtures');
				this.$fixtures.html('<div class="view-container"></div><div class="modal-view-lightbox hidden"><div class="modal-view-container"></div></div>');
				sinon.stub(Router, 'navigateTo', function() {
					//We stub navigate to in order to avoid uncontrolled view loading requests
				});
				App.user.data.id = 3; //Set user to Chris Hjorth
				App.gearClassification = {
					data: {
						classification: {}
					}
				};
				//The search form in home view tries to run Google Maps Places Autocomplete
				sinon.stub(GoogleMaps.places, 'Autocomplete', function() {});
			});

			after(function() {
				this.$fixtures.empty();
				Router.navigateTo.restore();
				App.user.data = null;
				GoogleMaps.places.Autocomplete.restore();
			});

			it('Provides the ViewLoader object', function() {
				expect(ViewLoader).to.be.an('object');
				expect(ViewLoader).to.have.property('currentViewController');
				expect(ViewLoader).to.have.property('currentSubViewController');
				expect(ViewLoader).to.have.property('currentModalViewController');
				expect(ViewLoader).to.have.property('openModalViews');
				expect(ViewLoader.openModalViews).to.be.an('array');
			});

			it('Can load a view', function(done) {
				ViewLoader.loadView('error', 'error', {test: 'test'}, function(error, loadedViewController) {
					expect(loadedViewController.name).to.equal('error');
					expect(loadedViewController.path).to.equal('error');
					expect(loadedViewController.passedData.test).to.equal('test');
					done();
				});
			});

			it('Can load a view with subview', function(done) {
				ViewLoader.loadView('dashboard', 'dashboard/profile', {test: 'test'}, function(error, loadedViewController) {
					expect(loadedViewController.name).to.equal('dashboard');
					expect(loadedViewController.path).to.equal('dashboard/profile');
					expect(loadedViewController.passedData.test).to.equal('test');

					expect(ViewLoader.currentSubViewController.name).to.equal('dashboard-profile');
					expect(ViewLoader.currentSubViewController.path).to.equal('dashboard/profile');
					expect(ViewLoader.currentSubViewController.passedData.test).to.equal('test');

					done();
				});
			});

			it('Can load a subview', function(done) {
				ViewLoader.currentViewController.path = 'dashboard/yourgear';
				ViewLoader.currentViewController.subPath = 'yourgear';
				ViewLoader.loadSubview({test: 'test2'}, function(error, currentSubViewController) {
					expect(ViewLoader.currentViewController.name).to.equal('dashboard');
					expect(ViewLoader.currentViewController.path).to.equal('dashboard/yourgear');
					expect(ViewLoader.currentViewController.passedData.test).to.equal('test');

					expect(currentSubViewController.name).to.equal('dashboard-yourgear');
					expect(currentSubViewController.path).to.equal('dashboard/yourgear');
					expect(currentSubViewController.passedData.test).to.equal('test2');
					done();
				});
			});

			it('Can load a modal view', function(done) {
				ViewLoader.loadModalView('home', 'home', {test: 'test3'}, function(error, loadedViewController) {
					expect(loadedViewController.name).to.equal('home');
					expect(loadedViewController.path).to.equal('home');
					expect(loadedViewController.passedData.test).to.equal('test3');

					expect(ViewLoader.openModalViews.length).to.equal(1);

					done();
				});
			});

			it('Can load a modal view closing an opened modal view', function(done) {
				expect(ViewLoader.openModalViews.length).to.equal(1);
				ViewLoader.loadModalViewSibling('dashboard', 'dashboard/profile', {test: 'test4'}, function(error, loadedViewController) {
					expect(loadedViewController.name).to.equal('dashboard');
					expect(loadedViewController.path).to.equal('dashboard/profile');
					expect(loadedViewController.passedData.test).to.equal('test4');

					expect(ViewLoader.openModalViews.length).to.equal(1);

					done();
				});
			});

			it('Can queue a modal view', function(done) {
				var passed = false;
				ViewLoader.loadModalView('home', 'home', {test: 'test5'}, function(error, loadedViewController) {
					var queuedView;
					if(passed === false) {
						//Avoid running this again when the previous modal is closed
						passed = true;
						//The current modal view controller is still the one of the already open view
						expect(loadedViewController.name).to.equal('dashboard');
						expect(loadedViewController.path).to.equal('dashboard/profile');
						expect(loadedViewController.passedData.test).to.equal('test4');

						expect(ViewLoader.openModalViews.length).to.equal(2);

						queuedView = ViewLoader.openModalViews[0];
						expect(queuedView.view).to.equal('home');
						expect(queuedView.path).to.equal('home');
						expect(queuedView.data.test).to.equal('test5');

						done();
					}
				});
			});

			it('Can close a modal view', function(done) {
				ViewLoader.closeModalView(function() {
					expect(ViewLoader.openModalViews.length).to.equal(1);
					expect(ViewLoader.currentModalViewController.name).to.equal('home');
					expect(ViewLoader.currentModalViewController.path).to.equal('home');
					expect(ViewLoader.currentModalViewController.passedData.test).to.equal('test5');
					done();
				});
			});
		});
	}
);
