/**
 * Controller for the Sharingear dashboard view.
 * @author: Chris Hjorth
 */

define(
	['underscore', 'utilities', 'viewcontroller'],
	function(_, Utilities, ViewController) {
		var Dashboard = Utilities.inherit(ViewController, {
			subViewContainerID: 'dashboard-subview-container',
			$subViewContainer: $(''),
			subPath: '',
			gearBlockID: 'yourgear-gear-block',

			didInitialize: didInitialize,
			didRender: didRender,
			loadSubView: loadSubView,
			getSubviewParameters: getSubviewParameters,
			getProfileParameters: getProfileParameters,
			renderSubview: renderSubview,
			renderYourGear: renderYourGear
		});

		return Dashboard;

		function didInitialize() {
			if(this.path === 'dashboard') {
				this.path = 'dashboard/profile';
			}
			this.subPath = this.path.substring(this.path.indexOf('/') + 1);
		}

		function didRender() {
			this.$subViewContainer = $('#' + this.subViewContainerID);
			this.loadSubView();
		}

		function loadSubView(callback) {
			var router = this;
			require(['text!../templates/dashboard-' + router.subPath + '.html'], function(SubViewTemplate) {
				var template = _.template(SubViewTemplate);
				router.$subViewContainer.html(template(router.getSubviewParameters()));
				router.renderSubview();
				if(callback && typeof callback === 'function') {
					callback();
				}
			});
		}

		function getSubviewParameters() {
			var parameters = {};
			switch(this.subPath) {
				case 'profile':
					parameters = this.getProfileParameters();
					break;
			}
			return parameters;
		}

		function getProfileParameters() {
			var profileParameters = {
				name: 'Chris Hjorth',
				hometown: 'Aalborg',
				bio: 'Blah blah',
				genres: ''
			};
			return profileParameters;
		}

		function renderSubview() {
			switch(this.subPath) {
				case 'yourgear':
					this.renderYourGear();
					break;
			}
		}

		function renderYourGear(callback) {
			var view = this;
			require(['text!../templates/yourgear-item.html'], function(YourGearItemTemplate) {
				var yourGearItemTemplate = _.template(YourGearItemTemplate),
					yourGear, defaultGear, gear;

				yourGear = [{
					id: 0,
					type: 0,
					subtype: 0,
					brand: 0,
					model: 'Gibson Guitar',
					description: 'blah blah',
					photos: 'url,url,url',
					price: 100.5,
					seller_user_id: 0,
					city: 'Copenhagen',
					address: '',
					price1: 4,
					price2: 15,
					price3: 75
				}, {
					id: 0,
					type: 0,
					subtype: 0,
					brand: 0,
					model: 'Gibson Guitar',
					description: 'blah blah',
					photos: 'url,url,url',
					price: 100.5,
					seller_user_id: 0,
					city: 'Copenhagen',
					address: '',
					price1: 4,
					price2: 15,
					price3: 75
				}, {
					id: 0,
					type: 0,
					subtype: 0,
					brand: 0,
					model: 'Gibson Guitar',
					description: 'blah blah',
					photos: 'url,url,url',
					price: 100.5,
					seller_user_id: 0,
					city: 'Copenhagen',
					address: '',
					price1: 4,
					price2: 15,
					price3: 75
				}];

				defaultGear = {
					id: 0,
					type: 0,
					subtype: 0,
					brand: 0,
					model: '',
					description: '',
					photos: '',
					price: 0,
					seller_user_id: 0,
					city: '',
					address: '',
					country: '',
					price1: 0,
					price2: 0,
					price3: 0
				};

				for(i = 0; i < yourGear.length; i++) {
					gear = yourGear[i];
					_.extend(defaultGear, gear);
					$('#' + view.gearBlockID).append(yourGearItemTemplate(defaultGear));
				}
				if(callback && typeof callback === 'function') {
					callback();
				}

			});
		}
	}
);