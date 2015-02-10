/**
 * Controller for the Sharingear gear booking page view.
 * @author: Chris Hjorth
 */

'use strict';

define(
	['underscore', 'jquery', 'config', 'viewcontroller', 'utilities', 'app', 'models/gear', 'models/booking', 'moment'],
	function(_, $, Config, ViewController, Utilities, App, Gear, Booking, Moment) {
		var didInitialize,
			didRender,
			renderCalendar,
			renderPrice,
			
			handleCancel,
			handlePickupSelection,
			handleDeliverySelection,
			handleNext;

			//enableBooking,
			//setStartMoment,
			//setEndMoment;

		didInitialize = function() {
			var view = this;

			Moment.locale('en-custom', {
				week: {
					dow: 1,
					doy: 4
				}
			});

			this.gear = this.passedData.gear;

			this.bookingBtnEnabled = false;

			view.templateParameters = {
				brand: this.gear.data.brand,
				gear_type: this.gear.data.gear_type,
				subtype: this.gear.data.subtype,
				model: this.gear.data.model,
				price_a: this.gear.data.price_a,
				price_b: this.gear.data.price_b,
				price_c: this.gear.data.price_c
			};

			if(this.passedData.booking) {
				this.newBooking = this.passedData.booking;
			}
			else {
				this.newBooking = new Booking.constructor({
					rootURL: Config.API_URL
				});
				this.newBooking.initialize();
				this.newBooking.data.gear_id = this.gear.data.id;
			}
		};

		didRender = function() {
			this.renderPrice();
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
				if(view.newBooking.data.start_time && view.newBooking.data.start_time !== null) {
					passedData.pickupDate = new Moment(view.newBooking.data.start_time, 'YYYY-MM-DD HH:mm:ss');
				}
				if(view.newBooking.data.end_time && view.newBooking.data.end_time !== null) {
					passedData.deliveryDate = new Moment(view.newBooking.data.end_time, 'YYYY-MM-DD HH:mm:ss');
					passedData.pickupActive = false;
				}
				require(['viewcontrollers/pickupdeliverycalendar', 'text!../templates/pickupdeliverycalendar.html'], function(calendarVC, calendarVT) {
					view.calendarVC = new calendarVC.constructor({name: 'pickupdeliverycalendar', $element: $calendarContainer, template: calendarVT, passedData: passedData});
					view.calendarVC.initialize();
					view.calendarVC.render();
				});
			});
		};

		renderPrice = function() {
			var price = 0,
				startMoment = new Moment(this.newBooking.data.start_time, 'YYYY-MM-DD HH:mm:ss'),
				endMoment = new Moment(this.newBooking.data.end_time, 'YYYY-MM-DD HH:mm:ss'),
				duration, months, weeks, days;

			/*console.log('START DATE:');
			console.log(this.startMoment);
			console.log('END DATE:');
			console.log(this.endMoment);*/

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

			price = months * this.gear.data.price_c + weeks * this.gear.data.price_b + days * this.gear.data.price_a;

			$('#gearbooking-price', this.$element).html(price);
		};

		handleCancel = function() {
			App.router.closeModalView();
		};

		handlePickupSelection = function(calendarVC) {
			this.newBooking.data.start_time = calendarVC.pickupDate.format('YYYY-MM-DD HH:mm:ss');
			this.newBooking.data.end_time = null;
			this.renderPrice();
		};

		handleDeliverySelection = function(calendarVC) {
			this.newBooking.data.end_time = calendarVC.deliveryDate.format('YYYY-MM-DD HH:mm:ss');
			this.renderPrice();
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
				gear: view.gear
			};

			App.router.openModalSiblingView('payment', passedData);
		};

		/*enableBooking = function() {
			if(this.bookingBtnEnabled === false) {
				$('#gearbooking-book-btn', this.$element).prop('disabled', false);
				this.setupEvent('click', '#gearbooking-book-btn', this, this.handleBook);
				this.bookingBtnEnabled = true;
			}
		};

		setStartMoment = function(year, month, date) {
			if(this.startMoment === null) {
				this.startMoment = new Moment(year + '-' + month + '-' + date, 'YYYY-MM-DD');
			}
			else {
				this.startMoment.date(date);
				this.startMoment.month(month - 1);
				this.startMoment.year(year);
			}
		};

		setEndMoment = function(year, month, date) {
			if(this.endMoment === null) {
				this.endMoment = new Moment(year + '-' + month + '-' + date, 'YYYY-MM-DD');
			}
			else {
				this.endMoment.date(date);
				this.endMoment.month(month - 1);
				this.endMoment.year(year);
			}
		};*/

		return ViewController.inherit({
			didInitialize: didInitialize,
			didRender: didRender,
			renderCalendar: renderCalendar,
			renderPrice: renderPrice,

			handleCancel: handleCancel,
			handlePickupSelection: handlePickupSelection,
			handleDeliverySelection: handleDeliverySelection,
			handleNext: handleNext//,

			//enableBooking: enableBooking,
			//setStartMoment: setStartMoment,
			//setEndMoment: setEndMoment
		});
	}
);
