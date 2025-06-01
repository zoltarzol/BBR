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