// Canvas Setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game States
const GAME_STATES = {
    MENU: 'menu',
    PLAYING: 'playing',
    LEVEL_COMPLETE: 'levelComplete',
    GAME_OVER: 'gameOver'
};

// Game Variables
let score = 0;
let currentLevel = 0;
let gameState = GAME_STATES.MENU;
let isLevelComplete = false;

// Player Object
const player = {
    x: 100,
    y: 400,
    width: 30,
    height: 40,
    velocityX: 0,
    velocityY: 0,
    speed: 5,
    jumpPower: 12,
    gravity: 0.5,
    onGround: false,
    color: '#FF6B6B'
};

// Level Definitionen
const LEVELS_PER_DIFFICULTY = 6;
const levelVariations = [
    { platformOffset: { x: 0, y: 0 }, coinOffset: { x: 0, y: 0 } },
    { platformOffset: { x: 15, y: -10 }, coinOffset: { x: 10, y: -10 } },
    { platformOffset: { x: -15, y: 0 }, coinOffset: { x: -10, y: 0 } },
    { platformOffset: { x: 20, y: -15 }, coinOffset: { x: 15, y: -10 } },
    { platformOffset: { x: -20, y: -5 }, coinOffset: { x: -15, y: -5 } },
    { platformOffset: { x: 0, y: -20 }, coinOffset: { x: 0, y: -15 } }
];

const difficultyConfigs = [
    {
        label: 'Anfänger',
        platforms: [
            { x: 0, y: 550, width: 800, height: 50, color: '#2ECC71' },
            { x: 200, y: 450, width: 150, height: 20, color: '#27AE60' },
            { x: 450, y: 350, width: 150, height: 20, color: '#27AE60' },
            { x: 600, y: 450, width: 150, height: 20, color: '#27AE60' }
        ],
        coins: [
            { x: 250, y: 400, width: 20, height: 20, collected: false },
            { x: 500, y: 300, width: 20, height: 20, collected: false },
            { x: 650, y: 400, width: 20, height: 20, collected: false }
        ]
    },
    {
        label: 'Mittel',
        platforms: [
            { x: 0, y: 550, width: 800, height: 50, color: '#2ECC71' },
            { x: 100, y: 480, width: 120, height: 20, color: '#27AE60' },
            { x: 300, y: 380, width: 100, height: 20, color: '#27AE60' },
            { x: 500, y: 300, width: 120, height: 20, color: '#27AE60' },
            { x: 200, y: 200, width: 100, height: 20, color: '#27AE60' },
            { x: 600, y: 280, width: 120, height: 20, color: '#27AE60' }
        ],
        coins: [
            { x: 150, y: 430, width: 20, height: 20, collected: false },
            { x: 350, y: 330, width: 20, height: 20, collected: false },
            { x: 550, y: 250, width: 20, height: 20, collected: false },
            { x: 250, y: 240, width: 20, height: 20, collected: false },
            { x: 650, y: 430, width: 20, height: 20, collected: false }
        ]
    },
    {
        label: 'Schwer',
        platforms: [
            { x: 0, y: 550, width: 800, height: 50, color: '#2ECC71' },
            { x: 50, y: 480, width: 80, height: 20, color: '#27AE60' },
            { x: 200, y: 420, width: 80, height: 20, color: '#27AE60' },
            { x: 350, y: 360, width: 80, height: 20, color: '#27AE60' },
            { x: 500, y: 300, width: 80, height: 20, color: '#27AE60' },
            { x: 650, y: 380, width: 80, height: 20, color: '#27AE60' },
            { x: 300, y: 220, width: 100, height: 20, color: '#27AE60' },
            { x: 600, y: 150, width: 100, height: 20, color: '#27AE60' }
        ],
        coins: [
            { x: 100, y: 430, width: 20, height: 20, collected: false },
            { x: 250, y: 370, width: 20, height: 20, collected: false },
            { x: 400, y: 310, width: 20, height: 20, collected: false },
            { x: 550, y: 250, width: 20, height: 20, collected: false },
            { x: 700, y: 330, width: 20, height: 20, collected: false },
            { x: 350, y: 260, width: 20, height: 20, collected: false },
            { x: 400, y: 190, width: 20, height: 20, collected: false }
        ]
    }
];

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

function buildLevels() {
    const builtLevels = [];

    const platformJitterX = (difficultyIndex, levelIndex, platformIndex) => {
        return ((difficultyIndex * 97 + levelIndex * 37 + platformIndex * 13) % 9 - 4) * 12;
    };
    const platformJitterY = (difficultyIndex, levelIndex, platformIndex) => {
        return ((difficultyIndex * 53 + levelIndex * 23 + platformIndex * 5) % 7 - 3) * 10;
    };
    const coinJitterX = (difficultyIndex, levelIndex, coinIndex) => {
        return ((difficultyIndex * 61 + levelIndex * 29 + coinIndex * 11) % 9 - 4) * 14;
    };
    const coinJitterY = (difficultyIndex, levelIndex, coinIndex) => {
        return ((difficultyIndex * 41 + levelIndex * 17 + coinIndex * 9) % 7 - 3) * 12;
    };

    difficultyConfigs.forEach((config, difficultyIndex) => {
        for (let i = 0; i < LEVELS_PER_DIFFICULTY; i += 1) {
            const variation = levelVariations[i % levelVariations.length];

            const platforms = config.platforms.map((platform, platformIndex) => {
                if (platform.y >= 540) {
                    return { ...platform };
                }

                const jitterX = platformJitterX(difficultyIndex, i, platformIndex);
                const jitterY = platformJitterY(difficultyIndex, i, platformIndex);
                const x = clamp(platform.x + variation.platformOffset.x + jitterX, 0, canvas.width - platform.width);
                const y = clamp(platform.y + variation.platformOffset.y + jitterY, 80, 520 - platform.height);

                return { ...platform, x, y };
            });

            const coins = config.coins.map((coin, coinIndex) => {
                const jitterX = coinJitterX(difficultyIndex, i, coinIndex);
                const jitterY = coinJitterY(difficultyIndex, i, coinIndex);
                const x = clamp(coin.x + variation.coinOffset.x + jitterX, 10, canvas.width - 30);
                const y = clamp(coin.y + variation.coinOffset.y + jitterY, 80, 520);

                return { ...coin, x, y, collected: false };
            });

            if (i % 2 === 1) {
                const bonusX = clamp(120 + i * 60, 40, canvas.width - 140);
                const bonusY = clamp(300 - i * 15, 140, 420);
                const bonusPlatform = {
                    x: bonusX,
                    y: bonusY,
                    width: 100,
                    height: 18,
                    color: '#27AE60'
                };

                platforms.push(bonusPlatform);
                coins.push({
                    x: clamp(bonusX + 40, 10, canvas.width - 30),
                    y: clamp(bonusY - 30, 80, 520),
                    width: 20,
                    height: 20,
                    collected: false
                });
            }

            // Ensure coins are reachable: if a coin floats too high without a platform underneath,
            // snap it to the nearest platform top (slightly above) within a sensible distance.
            coins.forEach((coin) => {
                const coinCenterX = coin.x + coin.width / 2;
                // find platforms that horizontally overlap the coin center
                const candidates = platforms.filter(p => coinCenterX >= p.x - 2 && coinCenterX <= p.x + p.width + 2);
                if (candidates.length > 0) {
                    // choose the highest platform that is below the coin (smallest positive dy)
                    let best = null;
                    let bestDy = Infinity;
                    candidates.forEach(p => {
                        const dy = p.y - (coin.y + coin.height);
                        if (dy >= -8 && dy < bestDy) {
                            bestDy = dy;
                            best = p;
                        }
                    });
                    if (best && bestDy > -8) {
                        // snap coin to sit slightly above platform
                        coin.y = clamp(best.y - coin.height - 4, 60, canvas.height - coin.height - 20);
                    }
                } else {
                    // no overlapping platform: try to find nearest platform horizontally within 140px
                    let nearest = null;
                    let nearestDist = Infinity;
                    platforms.forEach(p => {
                        const dx = Math.abs((p.x + p.width / 2) - coinCenterX);
                        if (dx < nearestDist) {
                            nearestDist = dx;
                            nearest = p;
                        }
                    });
                    if (nearest && nearestDist < 140) {
                        // place coin above that platform
                        coin.y = clamp(nearest.y - coin.height - 6, 60, canvas.height - coin.height - 20);
                        coin.x = clamp(nearest.x + Math.min(80, Math.max(10, nearest.width / 2)), 10, canvas.width - 30);
                    }
                }
            });

            builtLevels.push({
                name: `${config.label} ${i + 1}`,
                difficulty: config.label,
                platforms,
                coins
            });
        }
    });

    return builtLevels;
}

const levels = buildLevels();

// Special fix: make highest coin in "Schwer 6" reachable by moving it together with a nearby platform
(function fixSchwer6() {
    const lvl = levels.find(l => l.name === 'Schwer 6' || (l.difficulty === 'Schwer' && l.name.endsWith('6')));
    if (!lvl) return;

    // find the highest coin (smallest y)
    let highestCoin = null;
    lvl.coins.forEach(c => {
        if (!highestCoin || c.y < highestCoin.y) highestCoin = c;
    });
    if (!highestCoin) return;

    // find ground platform (tall or low y)
    const ground = lvl.platforms.find(p => p.height >= 50 || p.y >= canvas.height - 70) || lvl.platforms[0];
    if (ground) {
        highestCoin.y = clamp(ground.y - (highestCoin.height || 20) - 4, 60, canvas.height - (highestCoin.height || 20) - 10);
        highestCoin.x = clamp(highestCoin.x, 10, canvas.width - (highestCoin.width || 20) - 10);
    } else {
        // fallback: move coin down a lot
        highestCoin.y = clamp(highestCoin.y + 120, 60, canvas.height - (highestCoin.height || 20) - 10);
        highestCoin.x = clamp(highestCoin.x, 10, canvas.width - (highestCoin.width || 20) - 10);
    }
})();

// Current Level Data
let platforms = [];
let coins = [];

// Keyboard Input
const keys = {};

function resetInput() {
    Object.keys(keys).forEach((key) => {
        keys[key] = false;
    });
    player.velocityX = 0;
}

window.addEventListener('keydown', (e) => {
    keys[e.key] = true;
    if (e.key === ' ') e.preventDefault();

    if (e.key === ' ' && gameState === GAME_STATES.LEVEL_COMPLETE) {
        nextLevel();
        return;
    }
    
    // Menü Navigation mit Zahlen (1-6 für Anfänger)
    if (gameState === GAME_STATES.MENU) {
        const levelNumber = Number.parseInt(e.key, 10);
        if (!Number.isNaN(levelNumber) && levelNumber >= 1 && levelNumber <= LEVELS_PER_DIFFICULTY) {
            loadLevel(levelNumber - 1);
        }
    }
    
    // Hauptmenü mit R
    if (e.key.toLowerCase() === 'r') {
        if (gameState !== GAME_STATES.MENU) {
            restartGame();
        }
    }
});

window.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

window.addEventListener('blur', () => {
    resetInput();
});

document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        resetInput();
    }
});

// Mausklick für Menü-Buttons
canvas.addEventListener('click', (e) => {
    if (gameState === GAME_STATES.MENU) {
        const rect = canvas.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const clickY = e.clientY - rect.top;
        
        levels.forEach((level, index) => {
            if (level.buttonX && 
                clickX >= level.buttonX && 
                clickX <= level.buttonX + level.buttonWidth &&
                clickY >= level.buttonY && 
                clickY <= level.buttonY + level.buttonHeight) {
                loadLevel(index);
            }
        });
    }
});

// Collision Detection
function checkCollision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

// Update Player
function updatePlayer() {
    if (gameState !== GAME_STATES.PLAYING) return;

    const prevY = player.y;
    
    // Horizontale Bewegung
    if (keys['ArrowLeft']) {
        player.velocityX = -player.speed;
    } else if (keys['ArrowRight']) {
        player.velocityX = player.speed;
    } else {
        player.velocityX = 0;
    }

    // Springen
    if ((keys[' '] || keys['ArrowUp']) && player.onGround) {
        player.velocityY = -player.jumpPower;
        player.onGround = false;
    }

    // Gravitation
    player.velocityY += player.gravity;

    // Position aktualisieren
    player.x += player.velocityX;
    player.y += player.velocityY;

    // Welt-Grenzen
    if (player.x < 0) player.x = 0;
    if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;

    // Kollision mit Plattformen
    player.onGround = false;
    platforms.forEach(platform => {
        const prevBottom = prevY + player.height;
        const prevTop = prevY;
        const newBottom = player.y + player.height;
        const newTop = player.y;
        const horizontalOverlap = player.x < platform.x + platform.width &&
            player.x + player.width > platform.x;

        if (player.velocityY > 0 && prevBottom <= platform.y && newBottom >= platform.y && horizontalOverlap) {
            player.y = platform.y - player.height;
            player.velocityY = 0;
            player.onGround = true;
        } else if (player.velocityY < 0 && prevTop >= platform.y + platform.height && newTop <= platform.y + platform.height && horizontalOverlap) {
            player.y = platform.y + platform.height;
            player.velocityY = 0;
        }
    });

    // Münzen einsammeln
    coins.forEach(coin => {
        if (!coin.collected && checkCollision(player, coin)) {
            coin.collected = true;
            score += 10;
            updateScore();
        }
    });

    // Game Over wenn Spieler runterfällt
    if (player.y > canvas.height) {
        gameState = GAME_STATES.GAME_OVER;
    }

    // Level Complete wenn alle Münzen gesammelt
    if (coins.every(coin => coin.collected) && !isLevelComplete) {
        isLevelComplete = true;
        gameState = GAME_STATES.LEVEL_COMPLETE;
    }
}

// Draw Player
function drawPlayer() {
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.width, player.height);
    
    // Augen
    ctx.fillStyle = 'white';
    ctx.fillRect(player.x + 8, player.y + 10, 6, 6);
    ctx.fillRect(player.x + 18, player.y + 10, 6, 6);
    
    ctx.fillStyle = 'black';
    ctx.fillRect(player.x + 10, player.y + 12, 3, 3);
    ctx.fillRect(player.x + 20, player.y + 12, 3, 3);
}

// Draw Platforms
function drawPlatforms() {
    platforms.forEach(platform => {
        ctx.fillStyle = platform.color;
        ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
        
        // Platform border
        ctx.strokeStyle = '#229954';
        ctx.lineWidth = 2;
        ctx.strokeRect(platform.x, platform.y, platform.width, platform.height);
    });
}

// Draw Coins
function drawCoins() {
    coins.forEach(coin => {
        if (!coin.collected) {
            ctx.fillStyle = '#FFD700';
            ctx.beginPath();
            ctx.arc(coin.x + coin.width / 2, coin.y + coin.height / 2, coin.width / 2, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.strokeStyle = '#FFA500';
            ctx.lineWidth = 2;
            ctx.stroke();
            
            // Münz-Symbol
            ctx.fillStyle = '#FFA500';
            ctx.font = 'bold 12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('$', coin.x + coin.width / 2, coin.y + coin.height / 2 + 4);
        }
    });
}

// Update Score Display
function updateScore() {
    document.getElementById('score').textContent = 'Score: ' + score;
}

// Restart Game
function restartGame() {
    player.x = 100;
    player.y = 400;
    player.velocityX = 0;
    player.velocityY = 0;
    resetInput();
    gameState = GAME_STATES.MENU;
    currentLevel = 0;
    score = 0;
    isLevelComplete = false;
    updateScore();
}

// Load Level
function loadLevel(levelIndex) {
    currentLevel = levelIndex;
    const level = levels[levelIndex];
    
    platforms = JSON.parse(JSON.stringify(level.platforms));
    coins = JSON.parse(JSON.stringify(level.coins));
    
    player.x = 100;
    player.y = 400;
    player.velocityX = 0;
    player.velocityY = 0;
    player.onGround = false;
    resetInput();
    isLevelComplete = false;
    gameState = GAME_STATES.PLAYING;
}

// Start next level
function nextLevel() {
    if (currentLevel < levels.length - 1) {
        loadLevel(currentLevel + 1);
    } else {
        // Game Won!
        gameState = GAME_STATES.MENU;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('🎉 Alle Level komplett! 🎉', canvas.width / 2, canvas.height / 2 - 50);
        
        ctx.fillStyle = 'white';
        ctx.font = '24px Arial';
        ctx.fillText('Final Score: ' + score, canvas.width / 2, canvas.height / 2 + 20);
        ctx.fillText('Drücke R für Hauptmenü', canvas.width / 2, canvas.height / 2 + 60);
    }
}

// Draw Main Menu
function drawMainMenu() {
    // Background
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(1, '#E0F6FF');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Title
    ctx.fillStyle = '#FF6B6B';
    ctx.font = 'bold 60px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('2D Jump and Run', canvas.width / 2, 120);
    
    // Level Selection
    ctx.fillStyle = '#333';
    ctx.font = 'bold 32px Arial';
    ctx.fillText('Wähle ein Level:', canvas.width / 2, 200);

    const columns = difficultyConfigs.length;
    const rows = LEVELS_PER_DIFFICULTY;
    const buttonWidth = 200;
    const buttonHeight = 34;
    const gapX = 30;
    const gapY = 8;
    const startX = (canvas.width - (columns * buttonWidth + (columns - 1) * gapX)) / 2;
    const startY = 260;

    // Difficulty labels
    ctx.fillStyle = '#444';
    ctx.font = 'bold 20px Arial';
    difficultyConfigs.forEach((config, colIndex) => {
        const labelX = startX + colIndex * (buttonWidth + gapX) + buttonWidth / 2;
        ctx.fillText(config.label, labelX, 230);
    });

    levels.forEach((level, index) => {
        const col = Math.floor(index / LEVELS_PER_DIFFICULTY);
        const row = index % LEVELS_PER_DIFFICULTY;
        const buttonX = startX + col * (buttonWidth + gapX);
        const buttonY = startY + row * (buttonHeight + gapY);

        // Button Background
        ctx.fillStyle = '#2ECC71';
        ctx.fillRect(buttonX, buttonY, buttonWidth, buttonHeight);

        // Button Border
        ctx.strokeStyle = '#27AE60';
        ctx.lineWidth = 2;
        ctx.strokeRect(buttonX, buttonY, buttonWidth, buttonHeight);

        // Button Text
        ctx.fillStyle = 'white';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(level.name, buttonX + buttonWidth / 2, buttonY + 23);

        // Store button position for click detection
        level.buttonX = buttonX;
        level.buttonY = buttonY;
        level.buttonWidth = buttonWidth;
        level.buttonHeight = buttonHeight;
    });

    // Instructions
    ctx.fillStyle = '#666';
    ctx.font = '14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Klicke ein Level oder drücke 1-6 für Anfänger', canvas.width / 2, 590);
}

// Game Over
function drawGameOver() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = 'white';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Game Over!', canvas.width / 2, canvas.height / 2 - 30);
    
    ctx.font = '24px Arial';
    ctx.fillText('Score: ' + score, canvas.width / 2, canvas.height / 2 + 20);
    ctx.fillText('Drücke R für Hauptmenü', canvas.width / 2, canvas.height / 2 + 60);
}

// Level Complete Screen
function drawLevelComplete() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Level Complete!', canvas.width / 2, canvas.height / 2 - 30);
    
    ctx.fillStyle = 'white';
    ctx.font = '24px Arial';
    ctx.fillText('Score: ' + score, canvas.width / 2, canvas.height / 2 + 20);
    
    if (currentLevel < levels.length - 1) {
        ctx.fillText('Drücke LEERTASTE für nächstes Level', canvas.width / 2, canvas.height / 2 + 60);
    } else {
        ctx.fillText('🎉 Du hast das Spiel gewonnen! 🎉', canvas.width / 2, canvas.height / 2 + 60);
    }
    ctx.fillText('Oder R für Hauptmenü', canvas.width / 2, canvas.height / 2 + 100);
}

// Game Loop
function gameLoop() {
    // Clear Canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw based on game state
    switch(gameState) {
        case GAME_STATES.MENU:
            drawMainMenu();
            break;
        case GAME_STATES.PLAYING:
            // Draw Sky
            const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
            gradient.addColorStop(0, '#87CEEB');
            gradient.addColorStop(1, '#E0F6FF');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            updatePlayer();
            drawPlatforms();
            drawCoins();
            drawPlayer();
            
            // Draw level info
            ctx.fillStyle = '#333';
            ctx.font = '16px Arial';
            ctx.textAlign = 'left';
            ctx.fillText(levels[currentLevel].name, 10, 30);
            break;
        case GAME_STATES.LEVEL_COMPLETE:
            // Draw Sky
            const gradient2 = ctx.createLinearGradient(0, 0, 0, canvas.height);
            gradient2.addColorStop(0, '#87CEEB');
            gradient2.addColorStop(1, '#E0F6FF');
            ctx.fillStyle = gradient2;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            drawPlatforms();
            drawCoins();
            drawPlayer();
            drawLevelComplete();
            break;
        case GAME_STATES.GAME_OVER:
            // Draw Sky
            const gradient3 = ctx.createLinearGradient(0, 0, 0, canvas.height);
            gradient3.addColorStop(0, '#87CEEB');
            gradient3.addColorStop(1, '#E0F6FF');
            ctx.fillStyle = gradient3;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            drawPlatforms();
            drawCoins();
            drawPlayer();
            drawGameOver();
            break;
    }
    
    requestAnimationFrame(gameLoop);
}

// Start Game
gameLoop();
