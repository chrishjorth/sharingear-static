/**
 * Controller for the Sharingear Gear availability page view.
 * @author: Chris Hjorth
 */

define(
	['viewcontroller', 'moment', 'app', 'models/gear'],
	function(ViewController, Moment, App, Gear) {
		var GearAvailability = ViewController.inherit({
			gear: null,
			shownMoment: null,

			didInitialize: didInitialize,
			didRender: didRender,

			renderMonthCalendar: renderMonthCalendar,
			setupMonthCalendar: setupMonthCalendar,

			handleToday: handleToday,
			handlePrevious: handlePrevious,
			handleNext: handleNext,
			handleCancel: handleCancel,
			handleSave: handleSave
		}); 
		return GearAvailability;

		function didInitialize() {
			Moment.locale('en-custom', {
				week: {
					dow: 1,
					doy: 4
				}
			});
			this.shownMoment = Moment();
		}

		function didRender() {
			var moment;

			this.renderMonthCalendar($('#gearavailability-months-container'));
			
			this.setupMonthCalendar();

			this.setupEvent('click', '#gearavailability-today-btn', this, this.handleToday);
			this.setupEvent('click', '#gearavailability-previous-btn', this, this.handlePrevious);
			this.setupEvent('click', '#gearavailability-next-btn', this, this.handleNext);
			this.setupEvent('click', '#gearavailability-cancel-btn', this, this.handleCancel);
			this.setupEvent('click', '#gearavailability-save-btn', this, this.handleSave);
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

		function setupMonthCalendar(moment) {
			var moment, startDay, $calendarContainer, $dayBox, row, col, date;

			moment = Moment({year: this.shownMoment.year(), month: this.shownMoment.month(), date: this.shownMoment.date()});
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
					moment.add(1, 'days');
				}
			}

			$('#gearavailability-monthtitle').html(this.shownMoment.format('MMMM YYYY'));
		}

		function handleCancel(event) {
			var view = event.data;
			App.router.closeModalView();
		}

		function handleSave(event) {
			var view = event.data;
			App.router.closeModalView();
		}

		function handleToday(event) {
			var view = event.data;
			view.shownMoment = Moment();
			view.setupMonthCalendar();
		}

		function handlePrevious(event) {
			var view = event.data;
			view.shownMoment.subtract(1, 'month');
			view.setupMonthCalendar();
		}

		function handleNext(event) {
			var view = event.data;
			view.shownMoment.add(1, 'month');
			view.setupMonthCalendar();
		}
	}
);