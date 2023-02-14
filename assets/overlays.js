
{
    /*
     * Keeps the canvas overlapping the display image when loading new images and resizing the browser window.
     * Rendered Image Dimensions must be calculated when using css 'object-fit: contain'
     */
    let renderedImageDimensions = {
        width: 0,
        height: 0,
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
    };

    // Get dimensions of the rendered display image
    // This is not equal to the element dimensions when using 'object-fit: contain'
    const getRenderedImageDimensions = (image) => {
        const {
            width, height, naturalWidth, naturalHeight,
        } = image;
        const naturalRatio = naturalWidth / naturalHeight;
        const elementRatio = width / height;
        const [renderedWidth, renderedHeight] = naturalRatio >= elementRatio ? [width, width / naturalRatio] : [height * naturalRatio, height];

        return {
            width: Math.round(renderedWidth),
            height: Math.round(renderedHeight),
            top: Math.round((height - renderedHeight) / 2),
            left: Math.round((width - renderedWidth) / 2),
            bottom: Math.round(((height - renderedHeight) / 2) + height),
            right: Math.round(((width - renderedWidth) / 2) + width),
        };
    };

    // Reposition and resize the canvas when a new image is loaded
    const handleImageLoad = (e) => {
        const canvas = document.getElementById('animationCanvas');
        const image = document.getElementById('imageContainer');
        if (canvas && image) {
            renderedImageDimensions = getRenderedImageDimensions(e.target);
            canvas.style.left = `${renderedImageDimensions.left}px`;
            canvas.style.top = `${renderedImageDimensions.top}px`;
            canvas.style.width = `${renderedImageDimensions.width}px`;
            canvas.style.height = `${renderedImageDimensions.height}px`;
        }
    };

    // Reposition and resize the canvas when the browser window is resized
    const handleWindowResize = () => {
        const canvas = document.getElementById('animationCanvas');
        const image = document.getElementById('imageContainer');
        if (canvas && image) {
            renderedImageDimensions = getRenderedImageDimensions(image);
            canvas.style.left = `${renderedImageDimensions.left}px`;
            canvas.style.top = `${renderedImageDimensions.top}px`;
            canvas.style.width = `${renderedImageDimensions.width}px`;
            canvas.style.height = `${renderedImageDimensions.height}px`;
        }
    };

    // Create canvas repositioning event listeners
    const image = document.getElementById('imageContainer');
    image.addEventListener('load', handleImageLoad);
    window.addEventListener('resize', handleWindowResize);

    const overlayInterval = 0;

    const drawResults = (result) => {
        // Reset the width and height of the canvas (in case the image size has changed)
        // This is separate from the css styling width and height of the canvas element
        // This has the side effect of clearing the canvas drawings
        const canvas = document.getElementById('animationCanvas');
        canvas.width = parseInt(canvas.style.width);
        canvas.height = parseInt(canvas.style.height);
        result.objects.forEach((obj) => drawBox(canvas, obj));
    };

    // Fetch results from the camera with a GET request to the camera url /results route
    const getResults = async () => fetch(`/results`)
        .then((response) => response.json())
        .catch((err) => {
            console.log(err);
        });

    // Start an infinite animation loop of getting results and then drawing results
    const runAnimation = async () => {
        const result = await getResults();

        drawResults(result);

        setTimeout(() => {
            window.requestAnimationFrame(runAnimation);
        }, overlayInterval);
    };

    // Start animation loop immediately when this file is loaded
    runAnimation();
}