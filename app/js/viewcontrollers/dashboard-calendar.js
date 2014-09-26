/**
 * Controller for the Sharingear Calendar page view.
 * @author: Chris Hjorth
 */

define(
	['viewcontroller'],
	function(ViewController) {
		var Calendar = ViewController.inherit({
			weekMode: true, //if false then it is months mode

			didRender: didRender,

			switchToWeeks: switchToWeeks,
			switchToMonths: switchToMonths
		});

		return Calendar;

		function didRender() {
			this.setupEvent('click', '#dashboard-calendar-weeks-btn', this, this.switchToWeeks);
			this.setupEvent('click', '#dashboard-calendar-months-btn', this, this.switchToMonths);
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
	}
);