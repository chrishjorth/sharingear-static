/**
 * Handles viewcontroller and template loading.
 * @author: Chris Hjorth
 */

'use strict';

define(
	['underscore', 'jquery'],
	function(_, $) {
		var ViewLoader,
			mainViewContainer,
			modalViewLightbox,
			modalViewContainer,

			loadView,
			loadSubview,
			loadModalView,
			closeModalView;

		mainViewContainer = '.view-container';
		modalViewLightbox = '.modal-view-lightbox';
		modalViewContainer = '.modal-view-container';

		/**
		 * Note that a path for a subviews could also simply be a content reference, fx gear/1
		 */
		//TODO: Consider turning this into recursive for the case of subviews
		loadView = function(view, path, data, callback) {
			var viewLoader = this,
				renderSubviews;

			renderSubviews = function() {
				var subview = viewLoader.currentViewController.subPath;
				if(subview !== null && subview !== '') {
					viewLoader.loadSubview(data, function(error, loadedSubviewController) {
						viewLoader.currentSubViewController = loadedSubviewController;
						if(_.isFunction(viewLoader.currentViewController.didRenderSubview) === true) {
							viewLoader.currentViewController.didRenderSubview();
						}
						if(_.isFunction(callback) === true) {
							callback(null, viewLoader.currentViewController);
						}
					});
				}
				else {
					if(_.isFunction(callback) === true) {
						callback(null, viewLoader.currentViewController);
					}
				}
			};
			//If the view is already loaded just update the path and call render subviews
			if(this.currentViewController !== null && this.currentViewController.name === view && this.currentViewController.hasSubviews === true) {
				this.currentViewController.path = path;
				this.currentViewController.setSubPath();
				renderSubviews();
				return;
			}
			
			require(['viewcontrollers/' + view, 'text!../templates/' + view + '.html'], function(ViewController, ViewTemplate) {
				//Close the previous controller properly before loading a new one
				if(viewLoader.currentViewController !== null) {
					viewLoader.currentViewController.close();
				}
				viewLoader.currentViewController = new ViewController.constructor({name: view, $element: $(mainViewContainer), labels: {}, template: ViewTemplate, path: path, passedData: data});
				//The ready property is so a controller can abort loading, useful if a redirect is being called
				if(viewLoader.currentViewController.ready === true) {
					viewLoader.currentViewController.render(function() {
						renderSubviews();
					});
				}
				else {
					callback('Loading of view was aborted by controller.');
				}
			});
		};

		loadSubview = function(data, callback) {
			var viewLoader = this,
				subview = this.currentViewController.subPath,
				viewString = this.currentViewController.name + '-' + subview;
			require(['viewcontrollers/' + viewString, 'text!../templates/' + viewString + '.html'], function(SubViewController, SubViewTemplate) {
				if(viewLoader.currentSubViewController !== null) {
					viewLoader.currentSubViewController.close();
				}
				viewLoader.currentSubViewController = new SubViewController.constructor({name: subview, $element: viewLoader.currentViewController.$subViewContainer, labels: {}, template: SubViewTemplate, path: viewLoader.currentViewController.path, passedData: data});
				viewLoader.currentSubViewController.render(function() {
					if(_.isFunction(viewLoader.currentViewController.didRenderSubviews) === true) {
						viewLoader.currentViewController.didRenderSubviews();
					}
				});
				if(_.isFunction(callback) === true) {
					callback(null, viewLoader.currentSubViewController);
				}
			});
		};

		loadModalView = function(view, path, data, callback) {
			var viewLoader = this;
			require(['viewcontrollers/' + view, 'text!../templates/' + view + '.html'], function(ViewController, ViewTemplate) {
                var $modalViewLightbox = $(modalViewLightbox),
                    $modalViewContainer = $(modalViewContainer);

                //TODO: remove this once out of closed beta
                if (view === 'closedbeta') {
                    $modalViewContainer.addClass('closed-beta-modal');
                }

				if(viewLoader.currentModalViewController !== null) {
					viewLoader.currentModalViewController.close();
					viewLoader.openModalViews.pop();
				}

				if($modalViewLightbox.hasClass('hidden') === true) {
					$modalViewLightbox.removeClass('hidden');
					$('body').addClass('modal-open');
				}

				viewLoader.currentModalViewController = new ViewController.constructor({name: view, $element: $modalViewContainer, labels: {}, template: ViewTemplate, path: path, passedData: data});
				if(viewLoader.currentModalViewController.ready === true) {
					viewLoader.currentModalViewController.render(function(error, subview, $subViewContainer) {
						if(!error && subview && subview !== null) {
							viewLoader.loadSubview(subview, $subViewContainer, data);
						}
					});
				}
				
				callback(null, viewLoader.currentModalViewController);
			});
		};

		closeModalView = function(callback) {
			var viewLoader = this,
				$modalViewLightbox = $(modalViewLightbox),
				previousModal = null;

			if(this.currentModalViewController !== null) {
				this.currentModalViewController.close();
				this.currentModalViewController = null;
			}
			if($modalViewLightbox.hasClass('hidden') === false) {
				$modalViewLightbox.addClass('hidden');
				$('body').removeClass('modal-open');
			}

			//TODO: remove once out of closed beta
			$(modalViewContainer).removeClass('closed-beta-modal');

			//Remove modal from queue
			this.openModalViews.shift();

			if(this.openModalViews.length > 0) {
				previousModal = this.openModalViews[this.openModalViews.length - 1];
				this.loadModalView(previousModal.view, previousModal.route, previousModal.data, function(error, loadedModalViewController) {
					if(_.isFunction(previousModal.callback) === true) {
						previousModal.callback();
					}
					callback(null, loadedModalViewController);
				});
			}
			else {
				//Render the underlying view again so that data gets updated
				this.loadView(viewLoader.currentViewController.name, viewLoader.currentViewController.path, viewLoader.currentViewController.passedData, function() {
					if(_.isFunction(callback)) {
						callback(null, previousModal);
					}
				});
				/*this.currentViewController.initialize();
				this.currentViewController.render(function(error, subview, $subViewContainer) {
					if(!error && subview && subview !== null) {
						viewLoader.loadSubview(subview, $subViewContainer, null, function(error, loadedSubviewController) {
							if(!error) {
								viewLoader.currentSubViewController = loadedSubviewController;
							}
						});
					}
				});*/
			}
		};

		ViewLoader = {
			currentViewController: null,
			currentSubViewController: null,
			currentModalViewController: null,
			openModalViews: [],

			loadView: loadView,
			loadSubview: loadSubview,
			loadModalView: loadModalView,
			closeModalView: closeModalView
		};
		return ViewLoader;
	}
);
