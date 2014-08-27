define(
	['jquery', 'chai', 'sinon', 'viewcontrollers/editgear', 'app'],
	function($, chai, Sinon, EditGear, App) {
		require(['text!../templates/editgear.html'], function(EditGearTemplate) {
			var expect = chai.expect;
		
			describe('Edit gear ViewController', function() {

				beforeEach(function() {
					this.$fixtures = $('#fixtures');
					this.editGear = new EditGear({name: 'testVC', $element: this.$fixtures, labels: {}, template: EditGearTemplate, path: 'editgear'});
					sinon.spy(this.editGear, 'setupEvents');
					sinon.stub(App.router, 'closeModalView');
				});

				afterEach(function() {
					this.editGear.setupEvents.restore();
					App.router.closeModalView.restore();
					this.editGear.close();
					this.$fixtures.empty();
				});

				it('Provides the EditGear ViewController', function() {
					expect(EditGear).to.be.a('function');
				});

				it('Has correct template parameters', function() {
					var parameters = this.editGear.templateParameters;
					expect(parameters).to.have.property('brand');
					expect(parameters).to.have.property('model');
					expect(parameters).to.have.property('description');
				});

				it('Can render', function(done) {
					var spec = this;
					this.editGear.render(function() {
						sinon.assert.calledOnce(spec.editGear.setupEvents);
						done();
					});
				});

				it('Can handle save', function() {
					this.editGear.handleSave();
					sinon.assert.calledOnce(App.router.closeModalView);
				});

				it('Can handle cancel', function() {
					this.editGear.handleCancel();
					sinon.assert.calledOnce(App.router.closeModalView);
				});
			});
		});
	}
);
