/* Include your scripts from /scripts here
*
*	e.g. //= include scripts/main.js
*
*/
window.textToHtml = function(html){
	// Prepare
	var result = String(html)
		.replace(/<\!DOCTYPE[^>]*>/i, '')
		.replace(/<(html|head|body|title|meta|script)([\s\>])/gi,'<div class="document-$1"$2')
		.replace(/<\/(html|head|body|title|meta|script)\>/gi,'</div>')
	;

	// Return
	return result;
};

$(function(){

	

	setTimeout(function(){
		$('body').addClass('loading');
	}, 200);

	

	setTimeout(function(){
		$('body').addClass('loaded');
	}, 2200);

	setTimeout(function(){
		$('body').addClass('initialized');
	}, 3600);


});




$(function(){

	var ProjectModel = Backbone.Model.extend({

		attributes: {

			html: ''

		},

		fetch: function( params ){

			var that = this;

			this.unset('html', {silent: true});

			$.ajax({

				url: params.url,

				success: function( data ){

					var $data = $(textToHtml(data));

					that.set({html: $('.project-detail', $data).html()});

				}

			});

		}

	})

	var ProjectCollection = Backbone.Collection.extend({
	});

	var HeroSectionView = Backbone.View.extend({
		
		initialize: function(){
	
			$(window).on('resize', this.onWindowResize.bind(this));
	
			this.onWindowResize(null);
		},
	
		onWindowResize: function( event ){
			this.$el.height($(window).height());
		}
	
	});

	var IntroSectionView = Backbone.View.extend({
	
		$logo: 	null,
	
		initialize: function(){
	
			this.$logo = $('.logo', this.$el);
	
			setTimeout(
				function(){
					this.$logo.addClass('is-animated');
				}.bind(this)
			, 200);
	
		}
	});

	var GemSectionView = Backbone.View.extend({
	
		$gem: 			null,
		$gems: 			null,
		$headline: 		null,
	
		initialize: function(){
	
			this.$gem 			= $('.gem-image', this.$el);
			this.$gems 			= $('.gems', this.$el);
			this.$headline 		= $('.section-headline', this.$el);
	
			$(window).on('scroll', this.onWindowScroll.bind(this));
			setTimeout(this.initWaypoints.bind(this), 4000);
	
		},
	
		initWaypoints: function(){
			
	
			this.$gems.waypoint(function(direction) {
				$('.gem', this.element).each(function(i){
					var $gem = $(this);
					setTimeout(function(){
						$gem.addClass('animate');
					}, i * 500);
					
				});
			}, {
			  offset: '70%'
			});
		},
	
		onWindowScroll: function( event ){
			var p = $(window).scrollTop()/this.$el.offset().top;
			
			this.$gem.css({
				top: -$(window).height() * p * .2
			})
		}
	});

	var WorkSectionView = Backbone.View.extend({
	
		projectCloseButtonTemplate: '<a href="" class="project-close-button--fixed"><div class="close-icon"></div></a>',
	
		$projectNav: 		null,
		$projectDetail: 	null,
		$projectLoader: 	null,
		$projectCloseButton: null,
	
		isLaunched 			: false,
	
		initialize: function(){
	
			this.$projectNav 			= $('.project-nav', this.$el);
			this.$projectDetail 		= $('.project-detail', this.$el);
			this.$projectLoader 		= $('.project-loader', this.$el);
	
			this.$projectCloseButton 	= $(this.projectCloseButtonTemplate).clone();
			$('body').append(this.$projectCloseButton);
	
	
			this.initListeners();
	
		},
	
		initListeners: function(){
	
	
			this.listenTo(this.model, "change", this.onProjectLoaded);
			
			$('.project-link', this.$projectNav).on('click', this.onProjectLinkClicked.bind(this));
			this.$projectLoader.on('click', this.onProjectCloseClicked.bind(this));
			this.$projectCloseButton.on('click', this.onProjectCloseClicked.bind(this));
	
			$(window).on('scroll', this.onWindowScroll.bind(this));
	
			
		},
	
		loadProject: function( url ){
			this.$el.addClass('is-loading');
	
			var that = this;
	
			setTimeout(function(){
				that.model.fetch({url: url});
			}, 800);
			
			// setTimeout(this.onProjectLoaded.bind(this), 1000);
		},
	
		launchProject: function(){
	
			this.$el.css('min-height', $(window).height() + $(window).scrollTop() - this.$el.offset().top);
			this.$el.addClass('do-launch');
	
			setTimeout(this.onProjectLaunched.bind(this), 1000);
	
		},
	
		closeProject: function(){
	
			$('.is-selected', this.$projectNav).removeClass('is-selected');
			this.$el.css('min-height', 0);
	
			this.$el
				.addClass('do-close');
			this.$el
				.removeClass('is-launched')
	
			setTimeout(this.onProjectClosed.bind(this), 1000);
	
			this.isLaunched = false;
		},
	
	
	
		onProjectLinkClicked: function( event ){
	
			
			$(event.currentTarget).closest('li').addClass('is-selected');
			this.loadProject($(event.currentTarget).attr('href'));
	
			return false;
	
		},
	
		onProjectCloseClicked: function( event ){
			var closeDelay = 0;
			if($(window).scrollTop() > this.$el.offset().top + $(window).height() * .6){
				$('body,html').animate({scrollTop: this.$el.offset().top}, 900, 'easeInOutQuart');
				closeDelay = 1000;
			}
			setTimeout(this.closeProject.bind(this), closeDelay);
			this.isLaunched = false;
			return false;
		},
	
		onProjectLoaded: function( ){
	
			this.$el.addClass('is-loaded');
			this.$projectDetail.html(this.model.get('html'));
			$('.js-flickityGallery', this.$projectDetail).each(function(){
				new FlickityGalleryView({el: $(this)});
			});
	
			setTimeout(this.launchProject.bind(this), 1000);
			// this.launchProject();
			
		},
	
		onWindowScroll: function( event ){
			if($(window).scrollTop() > this.$el.offset().top){
				this.$projectLoader.addClass('.is-fixed');
			}
		},
	
		onProjectLaunched: function( ){
			this.$el.addClass('is-launched');
			this.$el.removeClass('do-launch');
			this.$el.removeClass('is-loading');
	
			this.isLaunched = true;
		},
	
		onProjectClosed: function(){
			this.$el.removeClass('is-loaded');
			this.$el.removeClass('do-close');
			this.$projectDetail.html('');
		},
	
	
		onWindowScroll: function( event ){
			if(this.isLaunched && $(window).scrollTop() > this.$el.offset().top + $(window).height() * .6 && $(window).scrollTop() < this.$el.offset().top + this.$el.outerHeight() - $(window).height() * .6){
				this.$projectCloseButton.addClass('is-shown');
			}else{
				this.$projectCloseButton.removeClass('is-shown');
			}
		}
	});

	var LetterSectionView = Backbone.View.extend({
	
		$readMoreTrigger : null,
	
		initialize: function(){
	
			this.$readMoreTrigger = $('.js-read-more', this.$el);
	
			this.$readMoreTrigger.bind('click', this.onReadMoreClicked.bind(this));
	
		},
	
		onReadMoreClicked: function( event ){
			var $prevRows = $(event.currentTarget).closest('.row').prevAll('.row:hidden');
			$prevRows.last().fadeIn();
			if($prevRows.length == 1)
				this.$readMoreTrigger.fadeOut();
			return false;
		},
	
	});

	var SectionView = Backbone.View.extend({
	
		$headline: 	null,
		$content: 	null,
	
		initialize: function(){
	
			this.$headline = $('.section__headline', this.$el);
			this.$content = $('.section__content', this.$el);
	
			this.$headline.waypoint(function(direction) {
				$(this.element).addClass('is-animated');
			}, {
			  offset: '70%'
			});
	
		}
	});

	var MainNavView = Backbone.View.extend({
	
		$trigger 				: null,
		$menuItems 				: null,
	
		scrollTop               : $(window).scrollTop(),
	    scrollDirection         : 1,
	    top                     : 0,
	    scrollResetTimeout      : undefined,
	    currentSection          : '',
	
		initialize: function(){
	
	        var that              = this;
	
			this.$trigger         = $('.main-nav-trigger', this.$el);
			this.$menuItems       = $($('ul li a[href^="#"]', this.$el).get().reverse());
	
			$(window).on('scroll', this.onWindowScroll.bind(this));
			this.$menuItems.on('click', this.onMenuItemClicked.bind(this));
	        this.$trigger.on('click', this.onTriggerClicked.bind(this));
	        
	        this.onWindowScroll();
	
	
		},
	
		resetScroll: function( event ){
			this.scrollTop = $(window).scrollTop();
		},
	
		onMenuItemClicked : function( event ){
	
			var id = $(event.target).attr('href');
	        this.$trigger.removeClass('is-closeable');
			$('html,body').animate({
				scrollTop: $(id).offset().top - 80
			}, 1000, 'easeInOutQuart');
	
	        this.$el.removeClass('is-visible');
	        $('body').removeClass('is-offcanvas');
	
	
			return false;
		},
	
	    onTriggerClicked: function( event ){
	
	        if(Breakpoints.getBreakpoint() == "s"){
	            this.$trigger.toggleClass('is-closeable');
	            this.$el.toggleClass('is-visible');
	            $('body').toggleClass('is-offcanvas');
	        }
	
	        return false;
	    },
	
		onWindowScroll: function( event ){
	
			var that 					= this;
			// Calculate new scrollTop and scrollDelta
	        var newScrollTop       		= Math.max(0, $(window).scrollTop());
	        var scrollDelta        		= this.scrollTop - newScrollTop;
	        
	
	        if(scrollDelta > 40){
	        	this.$trigger.addClass('is-visible');
	        }else if(scrollDelta < -40){
	        	this.$trigger.removeClass('is-visible');
	        }
	
	
	        this.$menuItems.each(function(){
	        	var id = $(this).attr('href');
	
	        	if($(id).offset().top <= newScrollTop + $(window).height()){
	        		var section = $(this).attr('href').replace('#', '')
	
	                that.$menuItems.removeClass('is-active');
	        		$(this).addClass('is-active');
	
	                if(that.currentSection != section){
	                    that.currentSection = section;
	                    $(window).trigger('section-changed', [section]);
	                }
	        		return false;
	        	}
	        });
	
	
	        // Show when scrolled to the very bottom
	        if(newScrollTop == $(document).height() - $(window).height()){
	            this.$trigger.addClass('is-visible');
	        }
	        // Assign class if scrolled to the very top
	        if(newScrollTop == 0){
	            this.$trigger.addClass('is-visible');
	        }
	
	
	        this.scrollResetTimeout 	= setTimeout(this.resetScroll.bind(this), 150);
	
	
		}
	});

	var FlickityGalleryView = Backbone.View.extend({
	
		flkty: null,
	
		initialize: function(){
	
			this.$el.flickity({
			  // options
			  cellAlign: 'left',
			  contain: true,
			  imagesLoaded: true,
			  wrapAround: true
			});
	
			this.flkty = this.$el.data('flickity');
			var that = this;
	
			if(this.$el.closest('.showcase-browser').length){
				this.$el.on( 'cellSelect', function() {
					that.$el.closest('.showcase-composition').find('.showcase-phone .js-flickityGallery').flickity( 'select', that.flkty.selectedIndex );
				})
			}
	
	
		}
	});

	var OverlayView = Backbone.View.extend({
	
	
		initialize: function(){
			this.$el.on('click', this.onOverlayTriggerClicked.bind(this));
		},
	
		onOverlayTriggerClicked: function( event ){
			event.preventDefault();
			$(event.currentTarget).toggleClass('is-triggered');
			$($(event.currentTarget).attr('href')).toggleClass('is-visible');
			return false;
		},
	
		onCloseableClicked: function( event ){
			event.preventDefault();
	
			$(event.currentTarget)
				.removeClass('is-closeable')
				.off('click', this.onCloseableClicked);
			$('.overlay.is-visible').removeClass('is-visible');
			$('.js-overlay.is-triggered').removeClass('is-triggered');
			return false;
		}
	
	});


	Breakpoints = jRespond([
	    {
	        label: 's',
	        enter: 0,
	        exit: 767
	    },{
	        label: 'm',
	        enter: 768,
	        exit: 991
	    },{
	        label: 'l',
	        enter: 992,
	        exit: 1199
	    },{
	        label: 'xl',
	        enter: 1200,
	        exit: 10000
	    }
	]);

	App = function(){

		var introSectionView;
		var gemSectionView;
		var projectModel;

		var init = function(){

			initListeners();
			initView();

		};

		var initListeners = function(){
			$(window).on('section-changed', onSectionChanged);
		}

		var initView = function(){
			$('.section').each(function(){
				new SectionView({el: $(this)});
			});

			$('.js-flickityGallery').each(function(){
				new FlickityGalleryView({el: $(this)});
			});

			projectModel 		= new ProjectModel();

			mainNavView 		= new MainNavView({el: '.main-nav'});

			introSectionView 	= new IntroSectionView({el: '.section-intro'});
			letterSectionView 	= new LetterSectionView({el: '.section-letters'});
			heroSectionView 	= new HeroSectionView({el: $('.section-hero')});
			gemSectionView 		= new GemSectionView({el: $('.section-gems')});
			workSectionView 	= new WorkSectionView({el: $('.section-work'), model: projectModel});

			$('.js-overlay').each(function(){
				new OverlayView({el: $(this)});
			});

		}

		var onSectionChanged = function( event, section ){
			ga('send', 'pageview', '/'+section);
		}

		

		init();


	}();

});


