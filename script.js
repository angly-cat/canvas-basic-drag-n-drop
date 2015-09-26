(function() {
    'use strict';

    // Variables with names starting with '$' are DOM-elements.
    // Function and variables with names starting with 'g' are global.
    // Variables with names starting with 'a' are parameters.

    var $buttonsContainer = document.getElementById('buttons_container'),
        $canvas = document.getElementById('canvas'),
        gCtx = $canvas.getContext('2d'),
        gCanvasMetrics = {
            DEFAULT_WIDTH: 640,
            DEFAULT_HEIGHT: 480,
            width: null,
            height: null,
            scaleFactor: null,
            offsetX: null,
            offsetY: null,
        },
        gImagesPaths = ['img/card1.png', 'img/card2.png', 'img/card3.png'],
        gImages = {};

    gInitCanvasResizing();
    gStartImagesLoading();

    function gInitCanvasResizing() {
        var debounceTmt = null;

        //initial canvas size setting
        setCanvasSize();

        window.onresize = function() {
            clearTimeout(debounceTmt);
            debounceTmt = setTimeout(setCanvasSize, 100);
        };

        function setCanvasSize() {
            gCanvasMetrics.width = window.innerWidth;
            gCanvasMetrics.height = window.innerHeight;

            $canvas.width = gCanvasMetrics.width;
            $canvas.height = gCanvasMetrics.height;
            console.log('Canvas size is set to ' + gCanvasMetrics.width + 'x' + gCanvasMetrics.height);

            gCanvasMetrics.scaleFactor = Math.min(gCanvasMetrics.width/gCanvasMetrics.DEFAULT_WIDTH,
                                                 gCanvasMetrics.height/gCanvasMetrics.DEFAULT_HEIGHT);
            console.log('Scale factor is set to ' + gCanvasMetrics.scaleFactor);

            gCanvasMetrics.offsetX = Math.floor((gCanvasMetrics.width - gCanvasMetrics.DEFAULT_WIDTH*gCanvasMetrics.scaleFactor)/2);
            gCanvasMetrics.offsetY = Math.floor((gCanvasMetrics.height - gCanvasMetrics.DEFAULT_HEIGHT*gCanvasMetrics.scaleFactor)/2);
            console.log('Offsets: x=' + gCanvasMetrics.offsetX + ', y=' + gCanvasMetrics.offsetY);
        }
    }

    function gStartImagesLoading() {
        for (var i = 0, len = gImagesPaths.length; i < len; i++) {
            gImages[i] = new Image();
            gImages[i].onload = addButtonForImage.bind(null, i, len - 1);
            gImages[i].src = gImagesPaths[i];
        }

        function addButtonForImage(aNumber, aTotal) {
            console.log('Image ' + aNumber + ' is loaded.');

            var $button = document.createElement('button');
            $button.className = 'image_button';
            $button.textContent = 'Image ' + aNumber;
            $button.style.top = gCanvasMetrics.height*0.8 + 'px';
            $button.style.left = (gCanvasMetrics.offsetX + gCanvasMetrics.scaleFactor*gCanvasMetrics.DEFAULT_WIDTH*(0.1 + 0.8*aNumber/aTotal)) + 'px';
            $buttonsContainer.insertBefore($button, null);
        }
    }
})();