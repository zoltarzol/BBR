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