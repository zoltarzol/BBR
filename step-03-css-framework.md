# Step 03: CSS Framework & UI Layout

## Objective
Create a comprehensive CSS framework with modern styling, responsive design principles, smooth animations, and polished UI components for the game interface.

## Prerequisites
- Step 02 completed successfully
- HTML foundation with canvas setup complete
- All UI elements properly structured in HTML

## Deliverables
- css/styles.css - Main stylesheet with layout and theming
- css/animations.css - Animation definitions and transitions  
- css/ui.css - UI component styles and interactions
- Modern, accessible design with cross-browser compatibility
- Feature branch created and merged

## Step-by-Step Instructions

### 1. Create Feature Branch
```bash
# Create and switch to feature branch
git checkout -b feature/css-framework

# Verify you're on the correct branch
git branch
```

### 2. Create Main Stylesheet (css/styles.css)
Create `css/styles.css` with the following content:

```css
/* ==========================================================================
   Block Breaker Revolution - Main Styles
   ========================================================================== */

/* CSS Custom Properties (Variables) */
:root {
    /* Color Palette */
    --primary-color: #6366f1;
    --primary-dark: #4f46e5;
    --primary-light: #818cf8;
    --secondary-color: #f59e0b;
    --secondary-dark: #d97706;
    --accent-color: #10b981;
    --accent-dark: #047857;
    
    /* Background Colors */
    --bg-primary: #0f0f23;
    --bg-secondary: #1a1a2e;
    --bg-tertiary: #16213e;
    --bg-modal: rgba(15, 15, 35, 0.95);
    
    /* Text Colors */
    --text-primary: #ffffff;
    --text-secondary: #b8b8d1;
    --text-muted: #7c7c99;
    --text-accent: #10b981;
    
    /* Border Colors */
    --border-primary: #2d2d44;
    --border-secondary: #3a3a5c;
    --border-accent: #6366f1;
    
    /* Game Colors */
    --paddle-color: #6366f1;
    --ball-color: #f59e0b;
    --block-default: #4ade80;
    --block-special: #f472b6;
    --liquid-blue: #3b82f6;
    --liquid-red: #ef4444;
    --liquid-green: #10b981;
    
    /* Spacing */
    --spacing-xs: 0.25rem;
    --spacing-sm: 0.5rem;
    --spacing-md: 1rem;
    --spacing-lg: 1.5rem;
    --spacing-xl: 2rem;
    --spacing-2xl: 3rem;
    --spacing-3xl: 4rem;
    
    /* Typography */
    --font-family-primary: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    --font-family-mono: 'Consolas', 'Monaco', 'Courier New', monospace;
    --font-size-xs: 0.75rem;
    --font-size-sm: 0.875rem;
    --font-size-base: 1rem;
    --font-size-lg: 1.125rem;
    --font-size-xl: 1.25rem;
    --font-size-2xl: 1.5rem;
    --font-size-3xl: 1.875rem;
    --font-size-4xl: 2.25rem;
    
    /* Shadows */
    --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.25);
    --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.3);
    --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.4);
    --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.5);
    
    /* Border Radius */
    --radius-sm: 0.25rem;
    --radius-md: 0.5rem;
    --radius-lg: 0.75rem;
    --radius-xl: 1rem;
    
    /* Transitions */
    --transition-fast: 0.15s ease-in-out;
    --transition-normal: 0.3s ease-in-out;
    --transition-slow: 0.5s ease-in-out;
    
    /* Z-Index Scale */
    --z-dropdown: 1000;
    --z-modal: 2000;
    --z-overlay: 3000;
    --z-toast: 4000;
}

/* ==========================================================================
   Reset and Base Styles
   ========================================================================== */

/* Modern CSS Reset */
*, *::before, *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
}

html {
    line-height: 1.15;
    -webkit-text-size-adjust: 100%;
    font-size: 16px;
}

body {
    font-family: var(--font-family-primary);
    font-size: var(--font-size-base);
    line-height: 1.6;
    color: var(--text-primary);
    background: linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-secondary) 100%);
    margin: 0;
    overflow: hidden; /* Prevent scrolling for game */
    user-select: none; /* Prevent text selection during gameplay */
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
}

/* ==========================================================================
   Typography
   ========================================================================== */

h1, h2, h3, h4, h5, h6 {
    font-weight: 600;
    line-height: 1.2;
    margin-bottom: var(--spacing-md);
    color: var(--text-primary);
}

h1 { font-size: var(--font-size-4xl); }
h2 { font-size: var(--font-size-3xl); }
h3 { font-size: var(--font-size-2xl); }
h4 { font-size: var(--font-size-xl); }
h5 { font-size: var(--font-size-lg); }
h6 { font-size: var(--font-size-base); }

p {
    margin-bottom: var(--spacing-md);
    color: var(--text-secondary);
}

/* ==========================================================================
   Layout System
   ========================================================================== */

/* Screen Management */
.screen {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    opacity: 1;
    transition: opacity var(--transition-normal);
    z-index: 1;
}

.screen.hidden {
    opacity: 0;
    pointer-events: none;
    z-index: 0;
}

/* Container System */
.container {
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
    padding: var(--spacing-lg);
}

/* Flexbox Utilities */
.flex {
    display: flex;
}

.flex-column {
    flex-direction: column;
}

.flex-center {
    justify-content: center;
    align-items: center;
}

.flex-between {
    justify-content: space-between;
}

.flex-around {
    justify-content: space-around;
}

/* ==========================================================================
   Game Canvas Area
   ========================================================================== */

#canvas-container {
    position: relative;
    width: 1024px;
    height: 768px;
    margin: 0 auto;
    border: 2px solid var(--border-accent);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-xl);
    overflow: hidden;
    background: rgba(0, 0, 0, 0.8);
}

#game-canvas {
    display: block;
    width: 100%;
    height: 100%;
    image-rendering: pixelated; /* Crisp pixel rendering */
    image-rendering: -moz-crisp-edges;
    image-rendering: crisp-edges;
}

#canvas-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: var(--z-overlay);
}

/* Canvas fallback message */
.no-canvas-message {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    font-size: var(--font-size-xl);
    color: var(--text-accent);
    text-align: center;
    padding: var(--spacing-xl);
    background: var(--bg-secondary);
    border-radius: var(--radius-lg);
}

/* ==========================================================================
   HUD (Heads-Up Display)
   ========================================================================== */

#game-hud {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 60px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--spacing-md) var(--spacing-lg);
    background: linear-gradient(180deg, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0.2) 100%);
    pointer-events: auto;
    z-index: 10;
}

.hud-left, .hud-right {
    display: flex;
    align-items: center;
    gap: var(--spacing-lg);
}

.hud-center {
    flex: 1;
    display: flex;
    justify-content: center;
}

.hud-item {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
}

.hud-label {
    font-size: var(--font-size-sm);
    color: var(--text-secondary);
    font-weight: 500;
}

.hud-value {
    font-size: var(--font-size-lg);
    color: var(--text-primary);
    font-weight: 600;
    font-family: var(--font-family-mono);
}

.level-title {
    font-size: var(--font-size-xl);
    font-weight: 600;
    color: var(--text-accent);
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
}

/* ==========================================================================
   Buttons
   ========================================================================== */

/* Base Button Styles */
button {
    font-family: inherit;
    font-size: var(--font-size-base);
    font-weight: 500;
    border: none;
    border-radius: var(--radius-md);
    padding: var(--spacing-md) var(--spacing-lg);
    cursor: pointer;
    transition: all var(--transition-fast);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    position: relative;
    overflow: hidden;
}

button:focus {
    outline: 2px solid var(--primary-light);
    outline-offset: 2px;
}

button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

/* Button Variants */
.menu-btn {
    background: linear-gradient(135deg, var(--bg-tertiary) 0%, var(--bg-secondary) 100%);
    color: var(--text-primary);
    border: 1px solid var(--border-secondary);
    padding: var(--spacing-lg) var(--spacing-2xl);
    font-size: var(--font-size-lg);
    min-width: 200px;
    box-shadow: var(--shadow-md);
}

.menu-btn:hover {
    background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%);
    border-color: var(--primary-light);
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg);
}

.menu-btn.primary {
    background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%);
    border-color: var(--primary-light);
    box-shadow: var(--shadow-lg);
}

.menu-btn.primary:hover {
    background: linear-gradient(135deg, var(--primary-light) 0%, var(--primary-color) 100%);
    transform: translateY(-3px);
    box-shadow: var(--shadow-xl);
}

.hud-btn {
    background: rgba(255, 255, 255, 0.1);
    color: var(--text-primary);
    border: 1px solid rgba(255, 255, 255, 0.2);
    padding: var(--spacing-sm);
    font-size: var(--font-size-lg);
    width: 40px;
    height: 40px;
    border-radius: 50%;
    backdrop-filter: blur(10px);
}

.hud-btn:hover {
    background: rgba(255, 255, 255, 0.2);
    border-color: var(--primary-light);
    transform: scale(1.1);
}

.tutorial-btn, .modal-btn, .settings-btn {
    background: linear-gradient(135deg, var(--bg-tertiary) 0%, var(--bg-secondary) 100%);
    color: var(--text-primary);
    border: 1px solid var(--border-secondary);
    padding: var(--spacing-md) var(--spacing-xl);
}

.tutorial-btn:hover, .modal-btn:hover, .settings-btn:hover {
    background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%);
    border-color: var(--primary-light);
}

.tutorial-btn.secondary, .modal-btn.secondary, .settings-btn.secondary {
    background: transparent;
    border-color: var(--border-primary);
    color: var(--text-secondary);
}

.tutorial-btn.primary, .modal-btn.primary, .settings-btn.primary {
    background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%);
    border-color: var(--primary-light);
}

.back-btn {
    background: transparent;
    color: var(--text-secondary);
    border: 1px solid var(--border-primary);
    padding: var(--spacing-md) var(--spacing-lg);
    position: absolute;
    bottom: var(--spacing-xl);
    left: var(--spacing-xl);
}

.back-btn:hover {
    color: var(--text-primary);
    border-color: var(--primary-light);
    background: rgba(99, 102, 241, 0.1);
}

/* ==========================================================================
   Utility Classes
   ========================================================================== */

.hidden {
    display: none !important;
}

.invisible {
    visibility: hidden;
}

.sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
}

.text-center { text-align: center; }
.text-left { text-align: left; }
.text-right { text-align: right; }

.font-mono { font-family: var(--font-family-mono); }

.color-primary { color: var(--primary-color); }
.color-secondary { color: var(--secondary-color); }
.color-accent { color: var(--accent-color); }
.color-muted { color: var(--text-muted); }

/* ==========================================================================
   Performance and Accessibility
   ========================================================================== */

/* Smooth scrolling for any scrollable areas */
html {
    scroll-behavior: smooth;
}

/* High contrast mode support */
@media (prefers-contrast: high) {
    :root {
        --bg-primary: #000000;
        --bg-secondary: #1a1a1a;
        --text-primary: #ffffff;
        --border-primary: #ffffff;
    }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
    }
}

/* Focus improvements for keyboard navigation */
*:focus {
    outline: 2px solid var(--primary-light);
    outline-offset: 2px;
}

/* ==========================================================================
   Responsive Design (Minimal - Desktop First)
   ========================================================================== */

/* Large screens */
@media (min-width: 1440px) {
    #canvas-container {
        width: 1280px;
        height: 960px;
    }
    
    #game-canvas {
        width: 1280px;
        height: 960px;
    }
}

/* Small desktop screens */
@media (max-width: 1200px) {
    #canvas-container {
        width: 800px;
        height: 600px;
    }
    
    #game-canvas {
        width: 800px;
        height: 600px;
    }
}

/* Fallback for very small screens (should not happen on desktop) */
@media (max-width: 900px) {
    .screen {
        padding: var(--spacing-md);
    }
    
    #canvas-container {
        width: 100%;
        max-width: 700px;
        height: 525px;
    }
    
    .menu-btn {
        min-width: 150px;
        padding: var(--spacing-md) var(--spacing-lg);
    }
}
```

### 3. Create Animations Stylesheet (css/animations.css)
Create `css/animations.css` with the following content:

```css
/* ==========================================================================
   Block Breaker Revolution - Animations
   ========================================================================== */

/* ==========================================================================
   Keyframe Animations
   ========================================================================== */

/* Loading Spinner */
@keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
}

/* Pulse Effect */
@keyframes pulse {
    0%, 100% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.05); opacity: 0.8; }
}

/* Bounce Effect */
@keyframes bounce {
    0%, 20%, 53%, 80%, 100% { transform: translateY(0); }
    40%, 43% { transform: translateY(-10px); }
    70% { transform: translateY(-5px); }
    90% { transform: translateY(-2px); }
}

/* Fade In */
@keyframes fadeIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
}

/* Fade Out */
@keyframes fadeOut {
    from { opacity: 1; transform: translateY(0); }
    to { opacity: 0; transform: translateY(-20px); }
}

/* Slide In From Left */
@keyframes slideInLeft {
    from { transform: translateX(-100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
}

/* Slide In From Right */
@keyframes slideInRight {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
}

/* Scale In */
@keyframes scaleIn {
    from { transform: scale(0.8); opacity: 0; }
    to { transform: scale(1); opacity: 1; }
}

/* Wobble Effect */
@keyframes wobble {
    0% { transform: translateX(0%); }
    15% { transform: translateX(-25%) rotate(-5deg); }
    30% { transform: translateX(20%) rotate(3deg); }
    45% { transform: translateX(-15%) rotate(-3deg); }
    60% { transform: translateX(10%) rotate(2deg); }
    75% { transform: translateX(-5%) rotate(-1deg); }
    100% { transform: translateX(0%); }
}

/* Glow Effect */
@keyframes glow {
    0%, 100% { box-shadow: 0 0 5px rgba(99, 102, 241, 0.5); }
    50% { box-shadow: 0 0 20px rgba(99, 102, 241, 0.8), 0 0 30px rgba(99, 102, 241, 0.6); }
}

/* Loading Bar Progress */
@keyframes loadingProgress {
    0% { width: 0%; }
    100% { width: 100%; }
}

/* Floating Animation */
@keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
}

/* Shake Animation */
@keyframes shake {
    0%, 100% { transform: translateX(0); }
    10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
    20%, 40%, 60%, 80% { transform: translateX(5px); }
}

/* ==========================================================================
   Animation Classes
   ========================================================================== */

/* Screen Transitions */
.screen-enter {
    animation: fadeIn 0.5s ease-out forwards;
}

.screen-exit {
    animation: fadeOut 0.3s ease-in forwards;
}

/* Button Animations */
.btn-hover-lift {
    transition: transform 0.2s ease-out, box-shadow 0.2s ease-out;
}

.btn-hover-lift:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.btn-press {
    animation: pulse 0.3s ease-out;
}

.btn-bounce {
    animation: bounce 0.6s ease-out;
}

/* Loading Animations */
.loading-spinner {
    width: 40px;
    height: 40px;
    border: 4px solid rgba(99, 102, 241, 0.3);
    border-top: 4px solid var(--primary-color);
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: var(--spacing-lg) auto;
}

.loading-progress {
    height: 100%;
    background: linear-gradient(90deg, var(--primary-color), var(--primary-light));
    border-radius: inherit;
    transition: width 0.3s ease-out;
    animation: glow 2s ease-in-out infinite;
}

/* Menu Animations */
.menu-container {
    animation: scaleIn 0.6s ease-out;
}

.menu-buttons {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md);
    align-items: center;
}

.menu-btn {
    animation: slideInLeft 0.4s ease-out forwards;
    opacity: 0;
}

.menu-btn:nth-child(1) { animation-delay: 0.1s; }
.menu-btn:nth-child(2) { animation-delay: 0.2s; }
.menu-btn:nth-child(3) { animation-delay: 0.3s; }
.menu-btn:nth-child(4) { animation-delay: 0.4s; }
.menu-btn:nth-child(5) { animation-delay: 0.5s; }

/* Game Features Animation */
.game-features {
    animation: fadeIn 0.8s ease-out 0.6s forwards;
    opacity: 0;
}

.feature {
    animation: slideInRight 0.4s ease-out forwards;
    opacity: 0;
}

.feature:nth-child(1) { animation-delay: 0.8s; }
.feature:nth-child(2) { animation-delay: 0.9s; }
.feature:nth-child(3) { animation-delay: 1.0s; }
.feature:nth-child(4) { animation-delay: 1.1s; }
.feature:nth-child(5) { animation-delay: 1.2s; }

/* Modal Animations */
.modal {
    animation: scaleIn 0.3s ease-out;
}

.modal-content {
    animation: slideInLeft 0.4s ease-out 0.1s forwards;
    opacity: 0;
}

/* Tutorial Overlay Animations */
.tutorial-overlay {
    animation: fadeIn 0.4s ease-out;
}

.tutorial-box {
    animation: scaleIn 0.5s ease-out 0.2s forwards;
    opacity: 0;
}

/* HUD Animations */
.hud-value-change {
    animation: pulse 0.4s ease-out, glow 0.6s ease-out;
}

/* Level Transition */
.level-complete {
    animation: bounce 0.8s ease-out;
}

.level-failed {
    animation: shake 0.6s ease-out;
}

/* Game Elements */
.block-break {
    animation: scaleIn 0.2s ease-out reverse;
}

.ball-trail {
    animation: fadeOut 1s ease-out forwards;
}

/* Particle Effects Base */
.particle {
    animation: fadeOut 2s ease-out forwards;
}

.liquid-splash {
    animation: scaleIn 0.3s ease-out, fadeOut 1.5s ease-out 0.5s forwards;
}

/* Error and Warning Animations */
.error-shake {
    animation: shake 0.5s ease-out;
}

.warning-pulse {
    animation: pulse 1s ease-in-out infinite;
}

/* Achievement/Success Animations */
.achievement {
    animation: scaleIn 0.5s ease-out, glow 1s ease-in-out 0.5s;
}

.success-bounce {
    animation: bounce 0.8s ease-out;
}

/* Hover Effects for Interactive Elements */
.interactive-hover {
    transition: all 0.3s ease-out;
}

.interactive-hover:hover {
    transform: scale(1.05);
    filter: brightness(1.1);
}

/* Special Game Animations */
.memory-trail {
    animation: fadeOut 3s ease-out forwards;
    opacity: 0.7;
}

.emotional-block-happy {
    animation: bounce 1s ease-out infinite;
}

.emotional-block-sad {
    animation: float 2s ease-in-out infinite;
}

.emotional-block-angry {
    animation: shake 0.3s ease-out infinite;
}

.sound-wave-pulse {
    animation: pulse 0.5s ease-out infinite;
}

.collaboration-glow {
    animation: glow 1.5s ease-in-out infinite;
}

/* Performance Optimizations */
.gpu-accelerate {
    transform: translateZ(0);
    backface-visibility: hidden;
    perspective: 1000px;
}

/* ==========================================================================
   Reduced Motion Preferences
   ========================================================================== */

@media (prefers-reduced-motion: reduce) {
    /* Disable all animations for accessibility */
    *, *::before, *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
        scroll-behavior: auto !important;
    }
    
    /* Keep only essential animations */
    .loading-spinner {
        animation: none;
        border: 4px solid var(--primary-color);
    }
    
    .loading-progress {
        animation: none;
    }
}
```

### 4. Create UI Components Stylesheet (css/ui.css)
Create `css/ui.css` with the following content:

```css
/* ==========================================================================
   Block Breaker Revolution - UI Components
   ========================================================================== */

/* ==========================================================================
   Loading Screen
   ========================================================================== */

#loading-screen {
    background: linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-secondary) 50%, var(--bg-tertiary) 100%);
    z-index: var(--z-modal);
}

.loading-container {
    text-align: center;
    max-width: 400px;
    padding: var(--spacing-2xl);
}

.loading-container h1 {
    font-size: var(--font-size-3xl);
    margin-bottom: var(--spacing-xl);
    background: linear-gradient(45deg, var(--primary-color), var(--secondary-color));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

#loading-text {
    font-size: var(--font-size-lg);
    color: var(--text-secondary);
    margin: var(--spacing-lg) 0;
}

.loading-bar {
    width: 100%;
    height: 8px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: var(--radius-lg);
    overflow: hidden;
    margin-top: var(--spacing-lg);
}

/* ==========================================================================
   Main Menu
   ========================================================================== */

#main-menu {
    background: linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-secondary) 100%);
}

.menu-container {
    text-align: center;
    max-width: 600px;
    padding: var(--spacing-2xl);
}

.game-title {
    font-size: var(--font-size-4xl);
    margin-bottom: var(--spacing-3xl);
    background: linear-gradient(45deg, var(--primary-color), var(--secondary-color), var(--accent-color));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    text-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}

.menu-buttons {
    margin-bottom: var(--spacing-3xl);
}

.game-features {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--spacing-lg);
    margin-top: var(--spacing-2xl);
}

.feature {
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
    padding: var(--spacing-md);
    background: rgba(255, 255, 255, 0.05);
    border-radius: var(--radius-md);
    border: 1px solid var(--border-primary);
    transition: all var(--transition-normal);
}

.feature:hover {
    background: rgba(99, 102, 241, 0.1);
    border-color: var(--primary-light);
    transform: translateY(-2px);
}

.feature-icon {
    font-size: var(--font-size-xl);
}

.feature-text {
    font-size: var(--font-size-sm);
    color: var(--text-secondary);
    font-weight: 500;
}

/* ==========================================================================
   Level Select
   ========================================================================== */

.level-select-container {
    text-align: center;
    max-width: 800px;
    padding: var(--spacing-2xl);
}

.level-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: var(--spacing-lg);
    margin: var(--spacing-2xl) 0;
}

.level-btn {
    aspect-ratio: 1;
    background: linear-gradient(135deg, var(--bg-tertiary) 0%, var(--bg-secondary) 100%);
    border: 2px solid var(--border-secondary);
    border-radius: var(--radius-lg);
    color: var(--text-primary);
    font-size: var(--font-size-xl);
    font-weight: 600;
    cursor: pointer;
    transition: all var(--transition-normal);
    position: relative;
    overflow: hidden;
}

.level-btn:hover {
    background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%);
    border-color: var(--primary-light);
    transform: scale(1.05);
}

.level-btn.completed {
    background: linear-gradient(135deg, var(--accent-color) 0%, var(--accent-dark) 100%);
    border-color: var(--accent-color);
}

.level-btn.locked {
    background: var(--bg-secondary);
    border-color: var(--border-primary);
    color: var(--text-muted);
    cursor: not-allowed;
    opacity: 0.5;
}

/* ==========================================================================
   Settings Screen
   ========================================================================== */

.settings-container {
    max-width: 600px;
    padding: var(--spacing-2xl);
}

.settings-group {
    margin-bottom: var(--spacing-2xl);
    padding: var(--spacing-xl);
    background: rgba(255, 255, 255, 0.05);
    border-radius: var(--radius-lg);
    border: 1px solid var(--border-primary);
}

.settings-group h3 {
    color: var(--primary-light);
    margin-bottom: var(--spacing-lg);
    font-size: var(--font-size-xl);
}

.setting-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: var(--spacing-lg);
    padding: var(--spacing-md);
    background: rgba(255, 255, 255, 0.02);
    border-radius: var(--radius-md);
}

.setting-item:last-child {
    margin-bottom: 0;
}

.setting-item label {
    color: var(--text-secondary);
    font-weight: 500;
    flex: 1;
}

.setting-item input[type="range"] {
    width: 150px;
    margin: 0 var(--spacing-md);
}

.setting-item input[type="checkbox"] {
    width: 18px;
    height: 18px;
    margin-left: var(--spacing-md);
}

.setting-item select {
    background: var(--bg-tertiary);
    color: var(--text-primary);
    border: 1px solid var(--border-secondary);
    border-radius: var(--radius-sm);
    padding: var(--spacing-sm) var(--spacing-md);
    font-size: var(--font-size-sm);
}

.settings-buttons {
    display: flex;
    justify-content: space-between;
    gap: var(--spacing-lg);
    margin-top: var(--spacing-2xl);
}

/* ==========================================================================
   About Screen
   ========================================================================== */

.about-container {
    max-width: 800px;
    padding: var(--spacing-2xl);
}

.about-content {
    text-align: left;
    margin-bottom: var(--spacing-2xl);
}

.feature-details {
    display: grid;
    gap: var(--spacing-lg);
    margin: var(--spacing-2xl) 0;
}

.feature-detail {
    padding: var(--spacing-lg);
    background: rgba(255, 255, 255, 0.05);
    border-radius: var(--radius-lg);
    border-left: 4px solid var(--primary-color);
}

.feature-detail h4 {
    color: var(--primary-light);
    margin-bottom: var(--spacing-md);
    font-size: var(--font-size-lg);
}

.feature-detail p {
    color: var(--text-secondary);
    margin-bottom: 0;
}

.credits {
    margin-top: var(--spacing-2xl);
    padding: var(--spacing-lg);
    background: rgba(255, 255, 255, 0.02);
    border-radius: var(--radius-lg);
    border: 1px solid var(--border-primary);
}

.credits h4 {
    color: var(--accent-color);
    margin-bottom: var(--spacing-md);
}

.credits p {
    font-family: var(--font-family-mono);
    font-size: var(--font-size-sm);
    margin-bottom: var(--spacing-sm);
}

/* ==========================================================================
   Modals and Overlays
   ========================================================================== */

.modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: var(--bg-modal);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: var(--z-modal);
    backdrop-filter: blur(5px);
}

.modal-content {
    background: linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-tertiary) 100%);
    padding: var(--spacing-2xl);
    border-radius: var(--radius-xl);
    border: 2px solid var(--border-accent);
    box-shadow: var(--shadow-xl);
    text-align: center;
    max-width: 400px;
    width: 90%;
}

.modal-content h2 {
    color: var(--primary-light);
    margin-bottom: var(--spacing-xl);
}

.modal-buttons {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md);
    margin-top: var(--spacing-xl);
}

/* Tutorial Overlay */
.tutorial-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: var(--z-overlay);
    pointer-events: auto;
}

.tutorial-box {
    background: linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-tertiary) 100%);
    padding: var(--spacing-2xl);
    border-radius: var(--radius-xl);
    border: 2px solid var(--primary-color);
    box-shadow: var(--shadow-xl);
    text-align: center;
    max-width: 500px;
    width: 90%;
}

.tutorial-controls {
    display: flex;
    justify-content: space-between;
    gap: var(--spacing-md);
    margin-top: var(--spacing-xl);
}

/* ==========================================================================
   Performance Monitor
   ========================================================================== */

.fps-counter {
    position: fixed;
    top: var(--spacing-md);
    right: var(--spacing-md);
    background: rgba(0, 0, 0, 0.8);
    color: var(--accent-color);
    padding: var(--spacing-sm) var(--spacing-md);
    border-radius: var(--radius-md);
    font-family: var(--font-family-mono);
    font-size: var(--font-size-sm);
    z-index: var(--z-toast);
    border: 1px solid var(--border-secondary);
}

/* ==========================================================================
   Error Handling
   ========================================================================== */

.audio-warning {
    position: fixed;
    bottom: var(--spacing-lg);
    left: 50%;
    transform: translateX(-50%);
    background: rgba(245, 158, 11, 0.9);
    color: var(--bg-primary);
    padding: var(--spacing-md) var(--spacing-lg);
    border-radius: var(--radius-lg);
    font-weight: 500;
    z-index: var(--z-toast);
    animation: pulse 2s ease-in-out infinite;
}

.error-container {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: var(--bg-modal);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: var(--z-modal);
}

.error-message {
    background: linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-tertiary) 100%);
    padding: var(--spacing-2xl);
    border-radius: var(--radius-xl);
    border: 2px solid #ef4444;
    box-shadow: var(--shadow-xl);
    text-align: center;
    max-width: 400px;
    width: 90%;
}

.error-message h3 {
    color: #ef4444;
    margin-bottom: var(--spacing-lg);
}

.error-btn {
    background: #ef4444;
    color: white;
    border: none;
    padding: var(--spacing-md) var(--spacing-xl);
    border-radius: var(--radius-md);
    margin-top: var(--spacing-lg);
    cursor: pointer;
    transition: background-color var(--transition-fast);
}

.error-btn:hover {
    background: #dc2626;
}

/* ==========================================================================
   Form Elements
   ========================================================================== */

input[type="range"] {
    -webkit-appearance: none;
    appearance: none;
    height: 6px;
    background: var(--border-primary);
    border-radius: var(--radius-lg);
    outline: none;
}

input[type="range"]::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 18px;
    height: 18px;
    background: var(--primary-color);
    border-radius: 50%;
    cursor: pointer;
    transition: background-color var(--transition-fast);
}

input[type="range"]::-webkit-slider-thumb:hover {
    background: var(--primary-light);
}

input[type="range"]::-moz-range-thumb {
    width: 18px;
    height: 18px;
    background: var(--primary-color);
    border-radius: 50%;
    border: none;
    cursor: pointer;
}

input[type="checkbox"] {
    -webkit-appearance: none;
    appearance: none;
    width: 18px;
    height: 18px;
    border: 2px solid var(--border-secondary);
    border-radius: var(--radius-sm);
    background: transparent;
    cursor: pointer;
    position: relative;
    transition: all var(--transition-fast);
}

input[type="checkbox"]:checked {
    background: var(--primary-color);
    border-color: var(--primary-color);
}

input[type="checkbox"]:checked::after {
    content: '✓';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    color: white;
    font-size: 12px;
    font-weight: bold;
}

select {
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
    background-image: url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='%23ffffff'%3E%3Cpath d='M8 12L3 7h10l-5 5z'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 8px center;
    padding-right: 32px;
}

/* ==========================================================================
   Print Styles
   ========================================================================== */

@media print {
    .screen:not(#game-screen) {
        display: none !important;
    }
    
    body {
        background: white !important;
        color: black !important;
    }
}
```

### 5. Test CSS Implementation
Create a temporary test file `test-styles.html` to verify CSS is working:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CSS Test</title>
    <link rel="stylesheet" href="css/styles.css">
    <link rel="stylesheet" href="css/animations.css">
    <link rel="stylesheet" href="css/ui.css">
</head>
<body>
    <div class="screen">
        <div class="menu-container">
            <h1 class="game-title">CSS Test</h1>
            <div class="menu-buttons">
                <button class="menu-btn primary">Primary Button</button>
                <button class="menu-btn">Secondary Button</button>
                <button class="menu-btn btn-hover-lift">Animated Button</button>
            </div>
            <div class="game-features">
                <div class="feature">
                    <span class="feature-icon">🎮</span>
                    <span class="feature-text">Feature 1</span>
                </div>
                <div class="feature">
                    <span class="feature-icon">🎨</span>
                    <span class="feature-text">Feature 2</span>
                </div>
            </div>
        </div>
    </div>
    
    <div class="loading-spinner"></div>
</body>
</html>
```

### 6. Commit Changes
```bash
# Add all CSS files
git add css/ test-styles.html

# Commit with descriptive message
git commit -m "feat(css): Implement comprehensive CSS framework and UI components

- Add main stylesheet with modern CSS variables and layout system
- Implement animation framework with smooth transitions and effects
- Create UI component styles for all game screens and elements
- Add responsive design with desktop-first approach
- Include accessibility features and reduced motion support
- Add cross-browser compatibility for form elements
- Implement performance optimizations and GPU acceleration
- Create comprehensive button system with multiple variants
- Add modal, overlay, and HUD styling
- Include error handling and loading state styles"
```

### 7. Merge Feature Branch
```bash
# Switch back to main branch
git checkout main

# Merge feature branch
git merge feature/css-framework

# Delete feature branch
git branch -d feature/css-framework

# Verify merge was successful
git log --oneline -3
```

## Testing & Verification

### 1. Visual Testing
Open `test-styles.html` in browser and verify:
- ✅ Buttons display with proper gradients and hover effects
- ✅ Typography uses correct fonts and sizing
- ✅ Color scheme matches design (dark theme with accent colors)
- ✅ Animations work smoothly (spinner, hover effects)
- ✅ Layout is centered and responsive

### 2. Animation Testing
- ✅ Loading spinner rotates continuously
- ✅ Button hover effects work properly
- ✅ Transitions are smooth and not jarring
- ✅ Reduced motion preferences are respected

### 3. Cross-Browser Testing
Test in multiple browsers:
- ✅ **Chrome/Edge**: Modern CSS features work
- ✅ **Firefox**: CSS Grid and Flexbox compatibility
- ✅ **Safari**: Webkit-specific features function
- ✅ **IE11**: Fallbacks work where needed

### 4. Accessibility Testing
- ✅ High contrast mode is supported
- ✅ Focus indicators are visible
- ✅ Reduced motion preferences respected
- ✅ Color contrast meets WCAG guidelines

### 5. Performance Testing
- ✅ CSS loads quickly (under 100KB total)
- ✅ Animations don't cause frame drops
- ✅ GPU acceleration is properly applied
- ✅ No unused CSS rules causing bloat

## Success Criteria

✅ **All three CSS files created and properly structured**  
✅ **CSS variables system implemented for consistency**  
✅ **Responsive design works on desktop resolutions**  
✅ **Animation framework functional with smooth transitions**  
✅ **Cross-browser compatibility verified**  
✅ **Accessibility features implemented**  
✅ **Performance optimized with GPU acceleration**  
✅ **UI components styled for all game screens**  
✅ **Feature branch merged successfully**  
✅ **No CSS validation errors in browser console**

## File Checklist

After completion, verify these files exist:
- ✅ `css/styles.css` - Main stylesheet (≈15KB)
- ✅ `css/animations.css` - Animation framework (≈8KB)
- ✅ `css/ui.css` - UI components (≈12KB)
- ✅ `test-styles.html` - CSS verification test

## Next Step

Once this step is completed successfully:
1. Verify all success criteria are met
2. Confirm CSS files load without errors
3. Remove test-styles.html if desired (optional)
4. Proceed to `instructions/step-04-game-loop.md`

## Troubleshooting

**CSS not loading:**
- Check file paths in HTML link tags
- Verify CSS files are in correct directory structure
- Ensure proper CSS syntax (no missing semicolons/brackets)

**Animations not working:**
- Check browser support for CSS animations
- Verify animation classes are properly applied
- Test with reduced motion preferences disabled

**Cross-browser issues:**
- Add vendor prefixes where needed
- Use CSS fallbacks for newer properties
- Test with browser developer tools

**Performance issues:**
- Minimize use of expensive CSS properties (box-shadow, filters)
- Use transform instead of changing layout properties
- Enable GPU acceleration with transform: translateZ(0)