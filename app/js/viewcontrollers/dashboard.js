/**
 * Controller for the Sharingear dashboard view.
 * @author: Chris Hjorth
 */

'use strict';

define(
	['jquery', 'viewcontroller', 'app'],
	function($, ViewController, App) {
		var subViewContainerID,

			didInitialize,
			didRender,
			didRenderSubview,

			handleSelection,

			changeActiveState;

		/* Static variables */
		subViewContainerID = 'dashboard-subview-container';

		didInitialize = function() {
			if(App.user.data.id === null) {
				this.ready = false;
				App.router.navigateTo('home');
				return;
			}

			this.$subViewContainer = $('');
			
			if(this.path === 'dashboard') {
				this.ready = false; //We abort loading the view
				App.router.navigateTo('dashboard/profile');
			}
		};

		didRender = function() {
			this.$subViewContainer = $('#' + subViewContainerID);
			this.setupEvent('click', '.dashboard-menu .list-group-item', this, this.handleSelection);
		};

		didRenderSubview = function() {
			var $menuItem;
			$menuItem = $('a[href="#' + this.path + '"]');
			this.changeActiveState($menuItem);
		};

		handleSelection = function(event) {
			var view = event.data;
			view.changeActiveState($(this));
		};

        changeActiveState = function($menuItem){
        	$('.list-group-item', this.$element).removeClass('list-group-item-selected');
			$menuItem.addClass('list-group-item-selected');
        };

        return ViewController.inherit({
        	didInitialize: didInitialize,
			didRender: didRender,
			didRenderSubview: didRenderSubview,

			handleSelection: handleSelection,

            changeActiveState: changeActiveState
		});
	}
);