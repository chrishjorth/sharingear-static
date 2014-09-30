/**
 * Controller for the Sharingear List your gear page view.
 * @author: Michail Nenkov, Chris Hjorth
 */

 define(
 	['viewcontroller', 'app'],
 	function(ViewController, App) {
 		var ListYourGear = ViewController.inherit({

 			didRender: didRender,
 			createGearList: createGearList,
 			handleLogin: handleLogin

 		});

 		return ListYourGear;

 		function didRender() {

 			this.setupEvent('click', '#submitGearButton', this, this.handleLogin);

 		}

 		function createGearList() {

 			var selectedGear = [];
 			$('input[type=checkbox]').each(function () {
 				if (this.checked) {
 					var pair = {type: ''};
 					pair.type = this.value;
 					selectedGear.push(pair);
 				}
 			});

 			var selectedGearJSON = JSON.stringify(selectedGear);

 			return selectedGearJSON;
 			//console.log(selectedGearJSON);

		}

		function handleLogin(event, callback) {
			var view = event.data,
				user = App.user;
			user.login(function(error) {
				if(!error) {


					var gearList = view.createGearList();

					//here add REST

					App.router.navigateTo('dashboard');

				}
				view.render();
				if(callback && typeof callback === 'function') {
					callback();
				}
			});
		}
	}
);