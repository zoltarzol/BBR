/**
 * Ball Entity for Block Breaker Revolution
 * Handles ball physics, movement, and special mechanics
 */

import { PhysicsBody } from '../physics/physicsEngine.js';
import { Vector2D } from '../../utils/vector.js';
import { GAME_CONFIG, COLORS } from '../../utils/constants.js';

export class Ball {
    constructor(x, y) {
        // Create physics body
        this.physicsBody = new PhysicsBody(
            x - GAME_CONFIG.PHYSICS.BALL_SIZE / 2, 
            y - GAME_CONFIG.PHYSICS.BALL_SIZE / 2, 
            GAME_CONFIG.PHYSICS.BALL_SIZE, 
            GAME_CONFIG.PHYSICS.BALL_SIZE, 
            'dynamic'
        );
        
        this.physicsBody.type = 'circle';
        this.physicsBody.mass = 1;
        this.physicsBody.restitution = 1.0; // Perfect bounce
        this.physicsBody.friction = 0; // No friction for smooth movement
        
        // Ball-specific properties
        this.radius = GAME_CONFIG.PHYSICS.BALL_SIZE / 2;
        this.speed = GAME_CONFIG.PHYSICS.BALL_SPEED_DEFAULT;
        this.spin = 0; // Angular velocity for spin effects
        this.spinDecay = 0.95; // Spin decay factor
        
        // State management
        this.isLaunched = false;
        this.isStuck = false; // For paddle attachment
        this.stuckOffset = new Vector2D(0, 0);
        this.stuckTarget = null;
        
        // Visual properties
        this.color = COLORS.BALL;
        this.trailColor = COLORS.BALL_TRAIL;
        this.glowIntensity = 0;
        this.trail = [];
        this.maxTrailLength = 10;
        
        // Special mechanics
        this.memoryImprints = []; // For Memory Imprint mechanic
        this.emotionalState = 'neutral'; // For Emotional AI
        this.liquidInteraction = null; // For Liquid Physics
        
        // Effects
        this.particles = [];
        this.bounceEffect = 0;
        this.speedBoost = 1.0;
        
        // Setup collision callback
        this.physicsBody.onCollision = (other, normal) => {
            this.handleCollision(other, normal);
        };
        
        this.physicsBody.onBoundaryHit = (normal) => {
            this.handleBoundaryCollision(normal);
        };
    }
    
    /**
     * Launch ball with initial velocity
     */
    launch(angle = -Math.PI / 2, speed = null) {
        if (speed === null) {
            speed = this.speed;
        }
        
        this.physicsBody.setVelocity(
            Math.sin(angle) * speed,
            Math.cos(angle) * speed
        );
        
        this.isLaunched = true;
        this.isStuck = false;
        this.stuckTarget = null;
        
        console.log(`Ball launched at angle: ${(angle * 180 / Math.PI).toFixed(1)}°`);
    }
    
    /**
     * Stick ball to target (usually paddle)
     */
    stickTo(target, offsetX = 0, offsetY = -this.radius - 5) {
        this.isStuck = true;
        this.stuckTarget = target;
        this.stuckOffset.set(offsetX, offsetY);
        this.physicsBody.setVelocity(0, 0);
        this.isLaunched = false;
    }
    
    /**
     * Update ball state and physics
     */
    update(deltaTime) {
        if (this.isStuck && this.stuckTarget) {
            this.updateStuckPosition();
        } else {
            this.updateMovement(deltaTime);
        }
        
        this.updateSpin(deltaTime);
        this.updateTrail();
        this.updateVisualEffects(deltaTime);
        this.updateParticles(deltaTime);
        this.updateMemoryImprints(deltaTime);
    }
    
    /**
     * Update position when stuck to target
     */
    updateStuckPosition() {
        if (this.stuckTarget) {
            const targetCenter = this.stuckTarget.getCenter();
            this.physicsBody.position.set(
                targetCenter.x + this.stuckOffset.x - this.radius,
                targetCenter.y + this.stuckOffset.y - this.radius
            );
            this.physicsBody.updateBounds();
        }
    }
    
    /**
     * Update ball movement and constraints
     */
    updateMovement(deltaTime) {
        // Apply spin effects to velocity
        if (Math.abs(this.spin) > 0.01) {
            const spinForce = new Vector2D(-this.spin * 50, 0);
            this.physicsBody.applyForce(spinForce);
        }
        
        // Maintain minimum and maximum speed
        const currentSpeed = this.physicsBody.velocity.magnitude();
        
        if (currentSpeed > 0) {
            if (currentSpeed < GAME_CONFIG.PHYSICS.BALL_SPEED_MIN) {
                this.physicsBody.velocity.setMagnitude(GAME_CONFIG.PHYSICS.BALL_SPEED_MIN);
            } else if (currentSpeed > GAME_CONFIG.PHYSICS.BALL_SPEED_MAX) {
                this.physicsBody.velocity.setMagnitude(GAME_CONFIG.PHYSICS.BALL_SPEED_MAX);
            }
        }
        
        // Apply speed boost
        if (this.speedBoost !== 1.0) {
            this.physicsBody.velocity.multiply(this.speedBoost);
            this.speedBoost += (1.0 - this.speedBoost) * 2 * deltaTime; // Decay back to normal
        }
    }
    
    /**
     * Update spin effects
     */
    updateSpin(deltaTime) {
        // Apply spin decay
        this.spin *= Math.pow(this.spinDecay, deltaTime);
        
        // Clamp spin to reasonable values
        this.spin = Math.max(-10, Math.min(10, this.spin));
    }
    
    /**
     * Update trail effect
     */
    updateTrail() {
        const center = this.physicsBody.getCenter();
        
        // Add current position to trail
        this.trail.unshift({
            position: center.clone(),
            timestamp: Date.now()
        });
        
        // Remove old trail points
        if (this.trail.length > this.maxTrailLength) {
            this.trail.pop();
        }
        
        // Remove trail points older than 200ms
        const now = Date.now();
        this.trail = this.trail.filter(point => now - point.timestamp < 200);
    }
    
    /**
     * Update visual effects
     */
    updateVisualEffects(deltaTime) {
        // Glow effect based on speed
        const speed = this.physicsBody.velocity.magnitude();
        const targetGlow = Math.min(speed / GAME_CONFIG.PHYSICS.BALL_SPEED_MAX, 1);
        this.glowIntensity += (targetGlow - this.glowIntensity) * 5 * deltaTime;
        
        // Bounce effect decay
        this.bounceEffect *= Math.pow(0.1, deltaTime);
    }
    
    /**
     * Update particle effects
     */
    updateParticles(deltaTime) {
        // Update existing particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            particle.position.add(Vector2D.multiply(particle.velocity, deltaTime));
            particle.life -= deltaTime / particle.maxLife;
            particle.velocity.multiply(0.98); // Slow down over time
            
            if (particle.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }
    
    /**
     * Update memory imprints for Memory Imprint mechanic
     */
    updateMemoryImprints(deltaTime) {
        // Add current position as memory imprint
        if (this.isLaunched && this.physicsBody.velocity.magnitude() > 50) {
            const center = this.physicsBody.getCenter();
            this.memoryImprints.unshift({
                position: center.clone(),
                velocity: this.physicsBody.velocity.clone(),
                timestamp: Date.now(),
                strength: 1.0
            });
        }
        
        // Update and remove old imprints
        for (let i = this.memoryImprints.length - 1; i >= 0; i--) {
            const imprint = this.memoryImprints[i];
            const age = Date.now() - imprint.timestamp;
            
            if (age > GAME_CONFIG.MECHANICS.MEMORY_TRAIL_DURATION) {
                this.memoryImprints.splice(i, 1);
            } else {
                imprint.strength = 1 - (age / GAME_CONFIG.MECHANICS.MEMORY_TRAIL_DURATION);
            }
        }
    }
    
    /**
     * Handle collision with other objects
     */
    handleCollision(other, normal) {
        // Check if collision is on cooldown to prevent spam
        if (this.physicsBody.isCollisionOnCooldown(other.id)) {
            return; // Skip collision handling if on cooldown
        }
        
        // Create bounce effect
        this.bounceEffect = 1.0;
        
        // Add collision particles
        this.createCollisionParticles(normal);
        
        // Apply spin based on collision angle
        if (other.type === 'rectangle') {
            const relativeVelocity = Vector2D.subtract(this.physicsBody.velocity, other.velocity || Vector2D.zero());
            const tangent = new Vector2D(-normal.y, normal.x);
            const tangentialVelocity = Vector2D.dot(relativeVelocity, tangent);
            this.spin += tangentialVelocity * 0.01;
        }
        
        console.log(`Ball collision with ${other.type || 'object'}`);
    }
    
    /**
     * Handle boundary collision
     */
    handleBoundaryCollision(normal) {
        this.bounceEffect = 0.5;
        this.createCollisionParticles(normal);
        
        // Check if ball fell off bottom (game over condition)
        if (normal.y < 0) { // Hit bottom boundary
            console.log('Ball fell off bottom - potential game over');
        }
    }
    
    /**
     * Create particles on collision
     */
    createCollisionParticles(normal) {
        const center = this.physicsBody.getCenter();
        const particleCount = 5;
        
        for (let i = 0; i < particleCount; i++) {
            const angle = Math.atan2(normal.y, normal.x) + (Math.random() - 0.5) * Math.PI;
            const speed = 50 + Math.random() * 100;
            
            this.particles.push({
                position: center.clone(),
                velocity: Vector2D.fromAngle(angle, speed),
                life: 1.0,
                maxLife: 0.3 + Math.random() * 0.2,
                size: 1 + Math.random() * 2
            });
        }
    }
    
    /**
     * Apply speed boost effect
     */
    applySpeedBoost(multiplier = 1.5, duration = 2000) {
        this.speedBoost = multiplier;
        setTimeout(() => {
            this.speedBoost = 1.0;
        }, duration);
    }
    
    /**
     * Get ball center position
     */
    getCenter() {
        return this.physicsBody.getCenter();
    }
    
    /**
     * Get ball bounds
     */
    getBounds() {
        return this.physicsBody.bounds;
    }
    
    /**
     * Set ball position
     */
    setPosition(x, y) {
        this.physicsBody.position.set(x - this.radius, y - this.radius);
        this.physicsBody.updateBounds();
    }
    
    /**
     * Reset ball to initial state
     */
    reset(x, y) {
        this.setPosition(x, y);
        this.physicsBody.setVelocity(0, 0);
        this.isLaunched = false;
        this.isStuck = false;
        this.stuckTarget = null;
        this.spin = 0;
        this.trail = [];
        this.particles = [];
        this.memoryImprints = [];
        this.bounceEffect = 0;
        this.speedBoost = 1.0;
    }
    
    /**
     * Render ball with visual effects
     */
    render(renderer) {
        const ctx = renderer.ctx;
        const center = this.getCenter();
        
        ctx.save();
        
        // Render trail
        this.renderTrail(renderer);
        
        // Render memory imprints
        this.renderMemoryImprints(renderer);
        
        // Glow effect
        if (this.glowIntensity > 0) {
            ctx.shadowColor = this.color;
            ctx.shadowBlur = 15 * this.glowIntensity;
        }
        
        // Bounce effect
        const bounceScale = 1 + this.bounceEffect * 0.3;
        const renderRadius = this.radius * bounceScale;
        
        // Main ball
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(center.x, center.y, renderRadius, 0, Math.PI * 2);
        ctx.fill();
        
        // Spin indicator
        if (Math.abs(this.spin) > 0.1) {
            ctx.strokeStyle = COLORS.UI_PRIMARY;
            ctx.lineWidth = 2;
            ctx.globalAlpha = Math.min(Math.abs(this.spin) / 5, 1);
            
            const spinAngle = Date.now() * this.spin * 0.01;
            ctx.beginPath();
            ctx.arc(center.x, center.y, renderRadius + 3, spinAngle, spinAngle + Math.PI);
            ctx.stroke();
            
            ctx.globalAlpha = 1;
        }
        
        // Speed indicator
        if (this.speedBoost > 1.1) {
            ctx.strokeStyle = COLORS.UI_WARNING;
            ctx.lineWidth = 3;
            ctx.globalAlpha = (this.speedBoost - 1) * 2;
            ctx.beginPath();
            ctx.arc(center.x, center.y, renderRadius + 5, 0, Math.PI * 2);
            ctx.stroke();
            ctx.globalAlpha = 1;
        }
        
        ctx.restore();
        
        // Render particles
        this.renderParticles(renderer);
    }
    
    /**
     * Render ball trail
     */
    renderTrail(renderer) {
        const ctx = renderer.ctx;
        
        if (this.trail.length < 2) return;
        
        ctx.save();
        ctx.strokeStyle = this.trailColor;
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        
        for (let i = 0; i < this.trail.length - 1; i++) {
            const alpha = (this.trail.length - i) / this.trail.length;
            ctx.globalAlpha = alpha * 0.7;
            
            ctx.beginPath();
            ctx.moveTo(this.trail[i].position.x, this.trail[i].position.y);
            ctx.lineTo(this.trail[i + 1].position.x, this.trail[i + 1].position.y);
            ctx.stroke();
        }
        
        ctx.restore();
    }
    
    /**
     * Render memory imprints
     */
    renderMemoryImprints(renderer) {
        const ctx = renderer.ctx;
        
        ctx.save();
        
        this.memoryImprints.forEach(imprint => {
            ctx.globalAlpha = imprint.strength * 0.3;
            ctx.fillStyle = COLORS.BLOCK_ECHO;
            ctx.beginPath();
            ctx.arc(imprint.position.x, imprint.position.y, this.radius * 0.7, 0, Math.PI * 2);
            ctx.fill();
        });
        
        ctx.restore();
    }
    
    /**
     * Render collision particles
     */
    renderParticles(renderer) {
        const ctx = renderer.ctx;
        
        ctx.save();
        
        this.particles.forEach(particle => {
            ctx.globalAlpha = particle.life;
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(particle.position.x, particle.position.y, particle.size, 0, Math.PI * 2);
            ctx.fill();
        });
        
        ctx.restore();
    }
}