# Step 02: HTML Foundation & Canvas Setup

## Objective
Create the HTML foundation with semantic structure, set up the main canvas element for game rendering, and establish the basic DOM structure for the game interface.

## Prerequisites
- Step 01 completed successfully
- Project directory structure in place
- Git repository initialized

## Deliverables
- index.html with complete HTML structure
- Canvas element properly configured
- Viewport and meta tags for optimal rendering
- Basic DOM elements for game UI
- Feature branch created and merged

## Step-by-Step Instructions

### 1. Create Feature Branch
```bash
# Create and switch to feature branch
git checkout -b feature/html-foundation

# Verify you're on the correct branch
git branch
```

### 2. Create index.html
Create `index.html` in the root directory with the following content:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="description" content="Block Breaker Revolution - An innovative arcade game with revolutionary mechanics">
    <meta name="keywords" content="block breaker, arcade game, puzzle game, innovative gameplay">
    <meta name="author" content="AI Developer">
    
    <!-- Prevent zoom on mobile (desktop only game) -->
    <meta name="viewport" content="width=1024, user-scalable=no">
    
    <!-- Favicon placeholder -->
    <link rel="icon" type="image/x-icon" href="assets/images/favicon.ico">
    
    <!-- Preload critical CSS -->
    <link rel="preload" href="css/styles.css" as="style">
    <link rel="preload" href="css/ui.css" as="style">
    
    <!-- CSS Files -->
    <link rel="stylesheet" href="css/styles.css">
    <link rel="stylesheet" href="css/animations.css">
    <link rel="stylesheet" href="css/ui.css">
    
    <title>Block Breaker Revolution</title>
</head>
<body>
    <!-- Loading Screen -->
    <div id="loading-screen" class="screen">
        <div class="loading-container">
            <h1>Block Breaker Revolution</h1>
            <div class="loading-spinner"></div>
            <p id="loading-text">Loading...</p>
            <div class="loading-bar">
                <div class="loading-progress" id="loading-progress"></div>
            </div>
        </div>
    </div>

    <!-- Main Menu -->
    <div id="main-menu" class="screen hidden">
        <div class="menu-container">
            <h1 class="game-title">Block Breaker Revolution</h1>
            <div class="menu-buttons">
                <button id="start-game-btn" class="menu-btn primary">Start Game</button>
                <button id="tutorial-btn" class="menu-btn">Tutorial</button>
                <button id="level-select-btn" class="menu-btn">Level Select</button>
                <button id="settings-btn" class="menu-btn">Settings</button>
                <button id="about-btn" class="menu-btn">About</button>
            </div>
            <div class="game-features">
                <div class="feature">
                    <span class="feature-icon">🧠</span>
                    <span class="feature-text">Memory Imprint System</span>
                </div>
                <div class="feature">
                    <span class="feature-icon">😊</span>
                    <span class="feature-text">Emotional AI Blocks</span>
                </div>
                <div class="feature">
                    <span class="feature-icon">💧</span>
                    <span class="feature-text">Liquid Physics</span>
                </div>
                <div class="feature">
                    <span class="feature-icon">🎵</span>
                    <span class="feature-text">Sound Wave Mechanics</span>
                </div>
                <div class="feature">
                    <span class="feature-icon">🤝</span>
                    <span class="feature-text">Block Intelligence</span>
                </div>
            </div>
        </div>
    </div>

    <!-- Game Screen -->
    <div id="game-screen" class="screen hidden">
        <!-- Game Canvas Container -->
        <div id="canvas-container">
            <canvas id="game-canvas" width="1024" height="768">
                <p class="no-canvas-message">
                    Your browser doesn't support HTML5 Canvas. 
                    Please upgrade to a modern browser to play Block Breaker Revolution.
                </p>
            </canvas>
            
            <!-- Canvas Overlay for UI Elements -->
            <div id="canvas-overlay">
                <!-- Game HUD -->
                <div id="game-hud">
                    <div class="hud-left">
                        <div class="hud-item">
                            <span class="hud-label">Level:</span>
                            <span id="current-level" class="hud-value">1</span>
                        </div>
                        <div class="hud-item">
                            <span class="hud-label">Score:</span>
                            <span id="current-score" class="hud-value">0</span>
                        </div>
                    </div>
                    
                    <div class="hud-center">
                        <div id="level-title" class="level-title">Tutorial</div>
                    </div>
                    
                    <div class="hud-right">
                        <button id="pause-btn" class="hud-btn">⏸️</button>
                        <button id="sound-toggle-btn" class="hud-btn">🔊</button>
                        <button id="menu-btn" class="hud-btn">📋</button>
                    </div>
                </div>

                <!-- Tutorial Overlay -->
                <div id="tutorial-overlay" class="tutorial-overlay hidden">
                    <div class="tutorial-box">
                        <h3 id="tutorial-title">Welcome to Block Breaker Revolution!</h3>
                        <p id="tutorial-text">Use your mouse to move the paddle and keep the ball in play.</p>
                        <div class="tutorial-controls">
                            <button id="tutorial-prev-btn" class="tutorial-btn" disabled>← Previous</button>
                            <button id="tutorial-next-btn" class="tutorial-btn">Next →</button>
                            <button id="tutorial-skip-btn" class="tutorial-btn secondary">Skip Tutorial</button>
                        </div>
                    </div>
                </div>

                <!-- Pause Menu -->
                <div id="pause-menu" class="modal hidden">
                    <div class="modal-content">
                        <h2>Game Paused</h2>
                        <div class="modal-buttons">
                            <button id="resume-btn" class="modal-btn primary">Resume</button>
                            <button id="restart-btn" class="modal-btn">Restart Level</button>
                            <button id="back-to-menu-btn" class="modal-btn">Main Menu</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Level Select Screen -->
    <div id="level-select-screen" class="screen hidden">
        <div class="level-select-container">
            <h2>Select Level</h2>
            <div id="level-grid" class="level-grid">
                <!-- Level buttons will be dynamically generated -->
            </div>
            <button id="back-from-levels-btn" class="back-btn">← Back to Menu</button>
        </div>
    </div>

    <!-- Settings Screen -->
    <div id="settings-screen" class="screen hidden">
        <div class="settings-container">
            <h2>Settings</h2>
            <div class="settings-group">
                <h3>Audio</h3>
                <div class="setting-item">
                    <label for="master-volume">Master Volume:</label>
                    <input type="range" id="master-volume" min="0" max="100" value="80">
                    <span id="master-volume-value">80%</span>
                </div>
                <div class="setting-item">
                    <label for="music-volume">Music Volume:</label>
                    <input type="range" id="music-volume" min="0" max="100" value="60">
                    <span id="music-volume-value">60%</span>
                </div>
                <div class="setting-item">
                    <label for="sfx-volume">Sound Effects:</label>
                    <input type="range" id="sfx-volume" min="0" max="100" value="80">
                    <span id="sfx-volume-value">80%</span>
                </div>
            </div>
            
            <div class="settings-group">
                <h3>Graphics</h3>
                <div class="setting-item">
                    <label for="quality-select">Quality:</label>
                    <select id="quality-select">
                        <option value="low">Low (Better Performance)</option>
                        <option value="medium" selected>Medium (Balanced)</option>
                        <option value="high">High (Better Quality)</option>
                    </select>
                </div>
                <div class="setting-item">
                    <label>
                        <input type="checkbox" id="show-fps" checked>
                        Show FPS Counter
                    </label>
                </div>
                <div class="setting-item">
                    <label>
                        <input type="checkbox" id="reduce-motion">
                        Reduce Motion (Accessibility)
                    </label>
                </div>
            </div>
            
            <div class="settings-group">
                <h3>Controls</h3>
                <div class="setting-item">
                    <label for="mouse-sensitivity">Mouse Sensitivity:</label>
                    <input type="range" id="mouse-sensitivity" min="0.5" max="2.0" step="0.1" value="1.0">
                    <span id="mouse-sensitivity-value">1.0x</span>
                </div>
            </div>
            
            <div class="settings-buttons">
                <button id="reset-settings-btn" class="settings-btn secondary">Reset to Defaults</button>
                <button id="back-from-settings-btn" class="settings-btn primary">← Back to Menu</button>
            </div>
        </div>
    </div>

    <!-- About Screen -->
    <div id="about-screen" class="screen hidden">
        <div class="about-container">
            <h2>About Block Breaker Revolution</h2>
            <div class="about-content">
                <p>Block Breaker Revolution brings innovative mechanics to the classic arcade genre:</p>
                
                <div class="feature-details">
                    <div class="feature-detail">
                        <h4>🧠 Memory Imprint System</h4>
                        <p>Your ball leaves ghost trails showing successful paths. Some blocks can only be broken by replicating exact trajectories!</p>
                    </div>
                    
                    <div class="feature-detail">
                        <h4>😊 Emotional AI Blocks</h4>
                        <p>Blocks have feelings! They react to your gameplay style and their emotions affect scoring and difficulty.</p>
                    </div>
                    
                    <div class="feature-detail">
                        <h4>💧 Liquid Physics</h4>
                        <p>Blocks contain liquids that spill when broken, creating cascading effects and mixing reactions.</p>
                    </div>
                    
                    <div class="feature-detail">
                        <h4>🎵 Sound Wave Mechanics</h4>
                        <p>Different ball speeds create different frequencies. Tune your paddle to break specific block types with resonance!</p>
                    </div>
                    
                    <div class="feature-detail">
                        <h4>🤝 Collaborative Block Intelligence</h4>
                        <p>Blocks communicate and work together, adapting their defensive strategies based on your gameplay patterns.</p>
                    </div>
                </div>
                
                <div class="credits">
                    <h4>Technical Details</h4>
                    <p><strong>Engine:</strong> HTML5 Canvas with Vanilla JavaScript</p>
                    <p><strong>Audio:</strong> Web Audio API</p>
                    <p><strong>Compatibility:</strong> All modern browsers</p>
                    <p><strong>Version:</strong> 1.0 MVP</p>
                </div>
            </div>
            
            <button id="back-from-about-btn" class="back-btn">← Back to Menu</button>
        </div>
    </div>

    <!-- Performance Monitor (Debug) -->
    <div id="fps-counter" class="fps-counter hidden">
        <span id="fps-value">60</span> FPS
    </div>

    <!-- Audio Context Warning -->
    <div id="audio-warning" class="audio-warning hidden">
        <p>Click anywhere to enable audio</p>
    </div>

    <!-- Error Messages -->
    <div id="error-container" class="error-container hidden">
        <div class="error-message">
            <h3>Oops! Something went wrong</h3>
            <p id="error-text">An unexpected error occurred.</p>
            <button id="error-retry-btn" class="error-btn">Try Again</button>
        </div>
    </div>

    <!-- JavaScript Files -->
    <!-- Load utilities first -->
    <script src="js/utils/constants.js"></script>
    <script src="js/utils/helpers.js"></script>
    <script src="js/utils/vector.js"></script>
    
    <!-- Load core game systems -->
    <script src="js/game/core/gameState.js"></script>
    <script src="js/game/core/renderer.js"></script>
    <script src="js/game/core/inputManager.js"></script>
    
    <!-- Load audio system -->
    <script src="js/audio/audioManager.js"></script>
    
    <!-- Load main game file -->
    <script src="js/main.js"></script>
</body>
</html>
```

### 3. Verify HTML Structure
Check that your HTML includes:
- ✅ Proper DOCTYPE and semantic HTML5 structure
- ✅ Meta tags for viewport, compatibility, and SEO
- ✅ Canvas element with fallback message
- ✅ All necessary UI screens (menu, game, settings, etc.)
- ✅ Script tags in correct loading order
- ✅ Accessibility features (alt text, proper labels)

### 4. Test Canvas Support
Add a temporary test file `test-canvas.html` to verify canvas functionality:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Canvas Test</title>
    <style>
        canvas { border: 1px solid #000; }
        body { font-family: Arial, sans-serif; text-align: center; padding: 20px; }
    </style>
</head>
<body>
    <h1>Canvas Support Test</h1>
    <canvas id="test-canvas" width="400" height="200">
        Canvas not supported
    </canvas>
    <div id="result"></div>
    
    <script>
        const canvas = document.getElementById('test-canvas');
        const ctx = canvas.getContext('2d');
        const result = document.getElementById('result');
        
        if (ctx) {
            // Draw test pattern
            ctx.fillStyle = '#ff0000';
            ctx.fillRect(10, 10, 50, 50);
            
            ctx.fillStyle = '#00ff00';
            ctx.fillRect(70, 10, 50, 50);
            
            ctx.fillStyle = '#0000ff';
            ctx.fillRect(130, 10, 50, 50);
            
            ctx.fillStyle = '#000000';
            ctx.font = '16px Arial';
            ctx.fillText('Canvas is working!', 10, 100);
            
            result.innerHTML = '<p style="color: green;">✅ Canvas is fully supported!</p>';
        } else {
            result.innerHTML = '<p style="color: red;">❌ Canvas is not supported!</p>';
        }
    </script>
</body>
</html>
```

### 5. Validate HTML
Perform HTML validation checks:

1. **DOCTYPE Check**: Ensure HTML5 DOCTYPE is present
2. **Semantic Structure**: Verify proper heading hierarchy (h1, h2, h3)
3. **Accessibility**: Check that interactive elements have proper labels
4. **Canvas Fallback**: Confirm fallback message for non-supporting browsers
5. **Script Loading**: Verify scripts are loaded in dependency order

### 6. Test in Multiple Browsers
Open `index.html` in different browsers to verify:
- ✅ **Chrome/Edge**: Modern browsers
- ✅ **Firefox**: Gecko engine compatibility  
- ✅ **Safari**: WebKit compatibility
- ✅ **Internet Explorer 11**: Legacy support

### 7. Commit Changes
```bash
# Add new files
git add index.html test-canvas.html

# Commit with descriptive message
git commit -m "feat(html): Add HTML foundation and canvas setup

- Create complete HTML5 structure with semantic elements
- Add main game canvas with proper fallback message
- Implement all UI screens (menu, game, settings, about)
- Add accessibility features and proper meta tags
- Include script loading order for modular architecture
- Add canvas support test file for verification
- Ensure cross-browser compatibility with IE11+ support"
```

### 8. Merge Feature Branch
```bash
# Switch back to main branch
git checkout main

# Merge feature branch
git merge feature/html-foundation

# Delete feature branch (optional, but recommended)
git branch -d feature/html-foundation

# Verify merge was successful
git log --oneline -3
```

## Testing & Verification

### 1. HTML Validation
- Open `index.html` in browser
- Check browser console for HTML parsing errors
- Verify no missing closing tags or syntax issues

### 2. Canvas Functionality
- Open `test-canvas.html` in browser
- Confirm colored rectangles and text are displayed
- Check that success message appears

### 3. Responsive Elements
- Verify viewport meta tag is working
- Check that layout adapts to different window sizes
- Confirm desktop-only design principles

### 4. Accessibility Check
- Verify screen reader compatibility
- Check keyboard navigation for interactive elements
- Confirm proper heading structure

### 5. Cross-Browser Testing
Test in at least 3 different browsers:
- Modern browser (Chrome/Edge)
- Alternative engine (Firefox)  
- Legacy browser (IE11) if available

## Success Criteria

✅ **HTML5 structure is valid and semantic**  
✅ **Canvas element renders correctly with fallback**  
✅ **All UI screens are properly structured**  
✅ **Meta tags configured for optimal rendering**  
✅ **Script loading order follows dependency chain**  
✅ **Cross-browser compatibility verified**  
✅ **Accessibility features implemented**  
✅ **Feature branch merged successfully**  
✅ **No console errors when opening index.html**  
✅ **Canvas test displays colored rectangles**

## File Checklist

After completion, verify these files exist:
- ✅ `index.html` - Main game file
- ✅ `test-canvas.html` - Canvas verification test

## Next Step

Once this step is completed successfully:
1. Verify all success criteria are met
2. Confirm clean git status with merge completed
3. Remove test-canvas.html if desired (optional)
4. Proceed to `instructions/step-03-css-framework.md`

## Troubleshooting

**Canvas not displaying:**
- Check if canvas dimensions are properly set
- Verify canvas element has correct ID
- Ensure browser supports HTML5 Canvas

**HTML validation errors:**
- Use browser developer tools to identify issues
- Check for unclosed tags or missing attributes
- Verify proper DOCTYPE declaration

**Script loading issues:**
- Confirm script files will exist in specified paths
- Check that script tags have proper src attributes
- Verify loading order matches dependency requirements