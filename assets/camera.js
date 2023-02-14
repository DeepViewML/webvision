{
    const cameraInterval = 0;

    const blobToBase64 = (blob) => {
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        return new Promise((resolve) => {
            reader.onloadend = () => {
                resolve(reader.result);
            };
        });
    };

    // Start an infinite display loop of getting a camera image and placing that image in the html img element
    const runCamera = async () => {
        const image = document.getElementById('imageContainer');
        await fetch(`/camera`)
            .then((response) => {
                if (response.ok) {
                    response.blob().then((imageBlob) => {
                        blobToBase64(imageBlob)
                            .then((b64) => { image.src = b64; })
                            .catch((err) => { console.log(err); });
                    });
                } else {
                    throw response;
                }
            })
            .catch((err) => { console.log(err); });

        setTimeout(() => {
            window.requestAnimationFrame(runCamera);
        }, cameraInterval);
    };

    runCamera();
}