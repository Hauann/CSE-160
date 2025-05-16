class Vector {
    constructor(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    add(v) {
        return new Vector(this.x + v.x, this.y + v.y, this.z + v.z);
    }

    subtract(v) {
        return new Vector(this.x - v.x, this.y - v.y, this.z - v.z);
    }

    multiply(scalar) {
        return new Vector(this.x * scalar, this.y * scalar, this.z * scalar);
    }

    divide(scalar) {
        return new Vector(this.x / scalar, this.y / scalar, this.z / scalar);
    }

    length() {
        return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
    }

    normalize() {
        const len = this.length();
        return len === 0 ? new Vector(0, 0, 0) : this.divide(len);
    }

    cross(v) {
        return new Vector(
            this.y * v.z - this.z * v.y,
            this.z * v.x - this.x * v.z,
            this.x * v.y - this.y * v.x
        );
    }

    dot(v) {
        return this.x * v.x + this.y * v.y + this.z * v.z;
    }

    rotateY(angle) {
        const cosA = Math.cos(angle);
        const sinA = Math.sin(angle);
        return new Vector(
            this.x * cosA - this.z * sinA,
            this.y,
            this.x * sinA + this.z * cosA
        );
    }

    toString() {
        return `Vector(${this.x.toFixed(2)}, ${this.y.toFixed(2)}, ${this.z.toFixed(2)})`;
    }
}