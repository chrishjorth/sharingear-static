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

			didInitialize: didInitialize,
			didRender: didRender,

			renderMonthCalendar: renderMonthCalendar,

			setupLeftMonthCalendar: setupLeftMonthCalendar,
			setupRightMonthCalendar: setupRightMonthCalendar,
			setupMonthCalendar: setupMonthCalendar,

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
			renderSelection: renderSelection
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
			this.leftMoment.hour(12);
			this.rightMoment = Moment();
			this.rightMoment.startOf('week').weekday(0);
			this.rightMoment.hour(12);
			this.startMoment = Moment();
			this.endMoment = Moment({year: this.startMoment.year(), month: this.startMoment.month(), day: this.startMoment.date() + 1});
			this.startMoment.hour(12);
			this.endMoment.hour(12);
		}

		function didRender() {
			this.renderMonthCalendar($('#gearbooking-leftmonths-container'));
			this.renderMonthCalendar($('#gearbooking-rightmonths-container'));
			this.setupLeftMonthCalendar();
			this.setupRightMonthCalendar();

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
			this.setupMonthCalendar(moment, $('#gearbooking-leftmonths-container', this.$element));
			//Get week of first day of month, that is first row, then get difference with start week
			firstDayWeek = Moment({year: this.startMoment.year(), month: this.startMoment.month(), date: 1}).week();
			$('#gearbooking-leftmonths-container .row:nth-child(0n+' + (this.startMoment.week() - firstDayWeek + 2) + ') .day:nth-child(0n+' + (this.startMoment.weekday() + 2) + ')').addClass('selected');
			$('#gearbooking-lefttitle').html(this.leftMoment.format('MMMM YYYY'));
		}

		function setupRightMonthCalendar() {
			var moment, firstDayWeek;
			moment = Moment({year: this.rightMoment.year(), month: this.rightMoment.month(), date: this.rightMoment.date()});
			this.setupMonthCalendar(moment, $('#gearbooking-rightmonths-container', this.$element));
			//Get week of first day of month, that is first row, then get difference with start week
			firstDayWeek = Moment({year: this.endMoment.year(), month: this.endMoment.month(), date: 1}).week();
			$('#gearbooking-rightmonths-container .row:nth-child(0n+' + (this.endMoment.week() - firstDayWeek + 2) + ') .day:nth-child(0n+' + (this.endMoment.weekday() + 2) + ')').addClass('selected');
			$('#gearbooking-righttitle').html(this.rightMoment.format('MMMM YYYY'));
		}

		function setupMonthCalendar(moment, $calendarContainer) {
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
					moment.add(1, 'days');
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
			if(view.leftWeekMode === true) {
				view.setupLeftWeekCalendar();
			}
			else {
				view.setupLeftMonthCalendar();
			}
			view.renderSelection();
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
			view.renderSelection();
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
			view.renderSelection();
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
			view.renderSelection();
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
			view.renderSelection();
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
			view.renderSelection();
		}

		function handleLeftDaySelection(event) {
			var $this = $(this),
				view = event.data,
				date, month;

			//Check that selection start moment is not previous to end moment
			date = $this.data('date');
			month = $this.data('month');
			if(month > view.endMoment.month()) {
				return;
			}
			if(month === view.endMoment.month() && date > view.endMoment.date()) {
				return;
			}

			view.clearLeftSelection();
			if($this.hasClass('selected') === false) {
				$this.addClass('selected');
			}
			view.startMoment.date(date);
			view.startMoment.month(month);
			view.renderSelection();
		}

		function handleRightDaySelection(event) {
			var $this = $(this),
				view = event.data,
				month, date;

			month = $this.data('month');
			date = $this.data('date');
			if(month < view.startMoment.month()) {
				return;
			}
			if(month === view.startMoment.month() && date < view.startMoment.date()) {
				return;
			}

			view.clearRightSelection();
			if($this.hasClass('selected') === false) {
				$this.addClass('selected');
			}
			view.endMoment.date(date);
			view.endMoment.month(month);
			view.renderSelection();
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
						$box.addClass('escluded');
					}
					else if(momentIterator.isAfter(this.endMoment, 'month')) {
						$box.addClass('escluded');
					}
					else if(momentIterator.isBefore(this.startMoment, 'day')) {
						$box.addClass('escluded');
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
);