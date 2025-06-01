/**
 * Paddle Entity for Block Breaker Revolution
 * Handles player-controlled paddle with physics integration
 */

import { PhysicsBody } from '../physics/physicsEngine.js';
import { Vector2D } from '../../utils/vector.js';
import { GAME_CONFIG, COLORS, KEYS } from '../../utils/constants.js';

export class Paddle {
    constructor(x, y) {
        // Create physics body
        this.physicsBody = new PhysicsBody(
            x, 
            y, 
            GAME_CONFIG.PHYSICS.PADDLE_WIDTH, 
            GAME_CONFIG.PHYSICS.PADDLE_HEIGHT, 
            'kinematic'
        );
        
        this.physicsBody.type = 'rectangle';
        this.physicsBody.mass = 10; // Heavy paddle for stability
        this.physicsBody.restitution = 0.9; // High bounce for ball control
        
        // Paddle-specific properties
        this.speed = GAME_CONFIG.PHYSICS.PADDLE_SPEED;
        this.isMovingLeft = false;
        this.isMovingRight = false;
        this.magneticMode = false; // For special mechanics
        this.magneticStrength = 0;
        
        // Visual properties
        this.color = COLORS.PADDLE;
        this.glowIntensity = 0;
        this.trailParticles = [];
        
        // Input handling
        this.keys = {
            left: false,
            right: false,
            space: false
        };
        
        // Constraints
        this.minX = 0;
        this.maxX = GAME_CONFIG.CANVAS.WIDTH - this.physicsBody.size.x;
        
        // Setup collision callback
        this.physicsBody.onCollision = (other, normal) => {
            this.handleCollision(other, normal);
        };
        
        this.setupInputHandlers();
    }
    
    /**
     * Setup keyboard input handlers
     */
    setupInputHandlers() {
        document.addEventListener('keydown', (e) => {
            switch(e.code) {
                case 'ArrowLeft':
                case 'KeyA':
                    this.keys.left = true;
                    e.preventDefault();
                    break;
                case 'ArrowRight':
                case 'KeyD':
                    this.keys.right = true;
                    e.preventDefault();
                    break;
                case 'Space':
                    this.keys.space = true;
                    e.preventDefault();
                    break;
            }
        });
        
        document.addEventListener('keyup', (e) => {
            switch(e.code) {
                case 'ArrowLeft':
                case 'KeyA':
                    this.keys.left = false;
                    break;
                case 'ArrowRight':
                case 'KeyD':
                    this.keys.right = false;
                    break;
                case 'Space':
                    this.keys.space = false;
                    break;
            }
        });
    }
    
    /**
     * Update paddle state and physics
     */
    update(deltaTime) {
        this.updateMovement(deltaTime);
        this.updateConstraints();
        this.updateVisualEffects(deltaTime);
        this.updateTrailParticles(deltaTime);
    }
    
    /**
     * Update paddle movement based on input
     */
    updateMovement(deltaTime) {
        let targetVelocityX = 0;
        
        if (this.keys.left) {
            targetVelocityX = -this.speed;
            this.isMovingLeft = true;
            this.isMovingRight = false;
        } else if (this.keys.right) {
            targetVelocityX = this.speed;
            this.isMovingLeft = false;
            this.isMovingRight = true;
        } else {
            this.isMovingLeft = false;
            this.isMovingRight = false;
        }
        
        // Smooth velocity transition
        const velocityDiff = targetVelocityX - this.physicsBody.velocity.x;
        const acceleration = velocityDiff * 10; // Quick response
        
        this.physicsBody.velocity.x += acceleration * deltaTime;
        
        // CRITICAL FIX: Lock paddle to horizontal movement only
        this.physicsBody.velocity.y = 0; // Prevent any vertical movement
        
        // Apply friction when not moving
        if (targetVelocityX === 0) {
            this.physicsBody.velocity.x *= Math.pow(0.1, deltaTime);
        }
    }
    
    /**
     * Keep paddle within screen bounds and locked to bottom
     */
    updateConstraints() {
        // CRITICAL FIX: Lock paddle Y position to bottom of screen
        const fixedY = GAME_CONFIG.CANVAS.HEIGHT - 50; // Fixed bottom position
        this.physicsBody.position.y = fixedY;
        
        // Horizontal constraints
        if (this.physicsBody.position.x < this.minX) {
            this.physicsBody.position.x = this.minX;
            this.physicsBody.velocity.x = 0;
        }
        
        if (this.physicsBody.position.x > this.maxX) {
            this.physicsBody.position.x = this.maxX;
            this.physicsBody.velocity.x = 0;
        }
        
        // Always ensure no vertical movement
        this.physicsBody.velocity.y = 0;
        
        this.physicsBody.updateBounds();
    }
    
    /**
     * Update visual effects
     */
    updateVisualEffects(deltaTime) {
        // Glow effect when moving
        const isMoving = Math.abs(this.physicsBody.velocity.x) > 10;
        const targetGlow = isMoving ? 1 : 0;
        this.glowIntensity += (targetGlow - this.glowIntensity) * 5 * deltaTime;
        
        // Magnetic effect
        if (this.magneticMode) {
            this.magneticStrength = Math.sin(Date.now() * 0.01) * 0.5 + 0.5;
        }
    }
    
    /**
     * Update trail particles
     */
    updateTrailParticles(deltaTime) {
        // Add new particle if moving fast enough
        if (Math.abs(this.physicsBody.velocity.x) > 50) {
            const center = this.physicsBody.getCenter();
            this.trailParticles.push({
                position: new Vector2D(center.x, center.y),
                velocity: new Vector2D(
                    (Math.random() - 0.5) * 50,
                    -Math.random() * 30
                ),
                life: 1.0,
                maxLife: 0.5
            });
        }
        
        // Update existing particles
        for (let i = this.trailParticles.length - 1; i >= 0; i--) {
            const particle = this.trailParticles[i];
            particle.position.add(Vector2D.multiply(particle.velocity, deltaTime));
            particle.life -= deltaTime / particle.maxLife;
            
            if (particle.life <= 0) {
                this.trailParticles.splice(i, 1);
            }
        }
    }
    
    /**
     * Handle collision with other objects
     */
    handleCollision(other, normal) {
        // Special handling for ball collisions
        if (other.type === 'circle') {
            this.handleBallCollision(other, normal);
        }
    }
    
    /**
     * Handle ball collision with spin and angle control
     */
    handleBallCollision(ball, normal) {
        const paddleCenter = this.physicsBody.getCenter();
        const ballCenter = ball.getCenter();
        
        // Calculate hit position relative to paddle center (-1 to 1)
        const hitPosition = (ballCenter.x - paddleCenter.x) / (this.physicsBody.size.x / 2);
        const clampedHitPosition = Math.max(-1, Math.min(1, hitPosition));
        
        // Apply spin based on hit position and paddle movement
        const spinFactor = clampedHitPosition * 0.3;
        const paddleVelocityInfluence = this.physicsBody.velocity.x * 0.1;
        
        // Modify ball velocity based on hit position
        const baseAngle = -Math.PI / 2; // Straight up
        const angleModification = clampedHitPosition * Math.PI / 6; // ±30 degrees
        const finalAngle = baseAngle + angleModification;
        
        // Set ball velocity with controlled angle
        const speed = Math.max(ball.velocity.magnitude(), GAME_CONFIG.PHYSICS.BALL_SPEED_MIN);
        ball.velocity.x = Math.sin(finalAngle) * speed + paddleVelocityInfluence;
        ball.velocity.y = Math.cos(finalAngle) * speed;
        
        // Add spin to ball if it has spin property
        if (ball.spin !== undefined) {
            ball.spin += spinFactor;
        }
        
        // Visual feedback
        this.glowIntensity = 1.0;
        
        // Sound feedback would go here
        console.log(`Ball hit paddle at position: ${clampedHitPosition.toFixed(2)}`);
    }
    
    /**
     * Activate magnetic mode for special mechanics
     */
    activateMagneticMode(duration = 5000) {
        this.magneticMode = true;
        setTimeout(() => {
            this.magneticMode = false;
        }, duration);
    }
    
    /**
     * Get paddle center position
     */
    getCenter() {
        return this.physicsBody.getCenter();
    }
    
    /**
     * Get paddle bounds
     */
    getBounds() {
        return this.physicsBody.bounds;
    }
    
    /**
     * Set paddle position
     */
    setPosition(x, y) {
        this.physicsBody.position.set(x, y);
        this.physicsBody.updateBounds();
    }
    
    /**
     * Render paddle with visual effects
     */
    render(renderer) {
        const ctx = renderer.ctx;
        const pos = this.physicsBody.position;
        const size = this.physicsBody.size;
        
        ctx.save();
        
        // Glow effect
        if (this.glowIntensity > 0) {
            ctx.shadowColor = this.color;
            ctx.shadowBlur = 20 * this.glowIntensity;
        }
        
        // Main paddle body
        ctx.fillStyle = this.color;
        ctx.fillRect(pos.x, pos.y, size.x, size.y);
        
        // Magnetic effect
        if (this.magneticMode) {
            ctx.strokeStyle = COLORS.UI_SECONDARY;
            ctx.lineWidth = 2;
            ctx.globalAlpha = this.magneticStrength;
            ctx.strokeRect(pos.x - 2, pos.y - 2, size.x + 4, size.y + 4);
            ctx.globalAlpha = 1;
        }
        
        // Movement indicator
        if (this.isMovingLeft || this.isMovingRight) {
            const center = this.getCenter();
            ctx.fillStyle = COLORS.UI_PRIMARY;
            ctx.globalAlpha = 0.7;
            
            if (this.isMovingLeft) {
                ctx.beginPath();
                ctx.moveTo(center.x - 15, center.y);
                ctx.lineTo(center.x - 5, center.y - 5);
                ctx.lineTo(center.x - 5, center.y + 5);
                ctx.fill();
            }
            
            if (this.isMovingRight) {
                ctx.beginPath();
                ctx.moveTo(center.x + 15, center.y);
                ctx.lineTo(center.x + 5, center.y - 5);
                ctx.lineTo(center.x + 5, center.y + 5);
                ctx.fill();
            }
            
            ctx.globalAlpha = 1;
        }
        
        ctx.restore();
        
        // Render trail particles
        this.renderTrailParticles(renderer);
    }
    
    /**
     * Render trail particles
     */
    renderTrailParticles(renderer) {
        const ctx = renderer.ctx;
        
        ctx.save();
        
        this.trailParticles.forEach(particle => {
            ctx.globalAlpha = particle.life;
            ctx.fillStyle = COLORS.PADDLE;
            ctx.beginPath();
            ctx.arc(particle.position.x, particle.position.y, 2, 0, Math.PI * 2);
            ctx.fill();
        });
        
        ctx.restore();
    }
}