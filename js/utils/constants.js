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