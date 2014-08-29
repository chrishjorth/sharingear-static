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
				expect(Model).to.be.a('function');
			});

			it('Can be constructed', function() {
				this.model = new Model();
				expect(this.model.constructor.name).to.equal('Model');
			});

			it('Can perform GET requests', function(done) {
				this.model.get('someurl', function() {
					done();
				});
			});
		});
	}
);