/**
 * Controller for the Sharingear Gear booking confirm page view.
 * @author: Chris Hjorth, Gediminas Bivainis
 */

'use strict';

define(
    ['jquery', 'viewcontroller', 'moment', 'app', 'models/gear', 'models/user', 'models/booking'],
	function($, ViewController, Moment, App, Gear, User, Booking) {
		var didInitialize,
			didRender,
			renderMonthCalendar,
			setupMonthCalendar,
			clearSelections,
			renderSelections,
			handleCancel,
			handleDeny,
			handleConfirm;

		didInitialize = function() {
			var view = this,
				bookingDeferred = $.Deferred(),
				availabilityDeferred = $.Deferred();

			Moment.locale('en-custom', {
				week: {
					dow: 1,
					doy: 4
				}
			});

			this.shownMoment = new Moment();

			this.gear = this.passedData;
			this.selections = {};
            this.templateParameters = {
                image_url : '',
                name : '',
                surname : '',
                bio : ''
            };

            view.booking = new Booking.constructor({
                rootURL: App.API_URL,
                data : {
                    user_id : App.user.data.id,
                    gear_id : this.gear.data.id
                }
            });

            view.booking.getBookingInfo(App.user.data.id, 'latest', function(error){
                if(error){
                    console.log('Error retrieving latest booking: ' + error);
                    return;
                }
                view.renter = new User.constructor({
                	rootURL: App.API_URL,
                	data: {
                    	id: view.booking.data.user_id
                	}
           		});

           		console.log('Renter id: ' + view.renter.data.id);

           		view.renter.getPublicInfo(function(error) {
                	var renterData = view.renter.data;
                	if(error) {
                		console.log('Error retrieving renter info: ' + error);
                		return;
                	}
                	view.templateParameters = {
                    	name: renterData.name,
                    	surname: renterData.surname,
                    	image_url : renterData.image_url,
                    	bio : renterData.bio
                	};

                	bookingDeferred.resolve();
            	});
            });

            view.availabilityArray = [];
			view.gear.getAvailability(App.user.data.id, function(error, availabilityArray) {
				if(error) {
					console.log('Error retrieving availability: ' + error);
					return;
				}
				view.availabilityArray = availabilityArray;
				availabilityDeferred.resolve();
			});

			$.when(bookingDeferred, availabilityDeferred).then(function() {
				view.render();
			});
		};

		didRender = function() {
			var availabilityArray = this.availabilityArray,
				orderDateList = '',
                dayDiff = 0,
                i, startMoment, endMoment;

            $('[data-totalorderprice]').text(this.booking.data.price);

            for(i = 0; i < availabilityArray.length; i++) {
				startMoment = new Moment(availabilityArray[i].start);
				endMoment = new Moment(availabilityArray[i].end);
				if(Array.isArray(this.selections[startMoment.year() + '-' + (startMoment.month() + 1)]) === false) {
					this.selections[startMoment.year() + '-' + (startMoment.month() + 1)] = [];	
				}
				this.selections[startMoment.year() + '-' + (startMoment.month() + 1)].push({
					startMoment: startMoment,
					endMoment: endMoment
				});
                orderDateList += '<li>' + startMoment.format('YYYY-MM-DD') + ' - ' + endMoment.format('YYYY-MM-DD') + '</li>';
                dayDiff += endMoment.diff(startMoment, 'days') + 1;
			}

			this.renderMonthCalendar($('#gearavailability-months-container'));
			this.setupMonthCalendar();
			this.clearSelections();
			this.renderSelections();

			// append start and end date intervals to pending order confirmation modal
            $('[data-orderdates]').html(orderDateList);
            $('[data-datediff]').text(dayDiff);

			this.setupEvent('click', '[data-cancel]', this, this.handleCancel);
			this.setupEvent('click', '[data-deny]', this, this.handleDeny);
			this.setupEvent('click', '[data-confirm]', this, this.handleConfirm);
		};

		renderMonthCalendar = function($monthCalendarContainer) {
			var header, dayRows, i;
			header = '<div class="row calendar-header">';
			header += '<div class="col-md-1 col-md-offset-1"></div>';
			header += '<div class="col-md-1">M</div>';
			header += '<div class="col-md-1">T</div>';
			header += '<div class="col-md-1">W</div>';
			header += '<div class="col-md-1">T</div>';
			header += '<div class="col-md-1">F</div>';
			header += '<div class="col-md-1">S</div>';
			header += '<div class="col-md-1">S</div>';
			header += '</div>';
			dayRows = '';
			for(i = 0; i < 6; i++) {
				dayRows += '<div class="row day-row">';
				dayRows += '<div class="col-md-1 col-md-offset-1"></div>';
				dayRows += '<div class="col-md-1 day"></div>';
				dayRows += '<div class="col-md-1 day"></div>';
				dayRows += '<div class="col-md-1 day"></div>';
				dayRows += '<div class="col-md-1 day"></div>';
				dayRows += '<div class="col-md-1 day"></div>';
				dayRows += '<div class="col-md-1 day"></div>';
				dayRows += '<div class="col-md-1 day"></div>';
				dayRows += '</div>';
			}
			$monthCalendarContainer.append(header + dayRows);
		};

		setupMonthCalendar = function() {
			var moment, startDay, $calendarContainer, $dayBox, row, col, date;

			moment = new Moment({year: this.shownMoment.year(), month: this.shownMoment.month(), date: this.shownMoment.date()});
			startDay = moment.date(1).weekday();
			$calendarContainer = $('#gearavailability-months-container', this.$element);

			//Set date to first box
			moment.subtract(startDay, 'days');
			for(row = 1; row <= 6; row++) { //6 possible week pieces
				for(col = 1; col <= 7; col++) { //7 days
					$dayBox = $('.day-row:nth-child(0n+' + (1 + row) + ') .col-md-1:nth-child(0n+' + (1 + col) + ')', $calendarContainer);
					date = moment.date();
					$dayBox.html(date);
					$dayBox.data('date', date);
					$dayBox.data('month', moment.month());
					$dayBox.attr('id', 'gearavailability-day-' + moment.month() + '-' + date);
					$dayBox.removeClass('disabled');
					if(moment.month() !== this.shownMoment.month()) {
						$dayBox.addClass('disabled');
					}
					moment.add(1, 'days');
				}
			}

			$('#gearavailability-monthtitle').html(this.shownMoment.format('MMMM YYYY'));
		};

		clearSelections = function() {
			$('#gearavailability-months-container .day-row .day').each(function() {
				$(this).removeClass('selected');
			});
		};

		renderSelections = function() {
			var selections = this.selections[this.shownMoment.year() + '-' + (this.shownMoment.month() + 1)],
				$calendarContainer = $('#gearavailability-months-container', this.$element),
				i, startMoment, endMoment, momentIterator;
				//orderDateList = '', dayDiff = 0;



			if(Array.isArray(selections) === false) {
				return;
			}
			for(i = 0; i < selections.length; i++) {

				startMoment = selections[i].startMoment;
				$('#gearavailability-day-' + startMoment.month() + '-' + startMoment.date(), $calendarContainer).addClass('selected');
				endMoment = selections[i].endMoment;
				momentIterator = new Moment({year: startMoment.year(), month: startMoment.month(), day: startMoment.date()});
				while(momentIterator.isBefore(endMoment, 'day') === true) {
					$('#gearavailability-day-' + momentIterator.month() + '-' + momentIterator.date(), $calendarContainer).addClass('selected');
					momentIterator.add(1, 'days');
				}
				$('#gearavailability-day-' + momentIterator.month() + '-' + momentIterator.date(), $calendarContainer).addClass('selected');
			}
		};

		handleCancel = function() {
			App.router.closeModalView();
		};

        handleDeny = function(){
            console.log('deny');
        };

		/**
		 * @assertion: selections are not overlapping.
		 */
		handleConfirm = function() {
            console.log('confirming');
            /*
			var view = event.data,
				availabilityArray = [],
				month, monthSelections, selection;
			App.router.closeModalView();

			for(month in view.selections) {
				monthSelections = view.selections[month];
				for(j = 0; j < monthSelections.length; j++) {
					selection = monthSelections[j];
					availabilityArray.push({
						start: selection.startMoment.format('YYYY-MM-DD HH:mm:ss'),
						end: selection.endMoment.format('YYYY-MM-DD HH:mm:ss')
					});
				}
			}

			view.gear.setAvailability(App.user.data.id, availabilityArray, function(error) {
			});*/
		};

		return ViewController.inherit({
			gear: null,
			availabilityArray: null,
            booking : null,
            renter : null,
			shownMoment: null,
			selections: {}, //key value pairs where keys are months and values are arrays of start and end dates

			didInitialize: didInitialize,
			didRender: didRender,

			renderMonthCalendar: renderMonthCalendar,
			setupMonthCalendar: setupMonthCalendar,

			clearSelections: clearSelections,
			renderSelections: renderSelections,

			handleCancel: handleCancel,
            handleDeny : handleDeny,
			handleConfirm: handleConfirm,
		});
	}
);