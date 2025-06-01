/**
 * Physics Engine for Block Breaker Revolution
 * Handles collision detection, physics bodies, and movement calculations
 */

import { Vector2D } from '../../utils/vector.js';
import { GAME_CONFIG } from '../../utils/constants.js';

/**
 * Physics Body class representing any object that can participate in physics
 */
export class PhysicsBody {
    constructor(x, y, width, height, type = 'static') {
        this.position = new Vector2D(x, y);
        this.velocity = new Vector2D(0, 0);
        this.acceleration = new Vector2D(0, 0);
        this.size = new Vector2D(width, height);
        this.type = type; // 'static', 'dynamic', 'kinematic'
        this.mass = 1;
        this.restitution = 0.8; // Bounciness factor
        this.friction = 0.1;
        this.isActive = true;
        this.id = Math.random().toString(36).substr(2, 9);
        
        // Collision properties
        this.bounds = {
            left: x,
            right: x + width,
            top: y,
            bottom: y + height
        };
        
        // Collision cooldown to prevent rapid repeated collisions
        this.collisionCooldowns = new Map();
        this.collisionCooldownTime = 0.25; // 250ms cooldown for better separation
        
        // Callbacks
        this.onCollision = null;
        this.onBoundaryHit = null;
    }
    
    /**
     * Update physics body position and velocity
     */
    update(deltaTime) {
        if (this.type === 'static') return;
        
        // Update collision cooldowns
        this.updateCollisionCooldowns(deltaTime);
        
        // Apply acceleration to velocity
        this.velocity.add(Vector2D.multiply(this.acceleration, deltaTime));
        
        // Apply friction
        if (this.type === 'dynamic') {
            this.velocity.multiply(1 - this.friction * deltaTime);
        }
        
        // Update position based on velocity
        const deltaPosition = Vector2D.multiply(this.velocity, deltaTime);
        this.position.add(deltaPosition);
        
        // Update bounds
        this.updateBounds();
        
        // Reset acceleration for next frame
        this.acceleration.set(0, 0);
    }
    
    /**
     * Update collision cooldowns
     */
    updateCollisionCooldowns(deltaTime) {
        for (const [bodyId, cooldown] of this.collisionCooldowns.entries()) {
            const newCooldown = cooldown - deltaTime;
            if (newCooldown <= 0) {
                this.collisionCooldowns.delete(bodyId);
            } else {
                this.collisionCooldowns.set(bodyId, newCooldown);
            }
        }
    }
    
    /**
     * Check if collision with another body is on cooldown
     */
    isCollisionOnCooldown(otherId) {
        return this.collisionCooldowns.has(otherId);
    }
    
    /**
     * Set collision cooldown with another body
     */
    setCollisionCooldown(otherId) {
        this.collisionCooldowns.set(otherId, this.collisionCooldownTime);
    }
    
    /**
     * Update collision bounds based on current position
     */
    updateBounds() {
        this.bounds.left = this.position.x;
        this.bounds.right = this.position.x + this.size.x;
        this.bounds.top = this.position.y;
        this.bounds.bottom = this.position.y + this.size.y;
    }
    
    /**
     * Apply force to the physics body
     */
    applyForce(force) {
        if (this.type === 'static') return;
        
        const acceleration = Vector2D.divide(force, this.mass);
        this.acceleration.add(acceleration);
    }
    
    /**
     * Set velocity directly
     */
    setVelocity(x, y) {
        this.velocity.set(x, y);
    }
    
    /**
     * Get center position of the body
     */
    getCenter() {
        return new Vector2D(
            this.position.x + this.size.x / 2,
            this.position.y + this.size.y / 2
        );
    }
    
    /**
     * Check if point is inside this body
     */
    containsPoint(x, y) {
        return x >= this.bounds.left && x <= this.bounds.right &&
               y >= this.bounds.top && y <= this.bounds.bottom;
    }
}

/**
 * Collision detection and response system
 */
export class CollisionSystem {
    constructor() {
        this.bodies = new Map();
        this.collisionPairs = [];
    }
    
    /**
     * Add physics body to collision system
     */
    addBody(body) {
        this.bodies.set(body.id, body);
    }
    
    /**
     * Remove physics body from collision system
     */
    removeBody(bodyId) {
        this.bodies.delete(bodyId);
    }
    
    /**
     * Check collision between two AABB (Axis-Aligned Bounding Box) bodies
     */
    checkAABBCollision(bodyA, bodyB) {
        return !(bodyA.bounds.right < bodyB.bounds.left ||
                bodyA.bounds.left > bodyB.bounds.right ||
                bodyA.bounds.bottom < bodyB.bounds.top ||
                bodyA.bounds.top > bodyB.bounds.bottom);
    }
    
    /**
     * Check collision between circle and AABB
     */
    checkCircleAABBCollision(circle, aabb) {
        const circleCenter = circle.getCenter();
        const radius = circle.size.x / 2; // Assuming circle size.x is diameter
        
        // Find closest point on AABB to circle center
        const closestX = Math.max(aabb.bounds.left, Math.min(circleCenter.x, aabb.bounds.right));
        const closestY = Math.max(aabb.bounds.top, Math.min(circleCenter.y, aabb.bounds.bottom));
        
        // Calculate distance between circle center and closest point
        const distance = Vector2D.distance(circleCenter, new Vector2D(closestX, closestY));
        
        return distance < radius;
    }
    
    /**
     * Get collision normal vector for circle-AABB collision
     */
    getCircleAABBNormal(circle, aabb) {
        const circleCenter = circle.getCenter();
        const aabbCenter = aabb.getCenter();
        
        // Calculate overlap on each axis
        const overlapX = Math.min(
            circle.bounds.right - aabb.bounds.left,
            aabb.bounds.right - circle.bounds.left
        );
        const overlapY = Math.min(
            circle.bounds.bottom - aabb.bounds.top,
            aabb.bounds.bottom - circle.bounds.top
        );
        
        // Return normal based on smallest overlap
        if (overlapX < overlapY) {
            return new Vector2D(circleCenter.x < aabbCenter.x ? -1 : 1, 0);
        } else {
            return new Vector2D(0, circleCenter.y < aabbCenter.y ? -1 : 1);
        }
    }
    
    /**
     * Resolve collision between two bodies
     */
    resolveCollision(bodyA, bodyB, normal) {
        // Calculate relative velocity
        const relativeVelocity = Vector2D.subtract(bodyA.velocity, bodyB.velocity);
        const velocityAlongNormal = Vector2D.dot(relativeVelocity, normal);
        
        // Don't resolve if velocities are separating
        if (velocityAlongNormal > 0) return;
        
        // Calculate restitution
        const restitution = Math.min(bodyA.restitution, bodyB.restitution);
        
        // Calculate impulse scalar
        let impulseScalar = -(1 + restitution) * velocityAlongNormal;
        impulseScalar /= (1 / bodyA.mass) + (1 / bodyB.mass);
        
        // Apply impulse
        const impulse = Vector2D.multiply(normal, impulseScalar);
        
        if (bodyA.type !== 'static') {
            const impulseA = Vector2D.divide(impulse, bodyA.mass);
            bodyA.velocity.add(impulseA);
        }
        
        if (bodyB.type !== 'static') {
            const impulseB = Vector2D.divide(impulse, bodyB.mass);
            bodyB.velocity.subtract(impulseB);
        }
        
        // Separate overlapping bodies to prevent sticking
        this.separateBodies(bodyA, bodyB, normal);
    }
    
    /**
     * Separate overlapping bodies to prevent collision sticking
     */
    separateBodies(bodyA, bodyB, normal) {
        // Calculate overlap
        let overlap = 0;
        
        if (bodyA.type === 'circle' && bodyB.type === 'rectangle') {
            const circleCenter = bodyA.getCenter();
            const radius = bodyA.size.x / 2;
            
            // Find closest point on rectangle to circle center
            const closestX = Math.max(bodyB.bounds.left, Math.min(circleCenter.x, bodyB.bounds.right));
            const closestY = Math.max(bodyB.bounds.top, Math.min(circleCenter.y, bodyB.bounds.bottom));
            
            const distance = Vector2D.distance(circleCenter, new Vector2D(closestX, closestY));
            overlap = radius - distance;
        } else if (bodyA.type === 'rectangle' && bodyB.type === 'circle') {
            const circleCenter = bodyB.getCenter();
            const radius = bodyB.size.x / 2;
            
            // Find closest point on rectangle to circle center
            const closestX = Math.max(bodyA.bounds.left, Math.min(circleCenter.x, bodyA.bounds.right));
            const closestY = Math.max(bodyA.bounds.top, Math.min(circleCenter.y, bodyA.bounds.bottom));
            
            const distance = Vector2D.distance(circleCenter, new Vector2D(closestX, closestY));
            overlap = radius - distance;
        } else {
            // AABB vs AABB overlap
            const overlapX = Math.min(
                bodyA.bounds.right - bodyB.bounds.left,
                bodyB.bounds.right - bodyA.bounds.left
            );
            const overlapY = Math.min(
                bodyA.bounds.bottom - bodyB.bounds.top,
                bodyB.bounds.bottom - bodyA.bounds.top
            );
            overlap = Math.min(overlapX, overlapY);
        }
        
        if (overlap > 0) {
            // Much more aggressive separation to prevent sticking
            const separationDistance = overlap + 5; // Large buffer to ensure complete separation
            const separation = Vector2D.multiply(normal, separationDistance);
            
            // Apply separation with higher priority to dynamic bodies
            if (bodyA.type !== 'static' && bodyB.type !== 'static') {
                // Both dynamic - split separation
                const halfSeparation = Vector2D.multiply(separation, 0.5);
                bodyA.position.add(halfSeparation);
                bodyB.position.subtract(halfSeparation);
            } else if (bodyA.type !== 'static') {
                // Only A is dynamic
                bodyA.position.add(separation);
            } else if (bodyB.type !== 'static') {
                // Only B is dynamic
                bodyB.position.subtract(separation);
            }
            
            // Update bounds after separation
            if (bodyA.type !== 'static') bodyA.updateBounds();
            if (bodyB.type !== 'static') bodyB.updateBounds();
        }
    }
    
    /**
     * Check and resolve all collisions
     */
    update() {
        this.collisionPairs = [];
        const bodiesArray = Array.from(this.bodies.values());
        
        // Check all body pairs for collisions
        for (let i = 0; i < bodiesArray.length; i++) {
            for (let j = i + 1; j < bodiesArray.length; j++) {
                const bodyA = bodiesArray[i];
                const bodyB = bodiesArray[j];
                
                if (!bodyA.isActive || !bodyB.isActive) continue;
                
                // Check collision cooldowns first to prevent any processing during cooldown
                const bodyAOnCooldown = bodyA.isCollisionOnCooldown(bodyB.id);
                const bodyBOnCooldown = bodyB.isCollisionOnCooldown(bodyA.id);
                
                if (bodyAOnCooldown || bodyBOnCooldown) continue;
                
                let isColliding = false;
                let normal = null;
                
                // Determine collision type and check
                if (bodyA.type === 'circle' && bodyB.type === 'rectangle') {
                    isColliding = this.checkCircleAABBCollision(bodyA, bodyB);
                    if (isColliding) {
                        normal = this.getCircleAABBNormal(bodyA, bodyB);
                    }
                } else if (bodyA.type === 'rectangle' && bodyB.type === 'circle') {
                    isColliding = this.checkCircleAABBCollision(bodyB, bodyA);
                    if (isColliding) {
                        normal = Vector2D.multiply(this.getCircleAABBNormal(bodyB, bodyA), -1);
                    }
                } else {
                    // AABB vs AABB collision
                    isColliding = this.checkAABBCollision(bodyA, bodyB);
                    if (isColliding) {
                        const centerA = bodyA.getCenter();
                        const centerB = bodyB.getCenter();
                        normal = Vector2D.subtract(centerA, centerB).normalize();
                    }
                }
                
                if (isColliding) {
                    this.collisionPairs.push({ bodyA, bodyB, normal });
                    
                    // Set collision cooldowns
                    bodyA.setCollisionCooldown(bodyB.id);
                    bodyB.setCollisionCooldown(bodyA.id);
                    
                    // Resolve collision
                    this.resolveCollision(bodyA, bodyB, normal);
                    
                    // Call collision callbacks
                    if (bodyA.onCollision) bodyA.onCollision(bodyB, normal);
                    if (bodyB.onCollision) bodyB.onCollision(bodyA, Vector2D.multiply(normal, -1));
                }
            }
        }
    }
}

/**
 * Main Physics Engine class
 */
export class PhysicsEngine {
    constructor() {
        this.collisionSystem = new CollisionSystem();
        this.gravity = new Vector2D(0, GAME_CONFIG.PHYSICS.GRAVITY);
        this.worldBounds = {
            left: 0,
            right: GAME_CONFIG.CANVAS.WIDTH,
            top: 0,
            bottom: GAME_CONFIG.CANVAS.HEIGHT
        };
        this.isRunning = false;
    }
    
    /**
     * Start the physics engine
     */
    start() {
        this.isRunning = true;
    }
    
    /**
     * Stop the physics engine
     */
    stop() {
        this.isRunning = false;
    }
    
    /**
     * Add physics body to the engine
     */
    addBody(body) {
        this.collisionSystem.addBody(body);
    }
    
    /**
     * Remove physics body from the engine
     */
    removeBody(bodyId) {
        this.collisionSystem.removeBody(bodyId);
    }
    
    /**
     * Apply gravity to dynamic bodies
     */
    applyGravity(deltaTime) {
        for (const body of this.collisionSystem.bodies.values()) {
            if (body.type === 'dynamic' && body.isActive) {
                const gravityForce = Vector2D.multiply(this.gravity, body.mass);
                body.applyForce(gravityForce);
            }
        }
    }
    
    /**
     * Check and handle world boundary collisions
     */
    checkWorldBoundaries() {
        for (const body of this.collisionSystem.bodies.values()) {
            if (!body.isActive || body.type === 'static') continue;
            
            let hitBoundary = false;
            const normal = new Vector2D(0, 0);
            
            // Left boundary
            if (body.bounds.left < this.worldBounds.left) {
                body.position.x = this.worldBounds.left;
                body.velocity.x = Math.abs(body.velocity.x) * body.restitution;
                normal.set(1, 0);
                hitBoundary = true;
            }
            
            // Right boundary
            if (body.bounds.right > this.worldBounds.right) {
                body.position.x = this.worldBounds.right - body.size.x;
                body.velocity.x = -Math.abs(body.velocity.x) * body.restitution;
                normal.set(-1, 0);
                hitBoundary = true;
            }
            
            // Top boundary
            if (body.bounds.top < this.worldBounds.top) {
                body.position.y = this.worldBounds.top;
                body.velocity.y = Math.abs(body.velocity.y) * body.restitution;
                normal.set(0, 1);
                hitBoundary = true;
            }
            
            // CRITICAL FIX: Remove bottom boundary collision
            // Let ball fall through bottom - game logic will handle life loss
            // No bottom boundary collision - this allows proper block breaker gameplay
            
            if (hitBoundary) {
                body.updateBounds();
                if (body.onBoundaryHit) {
                    body.onBoundaryHit(normal);
                }
            }
        }
    }
    
    /**
     * Update physics simulation
     */
    update(deltaTime) {
        if (!this.isRunning) return;
        
        // Apply gravity
        this.applyGravity(deltaTime);
        
        // Update all physics bodies
        for (const body of this.collisionSystem.bodies.values()) {
            body.update(deltaTime);
        }
        
        // Check world boundaries
        this.checkWorldBoundaries();
        
        // Handle collisions
        this.collisionSystem.update();
    }
    
    /**
     * Get all active collision pairs
     */
    getCollisionPairs() {
        return this.collisionSystem.collisionPairs;
    }
    
    /**
     * Set world boundaries
     */
    setWorldBounds(left, top, right, bottom) {
        this.worldBounds = { left, top, right, bottom };
    }
    
    /**
     * Get physics body by ID
     */
    getBody(id) {
        return this.collisionSystem.bodies.get(id);
    }
    
    /**
     * Get all physics bodies
     */
    getAllBodies() {
        return Array.from(this.collisionSystem.bodies.values());
    }
}