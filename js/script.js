"use strict";

(function() {
	// html elements
	const breakDiv = document.getElementById('break'),
		  sessionDiv = document.getElementById('session'),
		  breakValue = document.getElementById('breakValue'),
		  sessionValue = document.getElementById('sessionValue'),
		  timeDiv = document.getElementById('time-display'),
		  modeValue = document.getElementById('modeValue'),
		  timeValue = document.getElementById('time'),
		  animationDiv = document.getElementById('animation'),
		  svg = document.getElementById('normalVolcano'),
		  rectOverlay = document.getElementById('overlay');

	let isAnimating = false;

	function Pomodoro() {
		const settings = {
			session: 1500, // session length, default of 25 minutes
			break: 300, // break length, default of 5 minutes
			time: undefined, // current time length
			timer: undefined, // id of setInterval loop
			mode: 'session', // the current mode (either session or break)
			isTiming: false // whether or not pomodoro is activated
		};
		this.setSession = (length) => {
			settings.session = length;
			// reset time if currently paused
			if (!this.getTimingStatus() && settings.mode === 'session') {
				settings.time = settings.session;
			}
		};
		this.setBreak = (length) => {
			settings.break = length;
			// reset time if currently paused
			if (!this.getTimingStatus() && settings.mode === 'break') {
				settings.time = settings.break;
			}
		};
		// change between play and pause
		this.toggleTiming = () => {
			if (settings.isTiming) {
				this.pause();
				settings.isTiming = false;
			} else {
				this.play();
				settings.isTiming = true;
			}
		};
		// change between session and break
		this.toggleMode = () => {
			settings.mode = (settings.mode === 'session') ? 'break' : 'session';
			// set time to length of current mode
			settings.time = settings[settings.mode];
		};
		this.play = () => {
			// save reference to this, so toggleMode is called from this instead of window
			let that = this;
			settings.isTiming = true;
			settings.timer = setInterval(() => {
				--settings.time;
				// if time is up, change to session or break accordingly
				if (settings.time === 0) {
					that.toggleMode();
				}
			}, 1000);
		};
		this.pause = () => {
			settings.isTiming = false;
			clearInterval(settings.timer);
		};
		this.getTime = () => {
			return settings.time;
		};
		this.getTimingStatus = () => {
			return settings.isTiming;
		};
		this.getMode = () => {
			return settings.mode;
		};
		this.getProgress = () => {
			return Math.floor((settings[settings.mode] - settings.time) / settings[settings.mode] * 100) / 100;
		};
	}

	function animate(pomodoro) {
		setInterval(function() {
			// animate time
			let time = pomodoro.getTime(),
				minutes = Math.floor(time / 60),
				seconds = time % 60,
				mode = pomodoro.getMode();
			modeValue.textContent = mode.toUpperCase();
			timeValue.textContent = minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
			
			// erupt volcano if in break mode, otherwise don't animate
			if (mode === 'break') {
				if (!isAnimating) {
					init();
					eruptVolcano();
					isAnimating = true;
					svg.style.animation = 'shake 0.1s linear infinite';
					// make volcano filled with lava (completely orange)
					rectOverlay.setAttribute('height', 0);
				}
			} else {
				if (isAnimating) {
					stopVolcano();
					isAnimating = false;
					svg.style.animation = 'none'
				}
				// set lava height to corresponding progress 
				rectOverlay.setAttribute('height', 180 - (180 * pomodoro.getProgress()));
			}
		}, 100);

	}

	let pomodoro = new Pomodoro();
	pomodoro.setSession(sessionValue.textContent * 60);
	pomodoro.setBreak(breakValue.textContent * 60);

	// event listeners

	// adjust break length
	breakDiv.addEventListener('click', function(e) {
		let target = e.target,
			id = target.id;

		if (!pomodoro.getTimingStatus() || pomodoro.getMode() === 'session') {
			if (id === 'minusBreak') {
				// prevent negative values
				if (Number(breakValue.textContent) > 1) {
					--breakValue.textContent;
				}
			} else if (id === 'plusBreak') {
				++breakValue.textContent;
			}
			pomodoro.setBreak(breakValue.textContent * 60);
		}
	});

	// adjust session length
	sessionDiv.addEventListener('click', function(e) {
		let target = e.target,
			id = target.id;

		if (!pomodoro.getTimingStatus() || pomodoro.getMode() === 'break') {
			if (id === 'minusSession') {
				// prevent negative values
				if (Number(sessionValue.textContent) > 1) {
					--sessionValue.textContent;
				}
			} else if (id === 'plusSession') {
				++sessionValue.textContent;
			}
			pomodoro.setSession(sessionValue.textContent * 60);
		}
	});

	// alternate between timing and paused
	timeDiv.addEventListener('click', function() {
		pomodoro.toggleTiming();
	});

	animate(pomodoro);
})();
