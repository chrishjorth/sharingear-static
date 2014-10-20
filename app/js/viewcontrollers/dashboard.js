/**
 * Controller for the Sharingear dashboard view.
 * @author: Chris Hjorth
 */

define(
	['viewcontroller', 'app'],
	function(ViewController, App) {
		var Dashboard = ViewController.inherit({
			subViewContainerID: 'dashboard-subview-container',
			$subViewContainer: $(''),
			subPath: '',
			currentSubViewController: null,

			didInitialize: didInitialize,
			didRender: didRender,
			didRenderSubview: didRenderSubview,
            changeActiveState: changeActiveState
		});

		return Dashboard;

		function didInitialize() {
			if(App.user.data.id === null) {
				this.ready = false;
				App.router.navigateTo('home');
				return;
			}
			
			if(this.path === 'dashboard') {
				this.ready = false; //We abort loading the view
				App.router.navigateTo('dashboard/profile');
			}
		}

		function didRender(callback) {
			this.$subViewContainer = $('#' + this.subViewContainerID);
		}

		function didRenderSubview() {
			this.changeActiveState();
		}

        function changeActiveState(){
        	var state = this.path;
            if (state !== '') {
                var selectedA = $('a[href$="'+state+'"]:first');
                var selectedLi = selectedA.parent();
                var ulList = selectedLi.parent();

                ulList.children().each(function () {
                    var currentLi = $(this);
                    currentLi.removeClass('list-group-item-selected');
                });

                selectedLi.addClass('list-group-item-selected');
            }
        }
	}
);