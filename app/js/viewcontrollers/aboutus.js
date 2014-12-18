/**
 * Controller for the Sharingear About us page view.
 * @author: Chris Hjorth
 */

'use strict';

define(
	['viewcontroller','googlemaps'],
	function(ViewController, GoogleMaps) {
		var didInitialize,
			didRender,
			renderMap;

		didInitialize = function(){

		};

		didRender = function () {
			this.renderMap();
		};

		renderMap = function() {
			var mapOptions, latlong, marker;
			latlong = new GoogleMaps.LatLng(55.682276, 12.577168);
			mapOptions = {
				center: latlong,
				zoom: 14,
				maxZoom: 14
			};
			this.map = new GoogleMaps.Map(document.getElementById('aboutus-map'), mapOptions);
			marker = new GoogleMaps.Marker({
				position: latlong,
				map: this.map,
				icon: 'images/shagicon_003.png' // TODO: put icon on server
			});
		};

	return ViewController.inherit({
		didInitialize: didInitialize,
		didRender: didRender,
		renderMap: renderMap
	});

	}
);