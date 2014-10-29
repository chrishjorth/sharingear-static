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
			handleToday: handleToday
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
			/*this.shownWeek = Moment().week();
			this.shownMonth = Moment().month();
			this.shownYear = Moment().year();*/
			this.shownMoment = Moment();
			this.shownMoment.startOf('week').weekday(0);
		}

		function didRender() {
            this.setupWeekCalendar();

			this.setupEvent('click', '#dashboard-calendar-weeks-btn', this, this.switchToWeeks);
			this.setupEvent('click', '#dashboard-calendar-months-btn', this, this.switchToMonths);
			this.setupEvent('click', '#dashboard-calendar-previous-btn', this, this.handlePrevious);
			this.setupEvent('click', '#dashboard-calendar-next-btn', this, this.handleNext);
			this.setupEvent('click', '#dashboard-calendar-today-btn', this, this.handleToday);


            $("#dashboard-calendar-months-btn").click();

        }


        function populateAvailable() {

            var gearArray = this.gearList.data;
            var dayBox;
            var $calendarContainer = $('#calendar-months-container', this.$element);

            //Iterate over all user's gear
            var g;
            for (g = 0; g < gearArray.length; g++) {
                gearArray[g].getAvailability(App.user.data.id, function (error, AvailabilityArray) {

                    //Iterate over gear's available periods
                    var a;
                    for (a = 0; a < AvailabilityArray.length; a++) {

                        var momentIterator = Moment(this.shownMoment);
                        var rentedMomentFrom = Moment(AvailabilityArray[a].start);
                        var rentedMomentTo = Moment(AvailabilityArray[a].end);

                        //TODO Display availability

                        //Populate the calendar
                        for (row = 1; row <= 6; row++) { //6 possible week pieces
                            for (col = 1; col <= 7; col++) { //7 days

                                dayBox = $('.day-row:nth-child(0n+' + (1 + row) + ') .col-md-1:nth-child(0n+' + (1 + col) + ')', $calendarContainer);


                                if (rentedMomentFrom.isSame(momentIterator.weekday(col - 1))) {

                                    //Color the 'busy' days
                                    dayBox.css('background', 'lightblue');

                                }

                            }
                            momentIterator.add(1, 'week');
                        }



                    }





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
			}
		}
	}
);
