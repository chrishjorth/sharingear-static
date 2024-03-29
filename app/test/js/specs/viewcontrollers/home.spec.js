define(
	['jquery', 'chai', 'sinon', 'viewcontrollers/home'],
	function($, chai, Sinon, Home) {
		require(['text!../templates/home.html'], function(HomeTemplate) {
			var expect = chai.expect;
		
			describe('Home ViewController', function() {
				beforeEach(function() {
					this.$fixtures = $('#fixtures');
					this.home = new Home.constructor({name: 'testVC', $element: this.$fixtures, labels: {}, template: HomeTemplate});
					sinon.spy(this.home, 'populateSearchBlock');
					this.home.render();
				});

				afterEach(function() {
					this.home.populateSearchBlock.restore();
					this.home.close();
					this.$fixtures.empty();
				});

				it('Provides the Home ViewController', function() {
					expect(Home.constructor).to.be.a('function');
				});

				it.skip('Sets up events', function() {
					expect(this.home.userEvents[0].eventType).to.equal('submit');
					expect(this.home.userEvents[0].element).to.equal('#home-search-form');
				});

				it('Can perform a search', function(done) {
					//Check that form HTML is correct
					var spec = this,
						$searchForm = $('#home-search-form');

					expect($searchForm.attr('action')).to.equal('');
					expect($searchForm.attr('onsubmit')).to.equal('return false;');

					//Simulate the event object
					/*this.home.handleSearch({
						data: this.home
					}, function() {
						sinon.assert.calledOnce(spec.home.populateSearchBlock);*/
						done();
					//});
				});

				it.skip('Can populate search results', function(done) {
					var $searchBlock = $('#' + this.home.searchBlockID),
						searchResults;
						
					searchResults = [{}];

					this.home.populateSearchBlock(searchResults, function() {
						expect($('.search-result', $searchBlock).length).to.equal(1);
						done();
					});
				});
			});
		});
	}
);
