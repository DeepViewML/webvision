let drawBox;

{
    // Draw a box on the canvas
    drawBox = (canvas, object, settings = {}) => {
        const score = object.score * 100;
        if (settings.inferenceThreshold && score < settings.inferenceThreshold) return;

        const ctx = canvas.getContext("2d");

        // Box dimensions
        const box = object.bbox;
        const x = Math.round(box.xmin * canvas.width);
        const y = Math.round(box.ymin * canvas.height);
        const width = Math.round((box.xmax - box.xmin) * canvas.width);
        const height = Math.round((box.ymax - box.ymin) * canvas.height);

        // Set Box styling
        const boxLineWidth = 4;
        ctx.lineWidth = boxLineWidth;
        ctx.strokeStyle = "#EFC15F";

        // Draw the bounding box
        ctx.beginPath();
        ctx.rect(x, y, width, height);
        ctx.stroke();

        // Draw the label
        if (object.label) {
            ctx.font = "24px Arial";
            let currentWidth = 0;
            if (object.label) {
                currentWidth += drawLabelText(ctx, object.label, x, y, boxLineWidth);
            }

            if (object.score) {
                currentWidth += drawLabelScore(ctx, object.score, x + currentWidth, y, boxLineWidth);
            }
        }
    };

    // Draw the text containing the classification label
    const drawLabelText = (ctx, label, x, y, boxLineWidth) => {
        const labelPadding = 6;
        let textMetrics = ctx.measureText(label);
        let textHeight = textMetrics.actualBoundingBoxAscent + textMetrics.actualBoundingBoxDescent;

        const labelBoxWidth = Math.ceil(textMetrics.width + (labelPadding * 2));
        const labelBoxHeight = Math.ceil(textHeight + (labelPadding * 2));

        ctx.fillStyle = "#EFC15F";
        ctx.fillRect(x - (boxLineWidth / 2), y - (boxLineWidth / 2), labelBoxWidth, -labelBoxHeight);

        ctx.fillStyle = 'black';
        ctx.fillText(label, x - (boxLineWidth / 2) + labelPadding, y - (boxLineWidth / 2) - labelPadding);
        return labelBoxWidth;
    }

    // Draw the text containing the label score
    const drawLabelScore = (ctx, score, x, y, boxLineWidth) => {
        const labelPadding = 6;
        const text = `${parseInt(score * 100)}%`
        let textMetrics = ctx.measureText(text);
        let textHeight = textMetrics.actualBoundingBoxAscent + textMetrics.actualBoundingBoxDescent;

        const labelBoxWidth = Math.ceil(textMetrics.width + (labelPadding * 2));
        const labelBoxHeight = Math.ceil(textHeight + (labelPadding * 2));

        ctx.fillStyle = "#EFC15F";
        ctx.fillRect(x - (boxLineWidth / 2), y - (boxLineWidth / 2), labelBoxWidth, -labelBoxHeight);

        ctx.fillStyle = 'black';
        ctx.fillText(text, x - (boxLineWidth / 2) + labelPadding, y - (boxLineWidth / 2) - labelPadding);
        return labelBoxWidth;
    }
}