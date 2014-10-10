/**
 * Controller for the Sharingear gear booking page view.
 * @author: Chris Hjorth
 */

define(
	['viewcontroller', 'app', 'models/gear', 'moment'],
	function(ViewController, App, Gear, Moment) {
		var GearBooking = ViewController.inherit({
			gear: null,
			leftWeekMode: false, //if false then it is months mode
			rightWeekMode: false, //if false then it is months mode
			leftMoment: null,
			rightMoment: null,
			startMoment: null,
			endMoment: null,

			didInitialize: didInitialize,
			didRender: didRender,

			renderWeekCalendar: renderWeekCalendar,
			renderMonthCalendar: renderMonthCalendar,

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
			handleRightMonths: handleRightMonths,
			handleLeftHourSelection: handleLeftHourSelection,
			handleLeftDaySelection: handleLeftDaySelection,
			handleRightHourSelection: handleRightHourSelection,
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
			this.rightMoment = Moment();
			this.rightMoment.startOf('week').weekday(0);
			this.startMoment = Moment();
			this.endMoment = Moment({year: this.startMoment.year(), month: this.startMoment.month(), day: this.startMoment.date() + 1});
			this.startMoment.hour(0);
			this.endMoment.hour(0);
		}

		function didRender() {
			this.renderWeekCalendar($('#gearbooking-leftweeks-container'));
			this.renderWeekCalendar($('#gearbooking-rightweeks-container'));
			this.renderMonthCalendar($('#gearbooking-leftmonths-container'));
			this.renderMonthCalendar($('#gearbooking-rightmonths-container'));
			this.setupLeftMonthCalendar();
			this.setupRightMonthCalendar();

			this.renderSelection();

			this.setupEvent('click', '#gearbooking-cancel-btn', this, this.handleCancel);
			//Navigation events
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
			//Time selection events
			this.setupEvent('click', '#gearbooking-leftweeks-container .hour-row .hour', this, this.handleLeftHourSelection);
			this.setupEvent('click', '#gearbooking-leftmonths-container .day-row .day', this, this.handleLeftDaySelection);
			this.setupEvent('click', '#gearbooking-rightweeks-container .hour-row .hour', this, this.handleRightHourSelection);
			this.setupEvent('click', '#gearbooking-rightmonths-container .day-row .day', this, this.handleRightDaySelection);
		}

		function setupLeftWeekCalendar() {
			this.setupWeekCalendar(this.leftMoment, $('.week-calendar:nth-child(0n+1) .calendar-header', this.$element));
		}

		function setupRightWeekCalendar() {
			this.setupWeekCalendar(this.rightMoment, $('.week-calendar:nth-child(0n+3) .calendar-header', this.$element));
		}

		function renderWeekCalendar($weekCalendarContainer) {
			var header, hourRows, i, hour;
			header = '<div class="row calendar-header">';
			header += '<div class="col-md-1 col-md-offset-1"></div>';
			header += '<div class="col-md-1"><div>M</div><div class="date"></div></div>';
			header += '<div class="col-md-1"><div>T</div><div class="date"></div></div>';
			header += '<div class="col-md-1"><div>W</div><div class="date"></div></div>';
			header += '<div class="col-md-1"><div>T</div><div class="date"></div></div>';
			header += '<div class="col-md-1"><div>F</div><div class="date"></div></div>';
			header += '<div class="col-md-1"><div>S</div><div class="date"></div></div>';
			header += '<div class="col-md-1"><div>S</div><div class="date"></div></div>';
			header += '</div>';
			hourRows = '';
			for(i = 0; i < 24; i++) {
				hourRows += '<div class="row hour-row hour-' + (i + 1) + '">';
				if(i < 10) {
					hour = '0' + i;
				}
				else {
					hour = i;
				}
				hourRows += '<div class="col-md-1 col-md-offset-1">' + hour + 'am</div>';
				hourRows += '<div class="col-md-1 hour" data-weekday="0" data-hour="' + hour + '"></div>';
				hourRows += '<div class="col-md-1 hour" data-weekday="1" data-hour="' + hour + '"></div>';
				hourRows += '<div class="col-md-1 hour" data-weekday="2" data-hour="' + hour + '"></div>';
				hourRows += '<div class="col-md-1 hour" data-weekday="3" data-hour="' + hour + '"></div>';
				hourRows += '<div class="col-md-1 hour" data-weekday="4" data-hour="' + hour + '"></div>';
				hourRows += '<div class="col-md-1 hour" data-weekday="5" data-hour="' + hour + '"></div>';
				hourRows += '<div class="col-md-1 hour" data-weekday="6" data-hour="' + hour + '"></div>';
				hourRows += '</div>';
			}
			$weekCalendarContainer.append(header + hourRows);
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
			var moment, firstDayWeek;
			moment = Moment({year: this.leftMoment.year(), month: this.leftMoment.month(), date: this.leftMoment.date()});
			this.setupMonthCalendar(moment, $('#gearbooking-leftmonths-container', this.$element));
			//Get week of first day of month, that is first row, then get difference with start week
			firstDayWeek = Moment({year: this.startMoment.year(), month: this.startMoment.month(), date: 1}).week();
			$('#gearbooking-leftmonths-container .row:nth-child(0n+' + (this.startMoment.week() - firstDayWeek + 2) + ') .day:nth-child(0n+' + (this.startMoment.weekday() + 2) + ')').addClass('selected');
		}

		function setupRightMonthCalendar() {
			var moment, firstDayWeek;
			moment = Moment({year: this.rightMoment.year(), month: this.rightMoment.month(), date: this.rightMoment.date()});
			this.setupMonthCalendar(moment, $('#gearbooking-rightmonths-container', this.$element));
			//Get week of first day of month, that is first row, then get difference with start week
			firstDayWeek = Moment({year: this.endMoment.year(), month: this.endMoment.month(), date: 1}).week();
			$('#gearbooking-rightmonths-container .row:nth-child(0n+' + (this.endMoment.week() - firstDayWeek + 2) + ') .day:nth-child(0n+' + (this.endMoment.weekday() + 2) + ')').addClass('selected');
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

			//view.clearLeftSelection();
			//$('#gearbooking-leftweeks-container .row:nth-child(0n+' + (parseInt(view.startMoment.hour()) + 2) + ') .hour:nth-child(0n+' + (parseInt(view.startMoment.weekday()) + 2) + ')').addClass('selected');
			view.renderSelection();
		}

		function handleLeftMonths(event) {
			var view = event.data,
				$leftWeeksContainer, firstDayWeek;
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

			//view.clearLeftSelection();
			//firstDayWeek = Moment({year: view.startMoment.year(), month: view.startMoment.month(), date: 1}).week();
			//$('#gearbooking-leftmonths-container .row:nth-child(0n+' + (view.startMoment.week() - firstDayWeek + 2) + ') .day:nth-child(0n+' + (view.startMoment.weekday() + 2) + ')').addClass('selected');
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

			//view.clearRightSelection();
			//$('#gearbooking-rightweeks-container .row:nth-child(0n+' + (parseInt(view.endMoment.hour()) + 2) + ') .hour:nth-child(0n+' + (parseInt(view.endMoment.weekday()) + 2) + ')').addClass('selected');
			view.renderSelection();
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

			//view.clearRightSelection();
			//firstDayWeek = Moment({year: view.endMoment.year(), month: view.endMoment.month(), date: 1}).week();
			//$('#gearbooking-rightmonths-container .row:nth-child(0n+' + (view.endMoment.week() - firstDayWeek + 2) + ') .day:nth-child(0n+' + (view.endMoment.weekday() + 2) + ')').addClass('selected');
			view.renderSelection();
		}

		function handleLeftHourSelection(event) {
			var $this = $(this),
				view = event.data,
				hour, weekday;
			//Check that selection start moment is not previous to end moment
			weekday = $this.data('weekday');
			hour = $this.data('hour');
			if(weekday > view.endMoment.weekday()) {
				return;
			}
			if(weekday === view.endMoment.weekday() && hour > view.endMoment.hour()) {
				return;
			}

			view.clearLeftSelection();
			if($this.hasClass('selected') === false) {
				$this.addClass('selected');
			}
			view.startMoment.hour(hour);
			view.startMoment.weekday(weekday);
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

		function handleRightHourSelection(event) {
			var $this = $(this),
				view = event.data,
				weekday, hour;

			weekday = $this.data('weekday');
			hour = $this.data('hour');
			if(weekday < view.startMoment.weekday()) {
				return;
			}
			if(weekday === view.startMoment.weekday() && hour < view.startMoment.hour()) {
				return;
			}

			view.clearRightSelection();
			if($this.hasClass('selected') === false) {
				$this.addClass('selected');
			}
			view.endMoment.hour(hour);
			view.endMoment.weekday(weekday);
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
			var $calendarContainer, momentIterator, row, col, startDay, $dayBox;
			//Left side grayed out before startdate -> loop all hours or days
			if(this.leftWeekMode === false) {
				//Render left month view
				$calendarContainer = $('#gearbooking-leftmonths-container');
				momentIterator = Moment({year: this.leftMoment.year(), month: this.leftMoment.month(), day: this.leftMoment.date(), hour: this.leftMoment.hour()});
				startDay = momentIterator.date(1).weekday();
				momentIterator.subtract(startDay, 'days');
				for(row = 1; row <= 6; row++) {
					for(col = 1; col <= 7; col++) {
						$dayBox = $('.day-row:nth-child(0n+' + (1 + row) + ') .col-md-1:nth-child(0n+' + (1 + col) + ')', $calendarContainer);
						$dayBox.removeClass('escluded selected included');
						if(momentIterator.isBefore(this.startMoment, 'month')) {
							$dayBox.addClass('escluded');
						}
						else if(momentIterator.isAfter(this.endMoment, 'month')) {
							$dayBox.addClass('escluded');
						}
						else if(momentIterator.isBefore(this.startMoment, 'day')) {
							$dayBox.addClass('escluded');
						}
						else if(momentIterator.isSame(this.startMoment, 'day')) {
							$dayBox.addClass('selected');
						}
						else if(momentIterator.isBefore(this.endMoment, 'day')){
							$dayBox.addClass('included');
						}
						else if(momentIterator.isSame(this.endMoment, 'day')){
							$dayBox.addClass('included');
						}
						else {
							$dayBox.addClass('escluded');
						}
						momentIterator.add(1, 'days');
					}
				}
			}
			else {
				//Render left week view
			}

			if(this.rightWeekMode === false) {
				//Render right month view
				$calendarContainer = $('#gearbooking-rightmonths-container');
				momentIterator = Moment({year: this.rightMoment.year(), month: this.rightMoment.month(), day: this.rightMoment.date(), hour: this.rightMoment.hour()});
				startDay = momentIterator.date(1).weekday();
				momentIterator.subtract(startDay, 'days');
				for(row = 1; row <= 6; row++) {
					for(col = 1; col <= 7; col++) {
						$dayBox = $('.day-row:nth-child(0n+' + (1 + row) + ') .col-md-1:nth-child(0n+' + (1 + col) + ')', $calendarContainer);
						$dayBox.removeClass('escluded selected included');
						if(momentIterator.isBefore(this.startMoment, 'day')) {
							$dayBox.addClass('escluded');
						}
						else if(momentIterator.isSame(this.endMoment, 'day')){
							$dayBox.addClass('selected');
						}
						else if(momentIterator.isSame(this.startMoment, 'day')) {
							$dayBox.addClass('included');
						}
						else if(momentIterator.isBefore(this.endMoment, 'day')){
							$dayBox.addClass('included');
						}
						else {
							$dayBox.addClass('escluded');
						}
						momentIterator.add(1, 'days');
					}
				}
			}
			else {
				//Render left month view
			}
		}
	}
);