(function() {
    'use strict';

    // Variables with names starting with '$' are DOM-elements.
    // Function and variables with names starting with 'g' are global.
    // Variables with names starting with 'a' are parameters.

    //************************
    //* VARIABLE DEFINITIONS *
    //************************

    // Canvas related.
    var $canvasContainer = document.getElementById('canvas_container'),
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
        };

    // Images related.
    var gImagesPaths = ['img/card1.png', 'img/card2.png', 'img/card3.png'],
        gImagesMetrics = {
            DEFAULT_WIDTH: 150,
            DEFAULT_HEIGHT: 250,
            OFFSET_X: 10,
            OFFSET_Y: 20,
            ADDITION: 20
        },
        gImages = {},
        gImagesOnCanvasStack = [];

    // Dragging related.
    var gCurrentDraggingImageIndex = -1,
        gLastCoords = { x: null, y: null },
        gIsAnimationFrameRequested = false,
        gMouseEvent = null;

    // Buttons related.
    var $buttonsContainer = document.getElementById('buttons_container'),
        gButtons = [];

    //************************
    //*      MAIN CODE       *
    //************************

    gInitCanvasResizingAndButtonsRepositioning();
    gStartImagesLoading();

    $canvas.onmousedown = function(aMouseEvent) {
        var currentCoords = gCalculateCanvasCoordsFromMouseEvent(aMouseEvent);
        gCurrentDraggingImageIndex = gGetIndexOfImageUnderMouse(currentCoords.x, currentCoords.y);
        if (~gCurrentDraggingImageIndex) {
            $canvasContainer.classList.add('dragging');

            gLastCoords.x = currentCoords.x;
            gLastCoords.y = currentCoords.y;

            $canvas.onmousemove = gCanvasOnMouseMoveAction;
        }
    };

    $canvas.onmouseup = function(aMouseEvent) {
        gCurrentDraggingImageIndex = -1;

        $canvasContainer.classList.remove('dragging');

        gMouseEvent = null;

        $canvas.onmousemove = null;
    };

    //************************
    //*      FUNCTIONS       *
    //************************

    function gInitCanvasResizingAndButtonsRepositioning() {
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
        var xFactor = gImagesPaths.length > 1 ? 0.1 + 0.8*aButton.number/(gImagesPaths.length - 1) : 0.5;
        aButton.style.top = gCanvasMetrics.height*0.8 + 'px';
        aButton.style.left = (gCanvasMetrics.offsetX + gCanvasMetrics.scaleFactor*gCanvasMetrics.DEFAULT_WIDTH*xFactor) + 'px';
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
            $button.onclick = buttonClickAction.bind(null, aNumber);

            gButtons.push($button);
        }

        function buttonClickAction(aNumber) {
            var lastImageOnStack, index = getIndexOfImageOnStack(aNumber);

            if (~index) {
                gClearAreaOfImageWithIndex(index);
                // Remove image from canvas image stack array.
                gImagesOnCanvasStack = gImagesOnCanvasStack.slice(0, index).concat(gImagesOnCanvasStack.slice(index + 1));
            } else {
                lastImageOnStack = gImagesOnCanvasStack.length ? gImagesOnCanvasStack[gImagesOnCanvasStack.length - 1] : null;
                gImagesOnCanvasStack.push({
                    x: lastImageOnStack ? lastImageOnStack.x + gImagesMetrics.OFFSET_X : (gCanvasMetrics.DEFAULT_WIDTH - gImagesMetrics.DEFAULT_WIDTH)/2,
                    y: lastImageOnStack ? lastImageOnStack.y + gImagesMetrics.OFFSET_Y : (gCanvasMetrics.DEFAULT_HEIGHT - gImagesMetrics.DEFAULT_HEIGHT)/2,
                    imageNo: aNumber
                });
            }
            gDraw();
        }

        function getIndexOfImageOnStack(aNumber) {
            for (var i = 0, len = gImagesOnCanvasStack.length; i < len; i++) {
                if (gImagesOnCanvasStack[i].imageNo === aNumber) {
                    return i;
                }
            }
            return -1;
        }
    }

    function gDraw() {
        var currentImage;
        for (var i = 0, len = gImagesOnCanvasStack.length; i < len; i++) {
            currentImage = gImagesOnCanvasStack[i];
            gCtx.drawImage(gImages[currentImage.imageNo], currentImage.x, currentImage.y);
        }
    }

    function gCalculateCanvasCoordsFromMouseEvent(aMouseEvent) {
        var x = (aMouseEvent.clientX - gCanvasMetrics.offsetX)/gCanvasMetrics.scaleFactor,
            y = (aMouseEvent.clientY - gCanvasMetrics.offsetY)/gCanvasMetrics.scaleFactor;
        return { x: x, y: y };
    }

    function gGetIndexOfImageUnderMouse(aX, aY) {
        var currentImage;
        for (var i = gImagesOnCanvasStack.length - 1; i >= 0; i--) {
            currentImage = gImagesOnCanvasStack[i];
            if (aX >= currentImage.x && aX <= currentImage.x + gImagesMetrics.DEFAULT_WIDTH &&
                aY >= currentImage.y && aY <= currentImage.y + gImagesMetrics.DEFAULT_HEIGHT) {
                return i;
            }
        }
        return -1;
    }

    function gClearAreaOfImageWithIndex(aIndex) {
        var image = gImagesOnCanvasStack[aIndex];
        gCtx.clearRect(
            image.x - gImagesMetrics.ADDITION,
            image.y - gImagesMetrics.ADDITION,
            gImagesMetrics.DEFAULT_WIDTH + 2*gImagesMetrics.ADDITION,
            gImagesMetrics.DEFAULT_HEIGHT + 2*gImagesMetrics.ADDITION
        );
    }

    function gCanvasOnMouseMoveAction(aMouseEvent) {
        if (~gCurrentDraggingImageIndex && !gIsAnimationFrameRequested) {
            gIsAnimationFrameRequested = true;
            gMouseEvent = aMouseEvent;
            window.requestAnimationFrame(gMoveDraggingImageAndRedraw.bind(null, gCurrentDraggingImageIndex));
        }
    }

    function gMoveDraggingImageAndRedraw(aIndex) {
        gIsAnimationFrameRequested = false;

        var currentCoords = gCalculateCanvasCoordsFromMouseEvent(gMouseEvent);

        gClearAreaOfImageWithIndex(aIndex);

        gImagesOnCanvasStack[aIndex].x += currentCoords.x - gLastCoords.x;
        gImagesOnCanvasStack[aIndex].y += currentCoords.y - gLastCoords.y;

        gLastCoords.x = currentCoords.x;
        gLastCoords.y = currentCoords.y;

        gDraw();
    }
})();