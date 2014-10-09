/**
 * Controller for the Sharingear gear booking page view.
 * @author: Chris Hjorth
 */

define(
	['viewcontroller', 'app', 'models/gear', 'moment'],
	function(ViewController, App, Gear, Moment) {
		var GearBooking = ViewController.inherit({
			gear: null,
			leftWeekMode: true, //if false then it is months mode
			rightWeekMode: true, //if false then it is months mode
			leftMoment: null,
			rightMoment: null,

			didInitialize: didInitialize,
			didRender: didRender,

			setupLeftWeekCalendar: setupLeftWeekCalendar,
			setupRightWeekCalendar: setupRightWeekCalendar,
			setupWeekCalendar: setupWeekCalendar,
			setupLeftMonthCalendar: setupLeftMonthCalendar,
			setupRightMonthCalendar: setupRightMonthCalendar,
			setupMonthCalendar: setupMonthCalendar,

			handleCancel: handleCancel,
			handleLeftToday: handleLeftToday,
			handleLeftPrevious: handleLeftPrevious,
			handleLeftNext: handleLeftNext,
			handleLeftWeeks: handleLeftWeeks,
			handleLeftMonths: handleLeftMonths,
			handleRightToday: handleRightToday,
			handleRightPrevious: handleRightPrevious,
			handleRightNext: handleRightNext,
			handleRightWeeks: handleRightWeeks,
			handleRightMonths: handleRightMonths
		}); 
		return GearBooking;

		function didInitialize() {
			Moment.locale('en-custom', {
				week: {
					dow: 1,
					doy: 4
				}
			});
			this.leftMoment = Moment();
			this.leftMoment.startOf('week').weekday(0);
			this.rightMoment = Moment();
			this.rightMoment.startOf('week').weekday(0);
		}

		function didRender() {
			this.setupLeftWeekCalendar();
			this.setupRightWeekCalendar();

			this.setupEvent('click', '#gearbooking-cancel-btn', this, this.handleCancel);
			this.setupEvent('click', '#gearbooking-lefttoday-btn', this, this.handleLeftToday);
			this.setupEvent('click', '#gearbooking-leftprevious-btn', this, this.handleLeftPrevious);
			this.setupEvent('click', '#gearbooking-leftnext-btn', this, this.handleLeftNext);
			this.setupEvent('click', '#gearbooking-leftweeks-btn', this, this.handleLeftWeeks);
			this.setupEvent('click', '#gearbooking-leftmonths-btn', this, this.handleLeftMonths);
			this.setupEvent('click', '#gearbooking-righttoday-btn', this, this.handleRightToday);
			this.setupEvent('click', '#gearbooking-rightprevious-btn', this, this.handleRightPrevious);
			this.setupEvent('click', '#gearbooking-rightnext-btn', this, this.handleRightNext);
			this.setupEvent('click', '#gearbooking-rightweeks-btn', this, this.handleRightWeeks);
			this.setupEvent('click', '#gearbooking-rightmonths-btn', this, this.handleRightMonths);
		}

		function setupLeftWeekCalendar() {
			this.setupWeekCalendar(this.leftMoment, $('.week-calendar:nth-child(0n+1) .calendar-header', this.$element));
		}

		function setupRightWeekCalendar() {
			this.setupWeekCalendar(this.rightMoment, $('.week-calendar:nth-child(0n+3) .calendar-header', this.$element));
		}

		function setupWeekCalendar(moment, $weekCalHeader) {
			//Moment months are zero indexed
			$('.col-md-1:nth-child(0n+2) .date', $weekCalHeader).html((moment.weekday(0).date()) + '/' + (moment.weekday(0).month() + 1)); //Monday date
			$('.col-md-1:nth-child(0n+3) .date', $weekCalHeader).html((moment.weekday(1).date()) + '/' + (moment.weekday(1).month() + 1)); //Tuesday date etc...
			$('.col-md-1:nth-child(0n+4) .date', $weekCalHeader).html((moment.weekday(2).date()) + '/' + (moment.weekday(2).month() + 1));
			$('.col-md-1:nth-child(0n+5) .date', $weekCalHeader).html((moment.weekday(3).date()) + '/' + (moment.weekday(3).month() + 1));
			$('.col-md-1:nth-child(0n+6) .date', $weekCalHeader).html((moment.weekday(4).date()) + '/' + (moment.weekday(4).month() + 1));
			$('.col-md-1:nth-child(0n+7) .date', $weekCalHeader).html((moment.weekday(5).date()) + '/' + (moment.weekday(5).month() + 1));
			$('.col-md-1:nth-child(0n+8) .date', $weekCalHeader).html((moment.weekday(6).date()) + '/' + (moment.weekday(6).month() + 1));
		}

		function setupLeftMonthCalendar() {
			var moment = Moment({year: this.leftMoment.year(), month: this.leftMoment.month(), date: this.leftMoment.date()});
			this.setupMonthCalendar(moment, $('#gearbooking-leftmonths-container', this.$element));
		}

		function setupRightMonthCalendar() {
			var moment = Moment({year: this.rightMoment.year(), month: this.rightMoment.month(), date: this.rightMoment.date()});
			this.setupMonthCalendar(moment, $('#gearbooking-rightmonths-container', this.$element));
		}

		function setupMonthCalendar(moment, $calendarContainer) {
			var startDay = moment.date(1).weekday(),
				row, col;

			//Set date to first box
			moment.subtract(startDay, 'days');
			for(row = 1; row <= 6; row++) { //6 possible week pieces
				for(col = 1; col <= 7; col++) { //7 days
					$('.day-row:nth-child(0n+' + (1 + row) + ') .col-md-1:nth-child(0n+' + (1 + col) + ')', $calendarContainer).html(moment.date());
					moment.add(1, 'days');
				}
			}
		}

		function handleCancel(event) {
			var view = event.data;
			App.router.closeModalView();
		}

		function handleLeftToday(event) {
			var view = event.data;
			view.leftMoment = Moment();
			if(view.leftWeekMode === true) {
				view.setupLeftWeekCalendar();
			}
			else {
				view.setupLeftMonthCalendar();
			}
		}

		function handleLeftPrevious(event) {
			var view = event.data;
			if(view.leftWeekMode === true) {
				view.leftMoment.subtract(1, 'week');
				view.setupLeftWeekCalendar();
			}
			else {
				view.leftMoment.subtract(1, 'month');
				view.setupLeftMonthCalendar();
			}
		}

		function handleLeftNext(event) {
			var view = event.data;
			if(view.leftWeekMode === true) {
				view.leftMoment.add(1, 'week');
				view.setupLeftWeekCalendar();
			}
			else {
				view.leftMoment.add(1, 'month');
				view.setupLeftMonthCalendar();
			}
		}

		function handleLeftWeeks(event) {
			var view = event.data,
				$leftMonthsContainer;
			if(view.leftWeekMode === true) {
				return;
			}
			$leftMonthsContainer = $('#gearbooking-leftmonths-container', view.$element);
			if($leftMonthsContainer.hasClass('hidden') === false) {
				$leftMonthsContainer.addClass('hidden');
			}
			$('#gearbooking-leftweeks-container', view.$element).removeClass('hidden');
			view.leftWeekMode = true;
		}

		function handleLeftMonths(event) {
			var view = event.data,
				$leftWeeksContainer;
			if(view.leftWeekMode === false) {
				return;
			}
			$leftWeeksContainer = $('#gearbooking-leftweeks-container', view.$element);
			if($leftWeeksContainer.hasClass('hidden') === false) {
				$leftWeeksContainer.addClass('hidden');
			}
			$('#gearbooking-leftmonths-container', view.$element).removeClass('hidden');
			view.setupLeftMonthCalendar();
			view.leftWeekMode = false;
		}

		function handleRightToday(event) {
			var view = event.data;
			view.rightMoment = Moment();
			if(view.rightWeekMode === true) {
				view.setupRightWeekCalendar();
			}
			else {
				view.setupRightMonthCalendar();
			}
		}

		function handleRightPrevious(event) {
			var view = event.data;
			if(view.rightWeekMode === true) {
				view.rightMoment.subtract(1, 'week');
				view.setupRightWeekCalendar();
			}
			else {
				view.rightMoment.subtract(1, 'month');
				view.setupRightMonthCalendar();
			}
		}

		function handleRightNext(event) {
			var view = event.data;
			if(view.rightWeekMode === true) {
				view.rightMoment.add(1, 'week');
				view.setupRightWeekCalendar();
			}
			else {
				view.rightMoment.add(1, 'month');
				view.setupRightMonthCalendar();
			}
		}

		function handleRightWeeks(event) {
			var view = event.data,
				$rightMonthsContainer;
			if(view.rightWeekMode === true) {
				return;
			}
			$rightMonthsContainer = $('#gearbooking-rightmonths-container', view.$element);
			if($rightMonthsContainer.hasClass('hidden') === false) {
				$rightMonthsContainer.addClass('hidden');
			}
			$('#gearbooking-rightweeks-container', view.$element).removeClass('hidden');
			view.rightWeekMode = true;
		}

		function handleRightMonths(event) {
			var view = event.data,
				$rightWeeksContainer;
			if(view.rightWeekMode === false) {
				return;
			}
			$rightWeeksContainer = $('#gearbooking-rightweeks-container', view.$element);
			if($rightWeeksContainer.hasClass('hidden') === false) {
				$rightWeeksContainer.addClass('hidden');
			}
			$('#gearbooking-rightmonths-container', view.$element).removeClass('hidden');
			view.setupRightMonthCalendar();
			view.rightWeekMode = false;
		}
	}
);