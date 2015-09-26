(function() {
	'use strict';

	var scaleFactor,
	    canvas = document.getElementById('canvas'),
	    ctx = canvas.getContext('2d'),
	    CANVAS_DEFAULT_WIDTH = 640,
	    CANVAS_DEFAULT_HEIGHT = 480;

	(function initCanvasResizing() {
		var debounceTmt = null;

		function setCanvasSize() {
			var wWidth = window.innerWidth,
			    wHeight = window.innerHeight;
			canvas.width = wWidth;
			canvas.height = wHeight;
			console.log('Canvas size is set to ' + wWidth + 'x' + wHeight);

			scaleFactor = Math.min(wWidth/CANVAS_DEFAULT_WIDTH, wHeight/CANVAS_DEFAULT_HEIGHT);
			console.log('Scale factor is set to ' + scaleFactor);
		}

		window.onresize = function() {
			clearTimeout(debounceTmt);
			debounceTmt = setTimeout(setCanvasSize, 100);
		};

		//initial canvas size setting
		setCanvasSize();
	})();
})();