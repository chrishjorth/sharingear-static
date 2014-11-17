/**
 * Controller for the Sharingear Gear booking confirm page view.
 * We use the booking status to determine wether it is the owner viewing his gear bookings og a renter viewing his reservations.
 * The owner does not get a modal for the denied booking status, since it is not his concern at that point anymore.
 * @author: Chris Hjorth, Gediminas Bivainis
 */

'use strict';

define(
    ['underscore', 'jquery', 'viewcontroller', 'moment', 'app', 'models/gear', 'models/user', 'models/booking'],
	function(_, $, ViewController, Moment, App, Gear, User, Booking) {
		var gear = null,
            booking = null,
            renter = null,

			didInitialize,
			didRender,
			renderMonthCalendar,
			setupMonthCalendar,
			renderBooking,
			handleCancel,
			handleDeny,
			handleConfirm;

		didInitialize = function() {
			var view = this,
				handleFetchBooking;

			Moment.locale('en-custom', {
				week: {
					dow: 1,
					doy: 4
				}
			});

			gear = view.passedData;
			
            view.templateParameters = {
            	title: (gear.data.booking_status === 'denied' ? 'Booking denied' : 'Confirm order'),
                image_url : '',
                name : '',
                surname : '',
                bio : ''
            };

            booking = new Booking.constructor({
                rootURL: App.API_URL
            });
            booking.data.gear_id = gear.data.id;

            handleFetchBooking = function(error) {
                if(error){
                    console.log('Error retrieving latest booking: ' + error);
                    return;
                }
                renter = new User.constructor({
                	rootURL: App.API_URL
           		});
           		renter.data.id = (gear.data.booking_status === 'denied' ? gear.data.owner_id : App.user.data.id); //Depends on who is viewing the booking

           		renter.getPublicInfo(function(error) {
                	var renterData = renter.data;
                	if(error) {
                		console.log('Error retrieving renter info: ' + error);
                		return;
                	}
                	_.extend(view.templateParameters, {
                    	name: renterData.name,
                    	surname: renterData.surname,
                    	image_url : renterData.image_url,
                    	bio : renterData.bio
                	});
                	view.render();
            	});
            };

            if(gear.data.booking_status === 'denied') {
            	booking.getBookingInfo(App.user.data.id, gear.data.booking_id, handleFetchBooking);
            }
            else {
            	booking.getBookingInfo(App.user.data.id, 'latest', handleFetchBooking);
            }
		};

		didRender = function() {
			var orderDateList = '',
                dayDiff = 0,
                startMoment, endMoment;

            if(gear.data.booking_status === 'denied') {
            	$('#owneraccept-confirm', this.$element).addClass('hidden');
            }
            else {
            	$('#renterview-confirm', this.$element).addClass('hidden');
				this.setupEvent('click', '#bookingconfirm-deny-btn', this, this.handleDeny);
				this.setupEvent('click', '#bookingconfirm-confirm-btn', this, this.handleConfirm);
            }
            this.setupEvent('click', '.cancel-btn', this, this.handleCancel);

            $('[data-totalorderprice]').text(booking.data.price);

            startMoment = new Moment(booking.data.start_time, 'YYYY-MM-DD HH:mm:ss');
			endMoment = new Moment(booking.data.end_time, 'YYYY-MM-DD HH:mm:ss');
            orderDateList += '<li>' + startMoment.format('YYYY-MM-DD') + ' - ' + endMoment.format('YYYY-MM-DD') + '</li>';
            dayDiff += endMoment.diff(startMoment, 'days') + 1;

			this.renderMonthCalendar($('#gearavailability-months-container'));
			this.setupMonthCalendar();
			this.renderBooking();

			// append start and end date intervals to pending order confirmation modal
            $('[data-orderdates]').html(orderDateList);
            $('[data-datediff]').text(dayDiff);
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
			var shownMoment = new Moment(booking.data.start_time, 'YYYY-MM-DD HH:mm:ss'),
				moment, startDay, $calendarContainer, $dayBox, row, col, date;

			moment = new Moment({year: shownMoment.year(), month: shownMoment.month(), date: shownMoment.date()});
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
					if(moment.month() !== shownMoment.month()) {
						$dayBox.addClass('disabled');
					}
					moment.add(1, 'days');
				}
			}

			$('#gearavailability-monthtitle').html(shownMoment.format('MMMM YYYY'));
		};

		renderBooking = function() {
			var $calendarContainer = $('#gearavailability-months-container', this.$element),
				bookingData = booking.data,
				startMoment, endMoment, momentIterator;

			startMoment = new Moment(bookingData.start_time, 'YYYY-MM-DD HH:mm:ss');
			$('#gearavailability-day-' + startMoment.month() + '-' + startMoment.date(), $calendarContainer).addClass('selected');
			endMoment = new Moment(bookingData.end_time, 'YYYY-MM-DD HH:mm:ss');
			momentIterator = new Moment({year: startMoment.year(), month: startMoment.month(), day: startMoment.date()});
			while(momentIterator.isBefore(endMoment, 'day') === true) {
				$('#gearavailability-day-' + momentIterator.month() + '-' + momentIterator.date(), $calendarContainer).addClass('selected');
				momentIterator.add(1, 'days');
			}
			$('#gearavailability-day-' + momentIterator.month() + '-' + momentIterator.date(), $calendarContainer).addClass('selected');
		};

		handleCancel = function() {
			App.router.closeModalView();

			if(gear.data.booking_status === 'denied') {
				booking.data.booking_status = 'ended-denied';
				booking.update(App.user.data.id, function(error) {
					if(error) {
						console.log('Error updating booking status: ' + error);
					}
				});
			}
		};

        handleDeny = function(){
            booking.data.booking_status = 'denied';
            booking.update(App.user.data.id, function(error) {
            	if(error) {
            		console.log(error);
            		alert('Error updating booking.');
            		return;
            	}
            	else {
            		App.router.closeModalView();
            	}
            });
        };

		/**
		 * @assertion: selections are not overlapping.
		 */
		handleConfirm = function() {
            booking.data.booking_status = 'accepted';
            booking.update(App.user.data.id, function(error) {
            	if(error) {
            		console.log(error);
            		alert('Error updating booking.');
            		return;
            	}
            	else {
            		App.router.closeModalView();
            	}
            });
		};

		return ViewController.inherit({
			didInitialize: didInitialize,
			didRender: didRender,

			renderMonthCalendar: renderMonthCalendar,
			setupMonthCalendar: setupMonthCalendar,

			renderBooking: renderBooking,

			handleCancel: handleCancel,
            handleDeny : handleDeny,
			handleConfirm: handleConfirm,
		});
	}
);