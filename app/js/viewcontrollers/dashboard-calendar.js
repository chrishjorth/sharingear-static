/**
 * Controller for the Sharingear Calendar page view.
 * @author: Chris Hjorth
 */

define(
	['viewcontroller', 'moment'],
	function(ViewController, Moment) {
		var Calendar = ViewController.inherit({
			weekMode: true, //if false then it is months mode
			shownWeek: 0,
			shownYear: 0,

			didInitialize: didInitialize,
			didRender: didRender,

			setupWeekCalendar: setupWeekCalendar,

			switchToWeeks: switchToWeeks,
			switchToMonths: switchToMonths,
			handlePrevious: handlePrevious,
			handleNext: handleNext,
			handleToday: handleToday
		});

		return Calendar;

		function didInitialize() {
			Moment.locale('en-custom', {
				week: {
					dow: 1,
					doy: 4
				}
			});
			this.shownWeek = Moment().week();
			this.shownYear = Moment().year();
		}

		function didRender() {
			this.setupWeekCalendar(this.shownWeek);

			this.setupEvent('click', '#dashboard-calendar-weeks-btn', this, this.switchToWeeks);
			this.setupEvent('click', '#dashboard-calendar-months-btn', this, this.switchToMonths);
			this.setupEvent('click', '#dashboard-calendar-previous-btn', this, this.handlePrevious);
			this.setupEvent('click', '#dashboard-calendar-next-btn', this, this.handleNext);
			this.setupEvent('click', '#dashboard-calendar-today-btn', this, this.handleToday);
		}

		function setupWeekCalendar(currentWeekNum) {
			var $weekCalHeader = $('.week-calendar .calendar-header', this.$element),
				week = Moment({year: this.shownYear}).week(currentWeekNum).startOf('week').weekday(0);
			//Moment months are zero indexed
			$('.col-md-1:nth-child(0n+2) .date', $weekCalHeader).html((week.weekday(0).date()) + '/' + (week.weekday(0).month() + 1)); //Monday date
			$('.col-md-1:nth-child(0n+3) .date', $weekCalHeader).html((week.weekday(1).date()) + '/' + (week.weekday(1).month() + 1)); //Tuesday date etc...
			$('.col-md-1:nth-child(0n+4) .date', $weekCalHeader).html((week.weekday(2).date()) + '/' + (week.weekday(2).month() + 1));
			$('.col-md-1:nth-child(0n+5) .date', $weekCalHeader).html((week.weekday(3).date()) + '/' + (week.weekday(3).month() + 1));
			$('.col-md-1:nth-child(0n+6) .date', $weekCalHeader).html((week.weekday(4).date()) + '/' + (week.weekday(4).month() + 1));
			$('.col-md-1:nth-child(0n+7) .date', $weekCalHeader).html((week.weekday(5).date()) + '/' + (week.weekday(5).month() + 1));
			$('.col-md-1:nth-child(0n+8) .date', $weekCalHeader).html((week.weekday(6).date()) + '/' + (week.weekday(6).month() + 1));
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
			view.weekMode = false;
		}

		function handlePrevious(event) {
			var view = event.data;
			view.shownWeek--;
			view.setupWeekCalendar(view.shownWeek);
		}

		function handleNext(event) {
			var view = event.data;
			view.shownWeek++;
			view.setupWeekCalendar(view.shownWeek);
		}

		function handleToday(event) {
			var view = event.data;
			view.shownWeek = Moment().week();
			view.setupWeekCalendar(view.shownWeek);
		}
	}
);