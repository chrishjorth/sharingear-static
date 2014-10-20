/**
 * Controller for the Sharingear gear booking page view.
 * @author: Chris Hjorth
 */

define(
	['viewcontroller', 'app', 'models/gear', 'moment'],
	function(ViewController, App, Gear, Moment) {
		var GearBooking = ViewController.inherit({
			gear: null,
			leftMoment: null,
			rightMoment: null,
			startMoment: null,
			endMoment: null,
            pricePerHour: '',
            pricePerDay: '',
            pricePerWeek: '',
            totalPrice: '',
            availabilityArray: [],

			didInitialize: didInitialize,

			initializeMoments: initializeMoments,

			didRender: didRender,

            renderPrice: renderPrice,

            renderMonthCalendar: renderMonthCalendar,
			setupLeftMonthCalendar: setupLeftMonthCalendar,
			setupRightMonthCalendar: setupRightMonthCalendar,
			setupMonthCalendar: setupMonthCalendar,

			disableUnavailableDays: disableUnavailableDays,

			handleCancel: handleCancel,
			handleBook: handleBook,
			handleLeftToday: handleLeftToday,
			handleLeftPrevious: handleLeftPrevious,
			handleLeftNext: handleLeftNext,
			handleRightToday: handleRightToday,
			handleRightPrevious: handleRightPrevious,
			handleRightNext: handleRightNext,

			handleLeftDaySelection: handleLeftDaySelection,
			handleRightDaySelection: handleRightDaySelection,

			clearLeftSelection: clearLeftSelection,
			clearRightSelection: clearRightSelection,
			renderSelection: renderSelection,
            handleLeftHourDropdown: handleLeftHourDropdown,
            handleRightHourDropdown: handleRightHourDropdown
		});
		return GearBooking;

		function didInitialize() {
			var view = this;
			Moment.locale('en-custom', {
				week: {
					dow: 1,
					doy: 4
				}
			});

            this.gear = this.passedData;

            this.pricePerHour = this.gear.data.price_a;
            this.pricePerDay = this.gear.data.price_b;
            this.pricePerWeek = this.gear.data.price_c;

            this.leftMoment = Moment();
			this.leftMoment.startOf('week').weekday(0);
			this.leftMoment.hour(12);
			this.rightMoment = Moment();
			this.rightMoment.startOf('week').weekday(0);
			this.rightMoment.hour(12);

			/*this.startMoment = Moment();
			this.startMoment.hour(12);
            this.startMoment.minutes(0);
            this.startMoment.seconds(0);
			this.endMoment = Moment({year: this.startMoment.year(), month: this.startMoment.month(), day: this.startMoment.date() + 1});
			this.endMoment.hour(12);
			this.endMoment.minutes(0);
            this.endMoment.seconds(0);*/

            this.availabilityArray = [];
            this.gear.getAvailability(App.user.data.id, function(error, availabilityArray) {
            	if(error) {
					return;
				}
            	view.availabilityArray = availabilityArray;
            	view.render();
            });
		}

		function initializeMoments(year, month, date) {
			this.startMoment = Moment();
			this.startMoment.hour(12);
            this.startMoment.minutes(0);
            this.startMoment.seconds(0);
			this.endMoment = Moment({year: this.startMoment.year(), month: this.startMoment.month(), day: this.startMoment.date() + 1});
			this.endMoment.hour(12);
			this.endMoment.minutes(0);
            this.endMoment.seconds(0);
		}

		function didRender() {
			this.renderMonthCalendar($('#gearbooking-leftmonths-container'));
			this.renderMonthCalendar($('#gearbooking-rightmonths-container'));
			this.setupLeftMonthCalendar();
			this.setupRightMonthCalendar();
			this.disableUnavailableDays();

			this.renderSelection();

			this.setupEvent('click', '#gearbooking-cancel-btn', this, this.handleCancel);
			this.setupEvent('click', '#gearbooking-book-btn', this, this.handleBook);
			//Navigation events
			this.setupEvent('click', '#gearbooking-lefttoday-btn', this, this.handleLeftToday);
			this.setupEvent('click', '#gearbooking-leftprevious-btn', this, this.handleLeftPrevious);
			this.setupEvent('click', '#gearbooking-leftnext-btn', this, this.handleLeftNext);
			this.setupEvent('click', '#gearbooking-righttoday-btn', this, this.handleRightToday);
			this.setupEvent('click', '#gearbooking-rightprevious-btn', this, this.handleRightPrevious);
			this.setupEvent('click', '#gearbooking-rightnext-btn', this, this.handleRightNext);
			//Time selection events
			this.setupEvent('click', '#gearbooking-leftmonths-container .day-row .day', this, this.handleLeftDaySelection);
			this.setupEvent('click', '#gearbooking-rightmonths-container .day-row .day', this, this.handleRightDaySelection);

		    //Hour selection dropdowns
            this.setupEvent('change','#gearbooking-starttime', this, this.handleLeftHourDropdown);
            this.setupEvent('change','#gearbooking-endtime', this, this.handleRightHourDropdown);
        }

        function renderPrice(event) {
            var view = event.data,
            	price = 0,
            	startDate, endDate, numberOfHours, numberOfDays, numberOfWeeks, difference, display;
            
            startDate = new Moment(view.startMoment);
            endDate = new Moment(view.endMoment);

            numberOfHours = 0;
            numberOfDays = 0;
            numberOfWeeks = 0;
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
                numberOfWeeks = Math.round(difference / 604800000);
                difference -= 604800000 * numberOfWeeks;
            }

            if(difference >= 86400000) {//exactly one day or more in milliseconds
                numberOfDays = Math.round(difference / 86400000);
                difference -= 86400000 * numberOfDays;
            }

            numberOfHours = difference / 3600000;
            numberOfHours = Math.round(numberOfHours);

            if(numberOfHours === 24) { //Check hours for positive overload
                numberOfDays += 1;
                numberOfHours -= 24;
            }

            if (numberOfDays === 7) { //Check days for overload
                numberOfWeeks += 1;
                numberOfDays -= 7;
            }

            while(numberOfHours < 0) { //Check hours for negative overload
                if(numberOfHours < 0) {
                    numberOfDays -= 1;
                    numberOfHours += 24;
                }
            }

            while(numberOfDays < 0) { //Check days for negative overload
                if(numberOfDays < 0) {
                    numberOfWeeks -= 1;
                    numberOfDays += 7;
                }
            }

            price = view.pricePerWeek * numberOfWeeks + view.pricePerDay * numberOfDays + view.pricePerHour * numberOfHours;
            display = '<p class="price-info">';
            display += 'Hours: ' + numberOfHours + '</br>';
            display += 'Days: ' + numberOfDays + '</br>';
            display += 'Weeks: ' + numberOfWeeks + '</br>';
            display += 'Price per hour:' + view.pricePerHour + '</br>';
            display += 'Price per day:' + view.pricePerDay + '</br>';
            display += 'Price per week:' + view.pricePerWeek + '</br>';
            display += '<span class="total-price">' + price + '</span></p>';
            $('#totalprice', view.$element).html(display);
        }


        function handleLeftHourDropdown(event) {
            var view = event.data;
            var selected = $("#gearbooking-starttime").val();
            var hour = selected.split(':')[0].replace( /^\D+/g, '');

            view.startMoment.hour(hour);
            view.startMoment.minutes(0);
            view.startMoment.seconds(0);

            renderPrice(event);
        }

        function handleRightHourDropdown(event) {
            var view = event.data;
            var selected = $("#gearbooking-endtime").val();
            var hour = selected.split(':')[0].replace( /^\D+/g, '');

            view.endMoment.hour(hour);
            view.endMoment.minutes(0);
            view.endMoment.seconds(0);

            renderPrice(event);

        }

		function renderMonthCalendar($monthCalendarContainer) {
			var header, dayRows, i, day;
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
		}

		function setupLeftMonthCalendar() {
			var moment, firstDayWeek;
			moment = Moment({year: this.leftMoment.year(), month: this.leftMoment.month(), date: this.leftMoment.date()});
			this.setupMonthCalendar(moment, $('#gearbooking-leftmonths-container', this.$element),true);

            //Disable buttons at start
            $("#gearbooking-rightprevious-btn").prop('disabled',true);
            $("#gearbooking-righttoday-btn").prop('disabled',true);
			$('#gearbooking-lefttitle').html(this.leftMoment.format('MMMM YYYY'));
		}

		function setupRightMonthCalendar() {
			var moment, firstDayWeek;
			moment = Moment({year: this.rightMoment.year(), month: this.rightMoment.month(), date: this.rightMoment.date()});
			this.setupMonthCalendar(moment, $('#gearbooking-rightmonths-container', this.$element),false);

            //Disable buttons at start
            $("#gearbooking-leftprevious-btn").prop('disabled',true);
            $("#gearbooking-lefttoday-btn").prop('disabled',true);
			$('#gearbooking-righttitle').html(this.rightMoment.format('MMMM YYYY'));
		}

		function setupMonthCalendar(moment, $calendarContainer, leftOrRight) {
			var startDay = moment.date(1).weekday(),
				$dayBox, row, col, date;

			//Set date to first box
			moment.subtract(startDay, 'days');
			for(row = 1; row <= 6; row++) { //6 possible week pieces
				for(col = 1; col <= 7; col++) { //7 days
					$dayBox = $('.day-row:nth-child(0n+' + (1 + row) + ') .col-md-1:nth-child(0n+' + (1 + col) + ')', $calendarContainer);
					date = moment.date();
					$dayBox.html(date);
					$dayBox.data('date', date);
					$dayBox.data('month', moment.month());
					$dayBox.data('year', moment.year());
					$dayBox.removeClass('disabled');
					$dayBox.addClass('unavailable');
                    if(leftOrRight) {
                        if(moment.month() !== this.leftMoment.month()) {
                            $dayBox.addClass('disabled');
                        }
                        if(moment.isBefore(Moment())){
                            $dayBox.addClass('disabled');
                        }
                        $dayBox.attr('id', 'gearbooking-leftday-' + moment.year() + '-' + (moment.month() + 1) + '-' + date);
                    }
                    else {
                        if(moment.month() !== this.rightMoment.month()) {
                            $dayBox.addClass('disabled');
                        }
                        if(moment.isBefore(Moment())){
                            $dayBox.addClass('disabled');
                        }
                        $dayBox.attr('id', 'gearbooking-rightday-' + moment.year() + '-' + (moment.month() + 1) + '-' + date);
                    }
					moment.add(1, 'days');
				}
			}
		}

		function disableUnavailableDays() {
			var $leftCalendarContainer, $rightCalendarContainer, startMoment, endMoment, i;
				
			$leftCalendarContainer = $('#gearbooking-leftmonths-container', this.$element);
			$rightCalendarContainer = $('#gearbooking-rightmonths-container', this.$element);
			for(i = 0; i < this.availabilityArray.length; i++) {
				startMoment = Moment(this.availabilityArray[i].start);
				endMoment = Moment(this.availabilityArray[i].end);
				momentIterator = Moment({year: startMoment.year(), month: startMoment.month(), day: startMoment.date()});
				while(momentIterator.isBefore(endMoment, 'day') === true || momentIterator.isSame(endMoment, 'day') === true) {
					$('#gearbooking-leftday-' + momentIterator.year() + '-' + (momentIterator.month() + 1) + '-' + momentIterator.date(), $leftCalendarContainer).removeClass('unavailable');
					$('#gearbooking-rightday-' + momentIterator.year() + '-' + (momentIterator.month() + 1) + '-' + momentIterator.date(), $rightCalendarContainer).removeClass('unavailable');
					momentIterator.add(1, 'days');
				}
			}
		}

		function handleCancel(event) {
			var view = event.data;
			App.router.closeModalView();
		}

		function handleBook(event) {
			var view = event.data;
			App.router.closeModalView();
		}

		function handleLeftToday(event) {
			var view = event.data;
			view.leftMoment = Moment();
            $("#gearbooking-leftprevious-btn").prop('disabled', true);
            $("#gearbooking-lefttoday-btn").prop('disabled', true);
			view.setupLeftMonthCalendar();
			view.renderSelection();
			view.disableUnavailableDays();
		}

		function handleLeftPrevious(event) {
			var view = event.data;
            if(view.leftMoment.month() === Moment().month()) {
                return;
            }
            else {
                $("#gearbooking-lefttoday-btn").prop('disabled',false);
                $("#gearbooking-leftprevious-btn").prop('disabled',false);
            }
			view.leftMoment.subtract(1, 'month');
            if(view.leftMoment.month() === new Moment().month()) {
                $("#gearbooking-leftprevious-btn").prop('disabled', true);
                $("#gearbooking-lefttoday-btn").prop('disabled', true);
            }
			view.setupLeftMonthCalendar();
            view.renderSelection();
            view.disableUnavailableDays();
		}

		function handleLeftNext(event) {
			var view = event.data;
			view.leftMoment.add(1, 'month');

            if(view.leftMoment.month() === new Moment().month()) {
                $("#gearbooking-leftprevious-btn").prop('disabled',true);
                $("#gearbooking-lefttoday-btn").prop('disabled',true);
            }
            else {
                $("#gearbooking-lefttoday-btn").prop('disabled',false);
                $("#gearbooking-leftprevious-btn").prop('disabled',false);
            }

			view.setupLeftMonthCalendar();
			view.renderSelection();
			view.disableUnavailableDays();
		}

		function handleRightToday(event) {
            var view = event.data;
			view.rightMoment = Moment();
            $("#gearbooking-rightprevious-btn").prop('disabled',true);
            $("#gearbooking-righttoday-btn").prop('disabled',true);
			view.setupRightMonthCalendar();
			view.renderSelection();
			view.disableUnavailableDays();
		}

		function handleRightPrevious(event) {
			var view = event.data;
            if(view.rightMoment.month() === new Moment().month()){
                return;
            }
            else {
                $("#gearbooking-righttoday-btn").prop('disabled',false);
                $("#gearbooking-rightprevious-btn").prop('disabled',false);
            }
            view.rightMoment.subtract(1, 'month');

            if(view.rightMoment.month() === new Moment().month()) {
                $("#gearbooking-rightprevious-btn").prop('disabled', true);
                $("#gearbooking-righttoday-btn").prop('disabled', true);
            }
			view.setupRightMonthCalendar();
			view.renderSelection();
			view.disableUnavailableDays();
		}

		function handleRightNext(event) {
			var view = event.data;
			view.rightMoment.add(1, 'month');
            if(view.rightMoment.month() === new Moment().month()) {
                $("#gearbooking-rightprevious-btn").prop('disabled',true);
                $("#gearbooking-righttoday-btn").prop('disabled',true);
            }
            else {
                $("#gearbooking-righttoday-btn").prop('disabled',false);
                $("#gearbooking-rightprevious-btn").prop('disabled',false);
            }
			view.setupRightMonthCalendar();
			view.renderSelection();
			view.disableUnavailableDays();
		}

		function handleLeftDaySelection(event) {
			var $this = $(this),
				view = event.data,
				date, month, year, i;

			//Check that selection start moment is not previous to end moment
			date = $this.data('date');
			month = $this.data('month');
			year = $this.data('year');

            //Do not allow selecting outside of the month
            if(month !== view.leftMoment.month()) {
                return;
            }

            if($this.hasClass('unavailable') === true) {
            	return;
            }

			view.clearLeftSelection();

			if(view.startMoment === null || view.endMoment === null) {
				view.initializeMoments();
			}

			view.startMoment.date(date);
			view.startMoment.month(month);
			view.startMoment.year(year);

			if(view.startMoment.isAfter(view.endMoment, 'day') === true) {
				view.endMoment.date(date);
				view.endMoment.month(month);
				view.endMoment.add(1, 'days');
			}

			//Check if there is a hole in the selection and if yes move endMoment back
			//Assert that the availability array is sorted by start dates
			i = 0;
			while(i < view.availabilityArray.length) {
				availableStartMoment = Moment(view.availabilityArray[i].start);
				availableEndMoment = Moment(view.availabilityArray[i].end);
				if((view.startMoment.isSame(availableStartMoment, 'day') === true || view.startMoment.isAfter(availableStartMoment, 'day') === true) && (view.startMoment.isBefore(availableEndMoment, 'day') === true || view.startMoment.isSame(availableEndMoment, 'day') === true)) { //We found the availability interval
					if(view.endMoment.isAfter(availableEndMoment, 'day') === true) {
						view.endMoment = availableEndMoment;
					}
				}
				i++;
			}

			view.renderSelection();
            view.renderPrice(event);
		}

		function handleRightDaySelection(event) {
			var $this = $(this),
				view = event.data,
				month, date, year, i;

			month = $this.data('month');
			date = $this.data('date');
			year = $this.data('year');

            //Do not allow selecting outside of the month
            if($this.data('month') !== view.rightMoment.month()) {
                return;
            }

            if($this.hasClass('unavailable') === true) {
            	return;
            }

			view.clearRightSelection();

			if(view.startMoment === null || view.endMoment === null) {
				view.initializeMoments();
			}
			
			view.endMoment.date(date);
			view.endMoment.month(month);
			view.endMoment.year(year);

			if(view.endMoment.isBefore(view.startMoment, 'day')) {
				view.startMoment.date(date);
				view.startMoment.month(month);
				view.startMoment.subtract(1, 'days');
			}

			//Check if there is a hole in the selection and if yes move startMoment forth
			//Assert that the availability array is sorted by start dates
			i = view.availabilityArray.length - 1;
			while(i >= 0) {
				availableStartMoment = Moment(view.availabilityArray[i].start);
				availableEndMoment = Moment(view.availabilityArray[i].end);
				if((view.endMoment.isBefore(availableEndMoment, 'day') === true || view.endMoment.isSame(availableEndMoment, 'day') === true) && (view.endMoment.isAfter(availableStartMoment, 'day') === true || view.endMoment.isSame(availableStartMoment, 'day') === true)) { //We found the availability interval
					if(view.startMoment.isBefore(availableStartMoment, 'day') === true) {
						view.startMoment = availableStartMoment;
					}
				}
				i--;
			}

			view.renderSelection();
            renderPrice(event);
		}

		function clearLeftSelection() {
			$('#gearbooking-leftweeks-container .hour-row .hour').each(function(index, $element) {
				$(this).removeClass('selected');
			});
			$('#gearbooking-leftmonths-container .day-row .day').each(function(index, $element) {
				$(this).removeClass('selected');
			});
		}

		function clearRightSelection() {
			$('#gearbooking-rightweeks-container .hour-row .hour').each(function(index, $element) {
				$(this).removeClass('selected');
			});
			$('#gearbooking-rightmonths-container .day-row .day').each(function(index, $element) {
				$(this).removeClass('selected');
			});
		}

		function renderSelection() {
			var $calendarContainer, momentIterator, row, col, startDay, $box;

			if(this.startMoment !== null) {
				//Render left month view
				$calendarContainer = $('#gearbooking-leftmonths-container');
				momentIterator = Moment({year: this.leftMoment.year(), month: this.leftMoment.month(), day: this.leftMoment.date(), hour: this.leftMoment.hour()});
				startDay = momentIterator.date(1).weekday();
				momentIterator.subtract(startDay, 'days');
				for(row = 1; row <= 6; row++) {
					for(col = 1; col <= 7; col++) {
						$box = $('.day-row:nth-child(0n+' + (1 + row) + ') .col-md-1:nth-child(0n+' + (1 + col) + ')', $calendarContainer);
						$box.removeClass('escluded selected included');
						if(momentIterator.isBefore(this.startMoment, 'month')) {
							//$box.addClass('escluded');
						}
						else if(momentIterator.isAfter(this.endMoment, 'month')) {
							//$box.addClass('escluded');
						}
						else if(momentIterator.isBefore(this.startMoment, 'day')) {
							//$box.addClass('escluded');
						}
						else if(momentIterator.isSame(this.startMoment, 'day')) {
							$box.addClass('selected');
						}
						else if(momentIterator.isBefore(this.endMoment, 'day')){
							$box.addClass('included');
						}
						else if(momentIterator.isSame(this.endMoment, 'day')){
							$box.addClass('included');
						}
						else {
							$box.addClass('escluded');
						}
						momentIterator.add(1, 'days');
					}
				}
			}

			if(this.endMoment !== null) {
				//Render right month view
				$calendarContainer = $('#gearbooking-rightmonths-container');
				momentIterator = Moment({year: this.rightMoment.year(), month: this.rightMoment.month(), day: this.rightMoment.date(), hour: this.rightMoment.hour()});
				startDay = momentIterator.date(1).weekday();
				momentIterator.subtract(startDay, 'days');
				for(row = 1; row <= 6; row++) {
					for(col = 1; col <= 7; col++) {
						$box = $('.day-row:nth-child(0n+' + (1 + row) + ') .col-md-1:nth-child(0n+' + (1 + col) + ')', $calendarContainer);
						$box.removeClass('escluded selected included');
						if(momentIterator.isBefore(this.startMoment, 'day')) {
							$box.addClass('escluded');
						}
						else if(momentIterator.isSame(this.endMoment, 'day')){
							$box.addClass('selected');
						}
						else if(momentIterator.isSame(this.startMoment, 'day')) {
							$box.addClass('included');
						}
						else if(momentIterator.isBefore(this.endMoment, 'day')){
							$box.addClass('included');
						}
						else {
							$box.addClass('escluded');
						}
						momentIterator.add(1, 'days');
					}
				}
			}
		}
	}
);