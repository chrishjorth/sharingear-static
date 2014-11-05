/**
 * Controller for the Sharingear submerchant registration page view.
 * @author: Chris Hjorth
 */

define(
	['viewcontroller', 'app'],
	function(ViewController, App) {
		var Payment = ViewController.inherit({
			didInitialize: didInitialize,
			didRender: didRender,

			handleCancel: handleCancel,
			handleSubmit: handleSubmit,
			handleAccept: handleAccept
		});
		return Payment;

		function didInitialize() {
			
		}

		function didRender() {
			var user = App.user.data;
			if(user.address && user.address !== '') {
				$('#submerchantregistration-address', this.$element).parent().addClass('hidden');
			}
			if(user.postal_code && user.postal_code !== '') {
				$('#submerchantregistration-postalcode', this.$element).parent().addClass('hidden');
			}
			if(user.city && user.city !== '') {
				$('#submerchantregistration-city', this.$element).parent().addClass('hidden');
			}
			if(user.region && user.region !== '') {
				$('#submerchantregistration-region', this.$element).parent().addClass('hidden');
			}
			if(user.country && user.country !== '') {
				$('#submerchantregistration-country', this.$element).parent().addClass('hidden');
			}
			if(user.phone && user.phone !== '') {
				$('#submerchantregistration-phone', this.$element).parent().addClass('hidden');
			}

			this.setupEvent('click', '.btn-cancel', this, this.handleCancel);
			this.setupEvent('submit', '#submerchantregistration-form', this, this.handleSubmit);
			this.setupEvent('click', '#submerchantregistration-accept', this, this.handleAccept);
		}

		function handleCancel(event) {
			App.router.closeModalView();
		}

		function handleSubmit(event) {
			var view = event.data,
				user = App.user.data;
			user.address = $('#submerchantregistration-address', this.$element).val();
			user.postal_code = $('#submerchantregistration-postalcode', this.$element).val();
			user.city = $('#submerchantregistration-city', this.$element).val();
			user.region = $('#submerchantregistration-region', this.$element).val();
			user.country = $('#submerchantregistration-country', this.$element).val();
			user.phone = $('#submerchantregistration-phone', this.$element).val();
			$('#submerchantregistration-formcontainer', this.$element).addClass('hidden');
			$('#submerchantregistration-termscontainer', this.$element).removeClass('hidden');
		}

		function handleAccept(event) {
			var view = event.data;
//			App.user.update(function(error) {
//				if(error) {
//					console.log(error);
//					return;
//				}
//				App.router.openModalView('gearavailability', view.passedData);
//			});
				App.router.openModalView('gearavailability', view.passedData);
		}
	}
);