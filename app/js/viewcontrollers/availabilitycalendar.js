/**
 * Controller for the Sharingear Availability Calendar view.
 * @author: Chris Hjorth
 */

'use strict';

define(
	['jquery', 'viewcontroller', 'app', 'models/localization', 'moment'],
	function($, ViewController, App, Localization, Moment) {
		var didInitialize,
			didRender,

			renderCalendar,
			renderSelections,

			populateCalendar,

			clearSelections,

			handlePrev,
			handleNext,
			handleAlwaysAvailable,
			handleNeverAvailable,
			handleDayStartSelect,
			handleDayMoveSelect,
			handleDayEndSelect,

			setAlwaysState,
			isBeforeOrSameDay,
			isAfterOrSameDay,

			getSelections,
			getAlwaysFlag;

		didInitialize = function() {
			var view = this;

			Moment.locale('en-custom', {
				week: {
					dow: 1,
					doy: 4
				}
			});

			this.gear = this.passedData;
			this.shownMoment = new Moment.tz(Localization.getCurrentTimeZone());
			this.selections = {}; //key value pairs where keys are months and values are arrays of start and end dates
            this.alwaysFlag = 0;

            this.gear.getAvailability(App.user.data.id, function(error, result) {
                var availabilityArray = result.availabilityArray,
                    i, startMoment, endMoment;

                view.setAlwaysState(result.alwaysFlag);

                if(error) {
                	console.log('Error retrieving gear availability: ' + error);
                    return;
                }

                for(i = 0; i < availabilityArray.length; i++) {
                    console.log('FIXME: add string format to moment constructor: ' + availabilityArray[i].start);
                    startMoment = new Moment.tz(availabilityArray[i].start, Localization.getCurrentTimeZone());
                    endMoment = new Moment.tz(availabilityArray[i].end, Localization.getCurrentTimeZone());
                    if(Array.isArray(view.selections[startMoment.year() + '-' + (startMoment.month() + 1)]) === false) {
                        view.selections[startMoment.year() + '-' + (startMoment.month() + 1)] = [];
                    }
                    view.selections[startMoment.year() + '-' + (startMoment.month() + 1)].push({
                        startMoment: startMoment,
                        endMoment: endMoment
                    });
                }
                //console.log('AVAILABILITY:');
                //console.log(view.alwaysFlag);
                //console.log(view.selections);
                view.renderSelections();
            });
		};

		didRender = function() {
			var $calendarContainer = $('.calendar', this.$element);
			this.renderCalendar($calendarContainer);
			this.populateCalendar(this.shownMoment, $calendarContainer);
			this.clearSelections();
			this.renderSelections();

			this.setupEvent('click', '.prev-btn', this, this.handlePrev);
			this.setupEvent('click', '.next-btn', this, this.handleNext);
			this.setupEvent('click', '.always-btn', this, this.handleAlwaysAvailable);
            this.setupEvent('click', '.never-btn', this, this.handleNeverAvailable);

            this.setupEvent('mousedown touchstart', '.calendar .day', this, this.handleDayStartSelect);
		};

		renderCalendar = function($monthCalendarContainer) {
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

		renderSelections = function() {
            var selections = this.selections[this.shownMoment.year() + '-' + (this.shownMoment.month() + 1)],
                $calendarContainer = $('.calendar', this.$element),
                i, startMoment, endMoment, momentIterator, dayIDString;

            if(this.alwaysFlag === 1) { //We do not need the case of 0 since by assertion the cells have been cleared
                $('.day', $calendarContainer).each(function() {
                    var $this = $(this);
                    if($this.hasClass('disabled') === false) {
                        $this.addClass('selected');
                    }
                });
            }

            if(Array.isArray(selections) === false) {
                return;
            }

            for(i = 0; i < selections.length; i++) {
                startMoment = selections[i].startMoment;
                console.log('FIXME: moment constructor string format');
                momentIterator = new Moment.tz({year: startMoment.year(), month: startMoment.month(), day: startMoment.date()}, Localization.getCurrentTimeZone());
                dayIDString = '#calendar-day-' + momentIterator.year() + '-' + (momentIterator.month() + 1) + '-' + momentIterator.date();
                $(dayIDString, $calendarContainer).addClass('selected');
                endMoment = selections[i].endMoment;
                
                while(momentIterator.isBefore(endMoment, 'day') === true) {
                	dayIDString = '#calendar-day-' + momentIterator.year() + '-' + (momentIterator.month() + 1) + '-' + momentIterator.date();
                    if(this.alwaysFlag === 0) {
                        $(dayIDString, $calendarContainer).addClass('selected');    
                    }
                    else {
                        $(dayIDString, $calendarContainer).removeClass('selected');
                    }
                    momentIterator.add(1, 'days');
                }
                dayIDString = '#calendar-day-' + momentIterator.year() + '-' + (momentIterator.month() + 1) + '-' + momentIterator.date();
               	if(this.alwaysFlag === 0) {
                    $(dayIDString, $calendarContainer).addClass('selected');    
                }
                else {
                    $(dayIDString, $calendarContainer).removeClass('selected');
                }
            }
        };

        populateCalendar = function(moment, $calendarContainer) {
			var startDay = moment.date(1).weekday(),
				iteratorMoment, $dayBox, row, col, date;

			iteratorMoment = new Moment.tz(moment, Localization.getCurrentTimeZone());

			$('.currentmonth', this.$element).html(moment.format('MMMM YYYY'));

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
					if(iteratorMoment.isBefore(new Moment.tz(Localization.getCurrentTimeZone())) === true){
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
			view.shownMoment.subtract(1, 'months');
			view.populateCalendar(view.shownMoment, $calendarContainer);
			view.renderSelections();

            return false;
		};

		handleNext = function (event) {
			var view = event.data,
				$calendarContainer;

			view.clearSelections();

			$calendarContainer = $('.calendar', view.$element);
			view.shownMoment.add(1, 'months');
			view.populateCalendar(view.shownMoment, $calendarContainer);
			view.renderSelections();

            return false;
		};

		handleAlwaysAvailable = function(event) {
            var view = event.data;
            
            view.setAlwaysState(1);

            view.clearSelections();
            view.renderSelections();

            return false;
        };

        handleNeverAvailable = function(event) {
            var view = event.data;

            view.setAlwaysState(0);

			view.clearSelections();
            view.renderSelections();

            return false;
        };

        handleDayStartSelect = function(event) {
            var view = event.data,
                $this = $(this);

            if(event.type !== 'mousedown' && !(event.originalEvent.touches && event.originalEvent.touches.length == 1)) {
                return;
            }

            //Do not allow selecting outside of the month
            if($this.data('month') !== view.shownMoment.month() + 1) {
                return;
            }

            if($this.hasClass('disabled') === true) {
            	return;
            }

            if($this.hasClass('selected') === true) {
                $this.removeClass('selected');
                view.dragMakeAvailable = false;
            }
            else {
                $this.addClass('selected');
                view.dragMakeAvailable = true;
            }

			$('body').on('mousemove touchmove', null, view, view.handleDayMoveSelect);
            $('body').on('mouseup touchend', null, view, view.handleDayEndSelect);

            return false;
        };

        handleDayMoveSelect = function(event) {
            //Check if mouse is over a box, if yes add selected between start selection and current, remove rest on current table, besides those that are after another start
            var view = event.data,
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

            $calendarContainer = $('.calendar', view.$element);
            $('.day', $calendarContainer).each(function() {
                var $this = $(this),
                    dayBoxOffset;

                dayBoxOffset = $this.offset();
                if($this.data('month') === view.shownMoment.month() + 1) {
                    if(selectionX >= dayBoxOffset.left && selectionX <= dayBoxOffset.left + $this.width() && selectionY >= dayBoxOffset.top && selectionY <= dayBoxOffset.top + $this.height()) {
                        if(view.dragMakeAvailable === false) {
                            $this.removeClass('selected');
                        }
                        else {
                            if($this.hasClass('selected') === false) {
                                $this.addClass('selected');
                            }
                        }
                    }
                }
            });
        };

        handleDayEndSelect = function(event) {
            var view = event.data,
                key, monthSelections, i, j, currentSelection, didSplice, startMomentA, endMomentA, startMomentB, endMomentB;

            $('body').off('mousemove touchmove', view.handleDayMoveSelect);
            $('body').off('mouseup touchend', view.handleDayEndSelect);

            //Add days to selections
            key = view.shownMoment.year() + '-' + (view.shownMoment.month() + 1);
            view.selections[key] = [];
            $('.calendar .day', view.$element).each(function() {
                var $this = $(this),
                    addSelection;

                addSelection = function() {
                    var selection;
                    console.log('FIXME: moment constructor string format');
                    selection = {
                        startMoment: new Moment.tz({year: $this.data('year'), month: parseInt($this.data('month'), 10) - 1, day: $this.data('date')}, Localization.getCurrentTimeZone()),
                        endMoment: new Moment.tz({year: $this.data('year'), month: parseInt($this.data('month'), 10) - 1, day: $this.data('date')}, Localization.getCurrentTimeZone())
                    };
                    view.selections[key].push(selection);
                };

                if($this.hasClass('disabled') === false) {
                    if(view.alwaysFlag === 1) {
                        if($this.hasClass('selected') === false) {
                            addSelection();
                        }
                    }
                    else {
                        if($this.hasClass('selected') === true) {
                            addSelection();
                        }
                    }
                }
            });

            //Scan selections for this month and cleanup overlaps and merge adiacent days
            monthSelections = view.selections[key];
            i = 0;
            while(i < monthSelections.length) {
                currentSelection = monthSelections[i];
                j = i + 1;
                didSplice = false;
                //Match a selection against all the following selections
                while(j < monthSelections.length) {
                    startMomentA = currentSelection.startMoment;
                    endMomentA = currentSelection.endMoment;
                    startMomentB = monthSelections[j].startMoment;
                    endMomentB = monthSelections[j].endMoment;
                    if(view.isAfterOrSameDay(startMomentA, startMomentB) && view.isBeforeOrSameDay(startMomentA, endMomentB) && view.isAfterOrSameDay(endMomentA, endMomentB)) {
                        //startA is between B and endA is after endB: startA becomes startB so that B is included in A, then remove B
                        currentSelection.startMoment = startMomentB;
                        monthSelections.splice(j, 1);
                        didSplice = true;
                    }
                    else if(view.isBeforeOrSameDay(startMomentA, startMomentB) && view.isAfterOrSameDay(endMomentA, startMomentB) && view.isBeforeOrSameDay(endMomentA, endMomentB)) {
                        //startB is between A and endB is after endA: endA becomes endB so that B is included in A, then remove B
                        currentSelection.endMoment = endMomentB;
                        monthSelections.splice(j, 1);
                        didSplice = true;
                    }
                    else if(view.isBeforeOrSameDay(startMomentA, startMomentB) && view.isAfterOrSameDay(endMomentA, endMomentB)) {
                        //B is included in A: remove B
                        monthSelections.splice(j, 1);
                        didSplice = true;
                    }
                    else if(view.isAfterOrSameDay(startMomentA, startMomentB) && view.isBeforeOrSameDay(endMomentA, endMomentB)) {
                        //A is included in B: A becomes B, then remove B
                        currentSelection.startMoment = startMomentB;
                        currentSelection.endMoment = endMomentB;
                        monthSelections.splice(j, 1);
                        didSplice = true;
                    }
                    else if(endMomentB.date() + 1 === startMomentA.date() && endMomentB.month() === startMomentA.month() && endMomentB.year() === startMomentA.year()) {
                        //B is left adjacent to A: startA becomes startB so that they are joined, remove B
                        currentSelection.startMoment = startMomentB;
                        monthSelections.splice(j, 1);
                        didSplice = true;
                    }
                    else if(endMomentA.date() + 1 === startMomentB.date() && endMomentA.month() === startMomentB.month() && endMomentA.year() === startMomentB.year()) {
                        //B is right adjacent to A: endA becomes endB so that they are joined, remove A
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

            view.clearSelections();
            view.renderSelections();
        };

        setAlwaysState = function(flag) {
        	var $alwaysBtn = $('.always-btn', this.$element),
        		$neverBtn = $('.never-btn', this.$element);
        	if(flag !== this.alwaysFlag) {
        		this.alwaysFlag = flag;
        		this.selections = {};
        	}
        	$alwaysBtn.removeClass('disabled');
        	$neverBtn.removeClass('disabled');
        	if(this.alwaysFlag === 1) {
        		$alwaysBtn.addClass('disabled');
        	}
        	else {
        		$neverBtn.addClass('disabled');
        	}
        };

        isBeforeOrSameDay = function(momentA, momentB) {
            return momentA.isBefore(momentB, 'day') || momentA.isSame(momentB, 'day');
        };

        isAfterOrSameDay = function(momentA, momentB) {
            return momentA.isAfter(momentB, 'day') || momentA.isSame(momentB, 'day');
        };

        getSelections = function() {
        	return this.selections;
        };

        getAlwaysFlag = function() {
        	return this.alwaysFlag;
        };

		return ViewController.inherit({
			didInitialize: didInitialize,
			didRender: didRender,

			renderCalendar: renderCalendar,
			renderSelections: renderSelections,

			populateCalendar: populateCalendar,

			clearSelections: clearSelections,

			handlePrev: handlePrev,
			handleNext: handleNext,
			handleAlwaysAvailable: handleAlwaysAvailable,
			handleNeverAvailable: handleNeverAvailable,
			handleDayStartSelect: handleDayStartSelect,
			handleDayMoveSelect: handleDayMoveSelect,
			handleDayEndSelect: handleDayEndSelect,

			setAlwaysState: setAlwaysState,
			isBeforeOrSameDay: isBeforeOrSameDay,
			isAfterOrSameDay: isAfterOrSameDay,

			getSelections: getSelections,
			getAlwaysFlag: getAlwaysFlag
		});
	}
);
