# Step 04: Game Loop & Canvas Rendering System

## Objective
Implement the core game loop with precise timing, establish the canvas rendering pipeline, and create the foundation for all game systems including state management and performance monitoring.

## Prerequisites
- Steps 01-03 completed successfully
- HTML canvas and CSS framework in place
- Project structure established

## Deliverables
- Core game loop with delta time calculation
- Canvas rendering system with layered rendering
- Game state management system
- Performance monitoring and FPS tracking
- Input manager foundation
- Feature branch created and merged

## Step-by-Step Instructions

### 1. Create Feature Branch
```bash
git checkout -b feature/game-loop
git branch
```

### 2. Create Core Constants (js/utils/constants.js)

```javascript
/**
 * Block Breaker Revolution - Game Constants
 * Centralized configuration for all game systems
 */

// Game Configuration
export const GAME_CONFIG = {
    // Canvas Dimensions
    CANVAS_WIDTH: 1024,
    CANVAS_HEIGHT: 768,
    
    // Performance Settings
    TARGET_FPS: 60,
    MAX_DELTA_TIME: 1/30, // Cap at 30fps minimum to prevent large jumps
    
    // Game States
    STATES: {
        LOADING: 'loading',
        MENU: 'menu',
        PLAYING: 'playing',
        PAUSED: 'paused',
        TUTORIAL: 'tutorial',
        LEVEL_SELECT: 'levelSelect',
        SETTINGS: 'settings',
        ABOUT: 'about',
        GAME_OVER: 'gameOver',
        LEVEL_COMPLETE: 'levelComplete'
    },
    
    // Rendering Layers (Z-order)
    LAYERS: {
        BACKGROUND: 0,
        LIQUID_PARTICLES: 1,
        MEMORY_TRAILS: 2,
        BLOCKS: 3,
        BALL: 4,
        PADDLE: 5,
        EFFECTS: 6,
        UI_OVERLAY: 7
    },
    
    // Physics Constants
    PHYSICS: {
        GRAVITY: 0, // No gravity for traditional block breaker
        FRICTION: 0.99,
        BALL_SPEED_MIN: 200,
        BALL_SPEED_MAX: 600,
        BALL_SPEED_DEFAULT: 300,
        PADDLE_SPEED: 400,
        BALL_SIZE: 8,
        PADDLE_WIDTH: 80,
        PADDLE_HEIGHT: 12
    },
    
    // Game Mechanics Settings
    MECHANICS: {
        MEMORY_TRAIL_DURATION: 3000, // 3 seconds
        LIQUID_PARTICLE_COUNT: 50,
        EMOTION_UPDATE_INTERVAL: 100, // ms
        SOUND_FREQUENCY_RANGE: { min: 100, max: 2000 },
        BLOCK_INTELLIGENCE_UPDATE: 500 // ms
    },
    
    // Audio Settings
    AUDIO: {
        MASTER_VOLUME: 0.8,
        MUSIC_VOLUME: 0.6,
        SFX_VOLUME: 0.8,
        SAMPLE_RATE: 44100
    },
    
    // Visual Settings
    VISUAL: {
        PARTICLE_ALPHA: 0.7,
        TRAIL_ALPHA: 0.5,
        EMOTION_INDICATOR_SIZE: 16,
        LIQUID_DROPLET_SIZE: 3
    }
};

// Color Palette
export const COLORS = {
    // Game Elements
    PADDLE: '#6366f1',
    BALL: '#f59e0b',
    BALL_TRAIL: '#fbbf24',
    
    // Block Types
    BLOCK_NORMAL: '#4ade80',
    BLOCK_STRONG: '#ef4444',
    BLOCK_SPECIAL: '#f472b6',
    BLOCK_ECHO: '#8b5cf6',
    BLOCK_LIQUID: '#3b82f6',
    
    // Liquids
    LIQUID_WATER: '#3b82f6',
    LIQUID_ACID: '#10b981',
    LIQUID_FIRE: '#ef4444',
    LIQUID_ICE: '#06b6d4',
    
    // UI Elements
    UI_PRIMARY: '#6366f1',
    UI_SECONDARY: '#f59e0b',
    UI_SUCCESS: '#10b981',
    UI_WARNING: '#f59e0b',
    UI_ERROR: '#ef4444',
    
    // Emotions
    EMOTION_HAPPY: '#10b981',
    EMOTION_SAD: '#3b82f6',
    EMOTION_ANGRY: '#ef4444',
    EMOTION_SCARED: '#f59e0b',
    EMOTION_NEUTRAL: '#6b7280'
};

// Key Bindings
export const KEYS = {
    PAUSE: 'Space',
    RESTART: 'KeyR',
    MENU: 'Escape',
    SOUND_TOGGLE: 'KeyM',
    DEBUG: 'KeyD'
};

// Debug Settings
export const DEBUG = {
    SHOW_FPS: true,
    SHOW_COLLISION_BOXES: false,
    SHOW_PHYSICS_DEBUG: false,
    SHOW_MEMORY_TRAILS: true,
    SHOW_BLOCK_EMOTIONS: true,
    LOG_PERFORMANCE: false
};
```

### 3. Create Vector Math Utility (js/utils/vector.js)

```javascript
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
```

### 4. Create Game State Manager (js/game/core/gameState.js)

```javascript
/**
 * Game State Management System
 */
import { GAME_CONFIG } from '../../utils/constants.js';

export class GameStateManager {
    constructor() {
        this.currentState = GAME_CONFIG.STATES.LOADING;
        this.previousState = null;
        this.stateStack = [];
        this.stateData = {};
        this.listeners = new Map();
        this.transitionCallbacks = new Map();
    }
    
    // State management
    setState(newState, data = {}) {
        if (newState === this.currentState) return;
        
        const oldState = this.currentState;
        this.previousState = oldState;
        this.currentState = newState;
        this.stateData = { ...data };
        
        // Notify listeners
        this.notifyStateChange(oldState, newState, data);
        
        // Execute transition callback if exists
        const transitionKey = `${oldState}->${newState}`;
        if (this.transitionCallbacks.has(transitionKey)) {
            this.transitionCallbacks.get(transitionKey)(data);
        }
        
        console.log(`State changed: ${oldState} -> ${newState}`, data);
    }
    
    getState() {
        return this.currentState;
    }
    
    getPreviousState() {
        return this.previousState;
    }
    
    getStateData() {
        return { ...this.stateData };
    }
    
    // State stack for modal/overlay states
    pushState(newState, data = {}) {
        this.stateStack.push({
            state: this.currentState,
            data: this.stateData
        });
        this.setState(newState, data);
    }
    
    popState() {
        if (this.stateStack.length > 0) {
            const previous = this.stateStack.pop();
            this.setState(previous.state, previous.data);
            return true;
        }
        return false;
    }
    
    // State checking utilities
    isState(state) {
        return this.currentState === state;
    }
    
    isPlaying() {
        return this.currentState === GAME_CONFIG.STATES.PLAYING;
    }
    
    isPaused() {
        return this.currentState === GAME_CONFIG.STATES.PAUSED;
    }
    
    isInGame() {
        return this.isPlaying() || 
               this.currentState === GAME_CONFIG.STATES.TUTORIAL ||
               this.currentState === GAME_CONFIG.STATES.LEVEL_COMPLETE;
    }
    
    // Event system
    addStateListener(callback) {
        const id = Date.now() + Math.random();
        this.listeners.set(id, callback);
        return id;
    }
    
    removeStateListener(id) {
        return this.listeners.delete(id);
    }
    
    notifyStateChange(oldState, newState, data) {
        this.listeners.forEach(callback => {
            try {
                callback(oldState, newState, data);
            } catch (error) {
                console.error('Error in state listener:', error);
            }
        });
    }
    
    // Transition callbacks
    addTransitionCallback(fromState, toState, callback) {
        const key = `${fromState}->${toState}`;
        this.transitionCallbacks.set(key, callback);
    }
    
    removeTransitionCallback(fromState, toState) {
        const key = `${fromState}->${toState}`;
        return this.transitionCallbacks.delete(key);
    }
}

// Global state manager instance
export const gameState = new GameStateManager();
```

### 5. Create Renderer System (js/game/core/renderer.js)

```javascript
/**
 * Canvas Rendering System with Layer Management
 */
import { GAME_CONFIG, COLORS } from '../../utils/constants.js';
import { Vector2D } from '../../utils/vector.js';

export class Renderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.width = canvas.width;
        this.height = canvas.height;
        
        // Rendering layers
        this.layers = new Map();
        this.initializeLayers();
        
        // Camera system (for future scrolling levels)
        this.camera = {
            x: 0,
            y: 0,
            zoom: 1
        };
        
        // Performance tracking
        this.drawCalls = 0;
        this.renderTime = 0;
    }
    
    initializeLayers() {
        // Initialize all rendering layers
        Object.entries(GAME_CONFIG.LAYERS).forEach(([name, zIndex]) => {
            this.layers.set(zIndex, {
                name: name.toLowerCase(),
                objects: [],
                visible: true
            });
        });
    }
    
    // Clear canvas and reset for new frame
    clear() {
        this.ctx.clearRect(0, 0, this.width, this.height);
        this.drawCalls = 0;
        
        // Clear all layer object arrays
        this.layers.forEach(layer => {
            layer.objects = [];
        });
    }
    
    // Add object to specific layer
    addToLayer(layerIndex, renderObject) {
        const layer = this.layers.get(layerIndex);
        if (layer) {
            layer.objects.push(renderObject);
        }
    }
    
    // Main render method
    render() {
        const startTime = performance.now();
        
        // Set up canvas state
        this.ctx.save();
        this.applyCamera();
        
        // Render all layers in order
        const sortedLayers = Array.from(this.layers.entries())
            .sort(([a], [b]) => a - b);
        
        for (const [zIndex, layer] of sortedLayers) {
            if (layer.visible) {
                this.renderLayer(layer);
            }
        }
        
        this.ctx.restore();
        
        // Track performance
        this.renderTime = performance.now() - startTime;
    }
    
    renderLayer(layer) {
        for (const obj of layer.objects) {
            this.renderObject(obj);
        }
    }
    
    renderObject(obj) {
        this.ctx.save();
        
        try {
            switch (obj.type) {
                case 'rectangle':
                    this.drawRectangle(obj);
                    break;
                case 'circle':
                    this.drawCircle(obj);
                    break;
                case 'line':
                    this.drawLine(obj);
                    break;
                case 'text':
                    this.drawText(obj);
                    break;
                case 'image':
                    this.drawImage(obj);
                    break;
                case 'path':
                    this.drawPath(obj);
                    break;
                case 'particle':
                    this.drawParticle(obj);
                    break;
                default:
                    console.warn(`Unknown render object type: ${obj.type}`);
            }
            this.drawCalls++;
        } catch (error) {
            console.error('Error rendering object:', error, obj);
        }
        
        this.ctx.restore();
    }
    
    // Drawing primitives
    drawRectangle(obj) {
        const { x, y, width, height, fillColor, strokeColor, strokeWidth = 1 } = obj;
        
        if (fillColor) {
            this.ctx.fillStyle = fillColor;
            this.ctx.fillRect(x, y, width, height);
        }
        
        if (strokeColor) {
            this.ctx.strokeStyle = strokeColor;
            this.ctx.lineWidth = strokeWidth;
            this.ctx.strokeRect(x, y, width, height);
        }
    }
    
    drawCircle(obj) {
        const { x, y, radius, fillColor, strokeColor, strokeWidth = 1 } = obj;
        
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, Math.PI * 2);
        
        if (fillColor) {
            this.ctx.fillStyle = fillColor;
            this.ctx.fill();
        }
        
        if (strokeColor) {
            this.ctx.strokeStyle = strokeColor;
            this.ctx.lineWidth = strokeWidth;
            this.ctx.stroke();
        }
    }
    
    drawLine(obj) {
        const { x1, y1, x2, y2, strokeColor, strokeWidth = 1, lineDash = [] } = obj;
        
        this.ctx.strokeStyle = strokeColor || '#ffffff';
        this.ctx.lineWidth = strokeWidth;
        this.ctx.setLineDash(lineDash);
        
        this.ctx.beginPath();
        this.ctx.moveTo(x1, y1);
        this.ctx.lineTo(x2, y2);
        this.ctx.stroke();
        
        this.ctx.setLineDash([]); // Reset line dash
    }
    
    drawText(obj) {
        const { 
            x, y, text, fillColor = '#ffffff', strokeColor, strokeWidth = 1,
            font = '16px Arial', textAlign = 'left', textBaseline = 'top'
        } = obj;
        
        this.ctx.font = font;
        this.ctx.textAlign = textAlign;
        this.ctx.textBaseline = textBaseline;
        
        if (strokeColor) {
            this.ctx.strokeStyle = strokeColor;
            this.ctx.lineWidth = strokeWidth;
            this.ctx.strokeText(text, x, y);
        }
        
        this.ctx.fillStyle = fillColor;
        this.ctx.fillText(text, x, y);
    }
    
    drawImage(obj) {
        const { image, x, y, width, height, rotation = 0, alpha = 1 } = obj;
        
        this.ctx.globalAlpha = alpha;
        
        if (rotation !== 0) {
            this.ctx.translate(x + width/2, y + height/2);
            this.ctx.rotate(rotation);
            this.ctx.drawImage(image, -width/2, -height/2, width, height);
        } else {
            this.ctx.drawImage(image, x, y, width, height);
        }
        
        this.ctx.globalAlpha = 1;
    }
    
    drawPath(obj) {
        const { points, strokeColor, fillColor, strokeWidth = 1, closed = false } = obj;
        
        if (points.length < 2) return;
        
        this.ctx.beginPath();
        this.ctx.moveTo(points[0].x, points[0].y);
        
        for (let i = 1; i < points.length; i++) {
            this.ctx.lineTo(points[i].x, points[i].y);
        }
        
        if (closed) {
            this.ctx.closePath();
        }
        
        if (fillColor && closed) {
            this.ctx.fillStyle = fillColor;
            this.ctx.fill();
        }
        
        if (strokeColor) {
            this.ctx.strokeStyle = strokeColor;
            this.ctx.lineWidth = strokeWidth;
            this.ctx.stroke();
        }
    }
    
    drawParticle(obj) {
        const { x, y, size, color, alpha = 1, shape = 'circle' } = obj;
        
        this.ctx.globalAlpha = alpha;
        
        if (shape === 'circle') {
            this.drawCircle({ x, y, radius: size, fillColor: color });
        } else if (shape === 'square') {
            this.drawRectangle({ 
                x: x - size/2, 
                y: y - size/2, 
                width: size, 
                height: size, 
                fillColor: color 
            });
        }
        
        this.ctx.globalAlpha = 1;
    }
    
    // Camera system
    applyCamera() {
        this.ctx.translate(-this.camera.x, -this.camera.y);
        this.ctx.scale(this.camera.zoom, this.camera.zoom);
    }
    
    setCamera(x, y, zoom = 1) {
        this.camera.x = x;
        this.camera.y = y;
        this.camera.zoom = zoom;
    }
    
    // Utility methods
    worldToScreen(worldPos) {
        return new Vector2D(
            (worldPos.x - this.camera.x) * this.camera.zoom,
            (worldPos.y - this.camera.y) * this.camera.zoom
        );
    }
    
    screenToWorld(screenPos) {
        return new Vector2D(
            screenPos.x / this.camera.zoom + this.camera.x,
            screenPos.y / this.camera.zoom + this.camera.y
        );
    }
    
    // Performance getters
    getDrawCalls() {
        return this.drawCalls;
    }
    
    getRenderTime() {
        return this.renderTime;
    }
}
```

### 6. Create Main Game Class (js/main.js)

```javascript
/**
 * Block Breaker Revolution - Main Game Class
 */
import { GAME_CONFIG, DEBUG } from './utils/constants.js';
import { gameState } from './game/core/gameState.js';
import { Renderer } from './game/core/renderer.js';

class Game {
    constructor() {
        this.canvas = null;
        this.renderer = null;
        this.lastTime = 0;
        this.deltaTime = 0;
        this.fps = 60;
        this.frameCount = 0;
        this.lastFpsTime = 0;
        this.isRunning = false;
        this.isPaused = false;
        
        // Game systems (will be initialized in later steps)
        this.inputManager = null;
        this.audioManager = null;
        this.physicsEngine = null;
        this.levelManager = null;
        
        // Performance monitoring
        this.performanceStats = {
            renderTime: 0,
            updateTime: 0,
            totalTime: 0,
            memoryUsage: 0
        };
    }
    
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
            
            // Set up game state listeners
            this.setupStateListeners();
            
            // Initialize UI system
            this.initializeUI();
            
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
    
    setupStateListeners() {
        gameState.addStateListener((oldState, newState, data) => {
            this.onStateChange(oldState, newState, data);
        });
    }
    
    onStateChange(oldState, newState, data) {
        console.log(`Game state changed: ${oldState} -> ${newState}`);
        
        // Handle UI visibility
        this.updateUIVisibility(newState);
        
        // Handle state-specific logic
        switch (newState) {
            case GAME_CONFIG.STATES.PLAYING:
                this.isPaused = false;
                break;
            case GAME_CONFIG.STATES.PAUSED:
                this.isPaused = true;
                break;
            case GAME_CONFIG.STATES.MENU:
                this.isPaused = true;
                break;
        }
    }
    
    updateUIVisibility(state) {
        // Hide all screens
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.add('hidden');
        });
        
        // Show appropriate screen
        switch (state) {
            case GAME_CONFIG.STATES.LOADING:
                document.getElementById('loading-screen').classList.remove('hidden');
                break;
            case GAME_CONFIG.STATES.MENU:
                document.getElementById('main-menu').classList.remove('hidden');
                break;
            case GAME_CONFIG.STATES.PLAYING:
            case GAME_CONFIG.STATES.PAUSED:
            case GAME_CONFIG.STATES.TUTORIAL:
                document.getElementById('game-screen').classList.remove('hidden');
                break;
            case GAME_CONFIG.STATES.LEVEL_SELECT:
                document.getElementById('level-select-screen').classList.remove('hidden');
                break;
            case GAME_CONFIG.STATES.SETTINGS:
                document.getElementById('settings-screen').classList.remove('hidden');
                break;
            case GAME_CONFIG.STATES.ABOUT:
                document.getElementById('about-screen').classList.remove('hidden');
                break;
        }
    }
    
    initializeUI() {
        // Initialize UI event listeners
        this.setupMenuButtons();
        this.setupGameUI();
        this.setupSettingsUI();
    }
    
    setupMenuButtons() {
        // Main menu buttons
        document.getElementById('start-game-btn')?.addEventListener('click', () => {
            gameState.setState(GAME_CONFIG.STATES.PLAYING);
        });
        
        document.getElementById('tutorial-btn')?.addEventListener('click', () => {
            gameState.setState(GAME_CONFIG.STATES.TUTORIAL);
        });
        
        document.getElementById('level-select-btn')?.addEventListener('click', () => {
            gameState.setState(GAME_CONFIG.STATES.LEVEL_SELECT);
        });
        
        document.getElementById('settings-btn')?.addEventListener('click', () => {
            gameState.setState(GAME_CONFIG.STATES.SETTINGS);
        });
        
        document.getElementById('about-btn')?.addEventListener('click', () => {
            gameState.setState(GAME_CONFIG.STATES.ABOUT);
        });
    }
    
    setupGameUI() {
        // Game HUD buttons
        document.getElementById('pause-btn')?.addEventListener('click', () => {
            if (gameState.isPlaying()) {
                gameState.setState(GAME_CONFIG.STATES.PAUSED);
            } else if (gameState.isPaused()) {
                gameState.setState(GAME_CONFIG.STATES.PLAYING);
            }
        });
        
        document.getElementById('menu-btn')?.addEventListener('click', () => {
            gameState.setState(GAME_CONFIG.STATES.MENU);
        });
        
        // Back buttons
        document.getElementById('back-from-levels-btn')?.addEventListener('click', () => {
            gameState.setState(GAME_CONFIG.STATES.MENU);
        });
        
        document.getElementById('back-from-settings-btn')?.addEventListener('click', () => {
            gameState.setState(GAME_CONFIG.STATES.MENU);
        });
        
        document.getElementById('back-from-about-btn')?.addEventListener('click', () => {
            gameState.setState(GAME_CONFIG.STATES.MENU);
        });
    }
    
    setupSettingsUI() {
        // Settings will be implemented in later steps
        console.log('Settings UI setup placeholder');
    }
    
    start() {
        this.isRunning = true;
        this.lastTime = performance.now();
        this.gameLoop();
        console.log('Game loop started');
    }
    
    stop() {
        this.isRunning = false;
        console.log('Game loop stopped');
    }
    
    gameLoop() {
        if (!this.isRunning) return;
        
        const currentTime = performance.now();
        this.deltaTime = Math.min((currentTime - this.lastTime) / 1000, GAME_CONFIG.MAX_DELTA_TIME);
        this.lastTime = currentTime;
        
        // Update FPS counter
        this.updateFPS(currentTime);
        
        // Game loop phases
        const updateStart = performance.now();
        this.update(this.deltaTime);
        this.performanceStats.updateTime = performance.now() - updateStart;
        
        const renderStart = performance.now();
        this.render();
        this.performanceStats.renderTime = performance.now() - renderStart;
        
        this.performanceStats.totalTime = performance.now() - currentTime;
        
        // Schedule next frame
        requestAnimationFrame(() => this.gameLoop());
    }
    
    update(deltaTime) {
        // Only update if not paused
        if (this.isPaused) return;
        
        // Update game systems (will be implemented in later steps)
        // this.inputManager?.update(deltaTime);
        // this.physicsEngine?.update(deltaTime);
        // this.audioManager?.update(deltaTime);
        
        // Update performance monitoring
        if (DEBUG.LOG_PERFORMANCE && this.frameCount % 60 === 0) {
            console.log('Performance Stats:', this.performanceStats);
        }
    }
    
    render() {
        // Clear the canvas
        this.renderer.clear();
        
        // Render based on current state
        switch (gameState.getState()) {
            case GAME_CONFIG.STATES.PLAYING:
            case GAME_CONFIG.STATES.TUTORIAL:
                this.renderGame();
                break;
            case GAME_CONFIG.STATES.MENU:
                this.renderMenu();
                break;
            case GAME_CONFIG.STATES.LOADING:
                this.renderLoading();
                break;
        }
        
        // Render debug information
        if (DEBUG.SHOW_FPS) {
            this.renderFPS();
        }
        
        // Execute the render
        this.renderer.render();
    }
    
    renderGame() {
        // Game rendering will be implemented in later steps
        // For now, render a simple placeholder
        this.renderer.addToLayer(GAME_CONFIG.LAYERS.BACKGROUND, {
            type: 'rectangle',
            x: 0,
            y: 0,
            width: this.canvas.width,
            height: this.canvas.height,
            fillColor: '#0f0f23'
        });
        
        // Placeholder text
        this.renderer.addToLayer(GAME_CONFIG.LAYERS.UI_OVERLAY, {
            type: 'text',
            x: this.canvas.width / 2,
            y: this.canvas.height / 2,
            text: 'Game Rendering - Coming Soon!',
            fillColor: '#ffffff',
            font: '24px Arial',
            textAlign: 'center',
            textBaseline: 'middle'
        });
    }
    
    renderMenu() {
        // Menu background with gradient effect
        this.renderer.addToLayer(GAME_CONFIG.LAYERS.BACKGROUND, {
            type: 'rectangle',
            x: 0,
            y: 0,
            width: this.canvas.width,
            height: this.canvas.height,
            fillColor: '#1a1a2e'
        });
    }
    
    renderLoading() {
        // Loading screen rendering
        this.renderer.addToLayer(GAME_CONFIG.LAYERS.BACKGROUND, {
            type: 'rectangle',
            x: 0,
            y: 0,
            width: this.canvas.width,
            height: this.canvas.height,
            fillColor: '#0f0f23'
        });
    }
    
    renderFPS() {
        this.renderer.addToLayer(GAME_CONFIG.LAYERS.UI_OVERLAY, {
            type: 'text',
            x: 10,
            y: 10,
            text: `FPS: ${Math.round(this.fps)}`,
            fillColor: '#10b981',
            font: '14px monospace',
            textAlign: 'left',
            textBaseline: 'top'
        });
    }
    
    updateFPS(currentTime) {
        this.frameCount++;
        
        if (currentTime - this.lastFpsTime >= 1000) {
            this.fps = this.frameCount;
            this.frameCount = 0;
            this.lastFpsTime = currentTime;
            
            // Update FPS display in DOM
            const fpsElement = document.getElementById('fps-value');
            if (fpsElement) {
                fpsElement.textContent = Math.round(this.fps);
            }
        }
    }
    
    showError(message) {
        const errorContainer = document.getElementById('error-container');
        const errorText = document.getElementById('error-text');
        
        if (errorContainer && errorText) {
            errorText.textContent = message;
            errorContainer.classList.remove('hidden');
        } else {
            alert(message); // Fallback
        }
    }
    
    // Public API for debugging
    getPerformanceStats() {
        return { ...this.performanceStats, fps: this.fps };
    }
    
    getRenderer() {
        return this.renderer;
    }
}

// Initialize the game when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    window.game = new Game();
    await window.game.init();
});

// Handle window events
window.addEventListener('beforeunload', () => {
    if (window.game) {
        window.game.stop();
    }
});

// Error handling
window.addEventListener('error', (event) => {
    console.error('Unhandled error:', event.error);
    if (window.game) {
        window.game.showError('An unexpected error occurred. Please refresh the page.');
    }
});
```

### 7. Testing & Verification

Create `test-game-loop.html` for testing:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Game Loop Test</title>
    <style>
        body { margin: 0; padding: 20px; background: #0f0f23; color: white; font-family: Arial, sans-serif; }
        canvas { border: 2px solid #6366f1; border-radius: 8px; }
        .controls { margin: 20px 0; }
        button { background: #6366f1; color: white; border: none; padding: 10px 20px; margin: 5px; border-radius: 4px; cursor: pointer; }
        button:hover { background: #4f46e5; }
        .stats { margin: 20px 0; font-family: monospace; }
    </style>
</head>
<body>
    <h1>Game Loop & Rendering Test</h1>
    <canvas id="test-canvas" width="800" height="600"></canvas>
    
    <div class="controls">
        <button onclick="startTest()">Start</button>
        <button onclick="stopTest()">Stop</button>
        <button onclick="toggleDebug()">Toggle Debug</button>
    </div>
    
    <div class="stats" id="stats"></div>
    
    <script type="module">
        import { Renderer } from './js/game/core/renderer.js';
        import { GAME_CONFIG, COLORS } from './js/utils/constants.js';
        
        let renderer, isRunning = false, frameCount = 0, lastTime = 0;
        let debugMode = true;
        
        const canvas = document.getElementById('test-canvas');
        renderer = new Renderer(canvas);
        
        function gameLoop() {
            if (!isRunning) return;
            
            const currentTime = performance.now();
            const deltaTime = (currentTime - lastTime) / 1000;
            lastTime = currentTime;
            
            // Clear and render test pattern
            renderer.clear();
            
            // Animated background
            const time = currentTime * 0.001;
            const bgColor = `hsl(${(time * 30) % 360}, 30%, 10%)`;
            
            renderer.addToLayer(GAME_CONFIG.LAYERS.BACKGROUND, {
                type: 'rectangle',
                x: 0, y: 0,
                width: canvas.width,
                height: canvas.height,
                fillColor: bgColor
            });
            
            // Moving circle
            renderer.addToLayer(GAME_CONFIG.LAYERS.BALL, {
                type: 'circle',
                x: 400 + Math.sin(time) * 200,
                y: 300 + Math.cos(time * 0.7) * 150,
                radius: 20,
                fillColor: COLORS.BALL,
                strokeColor: COLORS.BALL_TRAIL,
                strokeWidth: 2
            });
            
            // Rotating rectangle
            renderer.addToLayer(GAME_CONFIG.LAYERS.BLOCKS, {
                type: 'rectangle',
                x: 350,
                y: 250,
                width: 100,
                height: 100,
                fillColor: COLORS.BLOCK_NORMAL,
                strokeColor: COLORS.UI_PRIMARY,
                strokeWidth: 3
            });
            
            if (debugMode) {
                // Performance text
                renderer.addToLayer(GAME_CONFIG.LAYERS.UI_OVERLAY, {
                    type: 'text',
                    x: 10, y: 10,
                    text: `Frame: ${frameCount} | Render Time: ${renderer.getRenderTime().toFixed(2)}ms`,
                    fillColor: '#10b981',
                    font: '14px monospace'
                });
                
                renderer.addToLayer(GAME_CONFIG.LAYERS.UI_OVERLAY, {
                    type: 'text',
                    x: 10, y: 30,
                    text: `Draw Calls: ${renderer.getDrawCalls()}`,
                    fillColor: '#f59e0b',
                    font: '14px monospace'
                });
            }
            
            renderer.render();
            frameCount++;
            
            requestAnimationFrame(gameLoop);
        }
        
        window.startTest = () => {
            isRunning = true;
            lastTime = performance.now();
            frameCount = 0;
            gameLoop();
        };
        
        window.stopTest = () => {
            isRunning = false;
        };
        
        window.toggleDebug = () => {
            debugMode = !debugMode;
        };
        
        // Auto-start
        startTest();
    </script>
</body>
</html>
```

### 8. Commit Changes

```bash
git add .
git commit -m "feat(game-loop): Implement core game loop and rendering system

- Add comprehensive constants system with game configuration
- Implement Vector2D class for all position/velocity calculations  
- Create GameStateManager with event system and state transitions
- Build layered Renderer with performance tracking and camera system
- Establish main Game class with proper game loop timing
- Add FPS monitoring and performance statistics
- Create UI event system and state-based screen management
- Include debug rendering and performance monitoring tools
- Add comprehensive error handling and fallback systems"
```

### 9. Merge Feature Branch

```bash
git checkout main
git merge feature/game-loop
git branch -d feature/game-loop
```

## Testing & Verification

### 1. Basic Functionality
- ✅ Open `index.html` - should show menu screen
- ✅ Click "Start Game" - should switch to game screen
- ✅ Game loop should be running (check console for logs)
- ✅ FPS counter should be displayed and updating

### 2. Performance Testing
- ✅ Open `test-game-loop.html` 
- ✅ Verify smooth 60 FPS animation
- ✅ Check render time stays under 16ms
- ✅ Confirm draw calls are reasonable (<20 per frame)

### 3. State Management
- ✅ Menu navigation works correctly
- ✅ State transitions logged in console
- ✅ UI screens show/hide properly
- ✅ Back buttons function correctly

## Success Criteria

✅ **Game loop runs at stable 60 FPS**  
✅ **Layered rendering system functional**  
✅ **State management working correctly**  
✅ **Vector math utilities implemented**  
✅ **Performance monitoring active**  
✅ **UI event system responding**  
✅ **Error handling in place**  
✅ **Cross-browser compatibility verified**  
✅ **Debug tools functional**  
✅ **Memory management efficient**

## Next Step
Proceed to `instructions/step-05-physics-engine.md`