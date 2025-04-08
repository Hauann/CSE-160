let canvas, ctx;

function main() {
    canvas = document.getElementById('example');
    if (!canvas) {
        console.log('Failed to retrieve the <canvas> element');
        return;
    }

    ctx = canvas.getContext('2d');

    handleDrawEvent();
}

function handleDrawEvent() {
    // Clear the canvas to black
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Get v1 values
    let x1 = parseFloat(document.getElementById('xInput1').value);
    let y1 = parseFloat(document.getElementById('yInput1').value);
    let v1 = new Vector3([x1, y1, 0]);
    drawVector(v1, "red", ctx, canvas);

    // Get v2 values
    let x2 = parseFloat(document.getElementById('xInput2').value);
    let y2 = parseFloat(document.getElementById('yInput2').value);
    let v2 = new Vector3([x2, y2, 0]);
    drawVector(v2, "blue", ctx, canvas);
}

function drawVector(v, color, ctx, canvas) {
    let scale = 20;
    let centerX = canvas.width / 2;
    let centerY = canvas.height / 2;

    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(centerX + v.elements[0] * scale, centerY - v.elements[1] * scale);
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.stroke();
}

function handleDrawOperationEvent() {
    // Clear canvas
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Get input vectors
    let x1 = parseFloat(document.getElementById('xInput1').value);
    let y1 = parseFloat(document.getElementById('yInput1').value);
    let v1 = new Vector3([x1, y1, 0]);

    let x2 = parseFloat(document.getElementById('xInput2').value);
    let y2 = parseFloat(document.getElementById('yInput2').value);
    let v2 = new Vector3([x2, y2, 0]);

    // Draw original vectors
    drawVector(v1, "red", ctx, canvas);
    drawVector(v2, "blue", ctx, canvas);

    // Get selected operation
    let operation = document.getElementById('operationSelector').value;
    let scalar = parseFloat(document.getElementById('scalarInput').value);

    if (operation === 'add') {
        let v3 = new Vector3([x1, y1, 0]).add(new Vector3([x2, y2, 0]));
        drawVector(v3, "green", ctx, canvas);

    } else if (operation === 'sub') {
        let v3 = new Vector3([x1, y1, 0]).sub(new Vector3([x2, y2, 0]));
        drawVector(v3, "green", ctx, canvas);

    } else if (operation === 'mul') {
        let v3 = new Vector3([x1, y1, 0]).mul(scalar);
        let v4 = new Vector3([x2, y2, 0]).mul(scalar);
        drawVector(v3, "green", ctx, canvas);
        drawVector(v4, "green", ctx, canvas);

    } else if (operation === 'div') {
        if (scalar === 0) {
            alert("Cannot divide by zero.");
            return;
        }
        let v3 = new Vector3([x1, y1, 0]).div(scalar);
        let v4 = new Vector3([x2, y2, 0]).div(scalar);
        drawVector(v3, "green", ctx, canvas);
        drawVector(v4, "green", ctx, canvas);

    } else if (operation === 'magnitude') {
        console.log("Magnitude v1:", v1.magnitude());
        console.log("Magnitude v2:", v2.magnitude());

    } else if (operation === 'normalize') {
        let v3 = new Vector3([x1, y1, 0]).normalize();
        let v4 = new Vector3([x2, y2, 0]).normalize();
        drawVector(v3, "green", ctx, canvas);
        drawVector(v4, "green", ctx, canvas);
    }

    else if (operation === 'angle') {
        let angle = angleBetween(v1, v2);
        if (angle !== null) {
            console.log("Angle:", angle);
        }
    }

    else if (operation === 'area') {
        let area = areaTriangle(v1, v2);
        console.log("Area of the triangle:", area);
    }
}

function angleBetween(v1, v2) {
    let dotProduct = Vector3.dot(v1, v2);
    let mag1 = v1.magnitude();
    let mag2 = v2.magnitude();

    if (mag1 === 0 || mag2 === 0) {
        console.warn("Cannot compute angle with zero-length vector.");
        return null;
    }

    let cosTheta = dotProduct / (mag1 * mag2);
    cosTheta = Math.min(1, Math.max(-1, cosTheta));
    let angleRad = Math.acos(cosTheta);
    let angleDeg = angleRad * (180 / Math.PI);
    return angleDeg;
}

function areaTriangle(v1, v2) {
    let crossProduct = Vector3.cross(v1, v2);
    let areaParallelogram = crossProduct.magnitude();
    let areaTriangle = areaParallelogram / 2;
    return areaTriangle;
}