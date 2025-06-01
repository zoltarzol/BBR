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