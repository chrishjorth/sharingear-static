/**
 * @author: Chris Hjorth
 */

'use strict';

define(
	['jquery', 'chai', 'sinon', 'app'],
	function($, chai, Sinon, App) {
		var expect = chai.expect;
		
		describe('App', function() {
			beforeEach(function() {
				this.$fixtures = $('#fixtures');
				this.$fixtures.html('<div class="navigation-header"></div><div class="footer"></div>');
				this.navigateToSpy = sinon.stub(App.router, 'navigateTo', function() {
					//Empty function
				});
				this.loginStatusSpy = sinon.stub(App.user, 'getLoginStatus', function(callback) {
					callback({
						status: null //We simulate the situation of a user that is not logged in. The initialization of Sharingear is the same anyhow for this module.
					});
				});
				this.setUserLocationSpy = sinon.spy(App, 'setUserLocation');
				this.loadHeaderSpy = sinon.spy(App, 'loadHeader');
				this.loadFooterSpy = sinon.spy(App, 'loadFooter');
			});

			afterEach(function() {
				App.user.getLoginStatus.restore();
				App.router.navigateTo.restore();
				App.setUserLocation.restore();
				App.loadHeader.restore();
				App.loadFooter.restore();
				this.$fixtures.empty();
			});

			it('Provides the app object', function() {
				expect(App).to.be.an('object');
				expect(App.isProduction).to.be.a('function');
				expect(App.API_URL).to.be.a('string');
				expect(App.run).to.be.a('function');
			});

			it('Has correct API URL', function() {
				if(App.isProduction() === true) {
					expect(App.API_URL).to.equal('https://prod-api.sharingear.com');
				}
				else {
					expect(App.API_URL).to.equal('https://api.sharingear.com');
				}
			});

			it('Can initialize Sharingear', function(done) {
				var spec = this;
				App.run(function() {
					expect(App.router).to.be.an('object');
					expect(App.router.routes).to.be.an('array');
					expect(App.user).to.be.an('object');
					sinon.assert.calledOnce(spec.loginStatusSpy);
					expect(App.gearClassification).to.be.an('object');
					expect(App.localization).to.be.an('object');
					sinon.assert.calledOnce(spec.setUserLocationSpy);
					sinon.assert.calledOnce(spec.loadHeaderSpy);
					sinon.assert.calledWith(spec.loadHeaderSpy, App.$headerContainer);
					//sinon.assert.calledOnce(spec.loadFooterSpy);
					//sinon.assert.calledWith(spec.loadFooterSpy, App.$footerContainer);
					sinon.assert.calledOnce(spec.navigateToSpy);
					sinon.assert.calledWith(spec.navigateToSpy, 'home');
					done();
				});
			});

			it('Has correct routes', function() {
				var router = App.router;
				expect(router.routeExists('home')).to.equal(true);
				expect(router.routeExists('dashboard')).to.equal(true);
				expect(router.routeExists('dashboard/profile')).to.equal(true);
				expect(router.routeExists('dashboard/yourgear')).to.equal(true);
				expect(router.routeExists('dashboard/yourrentals')).to.equal(true);
				expect(router.routeExists('dashboard/yourreservations')).to.equal(true);
				expect(router.routeExists('dashboard/calendar')).to.equal(true);
				expect(router.routeExists('dashboard/settings')).to.equal(true);
				expect(router.routeExists('gearprofile')).to.equal(true);
				expect(router.routeExists('aboutus')).to.equal(true);
				expect(router.routeExists('contactus')).to.equal(true);
				expect(router.routeExists('terms')).to.equal(true);
				expect(router.routeExists('copyright')).to.equal(true);
				expect(router.routeExists('privacy')).to.equal(true);
				expect(router.routeExists('editgear')).to.equal(true);
				expect(router.routeExists('gearbooking')).to.equal(true);
				expect(router.routeExists('gearavailability')).to.equal(true);
				expect(router.routeExists('booking')).to.equal(true);
				expect(router.routeExists('payment')).to.equal(true);
				expect(router.routeExists('paymentsuccessful')).to.equal(true);
				expect(router.routeExists('submerchantregistration')).to.equal(true);
				expect(router.routeExists('closedbeta')).to.equal(true);
			});

			it('Can set user location', function(done) {
				App.setUserLocation('Copenhagen', function() {
					expect(App.user.data.currentCity).to.be.a('string');
					expect(App.user.data.currentCity.length).to.be.above(0);
					done();
				});
			});

			it('Can load the header', function(done) {
				App.loadHeader(App.$headerContainer, function() {
					expect(App.header.name).to.equal('header');
					done();
				});
			});

			it.skip('Can load the footer', function(done) {
				App.loadFooter(App.$footerContainer, function() {
					expect(App.footer.name).to.equal('footer');
					done();
				});
			});

			it('Can handle cookie warning');
		});
	}
);
