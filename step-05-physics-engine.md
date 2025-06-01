# Step 05: Basic Physics Engine

## Objective
Implement a lightweight physics engine optimized for block breaker gameplay, featuring precise collision detection, realistic ball physics, and a foundation for advanced mechanics like liquid simulation and sound wave propagation.

## Prerequisites
- Step 04 completed successfully
- Game loop and rendering system operational
- Vector2D utilities available

## Deliverables
- Physics engine with collision detection system
- Ball physics with realistic bouncing
- Collision shapes (Rectangle, Circle, Line)
- Spatial partitioning for performance optimization
- Integration with the game loop and renderer
- Feature branch created and merged

## Step-by-Step Instructions

### 1. Create Feature Branch
```bash
git checkout -b feature/physics-engine
git branch
```

### 2. Create Collision Shapes (js/game/physics/shapes.js)

```javascript
/**
 * Collision Shape Classes for Physics Engine
 */
import { Vector2D } from '../../utils/vector.js';

// Base Shape Class
export class Shape {
    constructor(type) {
        this.type = type;
        this.position = new Vector2D();
        this.rotation = 0;
        this.isTrigger = false;
        this.userData = {};
    }
    
    // Abstract methods (to be implemented by subclasses)
    getBounds() {
        throw new Error('getBounds must be implemented by subclass');
    }
    
    containsPoint(point) {
        throw new Error('containsPoint must be implemented by subclass');
    }
    
    getSupport(direction) {
        throw new Error('getSupport must be implemented by subclass');
    }
}

// Rectangle Shape
export class Rectangle extends Shape {
    constructor(x, y, width, height) {
        super('rectangle');
        this.position.set(x, y);
        this.width = width;
        this.height = height;
        this.halfWidth = width / 2;
        this.halfHeight = height / 2;
    }
    
    getBounds() {
        return {
            left: this.position.x,
            right: this.position.x + this.width,
            top: this.position.y,
            bottom: this.position.y + this.height,
            width: this.width,
            height: this.height
        };
    }
    
    getCenter() {
        return new Vector2D(
            this.position.x + this.halfWidth,
            this.position.y + this.halfHeight
        );
    }
    
    containsPoint(point) {
        return point.x >= this.position.x &&
               point.x <= this.position.x + this.width &&
               point.y >= this.position.y &&
               point.y <= this.position.y + this.height;
    }
    
    getClosestPoint(point) {
        const bounds = this.getBounds();
        return new Vector2D(
            Math.max(bounds.left, Math.min(point.x, bounds.right)),
            Math.max(bounds.top, Math.min(point.y, bounds.bottom))
        );
    }
    
    getVertices() {
        return [
            new Vector2D(this.position.x, this.position.y),
            new Vector2D(this.position.x + this.width, this.position.y),
            new Vector2D(this.position.x + this.width, this.position.y + this.height),
            new Vector2D(this.position.x, this.position.y + this.height)
        ];
    }
    
    // For SAT collision detection
    getAxes() {
        return [
            new Vector2D(1, 0), // Right
            new Vector2D(0, 1)  // Down
        ];
    }
    
    project(axis) {
        const vertices = this.getVertices();
        let min = vertices[0].dot(axis);
        let max = min;
        
        for (let i = 1; i < vertices.length; i++) {
            const projection = vertices[i].dot(axis);
            min = Math.min(min, projection);
            max = Math.max(max, projection);
        }
        
        return { min, max };
    }
}

// Circle Shape
export class Circle extends Shape {
    constructor(x, y, radius) {
        super('circle');
        this.position.set(x, y);
        this.radius = radius;
    }
    
    getBounds() {
        return {
            left: this.position.x - this.radius,
            right: this.position.x + this.radius,
            top: this.position.y - this.radius,
            bottom: this.position.y + this.radius,
            width: this.radius * 2,
            height: this.radius * 2
        };
    }
    
    getCenter() {
        return this.position.clone();
    }
    
    containsPoint(point) {
        return this.position.distanceSquared(point) <= this.radius * this.radius;
    }
    
    getClosestPoint(point) {
        const direction = Vector2D.fromPoints(this.position, point);
        const distance = direction.magnitude();
        
        if (distance === 0) return this.position.clone();
        if (distance <= this.radius) return point.clone();
        
        direction.normalize().multiply(this.radius);
        return this.position.clone().add(direction);
    }
    
    project(axis) {
        const center = this.position.dot(axis);
        return {
            min: center - this.radius,
            max: center + this.radius
        };
    }
}

// Line Shape (for walls and special collision surfaces)
export class Line extends Shape {
    constructor(x1, y1, x2, y2) {
        super('line');
        this.start = new Vector2D(x1, y1);
        this.end = new Vector2D(x2, y2);
        this.position = this.start.clone();
        this.length = this.start.distance(this.end);
        this.direction = Vector2D.fromPoints(this.start, this.end).normalize();
        this.normal = new Vector2D(-this.direction.y, this.direction.x);
    }
    
    getBounds() {
        const minX = Math.min(this.start.x, this.end.x);
        const maxX = Math.max(this.start.x, this.end.x);
        const minY = Math.min(this.start.y, this.end.y);
        const maxY = Math.max(this.start.y, this.end.y);
        
        return {
            left: minX,
            right: maxX,
            top: minY,
            bottom: maxY,
            width: maxX - minX,
            height: maxY - minY
        };
    }
    
    getCenter() {
        return new Vector2D(
            (this.start.x + this.end.x) / 2,
            (this.start.y + this.end.y) / 2
        );
    }
    
    containsPoint(point, tolerance = 1) {
        const closestPoint = this.getClosestPoint(point);
        return closestPoint.distance(point) <= tolerance;
    }
    
    getClosestPoint(point) {
        const lineVec = Vector2D.fromPoints(this.start, this.end);
        const pointVec = Vector2D.fromPoints(this.start, point);
        
        const lineLength = lineVec.magnitudeSquared();
        if (lineLength === 0) return this.start.clone();
        
        const t = Math.max(0, Math.min(1, pointVec.dot(lineVec) / lineLength));
        
        return this.start.clone().add(lineVec.multiply(t));
    }
    
    project(axis) {
        const startProjection = this.start.dot(axis);
        const endProjection = this.end.dot(axis);
        
        return {
            min: Math.min(startProjection, endProjection),
            max: Math.max(startProjection, endProjection)
        };
    }
}

// Utility functions for shape operations
export const ShapeUtils = {
    // Check if two projections overlap
    projectionsOverlap(proj1, proj2) {
        return proj1.max >= proj2.min && proj2.max >= proj1.min;
    },
    
    // Get overlap amount between two projections
    getOverlapAmount(proj1, proj2) {
        if (!this.projectionsOverlap(proj1, proj2)) return 0;
        return Math.min(proj1.max, proj2.max) - Math.max(proj1.min, proj2.min);
    },
    
    // Create shape from bounds
    createRectFromBounds(bounds) {
        return new Rectangle(bounds.left, bounds.top, bounds.width, bounds.height);
    }
};
```

### 3. Create Collision Detection System (js/game/physics/collision.js)

```javascript
/**
 * Collision Detection and Response System
 */
import { Vector2D } from '../../utils/vector.js';
import { Rectangle, Circle, Line, ShapeUtils } from './shapes.js';

// Collision Information
export class CollisionInfo {
    constructor() {
        this.hasCollision = false;
        this.contactPoint = new Vector2D();
        this.normal = new Vector2D();
        this.penetration = 0;
        this.shapeA = null;
        this.shapeB = null;
        this.userData = {};
    }
    
    reset() {
        this.hasCollision = false;
        this.contactPoint.set(0, 0);
        this.normal.set(0, 0);
        this.penetration = 0;
        this.shapeA = null;
        this.shapeB = null;
        this.userData = {};
    }
}

// Main Collision Detector
export class CollisionDetector {
    constructor() {
        // Collision method lookup table
        this.collisionMethods = new Map();
        this.setupCollisionMethods();
    }
    
    setupCollisionMethods() {
        // Circle vs Circle
        this.collisionMethods.set('circle-circle', this.circleVsCircle.bind(this));
        
        // Circle vs Rectangle
        this.collisionMethods.set('circle-rectangle', this.circleVsRectangle.bind(this));
        this.collisionMethods.set('rectangle-circle', (a, b, info) => {
            const result = this.circleVsRectangle(b, a, info);
            if (result && info.hasCollision) {
                info.normal.multiply(-1); // Flip normal
            }
            return result;
        });
        
        // Rectangle vs Rectangle
        this.collisionMethods.set('rectangle-rectangle', this.rectangleVsRectangle.bind(this));
        
        // Circle vs Line
        this.collisionMethods.set('circle-line', this.circleVsLine.bind(this));
        this.collisionMethods.set('line-circle', (a, b, info) => {
            const result = this.circleVsLine(b, a, info);
            if (result && info.hasCollision) {
                info.normal.multiply(-1);
            }
            return result;
        });
        
        // Rectangle vs Line
        this.collisionMethods.set('rectangle-line', this.rectangleVsLine.bind(this));
        this.collisionMethods.set('line-rectangle', (a, b, info) => {
            return this.rectangleVsLine(b, a, info);
        });
    }
    
    // Main collision detection method
    checkCollision(shapeA, shapeB, collisionInfo = new CollisionInfo()) {
        collisionInfo.reset();
        collisionInfo.shapeA = shapeA;
        collisionInfo.shapeB = shapeB;
        
        // Quick AABB check first
        if (!this.aabbCheck(shapeA, shapeB)) {
            return false;
        }
        
        // Get appropriate collision method
        const methodKey = `${shapeA.type}-${shapeB.type}`;
        const method = this.collisionMethods.get(methodKey);
        
        if (method) {
            return method(shapeA, shapeB, collisionInfo);
        }
        
        console.warn(`No collision method for ${methodKey}`);
        return false;
    }
    
    // Axis-Aligned Bounding Box check (broad phase)
    aabbCheck(shapeA, shapeB) {
        const boundsA = shapeA.getBounds();
        const boundsB = shapeB.getBounds();
        
        return !(boundsA.right < boundsB.left ||
                boundsA.left > boundsB.right ||
                boundsA.bottom < boundsB.top ||
                boundsA.top > boundsB.bottom);
    }
    
    // Circle vs Circle collision
    circleVsCircle(circleA, circleB, info) {
        const distance = circleA.position.distance(circleB.position);
        const radiusSum = circleA.radius + circleB.radius;
        
        if (distance <= radiusSum) {
            info.hasCollision = true;
            info.penetration = radiusSum - distance;
            
            if (distance > 0) {
                info.normal = Vector2D.fromPoints(circleA.position, circleB.position).normalize();
            } else {
                info.normal.set(1, 0); // Default normal if circles are at same position
            }
            
            info.contactPoint = circleA.position.clone()
                .add(info.normal.clone().multiply(circleA.radius - info.penetration / 2));
            
            return true;
        }
        
        return false;
    }
    
    // Circle vs Rectangle collision
    circleVsRectangle(circle, rect, info) {
        const closestPoint = rect.getClosestPoint(circle.position);
        const distance = circle.position.distance(closestPoint);
        
        if (distance <= circle.radius) {
            info.hasCollision = true;
            info.penetration = circle.radius - distance;
            info.contactPoint = closestPoint.clone();
            
            if (distance > 0) {
                info.normal = Vector2D.fromPoints(closestPoint, circle.position).normalize();
            } else {
                // Circle center is inside rectangle
                const rectCenter = rect.getCenter();
                const toCenter = Vector2D.fromPoints(rectCenter, circle.position);
                
                // Find shortest exit direction
                const dx = Math.min(circle.position.x - rect.position.x, 
                                  rect.position.x + rect.width - circle.position.x);
                const dy = Math.min(circle.position.y - rect.position.y,
                                  rect.position.y + rect.height - circle.position.y);
                
                if (dx < dy) {
                    info.normal.set(circle.position.x < rectCenter.x ? -1 : 1, 0);
                } else {
                    info.normal.set(0, circle.position.y < rectCenter.y ? -1 : 1);
                }
            }
            
            return true;
        }
        
        return false;
    }
    
    // Rectangle vs Rectangle collision (SAT)
    rectangleVsRectangle(rectA, rectB, info) {
        const axesA = rectA.getAxes();
        const axesB = rectB.getAxes();
        const axes = [...axesA, ...axesB];
        
        let minOverlap = Infinity;
        let minAxis = null;
        
        for (const axis of axes) {
            const projA = rectA.project(axis);
            const projB = rectB.project(axis);
            
            if (!ShapeUtils.projectionsOverlap(projA, projB)) {
                return false; // Separating axis found
            }
            
            const overlap = ShapeUtils.getOverlapAmount(projA, projB);
            if (overlap < minOverlap) {
                minOverlap = overlap;
                minAxis = axis.clone();
            }
        }
        
        if (minAxis) {
            info.hasCollision = true;
            info.penetration = minOverlap;
            info.normal = minAxis;
            
            // Ensure normal points from A to B
            const centerA = rectA.getCenter();
            const centerB = rectB.getCenter();
            const centerDiff = Vector2D.fromPoints(centerA, centerB);
            
            if (info.normal.dot(centerDiff) < 0) {
                info.normal.multiply(-1);
            }
            
            // Calculate contact point (simplified)
            info.contactPoint = centerA.clone().add(centerB).multiply(0.5);
            
            return true;
        }
        
        return false;
    }
    
    // Circle vs Line collision
    circleVsLine(circle, line, info) {
        const closestPoint = line.getClosestPoint(circle.position);
        const distance = circle.position.distance(closestPoint);
        
        if (distance <= circle.radius) {
            info.hasCollision = true;
            info.penetration = circle.radius - distance;
            info.contactPoint = closestPoint.clone();
            
            if (distance > 0) {
                info.normal = Vector2D.fromPoints(closestPoint, circle.position).normalize();
            } else {
                info.normal = line.normal.clone();
            }
            
            return true;
        }
        
        return false;
    }
    
    // Rectangle vs Line collision
    rectangleVsLine(rect, line, info) {
        const vertices = rect.getVertices();
        let minDistance = Infinity;
        let closestVertex = null;
        
        // Check each vertex against the line
        for (const vertex of vertices) {
            const distance = line.getClosestPoint(vertex).distance(vertex);
            if (distance < minDistance) {
                minDistance = distance;
                closestVertex = vertex;
            }
        }
        
        // For simplicity, treat as collision if any vertex is very close to line
        if (minDistance < 1) {
            info.hasCollision = true;
            info.penetration = 1 - minDistance;
            info.contactPoint = closestVertex.clone();
            info.normal = line.normal.clone();
            return true;
        }
        
        return false;
    }
}

// Spatial Hash for broad-phase collision detection
export class SpatialHash {
    constructor(cellSize = 64) {
        this.cellSize = cellSize;
        this.cells = new Map();
    }
    
    clear() {
        this.cells.clear();
    }
    
    insert(shape, id) {
        const bounds = shape.getBounds();
        const cells = this.getCellsForBounds(bounds);
        
        for (const cellKey of cells) {
            if (!this.cells.has(cellKey)) {
                this.cells.set(cellKey, new Set());
            }
            this.cells.get(cellKey).add({ shape, id });
        }
    }
    
    query(bounds) {
        const cells = this.getCellsForBounds(bounds);
        const results = new Set();
        
        for (const cellKey of cells) {
            const cell = this.cells.get(cellKey);
            if (cell) {
                for (const item of cell) {
                    results.add(item);
                }
            }
        }
        
        return Array.from(results);
    }
    
    getCellsForBounds(bounds) {
        const startX = Math.floor(bounds.left / this.cellSize);
        const endX = Math.floor(bounds.right / this.cellSize);
        const startY = Math.floor(bounds.top / this.cellSize);
        const endY = Math.floor(bounds.bottom / this.cellSize);
        
        const cells = [];
        for (let x = startX; x <= endX; x++) {
            for (let y = startY; y <= endY; y++) {
                cells.push(`${x},${y}`);
            }
        }
        
        return cells;
    }
}
```

### 4. Create Physics Engine (js/game/physics/physicsEngine.js)

```javascript
/**
 * Main Physics Engine
 */
import { Vector2D } from '../../utils/vector.js';
import { GAME_CONFIG } from '../../utils/constants.js';
import { CollisionDetector, CollisionInfo, SpatialHash } from './collision.js';
import { Rectangle, Circle, Line } from './shapes.js';

// Physics Body representing a game object
export class PhysicsBody {
    constructor(shape, options = {}) {
        this.shape = shape;
        this.position = shape.position;
        this.velocity = new Vector2D();
        this.acceleration = new Vector2D();
        
        // Physics properties
        this.mass = options.mass || 1;
        this.invMass = this.mass > 0 ? 1 / this.mass : 0;
        this.restitution = options.restitution || 0.8; // Bounciness
        this.friction = options.friction || 0.1;
        this.drag = options.drag || 0.01;
        
        // State flags
        this.isStatic = options.isStatic || false;
        this.isTrigger = options.isTrigger || false;
        this.isActive = true;
        
        // Collision filtering
        this.collisionLayer = options.collisionLayer || 'default';
        this.collisionMask = options.collisionMask || ['default'];
        
        // User data
        this.userData = options.userData || {};
        this.id = options.id || Date.now() + Math.random();
        
        // Internal tracking
        this.forces = [];
        this.impulses = [];
        this.lastPosition = this.position.clone();
    }
    
    // Apply force over time
    applyForce(force) {
        if (!this.isStatic) {
            this.forces.push(force.clone());
        }
    }
    
    // Apply instantaneous impulse
    applyImpulse(impulse) {
        if (!this.isStatic) {
            this.impulses.push(impulse.clone());
        }
    }
    
    // Integration step
    integrate(deltaTime) {
        if (this.isStatic || !this.isActive) return;
        
        this.lastPosition.copy(this.position);
        
        // Apply forces to acceleration
        this.acceleration.set(0, 0);
        for (const force of this.forces) {
            this.acceleration.add(force.clone().multiply(this.invMass));
        }
        
        // Apply impulses to velocity
        for (const impulse of this.impulses) {
            this.velocity.add(impulse.clone().multiply(this.invMass));
        }
        
        // Clear forces and impulses
        this.forces = [];
        this.impulses = [];
        
        // Apply drag
        this.velocity.multiply(1 - this.drag);
        
        // Verlet integration
        this.velocity.add(this.acceleration.clone().multiply(deltaTime));
        this.position.add(this.velocity.clone().multiply(deltaTime));
        
        // Update shape position
        this.shape.position.copy(this.position);
    }
    
    // Set velocity directly
    setVelocity(x, y) {
        this.velocity.set(x, y);
    }
    
    // Get kinetic energy
    getKineticEnergy() {
        return 0.5 * this.mass * this.velocity.magnitudeSquared();
    }
    
    // Check if this body should collide with another
    shouldCollideWith(other) {
        return this.collisionMask.includes(other.collisionLayer);
    }
}

// Main Physics Engine
export class PhysicsEngine {
    constructor() {
        this.bodies = new Map();
        this.staticBodies = new Map();
        this.collisionDetector = new CollisionDetector();
        this.spatialHash = new SpatialHash(64);
        
        // Physics settings
        this.gravity = new Vector2D(0, 0); // No gravity for block breaker
        this.iterations = 4; // Collision resolution iterations
        this.timeAccumulator = 0;
        this.fixedTimeStep = 1 / 60; // 60 FPS physics
        
        // Collision callbacks
        this.collisionCallbacks = new Map();
        this.triggerCallbacks = new Map();
        
        // Performance tracking
        this.performanceStats = {
            activeBodies: 0,
            collisionChecks: 0,
            collisionsResolved: 0,
            updateTime: 0
        };
    }
    
    // Add physics body to the world
    addBody(body) {
        if (body.isStatic) {
            this.staticBodies.set(body.id, body);
        } else {
            this.bodies.set(body.id, body);
        }
        return body.id;
    }
    
    // Remove physics body
    removeBody(id) {
        return this.bodies.delete(id) || this.staticBodies.delete(id);
    }
    
    // Get body by ID
    getBody(id) {
        return this.bodies.get(id) || this.staticBodies.get(id);
    }
    
    // Main physics update
    update(deltaTime) {
        const startTime = performance.now();
        
        this.timeAccumulator += deltaTime;
        
        // Fixed timestep simulation
        while (this.timeAccumulator >= this.fixedTimeStep) {
            this.fixedUpdate(this.fixedTimeStep);
            this.timeAccumulator -= this.fixedTimeStep;
        }
        
        // Update performance stats
        this.performanceStats.updateTime = performance.now() - startTime;
        this.performanceStats.activeBodies = this.bodies.size;
    }
    
    fixedUpdate(deltaTime) {
        // Clear spatial hash
        this.spatialHash.clear();
        this.performanceStats.collisionChecks = 0;
        this.performanceStats.collisionsResolved = 0;
        
        // Integrate all dynamic bodies
        for (const body of this.bodies.values()) {
            if (body.isActive) {
                // Apply gravity (if any)
                if (this.gravity.magnitudeSquared() > 0) {
                    body.applyForce(this.gravity.clone().multiply(body.mass));
                }
                
                body.integrate(deltaTime);
                
                // Add to spatial hash
                this.spatialHash.insert(body.shape, body.id);
            }
        }
        
        // Add static bodies to spatial hash
        for (const body of this.staticBodies.values()) {
            this.spatialHash.insert(body.shape, body.id);
        }
        
        // Collision detection and resolution
        this.resolveCollisions();
    }
    
    resolveCollisions() {
        const collisionInfo = new CollisionInfo();
        const processedPairs = new Set();
        
        // Check collisions for all dynamic bodies
        for (const bodyA of this.bodies.values()) {
            if (!bodyA.isActive) continue;
            
            const candidates = this.spatialHash.query(bodyA.shape.getBounds());
            
            for (const candidate of candidates) {
                const bodyB = this.getBody(candidate.id);
                if (!bodyB || bodyA.id === bodyB.id) continue;
                
                // Check if we've already processed this pair
                const pairKey = bodyA.id < bodyB.id ? 
                    `${bodyA.id}-${bodyB.id}` : `${bodyB.id}-${bodyA.id}`;
                
                if (processedPairs.has(pairKey)) continue;
                processedPairs.add(pairKey);
                
                // Check collision filtering
                if (!bodyA.shouldCollideWith(bodyB) && !bodyB.shouldCollideWith(bodyA)) {
                    continue;
                }
                
                this.performanceStats.collisionChecks++;
                
                // Detect collision
                if (this.collisionDetector.checkCollision(bodyA.shape, bodyB.shape, collisionInfo)) {
                    if (bodyA.isTrigger || bodyB.isTrigger) {
                        this.handleTrigger(bodyA, bodyB, collisionInfo);
                    } else {
                        this.resolveCollision(bodyA, bodyB, collisionInfo);
                        this.performanceStats.collisionsResolved++;
                    }
                    
                    // Call collision callbacks
                    this.callCollisionCallbacks(bodyA, bodyB, collisionInfo);
                }
            }
        }
    }
    
    resolveCollision(bodyA, bodyB, collisionInfo) {
        // Separate the bodies
        this.separateBodies(bodyA, bodyB, collisionInfo);
        
        // Resolve velocity
        this.resolveVelocity(bodyA, bodyB, collisionInfo);
    }
    
    separateBodies(bodyA, bodyB, collisionInfo) {
        const totalInvMass = bodyA.invMass + bodyB.invMass;
        if (totalInvMass === 0) return; // Both bodies are static
        
        const separationVector = collisionInfo.normal.clone()
            .multiply(collisionInfo.penetration);
        
        // Move bodies apart proportional to their inverse masses
        const bodyAMove = separationVector.clone()
            .multiply(bodyA.invMass / totalInvMass);
        const bodyBMove = separationVector.clone()
            .multiply(-bodyB.invMass / totalInvMass);
        
        if (!bodyA.isStatic) {
            bodyA.position.add(bodyAMove);
            bodyA.shape.position.copy(bodyA.position);
        }
        
        if (!bodyB.isStatic) {
            bodyB.position.add(bodyBMove);
            bodyB.shape.position.copy(bodyB.position);
        }
    }
    
    resolveVelocity(bodyA, bodyB, collisionInfo) {
        // Relative velocity
        const relativeVelocity = bodyA.velocity.clone().subtract(bodyB.velocity);
        const velocityAlongNormal = relativeVelocity.dot(collisionInfo.normal);
        
        // Objects are separating
        if (velocityAlongNormal > 0) return;
        
        // Calculate restitution
        const restitution = Math.min(bodyA.restitution, bodyB.restitution);
        
        // Calculate impulse scalar
        let impulseScalar = -(1 + restitution) * velocityAlongNormal;
        impulseScalar /= bodyA.invMass + bodyB.invMass;
        
        // Apply impulse
        const impulse = collisionInfo.normal.clone().multiply(impulseScalar);
        
        if (!bodyA.isStatic) {
            bodyA.velocity.add(impulse.clone().multiply(bodyA.invMass));
        }
        
        if (!bodyB.isStatic) {
            bodyB.velocity.subtract(impulse.clone().multiply(bodyB.invMass));
        }
        
        // Apply friction
        this.applyFriction(bodyA, bodyB, collisionInfo, impulseScalar);
    }
    
    applyFriction(bodyA, bodyB, collisionInfo, normalImpulse) {
        const relativeVelocity = bodyA.velocity.clone().subtract(bodyB.velocity);
        const tangent = relativeVelocity.clone()
            .subtract(collisionInfo.normal.clone().multiply(relativeVelocity.dot(collisionInfo.normal)))
            .normalize();
        
        const velocityAlongTangent = relativeVelocity.dot(tangent);
        
        if (Math.abs(velocityAlongTangent) < 0.01) return;
        
        const friction = Math.sqrt(bodyA.friction * bodyB.friction);
        let frictionImpulse = -velocityAlongTangent / (bodyA.invMass + bodyB.invMass);
        
        // Clamp friction
        if (Math.abs(frictionImpulse) > Math.abs(normalImpulse) * friction) {
            frictionImpulse = normalImpulse * friction * Math.sign(frictionImpulse);
        }
        
        const frictionVector = tangent.multiply(frictionImpulse);
        
        if (!bodyA.isStatic) {
            bodyA.velocity.add(frictionVector.clone().multiply(bodyA.invMass));
        }
        
        if (!bodyB.isStatic) {
            bodyB.velocity.subtract(frictionVector.clone().multiply(bodyB.invMass));
        }
    }
    
    handleTrigger(bodyA, bodyB, collisionInfo) {
        // Triggers don't affect physics, just call callbacks
        this.callTriggerCallbacks(bodyA, bodyB, collisionInfo);
    }
    
    // Callback system
    addCollisionCallback(bodyId, callback) {
        if (!this.collisionCallbacks.has(bodyId)) {
            this.collisionCallbacks.set(bodyId, []);
        }
        this.collisionCallbacks.get(bodyId).push(callback);
    }
    
    addTriggerCallback(bodyId, callback) {
        if (!this.triggerCallbacks.has(bodyId)) {
            this.triggerCallbacks.set(bodyId, []);
        }
        this.triggerCallbacks.get(bodyId).push(callback);
    }
    
    callCollisionCallbacks(bodyA, bodyB, collisionInfo) {
        this.callCallbacks(this.collisionCallbacks, bodyA, bodyB, collisionInfo);
    }
    
    callTriggerCallbacks(bodyA, bodyB, collisionInfo) {
        this.callCallbacks(this.triggerCallbacks, bodyA, bodyB, collisionInfo);
    }
    
    callCallbacks(callbackMap, bodyA, bodyB, collisionInfo) {
        const callbacksA = callbackMap.get(bodyA.id);
        const callbacksB = callbackMap.get(bodyB.id);
        
        if (callbacksA) {
            for (const callback of callbacksA) {
                try {
                    callback(bodyA, bodyB, collisionInfo);
                } catch (error) {
                    console.error('Error in collision callback:', error);
                }
            }
        }
        
        if (callbacksB) {
            for (const callback of callbacksB) {
                try {
                    callback(bodyB, bodyA, collisionInfo);
                } catch (error) {
                    console.error('Error in collision callback:', error);
                }
            }
        }
    }
    
    // Utility methods
    createBall(x, y, radius, options = {}) {
        const circle = new Circle(x, y, radius);
        const body = new PhysicsBody(circle, {
            mass: options.mass || 1,
            restitution: options.restitution || 0.9,
            friction: options.friction || 0.1,
            ...options
        });
        return body;
    }
    
    createBlock(x, y, width, height, options = {}) {
        const rect = new Rectangle(x, y, width, height);
        const body = new PhysicsBody(rect, {
            isStatic: true,
            restitution: options.restitution || 0.8,
            ...options
        });
        return body;
    }
    
    createPaddle(x, y, width, height, options = {}) {
        const rect = new Rectangle(x, y, width, height);
        const body = new PhysicsBody(rect, {
            isStatic: true,
            restitution: options.restitution || 1.0,
            ...options
        });
        return body;
    }
    
    createWall(x1, y1, x2, y2, options = {}) {
        const line = new Line(x1, y1, x2, y2);
        const body = new PhysicsBody(line, {
            isStatic: true,
            restitution: options.restitution || 1.0,
            ...options
        });
        return body;
    }
    
    // Performance monitoring
    getPerformanceStats() {
        return { ...this.performanceStats };
    }
    
    // Debug helpers
    getAllBodies() {
        return [
            ...Array.from(this.bodies.values()),
            ...Array.from(this.staticBodies.values())
        ];
    }
    
    clear() {
        this.bodies.clear();
        this.staticBodies.clear();
        this.spatialHash.clear();
        this.collisionCallbacks.clear();
        this.triggerCallbacks.clear();
    }
}
```

### 5. Create Helpers Utility (js/utils/helpers.js)

```javascript
/**
 * Helper Functions and Utilities
 */

// Math utilities
export const MathUtils = {
    // Clamp value between min and max
    clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    },
    
    // Linear interpolation
    lerp(a, b, t) {
        return a + (b - a) * t;
    },
    
    // Map value from one range to another
    map(value, inMin, inMax, outMin, outMax) {
        return outMin + (outMax - outMin) * ((value - inMin) / (inMax - inMin));
    },
    
    // Random between min and max
    random(min = 0, max = 1) {
        return min + Math.random() * (max - min);
    },
    
    // Random integer between min and max (inclusive)
    randomInt(min, max) {
        return Math.floor(this.random(min, max + 1));
    },
    
    // Degrees to radians
    toRadians(degrees) {
        return degrees * Math.PI / 180;
    },
    
    // Radians to degrees
    toDegrees(radians) {
        return radians * 180 / Math.PI;
    },
    
    // Check if number is approximately equal
    approximately(a, b, tolerance = 0.001) {
        return Math.abs(a - b) <= tolerance;
    },
    
    // Sign of number
    sign(value) {
        return value > 0 ? 1 : value < 0 ? -1 : 0;
    }
};

// Color utilities
export const ColorUtils = {
    // Convert HSL to RGB
    hslToRgb(h, s, l) {
        h /= 360;
        s /= 100;
        l /= 100;
        
        const hue2rgb = (p, q, t) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1/6) return p + (q - p) * 6 * t;
            if (t < 1/2) return q;
            if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        };
        
        let r, g, b;
        
        if (s === 0) {
            r = g = b = l;
        } else {
            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;
            r = hue2rgb(p, q, h + 1/3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1/3);
        }
        
        return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
    },
    
    // Convert RGB to hex
    rgbToHex(r, g, b) {
        return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
    },
    
    // Interpolate between two colors
    lerpColor(color1, color2, t) {
        // Simple RGB interpolation
        const r1 = parseInt(color1.slice(1, 3), 16);
        const g1 = parseInt(color1.slice(3, 5), 16);
        const b1 = parseInt(color1.slice(5, 7), 16);
        
        const r2 = parseInt(color2.slice(1, 3), 16);
        const g2 = parseInt(color2.slice(3, 5), 16);
        const b2 = parseInt(color2.slice(5, 7), 16);
        
        const r = Math.round(MathUtils.lerp(r1, r2, t));
        const g = Math.round(MathUtils.lerp(g1, g2, t));
        const b = Math.round(MathUtils.lerp(b1, b2, t));
        
        return this.rgbToHex(r, g, b);
    }
};

// Timing utilities
export const TimeUtils = {
    // Simple timer class
    createTimer(duration, callback) {
        return {
            duration,
            elapsed: 0,
            callback,
            isComplete: false,
            
            update(deltaTime) {
                if (this.isComplete) return;
                
                this.elapsed += deltaTime;
                if (this.elapsed >= this.duration) {
                    this.isComplete = true;
                    if (this.callback) {
                        this.callback();
                    }
                }
            },
            
            reset() {
                this.elapsed = 0;
                this.isComplete = false;
            },
            
            getProgress() {
                return MathUtils.clamp(this.elapsed / this.duration, 0, 1);
            }
        };
    },
    
    // Debounce function
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
};

// Array utilities
export const ArrayUtils = {
    // Remove item from array
    remove(array, item) {
        const index = array.indexOf(item);
        if (index > -1) {
            array.splice(index, 1);
            return true;
        }
        return false;
    },
    
    // Shuffle array in place
    shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    },
    
    // Get random item from array
    randomItem(array) {
        return array[Math.floor(Math.random() * array.length)];
    },
    
    // Chunk array into smaller arrays
    chunk(array, size) {
        const chunks = [];
        for (let i = 0; i < array.length; i += size) {
            chunks.push(array.slice(i, i + size));
        }
        return chunks;
    }
};

// Object utilities
export const ObjectUtils = {
    // Deep clone object
    deepClone(obj) {
        if (obj === null || typeof obj !== 'object') return obj;
        if (obj instanceof Date) return new Date(obj.getTime());
        if (obj instanceof Array) return obj.map(item => this.deepClone(item));
        
        const cloned = {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                cloned[key] = this.deepClone(obj[key]);
            }
        }
        return cloned;
    },
    
    // Merge objects
    merge(target, ...sources) {
        if (!sources.length) return target;
        const source = sources.shift();
        
        if (this.isObject(target) && this.isObject(source)) {
            for (const key in source) {
                if (this.isObject(source[key])) {
                    if (!target[key]) Object.assign(target, { [key]: {} });
                    this.merge(target[key], source[key]);
                } else {
                    Object.assign(target, { [key]: source[key] });
                }
            }
        }
        
        return this.merge(target, ...sources);
    },
    
    // Check if value is object
    isObject(item) {
        return item && typeof item === 'object' && !Array.isArray(item);
    }
};

// Performance utilities
export const PerformanceUtils = {
    // Simple performance monitor
    createMonitor(name) {
        return {
            name,
            samples: [],
            maxSamples: 60,
            
            start() {
                this.startTime = performance.now();
            },
            
            end() {
                if (this.startTime) {
                    const duration = performance.now() - this.startTime;
                    this.samples.push(duration);
                    
                    if (this.samples.length > this.maxSamples) {
                        this.samples.shift();
                    }
                    
                    this.startTime = null;
                    return duration;
                }
                return 0;
            },
            
            getAverage() {
                if (this.samples.length === 0) return 0;
                return this.samples.reduce((sum, sample) => sum + sample, 0) / this.samples.length;
            },
            
            getMax() {
                return this.samples.length > 0 ? Math.max(...this.samples) : 0;
            },
            
            clear() {
                this.samples = [];
            }
        };
    }
};
```

### 6. Test Physics Engine

Create `test-physics.html`:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Physics Engine Test</title>
    <style>
        body { margin: 0; padding: 20px; background: #0f0f23; color: white; font-family: Arial, sans-serif; }
        canvas { border: 2px solid #6366f1; border-radius: 8px; }
        .controls { margin: 20px 0; }
        button { background: #6366f1; color: white; border: none; padding: 10px 20px; margin: 5px; border-radius: 4px; cursor: pointer; }
        button:hover { background: #4f46e5; }
        .stats { margin: 20px 0; font-family: monospace; font-size: 12px; }
    </style>
</head>
<body>
    <h1>Physics Engine Test</h1>
    <canvas id="physics-canvas" width="800" height="600"></canvas>
    
    <div class="controls">
        <button onclick="addBall()">Add Ball</button>
        <button onclick="addBlock()">Add Block</button>
        <button onclick="resetScene()">Reset</button>
        <button onclick="toggleDebug()">Toggle Debug</button>
    </div>
    
    <div class="stats" id="stats"></div>
    
    <script type="module">
        import { PhysicsEngine, PhysicsBody } from './js/game/physics/physicsEngine.js';
        import { Circle, Rectangle } from './js/game/physics/shapes.js';
        import { Renderer } from './js/game/core/renderer.js';
        import { GAME_CONFIG, COLORS } from './js/utils/constants.js';
        import { Vector2D } from './js/utils/vector.js';
        import { MathUtils } from './js/utils/helpers.js';
        
        const canvas = document.getElementById('physics-canvas');
        const renderer = new Renderer(canvas);
        const physics = new PhysicsEngine();
        
        let isRunning = true;
        let showDebug = true;
        let ballCount = 0;
        let blockCount = 0;
        
        // Create walls
        const walls = [
            physics.createWall(0, 0, canvas.width, 0), // Top
            physics.createWall(canvas.width, 0, canvas.width, canvas.height), // Right
            physics.createWall(canvas.width, canvas.height, 0, canvas.height), // Bottom
            physics.createWall(0, canvas.height, 0, 0) // Left
        ];
        
        walls.forEach(wall => physics.addBody(wall));
        
        // Add initial ball
        const ball = physics.createBall(400, 300, 10, {
            restitution: 0.9,
            userData: { type: 'ball', color: COLORS.BALL }
        });
        ball.setVelocity(200, -150);
        physics.addBody(ball);
        ballCount++;
        
        // Add some test blocks
        for (let i = 0; i < 5; i++) {
            for (let j = 0; j < 3; j++) {
                const block = physics.createBlock(
                    100 + i * 120, 
                    50 + j * 40, 
                    100, 30, {
                        userData: { 
                            type: 'block', 
                            color: COLORS.BLOCK_NORMAL,
                            id: `block_${blockCount++}`
                        }
                    }
                );
                physics.addBody(block);
            }
        }
        
        // Collision callback
        physics.addCollisionCallback(ball.id, (bodyA, bodyB, collisionInfo) => {
            if (bodyB.userData.type === 'block') {
                // Remove block on collision
                physics.removeBody(bodyB.id);
                console.log('Block destroyed!');
            }
        });
        
        function gameLoop() {
            if (!isRunning) return;
            
            const deltaTime = 1/60; // Fixed timestep for testing
            
            // Update physics
            physics.update(deltaTime);
            
            // Render
            renderer.clear();
            
            // Background
            renderer.addToLayer(GAME_CONFIG.LAYERS.BACKGROUND, {
                type: 'rectangle',
                x: 0, y: 0,
                width: canvas.width,
                height: canvas.height,
                fillColor: '#1a1a2e'
            });
            
            // Render all physics bodies
            const bodies = physics.getAllBodies();
            for (const body of bodies) {
                let layer = GAME_CONFIG.LAYERS.BLOCKS;
                let renderObj = null;
                
                if (body.shape.type === 'circle') {
                    layer = GAME_CONFIG.LAYERS.BALL;
                    renderObj = {
                        type: 'circle',
                        x: body.position.x,
                        y: body.position.y,
                        radius: body.shape.radius,
                        fillColor: body.userData.color || COLORS.BALL,
                        strokeColor: showDebug ? '#ffffff' : null,
                        strokeWidth: 1
                    };
                } else if (body.shape.type === 'rectangle') {
                    renderObj = {
                        type: 'rectangle',
                        x: body.position.x,
                        y: body.position.y,
                        width: body.shape.width,
                        height: body.shape.height,
                        fillColor: body.userData.color || COLORS.BLOCK_NORMAL,
                        strokeColor: showDebug ? '#ffffff' : null,
                        strokeWidth: 1
                    };
                } else if (body.shape.type === 'line') {
                    layer = GAME_CONFIG.LAYERS.BACKGROUND;
                    renderObj = {
                        type: 'line',
                        x1: body.shape.start.x,
                        y1: body.shape.start.y,
                        x2: body.shape.end.x,
                        y2: body.shape.end.y,
                        strokeColor: showDebug ? '#666666' : 'transparent',
                        strokeWidth: 2
                    };
                }
                
                if (renderObj) {
                    renderer.addToLayer(layer, renderObj);
                    
                    // Debug velocity vectors
                    if (showDebug && !body.isStatic && body.velocity.magnitude() > 0) {
                        const vel = body.velocity.clone().normalize().multiply(30);
                        renderer.addToLayer(GAME_CONFIG.LAYERS.UI_OVERLAY, {
                            type: 'line',
                            x1: body.position.x,
                            y1: body.position.y,
                            x2: body.position.x + vel.x,
                            y2: body.position.y + vel.y,
                            strokeColor: '#ff0000',
                            strokeWidth: 2
                        });
                    }
                }
            }
            
            // Debug info
            if (showDebug) {
                const stats = physics.getPerformanceStats();
                renderer.addToLayer(GAME_CONFIG.LAYERS.UI_OVERLAY, {
                    type: 'text',
                    x: 10, y: 10,
                    text: `Bodies: ${stats.activeBodies} | Collisions: ${stats.collisionsResolved}`,
                    fillColor: '#10b981',
                    font: '14px monospace'
                });
                
                renderer.addToLayer(GAME_CONFIG.LAYERS.UI_OVERLAY, {
                    type: 'text',
                    x: 10, y: 30,
                    text: `Physics Time: ${stats.updateTime.toFixed(2)}ms`,
                    fillColor: '#f59e0b',
                    font: '14px monospace'
                });
            }
            
            renderer.render();
            requestAnimationFrame(gameLoop);
        }
        
        window.addBall = () => {
            const ball = physics.createBall(
                MathUtils.random(50, canvas.width - 50),
                MathUtils.random(50, 200),
                MathUtils.random(5, 15),
                {
                    restitution: MathUtils.random(0.7, 0.95),
                    userData: { 
                        type: 'ball', 
                        color: `hsl(${MathUtils.random(0, 360)}, 70%, 60%)` 
                    }
                }
            );
            ball.setVelocity(
                MathUtils.random(-300, 300),
                MathUtils.random(-200, -50)
            );
            physics.addBody(ball);
            ballCount++;
        };
        
        window.addBlock = () => {
            const block = physics.createBlock(
                MathUtils.random(50, canvas.width - 150),
                MathUtils.random(50, 300),
                MathUtils.random(50, 100),
                MathUtils.random(20, 40),
                {
                    userData: { 
                        type: 'block', 
                        color: `hsl(${MathUtils.random(0, 360)}, 50%, 50%)`,
                        id: `block_${blockCount++}`
                    }
                }
            );
            physics.addBody(block);
        };
        
        window.resetScene = () => {
            physics.clear();
            ballCount = 0;
            blockCount = 0;
            
            // Re-add walls
            walls.forEach(wall => physics.addBody(wall));
        };
        
        window.toggleDebug = () => {
            showDebug = !showDebug;
        };
        
        // Start the simulation
        gameLoop();
    </script>
</body>
</html>
```

### 7. Commit Changes

```bash
git add .
git commit -m "feat(physics): Implement comprehensive physics engine

- Add collision shapes (Rectangle, Circle, Line) with full geometric operations
- Implement SAT collision detection with precise contact point calculation
- Create spatial hash broad-phase optimization for performance
- Build physics body system with realistic properties (mass, restitution, friction)
- Add collision response with proper impulse resolution and separation
- Implement callback system for collision and trigger events
- Create utility factories for common game objects (ball, block, paddle, wall)
- Add comprehensive helper utilities for math, color, timing, and performance
- Include physics test environment with interactive debugging tools"
```

### 8. Merge Feature Branch

```bash
git checkout main
git merge feature/physics-engine
git branch -d feature/physics-engine
```

## Testing & Verification

### 1. Physics Functionality
- ✅ Open `test-physics.html`
- ✅ Ball should bounce realistically off walls and blocks
- ✅ Blocks should disappear when hit by ball
- ✅ Add new balls and blocks - physics should remain stable
- ✅ Debug vectors should show ball velocity when enabled

### 2. Performance Testing
- ✅ Add multiple balls (10+) - should maintain 60 FPS
- ✅ Physics update time should stay under 5ms
- ✅ Collision detection should be efficient with spatial hash

### 3. Integration Testing
- ✅ Open `index.html` - game loop should still work
- ✅ No console errors
- ✅ State management unaffected

## Success Criteria

✅ **Accurate collision detection between all shape types**  
✅ **Realistic ball physics with proper bouncing**  
✅ **Efficient spatial hash broad-phase collision**  
✅ **Stable physics simulation at 60 FPS**  
✅ **Proper separation and impulse resolution**  
✅ **Collision callback system functional**  
✅ **Helper utilities comprehensive and tested**  
✅ **Debug visualization working correctly**  
✅ **Memory management efficient**  
✅ **No physics glitches or tunneling**

## Next Step
Proceed to `instructions/step-06-paddle-ball.md`