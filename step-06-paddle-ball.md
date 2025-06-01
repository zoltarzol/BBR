# Step 06: Paddle & Ball Implementation

## Objective
Implement the core game mechanics with responsive paddle controls, realistic ball physics, and the foundation for advanced mechanics like paddle transformation and ball trajectory memory systems.

## Prerequisites
- Step 05 completed successfully
- Physics engine operational
- Collision detection system working

## Deliverables
- Paddle class with smooth mouse controls and collision response
- Ball class with memory trail system foundation
- Input manager for precise control handling
- Basic gameplay mechanics (ball-paddle interaction)
- Sound trigger points for future audio system
- Feature branch created and merged

## Step-by-Step Instructions

### 1. Create Feature Branch
```bash
git checkout -b feature/paddle-ball
git branch
```

### 2. Create Input Manager (js/game/core/inputManager.js)

```javascript
/**
 * Input Manager for handling mouse, keyboard, and game controls
 */
import { Vector2D } from '../../utils/vector.js';
import { KEYS, GAME_CONFIG } from '../../utils/constants.js';
import { gameState } from './gameState.js';

export class InputManager {
    constructor(canvas) {
        this.canvas = canvas;
        this.canvasRect = canvas.getBoundingClientRect();
        
        // Mouse state
        this.mouse = {
            position: new Vector2D(),
            worldPosition: new Vector2D(),
            deltaPosition: new Vector2D(),
            isDown: false,
            wasDown: false,
            justPressed: false,
            justReleased: false
        };
        
        // Keyboard state
        this.keys = new Map();
        this.keysJustPressed = new Set();
        this.keysJustReleased = new Set();
        
        // Touch state (for future mobile support)
        this.touch = {
            active: false,
            position: new Vector2D(),
            startPosition: new Vector2D()
        };
        
        // Input callbacks
        this.keyCallbacks = new Map();
        this.mouseCallbacks = new Map();
        
        // Settings
        this.mouseSensitivity = 1.0;
        this.deadZone = 0.1;
        
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        // Mouse events
        this.canvas.addEventListener('mousemove', this.onMouseMove.bind(this));
        this.canvas.addEventListener('mousedown', this.onMouseDown.bind(this));
        this.canvas.addEventListener('mouseup', this.onMouseUp.bind(this));
        this.canvas.addEventListener('contextmenu', e => e.preventDefault());
        
        // Keyboard events
        document.addEventListener('keydown', this.onKeyDown.bind(this));
        document.addEventListener('keyup', this.onKeyUp.bind(this));
        
        // Window events
        window.addEventListener('resize', this.onWindowResize.bind(this));
        window.addEventListener('blur', this.onWindowBlur.bind(this));
        
        // Touch events (future mobile support)
        this.canvas.addEventListener('touchstart', this.onTouchStart.bind(this));
        this.canvas.addEventListener('touchmove', this.onTouchMove.bind(this));
        this.canvas.addEventListener('touchend', this.onTouchEnd.bind(this));
        
        // Prevent context menu on canvas
        this.canvas.addEventListener('contextmenu', e => e.preventDefault());
    }
    
    update(deltaTime) {
        // Update mouse delta
        this.mouse.deltaPosition.set(0, 0);
        
        // Update just pressed/released states
        this.mouse.justPressed = this.mouse.isDown && !this.mouse.wasDown;
        this.mouse.justReleased = !this.mouse.isDown && this.mouse.wasDown;
        this.mouse.wasDown = this.mouse.isDown;
        
        // Clear just pressed/released keys
        this.keysJustPressed.clear();
        this.keysJustReleased.clear();
        
        // Handle game-specific input
        this.handleGameInput(deltaTime);
    }
    
    handleGameInput(deltaTime) {
        // Pause/Resume
        if (this.isKeyJustPressed(KEYS.PAUSE)) {
            if (gameState.isPlaying()) {
                gameState.setState(GAME_CONFIG.STATES.PAUSED);
            } else if (gameState.isPaused()) {
                gameState.setState(GAME_CONFIG.STATES.PLAYING);
            }
        }
        
        // Menu
        if (this.isKeyJustPressed(KEYS.MENU)) {
            gameState.setState(GAME_CONFIG.STATES.MENU);
        }
        
        // Restart
        if (this.isKeyJustPressed(KEYS.RESTART)) {
            // Restart level (will be implemented in level manager)
            console.log('Restart requested');
        }
        
        // Sound toggle
        if (this.isKeyJustPressed(KEYS.SOUND_TOGGLE)) {
            // Toggle sound (will be implemented in audio manager)
            console.log('Sound toggle requested');
        }
        
        // Debug toggle
        if (this.isKeyJustPressed(KEYS.DEBUG)) {
            // Toggle debug view
            console.log('Debug toggle requested');
        }
    }
    
    // Mouse event handlers
    onMouseMove(event) {
        const rect = this.canvas.getBoundingClientRect();
        const newPosition = new Vector2D(
            (event.clientX - rect.left) * this.mouseSensitivity,
            (event.clientY - rect.top) * this.mouseSensitivity
        );
        
        this.mouse.deltaPosition = newPosition.clone().subtract(this.mouse.position);
        this.mouse.position = newPosition;
        
        // Calculate world position (accounting for camera if any)
        this.mouse.worldPosition = this.mouse.position.clone();
        
        // Call mouse move callbacks
        this.callMouseCallbacks('move', event);
    }
    
    onMouseDown(event) {
        this.mouse.isDown = true;
        this.callMouseCallbacks('down', event);
    }
    
    onMouseUp(event) {
        this.mouse.isDown = false;
        this.callMouseCallbacks('up', event);
    }
    
    // Keyboard event handlers
    onKeyDown(event) {
        const wasPressed = this.keys.get(event.code);
        this.keys.set(event.code, true);
        
        if (!wasPressed) {
            this.keysJustPressed.add(event.code);
            this.callKeyCallbacks('down', event.code, event);
        }
        
        // Prevent default for game keys
        if (Object.values(KEYS).includes(event.code)) {
            event.preventDefault();
        }
    }
    
    onKeyUp(event) {
        this.keys.set(event.code, false);
        this.keysJustReleased.add(event.code);
        this.callKeyCallbacks('up', event.code, event);
    }
    
    // Touch event handlers (basic support)
    onTouchStart(event) {
        event.preventDefault();
        if (event.touches.length > 0) {
            const touch = event.touches[0];
            const rect = this.canvas.getBoundingClientRect();
            this.touch.active = true;
            this.touch.position.set(
                touch.clientX - rect.left,
                touch.clientY - rect.top
            );
            this.touch.startPosition.copy(this.touch.position);
        }
    }
    
    onTouchMove(event) {
        event.preventDefault();
        if (event.touches.length > 0 && this.touch.active) {
            const touch = event.touches[0];
            const rect = this.canvas.getBoundingClientRect();
            this.touch.position.set(
                touch.clientX - rect.left,
                touch.clientY - rect.top
            );
        }
    }
    
    onTouchEnd(event) {
        event.preventDefault();
        this.touch.active = false;
    }
    
    // Window event handlers
    onWindowResize() {
        this.canvasRect = this.canvas.getBoundingClientRect();
    }
    
    onWindowBlur() {
        // Clear all input states when window loses focus
        this.keys.clear();
        this.keysJustPressed.clear();
        this.keysJustReleased.clear();
        this.mouse.isDown = false;
        this.mouse.wasDown = false;
        this.touch.active = false;
    }
    
    // Input query methods
    isKeyPressed(keyCode) {
        return this.keys.get(keyCode) || false;
    }
    
    isKeyJustPressed(keyCode) {
        return this.keysJustPressed.has(keyCode);
    }
    
    isKeyJustReleased(keyCode) {
        return this.keysJustReleased.has(keyCode);
    }
    
    isMouseDown() {
        return this.mouse.isDown;
    }
    
    isMouseJustPressed() {
        return this.mouse.justPressed;
    }
    
    isMouseJustReleased() {
        return this.mouse.justReleased;
    }
    
    getMousePosition() {
        return this.mouse.position.clone();
    }
    
    getMouseWorldPosition() {
        return this.mouse.worldPosition.clone();
    }
    
    getMouseDelta() {
        return this.mouse.deltaPosition.clone();
    }
    
    // Callback system
    addKeyCallback(keyCode, type, callback) {
        const key = `${keyCode}-${type}`;
        if (!this.keyCallbacks.has(key)) {
            this.keyCallbacks.set(key, []);
        }
        this.keyCallbacks.get(key).push(callback);
    }
    
    addMouseCallback(type, callback) {
        if (!this.mouseCallbacks.has(type)) {
            this.mouseCallbacks.set(type, []);
        }
        this.mouseCallbacks.get(type).push(callback);
    }
    
    callKeyCallbacks(type, keyCode, event) {
        const key = `${keyCode}-${type}`;
        const callbacks = this.keyCallbacks.get(key);
        if (callbacks) {
            callbacks.forEach(callback => {
                try {
                    callback(keyCode, event);
                } catch (error) {
                    console.error('Error in key callback:', error);
                }
            });
        }
    }
    
    callMouseCallbacks(type, event) {
        const callbacks = this.mouseCallbacks.get(type);
        if (callbacks) {
            callbacks.forEach(callback => {
                try {
                    callback(this.mouse, event);
                } catch (error) {
                    console.error('Error in mouse callback:', error);
                }
            });
        }
    }
    
    // Settings
    setMouseSensitivity(sensitivity) {
        this.mouseSensitivity = Math.max(0.1, Math.min(5.0, sensitivity));
    }
    
    getMouseSensitivity() {
        return this.mouseSensitivity;
    }
    
    // Utility methods
    getInputSummary() {
        return {
            mouse: {
                position: this.mouse.position.clone(),
                isDown: this.mouse.isDown,
                delta: this.mouse.deltaPosition.clone()
            },
            activeKeys: Array.from(this.keys.entries())
                .filter(([key, pressed]) => pressed)
                .map(([key]) => key),
            touch: {
                active: this.touch.active,
                position: this.touch.position.clone()
            }
        };
    }
}
```

### 3. Create Paddle Class (js/game/mechanics/paddle.js)

```javascript
/**
 * Paddle Class - Player-controlled paddle with advanced mechanics
 */
import { Vector2D } from '../../utils/vector.js';
import { GAME_CONFIG, COLORS } from '../../utils/constants.js';
import { PhysicsBody } from '../physics/physicsEngine.js';
import { Rectangle } from '../physics/shapes.js';
import { MathUtils } from '../../utils/helpers.js';

export class Paddle {
    constructor(x, y, options = {}) {
        // Paddle properties
        this.width = options.width || GAME_CONFIG.PHYSICS.PADDLE_WIDTH;
        this.height = options.height || GAME_CONFIG.PHYSICS.PADDLE_HEIGHT;
        this.speed = options.speed || GAME_CONFIG.PHYSICS.PADDLE_SPEED;
        
        // Create physics body
        const shape = new Rectangle(x, y, this.width, this.height);
        this.physicsBody = new PhysicsBody(shape, {
            isStatic: true,
            restitution: 1.0,
            userData: { 
                type: 'paddle',
                owner: this
            }
        });
        
        // Position and movement
        this.position = this.physicsBody.position;
        this.targetPosition = new Vector2D(x, y);
        this.velocity = new Vector2D();
        this.lastPosition = new Vector2D(x, y);
        
        // Paddle state
        this.isActive = true;
        this.isVisible = true;
        
        // Visual properties
        this.color = options.color || COLORS.PADDLE;
        this.glowIntensity = 0;
        this.animationTime = 0;
        
        // Boundaries
        this.bounds = {
            left: options.minX || 0,
            right: options.maxX || GAME_CONFIG.CANVAS_WIDTH,
            top: options.minY || y,
            bottom: options.maxY || y
        };
        
        // Advanced mechanics (for future implementation)
        this.transformState = 'normal'; // normal, wide, narrow, split, curved
        this.transformProgress = 0;
        this.powerLevel = 0;
        this.specialEffects = new Set();
        
        // Sound trigger points
        this.soundTriggers = {
            ballHit: false,
            powerUp: false,
            transform: false
        };
        
        // Performance tracking
        this.hitCount = 0;
        this.lastHitTime = 0;
        this.accuracy = 1.0; // How centered the ball hits
    }
    
    update(deltaTime, inputManager) {
        if (!this.isActive) return;
        
        this.animationTime += deltaTime;
        
        // Update position based on input
        this.updateMovement(deltaTime, inputManager);
        
        // Update visual effects
        this.updateVisualEffects(deltaTime);
        
        // Update physics body
        this.physicsBody.position.copy(this.position);
        this.physicsBody.shape.position.copy(this.position);
        
        // Reset sound triggers
        this.resetSoundTriggers();
    }
    
    updateMovement(deltaTime, inputManager) {
        // Store last position for velocity calculation
        this.lastPosition.copy(this.position);
        
        // Get target position from mouse
        if (inputManager) {
            const mousePos = inputManager.getMousePosition();
            this.targetPosition.x = mousePos.x - this.width / 2;
            
            // Keep paddle in bounds
            this.targetPosition.x = MathUtils.clamp(
                this.targetPosition.x,
                this.bounds.left,
                this.bounds.right - this.width
            );
        }
        
        // Smooth movement towards target
        const smoothing = 0.15; // Adjust for responsiveness vs smoothness
        this.position.x += (this.targetPosition.x - this.position.x) * smoothing;
        
        // Calculate velocity for ball interaction
        this.velocity.x = (this.position.x - this.lastPosition.x) / deltaTime;
        this.velocity.y = (this.position.y - this.lastPosition.y) / deltaTime;
        
        // Clamp velocity for realistic physics
        const maxVelocity = this.speed * 2;
        this.velocity.limit(maxVelocity);
    }
    
    updateVisualEffects(deltaTime) {
        // Update glow effect
        if (this.glowIntensity > 0) {
            this.glowIntensity -= deltaTime * 2; // Fade out over 0.5 seconds
            this.glowIntensity = Math.max(0, this.glowIntensity);
        }
        
        // Update transformation animation
        if (this.transformState !== 'normal') {
            // Transformation effects will be implemented in later steps
        }
    }
    
    // Called when ball hits paddle
    onBallHit(ball, collisionInfo) {
        this.hitCount++;
        this.lastHitTime = performance.now();
        this.glowIntensity = 1.0;
        this.soundTriggers.ballHit = true;
        
        // Calculate hit accuracy (how centered the hit was)
        const paddleCenter = this.position.x + this.width / 2;
        const hitPosition = collisionInfo.contactPoint.x;
        const offset = Math.abs(hitPosition - paddleCenter) / (this.width / 2);
        this.accuracy = 1.0 - offset;
        
        // Modify ball velocity based on hit position and paddle movement
        this.modifyBallVelocity(ball, collisionInfo);
        
        // Special effects based on hit quality
        if (this.accuracy > 0.8) {
            this.addSpecialEffect('perfect_hit');
        }
    }
    
    modifyBallVelocity(ball, collisionInfo) {
        // Get hit position relative to paddle center (-1 to 1)
        const paddleCenter = this.position.x + this.width / 2;
        const hitPosition = collisionInfo.contactPoint.x;
        const relativeHitPos = (hitPosition - paddleCenter) / (this.width / 2);
        
        // Calculate new velocity direction
        const currentSpeed = ball.velocity.magnitude();
        const baseAngle = -Math.PI / 2; // Straight up
        const maxAngle = Math.PI / 3; // 60 degrees
        const angle = baseAngle + relativeHitPos * maxAngle;
        
        // Add paddle velocity influence
        const paddleInfluence = 0.3;
        const newVelocity = Vector2D.fromAngle(angle, currentSpeed);
        newVelocity.x += this.velocity.x * paddleInfluence;
        
        // Ensure minimum upward velocity
        if (newVelocity.y > -50) {
            newVelocity.y = -Math.max(100, currentSpeed * 0.5);
        }
        
        // Limit velocity
        const minSpeed = GAME_CONFIG.PHYSICS.BALL_SPEED_MIN;
        const maxSpeed = GAME_CONFIG.PHYSICS.BALL_SPEED_MAX;
        const speed = MathUtils.clamp(newVelocity.magnitude(), minSpeed, maxSpeed);
        newVelocity.setMagnitude(speed);
        
        ball.setVelocity(newVelocity.x, newVelocity.y);
    }
    
    // Paddle transformations (foundation for advanced mechanics)
    startTransformation(type, duration = 2000) {
        if (this.transformState === type) return;
        
        this.transformState = type;
        this.transformProgress = 0;
        this.soundTriggers.transform = true;
        
        // Animate transformation
        const startTime = performance.now();
        const animate = () => {
            const elapsed = performance.now() - startTime;
            this.transformProgress = Math.min(elapsed / duration, 1);
            
            if (this.transformProgress < 1) {
                requestAnimationFrame(animate);
            } else {
                this.completeTransformation();
            }
        };
        
        animate();
    }
    
    completeTransformation() {
        switch (this.transformState) {
            case 'wide':
                this.width *= 1.5;
                break;
            case 'narrow':
                this.width *= 0.7;
                break;
            case 'split':
                // Will be implemented with advanced mechanics
                break;
        }
        
        // Update physics shape
        this.physicsBody.shape.width = this.width;
    }
    
    resetTransformation() {
        this.transformState = 'normal';
        this.transformProgress = 0;
        this.width = GAME_CONFIG.PHYSICS.PADDLE_WIDTH;
        this.physicsBody.shape.width = this.width;
    }
    
    // Power-up system
    applyPowerUp(powerUpType, duration = 5000) {
        this.addSpecialEffect(powerUpType);
        this.powerLevel++;
        this.soundTriggers.powerUp = true;
        
        // Remove power-up after duration
        setTimeout(() => {
            this.removeSpecialEffect(powerUpType);
            this.powerLevel = Math.max(0, this.powerLevel - 1);
        }, duration);
    }
    
    addSpecialEffect(effectType) {
        this.specialEffects.add(effectType);
    }
    
    removeSpecialEffect(effectType) {
        this.specialEffects.delete(effectType);
    }
    
    hasSpecialEffect(effectType) {
        return this.specialEffects.has(effectType);
    }
    
    // Rendering data
    getRenderData() {
        const baseColor = this.color;
        let fillColor = baseColor;
        
        // Apply glow effect
        if (this.glowIntensity > 0) {
            const glowAmount = Math.floor(this.glowIntensity * 50);
            fillColor = this.lightenColor(baseColor, glowAmount);
        }
        
        // Apply special effect colors
        if (this.hasSpecialEffect('perfect_hit')) {
            fillColor = this.blendColors(fillColor, COLORS.UI_SUCCESS, 0.3);
        }
        
        return {
            type: 'rectangle',
            x: this.position.x,
            y: this.position.y,
            width: this.getCurrentWidth(),
            height: this.height,
            fillColor: fillColor,
            strokeColor: this.glowIntensity > 0 ? COLORS.UI_PRIMARY : null,
            strokeWidth: this.glowIntensity * 3
        };
    }
    
    getCurrentWidth() {
        // Apply transformation effects
        let width = this.width;
        
        if (this.transformState === 'wide') {
            width *= (1 + this.transformProgress * 0.5);
        } else if (this.transformState === 'narrow') {
            width *= (1 - this.transformProgress * 0.3);
        }
        
        return width;
    }
    
    // Utility methods
    lightenColor(color, amount) {
        // Simple color lightening (will be improved with ColorUtils)
        const num = parseInt(color.replace('#', ''), 16);
        const r = Math.min(255, (num >> 16) + amount);
        const g = Math.min(255, (num >> 8 & 0x00FF) + amount);
        const b = Math.min(255, (num & 0x0000FF) + amount);
        return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
    }
    
    blendColors(color1, color2, ratio) {
        // Simple color blending
        return color2; // Simplified for now
    }
    
    resetSoundTriggers() {
        Object.keys(this.soundTriggers).forEach(key => {
            this.soundTriggers[key] = false;
        });
    }
    
    // Getters for game state
    getPosition() {
        return this.position.clone();
    }
    
    getVelocity() {
        return this.velocity.clone();
    }
    
    getBounds() {
        return {
            left: this.position.x,
            right: this.position.x + this.getCurrentWidth(),
            top: this.position.y,
            bottom: this.position.y + this.height
        };
    }
    
    getStats() {
        return {
            hitCount: this.hitCount,
            accuracy: this.accuracy,
            powerLevel: this.powerLevel,
            transformState: this.transformState,
            specialEffects: Array.from(this.specialEffects)
        };
    }
    
    // State management
    setPosition(x, y) {
        this.position.set(x, y);
        this.targetPosition.set(x, y);
        this.physicsBody.position.copy(this.position);
        this.physicsBody.shape.position.copy(this.position);
    }
    
    setActive(active) {
        this.isActive = active;
        this.physicsBody.isActive = active;
    }
    
    setVisible(visible) {
        this.isVisible = visible;
    }
    
    reset() {
        this.resetTransformation();
        this.specialEffects.clear();
        this.powerLevel = 0;
        this.glowIntensity = 0;
        this.hitCount = 0;
        this.accuracy = 1.0;
    }
}
```

### 4. Create Ball Class (js/game/mechanics/ball.js)

```javascript
/**
 * Ball Class - Game ball with trail system and advanced physics
 */
import { Vector2D } from '../../utils/vector.js';
import { GAME_CONFIG, COLORS } from '../../utils/constants.js';
import { PhysicsBody } from '../physics/physicsEngine.js';
import { Circle } from '../physics/shapes.js';
import { MathUtils, TimeUtils } from '../../utils/helpers.js';

// Trail Point for memory system
class TrailPoint {
    constructor(position, velocity, timestamp) {
        this.position = position.clone();
        this.velocity = velocity.clone();
        this.timestamp = timestamp;
        this.alpha = 1.0;
        this.size = 1.0;
    }
    
    update(deltaTime) {
        // Fade out over time
        const age = performance.now() - this.timestamp;
        const maxAge = GAME_CONFIG.MECHANICS.MEMORY_TRAIL_DURATION;
        this.alpha = Math.max(0, 1 - (age / maxAge));
        this.size = this.alpha * 0.8 + 0.2; // Size scales with alpha
        
        return this.alpha > 0;
    }
}

export class Ball {
    constructor(x, y, options = {}) {
        // Ball properties
        this.radius = options.radius || GAME_CONFIG.PHYSICS.BALL_SIZE;
        this.speed = options.speed || GAME_CONFIG.PHYSICS.BALL_SPEED_DEFAULT;
        
        // Create physics body
        const shape = new Circle(x, y, this.radius);
        this.physicsBody = new PhysicsBody(shape, {
            mass: 1,
            restitution: 0.95,
            friction: 0.01,
            userData: { 
                type: 'ball',
                owner: this
            }
        });
        
        // Position and movement
        this.position = this.physicsBody.position;
        this.velocity = this.physicsBody.velocity;
        this.lastPosition = new Vector2D(x, y);
        
        // Ball state
        this.isActive = true;
        this.isVisible = true;
        this.isInPlay = true;
        
        // Visual properties
        this.color = options.color || COLORS.BALL;
        this.trailColor = options.trailColor || COLORS.BALL_TRAIL;
        this.glowIntensity = 0;
        this.pulsePhase = 0;
        
        // Memory trail system (foundation for advanced mechanics)
        this.trail = [];
        this.trailUpdateInterval = 16; // Update every 16ms (60fps)
        this.lastTrailUpdate = 0;
        this.maxTrailLength = 50;
        
        // Speed and direction tracking
        this.speedHistory = [];
        this.directionChanges = 0;
        this.lastDirection = new Vector2D();
        
        // Collision tracking
        this.lastCollision = null;
        this.consecutiveWallHits = 0;
        this.consecutiveBlockHits = 0;
        
        // Sound and effects
        this.soundTriggers = {
            wallHit: false,
            blockHit: false,
            paddleHit: false,
            speedChange: false,
            outOfBounds: false
        };
        
        // Special states (foundation for advanced mechanics)
        this.specialEffects = new Set();
        this.powerLevel = 0;
        this.magneticPull = new Vector2D();
        
        // Performance tracking
        this.bounceCount = 0;
        this.distanceTraveled = 0;
        this.timeInPlay = 0;
        
        // Boundaries
        this.bounds = {
            left: 0,
            right: GAME_CONFIG.CANVAS_WIDTH,
            top: 0,
            bottom: GAME_CONFIG.CANVAS_HEIGHT
        };
        
        // Initialize with starting velocity if provided
        if (options.initialVelocity) {
            this.setVelocity(options.initialVelocity.x, options.initialVelocity.y);
        }
    }
    
    update(deltaTime) {
        if (!this.isActive) return;
        
        this.timeInPlay += deltaTime;
        this.pulsePhase += deltaTime * 4; // Pulsing animation
        
        // Store last position for distance calculation
        this.lastPosition.copy(this.position);
        
        // Update trail system
        this.updateTrail(deltaTime);
        
        // Update visual effects
        this.updateVisualEffects(deltaTime);
        
        // Track movement
        this.updateMovementTracking(deltaTime);
        
        // Check boundaries
        this.checkBoundaries();
        
        // Apply special effects
        this.applySpecialEffects(deltaTime);
        
        // Reset sound triggers
        this.resetSoundTriggers();
        
        // Update physics (position will be updated by physics engine)
    }
    
    updateTrail(deltaTime) {
        const now = performance.now();
        
        // Add new trail point
        if (now - this.lastTrailUpdate >= this.trailUpdateInterval) {
            if (this.velocity.magnitude() > 10) { // Only add if moving
                const trailPoint = new TrailPoint(this.position, this.velocity, now);
                this.trail.push(trailPoint);
                
                // Limit trail length
                if (this.trail.length > this.maxTrailLength) {
                    this.trail.shift();
                }
            }
            this.lastTrailUpdate = now;
        }
        
        // Update existing trail points
        this.trail = this.trail.filter(point => point.update(deltaTime));
    }
    
    updateVisualEffects(deltaTime) {
        // Update glow effect
        if (this.glowIntensity > 0) {
            this.glowIntensity -= deltaTime * 2;
            this.glowIntensity = Math.max(0, this.glowIntensity);
        }
        
        // Update special effect visuals
        if (this.hasSpecialEffect('high_speed')) {
            this.glowIntensity = Math.max(this.glowIntensity, 0.5);
        }
    }
    
    updateMovementTracking(deltaTime) {
        // Track distance traveled
        const currentDistance = this.position.distance(this.lastPosition);
        this.distanceTraveled += currentDistance;
        
        // Track speed history
        const currentSpeed = this.velocity.magnitude();
        this.speedHistory.push(currentSpeed);
        if (this.speedHistory.length > 60) { // Keep last 1 second at 60fps
            this.speedHistory.shift();
        }
        
        // Track direction changes
        const currentDirection = this.velocity.clone().normalize();
        if (this.lastDirection.magnitude() > 0) {
            const angleDifference = Math.abs(
                currentDirection.angle() - this.lastDirection.angle()
            );
            if (angleDifference > Math.PI / 4) { // 45 degree change
                this.directionChanges++;
                this.soundTriggers.speedChange = true;
            }
        }
        this.lastDirection.copy(currentDirection);
    }
    
    checkBoundaries() {
        const pos = this.position;
        const radius = this.radius;
        
        // Check if ball is out of bounds
        if (pos.y > this.bounds.bottom + radius) {
            this.onOutOfBounds();
        }
        
        // Check wall collisions for sound triggers
        if (pos.x - radius <= this.bounds.left || 
            pos.x + radius >= this.bounds.right ||
            pos.y - radius <= this.bounds.top) {
            this.onWallHit();
        }
    }
    
    applySpecialEffects(deltaTime) {
        // Apply magnetic pull (foundation for advanced mechanics)
        if (this.magneticPull.magnitude() > 0) {
            this.physicsBody.applyForce(this.magneticPull);
            this.magneticPull.multiply(0.9); // Decay over time
        }
        
        // Apply speed effects
        if (this.hasSpecialEffect('high_speed')) {
            const currentSpeed = this.velocity.magnitude();
            if (currentSpeed < GAME_CONFIG.PHYSICS.BALL_SPEED_MAX) {
                this.velocity.setMagnitude(
                    Math.min(currentSpeed * 1.1, GAME_CONFIG.PHYSICS.BALL_SPEED_MAX)
                );
            }
        }
    }
    
    // Collision handlers
    onWallHit() {
        this.consecutiveWallHits++;
        this.consecutiveBlockHits = 0;
        this.bounceCount++;
        this.glowIntensity = 0.8;
        this.soundTriggers.wallHit = true;
        this.lastCollision = 'wall';
    }
    
    onBlockHit(block) {
        this.consecutiveBlockHits++;
        this.consecutiveWallHits = 0;
        this.bounceCount++;
        this.glowIntensity = 1.0;
        this.soundTriggers.blockHit = true;
        this.lastCollision = 'block';
        
        // Speed up slightly after hitting blocks
        const currentSpeed = this.velocity.magnitude();
        const newSpeed = Math.min(
            currentSpeed + 5,
            GAME_CONFIG.PHYSICS.BALL_SPEED_MAX
        );
        if (newSpeed !== currentSpeed) {
            this.velocity.setMagnitude(newSpeed);
            this.soundTriggers.speedChange = true;
        }
    }
    
    onPaddleHit(paddle) {
        this.consecutiveWallHits = 0;
        this.consecutiveBlockHits = 0;
        this.bounceCount++;
        this.glowIntensity = 1.0;
        this.soundTriggers.paddleHit = true;
        this.lastCollision = 'paddle';
        
        // Paddle hit is handled by paddle's onBallHit method
    }
    
    onOutOfBounds() {
        this.isInPlay = false;
        this.soundTriggers.outOfBounds = true;
        // Game over logic will be handled by game manager
    }
    
    // Special effects system
    addSpecialEffect(effectType, duration = 5000) {
        this.specialEffects.add(effectType);
        this.powerLevel++;
        
        // Apply immediate effect
        switch (effectType) {
            case 'high_speed':
                this.addSpecialEffect('speed_boost');
                break;
            case 'magnetic':
                // Will be implemented with advanced mechanics
                break;
            case 'phase':
                // Will be implemented with advanced mechanics
                break;
        }
        
        // Remove effect after duration
        if (duration > 0) {
            setTimeout(() => {
                this.removeSpecialEffect(effectType);
            }, duration);
        }
    }
    
    removeSpecialEffect(effectType) {
        this.specialEffects.delete(effectType);
        this.powerLevel = Math.max(0, this.powerLevel - 1);
    }
    
    hasSpecialEffect(effectType) {
        return this.specialEffects.has(effectType);
    }
    
    // Trail system methods (foundation for memory mechanics)
    getTrailData() {
        return this.trail.map(point => ({
            position: point.position.clone(),
            velocity: point.velocity.clone(),
            alpha: point.alpha,
            size: point.size,
            timestamp: point.timestamp
        }));
    }
    
    clearTrail() {
        this.trail = [];
    }
    
    // Memory system (foundation for advanced mechanics)
    getSuccessfulPaths() {
        // Will return paths that led to successful block hits
        return this.trail.filter(point => {
            // Logic for determining successful paths
            return point.timestamp > this.lastSuccessfulHit;
        });
    }
    
    replayPath(pathData) {
        // Foundation for echo block mechanics
        // Will replay a recorded path
        console.log('Path replay requested:', pathData);
    }
    
    // Physics controls
    setVelocity(x, y) {
        this.velocity.set(x, y);
        this.physicsBody.setVelocity(x, y);
    }
    
    addVelocity(x, y) {
        this.velocity.add(new Vector2D(x, y));
        this.physicsBody.velocity.copy(this.velocity);
    }
    
    setSpeed(speed) {
        const direction = this.velocity.clone().normalize();
        this.setVelocity(direction.x * speed, direction.y * speed);
    }
    
    clampSpeed() {
        const speed = this.velocity.magnitude();
        const minSpeed = GAME_CONFIG.PHYSICS.BALL_SPEED_MIN;
        const maxSpeed = GAME_CONFIG.PHYSICS.BALL_SPEED_MAX;
        
        if (speed < minSpeed || speed > maxSpeed) {
            const clampedSpeed = MathUtils.clamp(speed, minSpeed, maxSpeed);
            this.setSpeed(clampedSpeed);
        }
    }
    
    // Rendering data
    getRenderData() {
        const layers = [];
        
        // Ball trail
        for (let i = 0; i < this.trail.length; i++) {
            const point = this.trail[i];
            if (point.alpha > 0.1) {
                layers.push({
                    layer: GAME_CONFIG.LAYERS.MEMORY_TRAILS,
                    object: {
                        type: 'circle',
                        x: point.position.x,
                        y: point.position.y,
                        radius: this.radius * point.size * 0.5,
                        fillColor: this.adjustColorAlpha(this.trailColor, point.alpha),
                        strokeColor: null
                    }
                });
            }
        }
        
        // Main ball
        let ballColor = this.color;
        if (this.glowIntensity > 0) {
            ballColor = this.lightenColor(ballColor, this.glowIntensity * 30);
        }
        
        // Apply pulsing effect
        const pulseSize = 1 + Math.sin(this.pulsePhase) * 0.1;
        
        layers.push({
            layer: GAME_CONFIG.LAYERS.BALL,
            object: {
                type: 'circle',
                x: this.position.x,
                y: this.position.y,
                radius: this.radius * pulseSize,
                fillColor: ballColor,
                strokeColor: this.glowIntensity > 0 ? COLORS.UI_PRIMARY : null,
                strokeWidth: this.glowIntensity * 2
            }
        });
        
        return layers;
    }
    
    // Utility methods
    adjustColorAlpha(color, alpha) {
        // Convert hex to rgba with alpha
        const r = parseInt(color.slice(1, 3), 16);
        const g = parseInt(color.slice(3, 5), 16);
        const b = parseInt(color.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
    
    lightenColor(color, amount) {
        const num = parseInt(color.replace('#', ''), 16);
        const r = Math.min(255, (num >> 16) + amount);
        const g = Math.min(255, (num >> 8 & 0x00FF) + amount);
        const b = Math.min(255, (num & 0x0000FF) + amount);
        return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
    }
    
    resetSoundTriggers() {
        Object.keys(this.soundTriggers).forEach(key => {
            this.soundTriggers[key] = false;
        });
    }
    
    // Getters
    getPosition() {
        return this.position.clone();
    }
    
    getVelocity() {
        return this.velocity.clone();
    }
    
    getSpeed() {
        return this.velocity.magnitude();
    }
    
    getStats() {
        return {
            bounceCount: this.bounceCount,
            distanceTraveled: this.distanceTraveled,
            timeInPlay: this.timeInPlay,
            directionChanges: this.directionChanges,
            speedHistory: [...this.speedHistory],
            powerLevel: this.powerLevel,
            specialEffects: Array.from(this.specialEffects)
        };
    }
    
    // State management
    setPosition(x, y) {
        this.position.set(x, y);
        this.physicsBody.position.copy(this.position);
        this.physicsBody.shape.position.copy(this.position);
    }
    
    setActive(active) {
        this.isActive = active;
        this.physicsBody.isActive = active;
    }
    
    setVisible(visible) {
        this.isVisible = visible;
    }
    
    reset() {
        this.clearTrail();
        this.specialEffects.clear();
        this.powerLevel = 0;
        this.glowIntensity = 0;
        this.bounceCount = 0;
        this.distanceTraveled = 0;
        this.timeInPlay = 0;
        this.directionChanges = 0;
        this.speedHistory = [];
        this.consecutiveWallHits = 0;
        this.consecutiveBlockHits = 0;
        this.isInPlay = true;
        this.lastCollision = null;
    }
}
```

### 5. Update Main Game Class (js/main.js)

Add paddle and ball integration to the existing main.js:

```javascript
// Add these imports at the top after existing imports
import { InputManager } from './game/core/inputManager.js';
import { Paddle } from './game/mechanics/paddle.js';
import { Ball } from './game/mechanics/ball.js';
import { PhysicsEngine } from './game/physics/physicsEngine.js';

// Add these properties to the Game class constructor
this.inputManager = null;
this.physicsEngine = null;
this.paddle = null;
this.ball = null;

// Update the init method to initialize new systems
async init() {
    try {
        console.log('Initializing Block Breaker Revolution...');
        
        // Get canvas element
        this.canvas = document.getElementById('game-canvas');
        if (!this.canvas) {
            throw new Error('Game canvas not found');
        }
        
        // Initialize renderer
        this.renderer = new Renderer(this.canvas);
        console.log('Renderer initialized');
        
        // Initialize input manager
        this.inputManager = new InputManager(this.canvas);
        console.log('Input manager initialized');
        
        // Initialize physics engine
        this.physicsEngine = new PhysicsEngine();
        console.log('Physics engine initialized');
        
        // Set up game state listeners
        this.setupStateListeners();
        
        // Initialize UI system
        this.initializeUI();
        
        // Initialize game objects
        this.initializeGameObjects();
        
        // Start the game loop
        this.start();
        
        // Initial state
        gameState.setState(GAME_CONFIG.STATES.MENU);
        
        console.log('Game initialization complete');
        
    } catch (error) {
        console.error('Failed to initialize game:', error);
        this.showError('Failed to initialize game: ' + error.message);
    }
}

// Add new method to initialize game objects
initializeGameObjects() {
    // Create walls
    const walls = [
        this.physicsEngine.createWall(0, 0, this.canvas.width, 0), // Top
        this.physicsEngine.createWall(this.canvas.width, 0, this.canvas.width, this.canvas.height), // Right
        this.physicsEngine.createWall(0, this.canvas.height, 0, 0) // Left
        // Note: No bottom wall - ball should fall through
    ];
    
    walls.forEach(wall => this.physicsEngine.addBody(wall));
    
    // Create paddle
    this.paddle = new Paddle(
        this.canvas.width / 2 - GAME_CONFIG.PHYSICS.PADDLE_WIDTH / 2,
        this.canvas.height - 50,
        {
            minX: 0,
            maxX: this.canvas.width
        }
    );
    this.physicsEngine.addBody(this.paddle.physicsBody);
    
    // Create ball
    this.ball = new Ball(
        this.canvas.width / 2,
        this.canvas.height / 2,
        {
            initialVelocity: new Vector2D(200, -200)
        }
    );
    this.physicsEngine.addBody(this.ball.physicsBody);
    
    // Set up collision callbacks
    this.setupCollisionCallbacks();
}

// Add collision callback setup
setupCollisionCallbacks() {
    // Ball-Paddle collision
    this.physicsEngine.addCollisionCallback(this.ball.physicsBody.id, (ballBody, otherBody, collisionInfo) => {
        if (otherBody.userData.type === 'paddle') {
            this.paddle.onBallHit(this.ball, collisionInfo);
            this.ball.onPaddleHit(this.paddle);
        } else if (otherBody.userData.type === 'block') {
            this.ball.onBlockHit(otherBody.userData.owner);
        }
    });
}

// Update the update method
update(deltaTime) {
    // Only update if not paused
    if (this.isPaused) return;
    
    // Update input manager
    this.inputManager?.update(deltaTime);
    
    // Update physics engine
    this.physicsEngine?.update(deltaTime);
    
    // Update game objects
    if (gameState.isInGame()) {
        this.paddle?.update(deltaTime, this.inputManager);
        this.ball?.update(deltaTime);
        
        // Check for ball out of bounds
        if (!this.ball.isInPlay) {
            this.onBallLost();
        }
    }
    
    // Update performance monitoring
    if (DEBUG.LOG_PERFORMANCE && this.frameCount % 60 === 0) {
        console.log('Performance Stats:', this.performanceStats);
        console.log('Physics Stats:', this.physicsEngine?.getPerformanceStats());
    }
}

// Add ball lost handler
onBallLost() {
    console.log('Ball lost! Game over.');
    // Will be extended with lives system in later steps
    gameState.setState(GAME_CONFIG.STATES.GAME_OVER);
}

// Update the renderGame method
renderGame() {
    // Background
    this.renderer.addToLayer(GAME_CONFIG.LAYERS.BACKGROUND, {
        type: 'rectangle',
        x: 0,
        y: 0,
        width: this.canvas.width,
        height: this.canvas.height,
        fillColor: '#0f0f23'
    });
    
    // Render paddle
    if (this.paddle && this.paddle.isVisible) {
        const paddleRender = this.paddle.getRenderData();
        this.renderer.addToLayer(GAME_CONFIG.LAYERS.PADDLE, paddleRender);
    }
    
    // Render ball and trail
    if (this.ball && this.ball.isVisible) {
        const ballRenderData = this.ball.getRenderData();
        ballRenderData.forEach(item => {
            this.renderer.addToLayer(item.layer, item.object);
        });
    }
    
    // Debug physics bodies
    if (DEBUG.SHOW_COLLISION_BOXES && this.physicsEngine) {
        const bodies = this.physicsEngine.getAllBodies();
        bodies.forEach(body => {
            if (body.userData.type === 'wall') {
                let renderObj = null;
                if (body.shape.type === 'line') {
                    renderObj = {
                        type: 'line',
                        x1: body.shape.start.x,
                        y1: body.shape.start.y,
                        x2: body.shape.end.x,
                        y2: body.shape.end.y,
                        strokeColor: '#666666',
                        strokeWidth: 2
                    };
                }
                if (renderObj) {
                    this.renderer.addToLayer(GAME_CONFIG.LAYERS.UI_OVERLAY, renderObj);
                }
            }
        });
    }
}
```

### 6. Create Integration Test

Create `test-paddle-ball.html`:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Paddle & Ball Test</title>
    <style>
        body { margin: 0; padding: 20px; background: #0f0f23; color: white; font-family: Arial, sans-serif; }
        canvas { border: 2px solid #6366f1; border-radius: 8px; }
        .controls { margin: 20px 0; }
        button { background: #6366f1; color: white; border: none; padding: 10px 20px; margin: 5px; border-radius: 4px; cursor: pointer; }
        button:hover { background: #4f46e5; }
        .info { margin: 20px 0; font-family: monospace; font-size: 12px; }
    </style>
</head>
<body>
    <h1>Paddle & Ball Integration Test</h1>
    <canvas id="test-canvas" width="800" height="600"></canvas>
    
    <div class="controls">
        <button onclick="resetBall()">Reset Ball</button>
        <button onclick="addSpeed()">Speed Up</button>
        <button onclick="slowDown()">Slow Down</button>
        <button onclick="toggleTrail()">Toggle Trail</button>
    </div>
    
    <div class="info">
        <div>Move mouse to control paddle</div>
        <div id="ball-stats"></div>
        <div id="paddle-stats"></div>
    </div>
    
    <script type="module">
        import { PhysicsEngine } from './js/game/physics/physicsEngine.js';
        import { Renderer } from './js/game/core/renderer.js';
        import { InputManager } from './js/game/core/inputManager.js';
        import { Paddle } from './js/game/mechanics/paddle.js';
        import { Ball } from './js/game/mechanics/ball.js';
        import { GAME_CONFIG, COLORS } from './js/utils/constants.js';
        import { Vector2D } from './js/utils/vector.js';
        
        const canvas = document.getElementById('test-canvas');
        const renderer = new Renderer(canvas);
        const inputManager = new InputManager(canvas);
        const physics = new PhysicsEngine();
        
        let paddle, ball;
        let showTrail = true;
        
        // Create walls
        const walls = [
            physics.createWall(0, 0, canvas.width, 0), // Top
            physics.createWall(canvas.width, 0, canvas.width, canvas.height), // Right
            physics.createWall(0, canvas.height, 0, 0) // Left
        ];
        walls.forEach(wall => physics.addBody(wall));
        
        // Create paddle
        paddle = new Paddle(canvas.width / 2 - 40, canvas.height - 50, {
            minX: 0,
            maxX: canvas.width
        });
        physics.addBody(paddle.physicsBody);
        
        // Create ball
        ball = new Ball(canvas.width / 2, canvas.height / 2, {
            initialVelocity: new Vector2D(250, -200)
        });
        physics.addBody(ball.physicsBody);
        
        // Set up collision callbacks
        physics.addCollisionCallback(ball.physicsBody.id, (ballBody, otherBody, collisionInfo) => {
            if (otherBody.userData.type === 'paddle') {
                paddle.onBallHit(ball, collisionInfo);
                ball.onPaddleHit(paddle);
            }
        });
        
        function gameLoop() {
            const deltaTime = 1/60;
            
            // Update systems
            inputManager.update(deltaTime);
            physics.update(deltaTime);
            paddle.update(deltaTime, inputManager);
            ball.update(deltaTime);
            
            // Check ball out of bounds
            if (ball.position.y > canvas.height + 50) {
                resetBall();
            }
            
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
            
            // Render paddle
            const paddleRender = paddle.getRenderData();
            renderer.addToLayer(GAME_CONFIG.LAYERS.PADDLE, paddleRender);
            
            // Render ball and trail
            if (showTrail) {
                const ballRenderData = ball.getRenderData();
                ballRenderData.forEach(item => {
                    renderer.addToLayer(item.layer, item.object);
                });
            } else {
                // Just render ball without trail
                const ballData = ball.getRenderData().find(item => 
                    item.layer === GAME_CONFIG.LAYERS.BALL
                );
                if (ballData) {
                    renderer.addToLayer(ballData.layer, ballData.object);
                }
            }
            
            renderer.render();
            
            // Update stats
            updateStats();
            
            requestAnimationFrame(gameLoop);
        }
        
        function updateStats() {
            const ballStats = ball.getStats();
            const paddleStats = paddle.getStats();
            
            document.getElementById('ball-stats').innerHTML = `
                Ball: Speed ${ball.getSpeed().toFixed(1)} | Bounces ${ballStats.bounceCount} | 
                Distance ${(ballStats.distanceTraveled / 1000).toFixed(1)}k | 
                Effects [${ballStats.specialEffects.join(', ')}]
            `;
            
            document.getElementById('paddle-stats').innerHTML = `
                Paddle: Hits ${paddleStats.hitCount} | Accuracy ${(paddleStats.accuracy * 100).toFixed(1)}% | 
                Power ${paddleStats.powerLevel} | State ${paddleStats.transformState}
            `;
        }
        
        window.resetBall = () => {
            ball.setPosition(canvas.width / 2, canvas.height / 2);
            ball.setVelocity(250, -200);
            ball.reset();
        };
        
        window.addSpeed = () => {
            const currentSpeed = ball.getSpeed();
            ball.setSpeed(Math.min(currentSpeed + 50, 600));
        };
        
        window.slowDown = () => {
            const currentSpeed = ball.getSpeed();
            ball.setSpeed(Math.max(currentSpeed - 50, 100));
        };
        
        window.toggleTrail = () => {
            showTrail = !showTrail;
        };
        
        gameLoop();
    </script>
</body>
</html>
```

### 7. Commit Changes

```bash
git add .
git commit -m "feat(paddle-ball): Implement paddle and ball mechanics with advanced features

- Create comprehensive InputManager with mouse, keyboard, and touch support
- Implement Paddle class with smooth controls and transformation foundation
- Build Ball class with memory trail system and special effects
- Add collision response system between paddle and ball
- Implement realistic ball physics with speed clamping and direction tracking
- Create foundation for advanced mechanics (transformations, special effects)
- Add sound trigger points for future audio integration
- Include comprehensive debugging and testing tools
- Integrate paddle and ball with main game loop and physics engine"
```

### 8. Merge Feature Branch

```bash
git checkout main
git merge feature/paddle-ball
git branch -d feature/paddle-ball
```

## Testing & Verification

### 1. Basic Functionality
- ✅ Open `test-paddle-ball.html`
- ✅ Move mouse to control paddle - should be smooth and responsive
- ✅ Ball should bounce off paddle with realistic physics
- ✅ Ball trail should render correctly
- ✅ Speed controls should work

### 2. Paddle Mechanics
- ✅ Paddle responds smoothly to mouse movement
- ✅ Ball angle changes based on where it hits paddle
- ✅ Paddle glows when ball hits it
- ✅ Paddle stays within screen bounds

### 3. Ball Mechanics
- ✅ Ball maintains trail showing movement history
- ✅ Ball speed increases slightly after paddle hits
- ✅ Ball resets properly when going out of bounds
- ✅ Visual effects (glow, pulse) work correctly

### 4. Integration Testing
- ✅ Open `index.html` - should work with paddle and ball
- ✅ State changes work correctly
- ✅ No performance issues with trail rendering

## Success Criteria

✅ **Smooth, responsive paddle controls with mouse input**  
✅ **Realistic ball physics with proper paddle interaction**  
✅ **Memory trail system rendering correctly**  
✅ **Collision detection between ball and paddle working**  
✅ **Sound trigger points implemented for future audio**  
✅ **Foundation for advanced mechanics in place**  
✅ **Performance remains stable at 60 FPS**  
✅ **Visual effects enhance gameplay experience**  
✅ **Input system handles keyboard shortcuts properly**  
✅ **Code architecture supports future enhancements**

## Next Step
Proceed to `instructions/step-07-block-system.md`