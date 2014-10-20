/**
 * Controller for the Sharingear List your gear page view.
 * @author: Michail Nenkov, Chris Hjorth
 */

 define(
 	['viewcontroller', 'models/gearlist', 'app','utilities'],
 	function(ViewController, GearList, App, utilities) {
 		var ListYourGear = ViewController.inherit({

 			didRender: didRender,
 			handleLogin: handleLogin,
 			gearList: null,
 			getFormInput: getFormInput

 		});

 		return ListYourGear;

 		function didRender() {

            //Filling the Location input with current location using HTML5
            if(App.user.data.city===''){

                if(navigator.geolocation){
                    navigator.geolocation.getCurrentPosition(function(position){
                        var lat = position.coords.latitude;
                        var lon = position.coords.longitude;
                        utilities.geoLocationGetCity(lat,lon, function (locationCity) {
                            App.user.data.city = locationCity;
                        });

                    });
                }

            }else{
                var loc = App.user.data.city;
                $('#listyourgear-location').val(loc);
            }
            this.setupEvent('click', '#submitGearButton', this, this.handleLogin);
 		}

 		

		function handleLogin(event) {
			var view = event.data,
				user = App.user;
			user.login(function(error) {
				if(!error) {
					view.gearList = new GearList.constructor({
						rootURL: App.API_URL
					});
					view.gearList.listGear(view.getFormInput(), user.data.id, function(error, data) {
						if(!error) {
							App.router.navigateTo('dashboard/yourgear');
						}
						else {
							console.log('Error listing gear:');
							console.log(error);
						}
					});
					
				}
			});
		 }


		function getFormInput() {
 			var selectedGear = [];
 			$('input[type=checkbox]').each(function () {
 				var gearCity, gearPairs;
 				if (this.checked) {
 					gearCity = $("#listyourgear-location").val();
 					gearPairs = {
 						type: this.value, 
 						city: gearCity
 					};
 					selectedGear.push(gearPairs);
 				}
 			});
 			return selectedGear;
		}
	}
);