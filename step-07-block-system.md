# Step 07: Block System Foundation

## Objective
Create a comprehensive block system that serves as the foundation for all innovative mechanics including emotional AI, liquid physics, memory system integration, and collaborative intelligence. Implement multiple block types with extensible architecture.

## Prerequisites
- Step 06 completed successfully
- Paddle and ball mechanics operational
- Physics engine integrated with game objects

## Deliverables
- Block base class with extensible architecture
- Multiple block types (Normal, Strong, Special, Echo, Liquid)
- Block manager for efficient handling and rendering
- Grid-based level system foundation
- Block destruction and effects system
- Feature branch created and merged

## Step-by-Step Instructions

### 1. Create Feature Branch
```bash
git checkout -b feature/block-system
git branch
```

### 2. Create Base Block Class (js/game/mechanics/blocks/baseBlock.js)

```javascript
/**
 * Base Block Class - Foundation for all block types
 */
import { Vector2D } from '../../../utils/vector.js';
import { GAME_CONFIG, COLORS } from '../../../utils/constants.js';
import { PhysicsBody } from '../../physics/physicsEngine.js';
import { Rectangle } from '../../physics/shapes.js';
import { MathUtils, TimeUtils } from '../../../utils/helpers.js';

export class BaseBlock {
    constructor(x, y, width, height, options = {}) {
        // Block properties
        this.width = width;
        this.height = height;
        this.type = options.type || 'normal';
        this.id = options.id || `block_${Date.now()}_${Math.random()}`;
        
        // Create physics body
        const shape = new Rectangle(x, y, width, height);
        this.physicsBody = new PhysicsBody(shape, {
            isStatic: true,
            restitution: options.restitution || 0.8,
            userData: { 
                type: 'block',
                blockType: this.type,
                owner: this
            }
        });
        
        // Position
        this.position = this.physicsBody.position;
        this.gridPosition = { x: 0, y: 0 }; // Position in block grid
        
        // Block state
        this.health = options.health || 1;
        this.maxHealth = this.health;
        this.isDestroyed = false;
        this.isActive = true;
        this.isVisible = true;
        
        // Visual properties
        this.color = options.color || COLORS.BLOCK_NORMAL;
        this.baseColor = this.color;
        this.strokeColor = options.strokeColor || null;
        this.strokeWidth = options.strokeWidth || 1;
        
        // Animation properties
        this.animationTime = 0;
        this.scale = 1.0;
        this.rotation = 0;
        this.alpha = 1.0;
        this.glowIntensity = 0;
        
        // Destruction effects
        this.destructionTimer = 0;
        this.destructionDuration = 300; // ms
        this.particles = [];
        
        // Special mechanics foundation
        this.emotions = {
            current: 'neutral',
            intensity: 0,
            lastUpdate: 0
        };
        this.liquidContent = null;
        this.memoryData = {
            hitHistory: [],
            successfulPaths: []
        };
        this.intelligence = {
            communicationRange: 100,
            alertLevel: 0,
            allies: new Set(),
            threats: new Set()
        };
        
        // Sound and effects
        this.soundTriggers = {
            hit: false,
            destroy: false,
            special: false
        };
        
        // Performance tracking
        this.hitCount = 0;
        this.lastHitTime = 0;
        this.creationTime = performance.now();
        
        // Special effects
        this.specialEffects = new Set();
        this.statusEffects = new Map(); // Time-based effects
        
        // Points and scoring
        this.pointValue = options.pointValue || 10;
        this.bonusMultiplier = 1.0;
    }
    
    update(deltaTime) {
        if (!this.isActive) return;
        
        this.animationTime += deltaTime;
        
        // Update destruction animation
        if (this.isDestroyed) {
            this.updateDestruction(deltaTime);
            return;
        }
        
        // Update visual effects
        this.updateVisualEffects(deltaTime);
        
        // Update status effects
        this.updateStatusEffects(deltaTime);
        
        // Update special mechanics
        this.updateEmotions(deltaTime);
        this.updateIntelligence(deltaTime);
        
        // Update particles
        this.updateParticles(deltaTime);
        
        // Reset sound triggers
        this.resetSoundTriggers();
    }
    
    updateVisualEffects(deltaTime) {
        // Update glow effect
        if (this.glowIntensity > 0) {
            this.glowIntensity -= deltaTime * 3;
            this.glowIntensity = Math.max(0, this.glowIntensity);
        }
        
        // Update scale animation
        if (this.scale !== 1.0) {
            const target = 1.0;
            const speed = 5.0;
            this.scale += (target - this.scale) * speed * deltaTime;
            
            if (Math.abs(this.scale - target) < 0.01) {
                this.scale = target;
            }
        }
        
        // Emotional visual updates
        this.updateEmotionalVisuals(deltaTime);
    }
    
    updateEmotionalVisuals(deltaTime) {
        // Different emotions affect appearance
        switch (this.emotions.current) {
            case 'happy':
                this.color = this.blendColors(this.baseColor, COLORS.EMOTION_HAPPY, 
                    this.emotions.intensity * 0.3);
                break;
            case 'angry':
                this.color = this.blendColors(this.baseColor, COLORS.EMOTION_ANGRY, 
                    this.emotions.intensity * 0.4);
                this.glowIntensity = Math.max(this.glowIntensity, this.emotions.intensity * 0.5);
                break;
            case 'sad':
                this.color = this.blendColors(this.baseColor, COLORS.EMOTION_SAD, 
                    this.emotions.intensity * 0.2);
                this.alpha = 1.0 - this.emotions.intensity * 0.3;
                break;
            case 'scared':
                this.scale = 1.0 - this.emotions.intensity * 0.1;
                this.color = this.blendColors(this.baseColor, COLORS.EMOTION_SCARED, 
                    this.emotions.intensity * 0.2);
                break;
            default:
                this.color = this.baseColor;
                this.alpha = 1.0;
        }
    }
    
    updateEmotions(deltaTime) {
        // Emotional state naturally decays towards neutral
        if (this.emotions.current !== 'neutral') {
            this.emotions.intensity -= deltaTime * 0.5;
            
            if (this.emotions.intensity <= 0) {
                this.emotions.current = 'neutral';
                this.emotions.intensity = 0;
            }
        }
        
        this.emotions.lastUpdate = performance.now();
    }
    
    updateIntelligence(deltaTime) {
        // Alert level naturally decreases
        if (this.intelligence.alertLevel > 0) {
            this.intelligence.alertLevel -= deltaTime * 0.3;
            this.intelligence.alertLevel = Math.max(0, this.intelligence.alertLevel);
        }
        
        // Clear old threats
        const now = performance.now();
        this.intelligence.threats.forEach(threat => {
            if (now - threat.timestamp > 5000) { // 5 second memory
                this.intelligence.threats.delete(threat);
            }
        });
    }
    
    updateStatusEffects(deltaTime) {
        const now = performance.now();
        
        for (const [effectName, effectData] of this.statusEffects) {
            if (now >= effectData.endTime) {
                this.removeStatusEffect(effectName);
            } else {
                // Update effect
                if (effectData.update) {
                    effectData.update(deltaTime, this);
                }
            }
        }
    }
    
    updateDestruction(deltaTime) {
        this.destructionTimer += deltaTime * 1000; // Convert to ms
        
        const progress = this.destructionTimer / this.destructionDuration;
        
        // Destruction animation
        this.scale = 1.0 + progress * 0.5; // Expand
        this.alpha = 1.0 - progress; // Fade out
        this.rotation = progress * Math.PI; // Rotate
        
        if (progress >= 1.0) {
            this.completeDestruction();
        }
    }
    
    updateParticles(deltaTime) {
        this.particles = this.particles.filter(particle => {
            particle.position.add(particle.velocity.clone().multiply(deltaTime));
            particle.life -= deltaTime;
            particle.alpha = particle.life / particle.maxLife;
            
            return particle.life > 0;
        });
    }
    
    // Collision handling
    onHit(ball, collisionInfo) {
        this.hitCount++;
        this.lastHitTime = performance.now();
        this.soundTriggers.hit = true;
        
        // Store hit in memory
        this.memoryData.hitHistory.push({
            timestamp: performance.now(),
            ballPosition: ball.getPosition(),
            ballVelocity: ball.getVelocity(),
            contactPoint: collisionInfo.contactPoint.clone()
        });
        
        // Limit memory size
        if (this.memoryData.hitHistory.length > 20) {
            this.memoryData.hitHistory.shift();
        }
        
        // Emotional response to being hit
        this.triggerEmotion('hurt', 0.8);
        
        // Alert nearby blocks
        this.alertNearbyBlocks(ball);
        
        // Take damage
        this.takeDamage(1);
        
        // Visual feedback
        this.glowIntensity = 1.0;
        this.scale = 1.2;
        
        // Create hit particles
        this.createHitParticles(collisionInfo.contactPoint);
    }
    
    takeDamage(amount) {
        this.health -= amount;
        
        if (this.health <= 0) {
            this.destroy();
        } else {
            // Damage visual feedback
            this.triggerEmotion('angry', 0.6);
        }
    }
    
    destroy() {
        if (this.isDestroyed) return;
        
        this.isDestroyed = true;
        this.soundTriggers.destroy = true;
        
        // Emotional response
        this.triggerEmotion('sad', 1.0);
        
        // Alert allies about destruction
        this.alertAllies('destroyed');
        
        // Create destruction particles
        this.createDestructionParticles();
        
        // Spawn liquid if applicable
        if (this.liquidContent) {
            this.spawnLiquid();
        }
        
        // Special destruction effects
        this.onDestroy();
    }
    
    onDestroy() {
        // Override in subclasses for special destruction behavior
    }
    
    completeDestruction() {
        // Remove from physics world
        this.isActive = false;
        this.isVisible = false;
        
        // Will be removed from block manager
    }
    
    // Emotional system
    triggerEmotion(emotion, intensity) {
        this.emotions.current = emotion;
        this.emotions.intensity = Math.min(1.0, intensity);
        this.emotions.lastUpdate = performance.now();
    }
    
    getEmotionalState() {
        return {
            emotion: this.emotions.current,
            intensity: this.emotions.intensity,
            age: performance.now() - this.emotions.lastUpdate
        };
    }
    
    // Intelligence system
    alertNearbyBlocks(threat) {
        this.intelligence.threats.add({
            object: threat,
            timestamp: performance.now(),
            position: threat.getPosition()
        });
        
        this.intelligence.alertLevel = Math.min(1.0, this.intelligence.alertLevel + 0.5);
    }
    
    alertAllies(message) {
        // Will be implemented by block manager
        this.intelligence.alertLevel = 1.0;
    }
    
    receiveAlert(sender, message, data) {
        switch (message) {
            case 'threat_detected':
                this.intelligence.alertLevel = Math.min(1.0, this.intelligence.alertLevel + 0.3);
                this.triggerEmotion('scared', 0.5);
                break;
            case 'destroyed':
                this.triggerEmotion('sad', 0.7);
                this.intelligence.alertLevel = Math.min(1.0, this.intelligence.alertLevel + 0.4);
                break;
            case 'support':
                this.triggerEmotion('happy', 0.3);
                break;
        }
    }
    
    // Status effects system
    addStatusEffect(name, duration, updateFunction, data = {}) {
        this.statusEffects.set(name, {
            endTime: performance.now() + duration,
            update: updateFunction,
            data: data
        });
    }
    
    removeStatusEffect(name) {
        const effect = this.statusEffects.get(name);
        if (effect && effect.onRemove) {
            effect.onRemove(this);
        }
        this.statusEffects.delete(name);
    }
    
    hasStatusEffect(name) {
        return this.statusEffects.has(name);
    }
    
    // Particle effects
    createHitParticles(contactPoint) {
        const particleCount = 5;
        for (let i = 0; i < particleCount; i++) {
            this.particles.push({
                position: contactPoint.clone(),
                velocity: Vector2D.fromAngle(
                    Math.random() * Math.PI * 2,
                    MathUtils.random(50, 150)
                ),
                life: MathUtils.random(0.3, 0.8),
                maxLife: 0.8,
                alpha: 1.0,
                color: this.color,
                size: MathUtils.random(2, 5)
            });
        }
    }
    
    createDestructionParticles() {
        const particleCount = 15;
        const center = new Vector2D(
            this.position.x + this.width / 2,
            this.position.y + this.height / 2
        );
        
        for (let i = 0; i < particleCount; i++) {
            this.particles.push({
                position: center.clone().add(new Vector2D(
                    MathUtils.random(-this.width/4, this.width/4),
                    MathUtils.random(-this.height/4, this.height/4)
                )),
                velocity: Vector2D.fromAngle(
                    Math.random() * Math.PI * 2,
                    MathUtils.random(100, 300)
                ),
                life: MathUtils.random(0.5, 1.5),
                maxLife: 1.5,
                alpha: 1.0,
                color: this.color,
                size: MathUtils.random(3, 8)
            });
        }
    }
    
    spawnLiquid() {
        // Foundation for liquid physics - will be implemented in liquid system
        console.log(`${this.type} block spawned liquid:`, this.liquidContent);
    }
    
    // Memory system
    getMemoryData() {
        return {
            hitHistory: [...this.memoryData.hitHistory],
            successfulPaths: [...this.memoryData.successfulPaths],
            blockId: this.id,
            position: this.position.clone()
        };
    }
    
    // Rendering
    getRenderData() {
        if (!this.isVisible) return [];
        
        const layers = [];
        
        // Render particles first
        this.particles.forEach(particle => {
            layers.push({
                layer: GAME_CONFIG.LAYERS.EFFECTS,
                object: {
                    type: 'circle',
                    x: particle.position.x,
                    y: particle.position.y,
                    radius: particle.size,
                    fillColor: this.adjustColorAlpha(particle.color, particle.alpha),
                    strokeColor: null
                }
            });
        });
        
        // Main block
        const blockObj = {
            type: 'rectangle',
            x: this.position.x,
            y: this.position.y,
            width: this.width * this.scale,
            height: this.height * this.scale,
            fillColor: this.adjustColorAlpha(this.color, this.alpha),
            strokeColor: this.strokeColor,
            strokeWidth: this.strokeWidth
        };
        
        // Apply glow effect
        if (this.glowIntensity > 0) {
            blockObj.strokeColor = COLORS.UI_PRIMARY;
            blockObj.strokeWidth = this.glowIntensity * 3;
        }
        
        // Apply rotation (for destruction animation)
        if (this.rotation !== 0) {
            blockObj.rotation = this.rotation;
        }
        
        layers.push({
            layer: GAME_CONFIG.LAYERS.BLOCKS,
            object: blockObj
        });
        
        // Emotion indicator
        if (this.emotions.current !== 'neutral' && this.emotions.intensity > 0.2) {
            layers.push(this.getEmotionIndicator());
        }
        
        // Status effect indicators
        this.statusEffects.forEach((effect, name) => {
            if (effect.data.showIndicator) {
                layers.push(this.getStatusIndicator(name, effect));
            }
        });
        
        return layers;
    }
    
    getEmotionIndicator() {
        const iconMap = {
            happy: '😊',
            angry: '😠',
            sad: '😢',
            scared: '😨'
        };
        
        return {
            layer: GAME_CONFIG.LAYERS.UI_OVERLAY,
            object: {
                type: 'text',
                x: this.position.x + this.width / 2,
                y: this.position.y - 10,
                text: iconMap[this.emotions.current] || '?',
                fillColor: COLORS.UI_PRIMARY,
                font: '16px Arial',
                textAlign: 'center',
                textBaseline: 'bottom'
            }
        };
    }
    
    getStatusIndicator(name, effect) {
        return {
            layer: GAME_CONFIG.LAYERS.UI_OVERLAY,
            object: {
                type: 'circle',
                x: this.position.x + this.width - 5,
                y: this.position.y + 5,
                radius: 3,
                fillColor: effect.data.indicatorColor || COLORS.UI_SECONDARY,
                strokeColor: null
            }
        };
    }
    
    // Utility methods
    adjustColorAlpha(color, alpha) {
        if (alpha >= 1.0) return color;
        
        const r = parseInt(color.slice(1, 3), 16);
        const g = parseInt(color.slice(3, 5), 16);
        const b = parseInt(color.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
    
    blendColors(color1, color2, ratio) {
        const r1 = parseInt(color1.slice(1, 3), 16);
        const g1 = parseInt(color1.slice(3, 5), 16);
        const b1 = parseInt(color1.slice(5, 7), 16);
        
        const r2 = parseInt(color2.slice(1, 3), 16);
        const g2 = parseInt(color2.slice(3, 5), 16);
        const b2 = parseInt(color2.slice(5, 7), 16);
        
        const r = Math.round(r1 * (1 - ratio) + r2 * ratio);
        const g = Math.round(g1 * (1 - ratio) + g2 * ratio);
        const b = Math.round(b1 * (1 - ratio) + b2 * ratio);
        
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
    
    getCenter() {
        return new Vector2D(
            this.position.x + this.width / 2,
            this.position.y + this.height / 2
        );
    }
    
    getBounds() {
        return {
            left: this.position.x,
            right: this.position.x + this.width,
            top: this.position.y,
            bottom: this.position.y + this.height,
            width: this.width,
            height: this.height
        };
    }
    
    getStats() {
        return {
            id: this.id,
            type: this.type,
            health: this.health,
            maxHealth: this.maxHealth,
            hitCount: this.hitCount,
            pointValue: this.pointValue,
            emotions: this.getEmotionalState(),
            intelligence: {
                alertLevel: this.intelligence.alertLevel,
                threatCount: this.intelligence.threats.size,
                allyCount: this.intelligence.allies.size
            },
            specialEffects: Array.from(this.specialEffects),
            statusEffects: Array.from(this.statusEffects.keys())
        };
    }
    
    // State management
    setPosition(x, y) {
        this.position.set(x, y);
        this.physicsBody.position.copy(this.position);
        this.physicsBody.shape.position.copy(this.position);
    }
    
    setHealth(health) {
        this.health = Math.max(0, health);
        if (this.health === 0) {
            this.destroy();
        }
    }
    
    setActive(active) {
        this.isActive = active;
        this.physicsBody.isActive = active;
    }
    
    setVisible(visible) {
        this.isVisible = visible;
    }
    
    reset() {
        this.health = this.maxHealth;
        this.isDestroyed = false;
        this.destructionTimer = 0;
        this.scale = 1.0;
        this.rotation = 0;
        this.alpha = 1.0;
        this.glowIntensity = 0;
        this.particles = [];
        this.emotions.current = 'neutral';
        this.emotions.intensity = 0;
        this.intelligence.alertLevel = 0;
        this.intelligence.threats.clear();
        this.statusEffects.clear();
        this.specialEffects.clear();
        this.memoryData.hitHistory = [];
        this.hitCount = 0;
        this.color = this.baseColor;
    }
}
```

### 3. Create Specific Block Types (js/game/mechanics/blocks/blockTypes.js)

```javascript
/**
 * Specific Block Type Implementations
 */
import { BaseBlock } from './baseBlock.js';
import { COLORS } from '../../../utils/constants.js';
import { Vector2D } from '../../../utils/vector.js';
import { MathUtils } from '../../../utils/helpers.js';

// Normal Block - Standard destructible block
export class NormalBlock extends BaseBlock {
    constructor(x, y, width, height, options = {}) {
        super(x, y, width, height, {
            type: 'normal',
            health: 1,
            color: COLORS.BLOCK_NORMAL,
            pointValue: 10,
            ...options
        });
    }
}

// Strong Block - Requires multiple hits
export class StrongBlock extends BaseBlock {
    constructor(x, y, width, height, options = {}) {
        super(x, y, width, height, {
            type: 'strong',
            health: 3,
            color: COLORS.BLOCK_STRONG,
            pointValue: 30,
            restitution: 0.9,
            ...options
        });
        
        this.damageStates = [
            COLORS.BLOCK_STRONG,
            '#ff6b6b', // Damaged
            '#ff4757'  // Heavily damaged
        ];
    }
    
    takeDamage(amount) {
        super.takeDamage(amount);
        
        // Change color based on damage
        if (this.health > 0) {
            const damageIndex = this.maxHealth - this.health;
            this.color = this.damageStates[damageIndex] || this.damageStates[this.damageStates.length - 1];
        }
    }
    
    onHit(ball, collisionInfo) {
        super.onHit(ball, collisionInfo);
        
        // Create sparks on hit
        this.createSparkParticles(collisionInfo.contactPoint);
        
        // Emotional response based on health
        if (this.health === 1) {
            this.triggerEmotion('scared', 0.9);
        } else if (this.health === 2) {
            this.triggerEmotion('angry', 0.7);
        }
    }
    
    createSparkParticles(contactPoint) {
        const sparkCount = 8;
        for (let i = 0; i < sparkCount; i++) {
            this.particles.push({
                position: contactPoint.clone(),
                velocity: Vector2D.fromAngle(
                    Math.random() * Math.PI * 2,
                    MathUtils.random(80, 200)
                ),
                life: MathUtils.random(0.2, 0.5),
                maxLife: 0.5,
                alpha: 1.0,
                color: '#ffd700', // Gold sparks
                size: MathUtils.random(1, 3)
            });
        }
    }
}

// Special Block - Triggers special effects
export class SpecialBlock extends BaseBlock {
    constructor(x, y, width, height, options = {}) {
        super(x, y, width, height, {
            type: 'special',
            health: 1,
            color: COLORS.BLOCK_SPECIAL,
            pointValue: 50,
            ...options
        });
        
        this.specialType = options.specialType || 'powerup';
        this.pulseSpeed = 2.0;
    }
    
    update(deltaTime) {
        super.update(deltaTime);
        
        // Pulsing animation
        const pulse = (Math.sin(this.animationTime * this.pulseSpeed) + 1) / 2;
        this.glowIntensity = pulse * 0.5;
    }
    
    onDestroy() {
        super.onDestroy();
        
        // Trigger special effect based on type
        this.triggerSpecialEffect();
        
        // Create spectacular destruction effect
        this.createSpecialDestructionParticles();
    }
    
    triggerSpecialEffect() {
        switch (this.specialType) {
            case 'powerup':
                // Will trigger power-up spawn
                console.log('Power-up triggered!');
                break;
            case 'multiball':
                // Will create additional balls
                console.log('Multi-ball triggered!');
                break;
            case 'paddle_expand':
                // Will expand paddle
                console.log('Paddle expand triggered!');
                break;
            case 'score_bonus':
                // Will multiply score
                console.log('Score bonus triggered!');
                break;
        }
        
        this.soundTriggers.special = true;
    }
    
    createSpecialDestructionParticles() {
        const particleCount = 25;
        const center = this.getCenter();
        
        for (let i = 0; i < particleCount; i++) {
            this.particles.push({
                position: center.clone(),
                velocity: Vector2D.fromAngle(
                    (i / particleCount) * Math.PI * 2,
                    MathUtils.random(150, 400)
                ),
                life: MathUtils.random(0.8, 1.5),
                maxLife: 1.5,
                alpha: 1.0,
                color: COLORS.BLOCK_SPECIAL,
                size: MathUtils.random(4, 10)
            });
        }
    }
}

// Echo Block - Foundation for memory system
export class EchoBlock extends BaseBlock {
    constructor(x, y, width, height, options = {}) {
        super(x, y, width, height, {
            type: 'echo',
            health: 1,
            color: COLORS.BLOCK_ECHO,
            pointValue: 25,
            ...options
        });
        
        this.requiredPath = null; // Path that must be replicated
        this.pathTolerance = 20; // Pixels
        this.isPathMatched = false;
    }
    
    update(deltaTime) {
        super.update(deltaTime);
        
        // Ghostly appearance
        this.alpha = 0.7 + Math.sin(this.animationTime * 3) * 0.3;
    }
    
    onHit(ball, collisionInfo) {
        // Check if this hit matches the required path
        if (this.requiredPath && this.checkPathMatch(ball)) {
            this.isPathMatched = true;
            this.triggerEmotion('happy', 1.0);
            super.onHit(ball, collisionInfo);
        } else {
            // Wrong path - block doesn't take damage
            this.triggerEmotion('neutral', 0.5);
            ball.velocity.multiply(-1); // Bounce back
            
            // Visual feedback for wrong hit
            this.glowIntensity = 0.5;
            this.createWrongPathParticles(collisionInfo.contactPoint);
        }
    }
    
    checkPathMatch(ball) {
        // Simplified path matching - will be enhanced in memory system
        const ballTrail = ball.getTrailData();
        if (!ballTrail.length || !this.requiredPath) return false;
        
        // Check if recent ball path matches required path
        const recentTrail = ballTrail.slice(-10); // Last 10 trail points
        
        // Simple distance-based matching
        let matchScore = 0;
        for (let i = 0; i < Math.min(recentTrail.length, this.requiredPath.length); i++) {
            const distance = recentTrail[i].position.distance(this.requiredPath[i].position);
            if (distance < this.pathTolerance) {
                matchScore++;
            }
        }
        
        return matchScore / Math.min(recentTrail.length, this.requiredPath.length) > 0.7;
    }
    
    setRequiredPath(pathData) {
        this.requiredPath = pathData;
    }
    
    createWrongPathParticles(contactPoint) {
        const particleCount = 5;
        for (let i = 0; i < particleCount; i++) {
            this.particles.push({
                position: contactPoint.clone(),
                velocity: Vector2D.fromAngle(
                    Math.random() * Math.PI * 2,
                    MathUtils.random(30, 80)
                ),
                life: MathUtils.random(0.5, 1.0),
                maxLife: 1.0,
                alpha: 1.0,
                color: '#666666', // Gray for wrong path
                size: MathUtils.random(2, 4)
            });
        }
    }
}

// Liquid Block - Foundation for liquid physics
export class LiquidBlock extends BaseBlock {
    constructor(x, y, width, height, options = {}) {
        super(x, y, width, height, {
            type: 'liquid',
            health: 1,
            color: COLORS.BLOCK_LIQUID,
            pointValue: 20,
            ...options
        });
        
        this.liquidType = options.liquidType || 'water';
        this.liquidAmount = options.liquidAmount || 1.0;
        
        // Set liquid content for destruction
        this.liquidContent = {
            type: this.liquidType,
            amount: this.liquidAmount,
            color: this.getLiquidColor(this.liquidType),
            viscosity: this.getLiquidViscosity(this.liquidType)
        };
        
        // Liquid-specific visual effects
        this.flowAnimation = 0;
    }
    
    update(deltaTime) {
        super.update(deltaTime);
        
        this.flowAnimation += deltaTime * 2;
        
        // Liquid flowing effect
        const flow = Math.sin(this.flowAnimation) * 0.1;
        this.alpha = 0.8 + flow;
    }
    
    getLiquidColor(type) {
        const colorMap = {
            water: COLORS.LIQUID_WATER,
            acid: COLORS.LIQUID_GREEN,
            fire: COLORS.LIQUID_FIRE,
            ice: COLORS.LIQUID_ICE
        };
        return colorMap[type] || COLORS.LIQUID_WATER;
    }
    
    getLiquidViscosity(type) {
        const viscosityMap = {
            water: 1.0,
            acid: 0.8,
            fire: 0.6,
            ice: 1.5
        };
        return viscosityMap[type] || 1.0;
    }
    
    onHit(ball, collisionInfo) {
        super.onHit(ball, collisionInfo);
        
        // Liquid splash effect
        this.createLiquidSplash(collisionInfo.contactPoint);
        
        // Apply liquid effect to ball
        this.applyLiquidEffect(ball);
    }
    
    applyLiquidEffect(ball) {
        switch (this.liquidType) {
            case 'water':
                // Slight speed reduction
                ball.addStatusEffect('wet', 3000, (deltaTime, ball) => {
                    ball.velocity.multiply(0.999);
                });
                break;
            case 'acid':
                // Corrosive effect
                ball.addSpecialEffect('corrosive', 2000);
                break;
            case 'fire':
                // Speed boost
                ball.addSpecialEffect('high_speed', 2000);
                break;
            case 'ice':
                // Slowing effect
                ball.addStatusEffect('frozen', 2000, (deltaTime, ball) => {
                    ball.velocity.multiply(0.98);
                });
                break;
        }
    }
    
    createLiquidSplash(contactPoint) {
        const splashCount = 12;
        for (let i = 0; i < splashCount; i++) {
            this.particles.push({
                position: contactPoint.clone(),
                velocity: Vector2D.fromAngle(
                    Math.PI * (i / splashCount) * 2,
                    MathUtils.random(100, 250)
                ),
                life: MathUtils.random(0.5, 1.2),
                maxLife: 1.2,
                alpha: 1.0,
                color: this.liquidContent.color,
                size: MathUtils.random(3, 7)
            });
        }
    }
    
    spawnLiquid() {
        // Create liquid particles that fall and interact
        const liquidParticles = [];
        const center = this.getCenter();
        
        for (let i = 0; i < this.liquidAmount * 20; i++) {
            liquidParticles.push({
                position: center.clone().add(new Vector2D(
                    MathUtils.random(-this.width/4, this.width/4),
                    MathUtils.random(-this.height/4, this.height/4)
                )),
                velocity: new Vector2D(
                    MathUtils.random(-50, 50),
                    MathUtils.random(50, 150)
                ),
                life: MathUtils.random(2, 5),
                maxLife: 5,
                alpha: 1.0,
                color: this.liquidContent.color,
                size: MathUtils.random(2, 5),
                type: this.liquidType
            });
        }
        
        // These will be handled by the liquid physics system
        console.log(`Spawned ${liquidParticles.length} liquid particles:`, this.liquidType);
        return liquidParticles;
    }
}
```

### 4. Create Block Manager (js/game/mechanics/blockManager.js)

```javascript
/**
 * Block Manager - Handles all blocks in the game
 */
import { GAME_CONFIG, COLORS } from '../../utils/constants.js';
import { Vector2D } from '../../utils/vector.js';
import { NormalBlock, StrongBlock, SpecialBlock, EchoBlock, LiquidBlock } from './blocks/blockTypes.js';
import { MathUtils } from '../../utils/helpers.js';

export class BlockManager {
    constructor(physicsEngine) {
        this.physicsEngine = physicsEngine;
        this.blocks = new Map();
        this.grid = null;
        this.gridWidth = 0;
        this.gridHeight = 0;
        
        // Level properties
        this.levelData = null;
        this.blockSpacing = 4;
        this.defaultBlockWidth = 60;
        this.defaultBlockHeight = 20;
        
        // Communication system for block intelligence
        this.communicationRange = 100;
        this.alertNetwork = new Map(); // Block ID -> nearby blocks
        
        // Performance tracking
        this.activeBlocks = 0;
        this.destroyedBlocks = 0;
        this.totalBlocks = 0;
        
        // Events
        this.eventCallbacks = new Map();
    }
    
    // Level loading
    loadLevel(levelData) {
        this.clearLevel();
        this.levelData = levelData;
        
        // Create blocks based on level data
        this.createBlocksFromData(levelData);
        
        // Build communication network
        this.buildCommunicationNetwork();
        
        console.log(`Level loaded: ${this.activeBlocks} blocks created`);
    }
    
    createBlocksFromData(levelData) {
        const { layout, blockTypes, startX = 50, startY = 50 } = levelData;
        
        this.gridWidth = layout[0].length;
        this.gridHeight = layout.length;
        this.grid = Array(this.gridHeight).fill().map(() => Array(this.gridWidth).fill(null));
        
        for (let row = 0; row < layout.length; row++) {
            for (let col = 0; col < layout[row].length; col++) {
                const blockType = layout[row][col];
                if (blockType === 0) continue; // Empty space
                
                const x = startX + col * (this.defaultBlockWidth + this.blockSpacing);
                const y = startY + row * (this.defaultBlockHeight + this.blockSpacing);
                
                const block = this.createBlock(
                    blockType, 
                    x, y, 
                    this.defaultBlockWidth, 
                    this.defaultBlockHeight,
                    blockTypes[blockType] || {}
                );
                
                if (block) {
                    block.gridPosition = { x: col, y: row };
                    this.addBlock(block);
                    this.grid[row][col] = block.id;
                }
            }
        }
    }
    
    createBlock(type, x, y, width, height, options = {}) {
        let block = null;
        
        switch (type) {
            case 1:
                block = new NormalBlock(x, y, width, height, options);
                break;
            case 2:
                block = new StrongBlock(x, y, width, height, options);
                break;
            case 3:
                block = new SpecialBlock(x, y, width, height, options);
                break;
            case 4:
                block = new EchoBlock(x, y, width, height, options);
                break;
            case 5:
                block = new LiquidBlock(x, y, width, height, options);
                break;
            default:
                console.warn(`Unknown block type: ${type}`);
                return null;
        }
        
        return block;
    }
    
    addBlock(block) {
        this.blocks.set(block.id, block);
        this.physicsEngine.addBody(block.physicsBody);
        this.activeBlocks++;
        this.totalBlocks++;
        
        // Set up collision callback
        this.physicsEngine.addCollisionCallback(block.physicsBody.id, 
            (blockBody, otherBody, collisionInfo) => {
                if (otherBody.userData.type === 'ball') {
                    this.onBlockHit(block, otherBody.userData.owner, collisionInfo);
                }
            }
        );
    }
    
    removeBlock(blockId) {
        const block = this.blocks.get(blockId);
        if (!block) return false;
        
        // Remove from physics
        this.physicsEngine.removeBody(block.physicsBody.id);
        
        // Remove from grid
        if (this.grid && block.gridPosition) {
            this.grid[block.gridPosition.y][block.gridPosition.x] = null;
        }
        
        // Remove from blocks map
        this.blocks.delete(blockId);
        this.activeBlocks--;
        
        // Update communication network
        this.updateCommunicationNetwork(blockId);
        
        return true;
    }
    
    onBlockHit(block, ball, collisionInfo) {
        // Handle the hit
        block.onHit(ball, collisionInfo);
        
        // Broadcast alert to nearby blocks
        this.broadcastAlert(block, 'threat_detected', {
            threat: ball,
            position: ball.getPosition()
        });
        
        // Check if block was destroyed
        if (block.isDestroyed) {
            this.onBlockDestroyed(block);
        }
        
        // Trigger events
        this.triggerEvent('block_hit', { block, ball, collisionInfo });
    }
    
    onBlockDestroyed(block) {
        this.destroyedBlocks++;
        
        // Broadcast destruction to nearby blocks
        this.broadcastAlert(block, 'destroyed', {
            destroyedBlock: block
        });
        
        // Special block effects
        if (block.type === 'special') {
            this.handleSpecialBlockDestruction(block);
        }
        
        // Check level completion
        if (this.isLevelComplete()) {
            this.triggerEvent('level_complete', { 
                totalBlocks: this.totalBlocks,
                destroyedBlocks: this.destroyedBlocks
            });
        }
        
        // Remove block after destruction animation
        setTimeout(() => {
            this.removeBlock(block.id);
        }, block.destructionDuration);
        
        this.triggerEvent('block_destroyed', { block });
    }
    
    handleSpecialBlockDestruction(block) {
        // Handle special block effects
        switch (block.specialType) {
            case 'chain_reaction':
                this.triggerChainReaction(block);
                break;
            case 'shield_break':
                this.removeShieldsFromNearbyBlocks(block);
                break;
            case 'emotion_spread':
                this.spreadEmotionToNearbyBlocks(block, 'happy');
                break;
        }
    }
    
    triggerChainReaction(centerBlock) {
        const range = 80;
        const center = centerBlock.getCenter();
        
        this.blocks.forEach(block => {
            if (block.isDestroyed || block.id === centerBlock.id) return;
            
            const distance = center.distance(block.getCenter());
            if (distance <= range) {
                // Delayed destruction for chain effect
                setTimeout(() => {
                    if (!block.isDestroyed) {
                        block.destroy();
                    }
                }, (distance / range) * 500); // Spread over 500ms
            }
        });
    }
    
    removeShieldsFromNearbyBlocks(centerBlock) {
        const range = 60;
        const center = centerBlock.getCenter();
        
        this.blocks.forEach(block => {
            if (block.isDestroyed) return;
            
            const distance = center.distance(block.getCenter());
            if (distance <= range) {
                block.removeStatusEffect('shield');
                block.triggerEmotion('scared', 0.6);
            }
        });
    }
    
    spreadEmotionToNearbyBlocks(centerBlock, emotion) {
        const range = 100;
        const center = centerBlock.getCenter();
        
        this.blocks.forEach(block => {
            if (block.isDestroyed) return;
            
            const distance = center.distance(block.getCenter());
            if (distance <= range) {
                const intensity = 1.0 - (distance / range);
                block.triggerEmotion(emotion, intensity);
            }
        });
    }
    
    // Communication network for block intelligence
    buildCommunicationNetwork() {
        this.alertNetwork.clear();
        
        this.blocks.forEach((block, blockId) => {
            const neighbors = this.findNearbyBlocks(block, this.communicationRange);
            this.alertNetwork.set(blockId, neighbors);
            block.intelligence.allies = new Set(neighbors.map(b => b.id));
        });
    }
    
    updateCommunicationNetwork(removedBlockId) {
        // Remove destroyed block from all ally lists
        this.blocks.forEach(block => {
            block.intelligence.allies.delete(removedBlockId);
        });
        
        // Remove from alert network
        this.alertNetwork.delete(removedBlockId);
    }
    
    findNearbyBlocks(targetBlock, range) {
        const nearby = [];
        const targetCenter = targetBlock.getCenter();
        
        this.blocks.forEach(block => {
            if (block.id === targetBlock.id || block.isDestroyed) return;
            
            const distance = targetCenter.distance(block.getCenter());
            if (distance <= range) {
                nearby.push(block);
            }
        });
        
        return nearby;
    }
    
    broadcastAlert(senderBlock, message, data) {
        const neighbors = this.alertNetwork.get(senderBlock.id) || [];
        
        neighbors.forEach(neighborBlock => {
            if (!neighborBlock.isDestroyed) {
                neighborBlock.receiveAlert(senderBlock, message, data);
            }
        });
    }
    
    // Game state queries
    isLevelComplete() {
        // Level is complete when all destructible blocks are destroyed
        let destructibleBlocks = 0;
        let destroyedDestructibleBlocks = 0;
        
        this.blocks.forEach(block => {
            if (block.type !== 'indestructible') {
                destructibleBlocks++;
                if (block.isDestroyed) {
                    destroyedDestructibleBlocks++;
                }
            }
        });
        
        return destructibleBlocks > 0 && destructibleBlocks === destroyedDestructibleBlocks;
    }
    
    getRemainingBlocks() {
        return this.activeBlocks - this.destroyedBlocks;
    }
    
    getBlockStats() {
        const stats = {
            total: this.totalBlocks,
            active: this.activeBlocks,
            destroyed: this.destroyedBlocks,
            remaining: this.getRemainingBlocks(),
            types: {}
        };
        
        this.blocks.forEach(block => {
            if (!stats.types[block.type]) {
                stats.types[block.type] = { total: 0, destroyed: 0 };
            }
            stats.types[block.type].total++;
            if (block.isDestroyed) {
                stats.types[block.type].destroyed++;
            }
        });
        
        return stats;
    }
    
    // Update system
    update(deltaTime) {
        // Update all blocks
        this.blocks.forEach(block => {
            block.update(deltaTime);
        });
        
        // Remove completely destroyed blocks
        const toRemove = [];
        this.blocks.forEach((block, id) => {
            if (block.isDestroyed && !block.isActive && !block.isVisible) {
                toRemove.push(id);
            }
        });
        
        toRemove.forEach(id => this.removeBlock(id));
    }
    
    // Rendering
    getRenderData() {
        const renderData = [];
        
        this.blocks.forEach(block => {
            if (block.isVisible) {
                const blockRenderData = block.getRenderData();
                renderData.push(...blockRenderData);
            }
        });
        
        return renderData;
    }
    
    // Event system
    addEventListener(eventType, callback) {
        if (!this.eventCallbacks.has(eventType)) {
            this.eventCallbacks.set(eventType, []);
        }
        this.eventCallbacks.get(eventType).push(callback);
    }
    
    removeEventListener(eventType, callback) {
        const callbacks = this.eventCallbacks.get(eventType);
        if (callbacks) {
            const index = callbacks.indexOf(callback);
            if (index > -1) {
                callbacks.splice(index, 1);
            }
        }
    }
    
    triggerEvent(eventType, data) {
        const callbacks = this.eventCallbacks.get(eventType);
        if (callbacks) {
            callbacks.forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Error in ${eventType} callback:`, error);
                }
            });
        }
    }
    
    // Utility methods
    getBlockAt(x, y) {
        for (const block of this.blocks.values()) {
            if (block.isDestroyed) continue;
            
            const bounds = block.getBounds();
            if (x >= bounds.left && x <= bounds.right &&
                y >= bounds.top && y <= bounds.bottom) {
                return block;
            }
        }
        return null;
    }
    
    getBlockById(id) {
        return this.blocks.get(id);
    }
    
    getAllBlocks() {
        return Array.from(this.blocks.values());
    }
    
    getActiveBlocks() {
        return Array.from(this.blocks.values()).filter(block => 
            !block.isDestroyed && block.isActive
        );
    }
    
    // Level management
    clearLevel() {
        this.blocks.forEach((block, id) => {
            this.physicsEngine.removeBody(block.physicsBody.id);
        });
        
        this.blocks.clear();
        this.alertNetwork.clear();
        this.grid = null;
        this.activeBlocks = 0;
        this.destroyedBlocks = 0;
        this.totalBlocks = 0;
    }
    
    reset() {
        this.blocks.forEach(block => {
            block.reset();
        });
        
        this.destroyedBlocks = 0;
        this.buildCommunicationNetwork();
    }
    
    // Debug helpers
    getDebugInfo() {
        return {
            blocks: this.blocks.size,
            activeBlocks: this.activeBlocks,
            destroyedBlocks: this.destroyedBlocks,
            gridSize: { width: this.gridWidth, height: this.gridHeight },
            communicationNetwork: this.alertNetwork.size
        };
    }
}
```

### 5. Create Test Level Data (js/game/levels/testLevel.js)

```javascript
/**
 * Test Level Data for Block System
 */
export const testLevel = {
    id: 'test_level_1',
    name: 'Block System Test',
    description: 'Testing all block types and mechanics',
    
    // Block layout grid (0 = empty, 1-5 = different block types)
    layout: [
        [1, 1, 1, 1, 1, 1, 1, 1],
        [2, 0, 3, 0, 4, 0, 5, 0],
        [1, 2, 1, 2, 1, 2, 1, 2],
        [0, 3, 0, 3, 0, 3, 0, 3],
        [5, 1, 4, 1, 3, 1, 2, 1]
    ],
    
    // Block type configurations
    blockTypes: {
        1: { // Normal blocks
            type: 'normal',
            color: '#4ade80',
            pointValue: 10
        },
        2: { // Strong blocks
            type: 'strong',
            color: '#ef4444',
            pointValue: 30
        },
        3: { // Special blocks
            type: 'special',
            color: '#f472b6',
            pointValue: 50,
            specialType: 'powerup'
        },
        4: { // Echo blocks
            type: 'echo',
            color: '#8b5cf6',
            pointValue: 25
        },
        5: { // Liquid blocks
            type: 'liquid',
            color: '#3b82f6',
            pointValue: 20,
            liquidType: 'water'
        }
    },
    
    // Level settings
    settings: {
        startX: 50,
        startY: 80,
        ballSpeed: 300,
        paddleSpeed: 400,
        difficulty: 'normal'
    }
};
```

### 6. Update Main Game Integration

Update the main.js file to include the block system:

```javascript
// Add imports
import { BlockManager } from './game/mechanics/blockManager.js';
import { testLevel } from './game/levels/testLevel.js';

// Add to Game class constructor
this.blockManager = null;

// Update initializeGameObjects method
initializeGameObjects() {
    // Create walls
    const walls = [
        this.physicsEngine.createWall(0, 0, this.canvas.width, 0), // Top
        this.physicsEngine.createWall(this.canvas.width, 0, this.canvas.width, this.canvas.height), // Right
        this.physicsEngine.createWall(0, this.canvas.height, 0, 0) // Left
    ];
    
    walls.forEach(wall => this.physicsEngine.addBody(wall));
    
    // Initialize block manager
    this.blockManager = new BlockManager(this.physicsEngine);
    
    // Load test level
    this.blockManager.loadLevel(testLevel);
    
    // Set up block event listeners
    this.setupBlockEvents();
    
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

// Add block event handling
setupBlockEvents() {
    this.blockManager.addEventListener('block_destroyed', (data) => {
        console.log('Block destroyed:', data.block.type);
        // Update score, trigger effects, etc.
    });
    
    this.blockManager.addEventListener('level_complete', (data) => {
        console.log('Level complete!', data);
        gameState.setState(GAME_CONFIG.STATES.LEVEL_COMPLETE);
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
        this.blockManager?.update(deltaTime);
        
        // Check for ball out of bounds
        if (!this.ball.isInPlay) {
            this.onBallLost();
        }
    }
    
    // Update performance monitoring
    if (DEBUG.LOG_PERFORMANCE && this.frameCount % 60 === 0) {
        console.log('Performance Stats:', this.performanceStats);
        console.log('Physics Stats:', this.physicsEngine?.getPerformanceStats());
        console.log('Block Stats:', this.blockManager?.getBlockStats());
    }
}

// Update renderGame method
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
    
    // Render blocks
    if (this.blockManager) {
        const blockRenderData = this.blockManager.getRenderData();
        blockRenderData.forEach(item => {
            this.renderer.addToLayer(item.layer, item.object);
        });
    }
    
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
}
```

### 7. Create Block System Test

Create `test-blocks.html`:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Block System Test</title>
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
    <h1>Block System Test</h1>
    <canvas id="test-canvas" width="800" height="600"></canvas>
    
    <div class="controls">
        <button onclick="resetLevel()">Reset Level</button>
        <button onclick="triggerChainReaction()">Chain Reaction</button>
        <button onclick="spreadEmotion()">Spread Happiness</button>
        <button onclick="showCommunication()">Show Network</button>
    </div>
    
    <div class="info">
        <div id="block-stats"></div>
        <div id="level-info"></div>
    </div>
    
    <script type="module">
        import { PhysicsEngine } from './js/game/physics/physicsEngine.js';
        import { Renderer } from './js/game/core/renderer.js';
        import { InputManager } from './js/game/core/inputManager.js';
        import { Paddle } from './js/game/mechanics/paddle.js';
        import { Ball } from './js/game/mechanics/ball.js';
        import { BlockManager } from './js/game/mechanics/blockManager.js';
        import { testLevel } from './js/game/levels/testLevel.js';
        import { GAME_CONFIG, COLORS } from './js/utils/constants.js';
        import { Vector2D } from './js/utils/vector.js';
        
        const canvas = document.getElementById('test-canvas');
        const renderer = new Renderer(canvas);
        const inputManager = new InputManager(canvas);
        const physics = new PhysicsEngine();
        
        let paddle, ball, blockManager;
        let showCommunicationNetwork = false;
        
        // Create walls
        const walls = [
            physics.createWall(0, 0, canvas.width, 0),
            physics.createWall(canvas.width, 0, canvas.width, canvas.height),
            physics.createWall(0, canvas.height, 0, 0)
        ];
        walls.forEach(wall => physics.addBody(wall));
        
        // Initialize block manager
        blockManager = new BlockManager(physics);
        blockManager.loadLevel(testLevel);
        
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
        
        // Block events
        blockManager.addEventListener('block_destroyed', (data) => {
            console.log('Block destroyed:', data.block.type);
        });
        
        blockManager.addEventListener('level_complete', (data) => {
            console.log('Level complete!', data);
        });
        
        function gameLoop() {
            const deltaTime = 1/60;
            
            // Update systems
            inputManager.update(deltaTime);
            physics.update(deltaTime);
            paddle.update(deltaTime, inputManager);
            ball.update(deltaTime);
            blockManager.update(deltaTime);
            
            // Check ball out of bounds
            if (ball.position.y > canvas.height + 50) {
                ball.setPosition(canvas.width / 2, canvas.height / 2);
                ball.setVelocity(250, -200);
                ball.reset();
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
            
            // Render blocks
            const blockRenderData = blockManager.getRenderData();
            blockRenderData.forEach(item => {
                renderer.addToLayer(item.layer, item.object);
            });
            
            // Show communication network if enabled
            if (showCommunicationNetwork) {
                renderCommunicationNetwork();
            }
            
            // Render paddle
            const paddleRender = paddle.getRenderData();
            renderer.addToLayer(GAME_CONFIG.LAYERS.PADDLE, paddleRender);
            
            // Render ball and trail
            const ballRenderData = ball.getRenderData();
            ballRenderData.forEach(item => {
                renderer.addToLayer(item.layer, item.object);
            });
            
            renderer.render();
            
            // Update stats
            updateStats();
            
            requestAnimationFrame(gameLoop);
        }
        
        function renderCommunicationNetwork() {
            const blocks = blockManager.getAllBlocks();
            
            blocks.forEach(block => {
                if (block.isDestroyed) return;
                
                const blockCenter = block.getCenter();
                
                // Draw communication range
                renderer.addToLayer(GAME_CONFIG.LAYERS.UI_OVERLAY, {
                    type: 'circle',
                    x: blockCenter.x,
                    y: blockCenter.y,
                    radius: blockManager.communicationRange,
                    fillColor: 'transparent',
                    strokeColor: 'rgba(99, 102, 241, 0.2)',
                    strokeWidth: 1
                });
                
                // Draw connections to allies
                block.intelligence.allies.forEach(allyId => {
                    const ally = blockManager.getBlockById(allyId);
                    if (ally && !ally.isDestroyed) {
                        const allyCenter = ally.getCenter();
                        renderer.addToLayer(GAME_CONFIG.LAYERS.UI_OVERLAY, {
                            type: 'line',
                            x1: blockCenter.x,
                            y1: blockCenter.y,
                            x2: allyCenter.x,
                            y2: allyCenter.y,
                            strokeColor: 'rgba(99, 102, 241, 0.3)',
                            strokeWidth: 1
                        });
                    }
                });
            });
        }
        
        function updateStats() {
            const blockStats = blockManager.getBlockStats();
            const debugInfo = blockManager.getDebugInfo();
            
            document.getElementById('block-stats').innerHTML = `
                Blocks: ${blockStats.active}/${blockStats.total} | 
                Destroyed: ${blockStats.destroyed} | 
                Remaining: ${blockStats.remaining}
            `;
            
            let typeInfo = '';
            Object.entries(blockStats.types).forEach(([type, data]) => {
                typeInfo += `${type}: ${data.total - data.destroyed}/${data.total} `;
            });
            
            document.getElementById('level-info').innerHTML = `
                Types: ${typeInfo} | 
                Network Size: ${debugInfo.communicationNetwork}
            `;
        }
        
        window.resetLevel = () => {
            blockManager.clearLevel();
            blockManager.loadLevel(testLevel);
            ball.setPosition(canvas.width / 2, canvas.height / 2);
            ball.setVelocity(250, -200);
            ball.reset();
        };
        
        window.triggerChainReaction = () => {
            const blocks = blockManager.getActiveBlocks();
            if (blocks.length > 0) {
                const randomBlock = blocks[Math.floor(Math.random() * blocks.length)];
                blockManager.triggerChainReaction(randomBlock);
            }
        };
        
        window.spreadEmotion = () => {
            const blocks = blockManager.getActiveBlocks();
            if (blocks.length > 0) {
                const randomBlock = blocks[Math.floor(Math.random() * blocks.length)];
                blockManager.spreadEmotionToNearbyBlocks(randomBlock, 'happy');
            }
        };
        
        window.showCommunication = () => {
            showCommunicationNetwork = !showCommunicationNetwork;
        };
        
        gameLoop();
    </script>
</body>
</html>
```

### 8. Commit Changes

```bash
git add .
git commit -m "feat(blocks): Implement comprehensive block system with advanced mechanics

- Create extensible BaseBlock class with emotional AI and intelligence foundations
- Implement 5 block types: Normal, Strong, Special, Echo, and Liquid blocks
- Build BlockManager with grid-based level system and communication network
- Add destruction effects, particle systems, and visual feedback
- Implement collaborative intelligence with alert broadcasting system
- Create foundation for memory system with hit history tracking
- Add liquid physics foundation and status effect system
- Include comprehensive test level and interactive debugging tools
- Integrate block system with physics engine and main game loop"
```

### 9. Merge Feature Branch

```bash
git checkout main
git merge feature/block-system
git branch -d feature/block-system
```

## Testing & Verification

### 1. Block Functionality
- ✅ Open `test-blocks.html`
- ✅ All 5 block types should render correctly
- ✅ Ball should destroy blocks with appropriate effects
- ✅ Strong blocks should require multiple hits
- ✅ Liquid blocks should create splash effects

### 2. Intelligence System
- ✅ Click "Show Network" - should show communication lines
- ✅ Blocks should change emotions when nearby blocks are destroyed
- ✅ Alert system should propagate through block network

### 3. Special Effects
- ✅ "Chain Reaction" should destroy multiple blocks in sequence
- ✅ "Spread Happiness" should make nearby blocks happy
- ✅ Particle effects should display on block destruction

### 4. Integration Testing
- ✅ Open `index.html` - should work with full block system
- ✅ Level should complete when all blocks destroyed
- ✅ Performance should remain stable with many blocks

## Success Criteria

✅ **All 5 block types implemented with unique behaviors**  
✅ **Extensible architecture supports future advanced mechanics**  
✅ **Emotional AI foundation working with visual feedback**  
✅ **Collaborative intelligence network functional**  
✅ **Memory system foundation in place for trajectory tracking**  
✅ **Liquid physics foundation ready for particle system**  
✅ **Particle effects enhance destruction feedback**  
✅ **Grid-based level system loads and manages blocks efficiently**  
✅ **Performance optimized for large numbers of blocks**  
✅ **Event system enables clean integration with other systems**

## Next Step
Proceed to the high-level outlines for Steps 8-20 (advanced mechanics implementation)