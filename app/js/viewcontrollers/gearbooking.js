/**
 * Controller for the Sharingear gear booking page view.
 * @author: Chris Hjorth
 */

'use strict';

define(
	['underscore', 'jquery', 'config', 'viewcontroller', 'utilities', 'app', 'models/gear', 'models/booking', 'models/localization', 'moment', 'popups/selecttime'],
	function(_, $, Config, ViewController, Utilities, App, Gear, Booking, Localization, Moment, SelectTimePopup) {
		var didInitialize,
			didRender,
			renderCalendar,
			renderPricing,
			calculatePrice,
			
			handleCancel,
			handlePickupSelection,
			handleDeliverySelection,
			handleNext;

		didInitialize = function() {
			var view = this;

			Moment.locale('en-custom', {
				week: {
					dow: 1,
					doy: 4
				}
			});

			this.gear = this.passedData.gear;
			this.owner = this.passedData.owner;

			this.bookingBtnEnabled = false;

			view.templateParameters = {
				brand: this.gear.data.brand,
				gear_type: this.gear.data.gear_type,
				subtype: this.gear.data.subtype,
				model: this.gear.data.model,
				currency: App.user.data.currency
			};

			/*if(this.passedData.booking) {
				this.newBooking = this.passedData.booking;
			}
			else {*/
				this.newBooking = new Booking.constructor({
					rootURL: Config.API_URL
				});
				this.newBooking.initialize();
				this.newBooking.data.gear_id = this.gear.data.id;
			//}
		};

		didRender = function() {
			this.renderPricing();
			this.calculatePrice();
			this.renderCalendar();
			this.setupEvent('click', '#gearbooking-cancel-btn', this, this.handleCancel);
			this.setupEvent('click', '#gearbooking-next', this, this.handleNext);
		};

		renderCalendar = function() {
			var view = this;

			this.gear.getAvailability(App.user.data.id, function(error, result) {
				var $calendarContainer, passedData;
				if(error) {
					console.log(error);
					return;
				}

				$calendarContainer = $('.pickupdeliverycalendar-container', view.$element);
				passedData = {
					availability: result.availabilityArray,
					alwaysFlag: result.alwaysFlag,
					parent: view
				};
				/*if(view.newBooking.data.start_time && view.newBooking.data.start_time !== null) {
					passedData.pickupDate = new Moment.tz(view.newBooking.data.start_time, 'YYYY-MM-DD HH:mm:ss', Localization.getCurrentTimeZone());
				}
				if(view.newBooking.data.end_time && view.newBooking.data.end_time !== null) {
					passedData.deliveryDate = new Moment.tz(view.newBooking.data.end_time, 'YYYY-MM-DD HH:mm:ss', Localization.getCurrentTimeZone());
					passedData.pickupActive = false;
				}*/
				require(['viewcontrollers/pickupdeliverycalendar', 'text!../templates/pickupdeliverycalendar.html'], function(calendarVC, calendarVT) {
					view.calendarVC = new calendarVC.constructor({name: 'pickupdeliverycalendar', $element: $calendarContainer, template: calendarVT, passedData: passedData});
					view.calendarVC.initialize();
					view.calendarVC.render();
				});
			});
		};

		renderPricing = function() {
			var view = this;
			Localization.convertPrices([this.gear.data.price_a, this.gear.data.price_b, this.gear.data.price_c], 'EUR', App.user.data.currency, function(error, convertedPrices) {
				if(error) {
					console.log('Error converting prices: ' + error);
					return;
				}
				$('.price_a', view.$element).html(Math.ceil(convertedPrices[0]));
				$('.price_b', view.$element).html(Math.ceil(convertedPrices[1]));
				$('.price_c', view.$element).html(Math.ceil(convertedPrices[2]));
			});
		};

		calculatePrice = function() {
			var view = this,
				startMoment = new Moment.tz(this.newBooking.data.start_time, Localization.getCurrentTimeZone()),
				endMoment = new Moment.tz(this.newBooking.data.end_time, Localization.getCurrentTimeZone()),
				duration, months, weeks, days;

			//Get number of months, get number of weeks from remainder, get number of days from remainder
			duration = Moment.duration(endMoment.diff(startMoment));
			months = parseInt(duration.months(), 10);
			endMoment.subtract(months, 'months');
			duration = Moment.duration(endMoment.diff(startMoment));
			weeks = parseInt(duration.weeks(), 10);
			endMoment.subtract(weeks, 'weeks');
			duration = Moment.duration(endMoment.diff(startMoment));
			days = parseInt(duration.days(), 10);

			$('#gearbooking-days', this.$element).html(days);
			$('#gearbooking-weeks', this.$element).html(weeks);
			$('#gearbooking-months', this.$element).html(months);

			Localization.convertPrices([this.gear.data.price_a, this.gear.data.price_b, this.gear.data.price_c], 'EUR', App.user.data.currency, function(error, convertedPrices) {
				var price;
				if(error) {
					console.log('Error converting prices: ' + error);
					return;
				}
				price = months * Math.ceil(convertedPrices[2]) + weeks * Math.ceil(convertedPrices[1]) + days * Math.ceil(convertedPrices[0]);
				$('#gearbooking-price', view.$element).html(price);
			});
		};

		handleCancel = function() {
			App.router.closeModalView();
		};

		handlePickupSelection = function(calendarVC) {
			var view = this,
				selectTimePopup = new SelectTimePopup.constructor();
			selectTimePopup.initialize();
			selectTimePopup.setTitle('Select pickup time');
			selectTimePopup.show();
			selectTimePopup.on('close', function(popup) {
				var time = popup.getSelectedTime();
				calendarVC.pickupDate.hour(time.hours);
				calendarVC.pickupDate.minute(time.minutes);
				view.newBooking.data.start_time = new Moment.tz(calendarVC.pickupDate, Localization.getCurrentTimeZone());
				view.newBooking.data.end_time = null;
				view.calculatePrice();
			});
		};

		handleDeliverySelection = function(calendarVC, isTimeSelected) {
			var view = this,
				selectTimePopup;
			if(isTimeSelected === true) {
				view.newBooking.data.end_time = new Moment.tz(calendarVC.deliveryDate, Localization.getCurrentTimeZone());
				view.calculatePrice();
				return;
			}
			selectTimePopup = new SelectTimePopup.constructor();
			selectTimePopup.initialize();
			selectTimePopup.setTitle('Select delivery time');
			selectTimePopup.show();
			selectTimePopup.on('close', function(popup) {
				var time = popup.getSelectedTime();
				calendarVC.deliveryDate.hour(time.hours);
				calendarVC.deliveryDate.minute(time.minutes);
				view.newBooking.data.end_time = new Moment.tz(calendarVC.deliveryDate, Localization.getCurrentTimeZone());
				view.calculatePrice();
			});
		};

		handleNext = function(event) {
			var view = event.data,
				passedData;

			// check if time was selected
			if(view.newBooking.data.start_time === null || view.newBooking.data.end_time === null) {
				alert('No dates selected.');
				return;
			}

			passedData = {
				booking: view.newBooking,
				gear: view.gear,
				owner: view.owner
			};

			App.router.openModalSiblingView('payment', passedData);
		};

		return ViewController.inherit({
			didInitialize: didInitialize,
			didRender: didRender,
			renderCalendar: renderCalendar,
			renderPricing: renderPricing,
			calculatePrice: calculatePrice,

			handleCancel: handleCancel,
			handlePickupSelection: handlePickupSelection,
			handleDeliverySelection: handleDeliverySelection,
			handleNext: handleNext
		});
	}
);
