/**
 * Controller for the Sharingear Calendar page view.
 * @author: Chris Hjorth
 */

define(
	['viewcontroller', 'moment', 'app'],
	function(ViewController, Moment, App) {
		var Calendar = ViewController.inherit({
			weekMode: true, //if false then it is months mode
			/*shownWeek: 0,
			shownMonth: 0,
			shownYear: 0,*/
			shownMoment: null,

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
			/*this.shownWeek = Moment().week();
			this.shownMonth = Moment().month();
			this.shownYear = Moment().year();*/
			this.shownMoment = Moment();
			this.shownMoment.startOf('week').weekday(0);
		}

		function didRender() {
            this.setupWeekCalendar();
            this.populateAvailable();

			this.setupEvent('click', '#dashboard-calendar-weeks-btn', this, this.switchToWeeks);
			this.setupEvent('click', '#dashboard-calendar-months-btn', this, this.switchToMonths);
			this.setupEvent('click', '#dashboard-calendar-previous-btn', this, this.handlePrevious);
			this.setupEvent('click', '#dashboard-calendar-next-btn', this, this.handleNext);
			this.setupEvent('click', '#dashboard-calendar-today-btn', this, this.handleToday);

            $("#dashboard-calendar-months-btn").click();

        }
        //TODO
        function populateAvailable() {
            var momentIterator = Moment(this.shownMoment);

            //monthly implementation
            var dayBox;
            var $calendarContainer = $('#calendar-months-container', this.$element);
            for(row = 1; row <= 6; row++) { //6 possible week pieces
                for (col = 1; col <= 7; col++) { //7 days

                    dayBox = $('.day-row:nth-child(0n+' + (1 + row) + ') .col-md-1:nth-child(0n+' + (1 + col) + ')', $calendarContainer);



                    //Color a date
                    var compare = Moment("2014-11-23 00:00");

                    if(momentIterator.isSame(compare)){
                        dayBox.css('background','lightblue');
                    }

                }
                momentIterator.add(1,'week');
            }


                    //weekly implementation
            /*var $weekCal = $('.week-calendar', this.$element);
            var d;
            for(d=0;d<7;d++){
                var t;
                for(t=0;t<24;t++){
                    var currentHour = moment.weekday(d).hour(t);
                    var compare = Moment("2014-10-27 00:00");

                    if (currentHour.isSame(compare)) {
                        var currentCellBox = $('.hour-row:nth-child(0n+'+(t+2)+') .col-md-1:nth-child(0n+'+(d+2)+')', $weekCal);
                        currentCellBox.css('background','red');

                    }
                }
            }*/



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
