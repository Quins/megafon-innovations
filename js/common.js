$(document).ready(function() {

	if($("[data-rotator]").length)
		initializeRotators();

	$("[data-toggle]").toggles({
		"innovations-tertiary-menu": {
			toggleOnOutsideClick: false
		}
	});
});


/* Rotators */
var rotators = {};
var rotatorsProperties = {

	"innovations-facts": {
	
		animation: "displaying"
	}
};

function initializeRotators() {
	
	$("[data-rotator]").each(function() {

		var rotatorID = generateIdentificator();
		var rotatorDescriptor = ($(this).attr("data-rotator-descriptor") ? $(this).attr("data-rotator-descriptor") : "");
		
		rotators[rotatorID] = {
			
			rotator: $(this),
			descriptor: rotatorDescriptor,
			articles: $(this).find("[data-rotator-article]"),
			articleWidth: $(this).find("[data-rotator-article]").eq(0).width(),
			articlesCount: $(this).find("[data-rotator-article]").length,
			articlesDistance: (parseInt($(this).find("[data-rotator-article]").last().css("marginLeft")) ? parseInt($(this).find("[data-rotator-article]").last().css("marginLeft")) : 0),
			articlesRepository: ($(this).find("[data-rotator-articles-repository]").length ? $(this).find("[data-rotator-articles-repository]") : $(this)),
			articlesRepositoryWidth: ($(this).find("[data-rotator-articles-repository]").length ? $(this).find("[data-rotator-articles-repository]").width() : $(this).width()),
			rollers: {

				backward: ($(this).find("[data-rotator-roller][data-rotator-roller-descriptor='backward']").length ? $(this).find("[data-rotator-roller][data-rotator-roller-descriptor='backward']") : null),
				forward: ($(this).find("[data-rotator-roller][data-rotator-roller-descriptor='forward']").length ? $(this).find("[data-rotator-roller][data-rotator-roller-descriptor='forward']") : null)
			},
			rollersTitles: {
				
				backward: ($(this).find("[data-rotator-roller][data-rotator-roller-descriptor='backward']").find("[data-rotator-roller-title]").length ? $(this).find("[data-rotator-roller][data-rotator-roller-descriptor='backward']").find("[data-rotator-roller-title]") : null),
				forward: ($(this).find("[data-rotator-roller][data-rotator-roller-descriptor='forward']").find("[data-rotator-roller-title]").length ? $(this).find("[data-rotator-roller][data-rotator-roller-descriptor='forward']").find("[data-rotator-roller-title]") : null)
			},
			currentPosition: 0,
			positionsPoints: ($(this).find("[data-rotator-points-article]").length ? $(this).find("[data-rotator-points-article]") : null),
			positionsPointsRepository: $(this).find("[data-rotator-points]"),
			currentPositionsPoint: $(this).find("[data-rotator-points-article][data-rotator-points-article-descriptor='current']"),
			indicator: ($(this).find("[data-rotator-indicator]").length ? $(this).find("[data-rotator-indicator]") : null),
			indicatorPosition: ($(this).find("[data-rotator-indicator-position]").length ? $(this).find("[data-rotator-indicator-position]") : null),
			indicatorQuantity: ($(this).find("[data-rotator-indicator-quantity]").length ? $(this).find("[data-rotator-indicator-quantity]") : null),
			paused: false,
			automationPaused: true,
			properties: (rotatorsProperties[rotatorDescriptor] ? rotatorsProperties[rotatorDescriptor] : {})
		}
		
		rotators[rotatorID].articlesRepository.scrollLeft(0);
		
		rotators[rotatorID].rotator.attr("data-rotator-identificator", rotatorID);
		
		if(rotators[rotatorID].indicatorPosition)
			rotators[rotatorID].indicatorPosition.text(rotators[rotatorID].currentPosition + 1);
			
		if(rotators[rotatorID].indicatorQuantity)
			rotators[rotatorID].indicatorQuantity.text(rotators[rotatorID].articlesCount);
		
		rotators[rotatorID].viewedArticlesCount = Math.ceil(rotators[rotatorID].articlesRepositoryWidth / (rotators[rotatorID].articleWidth + rotators[rotatorID].articlesDistance));
		
		if(rotators[rotatorID].rollers.backward) {
			
			rotators[rotatorID].rollers.backward.click(function(event) {

				event.preventDefault();
				rotators[rotatorID].automationPaused = true;
				turnRotator(rotatorID, "backward");
			});
		}
		
		if(rotators[rotatorID].rollers.forward) {
			
			if(rotators[rotatorID].properties.rollersDisabledClass && rotators[rotatorID].articlesCount > rotators[rotatorID].viewedArticlesCount)
				rotators[rotatorID].rollers.forward.toggleClass(rotators[rotatorID].properties.rollersDisabledClass);
			
			rotators[rotatorID].rollers.forward.click(function(event) {

				event.preventDefault();
				rotators[rotatorID].automationPaused = true;
				turnRotator(rotatorID, "forward");
			});
		}
		
		if(rotators[rotatorID].properties.swipe) {
			
			rotators[rotatorID].swipeStatus = false;
			rotators[rotatorID].swipePositions = {};
			
			rotators[rotatorID].rotator.on("touchstart mousedown", function (e) {
				
				rotators[rotatorID].swipeStatus = true;
				rotators[rotatorID].swipePositions = {
					
					x: e.originalEvent.pageX,
					y: e.originalEvent.pageY
				};
			});

			rotators[rotatorID].rotator.on("touchend mouseup", function (e) {
				
				rotators[rotatorID].swipeStatus = false;
				rotators[rotatorID].swipePositions = null;
			});
			
			rotators[rotatorID].rotator.on( "touchmove mousemove", function (e) {
								
				if (!rotators[rotatorID].swipeStatus)
					return;
					
				if(Math.abs(getSwipeInformation(e, rotators[rotatorID].swipePositions).offset.x) > (rotators[rotatorID].articleWidth / 3)) {
					
					turnRotator(rotatorID, (getSwipeInformation(e, rotators[rotatorID].swipePositions).direction.x == "left" ? "forward" : "backward"));
					
					rotators[rotatorID].swipePositions = {
					
						x: e.originalEvent.pageX,
						y: e.originalEvent.pageY
					};
				}
				
				e.preventDefault();
			});
		}

		if(rotators[rotatorID].positionsPoints) {

			rotators[rotatorID].positionsPoints.each( function( index ) {

				$(this).click( function(evt) {

					evt.preventDefault();
					rotators[rotatorID].automationPaused = false;
					hurlRotator(rotatorID, index);
				});
			})
		}
		
		if(rotators[rotatorID].descriptor == "photos") {
			
			rotators[rotatorID].articles.click(function () {
			
				if(rotators[rotatorID].articles.index($(this)) < rotators[rotatorID].currentPosition)
					rotators[rotatorID].rollers.backward.trigger("click");
				else
					rotators[rotatorID].rollers.forward.trigger("click");
			});
		}
		
		if(rotators[rotatorID].properties.automation) {

			rotators[rotatorID].automationPaused = false;
			rotators[rotatorID].automationID = setInterval( function() {

				if (!rotators[rotatorID].automationPaused)
					turnRotator(rotatorID, 'forward');

			}, rotators[rotatorID].properties.automationInterval);
		} 

		if(rotators[rotatorID].properties.automation) {
			
			rotators[rotatorID].rotator.find("[data-rotator-article], [data-rotator-roller], [data-rotator-points]").mouseenter( function() {
				rotators[rotatorID].automationPaused = true;
			}).mouseleave( function() {
				rotators[rotatorID].automationPaused = false;
			});
		}
	
		if(rotators[rotatorID].properties.initializeFunction)
			executeFunction(rotators[rotatorID].properties.initializeFunction, null, rotatorID);
	});
}

function turnRotator(rotatorID, direction) {

	if(rotators[rotatorID].properties.animation == "conveyor") {
		
		if(rotators[rotatorID].descriptor != "photos")
			var animation = { scrollLeft: ((direction == "forward") ? "+" : "-") + "=" + (rotators[rotatorID].articleWidth + rotators[rotatorID].articlesDistance)};
		else
			var animation = { left: ((direction == "forward") ? "-" : "+") + "=" + (rotators[rotatorID].articleWidth + rotators[rotatorID].articlesDistance)};
		
		if(rotators[rotatorID].properties.cycle) {
		
			if(direction == "backward") {
			
				rotators[rotatorID].rotator.find("[data-rotator-article]").filter(":last").clone(true).prependTo(rotators[rotatorID].articlesRepository);
				rotators[rotatorID].rotator.find("[data-rotator-article]").filter(":last").remove();
				
				rotators[rotatorID].articlesRepository.scrollLeft((rotators[rotatorID].articleWidth + rotators[rotatorID].articlesDistance));
				
				rotators[rotatorID].articlesRepository.stop(true, true).animate(animation, 350);
			
			} else {
				
				rotators[rotatorID].rotator.find("[data-rotator-article]").filter(":first").clone(true).appendTo(rotators[rotatorID].articlesRepository);
								
				rotators[rotatorID].articlesRepository.stop(true, true).animate(animation, 350, function() {

					rotators[rotatorID].rotator.find("[data-rotator-article]").filter(":first").remove();
					rotators[rotatorID].articlesRepository.scrollLeft(0);
				});
				
			}

		} else {
		
			
			if((direction == "forward" && rotators[rotatorID].currentPosition < (rotators[rotatorID].articlesCount - rotators[rotatorID].viewedArticlesCount)) || (direction == "backward" && rotators[rotatorID].currentPosition > 0))
				rotators[rotatorID].articlesRepository.stop(true, true).animate(animation, 350);
			else
				return false;
		}

		rotators[rotatorID].currentPosition = ((direction == "forward") ? (rotators[rotatorID].currentPosition + 1) : (rotators[rotatorID].currentPosition - 1));
		
		if(rotators[rotatorID].properties.articlesCurrentClass) {
			
			rotators[rotatorID].articles.removeClass(rotators[rotatorID].properties.articlesCurrentClass);
			rotators[rotatorID].articles.eq(rotators[rotatorID].currentPosition).addClass(rotators[rotatorID].properties.articlesCurrentClass);
		}
			
		
		if(rotators[rotatorID].properties.rollersDisabledClass && ((rotators[rotatorID].currentPosition > 0 && rotators[rotatorID].rollers.backward.hasClass(rotators[rotatorID].properties.rollersDisabledClass)) || (rotators[rotatorID].currentPosition == 0 && !rotators[rotatorID].rollers.backward.hasClass(rotators[rotatorID].properties.rollersDisabledClass))))
			rotators[rotatorID].rollers.backward.toggleClass(rotators[rotatorID].properties.rollersDisabledClass);

		if(rotators[rotatorID].properties.rollersDisabledClass && ((rotators[rotatorID].currentPosition < (rotators[rotatorID].articlesCount - rotators[rotatorID].viewedArticlesCount) && rotators[rotatorID].rollers.forward.hasClass(rotators[rotatorID].properties.rollersDisabledClass)) || (rotators[rotatorID].currentPosition == (rotators[rotatorID].articlesCount - rotators[rotatorID].viewedArticlesCount) && !rotators[rotatorID].rollers.forward.hasClass(rotators[rotatorID].properties.rollersDisabledClass))))
			rotators[rotatorID].rollers.forward.toggleClass(rotators[rotatorID].properties.rollersDisabledClass);
		
	} else if(rotators[rotatorID].properties.animation == "displaying") {
		
		if(!rotators[rotatorID].paused) {
			
			rotators[rotatorID].paused = true;
			
			if(rotators[rotatorID].rotator.find("[data-rotator-background]").length)
				rotators[rotatorID].rotator.find("[data-rotator-background]").fadeOut(350);
		
			rotators[rotatorID].articles.eq(rotators[rotatorID].currentPosition).animate({ opacity: 0 }, 350, function() {
			
				$(this).addClass("g-hidden");
			
				if(direction == "forward")
					rotators[rotatorID].currentPosition = (((rotators[rotatorID].currentPosition + 1) < rotators[rotatorID].articlesCount) ? (rotators[rotatorID].currentPosition + 1) : 0);
				else
					rotators[rotatorID].currentPosition = (((rotators[rotatorID].currentPosition - 1) >= 0) ? (rotators[rotatorID].currentPosition - 1) : (rotators[rotatorID].articlesCount - 1));
					
				if(rotators[rotatorID].indicatorPosition)
					rotators[rotatorID].indicatorPosition.text(rotators[rotatorID].currentPosition + 1);
					
				if(rotators[rotatorID].rollersTitles.backward || rotators[rotatorID].rollersTitles.forward) {
					
					rotators[rotatorID].rollersTitles.forward.text(rotators[rotatorID].articles.eq((((rotators[rotatorID].currentPosition + 1) < rotators[rotatorID].articlesCount) ? (rotators[rotatorID].currentPosition + 1) : 0)).data("rotator-article-title"));
					rotators[rotatorID].rollersTitles.backward.text(rotators[rotatorID].articles.eq((((rotators[rotatorID].currentPosition - 1) >= 0) ? (rotators[rotatorID].currentPosition - 1) : (rotators[rotatorID].articlesCount - 1))).data("rotator-article-title"));
				}
				
				if(rotators[rotatorID].articles.eq(rotators[rotatorID].currentPosition).data("rotator-article-background-url")) {
				
					//$("[data-rotator-background]").attr("class", "b-promos-rotated-previews-background b-promos-rotated-previews-" + rotators[rotatorID].articles.eq(rotators[rotatorID].currentPosition).attr("data-rotator-article-descriptor") + "-background").fadeIn(350);
					$("[data-rotator-background]").css({ backgroundImage: "url(" + rotators[rotatorID].articles.eq(rotators[rotatorID].currentPosition).data("rotator-article-background-url") + ")" }).fadeIn(350);
				}
			
				rotators[rotatorID].articles.eq(rotators[rotatorID].currentPosition).css("opacity", "0").removeClass("g-hidden").animate({ opacity: 1 }, 350);
			
				if(rotators[rotatorID].positionsPoints && rotators[rotatorID].properties.positionsPointsCurrentAdditionalClass) {

					rotators[rotatorID].currentPositionsPoint
						.toggleClass(rotators[rotatorID].properties.positionsPointsCurrentAdditionalClass)
						.removeAttr("data-rotator-positions-point-descriptor");

					rotators[rotatorID].positionsPoints.eq(rotators[rotatorID].currentPosition)
						.addClass(rotators[rotatorID].properties.positionsPointsCurrentAdditionalClass)
						.attr("data-rotator-positions-point-descriptor", "current");

					rotators[rotatorID].currentPositionsPoint = rotators[rotatorID].positionsPoints.eq(rotators[rotatorID].currentPosition);
				}
				
				rotators[rotatorID].paused = false;
			
				return true;
			});
		}
	
	} else if(rotators[rotatorID].properties.animation == "swipe") {
		
		
		
	} else if(!rotators[rotatorID].properties.animation || rotators[rotatorID].properties.animation == "simple") {
		
		rotators[rotatorID].articles.eq(rotators[rotatorID].currentPosition).addClass("g-hidden");
			
		if(direction == "forward")
			rotators[rotatorID].currentPosition = (((rotators[rotatorID].currentPosition + 1) < rotators[rotatorID].articlesCount) ? (rotators[rotatorID].currentPosition + 1) : 0);
		else
			rotators[rotatorID].currentPosition = (((rotators[rotatorID].currentPosition - 1) >= 0) ? (rotators[rotatorID].currentPosition - 1) : (rotators[rotatorID].articlesCount - 1));
			
		rotators[rotatorID].articles.eq(rotators[rotatorID].currentPosition).removeClass("g-hidden");
	}
	
	if(rotators[rotatorID].positionsPoints && rotators[rotatorID].properties.positionsPointsCurrentAdditionalClass) {
		
		rotators[rotatorID].currentPositionsPoint
			.toggleClass(rotators[rotatorID].properties.positionsPointsCurrentAdditionalClass)
			.removeAttr("data-rotator-positions-point-descriptor");
		
		rotators[rotatorID].positionsPoints.eq(rotators[rotatorID].currentPosition)
			.addClass(rotators[rotatorID].properties.positionsPointsCurrentAdditionalClass)
			.attr("data-rotator-positions-point-descriptor", "current");
		
		rotators[rotatorID].currentPositionsPoint = rotators[rotatorID].positionsPoints.eq(rotators[rotatorID].currentPosition);
	}
	
}

function hurlRotator(rotatorID, articleCounter) {

	if(rotators[rotatorID].properties.animation == "displaying") {
		
		if(!rotators[rotatorID].paused) {
			
			rotators[rotatorID].paused = true;
			
			if(rotators[rotatorID].rotator.find("[data-rotator-background]").length)
				rotators[rotatorID].rotator.find("[data-rotator-background]").fadeOut(350);
		
			rotators[rotatorID].articles.eq(rotators[rotatorID].currentPosition).animate({ opacity: 0 }, 350, function() {
			
				$(this).addClass("g-hidden");
			
				rotators[rotatorID].currentPosition = (((articleCounter) < rotators[rotatorID].articlesCount) ? (articleCounter) : 0);
					
				if(rotators[rotatorID].indicatorPosition)
					rotators[rotatorID].indicatorPosition.text(articleCounter);
					
				if(rotators[rotatorID].articles.eq(rotators[rotatorID].currentPosition).data("rotator-article-background-url")) {
				
					$("[data-rotator-background]").css({ backgroundImage: "url(" + rotators[rotatorID].articles.eq(rotators[rotatorID].currentPosition).data("rotator-article-background-url") + ")" }).fadeIn(350);
				}
			
				rotators[rotatorID].articles.eq(rotators[rotatorID].currentPosition).css("opacity", "0").removeClass("g-hidden").animate({ opacity: 1 }, 350);
			
				if(rotators[rotatorID].positionsPoints && rotators[rotatorID].properties.positionsPointsCurrentAdditionalClass) {

					rotators[rotatorID].currentPositionsPoint
						.toggleClass(rotators[rotatorID].properties.positionsPointsCurrentAdditionalClass)
						.removeAttr("data-rotator-positions-point-descriptor");

					rotators[rotatorID].positionsPoints.eq(rotators[rotatorID].currentPosition)
						.addClass(rotators[rotatorID].properties.positionsPointsCurrentAdditionalClass)
						.attr("data-rotator-positions-point-descriptor", "current");

					rotators[rotatorID].currentPositionsPoint = rotators[rotatorID].positionsPoints.eq(rotators[rotatorID].currentPosition);
				}
				
				rotators[rotatorID].paused = false;
			
				return true;
			});
		}
	
	} else if(rotators[rotatorID].properties.animation == "swipe") {
		
		
		
	} else if(!rotators[rotatorID].properties.animation || rotators[rotatorID].properties.animation == "simple") {
		
		rotators[rotatorID].articles.eq(rotators[rotatorID].currentPosition).addClass("g-hidden");
			
		if(direction == "forward")
			rotators[rotatorID].currentPosition = (((rotators[rotatorID].currentPosition + 1) < rotators[rotatorID].articlesCount) ? (rotators[rotatorID].currentPosition + 1) : 0);
		else
			rotators[rotatorID].currentPosition = (((rotators[rotatorID].currentPosition - 1) >= 0) ? (rotators[rotatorID].currentPosition - 1) : (rotators[rotatorID].articlesCount - 1));
			
		rotators[rotatorID].articles.eq(rotators[rotatorID].currentPosition).removeClass("g-hidden");
	}
	
	if(rotators[rotatorID].positionsPoints && rotators[rotatorID].properties.positionsPointsCurrentAdditionalClass) {
		
		rotators[rotatorID].currentPositionsPoint
			.toggleClass(rotators[rotatorID].properties.positionsPointsCurrentAdditionalClass)
			.removeAttr("data-rotator-positions-point-descriptor");
		
		rotators[rotatorID].positionsPoints.eq(rotators[rotatorID].currentPosition)
			.addClass(rotators[rotatorID].properties.positionsPointsCurrentAdditionalClass)
			.attr("data-rotator-positions-point-descriptor", "current");
		
		rotators[rotatorID].currentPositionsPoint = rotators[rotatorID].positionsPoints.eq(rotators[rotatorID].currentPosition);
	}
	
}

/* Toggles */

(function( $ ) {
	$.fn.toggles = function(options) {

		return this.each( function() {

			var toggle = {
				descriptor: ($(this).data("toggle-descriptor") ? $(this).data("toggle-descriptor") : ""), 
				entity: $(this), 
				on: false, 
				targets: []
			};

			toggle.properties = $.extend({
				toggleOnOutsideClick: false
			}, options[toggle.descriptor]);

			$("[data-toggle-target][data-toggle-target-descriptor='" + toggle.descriptor + "']").each( function(i) {

				toggle.targets[i] = {

					entity: $(this),
					toggleClass: $(this).data('toggle-target-class')
				}

				$(this).on("toggle", function(event) {

					toggle.on = event.state;
				});
			});

			toggle.entity.click( function(event) {

				event.preventDefault();
				$(document).unbind("mouseup").unbind("touchend");

				$.each(toggle.targets, function(i, e) {

					e.entity.toggleClass(e.toggleClass);
				});

				if (toggle.on) {

					emittoggle(false);
				} else {

					emittoggle(true);

					if (toggle.properties.toggleOnOutsideClick) {

						$(document).on("mouseup touchend", function (event) {

							var outside = 0;

							$.each(toggle.targets, function(i,e) {

								var container = e.entity;

								if (!container.is(event.target) && container.has(event.target).length === 0) {

									outside += 1;
								}
							});

							if (outside == toggle.targets.length && !toggle.entity.is(event.target) && toggle.entity.has(event.target).length === 0) {

								$.each(toggle.targets, function(i, e) {

									e.entity.toggleClass(e.toggleClass);
								});
								emittoggle(false);
								$(document).unbind("mouseup").unbind("touchend");
							}
						});
					}
				}
			});

			function emittoggle(state) {

				var e = $.Event( "toggle" );
				e.state = state;

				$("[data-toggle-target][data-toggle-target-descriptor='" + toggle.descriptor + "']").each(function() {

					$(this).trigger(e);
				});
			}
		});
	};
})(jQuery);



/* Unsorted */
function executeFunction(name, context) {
	
	var context = context ? context : window;
	var properties = Array.prototype.slice.call(arguments).splice(2, 100);
	var namespaces = name.split(".");
	var func = namespaces.pop();
	
	for(var i = 0; i < namespaces.length; i++) {
		
		context = context[namespaces[i]];
	}
	
	return context[func].apply(this, properties);
}

function getElementPercentageWidth(element) {
	
	var width = element.width();
	var parentWidth = element.offsetParent().width();
	
	return Math.ceil(100 * (width / parentWidth));
}

function getSubstring(string, substringPattern) {
	
	var searchResults = string.match(substringPattern);
	
	return ((searchResults && searchResults[1]) ? searchResults[1] : "");
}

var identificators = {};

function generateIdentificator() {

	var identificator = '';
	var identificatorLength = 10;
	var charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
	var charsetLength = charset.length;

	for (i = 0; identificatorLength > i; i += 1) {
  
		var charIndex = Math.random() * charsetLength;  
		identificator += charset.charAt(charIndex);  
	}
	
	identificator = identificator.toLowerCase();

	if (identificators[identificator])
		return generateIdentificator();

	identificators[identificator] = true;  

	return identificator;
}