/**
 * Controller for the Sharingear payment success page view.
 * @author: Chris Hjorth
 */

'use strict';

define(
	['jquery', 'config', 'viewcontroller', 'app', 'models/booking', 'moment', 'models/localization'],
	function($, Config, ViewController, App, Booking, Moment, Localization) {
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
				rootURL: Config.API_URL
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
					//var startMoment, endMoment, duration, months, weeks, days, price, VAT, priceVAT, fee, feeVAT;
					var startMoment, endMoment, duration, months, weeks, days, price, fee;
					if(error) {
						console.log('Error getting booking info: ' + error);
						return;
					}

					startMoment = new Moment.tz(booking.data.start_time, 'YYYY-MM-DD HH:mm:ss', Localization.getCurrentTimeZone());
					endMoment = new Moment.tz(booking.data.end_time, 'YYYY-MM-DD HH:mm:ss', Localization.getCurrentTimeZone());

					duration = Moment.duration(endMoment.diff(startMoment));
					months = parseInt(duration.months(), 10);
					endMoment.subtract(months, 'months');
					duration = Moment.duration(endMoment.diff(startMoment));
					weeks = parseInt(duration.weeks(), 10);
					endMoment.subtract(weeks, 'weeks');
					duration = Moment.duration(endMoment.diff(startMoment));
					days = parseInt(duration.days(), 10);

					price = booking.data.renter_price;
					//VAT = Localization.getVAT(App.user.data.country);
					//priceVAT = price / 100 * VAT;
					fee = price / 100 * App.user.data.buyer_fee;
					//feeVAT = fee / 100 * VAT;

					view.templateParameters = {
						brand: view.gear.data.brand,
						subtype: view.gear.data.subtype,
						model: view.gear.data.model,
						start_date: startMoment.format('DD/MM/YYYY HH:mm'),
						end_date: endMoment.format('DD/MM/YYYY HH:mm'),
						currency: booking.data.renter_currency,
						//vat: VAT,
						vat: '',
						price: price,
						//price_vat: priceVAT,
						price_vat: '',
						fee: fee,
						//fee_vat: feeVAT,
						fee_vat: '',
						//total: price + priceVAT + fee + feeVAT
						total: (price + fee).toFixed(2)
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
