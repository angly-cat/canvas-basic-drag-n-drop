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
        gImagesMetrics = {
            DEFAULT_WIDTH: 150,
            DEFAULT_HEIGHT: 250,
            ADDITION: 20
        },
        gImages = {},
        gImagesOnCanvasStack = [],
        gButtons = [];

    gInitCanvasAndButtonsResizing();
    gStartImagesLoading();

    function gInitCanvasAndButtonsResizing() {
        var debounceTmt = null;

        //initial canvas size setting
        setCanvasSize();

        window.onresize = function() {
            clearTimeout(debounceTmt);
            debounceTmt = setTimeout(function() {
                setCanvasSize();
                setButtonsPosition();
                gDraw();
            }, 100);
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

            gCtx.setTransform(gCanvasMetrics.scaleFactor, 0, 0, gCanvasMetrics.scaleFactor, gCanvasMetrics.offsetX, gCanvasMetrics.offsetY);
        }

        function setButtonsPosition() {
            for (var i = 0, len = gButtons.length; i < len; i++) {
                gSetButtonPosition(gButtons[i]);
            }
        }
    }

    function gSetButtonPosition(aButton) {
        aButton.style.top = gCanvasMetrics.height*0.8 + 'px';
        aButton.style.left = (gCanvasMetrics.offsetX + gCanvasMetrics.scaleFactor*gCanvasMetrics.DEFAULT_WIDTH*(0.1 + 0.8*aButton.number/(gImagesPaths.length - 1))) + 'px';
    }

    function gStartImagesLoading() {
        for (var i = 0, len = gImagesPaths.length; i < len; i++) {
            gImages[i] = new Image();
            gImages[i].onload = addButtonForImage.bind(null, i);
            gImages[i].src = gImagesPaths[i];
        }

        function addButtonForImage(aNumber) {
            console.log('Image ' + aNumber + ' is loaded.');

            var $button = document.createElement('button');
            $button.className = 'image_button';
            $button.textContent = 'Image ' + (aNumber + 1);
            $button.number = aNumber;

            gSetButtonPosition($button);

            $buttonsContainer.insertBefore($button, null);

            gButtons.push($button);

            $button.onclick = buttonClickAction.bind(null, aNumber);
        }

        function buttonClickAction(aNumber) {
            var index = indexOfImageOnStack(aNumber);
            if (~index) {
                gClearCanvas();
                // Remove image from canvas image stack array.
                gImagesOnCanvasStack = gImagesOnCanvasStack.slice(0, index).concat(gImagesOnCanvasStack.slice(index + 1));
            } else {
                gImagesOnCanvasStack.push({x: 100 + 100*aNumber, y: 200 + 10*aNumber, imageNo: aNumber});
            }
            gDraw();
        }

        function indexOfImageOnStack(aNumber) {
            for (var i = 0, len = gImagesOnCanvasStack.length; i < len; i++) {
                if (gImagesOnCanvasStack[i].imageNo === aNumber) {
                    return i;
                }
            }
            return -1;
        }
    }

    function gDraw() {
        gClearCanvas();

        var currentImage;
        for (var i = 0, len = gImagesOnCanvasStack.length; i < len; i++) {
            currentImage = gImagesOnCanvasStack[i];
            gCtx.drawImage(gImages[currentImage.imageNo], currentImage.x, currentImage.y);
        }
    }

    function gClearCanvas() {
        var currentImage;
        for (var i = 0, len = gImagesOnCanvasStack.length; i < len; i++) {
            currentImage = gImagesOnCanvasStack[i];
            // Addition is to enlarge clearing area for correct clearing.
            gCtx.clearRect(
                currentImage.x - gImagesMetrics.ADDITION,
                currentImage.y - gImagesMetrics.ADDITION,
                gImagesMetrics.DEFAULT_WIDTH + 2*gImagesMetrics.ADDITION,
                gImagesMetrics.DEFAULT_HEIGHT + 2*gImagesMetrics.ADDITION
            );
        }
    }
})();