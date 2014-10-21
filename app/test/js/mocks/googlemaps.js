/**
 * Mock of the Google Maps SDK.
 * @author: Chris Hjorth
 */
define(
	[],
	function() {
		return {
			Geocoder: Geocoder,
			LatLng: LatLng,
			places: {
				Autocomplete: Autocomplete
			}
		};

		function Geocoder() {
			return {
				geocode: geocode
			}
		}

		function geocode() {
			
		}

		function LatLng(latitude, longitude) {

		}

		function Autocomplete(input) {
			return {};
		}
	}
);