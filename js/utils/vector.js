/**
 * Vector2D Class for position, velocity, and force calculations
 */
export class Vector2D {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }
    
    // Static factory methods
    static zero() {
        return new Vector2D(0, 0);
    }
    
    static from(obj) {
        return new Vector2D(obj.x || 0, obj.y || 0);
    }
    
    static fromAngle(angle, magnitude = 1) {
        return new Vector2D(
            Math.cos(angle) * magnitude,
            Math.sin(angle) * magnitude
        );
    }
    
    // Basic operations
    clone() {
        return new Vector2D(this.x, this.y);
    }
    
    set(x, y) {
        this.x = x;
        this.y = y;
        return this;
    }
    
    copy(other) {
        this.x = other.x;
        this.y = other.y;
        return this;
    }
    
    // Vector arithmetic
    add(other) {
        this.x += other.x;
        this.y += other.y;
        return this;
    }
    
    subtract(other) {
        this.x -= other.x;
        this.y -= other.y;
        return this;
    }
    
    multiply(scalar) {
        this.x *= scalar;
        this.y *= scalar;
        return this;
    }
    
    divide(scalar) {
        if (scalar !== 0) {
            this.x /= scalar;
            this.y /= scalar;
        }
        return this;
    }
    
    // Vector properties
    magnitude() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }
    
    magnitudeSquared() {
        return this.x * this.x + this.y * this.y;
    }
    
    angle() {
        return Math.atan2(this.y, this.x);
    }
    
    // Vector operations
    normalize() {
        const mag = this.magnitude();
        if (mag > 0) {
            this.divide(mag);
        }
        return this;
    }
    
    limit(max) {
        const magSq = this.magnitudeSquared();
        if (magSq > max * max) {
            this.normalize().multiply(max);
        }
        return this;
    }
    
    setMagnitude(magnitude) {
        return this.normalize().multiply(magnitude);
    }
    
    // Distance calculations
    distance(other) {
        const dx = this.x - other.x;
        const dy = this.y - other.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    distanceSquared(other) {
        const dx = this.x - other.x;
        const dy = this.y - other.y;
        return dx * dx + dy * dy;
    }
    
    // Dot and cross products
    dot(other) {
        return this.x * other.x + this.y * other.y;
    }
    
    cross(other) {
        return this.x * other.y - this.y * other.x;
    }
    
    // Reflection
    reflect(normal) {
        const dot = this.dot(normal);
        this.x -= 2 * dot * normal.x;
        this.y -= 2 * dot * normal.y;
        return this;
    }
    
    // Interpolation
    lerp(other, t) {
        this.x += (other.x - this.x) * t;
        this.y += (other.y - this.y) * t;
        return this;
    }
    
    // Rotation
    rotate(angle) {
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        const x = this.x * cos - this.y * sin;
        const y = this.x * sin + this.y * cos;
        this.x = x;
        this.y = y;
        return this;
    }
    
    // String representation
    toString() {
        return `Vector2D(${this.x.toFixed(2)}, ${this.y.toFixed(2)})`;
    }
    // Static methods for creating new vectors without modifying existing ones
    static add(v1, v2) {
        return new Vector2D(v1.x + v2.x, v1.y + v2.y);
    }
    
    static subtract(v1, v2) {
        return new Vector2D(v1.x - v2.x, v1.y - v2.y);
    }
    
    static multiply(vector, scalar) {
        return new Vector2D(vector.x * scalar, vector.y * scalar);
    }
    
    static divide(vector, scalar) {
        if (scalar !== 0) {
            return new Vector2D(vector.x / scalar, vector.y / scalar);
        }
        return new Vector2D(0, 0);
    }
    
    static dot(v1, v2) {
        return v1.x * v2.x + v1.y * v2.y;
    }
    
    static distance(v1, v2) {
        const dx = v1.x - v2.x;
        const dy = v1.y - v2.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    static normalize(vector) {
        const mag = Math.sqrt(vector.x * vector.x + vector.y * vector.y);
        if (mag > 0) {
            return new Vector2D(vector.x / mag, vector.y / mag);
        }
        return new Vector2D(0, 0);
    }
}

// Static helper methods
export const VectorUtils = {
    // Create vector from two points
    fromPoints(p1, p2) {
        return new Vector2D(p2.x - p1.x, p2.y - p1.y);
    },
    
    // Get angle between two vectors
    angleBetween(v1, v2) {
        return Math.acos(v1.dot(v2) / (v1.magnitude() * v2.magnitude()));
    },
    
    // Check if point is inside rectangle
    pointInRect(point, rect) {
        return point.x >= rect.x && 
               point.x <= rect.x + rect.width &&
               point.y >= rect.y && 
               point.y <= rect.y + rect.height;
    },
    
    // Check if point is inside circle
    pointInCircle(point, center, radius) {
        return point.distanceSquared(center) <= radius * radius;
    }
};