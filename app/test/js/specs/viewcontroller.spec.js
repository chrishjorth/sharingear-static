define(
	['jquery', 'chai', 'sinon', 'viewcontroller'],
	function($, chai, Sinon, ViewController) {
		var expect = chai.expect;
		
		describe('ViewController', function() {
			beforeEach(function() {
				this.$fixtures = $('#fixtures');
				this.vc = new ViewController({name: 'testVC', $element: this.$fixtures, labels: {}, template: '<div>Test Template</div>'});
			});

			afterEach(function() {
				this.$fixtures.empty();
			});

			it('Provides the viewcontroller object', function() {
				expect(ViewController).to.be.a('function');
			});

			it('Can be constructed', function() {
				this.vc = new ViewController();
				expect(this.vc.constructor.name).to.equal('ViewController');
			});

			it('Can render', function() {
				this.vc.render();
				expect(this.$fixtures.html()).to.equal('<div>Test Template</div>');
			});

			it('Can close', function() {
				this.vc.close();
				expect(this.$fixtures.html()).to.equal('');
			});
		});
	}
);
