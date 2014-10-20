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
			selections: {}, //key value pairs where keys are months and values are arrays of start and end dates

			didInitialize: didInitialize,
			didRender: didRender,

			renderMonthCalendar: renderMonthCalendar,
			setupMonthCalendar: setupMonthCalendar,

			clearSelections: clearSelections,
			renderSelections: renderSelections,

			handleToday: handleToday,
			handlePrevious: handlePrevious,
			handleNext: handleNext,

			handleClearMonth: handleClearMonth,
			handleAlwaysAvailable: handleAlwaysAvailable,

			handleCancel: handleCancel,
			handleSave: handleSave,

			handleDayStartSelect: handleDayStartSelect,
			handleDayMoveSelect: handleDayMoveSelect,
			handleDayEndSelect: handleDayEndSelect,

			isBeforeOrSameDay: isBeforeOrSameDay,
			isAfterOrSameDay: isAfterOrSameDay
		}); 
		return GearAvailability;

		function didInitialize() {
			var view = this;
			Moment.locale('en-custom', {
				week: {
					dow: 1,
					doy: 4
				}
			});
			this.shownMoment = Moment();

			this.gear = this.passedData;
			this.selections = {};

			this.gear.getAvailability(App.user.data.id, function(error, availabilityArray) {
				var i, startMoment, endMoment;
				if(error) {
					return;
				}
				for(i = 0; i < availabilityArray.length; i++) {
					startMoment = Moment(availabilityArray[i].start);
					endMoment = Moment(availabilityArray[i].end);
					if(Array.isArray(view.selections[startMoment.year() + '-' + (startMoment.month() + 1)]) === false) {
						view.selections[startMoment.year() + '-' + (startMoment.month() + 1)] = [];	
					}
					view.selections[startMoment.year() + '-' + (startMoment.month() + 1)].push({
						startMoment: startMoment,
						endMoment: endMoment
					});
				}
				view.renderSelections();
			});
		}

		function didRender() {
			this.renderMonthCalendar($('#gearavailability-months-container'));
			this.setupMonthCalendar();
			this.clearSelections();
			this.renderSelections();

			this.setupEvent('click', '#gearavailability-today-btn', this, this.handleToday);
			this.setupEvent('click', '#gearavailability-previous-btn', this, this.handlePrevious);
			this.setupEvent('click', '#gearavailability-next-btn', this, this.handleNext);

			this.setupEvent('click', '#gearavailability-clearmonth-btn', this, this.handleClearMonth);
			this.setupEvent('click', '#gearavailability-always-btn', this, this.handleAlwaysAvailable);

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
					$dayBox.removeClass('disabled');
					if(moment.month() !== this.shownMoment.month()) {
						$dayBox.addClass('disabled');
					}
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
			var selections = this.selections[this.shownMoment.year() + '-' + (this.shownMoment.month() + 1)],
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

		/**
		 * @assertion: selections are not overlapping.
		 */
		function handleSave(event) {
			var view = event.data,
				availabilityArray = [],
				month, monthSelections, selection;
			App.router.closeModalView();

			for(month in view.selections) {
				monthSelections = view.selections[month];
				for(j = 0; j < monthSelections.length; j++) {
					selection = monthSelections[j];
					availabilityArray.push({
						start: selection.startMoment.format('YYYY-MM-DD HH:mm:ss'),
						end: selection.endMoment.format('YYYY-MM-DD HH:mm:ss')
					});
				}
			}

			view.gear.setAvailability(App.user.data.id, availabilityArray, function(error) {
			});
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

		function handleClearMonth(event) {
			var view = event.data;
			view.selections[view.shownMoment.year() + '-' + (view.shownMoment.month() + 1)] = [];
			view.clearSelections();
			view.renderSelections();
		}

		function handleAlwaysAvailable(event) {
			var view = event.data;
		}

		function handleDayStartSelect(event) {
			var view = event.data,
				$this = $(this),
				selection;

			//Ignore if the day is already selected
			if($this.hasClass('selected') === true) {
				return;
			}

			//Do not allow selecting outside of the month
			if($this.data('month') !== view.shownMoment.month()) {
				return;
			}

			$('body').on('mousemove touchmove', null, view, view.handleDayMoveSelect);
			$('body').on('mouseup touchend', null, view, view.handleDayEndSelect);

			selection = {
				startMoment: Moment({year: view.shownMoment.year(), month: $this.data('month'), day: $this.data('date')}),
				endMoment: Moment({year: view.shownMoment.year(), month: $this.data('month'), day: $this.data('date')})
			};

			if(Array.isArray(view.selections[view.shownMoment.year() + '-' + (view.shownMoment.month() + 1)]) === false) {
				view.selections[view.shownMoment.year() + '-' + (view.shownMoment.month() + 1)] = [];	
			}
			view.selections[view.shownMoment.year() + '-' + (view.shownMoment.month() + 1)].push(selection);

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
				if($this.data('month') === view.shownMoment.month()) {
					if(selectionX >= dayBoxOffset.left && selectionX <= dayBoxOffset.left + $this.width() && selectionY >= dayBoxOffset.top && selectionY <= dayBoxOffset.top + $this.height()) {
						selection = view.selections[view.shownMoment.year() + '-' + (view.shownMoment.month() + 1)];
						selection = selection[selection.length - 1];
						selection.endMoment.month($this.data('month'));
						selection.endMoment.date($this.data('date'));
					}
				}
			});

			view.clearSelections();
			view.renderSelections();
		}

		//TODO: Optimize to join adjacent selections
		function handleDayEndSelect(event) {
			var view = event.data,
				monthSelections, i, j, didSplice, startMomentA, endMomentA, startMomentB, endMomentB;
			$('body').off('mousemove touchmove', view.handleDayMoveSelect);
			$('body').off('mouseup touchend', view.handleDayEndSelect);

			//Scan selections for this month and cleanup overlaps
			monthSelections = view.selections[view.shownMoment.year() + '-' + (view.shownMoment.month() + 1)];
			i = 0;
			while(i < monthSelections.length) {
				currentSelection = monthSelections[i];
				j = i + 1;
				didSplice = false;
				while(j < monthSelections.length) {
					startMomentA = currentSelection.startMoment;
					endMomentA = currentSelection.endMoment;
					startMomentB = monthSelections[j].startMoment;
					endMomentB = monthSelections[j].endMoment;
					if(view.isAfterOrSameDay(startMomentA, startMomentB) && view.isBeforeOrSameDay(startMomentA, endMomentB) && view.isAfterOrSameDay(endMomentA, endMomentB)) {
						currentSelection.startMoment = startMomentB;
						monthSelections.splice(j, 1);
						didSplice = true;
					}
					else if(view.isBeforeOrSameDay(startMomentA, startMomentB) && view.isAfterOrSameDay(endMomentA, startMomentB) && view.isBeforeOrSameDay(endMomentA, endMomentB)) {
						currentSelection.endMoment = endMomentB;
						monthSelections.splice(j, 1);
						didSplice = true;
					}
					else if(view.isBeforeOrSameDay(startMomentA, startMomentB) && view.isAfterOrSameDay(endMomentA, endMomentB)) {
						monthSelections.splice(j, 1);
						didSplice = true;
					}
					else if(view.isAfterOrSameDay(startMomentA, startMomentB) && view.isBeforeOrSameDay(endMomentA, endMomentB)) {
						currentSelection.startMoment = startMomentB;
						currentSelection.endMoment = endMomentB;
						monthSelections.splice(j, 1);
						didSplice = true;
					}
					else {
						j++;
					}
				}
				if(didSplice === false) {
					i++;
				}
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