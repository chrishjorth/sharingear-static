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
			selections: [],

			didInitialize: didInitialize,
			didRender: didRender,

			renderMonthCalendar: renderMonthCalendar,
			setupMonthCalendar: setupMonthCalendar,

			clearSelections: clearSelections,
			renderSelections: renderSelections,

			handleToday: handleToday,
			handlePrevious: handlePrevious,
			handleNext: handleNext,
			handleCancel: handleCancel,
			handleSave: handleSave,

			handleDayStartSelect: handleDayStartSelect,
			handleDayMoveSelect: handleDayMoveSelect,
			handleDayEndSelect: handleDayEndSelect
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

			this.setupEvent('mousedown touchstart', '#gearavailability-months-container .day-row .day', this, this.handleDayStartSelect);
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
					$dayBox.attr('id', 'gearavailability-day-' + moment.month() + '-' + date);
					moment.add(1, 'days');
				}
			}

			$('#gearavailability-monthtitle').html(this.shownMoment.format('MMMM YYYY'));
		}

		function clearSelections() {
			$('#gearavailability-months-container .day-row .day').each(function(index, $element) {
				$(this).removeClass('selected');
			});
		}

		function renderSelections() {
			var selections = this.selections[this.shownMoment.month()],
				$calendarContainer = $('#gearavailability-months-container', this.$element),
				i, startMoment, endMoment, momentIterator;
			if(Array.isArray(selections) === false) {
				return;
			}
			for(i = 0; i < selections.length; i++) {
				startMoment = selections[i].startMoment;
				$('#gearavailability-day-' + startMoment.month() + '-' + startMoment.date(), $calendarContainer).addClass('selected');
				endMoment = selections[i].endMoment;
				momentIterator = Moment({year: startMoment.year(), month: startMoment.month(), day: startMoment.date()});
				while(momentIterator.isBefore(endMoment, 'day') === true) {
					$('#gearavailability-day-' + momentIterator.month() + '-' + momentIterator.date(), $calendarContainer).addClass('selected');
					momentIterator.add(1, 'days');
				}
				$('#gearavailability-day-' + momentIterator.month() + '-' + momentIterator.date(), $calendarContainer).addClass('selected');
			}
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
			view.clearSelections();
			view.renderSelections();
		}

		function handlePrevious(event) {
			var view = event.data;
			view.shownMoment.subtract(1, 'month');
			view.setupMonthCalendar();
			view.clearSelections();
			view.renderSelections();
		}

		function handleNext(event) {
			var view = event.data;
			view.shownMoment.add(1, 'month');
			view.setupMonthCalendar();
			view.clearSelections();
			view.renderSelections();
		}

		function handleDayStartSelect(event) {
			var view = event.data,
				$this = $(this),
				shownMonth = view.shownMoment.month(),
				selection;

			//Ignore if the day is already selected
			if($this.hasClass('selected') === true) {
				return;
			}

			$('body').on('mousemove touchmove', null, view, view.handleDayMoveSelect);
			$('body').on('mouseup touchend', null, view, view.handleDayEndSelect);

			selection = {
				startMoment: Moment({year: view.shownMoment.year(), month: $this.data('month'), day: $this.data('date')}),
				endMoment: Moment({year: view.shownMoment.year(), month: $this.data('month'), day: $this.data('date')})
			};

			if(Array.isArray(view.selections[shownMonth]) === false) {
				view.selections[shownMonth] = [selection];
			}
			else {
				view.selections[shownMonth].push(selection);
			}
			view.clearSelections();
			view.renderSelections();
		}

		function handleDayMoveSelect(event) {
			//Check if mouse is over a box, if yes add selected between start selection and current, remove rest on current table, besides those that are after another start
			var $this = $(this),
				view = event.data,
				$calendarContainer, selectionX, selectionY;

			if(event.type === 'mousemove') {
				selectionX = event.pageX;
				selectionY = event.pageY;
			}
			else if(event.originalEvent.touches && event.originalEvent.touches.length == 1) {
				selectionX = event.originalEvent.targetTouches[0].pageX;
				selectionY = event.originalEvent.targetTouches[0].pageY;
			}
			else {
				//Something wrong happened and we ignore
				return;
			}

			$calendarContainer = $('#gearavailability-months-container', view.$element)
			$('.day-row .day', $calendarContainer).each(function(index, $element) {
				var $this = $(this),
					dayBoxOffset, selection;

				dayBoxOffset = $this.offset();
				if(selectionX >= dayBoxOffset.left && selectionX <= dayBoxOffset.left + $this.width() && selectionY >= dayBoxOffset.top && selectionY <= dayBoxOffset.top + $this.height()) {
					selection = view.selections[view.shownMoment.month()];
					selection = selection[selection.length - 1];
					selection.endMoment.month($this.data('month'));
					selection.endMoment.date($this.data('date'));
				}
			});

			view.clearSelections();
			view.renderSelections();
		}

		function handleDayEndSelect(event) {
			var view = event.data;
			$('body').off('mousemove touchmove', view.handleDayMoveSelect);
			$('body').off('mouseup touchend', view.handleDayEndSelect);
		}
	}
);