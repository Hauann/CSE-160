class Cube {
    constructor() {
        this.type = 'cube';
        //this.position = [0.0, 0.0, 0.0];
        this.color = [1.0, 1.0, 1.0, 1.0];
        //this.size = 5.0;
        //this.segments = 10;
        this.matrix = new Matrix4();
        this.textureNum = -2;
    }

    render() {
        //var xy = this.position;
        var rgba = this.color;
        //var size = this.size;

        // Pass the texture number
        gl.uniform1i(u_whichTexture, this.textureNum);

        // Pass the color of a point to u_FragColor variable
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

        // Pass the matrix to u_ModelMatrix attribute
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        // Front of cube
        drawTriangle3DUV([0.0, 0.0, 0.0, 1.0, 1.0, 0.0, 1.0, 0.0, 0.0], [0.0, 0.0, 1.0, 1.0, 1.0, 0.0]);
        drawTriangle3DUV([0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0], [0.0, 0.0, 0.0, 1.0, 1.0, 1.0]);

        // Pass the color of a point to u_FragColor uniform variable
        gl.uniform4f(u_FragColor, rgba[0] * .9, rgba[1] * .9, rgba[2] * .9, rgba[3]);

        // Top of cube
        drawTriangle3DUV([0.0, 1.0, 0.0, 0.0, 1.0, 1.0, 1.0, 1.0, 1.0], [0.0, 0.0, 0.0, 1.0, 1.0, 1.0]);
        drawTriangle3DUV([0.0, 1.0, 0.0, 1.0, 1.0, 1.0, 1.0, 1.0, 0.0], [0.0, 0.0, 1.0, 1.0, 1.0, 0.0]);

        // Pass the color of a point to u_FragColor uniform variable
        gl.uniform4f(u_FragColor, rgba[0] * .8, rgba[1] * .8, rgba[2] * .8, rgba[3]);

        // Right side of cube
        gl.uniform4f(u_FragColor, rgba[0] * .8, rgba[1] * .8, rgba[2] * .8, rgba[3]);
        drawTriangle3D([1.0, 1.0, 0.0, 1.0, 1.0, 1.0, 1.0, 0.0, 0.0]);
        drawTriangle3D([1.0, 0.0, 0.0, 1.0, 1.0, 1.0, 1.0, 0.0, 1.0]);

        // Left side of cube
        gl.uniform4f(u_FragColor, rgba[0] * .7, rgba[1] * .7, rgba[2] * .7, rgba[3]);
        drawTriangle3D([0.0, 1.0, 0.0, 0.0, 1.0, 1.0, 0.0, 0.0, 0.0]);
        drawTriangle3D([0.0, 0.0, 0.0, 0.0, 1.0, 1.0, 0.0, 0.0, 1.0]);

        // Bottom of cube
        gl.uniform4f(u_FragColor, rgba[0] * .6, rgba[1] * .6, rgba[2] * .6, rgba[3]);
        drawTriangle3D([0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 1.0, 0.0, 1.0]);
        drawTriangle3D([0.0, 0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 0.0]);

        // Back of cube
        gl.uniform4f(u_FragColor, rgba[0] * .5, rgba[1] * .5, rgba[2] * .5, rgba[3]);
        drawTriangle3D([0.0, 0.0, 1.0, 1.0, 1.0, 1.0, 1.0, 0.0, 1.0]);
        drawTriangle3D([0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 1.0, 1.0, 1.0]);
    }

    renderfast() {
        var rgba = this.color;

        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        var allverts=[];
        // Front of cube
        allverts=allverts.concat( [0,0,0, 1,1,0, 1,0,0] );
        allverts=allverts.concat( [0,0,0, 0,1,0, 1,1,0] );

        // Top of cube
        allverts=allverts.concat( [0,1,0, 0,1,1, 1,1,1] );
        allverts=allverts.concat( [0,1,0, 1,1,1, 1,1,0] );

        // Right of cube
        allverts=allverts.concat( [1,1,0, 1,1,1, 1,0,0] );
        allverts=allverts.concat( [1,0,0, 1,1,1, 1,0,1] );

        // Left of cube
        allverts=allverts.concat( [0,1,0, 0,1,1, 0,0,0] );
        allverts=allverts.concat( [0,0,0, 0,1,1, 0,0,1] );

        // Bottom of cube
        allverts=allverts.concat( [0,0,0, 0,0,1, 1,0,1] );
        allverts=allverts.concat( [0,0,0, 1,0,1, 1,0,0] );

        // Back of cube
        allverts=allverts.concat( [0,0,1, 1,1,1, 1,0,1] );
        allverts=allverts.concat( [0,0,1, 0,1,1, 1,1,1] );
        drawTriangle3D(allverts);
    }
}
