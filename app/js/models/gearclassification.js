/**
 * Defines the Sharingear gear classification.
 * @author: Chris Hjorth
 */
//TODO: Store the classification locally so that it is always ready on load after the first time
define(
	['underscore', 'model'],
	function(_, Model) {
		var GearClassification = Model.inherit({
			didInitialize: didInitialize,
			getClassification: getClassification
		});

		return GearClassification;

		function didInitialize() {
			this.data = {};
			this.getClassification();
		}

		function getClassification(callback) {
			var model = this;

			console.log('Get gear classification');

			if(_.isEmpty(this.data) === false) {
				if(callback && typeof callback === 'function') {
					callback(this.data);
				}
				return;
			}

			this.get('/gearclassification', function(error, gearClassification) {
				console.log('Gear classification returned.');
				if(error) {
					console.log(error);
					return;
				}
				model.data = gearClassification;
				if(callback && typeof callback === 'function') {
					callback(model.data);
				}
			});
		}
	}
);