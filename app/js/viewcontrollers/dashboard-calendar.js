/**
 * Controller for the Sharingear Calendar page view.
 * @author: Chris Hjorth
 */

define(
	['viewcontroller', 'moment', 'app', 'models/gearlist'],
	function(ViewController, Moment, App, GearList) {
		var Calendar = ViewController.inherit({
			weekMode: true, //if false then it is months mode
			/*shownWeek: 0,
			shownMonth: 0,
			shownYear: 0,*/
			shownMoment: null,
            gearList: new GearList.constructor({
                rootURL: App.API_URL
            }),

			didInitialize: didInitialize,
			didRender: didRender,

			setupWeekCalendar: setupWeekCalendar,
			setupMonthCalendar: setupMonthCalendar,
            populateAvailable: populateAvailable,

			switchToWeeks: switchToWeeks,
			switchToMonths: switchToMonths,
			handlePrevious: handlePrevious,
			handleNext: handleNext,
			handleToday: handleToday,
            handleDayClick: handleDayClick,
            isBeforeOrSameDay: isBeforeOrSameDay,
            isAfterOrSameDay: isAfterOrSameDay
		});

		return Calendar;

		function didInitialize() {
            var view = this;
			if(App.user.data.id === null) {
				this.ready = false;
				App.router.navigateTo('home');
				return;
			}
			Moment.locale('en-custom', {
				week: {
					dow: 1,
					doy: 4
				}
			});
            if(this.gearList.isEmpty()) {
                this.gearList.getUserGear(App.user.data.id, function(userGear) {
                    gearList = userGear;
                    view.populateAvailable();
                });
            }


			this.shownMoment = Moment();
		}

		function didRender() {
            $("#availablilty-message-container").hide();
            this.setupWeekCalendar();

			this.setupEvent('click', '#dashboard-calendar-weeks-btn', this, this.switchToWeeks);
			this.setupEvent('click', '#dashboard-calendar-months-btn', this, this.switchToMonths);
			this.setupEvent('click', '#dashboard-calendar-previous-btn', this, this.handlePrevious);
			this.setupEvent('click', '#dashboard-calendar-next-btn', this, this.handleNext);
			this.setupEvent('click', '#dashboard-calendar-today-btn', this, this.handleToday);
            this.setupEvent('click', '#calendar-months-container .day-row .selected', this, this.handleDayClick);
            this.setupEvent('click', '#availablilty-message-close', this, function () {

                $("#availablilty-message-container").hide();

            });
            $("#dashboard-calendar-months-btn").click();

        }

        function handleDayClick(event){
            var gearArray = event.data.gearList.data;
            var elementClicked = $(this);
            var monthClicked = elementClicked.attr('id').split('-')[2];
            var dayClicked = elementClicked.attr('id').split('-')[3];
            var moment = Moment({year: event.data.shownMoment.year(), month: monthClicked, day: dayClicked});
            var results = 0;

            $("#availablilty-message").html("<h4>Your items status for "+dayClicked+"/"+(parseInt(monthClicked)+1)+"/"+event.data.shownMoment.year()+"</h4>");
            var closureFunction = function(gear) {
                //Get availability for each gear
                gear.getAvailability(App.user.data.id, function(error, availabilityArray) {
                    var i, startMoment, endMoment;
                    if(error) {
                        return;
                    }
                    //Iterate over all gear's available periods and add them to selections
                    for(i = 0; i < availabilityArray.length; i++) {
                        startMoment = Moment(availabilityArray[i].start);
                        endMoment = Moment(availabilityArray[i].end);
                        if (isBeforeOrSameDay(moment,endMoment) && isAfterOrSameDay(moment,startMoment)) {
                            //Display gear status
                            $("#availablilty-message").append(gear.data.brand+" "+gear.data.subtype+" "+gear.data.model+" - <b>"+gear.data.gear_status+"</b></br>");
                        }
                    }
                });
            };

            //Iterate over all user's gear
            var g;
            for (g = 0; g < gearArray.length; g++) {
                closureFunction(gearArray[g]);
            }
            $("#availablilty-message-container").show();
        }

        function populateAvailable() {

            var gearArray = this.gearList.data;
            var $calendarContainer = $('#calendar-months-container', this.$element);

            //Clear previous availability if any
            $('#calendar-months-container .day-row .col-md-1').each(function(index, $element) {
                $(this).removeClass('selected');
            });

            //Iterate over all user's gear
            var g;
            for (g = 0; g < gearArray.length; g++) {

                //Get availability for each gear
                gearArray[g].getAvailability(App.user.data.id, function(error, availabilityArray) {
                    var i, startMoment, endMoment;
                    if(error) {
                        return;
                    }

                    var selections = {};
                    //Iterate over all gear's available periods and add them to selections
                    for(i = 0; i < availabilityArray.length; i++) {
                        startMoment = Moment(availabilityArray[i].start);
                        endMoment = Moment(availabilityArray[i].end);
                        if(Array.isArray(selections[startMoment.year() + '-' + (startMoment.month() + 1)]) === false) {
                            selections[startMoment.year() + '-' + (startMoment.month() + 1)] = [];
                        }
                            selections[startMoment.year() + '-' + (startMoment.month() + 1)].push({
                            startMoment: startMoment,
                            endMoment: endMoment
                        });
                    }

                    //Render availability
                    $.each( selections, function(index,value){
                        var iter;
                        for(iter = 0; iter < value.length; iter++) {
                            startMoment = value[iter].startMoment;
                            $('#gearavailability-day-' + startMoment.month() + '-' + startMoment.date(), $calendarContainer).addClass('selected');
                            endMoment = value[iter].endMoment;
                            var momentIterator = Moment({year: startMoment.year(), month: startMoment.month(), day: startMoment.date()});
                            while(momentIterator.isBefore(endMoment, 'day') === true) {
                                $('#gearavailability-day-' + momentIterator.month() + '-' + momentIterator.date(), $calendarContainer).addClass('selected');
                                momentIterator.add(1, 'days');
                            }
                            $('#gearavailability-day-' + momentIterator.month() + '-' + momentIterator.date(), $calendarContainer).addClass('selected');
                        }
                    });
                    selections = {};
                });
            }
        }

		function setupWeekCalendar() {
			var $weekCalHeader = $('.week-calendar .calendar-header', this.$element),
				moment = this.shownMoment;
				//week = Moment({year: this.shownYear}).week(currentWeekNum).startOf('week').weekday(0);
			//Moment months are zero indexed
			$('.col-md-1:nth-child(0n+2) .date', $weekCalHeader).html((moment.weekday(0).date()) + '/' + (moment.weekday(0).month() + 1)); //Monday date
			$('.col-md-1:nth-child(0n+3) .date', $weekCalHeader).html((moment.weekday(1).date()) + '/' + (moment.weekday(1).month() + 1)); //Tuesday date etc...
			$('.col-md-1:nth-child(0n+4) .date', $weekCalHeader).html((moment.weekday(2).date()) + '/' + (moment.weekday(2).month() + 1));
			$('.col-md-1:nth-child(0n+5) .date', $weekCalHeader).html((moment.weekday(3).date()) + '/' + (moment.weekday(3).month() + 1));
			$('.col-md-1:nth-child(0n+6) .date', $weekCalHeader).html((moment.weekday(4).date()) + '/' + (moment.weekday(4).month() + 1));
			$('.col-md-1:nth-child(0n+7) .date', $weekCalHeader).html((moment.weekday(5).date()) + '/' + (moment.weekday(5).month() + 1));
			$('.col-md-1:nth-child(0n+8) .date', $weekCalHeader).html((moment.weekday(6).date()) + '/' + (moment.weekday(6).month() + 1));

			$('#dashboard-calendar-months-btn', this.$element).removeClass('disabled');
			$('#dashboard-calendar-weeks-btn', this.$element).addClass('disabled');

        }

		function setupMonthCalendar() {
			var $calendarContainer = $('#calendar-months-container', this.$element),
				moment = Moment({year: this.shownMoment.year(), month: this.shownMoment.month(), date: this.shownMoment.date()}),
				startDay = moment.date(1).weekday(),
				$dayBox,
				row, col;

			//Set date to first box
			moment.subtract(startDay, 'days');
			for(row = 1; row <= 6; row++) { //6 possible week pieces
				for(col = 1; col <= 7; col++) { //7 days
					$dayBox = $('.day-row:nth-child(0n+' + (1 + row) + ') .col-md-1:nth-child(0n+' + (1 + col) + ')', $calendarContainer);
					date = moment.date();
					$dayBox.html(date);
                    $dayBox.attr('id', 'gearavailability-day-' + moment.month() + '-' + date);
                    $dayBox.removeClass('disabled');
					if(moment.month() !== this.shownMoment.month()) {
						$dayBox.addClass('disabled');
					};
					moment.add(1, 'days');
				}
			}
		}



		function switchToWeeks(event) {
			var view = event.data,
				$monthsContainer;
			if(view.weekMode === true) {
				return;
			}
			$monthsContainer = $('#calendar-months-container', view.$element);
			if($monthsContainer.hasClass('hidden') === false) {
				$monthsContainer.addClass('hidden');
			}
			$('#calendar-weeks-container', view.$element).removeClass('hidden');
			view.weekMode = true;

			$('#dashboard-calendar-months-btn', view.$element).removeClass('disabled');
			$('#dashboard-calendar-weeks-btn', view.$element).addClass('disabled');

		}

		function switchToMonths(event) {
			var view = event.data,
				$weeksContainer;
			if(view.weekMode === false) {
				return;
			}
			$weeksContainer = $('#calendar-weeks-container', view.$element);
			if($weeksContainer.hasClass('hidden') === false) {
				$weeksContainer.addClass('hidden');
			}
			$('#calendar-months-container', view.$element).removeClass('hidden');
			view.setupMonthCalendar();
			view.weekMode = false;

			$('#dashboard-calendar-weeks-btn', view.$element).removeClass('disabled');
			$('#dashboard-calendar-months-btn', view.$element).addClass('disabled');
		}

		function handlePrevious(event) {
			var view = event.data;
			if(view.weekMode === true) {
				view.shownMoment.subtract(1, 'week');
				view.setupWeekCalendar();
			}
			else {
				view.shownMoment.subtract(1, 'month');
				view.setupMonthCalendar();
                view.populateAvailable();
			}
		}

		function handleNext(event) {
			var view = event.data;
			if(view.weekMode === true) {
				view.shownMoment.add(1, 'week');
				view.setupWeekCalendar();
			}
			else {
				view.shownMoment.add(1, 'month');
				view.setupMonthCalendar();
                view.populateAvailable();
			}
		}

		function handleToday(event) {
			var view = event.data;
			view.shownMoment = Moment();
			if(view.weekMode === true) {
				view.setupWeekCalendar();
			}
			else {
				view.setupMonthCalendar();
                view.populateAvailable();
			}
		}

        function isBeforeOrSameDay(momentA, momentB) {
            return momentA.isBefore(momentB, 'day') || momentA.isSame(momentB, 'day');
        }

        function isAfterOrSameDay(momentA, momentB) {
            return momentA.isAfter(momentB, 'day') || momentA.isSame(momentB, 'day');
        }
	}
);
