define(
	['jquery', 'chai', 'sinon', 'model'],
	function($, chai, Sinon, Model) {
		var expect = chai.expect;
		
		describe('Model', function() {
			beforeEach(function() {
				sinon.stub($, 'ajax', function(options) {
					options.success([]);
				});
			});

			afterEach(function() {
				$.ajax.restore();
			});

			it('Provides the model object', function() {
				expect(Model.constructor).to.be.a('function');
			});

			it('Can be constructed', function() {
				this.model = new Model.constructor();
			});

			it('Can perform GET requests', function(done) {
				this.model.get('someurl', function() {
					done();
				});
			});
		});
	}
);