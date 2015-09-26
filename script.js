(function() {
    'use strict';

    // Global variables.
    var canvas = document.getElementById('canvas'),
        ctx = canvas.getContext('2d'),
        canvasMetrics = {
            DEFAULT_WIDTH: 640,
            DEFAULT_HEIGHT: 480,
            width: null,
            height: null,
            scaleFactor: null,
            offsetX: null,
            offsetY: null,
        },
        imagesPaths = ['img/card1.png', 'img/card2.png', 'img/card3.png'],
        images = {};

    (function initCanvasResizing() {
        var debounceTmt = null;

        function setCanvasSize() {
            canvasMetrics.width = window.innerWidth;
            canvasMetrics.height = window.innerHeight;

            canvas.width = canvasMetrics.width;
            canvas.height = canvasMetrics.height;
            console.log('Canvas size is set to ' + canvasMetrics.width + 'x' + canvasMetrics.height);

            canvasMetrics.scaleFactor = Math.min(canvasMetrics.width/canvasMetrics.DEFAULT_WIDTH,
                                                 canvasMetrics.height/canvasMetrics.DEFAULT_HEIGHT);
            console.log('Scale factor is set to ' + canvasMetrics.scaleFactor);

            canvasMetrics.offsetX = Math.floor((canvasMetrics.width - canvasMetrics.DEFAULT_WIDTH*canvasMetrics.scaleFactor)/2);
            canvasMetrics.offsetY = Math.floor((canvasMetrics.height - canvasMetrics.DEFAULT_HEIGHT*canvasMetrics.scaleFactor)/2);
            console.log('Offsets: x=' + canvasMetrics.offsetX + ', y=' + canvasMetrics.offsetY);
        }

        window.onresize = function() {
            clearTimeout(debounceTmt);
            debounceTmt = setTimeout(setCanvasSize, 100);
        };

        //initial canvas size setting
        setCanvasSize();
    })();

    (function imagesPreloading() {
        function addButtonForImage(aNumber) {
            console.log('Image ' + aNumber + ' is loaded.');
        }

        for (var i = 0, len = imagesPaths.length; i < len; i++) {
            images[i] = new Image();
            images[i].onload = addButtonForImage.bind(null, i);
            images[i].src = imagesPaths[i];
        }
    })();
})();