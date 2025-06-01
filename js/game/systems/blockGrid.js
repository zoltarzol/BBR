/**
 * Block Grid Manager for Block Breaker Revolution
 * Handles block arrangement, level generation, and grid management
 */

import { Block } from '../entities/block.js';
import { Vector2D } from '../../utils/vector.js';
import { GAME_CONFIG, COLORS } from '../../utils/constants.js';

export class BlockGrid {
    constructor(physicsEngine) {
        this.physics = physicsEngine;
        this.blocks = [];
        this.gridWidth = 0;
        this.gridHeight = 0;
        this.blockWidth = 60;
        this.blockHeight = 20;
        this.blockSpacing = 2;
        this.gridOffsetX = 50;
        this.gridOffsetY = 50;
        
        // Level management
        this.currentLevel = 1;
        this.totalBlocks = 0;
        this.destroyedBlocks = 0;
        this.score = 0;
        
        // Grid bounds
        this.maxGridWidth = Math.floor((GAME_CONFIG.CANVAS.WIDTH - this.gridOffsetX * 2) / (this.blockWidth + this.blockSpacing));
        this.maxGridHeight = 10; // Maximum rows
    }
    
    /**
     * Generate a level with specified pattern
     */
    generateLevel(levelNumber = 1) {
        this.clearGrid();
        this.currentLevel = levelNumber;
        
        switch(levelNumber) {
            case 1:
                this.generateBasicLevel();
                break;
            case 2:
                this.generateMixedLevel();
                break;
            case 3:
                this.generateAdvancedLevel();
                break;
            default:
                this.generateRandomLevel(levelNumber);
                break;
        }
        
        this.totalBlocks = this.blocks.length;
        this.destroyedBlocks = 0;
        
        console.log(`Level ${levelNumber} generated with ${this.totalBlocks} blocks`);
    }
    
    /**
     * Generate basic level (Level 1)
     */
    generateBasicLevel() {
        const rows = 5;
        const cols = 10;
        
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                let blockType = 'normal';
                
                // Add some variety
                if (row === 0) blockType = 'strong'; // Top row is stronger
                if (Math.random() < 0.1) blockType = 'special'; // 10% special blocks
                
                this.createBlock(col, row, blockType);
            }
        }
    }
    
    /**
     * Generate mixed level (Level 2)
     */
    generateMixedLevel() {
        const rows = 6;
        const cols = 12;
        
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                let blockType = 'normal';
                
                // Create patterns
                if (row === 0 || row === rows - 1) {
                    blockType = 'strong'; // Top and bottom rows
                } else if (col === 0 || col === cols - 1) {
                    blockType = 'strong'; // Side columns
                } else if ((row + col) % 3 === 0) {
                    blockType = 'echo'; // Echo blocks in pattern
                } else if (Math.random() < 0.15) {
                    const specialTypes = ['special', 'liquid', 'emotional'];
                    blockType = specialTypes[Math.floor(Math.random() * specialTypes.length)];
                }
                
                this.createBlock(col, row, blockType);
            }
        }
    }
    
    /**
     * Generate advanced level (Level 3)
     */
    generateAdvancedLevel() {
        const rows = 8;
        const cols = 14;
        
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                // Skip some blocks to create gaps
                if (Math.random() < 0.1) continue;
                
                let blockType = 'normal';
                
                // Create complex patterns
                if (row < 2) {
                    blockType = 'super'; // Top rows are super strong
                } else if (row === 2 || row === 3) {
                    blockType = 'strong';
                } else {
                    // Mix of special types
                    const rand = Math.random();
                    if (rand < 0.2) blockType = 'echo';
                    else if (rand < 0.35) blockType = 'liquid';
                    else if (rand < 0.5) blockType = 'emotional';
                    else if (rand < 0.6) blockType = 'sound';
                    else if (rand < 0.7) blockType = 'special';
                }
                
                this.createBlock(col, row, blockType);
            }
        }
    }
    
    /**
     * Generate random level for higher levels
     */
    generateRandomLevel(levelNumber) {
        const rows = Math.min(6 + Math.floor(levelNumber / 3), this.maxGridHeight);
        const cols = Math.min(10 + Math.floor(levelNumber / 2), this.maxGridWidth);
        
        // Increase difficulty with level
        const strongBlockChance = Math.min(0.3 + levelNumber * 0.05, 0.6);
        const specialBlockChance = Math.min(0.1 + levelNumber * 0.02, 0.3);
        
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                // Create gaps for higher levels
                if (levelNumber > 5 && Math.random() < 0.15) continue;
                
                let blockType = 'normal';
                const rand = Math.random();
                
                if (rand < specialBlockChance) {
                    const specialTypes = ['special', 'echo', 'liquid', 'emotional', 'sound'];
                    blockType = specialTypes[Math.floor(Math.random() * specialTypes.length)];
                } else if (rand < strongBlockChance) {
                    blockType = levelNumber > 10 ? 'super' : 'strong';
                }
                
                this.createBlock(col, row, blockType);
            }
        }
    }
    
    /**
     * Create a block at grid position
     */
    createBlock(gridX, gridY, type = 'normal') {
        const x = this.gridOffsetX + gridX * (this.blockWidth + this.blockSpacing);
        const y = this.gridOffsetY + gridY * (this.blockHeight + this.blockSpacing);
        
        const block = new Block(x, y, type, this.blockWidth, this.blockHeight);
        this.blocks.push(block);
        this.physics.addBody(block.physicsBody);
        
        return block;
    }
    
    /**
     * Clear all blocks from the grid
     */
    clearGrid() {
        // Remove blocks from physics engine
        this.blocks.forEach(block => {
            this.physics.removeBody(block.physicsBody.id);
        });
        
        this.blocks = [];
        this.gridWidth = 0;
        this.gridHeight = 0;
    }
    
    /**
     * Update all blocks
     */
    update(deltaTime) {
        // Update all blocks
        for (let i = this.blocks.length - 1; i >= 0; i--) {
            const block = this.blocks[i];
            block.update(deltaTime);
            
            // Remove completely destroyed blocks
            if (block.isCompletelyDestroyed()) {
                this.physics.removeBody(block.physicsBody.id);
                this.blocks.splice(i, 1);
                this.destroyedBlocks++;
                this.score += block.points;
            }
        }
    }
    
    /**
     * Handle block destruction
     */
    onBlockDestroyed(block) {
        this.destroyedBlocks++;
        this.score += block.points;
        
        // Check for level completion
        if (this.isLevelComplete()) {
            console.log(`Level ${this.currentLevel} completed! Score: ${this.score}`);
            return true;
        }
        
        return false;
    }
    
    /**
     * Check if level is complete
     */
    isLevelComplete() {
        return this.getActiveBlocks().length === 0;
    }
    
    /**
     * Get all active (non-destroyed) blocks
     */
    getActiveBlocks() {
        return this.blocks.filter(block => !block.isDestroyed);
    }
    
    /**
     * Get all blocks of a specific type
     */
    getBlocksByType(type) {
        return this.blocks.filter(block => block.type === type && !block.isDestroyed);
    }
    
    /**
     * Get block at specific position
     */
    getBlockAt(x, y) {
        return this.blocks.find(block => {
            if (block.isDestroyed) return false;
            const bounds = block.getBounds();
            return x >= bounds.left && x <= bounds.right && 
                   y >= bounds.top && y <= bounds.bottom;
        });
    }
    
    /**
     * Get blocks in radius around point
     */
    getBlocksInRadius(centerX, centerY, radius) {
        const center = new Vector2D(centerX, centerY);
        return this.blocks.filter(block => {
            if (block.isDestroyed) return false;
            const blockCenter = block.getCenter();
            return Vector2D.distance(center, blockCenter) <= radius;
        });
    }
    
    /**
     * Apply effect to blocks in area
     */
    applyAreaEffect(centerX, centerY, radius, effect) {
        const affectedBlocks = this.getBlocksInRadius(centerX, centerY, radius);
        
        affectedBlocks.forEach(block => {
            switch(effect.type) {
                case 'damage':
                    block.takeDamage(effect.amount);
                    break;
                case 'destroy':
                    block.destroy();
                    break;
                case 'emotion':
                    if (block.type === 'emotional') {
                        block.emotionalState = effect.emotion;
                    }
                    break;
            }
        });
        
        return affectedBlocks.length;
    }
    
    /**
     * Get level statistics
     */
    getLevelStats() {
        const activeBlocks = this.getActiveBlocks();
        const blocksByType = {};
        
        activeBlocks.forEach(block => {
            blocksByType[block.type] = (blocksByType[block.type] || 0) + 1;
        });
        
        return {
            level: this.currentLevel,
            totalBlocks: this.totalBlocks,
            activeBlocks: activeBlocks.length,
            destroyedBlocks: this.destroyedBlocks,
            score: this.score,
            completionPercentage: (this.destroyedBlocks / this.totalBlocks) * 100,
            blocksByType
        };
    }
    
    /**
     * Render all blocks
     */
    render(renderer) {
        // Render blocks in reverse order for proper layering
        for (let i = this.blocks.length - 1; i >= 0; i--) {
            this.blocks[i].render(renderer);
        }
        
        // Render grid debug info if enabled
        if (GAME_CONFIG.DEBUG && GAME_CONFIG.DEBUG.SHOW_GRID) {
            this.renderGridDebug(renderer);
        }
    }
    
    /**
     * Render grid debug information
     */
    renderGridDebug(renderer) {
        const ctx = renderer.ctx;
        
        ctx.save();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 1;
        ctx.setLineDash([2, 2]);
        
        // Draw grid lines
        for (let col = 0; col <= this.maxGridWidth; col++) {
            const x = this.gridOffsetX + col * (this.blockWidth + this.blockSpacing);
            ctx.beginPath();
            ctx.moveTo(x, this.gridOffsetY);
            ctx.lineTo(x, this.gridOffsetY + this.maxGridHeight * (this.blockHeight + this.blockSpacing));
            ctx.stroke();
        }
        
        for (let row = 0; row <= this.maxGridHeight; row++) {
            const y = this.gridOffsetY + row * (this.blockHeight + this.blockSpacing);
            ctx.beginPath();
            ctx.moveTo(this.gridOffsetX, y);
            ctx.lineTo(this.gridOffsetX + this.maxGridWidth * (this.blockWidth + this.blockSpacing), y);
            ctx.stroke();
        }
        
        ctx.restore();
    }
}