/**
 * Controller for the Sharingear payment success page view.
 * @author: Chris Hjorth
 */

'use strict';

define(
	['jquery', 'viewcontroller', 'app', 'models/booking', 'moment', 'models/localization'],
	function($, ViewController, App, Booking, Moment, Localization) {
		var didInitialize,
			didRender,

			handleClose;

		didInitialize = function () {
			var view = this,
				booking;

			view.paymentSuccessful = null; //null: waiting for server

			view.templateParameters = {
				brand: '',
				subtype: '',
				model: '',
				start_date: '',
				end_date: '',
				currency: 'DKK',
				vat: '',
				price: '',
				price_vat: '',
				fee: '',
				fee_vat: '',
				total: ''
			};

			this.gear = this.passedData.gear;

			booking = new Booking.constructor({
				rootURL: App.API_URL
			});
			booking.initialize();
			booking.data.id = this.passedData.bookingID;
			booking.data.preauth_id = this.passedData.preAuthorizationID;
			booking.data.booking_status = 'pending';
			booking.data.gear_id = this.gear.data.id;

			booking.update(App.user.data.id, function(error) {
				if(error) {
					console.log('Error updating booking: ' + error);
					view.paymentSuccessful = false;
					view.render();
					return;
				}

				booking.getBookingInfo(App.user.data.id, function(error){
					var startMoment, endMoment, duration, months, weeks, days, price, VAT, priceVAT, fee, feeVAT;
					if(error) {
						console.log('Error getting booking info: ' + error);
						return;
					}

					startMoment = new Moment(booking.data.start_time, 'YYYY-MM-DD HH:mm:ss');
					endMoment = new Moment(booking.data.end_time, 'YYYY-MM-DD HH:mm:ss');

					duration = Moment.duration(endMoment.diff(startMoment));
					months = parseInt(duration.months(), 10);
					endMoment.subtract(months, 'months');
					duration = Moment.duration(endMoment.diff(startMoment));
					weeks = parseInt(duration.weeks(), 10);
					endMoment.subtract(weeks, 'weeks');
					duration = Moment.duration(endMoment.diff(startMoment));
					days = parseInt(duration.days(), 10);

					price = booking.data.price;
					VAT = Localization.getVAT(App.user.data.country);
					priceVAT = price / 100 * VAT;
					fee = price / 100 * App.user.data.buyer_fee;
					feeVAT = fee / 100 * VAT;

					view.templateParameters = {
						brand: view.gear.data.brand,
						subtype: view.gear.data.subtype,
						model: view.gear.data.model,
						start_date: startMoment.format('DD/MM/YYYY'),
						end_date: endMoment.format('DD/MM/YYYY'),
						currency: 'DKK',
						vat: VAT,
						price: price,
						price_vat: priceVAT,
						fee: fee,
						fee_vat: feeVAT,
						total: price + priceVAT + fee + feeVAT
					};

					view.paymentSuccessful = true;
					view.render();
				});
			});
		};

		didRender = function () {
			if(this.paymentSuccessful === true) {
				$('.payment-success', this.$element).removeClass('hidden');
			}
			if(this.paymentSuccessful === false) {
				$('.payment-failure', this.$element).removeClass('hidden');
			}
			this.setupEvent('click', '#paymentsuccessful-close-btn', this, this.handleClose);
		};

		handleClose = function() {
			App.router.setQueryString('');
			App.router.closeModalView();
		};

		return ViewController.inherit({
			didInitialize: didInitialize,
			didRender: didRender,

			handleClose: handleClose
		});
	}
);
