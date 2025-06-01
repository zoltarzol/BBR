/**
 * Block Entity for Block Breaker Revolution
 * Handles destructible blocks with various types and special mechanics
 */

import { PhysicsBody } from '../physics/physicsEngine.js';
import { Vector2D } from '../../utils/vector.js';
import { GAME_CONFIG, COLORS } from '../../utils/constants.js';

export class Block {
    constructor(x, y, type = 'normal', width = 60, height = 20) {
        // Create physics body
        this.physicsBody = new PhysicsBody(x, y, width, height, 'static');
        this.physicsBody.type = 'rectangle';
        this.physicsBody.restitution = 0.8;
        
        // Block properties
        this.type = type;
        this.isDestroyed = false;
        this.health = this.getHealthForType(type);
        this.maxHealth = this.health;
        this.points = this.getPointsForType(type);
        
        // Visual properties
        this.color = this.getColorForType(type);
        this.originalColor = this.color;
        this.damageFlash = 0;
        this.destructionAnimation = 0;
        
        // Special mechanics preparation
        this.emotionalState = 'neutral';
        this.memoryImprint = null;
        this.liquidType = null;
        this.soundFrequency = 440; // Base frequency for sound mechanics
        
        // Effects
        this.particles = [];
        this.glowIntensity = 0;
        this.shakeOffset = new Vector2D(0, 0);
        this.shakeIntensity = 0;
        
        // Setup collision callback
        this.physicsBody.onCollision = (other, normal) => {
            this.handleCollision(other, normal);
        };
    }
    
    /**
     * Get health based on block type
     */
    getHealthForType(type) {
        switch(type) {
            case 'normal': return 1;
            case 'strong': return 2;
            case 'super': return 3;
            case 'special': return 1;
            case 'echo': return 1;
            case 'liquid': return 1;
            case 'emotional': return 1;
            case 'sound': return 1;
            default: return 1;
        }
    }
    
    /**
     * Get points based on block type
     */
    getPointsForType(type) {
        switch(type) {
            case 'normal': return 10;
            case 'strong': return 25;
            case 'super': return 50;
            case 'special': return 100;
            case 'echo': return 30;
            case 'liquid': return 40;
            case 'emotional': return 35;
            case 'sound': return 45;
            default: return 10;
        }
    }
    
    /**
     * Get color based on block type
     */
    getColorForType(type) {
        switch(type) {
            case 'normal': return COLORS.BLOCK_NORMAL;
            case 'strong': return COLORS.BLOCK_STRONG;
            case 'super': return '#8b5cf6'; // Purple for super blocks
            case 'special': return COLORS.BLOCK_SPECIAL;
            case 'echo': return COLORS.BLOCK_ECHO;
            case 'liquid': return COLORS.BLOCK_LIQUID;
            case 'emotional': return COLORS.EMOTION_HAPPY;
            case 'sound': return '#f59e0b'; // Orange for sound blocks
            default: return COLORS.BLOCK_NORMAL;
        }
    }
    
    /**
     * Handle collision with ball or other objects
     */
    handleCollision(other, normal) {
        if (other.type === 'circle' && !this.isDestroyed) {
            this.takeDamage(1, other);
        }
    }
    
    /**
     * Take damage and handle destruction
     */
    takeDamage(damage, source = null) {
        if (this.isDestroyed) return false;
        
        this.health -= damage;
        this.damageFlash = 1.0;
        this.shakeIntensity = 0.5;
        
        // Create damage particles
        this.createDamageParticles();
        
        // Handle special block effects
        this.handleSpecialEffects(source);
        
        if (this.health <= 0) {
            this.destroy();
            return true; // Block was destroyed
        }
        
        return false; // Block still alive
    }
    
    /**
     * Handle special effects based on block type
     */
    handleSpecialEffects(source) {
        switch(this.type) {
            case 'echo':
                this.createEchoEffect();
                break;
            case 'liquid':
                this.createLiquidSplash();
                break;
            case 'emotional':
                this.updateEmotionalState();
                break;
            case 'sound':
                this.createSoundWave();
                break;
            case 'special':
                this.createSpecialEffect();
                break;
        }
    }
    
    /**
     * Create echo effect for echo blocks
     */
    createEchoEffect() {
        // Create memory imprint for Memory Imprint mechanic
        this.memoryImprint = {
            position: this.physicsBody.getCenter().clone(),
            timestamp: Date.now(),
            strength: 1.0,
            type: 'echo'
        };
        
        console.log('Echo block created memory imprint');
    }
    
    /**
     * Create liquid splash effect
     */
    createLiquidSplash() {
        const center = this.physicsBody.getCenter();
        const particleCount = 15;
        
        for (let i = 0; i < particleCount; i++) {
            const angle = (Math.PI * 2 * i) / particleCount;
            const speed = 50 + Math.random() * 100;
            
            this.particles.push({
                position: center.clone(),
                velocity: Vector2D.fromAngle(angle, speed),
                life: 1.0,
                maxLife: 0.5 + Math.random() * 0.5,
                size: 2 + Math.random() * 3,
                color: COLORS.LIQUID_WATER,
                type: 'liquid'
            });
        }
    }
    
    /**
     * Update emotional state for emotional blocks
     */
    updateEmotionalState() {
        const emotions = ['happy', 'sad', 'angry', 'scared'];
        this.emotionalState = emotions[Math.floor(Math.random() * emotions.length)];
        
        // Update color based on emotion
        switch(this.emotionalState) {
            case 'happy': this.color = COLORS.EMOTION_HAPPY; break;
            case 'sad': this.color = COLORS.EMOTION_SAD; break;
            case 'angry': this.color = COLORS.EMOTION_ANGRY; break;
            case 'scared': this.color = COLORS.EMOTION_SCARED; break;
        }
        
        console.log(`Block emotion changed to: ${this.emotionalState}`);
    }
    
    /**
     * Create sound wave effect
     */
    createSoundWave() {
        // Modify sound frequency based on damage
        this.soundFrequency = 440 + (this.maxHealth - this.health) * 100;
        this.glowIntensity = 1.0;
        
        console.log(`Sound block frequency: ${this.soundFrequency}Hz`);
    }
    
    /**
     * Create special effect for special blocks
     */
    createSpecialEffect() {
        // Create rainbow particles
        const center = this.physicsBody.getCenter();
        const colors = [COLORS.BLOCK_NORMAL, COLORS.BLOCK_STRONG, COLORS.BLOCK_SPECIAL, COLORS.BLOCK_ECHO];
        
        for (let i = 0; i < 20; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 30 + Math.random() * 80;
            
            this.particles.push({
                position: center.clone(),
                velocity: Vector2D.fromAngle(angle, speed),
                life: 1.0,
                maxLife: 0.8 + Math.random() * 0.4,
                size: 1 + Math.random() * 2,
                color: colors[Math.floor(Math.random() * colors.length)],
                type: 'special'
            });
        }
    }
    
    /**
     * Create damage particles
     */
    createDamageParticles() {
        const center = this.physicsBody.getCenter();
        const particleCount = 5 + Math.random() * 5;
        
        for (let i = 0; i < particleCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 20 + Math.random() * 60;
            
            this.particles.push({
                position: center.clone(),
                velocity: Vector2D.fromAngle(angle, speed),
                life: 1.0,
                maxLife: 0.3 + Math.random() * 0.3,
                size: 1 + Math.random() * 2,
                color: this.color,
                type: 'damage'
            });
        }
    }
    
    /**
     * Destroy the block
     */
    destroy() {
        this.isDestroyed = true;
        this.physicsBody.isActive = false;
        this.destructionAnimation = 1.0;
        
        // Create destruction particles
        this.createDestructionParticles();
        
        console.log(`${this.type} block destroyed! Points: ${this.points}`);
    }
    
    /**
     * Create destruction particles
     */
    createDestructionParticles() {
        const center = this.physicsBody.getCenter();
        const particleCount = 20 + Math.random() * 10;
        
        for (let i = 0; i < particleCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 40 + Math.random() * 120;
            
            this.particles.push({
                position: center.clone(),
                velocity: Vector2D.fromAngle(angle, speed),
                life: 1.0,
                maxLife: 0.6 + Math.random() * 0.6,
                size: 2 + Math.random() * 4,
                color: this.originalColor,
                type: 'destruction'
            });
        }
    }
    
    /**
     * Update block state
     */
    update(deltaTime) {
        if (this.isDestroyed && this.particles.length === 0) {
            return; // Block is fully destroyed and cleaned up
        }
        
        // Update visual effects
        this.updateVisualEffects(deltaTime);
        
        // Update particles
        this.updateParticles(deltaTime);
        
        // Update shake effect
        this.updateShake(deltaTime);
    }
    
    /**
     * Update visual effects
     */
    updateVisualEffects(deltaTime) {
        // Damage flash decay
        this.damageFlash *= Math.pow(0.1, deltaTime);
        
        // Glow intensity decay
        this.glowIntensity *= Math.pow(0.5, deltaTime);
        
        // Destruction animation
        if (this.isDestroyed) {
            this.destructionAnimation *= Math.pow(0.3, deltaTime);
        }
    }
    
    /**
     * Update particles
     */
    updateParticles(deltaTime) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            
            // Update position
            particle.position.add(Vector2D.multiply(particle.velocity, deltaTime));
            
            // Update life
            particle.life -= deltaTime / particle.maxLife;
            
            // Apply gravity to some particle types
            if (particle.type === 'liquid' || particle.type === 'destruction') {
                particle.velocity.y += 200 * deltaTime; // Gravity effect
            }
            
            // Slow down particles
            particle.velocity.multiply(0.98);
            
            // Remove dead particles
            if (particle.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }
    
    /**
     * Update shake effect
     */
    updateShake(deltaTime) {
        if (this.shakeIntensity > 0) {
            this.shakeOffset.set(
                (Math.random() - 0.5) * this.shakeIntensity * 4,
                (Math.random() - 0.5) * this.shakeIntensity * 4
            );
            this.shakeIntensity *= Math.pow(0.1, deltaTime);
        } else {
            this.shakeOffset.set(0, 0);
        }
    }
    
    /**
     * Get block center position
     */
    getCenter() {
        return this.physicsBody.getCenter();
    }
    
    /**
     * Get block bounds
     */
    getBounds() {
        return this.physicsBody.bounds;
    }
    
    /**
     * Check if block is destroyed
     */
    isCompletelyDestroyed() {
        return this.isDestroyed && this.particles.length === 0;
    }
    
    /**
     * Render block with visual effects
     */
    render(renderer) {
        if (this.isDestroyed && this.destructionAnimation <= 0.1) {
            // Only render particles for destroyed blocks
            this.renderParticles(renderer);
            return;
        }
        
        const ctx = renderer.ctx;
        const pos = Vector2D.add(this.physicsBody.position, this.shakeOffset);
        const size = this.physicsBody.size;
        
        ctx.save();
        
        // Destruction fade effect
        if (this.isDestroyed) {
            ctx.globalAlpha = this.destructionAnimation;
        }
        
        // Glow effect
        if (this.glowIntensity > 0) {
            ctx.shadowColor = this.color;
            ctx.shadowBlur = 15 * this.glowIntensity;
        }
        
        // Damage flash effect
        let renderColor = this.color;
        if (this.damageFlash > 0) {
            const flashIntensity = this.damageFlash;
            renderColor = `rgba(255, 255, 255, ${flashIntensity})`;
        }
        
        // Main block body
        ctx.fillStyle = renderColor;
        ctx.fillRect(pos.x, pos.y, size.x, size.y);
        
        // Health indicator for multi-hit blocks
        if (this.maxHealth > 1 && !this.isDestroyed) {
            const healthRatio = this.health / this.maxHealth;
            const barWidth = size.x - 4;
            const barHeight = 3;
            
            // Health bar background
            ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            ctx.fillRect(pos.x + 2, pos.y + 2, barWidth, barHeight);
            
            // Health bar fill
            ctx.fillStyle = healthRatio > 0.5 ? '#10b981' : healthRatio > 0.25 ? '#f59e0b' : '#ef4444';
            ctx.fillRect(pos.x + 2, pos.y + 2, barWidth * healthRatio, barHeight);
        }
        
        // Block border
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.lineWidth = 1;
        ctx.strokeRect(pos.x, pos.y, size.x, size.y);
        
        // Special type indicators
        this.renderTypeIndicator(renderer, pos, size);
        
        ctx.restore();
        
        // Render particles
        this.renderParticles(renderer);
    }
    
    /**
     * Render type-specific indicators
     */
    renderTypeIndicator(renderer, pos, size) {
        const ctx = renderer.ctx;
        const centerX = pos.x + size.x / 2;
        const centerY = pos.y + size.y / 2;
        
        ctx.save();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        switch(this.type) {
            case 'strong':
                ctx.fillText('S', centerX, centerY);
                break;
            case 'super':
                ctx.fillText('★', centerX, centerY);
                break;
            case 'special':
                ctx.fillText('◆', centerX, centerY);
                break;
            case 'echo':
                ctx.fillText('♪', centerX, centerY);
                break;
            case 'liquid':
                ctx.fillText('~', centerX, centerY);
                break;
            case 'emotional':
                const emotionSymbols = { happy: '☺', sad: '☹', angry: '😠', scared: '😨' };
                ctx.fillText(emotionSymbols[this.emotionalState] || '○', centerX, centerY);
                break;
            case 'sound':
                ctx.fillText('♫', centerX, centerY);
                break;
        }
        
        ctx.restore();
    }
    
    /**
     * Render particles
     */
    renderParticles(renderer) {
        const ctx = renderer.ctx;
        
        ctx.save();
        
        this.particles.forEach(particle => {
            ctx.globalAlpha = particle.life;
            ctx.fillStyle = particle.color;
            ctx.beginPath();
            ctx.arc(particle.position.x, particle.position.y, particle.size, 0, Math.PI * 2);
            ctx.fill();
        });
        
        ctx.restore();
    }
}