/**
 * Controller for the Sharingear Your tech profiles dashboard page view.
 * @author: Chris Hjorth
 */

'use strict';

define(
	['config', 'underscore', 'jquery', 'viewcontroller', 'app', 'models/techprofilelist'],
	function(Config, _, $, ViewController, App, TechProfileList) {
		var techprofilesBlockID,

			didInitialize,
			didRender,
			populateYourTechProfiles,

			handleAddTechProfile,
			handleEditTechProfileItem;

		techprofilesBlockID = 'yourtechprofiles-techprofile-block';

		didInitialize = function() {
			var view = this;
			view.techProfilesList = new TechProfileList.constructor({
				rootURL: Config.API_URL
			});
			view.techProfilesList.initialize();
			view.techProfilesList.getUserTechProfiles(App.user.data.id, function() {
				view.render();
			});
		};

		didRender = function() {
			if(App.header) {
				App.header.setTitle('Your technician profiles');
			}

			if(this.techProfilesList.data.length > 0) {
				this.populateYourTechProfiles();
			}
			else {
				$('#' + techprofilesBlockID, this.$element).append('You haven\'t listed any technician profiles yet!');
			}

			this.setupEvent('click', '#dashboard-yourtechnicianprofiles-add-btn', this, this.handleAddTechProfile);
			this.setupEvent('click', '.yourtechnicianprodiles-item-edit-btn', this, this.handleEditTechProfileItem);
		};

		populateYourTechProfiles = function(callback) {
			var view = this;
			require(['text!../templates/yourtechprofiles-item.html'], function(YourTechProfilesItemTemplate) {
				var yourTechProfilesItemTemplate = _.template(YourTechProfilesItemTemplate),
					yourTechProfiles = view.techProfilesList.data,
					$techProfilesBlock, defaultTechProfile, techProfile, i, $techProfileItem;

				$techProfilesBlock = $('#' + techprofilesBlockID, view.$element);

				for(i = 0; i < yourTechProfiles.length; i++) {
					defaultTechProfile = {
						id: null,
						roadie_type: '',
						model: '',
						description: '',
						img_url: 'images/placeholder_grey.png',
						price_a: 0,
						price_b: 0,
						price_c: 0,
						owner_id: null
					};

					techProfile = yourTechProfiles[i];
					_.extend(defaultTechProfile, techProfile.data);
					if(defaultTechProfile.images.length > 0) {
						defaultTechProfile.img_url = defaultTechProfile.images.split(',')[0];
					}
					$techProfileItem = $(yourTechProfilesItemTemplate(defaultTechProfile));
					$('.sg-bg-image' , $techProfileItem).css({
						'background-image': 'url("' + defaultTechProfile.img_url + '")'
					});
					$techProfilesBlock.append($techProfileItem);
				}
				if(callback && typeof callback === 'function') {
					callback();
				}
			});
		};

		handleAddTechProfile = function() {
			App.router.openModalView('addtechprofile');
		};

		handleEditTechProfileItem = function(event) {
			var view = event.data,
				techProfile;
			techProfile = view.techProfilesList.getTechProfileItem('id', $(this).data('yourtechprofileid'));
			App.router.openModalView('edittechprofile', techProfile);
		};

		return ViewController.inherit({
			didInitialize: didInitialize,
			didRender: didRender,
			populateYourTechProfiles: populateYourTechProfiles,

			handleAddTechProfile: handleAddTechProfile,
			handleEditTechProfileItem: handleEditTechProfileItem
		}); 
	}
);