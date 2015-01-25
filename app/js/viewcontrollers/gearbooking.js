/**
 * Controller for the Sharingear gear booking page view.
 * @author: Chris Hjorth
 */

'use strict';

define(
	['underscore', 'jquery', 'viewcontroller', 'utilities', 'app', 'models/gear', 'models/booking', 'moment'],
	function(_, $, ViewController, Utilities, App, Gear, Booking, Moment) {
		var didInitialize,
			didRender,
			renderCalendar,
			renderPrice,
			
			handleCancel,
			handlePickupDeliverySelection,
			handleNext,

			enableBooking,
			setStartMoment,
			setEndMoment;

		didInitialize = function() {
			var view = this;

			Moment.locale('en-custom', {
				week: {
					dow: 1,
					doy: 4
				}
			});

			this.gear = this.passedData;

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

			this.newBooking = new Booking.constructor({
				rootURL: App.API_URL
			});
			this.newBooking.initialize();
		};

		didRender = function() {
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
				require(['viewcontrollers/pickupdeliverycalendar', 'text!../templates/pickupdeliverycalendar.html'], function(calendarVC, calendarVT) {
					view.calendarVC = new calendarVC.constructor({name: 'pickupdeliverycalendar', $element: $calendarContainer, template: calendarVT, passedData: passedData});
					view.calendarVC.initialize();
					view.calendarVC.render();
				});
			});
		};

		renderPrice = function() {
			var price = 0,
				startMoment = new Moment(this.startMoment),
				endMoment = new Moment(this.endMoment),
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

			/*console.log('months: ' + months);
			console.log('weeks: ' + weeks);
			console.log('days: ' + days);*/

			/*this.numberOfHours = 0;
			this.numberOfDays = 0;
			this.numberOfWeeks = 0;
			difference = 0;

			if(startDate.isDST() && !endDate.isDST()) {
				difference = endDate - startDate;
				difference -= 3600000; //one hour in milliseconds

			}
			else if(!startDate.isDST() && endDate.isDST()) {
				difference = endDate - startDate;
				difference += 3600000; //one hour in milliseconds
			}
			else {
				difference = endDate - startDate;
			}

			if(difference >= 604800000) { //exactly one week or more in milliseconds
				this.numberOfWeeks = Math.round(difference / 604800000);
				difference -= 604800000 * this.numberOfWeeks;
			}

			if(difference >= 86400000) {//exactly one day or more in milliseconds
				this.numberOfDays = Math.round(difference / 86400000);
				difference -= 86400000 * this.numberOfDays;
			}

			this.numberOfHours = difference / 3600000;
			this.numberOfHours = Math.round(this.numberOfHours);

			if(this.numberOfHours === 24) { //Check hours for positive overload
				this.numberOfDays += 1;
				this.numberOfHours -= 24;
			}

			if (this.numberOfDays === 7) { //Check days for overload
				this.numberOfWeeks += 1;
				this.numberOfDays -= 7;
			}

			while(this.numberOfHours < 0) { //Check hours for negative overload
				if(this.numberOfHours < 0) {
					this.numberOfDays -= 1;
					this.numberOfHours += 24;
				}
			}

			while(this.numberOfDays < 0) { //Check days for negative overload
				if(this.numberOfDays < 0) {
					this.numberOfWeeks -= 1;
					this.numberOfDays += 7;
				}
			}

			price = this.pricePerWeek * this.numberOfWeeks + this.pricePerDay * this.numberOfDays + this.pricePerHour * this.numberOfHours;
			if(isNaN(price) === true) {
				price = 0;
			}

			//$('#booking-hours', this.$element).html(this.numberOfHours);
			$('#booking-days', this.$element).html(this.numberOfDays);
			$('#booking-weeks', this.$element).html(this.numberOfWeeks);
			$('#booking-hourly-price', this.$element).html(this.pricePerHour);
			$('#booking-daily-price', this.$element).html(this.pricePerDay);
			$('#booking-weekly-price', this.$element).html(this.pricePerWeek);
			$('#totalprice', this.$element).html(price);*/

			//this.newBooking.data.price = price;
			//this.newBooking.data.pricePerHour = this.pricePerHour;
			//this.newBooking.data.pricePerDay = this.pricePerDay;
			//this.newBooking.data.pricePerWeek = this.pricePerWeek;
		};

		handleCancel = function() {
			App.router.closeModalView();
		};

		handlePickupDeliverySelection = function(calendarVC) {
			this.startMoment = calendarVC.pickupDate;
			this.endMoment = calendarVC.deliveryDate;
			this.renderPrice();
		};

		handleNext = function(event) {
			var view = event.data,
				bookingData;

			// check if time was selected
			if(!view.startMoment || !view.endMoment) {
				alert('No dates selected.');
				return;
			}

			bookingData = {
				gear_id: view.gear.data.id,
				start_time: view.startMoment.format('YYYY-MM-DD HH:mm:ss'),
				end_time: view.endMoment.format('YYYY-MM-DD HH:mm:ss')
			};

			App.router.openModalSiblingView('payment', bookingData);
		};

		enableBooking = function() {
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
		};

		return ViewController.inherit({
			didInitialize: didInitialize,
			didRender: didRender,
			renderCalendar: renderCalendar,
			renderPrice: renderPrice,

			handleCancel: handleCancel,
			handlePickupDeliverySelection: handlePickupDeliverySelection,
			handleNext: handleNext,

			enableBooking: enableBooking,
			setStartMoment: setStartMoment,
			setEndMoment: setEndMoment
		});
	}
);
