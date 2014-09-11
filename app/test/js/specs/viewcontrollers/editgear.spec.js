define(
	['jquery', 'chai', 'sinon', 'viewcontrollers/editgear', 'app'],
	function($, chai, Sinon, EditGear, App) {
		require(['text!../templates/editgear.html'], function(EditGearTemplate) {
			var expect = chai.expect;
		
			describe('Edit gear ViewController', function() {

				beforeEach(function() {
					this.$fixtures = $('#fixtures');
					this.editGear = new EditGear.constructor({name: 'testVC', $element: this.$fixtures, labels: {}, template: EditGearTemplate, path: 'editgear'});
					sinon.spy(this.editGear, 'setupEvents');
					sinon.stub(App.router, 'closeModalView');
					sinon.stub(App.router, 'openModalView');
				});

				afterEach(function() {
					this.editGear.setupEvents.restore();
					App.router.closeModalView.restore();
					App.router.openModalView.restore();
					this.editGear.close();
					this.$fixtures.empty();
				});

				it('Provides the EditGear ViewController', function() {
					expect(EditGear.constructor).to.be.a('function');
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

				it('Can handle cancel', function(done) {
					var spec = this;
					this.editGear.render(function() {
						expect($('#editgear-form .btn-cancel', spec.$fixtures).length).to.equal(1);
						spec.editGear.handleCancel();
						sinon.assert.calledOnce(App.router.closeModalView);
						done();
					});
				});

				it('Can handle next', function(done) {
					var spec = this;
					this.editGear.render(function() {
						expect($('#editgear-form .btn-cancel', spec.$fixtures).length).to.equal(1);
						spec.editGear.handleNext();
						sinon.assert.calledOnce(App.router.openModalView);
						done();
					});
				});
			});
		});
	}
);
