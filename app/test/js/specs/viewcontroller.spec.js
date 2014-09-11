define(
	['jquery', 'chai', 'sinon', 'viewcontroller'],
	function($, chai, Sinon, ViewController) {
		var expect = chai.expect;
		
		describe('ViewController', function() {
			beforeEach(function() {
				this.$fixtures = $('#fixtures');
				this.vc = new ViewController.constructor({name: 'testVC', $element: this.$fixtures, labels: {}, template: '<div>Test Template</div>'});
			});

			afterEach(function() {
				this.vc.close();
				this.$fixtures.empty();
			});

			it('Provides the viewcontroller object', function() {
				expect(ViewController).to.have.property('constructor');
				expect(ViewController.constructor).to.be.a('function');
			});

			it('Can be constructed', function() {
				this.vc = new ViewController.constructor();
			});

			it('Can render', function() {
				this.vc.render();
				expect(this.$fixtures.html()).to.equal('<div>Test Template</div>');
			});

			it('Can handle events', function(done) {
				var $testButton = $('<button type="button" href="javascript:;" class="testButton">Test button</button>'),
					vc = this.vc;
				this.$fixtures.append($testButton);
				vc.setupEvent('click', '.testButton', null, function() {
					vc.unbindEvents();
					expect(vc.userEvents.length).to.equal(0);
					done();
				});
				$testButton.click();
			});

			it('Can close', function() {
				this.vc.close();
				expect(this.$fixtures.html()).to.equal('');
			});

		});
	}
);
