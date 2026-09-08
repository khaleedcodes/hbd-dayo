$(window).on('load', function() {
	$('.loading').fadeOut('fast');
	$('.container').fadeIn('fast');
});

$('document').ready(function() {
	var reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	var timelineScale = reducedMotion ? 0.12 : 1;

	function schedule(callback, delay) {
		return setTimeout(callback, delay * timelineScale);
	}

	function positionBirthdayBalloons() {
		var balloonWidth = $(window).width() <= 560 ? 58 : 100;
		var availableWidth = Math.max(280, $(window).width() - 24);
		var gap = Math.min(100, (availableWidth - balloonWidth) / 6);
		var totalWidth = (gap * 6) + balloonWidth;
		var start = Math.max(12, ($(window).width() - totalWidth) / 2);
		var top = $(window).width() <= 560 ? 220 : 240;

		for (var i = 1; i <= 7; i++) {
			$('#b' + i + i).stop(true).css({
				top: top,
				bottom: 'auto',
				left: start + ((i - 1) * gap)
			});
		}
	}

	function floatBalloon(index) {
		var selector = '#b' + index;
		var randLeft = Math.max(0, ($(window).width() - 100) * Math.random());
		var randBottom = 120 + (380 * Math.random());

		$(selector).animate({ left: randLeft, bottom: randBottom }, reducedMotion ? 80 : 6500, function() {
			floatBalloon(index);
		});
	}

	function releaseBalloons() {
		$('.balloon-border').animate({ top: -500 }, reducedMotion ? 80 : 2600);
		$('#b1,#b4,#b5,#b7').addClass('balloons-rotate-behaviour-one');
		$('#b2,#b3,#b6').addClass('balloons-rotate-behaviour-two');

		for (var i = 1; i <= 7; i++) {
			floatBalloon(i);
		}
	}

	function spellDayo() {
		for (var i = 1; i <= 7; i++) {
			$('#b' + i).stop(true).attr('id', 'b' + i + i);
		}

		positionBirthdayBalloons();
		$('.balloons').css('opacity', '0.94');
		$('.balloons h2').fadeIn(reducedMotion ? 0 : 800);
	}

	function celebrateDayo(pieceCount) {
		if (!window.DayoConfetti) return;
		window.DayoConfetti.burst(pieceCount > 100 ? 6500 : 4400, pieceCount > 100 ? 1.35 : 1);
	}

	function startDayoConfetti() {
		if (!window.DayoConfetti) return;
		if (typeof window.DayoConfetti.start === 'function') {
			window.DayoConfetti.start(1);
			return;
		}
		celebrateDayo(70);
	}

	function beginAutomaticParty() {
		var audio = $('.song')[0];
		var playAttempt = audio.play();

		if (playAttempt && playAttempt.catch) {
			playAttempt.catch(function() {
				$('body').addClass('audio-unavailable');
			});
		}

		$('#bulb_yellow').addClass('bulb-glow-yellow');
		$('#bulb_red').addClass('bulb-glow-red');
		$('#bulb_blue').addClass('bulb-glow-blue');
		$('#bulb_green').addClass('bulb-glow-green');
		$('#bulb_pink').addClass('bulb-glow-pink');
		$('#bulb_orange').addClass('bulb-glow-orange');
		$('body').addClass('peach party-started');
		$('.dayo-intro').fadeOut(reducedMotion ? 0 : 600);

		schedule(function() {
			$('#bulb_yellow').addClass('bulb-glow-yellow-after');
			$('#bulb_red').addClass('bulb-glow-red-after');
			$('#bulb_blue').addClass('bulb-glow-blue-after');
			$('#bulb_green').addClass('bulb-glow-green-after');
			$('#bulb_pink').addClass('bulb-glow-pink-after');
			$('#bulb_orange').addClass('bulb-glow-orange-after');
			$('body').addClass('peach-after');
		}, 1100);

		schedule(function() {
			$('.bannar').addClass('bannar-come');
			$('.name-ribbon').fadeIn(reducedMotion ? 0 : 450);
		}, 2300);

		schedule(function() {
			$('.photo-scatter').fadeIn(reducedMotion ? 0 : 650);
		}, 3700);

		schedule(function() {
			releaseBalloons();
		}, 5000);

		schedule(function() {
			spellDayo();
			startDayoConfetti();
		}, 6900);

		schedule(function() {
			$('.cake').fadeIn(reducedMotion ? 0 : 650);
		}, 8200);

		schedule(function() {
			$('.reference-cake').addClass('cake-lit');
		}, 9400);

		schedule(function() {
			$('.cake-caption').fadeOut(reducedMotion ? 0 : 250);
			$('#party_action').fadeIn(reducedMotion ? 0 : 650);
		}, 10800);
	}

	$('#turn_on').one('click', function() {
		$(this).prop('disabled', true);
		beginAutomaticParty();
	});

	$('#story').on('click', function() {
		$(this).prop('disabled', true);
		$('#party_action').fadeOut(reducedMotion ? 0 : 400);
		$('.reference-cake').addClass('wish-made');
		celebrateDayo(110);

		var messages = $('.message p');
		var currentMessage = 0;
		var previousButton = $('#message_prev');
		var nextButton = $('#message_next');
		var progress = $('#message_progress');
		var closeButton = $('#message_close');

		function closeNote() {
			$('.message').fadeOut(reducedMotion ? 0 : 300);
			$('body').removeClass('story-mode finale');
			$('.reference-cake').removeClass('wish-made').fadeIn(reducedMotion ? 0 : 400);
			$('#story')
				.prop('disabled', false)
				.text('Read the birthday note again 💌');
			$('#party_action').fadeIn(reducedMotion ? 0 : 450, function() {
				$('#story').trigger('focus');
			});
			$(document).off('keydown.dayoNote');
		}

		function showMessage(index) {
			if (index < 0 || index >= messages.length) return;

			currentMessage = index;
			messages.stop(true, true).hide();
			messages.eq(currentMessage).fadeIn(reducedMotion ? 0 : 240);
			progress.text((currentMessage + 1) + ' / ' + messages.length);
			previousButton.prop('disabled', currentMessage === 0);
			nextButton
				.prop('disabled', false)
				.text(currentMessage === messages.length - 1 ? 'Back to party ↗' : 'Next →')
				.attr('aria-label', currentMessage === messages.length - 1 ? 'Back to the birthday party' : 'Next birthday message');

			if (currentMessage === messages.length - 1 && !$('body').hasClass('finale')) {
				$('body').addClass('finale');
				celebrateDayo(110);
			}
		}

		previousButton.off('click').on('click', function() {
			showMessage(currentMessage - 1);
		});

		nextButton.off('click').on('click', function() {
			if (currentMessage === messages.length - 1) {
				closeNote();
				return;
			}
			showMessage(currentMessage + 1);
		});

		closeButton.off('click').on('click', closeNote);
		$(document).off('keydown.dayoNote').on('keydown.dayoNote', function(event) {
			if (event.key === 'Escape') closeNote();
		});

		setTimeout(function() {
			$('body').addClass('story-mode');
			$('.cake').fadeOut(reducedMotion ? 0 : 350);
			$('.message').fadeIn(reducedMotion ? 0 : 450);
			showMessage(0);
		}, reducedMotion ? 180 : 1200);
	});

	$(window).on('resize', function() {
		if ($('#b11').length) positionBirthdayBalloons();
	});

	var lastPhotoTrigger = null;
	var photoLightbox = $('#photo_lightbox');
	var photoLightboxImage = $('#photo_lightbox_image');
	var photoLightboxCaption = $('#photo_lightbox_caption');

	function closePhotoLightbox() {
		if (!photoLightbox.is(':visible')) return;

		photoLightbox.fadeOut(reducedMotion ? 0 : 180, function() {
			photoLightbox.attr('aria-hidden', 'true');
			photoLightboxImage.attr({ src: '', alt: '' });
			$('body').removeClass('lightbox-open');
			if (lastPhotoTrigger) $(lastPhotoTrigger).trigger('focus');
		});
	}

	$('.memory-card').on('click', function() {
		var card = $(this);
		var sourceImage = card.find('img');
		var label = card.data('photo-label');

		lastPhotoTrigger = this;
		photoLightboxImage.attr({
			src: sourceImage.attr('src'),
			alt: sourceImage.attr('alt')
		});
		photoLightboxCaption.text(label);
		photoLightbox
			.attr('aria-hidden', 'false')
			.css('display', 'flex')
			.hide()
			.fadeIn(reducedMotion ? 0 : 180);
		$('body').addClass('lightbox-open');
		$('#photo_lightbox_close').trigger('focus');
	});

	$('#photo_lightbox_close').on('click', closePhotoLightbox);
	photoLightbox.on('click', function(event) {
		if (event.target === this) closePhotoLightbox();
	});
	$(document).on('keydown.photoLightbox', function(event) {
		if (event.key === 'Escape' && photoLightbox.is(':visible')) {
			event.stopImmediatePropagation();
			closePhotoLightbox();
		}
	});
});
