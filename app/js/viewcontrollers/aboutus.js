/**
 * Controller for the Sharingear About us page view.
 * @author: Chris Hjorth
 */

'use strict';

define(
	['underscore', 'jquery', 'viewcontroller','googlemaps', 'owlcarousel'],
	function(_, $, ViewController, GoogleMaps) {
		var testimonials,

			didInitialize,
			didRender,

			renderTestimonials,
			renderMap,
			loadFooter;

		testimonials = [{
			image_file: 'images/testimonials/3.jpg',
			citation: 'Got some gear or need some gear? It\'s all there on Sharingear. Get your gear out there, and get it workin\' for you.',
			name: 'stephen carpenter',
			role: 'guitarist',
			band: 'deftones'
		}, {
			image_file: 'images/testimonials/1.jpg',
			citation: 'It\'s kind of like a marketplace, friendship and community to share instruments and save costs and make some money. It\'s a way to make it easier for each other as musicians in bands - a way for everyone to help out.',
			name: 'peter dolving',
			role: 'vocalist',
			band: 'ex-the haunted/iamfire'
		}, {
			image_file: 'images/testimonials/2.jpg',
			citation: 'If you are in a band, flying into some place in Europe, sometimes instead of having to get the whole backline, maybe if you just need to fly in and play one show, there are musicians in other towns, possibliy in your town, that have gear just laying around you can rent.',
			name: 'ryan knight',
			role: 'guitarist',
			band: 'the black dahlia murder'
		}, {
			image_file: 'images/testimonials/4.jpg',
			citation: 'This is an extremely cool service and something that every musician needs to use. From time to time I do rent out of my mesa-boogie cabinets, and with this platform I am able to connect with more musicians than before. Try it out, I guarantee its a great experience for everyone playing music.',
			name: 'franz gottschalk',
			role: 'guitarist',
			band: 'ex-volbeat'
		}, {
			image_file: 'images/testimonials/6.jpg',
			citation: 'Musicians need to work more close together as the market doesn\'t leave anything left for those who actually create the music. Sharingear facilitates a networking opportunity, where you can not only save costs but also make cash from your gear.',
			name: 'ken holst',
			role: 'guitarist',
			band: 'illdisposed'
		}, {
			image_file: 'images/testimonials/5.jpg',
			citation: 'Need som equipment for a recording session and don\'t think your own gear is up to par? Or do you just want to try out some different possibilities in your own rehearsal space before deciding what to buy for yourself? Sharingear is the way to go...',
			name: 'mathias jensen',
			role: 'guitarist',
			band: 'hobby musician'
		}];

		didInitialize = function(){

		};

		didRender = function () {
			this.renderTestimonials();
			this.renderMap();
			this.loadFooter();
		};

		renderTestimonials = function() {
			var view = this;

			require(['text!../templates/testimonial.html'], function(TestimonialTemplate) {
				var testimonialTemplate = _.template(TestimonialTemplate),
					$owlContainer = $('.owl-carousel', view.$element),
					$testimonial,
					i;

				for(i = 0; i < testimonials.length; i++) {
					$testimonial = $(testimonialTemplate(testimonials[i]));
					$('.profile-pic', $testimonial).css({
						'background-image': 'url("' + testimonials[i].image_file + '")'
					});
					$owlContainer.append($testimonial);
				}

				$owlContainer.owlCarousel({
                	slideSpeed: 300,
                	paginationSpeed: 400,
                	singleItem: true
            	});
			});
		};

		renderMap = function() {
			var mapOptions, latlong, marker;
			latlong = new GoogleMaps.LatLng(55.6805421, 12.6037284);
			mapOptions = {
				center: latlong,
				zoom: 14,
				maxZoom: 14
			};
			this.map = new GoogleMaps.Map(document.getElementById('aboutus-map'), mapOptions);
			marker = new GoogleMaps.Marker({
				position: latlong,
				map: this.map,
				icon: 'images/map_pin.png' // TODO: put icon on server
			});
		};

		loadFooter = function() {
			var view = this;
			require(['viewcontrollers/footer', 'text!../templates/footer.html'], function(FooterController, FooterTemplate) {
				view.footer = new FooterController.constructor({name: 'footer', $element: $('footer', view.$element), template: FooterTemplate});
				view.footer.initialize();
				view.footer.render();
			});
		};

		return ViewController.inherit({
			didInitialize: didInitialize,
			didRender: didRender,

			renderTestimonials: renderTestimonials,
			renderMap: renderMap,
			loadFooter: loadFooter
		});
	}
);