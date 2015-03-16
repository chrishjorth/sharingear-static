/**
 * Controller for the Sharingear pickup and delivery calendar view.
 * @author: Chris Hjorth
 */

'use strict';

define(
	['underscore', 'jquery', 'viewcontroller', 'moment', 'utilities', 'models/localization'],
	function(_, $, ViewController, Moment, Utilities, Localization) {
		var pickupHintText = 'Select a pickup date',
			deliveryHintText = 'Select a delivery date',
			didInitialize,
			didRender,

			renderMonthCalendar,
			populateMonthCalendar,
			clearSelections,

			handlePrev,
			handleNext,
			handleDaySelection,
			handlePickupDateClick,
			handleDeliveryDateClick,

			isDayInAvailability,
			isIntervalAvailable;

		didInitialize = function() {
			Moment.locale('en-custom', {
				week: {
					dow: 1,
					doy: 4
				}
			});

			this.displayedMoment = new Moment.tz(Localization.getCurrentTimeZone());
			
			this.pickupDate = null;
			if(this.passedData.pickupDate && Moment.isMoment(this.passedData.pickupDate) === true) {
				this.pickupDate = this.passedData.pickupDate;
				if(this.pickupDate.isBefore(this.displayedMoment) === true) {
					this.pickupDate = new Moment.tz(this.displayedMoment, Localization.getCurrentTimeZone());
				}
			}

			this.deliveryDate = null;
			if(this.passedData.deliveryDate && Moment.isMoment(this.passedData.deliveryDate) === true) {
				this.deliveryDate = this.passedData.deliveryDate;
				if(this.deliveryDate.isBefore(this.pickupDate) === true) {
					this.pickupDate = new Moment.tz(this.pickupDate, Localization.getCurrentTimeZone());
					this.pickupDate.add(1, 'days');
				}
			}

			this.pickupActive = true;
			if(this.passedData.pickupActive === false) {
				this.pickupActive = false;
			}
			else {
				this.deliveryDate = null;
			}

			this.availability = [];
			if(Array.isArray(this.passedData.availability) === true) {
				this.availability = this.passedData.availability;
			}
			this.alwaysFlag = 1; //1 = always available, 0 = never available
			if(this.passedData.alwaysFlag === 0 || this.passedData.alwaysFlag === 1) {
				this.alwaysFlag = this.passedData.alwaysFlag;
			}
		};

		didRender = function() {
			var $calendarContainer = $('.calendar', this.$element),
				$tab;

			this.renderMonthCalendar($calendarContainer);
			this.populateMonthCalendar(this.displayedMoment, $calendarContainer);
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
				$('.hint', this.$element).html(deliveryHintText);
			}
			else {
				$('.hint', this.$element).html(pickupHintText);
			}

			this.setupEvent('click', '#pickupdeliverycalendar-prev', this, this.handlePrev);
			this.setupEvent('click', '#pickupdeliverycalendar-next', this, this.handleNext);
			this.setupEvent('click', '.day', this, this.handleDaySelection);
			this.setupEvent('click', '#pickupdeliverycalendar-pickupdate', this, this.handlePickupDateClick);
			this.setupEvent('click', '#pickupdeliverycalendar-deliverydate', this, this.handleDeliveryDateClick);
        };

        renderMonthCalendar = function($monthCalendarContainer) {
			var header, dayRows, i;
			header = '<div class="row bs-reset calendar-header">';
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
				dayRows += '<div class="row bs-reset day-row">';
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

        populateMonthCalendar = function(moment, $calendarContainer) {
			var startDay = moment.date(1).weekday(),
				iteratorMoment, disable, isInInterval, $dayBox, row, col, date;

			iteratorMoment = new Moment.tz(moment, Localization.getCurrentTimeZone());

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
					disable = false;
					
					//Render date
					if(iteratorMoment.month() !== moment.month()) {
						//$dayBox.addClass('disabled');
						disable = true;
						$dayBox.html('');
					}
					else {
						$dayBox.html(date);
					}

					//Disable past days
					if(iteratorMoment.isBefore(new Moment.tz(Localization.getCurrentTimeZone()), 'day') === true) {
						disable = true;
						//$dayBox.addClass('disabled');
					}
					//In case of delivery selection disable days before or equal to pickup date
					if(this.pickupActive === false && (iteratorMoment.isBefore(this.pickupDate, 'day') === true || iteratorMoment.isSame(this.pickupDate, 'day') === true)) {
						disable = true;
						//$dayBox.addClass('disabled');
					}

					//Check if unavailable: if always flag = 0 and no interval, or flag = 1 and interval
					isInInterval = this.isDayInAvailability(iteratorMoment);
					if(this.alwaysFlag === 0 && isInInterval === false) {
						disable = true;
					}
					if(this.alwaysFlag === 1 && isInInterval === true) {
						disable = true;
					}

					if(disable === true) {
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

					$dayBox.attr('id', 'calendar-day-' + iteratorMoment.format('YYYY-MM-DD'));
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
			view.populateMonthCalendar(view.displayedMoment, $calendarContainer);
		};

		handleNext = function (event) {
			var view = event.data,
				$calendarContainer;

			view.clearSelections();

			$calendarContainer = $('.calendar', view.$element);
			view.displayedMoment.add(1, 'months');
			view.populateMonthCalendar(view.displayedMoment, $calendarContainer);
		};

		handleDaySelection = function(event) {
			var view = event.data,
				$dayBox = $(this),
				$pickupTab, $deliveryTab;

			if($(this).hasClass('disabled') === true) {
				return;
			}

			$pickupTab = $('#pickupdeliverycalendar-pickupdate', view.$element);
			$deliveryTab = $('#pickupdeliverycalendar-deliverydate', view.$element);

			if(view.pickupActive === true) {
				view.pickupDate = new Moment.tz($dayBox.data('date') + '/' + $dayBox.data('month') + '/' + $dayBox.data('year'), 'DD/MM/YYYY', Localization.getCurrentTimeZone());
				//$pickupTab.removeClass('sg-toptab-active');
				$('div', $pickupTab).html(view.pickupDate.format('DD/MM/YYYY'));
				//$deliveryTab.addClass('sg-toptab-active');
				view.deliveryDate = null;
				$('div', $deliveryTab).html('-');
				//view.pickupActive = false;
				if(_.isFunction(view.passedData.parent.handlePickupSelection) === true) {
					view.passedData.parent.handlePickupSelection(view, function() {
						if($dayBox.hasClass('selected') === false) {
							$dayBox.addClass('selected');
						}

						view.clearSelections();
						view.populateMonthCalendar(view.displayedMoment, $('.calendar', view.$element));	

					});
				}
			}
			else {
				view.deliveryDate = new Moment.tz($dayBox.data('date') + '/' + $dayBox.data('month') + '/' + $dayBox.data('year'), 'DD/MM/YYYY', Localization.getCurrentTimeZone());
				//Check that delivery date is after pickup date
				if(view.deliveryDate.isBefore(view.pickupDate) === true || view.deliveryDate.isSame(view.pickupDate) === true) {
					return;
				}

				//Check if the delivery date ends an acceptable interval: if not alert error
				if(view.isIntervalAvailable(view.pickupDate, view.deliveryDate) === true) {
					$('div', $deliveryTab).html(view.deliveryDate.format('DD/MM/YYYY'));
					if(_.isFunction(view.passedData.parent.handleDeliverySelection) === true) {
						view.passedData.parent.handleDeliverySelection(view, false, function(){
				
							if($dayBox.hasClass('selected') === false) {
								$dayBox.addClass('selected');
							}

							view.clearSelections();
							view.populateMonthCalendar(view.displayedMoment, $('.calendar', view.$element));	

						});
					}
				}
				else {
					view.deliveryDate = null;
					alert('The interval you selected contains unavailable dates.');
					return;
				}
				
			}

		};

		handlePickupDateClick = function(event) {
			var view = event.data,
				$pickupTab, $deliveryTab;
			
			if(view.pickupActive === false) {
				$pickupTab = $('#pickupdeliverycalendar-pickupdate', view.$element);
				$pickupTab.addClass('sg-toptab-active');
				$deliveryTab = $('#pickupdeliverycalendar-deliverydate', view.$element);
				$deliveryTab.removeClass('sg-toptab-active');
				
				var pickupDate = new Moment.tz(view.pickupDate, Localization.getCurrentTimeZone());
				var displayedDay = new Moment.tz(view.displayedMoment, Localization.getCurrentTimeZone());
				
				if (pickupDate.month()!==displayedDay.month()) {
					handlePrev(event);
				}

				view.pickupActive = true;
				$('.hint', view.$element).html(pickupHintText);
				view.clearSelections();
				view.populateMonthCalendar(view.displayedMoment, $('.calendar', view.$element));
			}
		};

		handleDeliveryDateClick = function(event) {
			var view = event.data,
				$pickupTab, $deliveryTab;
			
			if(view.pickupActive === true && view.pickupDate !== null) {
				$deliveryTab = $('#pickupdeliverycalendar-deliverydate', view.$element);
				$deliveryTab.addClass('sg-toptab-active');
				$pickupTab = $('#pickupdeliverycalendar-pickupdate', view.$element);
				$pickupTab.removeClass('sg-toptab-active');

				$('.hint', view.$element).html(deliveryHintText);

				if(view.deliveryDate === null) {
					view.deliveryDate = new Moment.tz(view.pickupDate, Localization.getCurrentTimeZone());
					
					view.deliveryDate.add(1, 'days');
					view.deliveryDate.hours(12);
					
					var deliveryCheck = new Moment.tz(view.deliveryDate, Localization.getCurrentTimeZone());
					var displayedCheck= new Moment.tz(view.displayedMoment, Localization.getCurrentTimeZone());

					if (deliveryCheck.month()!==displayedCheck.month()) {
						handleNext(event);
					}

					$('div', $deliveryTab).html(view.deliveryDate.format('DD/MM/YYYY'));
					
					if(_.isFunction(view.passedData.parent.handleDeliverySelection) === true) {
						view.passedData.parent.handleDeliverySelection(view, true);
					}
				}

				view.pickupActive = false;
				view.clearSelections();
				view.populateMonthCalendar(view.displayedMoment, $('.calendar', view.$element));
			}
		};

		isDayInAvailability = function(moment) {
			var i, startMoment, endMoment;
			for(i = 0; i < this.availability.length; i++) {
				startMoment = new Moment.tz(this.availability[i].start, 'YYYY-MM-DD HH:mm:ss', Localization.getCurrentTimeZone());
				endMoment = new Moment.tz(this.availability[i].end, 'YYYY-MM-DD HH:mm:ss', Localization.getCurrentTimeZone());
				if(Utilities.isMomentBetween(moment, startMoment, endMoment) === true) {
					return true;
				}
			}
			return false;
		};

		/**
		 * If always flag = 0 an interval with the moments must exist, if always flag = 1, an interval with the moments must not exists
		 * and must not separate the two moments.
		 * @assertion: startMoment and endMoment are available dates.
		 */
		isIntervalAvailable = function (startMoment, endMoment) {
			var foundInterval = false,
				i = 0,
				intervalStartMoment, intervalEndMoment;
			while(i < this.availability.length && foundInterval === false) {
				intervalStartMoment = new Moment.tz(this.availability[i].start, 'YYYY-MM-DD HH:mm:ss', Localization.getCurrentTimeZone());
				intervalEndMoment = new Moment.tz(this.availability[i].end, 'YYYY-MM-DD HH:mm:ss', Localization.getCurrentTimeZone());
				if(Utilities.isMomentBetween(startMoment, intervalStartMoment, intervalEndMoment) === true && Utilities.isMomentBetween(endMoment, intervalStartMoment, intervalEndMoment) === true) {
					//The two moments are in an interval
					foundInterval = true;
				}
				else if(this.alwaysFlag === 1) {
					//Make sure that both moments are either after or before the interval, if not set found interval to true
					//TODO: Invert this if construct for conciceness
					if( (startMoment.isBefore(intervalStartMoment, 'day') === true && endMoment.isBefore(intervalStartMoment, 'day') === true) || (startMoment.isAfter(intervalEndMoment) === true && endMoment.isAfter(intervalEndMoment) === true) ) {
						foundInterval = false;
					}
					else {
						foundInterval = true;
					}
				}
				i++;
			}
			if(this.alwaysFlag === 0) {
				return foundInterval;
			}
			else {
				return !foundInterval;
			}
		};

		return ViewController.inherit({
			didInitialize: didInitialize,
			didRender: didRender,

			renderMonthCalendar: renderMonthCalendar,
			populateMonthCalendar: populateMonthCalendar,
			clearSelections: clearSelections,

			handlePrev: handlePrev,
			handleNext: handleNext,
			handleDaySelection: handleDaySelection,
			handlePickupDateClick: handlePickupDateClick,
			handleDeliveryDateClick: handleDeliveryDateClick,

			isDayInAvailability: isDayInAvailability,
			isIntervalAvailable: isIntervalAvailable
		});
	}
);
