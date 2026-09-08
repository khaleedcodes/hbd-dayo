(function() {
	'use strict';

	var canvas = document.getElementById('confetti');
	var fallbackColors = ['#ffd65a', '#c4515c', '#8377e4', '#20cfb4', '#f2b300', '#ff8fa3', '#fff7e8'];
	var reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

	if (!canvas || typeof canvas.getContext !== 'function') {
		function createFallbackPieces(duration, intensity, continuous) {
			var count = Math.round((continuous ? 48 : 65) * (intensity || 1));

			for (var fallbackIndex = 0; fallbackIndex < count; fallbackIndex++) {
				var fallbackPiece = document.createElement('span');
				var isRibbon = fallbackIndex % 8 === 0;
				fallbackPiece.className = 'confetti-fallback' + (isRibbon ? ' confetti-fallback--ribbon' : '');
				fallbackPiece.style.left = (Math.random() * 100) + 'vw';
				fallbackPiece.style.backgroundColor = fallbackColors[fallbackIndex % fallbackColors.length];
				fallbackPiece.style.animationDuration = ((duration / 1000) * (0.72 + (Math.random() * 0.34))) + 's';
				fallbackPiece.style.animationDelay = (Math.random() * 0.65) + 's';
				fallbackPiece.style.setProperty('--confetti-drift', ((Math.random() - 0.5) * 260) + 'px');
				if (continuous) fallbackPiece.style.animationIterationCount = 'infinite';
				document.body.appendChild(fallbackPiece);

				if (!continuous) {
					(function(piece) {
						setTimeout(function() {
							if (piece.parentNode) piece.parentNode.removeChild(piece);
						}, duration + 1600);
					})(fallbackPiece);
				}
			}
		}

		window.DayoConfetti = {
			burst: function(duration, intensity) {
				createFallbackPieces(duration, intensity, false);
			},
			start: function(intensity) {
				if (reducedMotion) {
					createFallbackPieces(900, 0.4, false);
					return;
				}
				this.stop();
				createFallbackPieces(5200, intensity || 1, true);
			},
			stop: function() {
				Array.prototype.forEach.call(document.querySelectorAll('.confetti-fallback'), function(piece) {
					piece.parentNode.removeChild(piece);
				});
			}
		};
		return;
	}

	var context = canvas.getContext('2d');
	var colors = ['#ffd65a', '#c4515c', '#8377e4', '#20cfb4', '#f2b300', '#ff8fa3', '#fff7e8'];
	var papers = [];
	var ribbons = [];
	var width = 0;
	var height = 0;
	var running = false;
	var endTime = 0;
	var animationFrame = null;
	var continuous = false;
	var continuousPaperCount = 0;
	var continuousRibbonCount = 0;

	function random(min, max) {
		return min + (Math.random() * (max - min));
	}

	function resize() {
		var ratio = Math.min(window.devicePixelRatio || 1, 2);
		width = window.innerWidth;
		height = window.innerHeight;
		canvas.width = Math.floor(width * ratio);
		canvas.height = Math.floor(height * ratio);
		canvas.style.width = width + 'px';
		canvas.style.height = height + 'px';
		context.setTransform(ratio, 0, 0, ratio, 0, 0);
	}

	function createPaper(fromTop) {
		return {
			x: random(0, width),
			y: fromTop ? random(-height * 0.8, -12) : random(0, height),
			size: random(6, 12),
			velocityX: random(-0.65, 0.65),
			velocityY: random(1.8, 4.2),
			rotation: random(0, Math.PI * 2),
			rotationSpeed: random(-0.12, 0.12),
			wobble: random(0, Math.PI * 2),
			wobbleSpeed: random(0.045, 0.11),
			color: colors[Math.floor(random(0, colors.length))]
		};
	}

	function createRibbon() {
		return {
			x: random(16, width - 16),
			y: random(-height, -80),
			velocityY: random(2.1, 3.6),
			velocityX: random(-0.35, 0.35),
			width: random(5, 9),
			segmentHeight: random(7, 11),
			segments: Math.floor(random(8, 14)),
			amplitude: random(9, 18),
			phase: random(0, Math.PI * 2),
			phaseSpeed: random(0.045, 0.08),
			colorA: colors[Math.floor(random(0, colors.length))],
			colorB: colors[Math.floor(random(0, colors.length))]
		};
	}

	function resetPaper(paper) {
		var replacement = createPaper(true);
		Object.keys(replacement).forEach(function(key) {
			paper[key] = replacement[key];
		});
	}

	function resetRibbon(ribbon) {
		var replacement = createRibbon();
		Object.keys(replacement).forEach(function(key) {
			ribbon[key] = replacement[key];
		});
	}

	function drawPaper(paper) {
		paper.wobble += paper.wobbleSpeed;
		paper.rotation += paper.rotationSpeed;
		paper.x += paper.velocityX + (Math.sin(paper.wobble) * 0.7);
		paper.y += paper.velocityY;

		if (paper.y > height + 24 || paper.x < -30 || paper.x > width + 30) {
			resetPaper(paper);
		}

		context.save();
		context.translate(paper.x, paper.y);
		context.rotate(paper.rotation);
		context.scale(Math.cos(paper.wobble), 1);
		context.fillStyle = paper.color;
		context.fillRect(-paper.size / 2, -paper.size * 0.7, paper.size, paper.size * 1.4);
		context.restore();
	}

	function drawRibbon(ribbon) {
		ribbon.phase += ribbon.phaseSpeed;
		ribbon.x += ribbon.velocityX;
		ribbon.y += ribbon.velocityY;

		if (ribbon.y > height + (ribbon.segments * ribbon.segmentHeight)) {
			resetRibbon(ribbon);
		}

		for (var i = 0; i < ribbon.segments; i++) {
			var y1 = ribbon.y - (i * ribbon.segmentHeight);
			var y2 = ribbon.y - ((i + 1) * ribbon.segmentHeight);
			var x1 = ribbon.x + (Math.sin(ribbon.phase + (i * 0.6)) * ribbon.amplitude);
			var x2 = ribbon.x + (Math.sin(ribbon.phase + ((i + 1) * 0.6)) * ribbon.amplitude);

			context.beginPath();
			context.moveTo(x1 - ribbon.width, y1);
			context.lineTo(x1 + ribbon.width, y1);
			context.lineTo(x2 + ribbon.width, y2);
			context.lineTo(x2 - ribbon.width, y2);
			context.closePath();
			context.fillStyle = i % 2 === 0 ? ribbon.colorA : ribbon.colorB;
			context.fill();
		}
	}

	function render(now) {
		context.clearRect(0, 0, width, height);

		var timeLeft = endTime - now;
		canvas.style.opacity = continuous ? 1 : (timeLeft < 700 ? Math.max(0, timeLeft / 700) : 1);

		papers.forEach(drawPaper);
		ribbons.forEach(drawRibbon);

		if (continuous) {
			if (endTime && timeLeft <= 0) {
				papers = papers.slice(0, continuousPaperCount);
				ribbons = ribbons.slice(0, continuousRibbonCount);
				endTime = 0;
			}
			animationFrame = window.requestAnimationFrame(render);
			return;
		}

		if (timeLeft > 0) {
			animationFrame = window.requestAnimationFrame(render);
			return;
		}

		running = false;
		papers = [];
		ribbons = [];
		context.clearRect(0, 0, width, height);
		canvas.style.opacity = 0;
	}

	function burst(duration, intensity) {
		var paperCount = Math.round((reducedMotion ? 22 : 90) * (intensity || 1));
		var ribbonCount = Math.round((reducedMotion ? 3 : 9) * (intensity || 1));

		resize();

		if (continuous) {
			while (papers.length < paperCount) papers.push(createPaper(true));
			while (ribbons.length < ribbonCount) ribbons.push(createRibbon());
		} else {
			papers = [];
			ribbons = [];
			for (var i = 0; i < paperCount; i++) papers.push(createPaper(true));
			for (var j = 0; j < ribbonCount; j++) ribbons.push(createRibbon());
		}

		endTime = Math.max(endTime, performance.now() + (reducedMotion ? Math.min(duration, 900) : duration));
		canvas.style.opacity = 1;

		if (!running) {
			running = true;
			animationFrame = window.requestAnimationFrame(render);
		}
	}

	function start(intensity) {
		if (reducedMotion) {
			burst(900, 0.4);
			return;
		}

		resize();
		continuous = true;
		continuousPaperCount = Math.round((width <= 560 ? 46 : 70) * (intensity || 1));
		continuousRibbonCount = Math.round((width <= 560 ? 4 : 7) * (intensity || 1));
		papers = [];
		ribbons = [];
		endTime = 0;

		for (var i = 0; i < continuousPaperCount; i++) papers.push(createPaper(true));
		for (var j = 0; j < continuousRibbonCount; j++) ribbons.push(createRibbon());

		canvas.style.opacity = 1;
		if (!running) {
			running = true;
			animationFrame = window.requestAnimationFrame(render);
		}
	}

	function stop() {
		if (animationFrame) window.cancelAnimationFrame(animationFrame);
		running = false;
		continuous = false;
		endTime = 0;
		papers = [];
		ribbons = [];
		context.clearRect(0, 0, width, height);
		canvas.style.opacity = 0;
	}

	window.addEventListener('resize', resize);
	resize();

	window.DayoConfetti = {
		burst: burst,
		start: start,
		stop: stop
	};
})();
