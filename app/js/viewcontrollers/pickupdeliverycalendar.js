/**
 * Controller for the Sharingear pickup and delivery calendar view.
 * @author: Chris Hjorth
 */

'use strict';

define(
	['underscore', 'jquery', 'viewcontroller', 'moment'],
	function(_, $, ViewController, Moment) {
		var didInitialize,
			didRender,
			didClose,

			renderMonthCalendar,
			setupMonthCalendar,
			clearSelections,

			handlePrev,
			handleNext,
			handleDaySelection;

		didInitialize = function() {
			//create element and append to body, on close remove it.
			var $body = $('body');
			$body.append('<div id="gearsearchform-pickupdeliverycalendar"></div>');
			this.$element = $('#gearsearchform-pickupdeliverycalendar', $body);

			Moment.locale('en-custom', {
				week: {
					dow: 1,
					doy: 4
				}
			});

			this.displayedMoment = new Moment();
			this.pickupDate = null;
			if(this.passedData.pickupDate && this.passedData.pickupDate !== null) {
				this.pickupDate = new Moment(this.passedData.pickupDate, 'DD/MM/YYYY');
			}
			this.deliveryDate = null;
			if(this.passedData.deliveryDate && this.passedData.deliveryDate !== null) {
				this.deliveryDate = new Moment(this.passedData.deliveryDate, 'DD/MM/YYYY');
			}

			this.pickupActive = true;
			if(this.passedData.pickupActive === false) {
				this.pickupActive = false;
			}
			else {
				this.deliveryDate = null;
			}
		};

		didRender = function() {
			var $calendarContainer = $('.calendar', this.$element),
				$tab;

			this.$element.removeClass('hidden');
			this.renderMonthCalendar($calendarContainer)
			this.setupMonthCalendar(this.displayedMoment, $calendarContainer);

			$tab = $('#pickupdeliverycalendar-pickupdate', this.$element);

			if(this.pickupActive === false) {
				$tab.removeClass('sg-toptab-active');
				$tab.next().addClass('sg-toptab-active');
			}

			if(this.pickupDate !== null) {
				$('div', $tab).html(this.pickupDate.format('DD/MM/YYYY'));
				$('div', $tab.next()).html('-');
			}
			else {
				$('div', $tab).html('-');
			}

			$tab = $tab.next();
			if(this.deliveryDate !== null && this.pickupActive === false) {
				$('div', $tab).html(this.deliveryDate.format('DD/MM/YYYY'));
			}

			this.setupEvent('click', '#pickupdeliverycalendar-prev', this, this.handlePrev);
			this.setupEvent('click', '#pickupdeliverycalendar-next', this, this.handleNext);
			this.setupEvent('click', '.day', this, this.handleDaySelection);
        };

        didClose = function() {
        	this.$element.remove();
        };

        renderMonthCalendar = function($monthCalendarContainer) {
			var header, dayRows, i;
			header = '<div class="row calendar-header">';
			header += '<div class="col">Mo</div>';
			header += '<div class="col">Tu</div>';
			header += '<div class="col">We</div>';
			header += '<div class="col">Th</div>';
			header += '<div class="col">Fr</div>';
			header += '<div class="col">Sa</div>';
			header += '<div class="col">Su</div>';
			header += '</div>';
			dayRows = '';
			for(i = 0; i < 6; i++) {
				dayRows += '<div class="row day-row">';
				dayRows += '<div class="col day"></div>';
				dayRows += '<div class="col day"></div>';
				dayRows += '<div class="col day"></div>';
				dayRows += '<div class="col day"></div>';
				dayRows += '<div class="col day"></div>';
				dayRows += '<div class="col day"></div>';
				dayRows += '<div class="col day"></div>';
				dayRows += '</div>';
			}
			$monthCalendarContainer.append(header + dayRows);
		};

        setupMonthCalendar = function(moment, $calendarContainer) {
			var startDay = moment.date(1).weekday(),
				iteratorMoment, $dayBox, row, col, date;

			iteratorMoment = new Moment(moment);

			$('#pickupdeliverycalendar-currentmonth', this.$element).html(moment.format('MMMM YYYY'));

			//Set date to first box
			iteratorMoment.subtract(startDay, 'days');
			for(row = 1; row <= 6; row++) { //6 possible week pieces
				for(col = 1; col <= 7; col++) { //7 days
					$dayBox = $('.day-row:nth-child(0n+' + (1 + row) + ') .col:nth-child(0n+' + col + ')', $calendarContainer);
					date = iteratorMoment.date();
					$dayBox.data('date', date);
					$dayBox.data('month', iteratorMoment.month() + 1);
					$dayBox.data('year', iteratorMoment.year());
					$dayBox.removeClass('disabled');
					
					if(iteratorMoment.month() !== moment.month()) {
						$dayBox.addClass('disabled');
						$dayBox.html('');
					}
					else {
						$dayBox.html(date);
					}
					if(iteratorMoment.isBefore(new Moment()) === true){
						$dayBox.addClass('disabled');
					}
					if(this.pickupDate !== null && (iteratorMoment.isBefore(this.pickupDate, 'day') === true || iteratorMoment.isSame(this.pickupDate, 'day') === true)) {
						$dayBox.addClass('disabled');
					}
					if(this.pickupActive === true && this.pickupDate !== null) {
						//We need to granulate to day, as pickupDate might have a pickup time set
						if(iteratorMoment.isSame(this.pickupDate, 'day') === true && iteratorMoment.isSame(this.pickupDate, 'month') === true && iteratorMoment.isSame(this.pickupDate, 'year') === true) {
							$dayBox.addClass('selected');
						}
					}
					if(this.pickupActive === false && this.deliveryDate !== null) {
						//We need to granulate to day, as deliveryDate might have a delivery time set
						if(iteratorMoment.isSame(this.deliveryDate, 'day') === true && iteratorMoment.isSame(this.deliveryDate, 'month') === true && iteratorMoment.isSame(this.deliveryDate, 'year') === true) {
							$dayBox.addClass('selected');
						}
					}
					$dayBox.attr('id', 'calendar-day-' + iteratorMoment.year() + '-' + (iteratorMoment.month() + 1) + '-' + date);
					iteratorMoment.add(1, 'days');
				}
			}
		};

		clearSelections = function() {
			$('.day', this.$element).removeClass('selected');
		};

		handlePrev = function(event) {
			var view = event.data,
				$calendarContainer;

			view.clearSelections();

			$calendarContainer = $('.calendar', view.$element);
			view.displayedMoment.subtract(1, 'months');
			view.setupMonthCalendar(view.displayedMoment, $calendarContainer);
		};

		handleNext = function (event) {
			var view = event.data,
				$calendarContainer;

			view.clearSelections();

			$calendarContainer = $('.calendar', view.$element);
			view.displayedMoment.add(1, 'months');
			view.setupMonthCalendar(view.displayedMoment, $calendarContainer);
		};

		handleDaySelection = function(event) {
			var view = event.data,
				$dayBox = $(this),
				$tab;
			if($dayBox.hasClass('selected') === false) {
				$dayBox.addClass('selected');
			}
			if(view.pickupActive === true) {
				view.pickupDate = new Moment($dayBox.data('date') + '/' + $dayBox.data('month') + '/' + $dayBox.data('year'), 'DD/MM/YYYY');
				$tab = $('#pickupdeliverycalendar-pickupdate', view.$element);
				$tab.removeClass('sg-toptab-active');
				$('div', $tab).html(view.pickupDate.format('DD/MM/YYYY'));
				$tab.next().addClass('sg-toptab-active');
				view.pickupActive = false;
				view.clearSelections();
				view.setupMonthCalendar(view.displayedMoment, $('.calendar', view.$element));
			}
			else {
				view.deliveryDate = new Moment($dayBox.data('date') + '/' + $dayBox.data('month') + '/' + $dayBox.data('year'), 'DD/MM/YYYY');
				view.close();
			}
		};

		return ViewController.inherit({
			didInitialize: didInitialize,
			didRender: didRender,
			didClose: didClose,

			renderMonthCalendar: renderMonthCalendar,
			setupMonthCalendar: setupMonthCalendar,
			clearSelections: clearSelections,

			handlePrev: handlePrev,
			handleNext: handleNext,
			handleDaySelection: handleDaySelection
		});
	}
);
