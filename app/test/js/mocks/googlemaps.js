/**
 * Mock of the Google Maps SDK.
 * @author: Chris Hjorth
 */
define(
	[],
	function() {
		return {
			GeocoderStatus: {
				OK: true
			},
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

		function geocode(params, callback) {
			callback(null, null);
		}

		function LatLng(latitude, longitude) {

		}

		function Autocomplete(input) {
			return {};
		}
	}
);