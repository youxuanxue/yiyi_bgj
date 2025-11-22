// 游戏配置
const config = {
    canvas: null,
    ctx: null,
    gameTime: 12, // 12秒对战
    player1Speed: 3,
    player2Speed: 3,
    gameRunning: false,
    timeRemaining: 12,
    gameStartTime: 0,
    gameLoopRunning: false
};

// 玩家对象
const players = {
    player1: {
        x: 100,
        y: 125,
        width: 50,
        height: 50,
        score: 0,
        avatarType: null, // 武器类型
        speed: config.player1Speed,
        color: '#ff6b9d'
    },
    player2: {
        x: 700,
        y: 125,
        width: 50,
        height: 50,
        score: 0,
        avatarType: null, // 武器类型
        speed: config.player2Speed,
        color: '#4facfe'
    }
};

// 武器类型定义（8种不同颜色和款式的拳套）
const avatarTypes = [
    { id: 0, name: '粉色拳套', color: '#ff6b9d', style: 'classic' },
    { id: 1, name: '蓝色拳套', color: '#4facfe', style: 'classic' },
    { id: 2, name: '金色拳套', color: '#ffd700', style: 'spiked' },
    { id: 3, name: '紫色拳套', color: '#9b59b6', style: 'classic' },
    { id: 4, name: '红色拳套', color: '#ff6347', style: 'spiked' },
    { id: 5, name: '绿色拳套', color: '#2ecc71', style: 'classic' },
    { id: 6, name: '橙色拳套', color: '#ff8800', style: 'striped' },
    { id: 7, name: '黑色拳套', color: '#34495e', style: 'spiked' }
];

// 收集物类型（宝石、水果等）
const collectibleTypes = [
    // 水果类
    { type: 'apple', color: '#ff4444', shape: 'circle' },           // 苹果 - 红色圆形
    { type: 'pear', color: '#d4ff00', shape: 'ellipse' },          // 梨 - 黄绿色椭圆
    { type: 'grape', color: '#9b59b6', shape: 'circle' },           // 葡萄 - 紫色圆形
    { type: 'mango', color: '#ff8800', shape: 'ellipse' },         // 芒果 - 橙色椭圆
    { type: 'cherry', color: '#ff0055', shape: 'circle' },          // 樱桃 - 红色小圆形
    { type: 'watermelon', color: '#2ecc71', shape: 'circle' },      // 西瓜 - 绿色圆形
    { type: 'orange', color: '#ff8800', shape: 'circle' },         // 橘子 - 橙色圆形
    { type: 'dragonfruit', color: '#ff69b4', shape: 'ellipse' },    // 火龙果 - 粉色椭圆
    { type: 'pomelo', color: '#ffd700', shape: 'circle' },         // 柚子 - 黄色圆形
    { type: 'banana', color: '#ffeb3b', shape: 'banana' },         // 香蕉 - 黄色弯月形
    { type: 'plum', color: '#8e44ad', shape: 'circle' },           // 西梅 - 紫色圆形
    { type: 'redgrape', color: '#e74c3c', shape: 'circle' },       // 红提 - 红色圆形
    { type: 'pomegranate', color: '#c0392b', shape: 'circle' },   // 石榴 - 深红色圆形
    { type: 'durian', color: '#f39c12', shape: 'ellipse' },        // 榴莲 - 黄绿色椭圆
    
    // 宝石类
    { type: 'diamond', color: '#00d4ff', shape: 'diamond' },       // 钻石 - 蓝色钻石形
    { type: 'crystal', color: '#e8f4f8', shape: 'diamond' },       // 水晶 - 白色钻石形
    { type: 'pearl', color: '#ffffff', shape: 'circle' },          // 珍珠 - 白色圆形
    { type: 'necklace', color: '#ffd700', shape: 'circle' },       // 项链 - 金色圆形
    { type: 'bracelet', color: '#ffd700', shape: 'circle' },       // 手链 - 金色圆形
    { type: 'earring', color: '#ffd700', shape: 'star' },          // 耳环 - 金色星形
    { type: 'earstud', color: '#ffd700', shape: 'circle' }         // 耳钉 - 金色小圆形
];

// 收集物数组（宝石、水果等）
let collectibles = [];

// 爆炸特效数组
let explosions = [];

// 按键状态
const keys = {
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false,
    w: false,
    a: false,
    s: false,
    d: false
};

// 初始化游戏
function init() {
    config.canvas = document.getElementById('gameCanvas');
    config.ctx = config.canvas.getContext('2d');
    
    // 显示头像选择界面
    showAvatarSelection();
}

// 显示武器选择界面
function showAvatarSelection() {
    const selectionScreen = document.getElementById('avatarSelectionScreen');
    selectionScreen.classList.remove('hidden');
    
    // 保留之前选择的武器，不重置
    // 只保留武器选择，如果之前没有选择则保持为null
    
    // 清空分数显示区域的武器（可选，如果希望清空的话）
    // 如果希望保留显示，可以注释掉这部分
    const canvas1 = document.getElementById('player1AvatarCanvas');
    const canvas2 = document.getElementById('player2AvatarCanvas');
    if (canvas1 && players.player1.avatarType === null) {
        const ctx1 = canvas1.getContext('2d');
        ctx1.clearRect(0, 0, canvas1.width, canvas1.height);
    }
    if (canvas2 && players.player2.avatarType === null) {
        const ctx2 = canvas2.getContext('2d');
        ctx2.clearRect(0, 0, canvas2.width, canvas2.height);
    }
    
    // 生成武器选项（会自动选中之前选择的武器）
    generateAvatarOptions('avatarGrid1', 'player1');
    generateAvatarOptions('avatarGrid2', 'player2');
    
    // 如果有之前选择的武器，更新分数显示区域的武器
    if (players.player1.avatarType !== null) {
        updateScoreAvatar('player1');
    }
    
    if (players.player2.avatarType !== null) {
        updateScoreAvatar('player2');
    }
    
    // 检查是否左右手都选择了武器，如果是则启用开始按钮
    const startBtn = document.getElementById('startGameBtn');
    if (players.player1.avatarType !== null && players.player2.avatarType !== null) {
        startBtn.disabled = false;
    } else {
        startBtn.disabled = true;
    }
}

// 生成武器选项
function generateAvatarOptions(gridId, playerKey) {
    const grid = document.getElementById(gridId);
    grid.innerHTML = '';
    
    const currentAvatarType = players[playerKey].avatarType;
    
    avatarTypes.forEach((avatarType, index) => {
        const option = document.createElement('div');
        option.className = 'avatar-option';
        option.dataset.avatarId = index;
        option.dataset.player = playerKey;
        
        // 如果这是之前选择的头像，添加选中状态
        if (currentAvatarType === index) {
            option.classList.add('selected');
        }
        
        // 创建canvas绘制头像预览
        const canvas = document.createElement('canvas');
        canvas.width = 70;
        canvas.height = 70;
        const ctx = canvas.getContext('2d');
        drawAvatarPreview(ctx, 35, 35, 30, avatarType.id, avatarType.color);
        
        option.appendChild(canvas);
        
        option.addEventListener('click', () => selectAvatar(index, playerKey));
        grid.appendChild(option);
    });
}

// 选择武器
function selectAvatar(avatarId, playerKey) {
    // 移除之前的选择
    const grid = document.getElementById(`avatarGrid${playerKey === 'player1' ? '1' : '2'}`);
    grid.querySelectorAll('.avatar-option').forEach(opt => {
        opt.classList.remove('selected');
    });
    
    // 添加当前选择
    const selected = grid.querySelector(`[data-avatar-id="${avatarId}"]`);
    selected.classList.add('selected');
    
    // 保存选择
    players[playerKey].avatarType = avatarId;
    players[playerKey].color = avatarTypes[avatarId].color;
    
    // 更新分数显示区域的头像
    updateScoreAvatar(playerKey);
    
    // 检查是否两个玩家都选择了头像
    const startBtn = document.getElementById('startGameBtn');
    if (players.player1.avatarType !== null && players.player2.avatarType !== null) {
        startBtn.disabled = false;
    }
}

// 更新分数显示区域的武器
function updateScoreAvatar(playerKey) {
    const canvasId = playerKey === 'player1' ? 'player1AvatarCanvas' : 'player2AvatarCanvas';
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const avatarType = players[playerKey].avatarType;
    const color = players[playerKey].color;
    
    if (avatarType === null) return;
    
    // 清空canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 绘制拳套
    const size = 30;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    // 获取拳套样式
    const avatarInfo = avatarTypes[avatarType];
    const style = avatarInfo ? avatarInfo.style : 'classic';
    
    drawGlove(ctx, centerX, centerY, size, color, style);
}

// 绘制拳套
function drawGlove(ctx, x, y, size, color, style) {
    ctx.save();
    ctx.translate(x, y);
    
    // 手指位置定义（5个手指，从左边到右边）
    const fingerPositions = [
        { x: -size * 0.25, width: size * 0.15, yOffset: -size * 0.25 }, // 小指
        { x: -size * 0.12, width: size * 0.16, yOffset: -size * 0.3 },  // 无名指
        { x: 0, width: size * 0.18, yOffset: -size * 0.32 },            // 中指（最长）
        { x: size * 0.13, width: size * 0.16, yOffset: -size * 0.28 },  // 食指
        { x: size * 0.25, width: size * 0.14, yOffset: -size * 0.22 }   // 拇指（较矮）
    ];
    
    // 绘制手指（从底层到顶层）
    fingerPositions.forEach((finger, index) => {
        ctx.fillStyle = color;
        ctx.beginPath();
        // 手指形状：椭圆
        const fingerHeight = size * 0.25 + (index === 2 ? size * 0.05 : 0); // 中指稍长
        ctx.ellipse(finger.x, finger.yOffset - fingerHeight * 0.4, finger.width * 0.4, fingerHeight * 0.5, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // 手指分割线
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(finger.x - finger.width * 0.15, finger.yOffset - fingerHeight * 0.6);
        ctx.lineTo(finger.x - finger.width * 0.15, finger.yOffset + size * 0.05);
        ctx.moveTo(finger.x + finger.width * 0.15, finger.yOffset - fingerHeight * 0.6);
        ctx.lineTo(finger.x + finger.width * 0.15, finger.yOffset + size * 0.05);
        ctx.stroke();
    });
    
    // 拳套主体（手掌部分，连接手指）
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.ellipse(0, size * 0.05, size * 0.4, size * 0.35, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // 手腕部分
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.ellipse(0, size * 0.45, size * 0.28, size * 0.18, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // 根据款式添加不同的装饰
    if (style === 'striped') {
        // 条纹款：添加横条纹
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let i = -0.2; i <= 0.2; i += 0.1) {
            ctx.moveTo(-size * 0.35, size * 0.05 + i * size);
            ctx.lineTo(size * 0.35, size * 0.05 + i * size);
        }
        ctx.stroke();
    } else if (style === 'spiked') {
        // 尖刺款：在手指关节处添加尖刺
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        fingerPositions.forEach((finger, index) => {
            if (index === 2) { // 中指有最大的尖刺
                ctx.beginPath();
                ctx.moveTo(finger.x, finger.yOffset - size * 0.4);
                ctx.lineTo(finger.x - size * 0.06, finger.yOffset - size * 0.35);
                ctx.lineTo(finger.x + size * 0.06, finger.yOffset - size * 0.35);
                ctx.closePath();
                ctx.fill();
            }
        });
    }
    
    // 经典款：手指关节处添加装饰点
    if (style === 'classic') {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
        fingerPositions.forEach((finger, index) => {
            ctx.beginPath();
            ctx.arc(finger.x, finger.yOffset - size * 0.15, size * 0.03, 0, Math.PI * 2);
            ctx.fill();
        });
    }
    
    // 手腕绑带（多条绑带效果）
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.ellipse(0, size * 0.48 + i * size * 0.04, size * 0.28, size * 0.06, 0, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // 高光（在手指和手掌上）
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    // 手掌高光
    ctx.beginPath();
    ctx.ellipse(-size * 0.1, -size * 0.05, size * 0.2, size * 0.25, -0.3, 0, Math.PI * 2);
    ctx.fill();
    // 中指高光
    ctx.beginPath();
    ctx.ellipse(0, -size * 0.35, size * 0.05, size * 0.15, 0, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
}

// 绘制头像预览
function drawAvatarPreview(ctx, x, y, size, avatarId, color) {
    const avatarType = avatarTypes[avatarId];
    const style = avatarType ? avatarType.style : 'classic';
    drawGlove(ctx, x, y, size, color, style);
}

// 开始游戏
function startGame() {
    // 检查是否已选择武器
    if (players.player1.avatarType === null || players.player2.avatarType === null) {
        alert('请先为左右手都选择武器！');
        return;
    }
    
    // 确保canvas已初始化
    if (!config.canvas || !config.ctx) {
        config.canvas = document.getElementById('gameCanvas');
        config.ctx = config.canvas.getContext('2d');
    }
    
    // 隐藏头像选择界面
    document.getElementById('avatarSelectionScreen').classList.add('hidden');
    
    // 重置游戏状态
    players.player1.score = 0;
    players.player2.score = 0;
    players.player1.x = 100;
    players.player1.y = 125;
    players.player2.x = 700;
    players.player2.y = 125;
    collectibles = [];
    explosions = []; // 清空爆炸特效
    config.gameRunning = true;
    config.timeRemaining = config.gameTime;
    config.gameStartTime = Date.now();
    
    // 重置计时器显示
    const timerDisplay = document.getElementById('timerDisplay');
    timerDisplay.textContent = config.gameTime;
    timerDisplay.classList.remove('warning');
    
    // 更新分数显示区域的头像
    updateScoreAvatar('player1');
    updateScoreAvatar('player2');
    
    // 生成初始收集物
    generateCollectibles(8);
    console.log('生成的收集物数量:', collectibles.length);
    
    // 更新分数显示
    updateScore();
    
    // 绑定事件
    bindEvents();
    
    // 隐藏游戏结束画面
    document.getElementById('gameOverScreen').classList.remove('show');
    
    // 立即绘制一次，确保可以看到游戏内容
    draw();
    
    // 开始游戏循环
    if (!config.gameLoopRunning) {
        config.gameLoopRunning = true;
        gameLoop();
    }
    
    // 清除之前的计时器（如果有）
    if (timerInterval) {
        clearTimeout(timerInterval);
        timerInterval = null;
    }
    
    // 更新计时器
    updateTimer();
}

// 生成收集物（宝石、水果等）
function generateCollectibles(count) {
    for (let i = 0; i < count; i++) {
        const type = collectibleTypes[Math.floor(Math.random() * collectibleTypes.length)];
        collectibles.push({
            x: Math.random() * (config.canvas.width - 20) + 10,
            y: Math.random() * (config.canvas.height - 20) + 10,
            size: 10 + Math.random() * 5, // 10px左右
            collected: false,
            type: type.type,
            color: type.color,
            shape: type.shape,
            rotation: Math.random() * Math.PI * 2,
            bobOffset: Math.random() * Math.PI * 2
        });
    }
}

// 键盘事件处理函数（避免重复绑定）
function handleKeyDown(e) {
    if (keys.hasOwnProperty(e.key.toLowerCase())) {
        keys[e.key.toLowerCase()] = true;
    }
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown' || 
        e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        keys[e.key] = true;
    }
}

function handleKeyUp(e) {
    if (keys.hasOwnProperty(e.key.toLowerCase())) {
        keys[e.key.toLowerCase()] = false;
    }
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown' || 
        e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        keys[e.key] = false;
    }
}

// 绑定事件
function bindEvents() {
    // 键盘按下（只绑定一次）
    if (!document.hasKeyboardListeners) {
        document.addEventListener('keydown', handleKeyDown);
        document.addEventListener('keyup', handleKeyUp);
        document.hasKeyboardListeners = true;
    }
}

// 更新计时器
let timerInterval = null;

function updateTimer() {
    if (!config.gameRunning) {
        // 如果游戏已经结束，清除定时器
        if (timerInterval) {
            clearTimeout(timerInterval);
            timerInterval = null;
        }
        return;
    }
    
    const elapsed = (Date.now() - config.gameStartTime) / 1000;
    config.timeRemaining = Math.max(0, config.gameTime - elapsed);
    
    const timerDisplay = document.getElementById('timerDisplay');
    const remainingSeconds = Math.ceil(config.timeRemaining);
    timerDisplay.textContent = remainingSeconds;
    
    // 最后3秒红色警示
    if (config.timeRemaining <= 3 && config.timeRemaining > 0) {
        timerDisplay.classList.add('warning');
    } else {
        timerDisplay.classList.remove('warning');
    }
    
    // 时间到了
    if (config.timeRemaining <= 0) {
        config.gameRunning = false;
        timerDisplay.textContent = '0';
        
        // 清除定时器
        if (timerInterval) {
            clearTimeout(timerInterval);
            timerInterval = null;
        }
        
        endGame();
        return;
    }
    
    // 继续更新计时器
    timerInterval = setTimeout(updateTimer, 100); // 每100ms更新一次
}

// 更新玩家位置
function updatePlayers() {
    if (!config.gameRunning) return;
    
    // 左手控制（WASD）
    if (keys.w && players.player1.y > 0) {
        players.player1.y -= players.player1.speed;
    }
    if (keys.s && players.player1.y < config.canvas.height - players.player1.height) {
        players.player1.y += players.player1.speed;
    }
    if (keys.a && players.player1.x > 0) {
        players.player1.x -= players.player1.speed;
    }
    if (keys.d && players.player1.x < config.canvas.width - players.player1.width) {
        players.player1.x += players.player1.speed;
    }
    
    // 右手控制（方向键）
    if (keys.ArrowUp && players.player2.y > 0) {
        players.player2.y -= players.player2.speed;
    }
    if (keys.ArrowDown && players.player2.y < config.canvas.height - players.player2.height) {
        players.player2.y += players.player2.speed;
    }
    if (keys.ArrowLeft && players.player2.x > 0) {
        players.player2.x -= players.player2.speed;
    }
    if (keys.ArrowRight && players.player2.x < config.canvas.width - players.player2.width) {
        players.player2.x += players.player2.speed;
    }
}

// 创建爆炸特效
function createExplosion(x, y, color) {
    const particleCount = 8; // 粒子数量
    for (let i = 0; i < particleCount; i++) {
        const angle = (Math.PI * 2 * i) / particleCount;
        const speed = 2 + Math.random() * 2;
        explosions.push({
            x: x,
            y: y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            color: color || '#ffd700',
            life: 20, // 生命周期（帧数）
            maxLife: 20,
            size: 3 + Math.random() * 3
        });
    }
}

// 更新爆炸特效
function updateExplosions() {
    explosions = explosions.filter(explosion => {
        explosion.x += explosion.vx;
        explosion.y += explosion.vy;
        explosion.vx *= 0.95; // 减速
        explosion.vy *= 0.95;
        explosion.life--;
        return explosion.life > 0;
    });
}

// 绘制爆炸特效
function drawExplosions() {
    const ctx = config.ctx;
    if (!ctx) return;
    
    explosions.forEach(explosion => {
        const alpha = explosion.life / explosion.maxLife;
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = explosion.color;
        ctx.beginPath();
        ctx.arc(explosion.x, explosion.y, explosion.size * alpha, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    });
}

// 碰撞检测
function checkCollisions() {
    if (!config.gameRunning) return;
    
    collectibles.forEach((collectible, index) => {
        if (collectible.collected) return;
        
        // 检查左手碰撞
        if (isColliding(players.player1, collectible)) {
            collectible.collected = true;
            players.player1.score++;
            updateScore();
            playCollectSound();
            
            // 创建爆炸特效
            const centerX = collectible.x + collectible.size / 2;
            const centerY = collectible.y + collectible.size / 2;
            createExplosion(centerX, centerY, collectible.color);
            
            // 生成新的收集物
            generateNewCollectible(collectible);
        }
        
        // 检查右手碰撞
        if (isColliding(players.player2, collectible)) {
            collectible.collected = true;
            players.player2.score++;
            updateScore();
            playCollectSound();
            
            // 创建爆炸特效
            const centerX = collectible.x + collectible.size / 2;
            const centerY = collectible.y + collectible.size / 2;
            createExplosion(centerX, centerY, collectible.color);
            
            // 生成新的收集物
            generateNewCollectible(collectible);
        }
    });
    
    // 移除已收集的
    collectibles = collectibles.filter(c => !c.collected);
}

// 生成新的收集物替换被收集的
function generateNewCollectible(oldCollectible) {
    const type = collectibleTypes[Math.floor(Math.random() * collectibleTypes.length)];
    const newCollectible = {
        x: Math.random() * (config.canvas.width - 20) + 10,
        y: Math.random() * (config.canvas.height - 20) + 10,
        size: 10 + Math.random() * 5,
        collected: false,
        type: type.type,
        color: type.color,
        shape: type.shape,
        rotation: Math.random() * Math.PI * 2,
        bobOffset: Math.random() * Math.PI * 2
    };
    
    // 确保新收集物不在玩家附近
    const minDistance = 80;
    let tooClose = true;
    let attempts = 0;
    while (tooClose && attempts < 10) {
        tooClose = false;
        if (distance(newCollectible, players.player1) < minDistance ||
            distance(newCollectible, players.player2) < minDistance) {
            tooClose = true;
            newCollectible.x = Math.random() * (config.canvas.width - 20) + 10;
            newCollectible.y = Math.random() * (config.canvas.height - 20) + 10;
        }
        attempts++;
    }
    
    collectibles.push(newCollectible);
}

// 距离计算
function distance(obj1, obj2) {
    const dx = (obj1.x + (obj1.width ? obj1.width/2 : obj1.size/2)) - (obj2.x + (obj2.width ? obj2.width/2 : obj2.size/2));
    const dy = (obj1.y + (obj1.height ? obj1.height/2 : obj1.size/2)) - (obj2.y + (obj2.height ? obj2.height/2 : obj2.size/2));
    return Math.sqrt(dx * dx + dy * dy);
}

// 碰撞检测
function isColliding(obj1, obj2) {
    const r1 = obj1.width ? obj1.width/2 : obj1.size/2;
    const r2 = obj2.width ? obj2.width/2 : obj2.size/2;
    const x1 = obj1.x + (obj1.width ? obj1.width/2 : obj1.size/2);
    const y1 = obj1.y + (obj1.height ? obj1.height/2 : obj1.size/2);
    const x2 = obj2.x + (obj2.width ? obj2.width/2 : obj2.size/2);
    const y2 = obj2.y + (obj2.height ? obj2.height/2 : obj2.size/2);
    
    const dx = x1 - x2;
    const dy = y1 - y2;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    return distance < (r1 + r2);
}

// 更新分数显示
function updateScore() {
    document.getElementById('score1').textContent = players.player1.score;
    document.getElementById('score2').textContent = players.player2.score;
}

// 游戏结束
function endGame() {
    // 停止游戏运行
    config.gameRunning = false;
    
    // 清除计时器
    if (timerInterval) {
        clearTimeout(timerInterval);
        timerInterval = null;
    }
    
    // 延迟显示游戏结束画面，确保最后一次绘制完成
    setTimeout(() => {
        // 停止游戏循环
        config.gameLoopRunning = false;
        const winnerAvatarCanvas = document.getElementById('winnerAvatar');
        const winnerText = document.getElementById('winnerText');
        let winnerPlayer = null;
        let winnerMessage = '';
        
        if (players.player1.score > players.player2.score) {
            winnerPlayer = 'player1';
            winnerMessage = '获胜！🎉';
        } else if (players.player2.score > players.player1.score) {
            winnerPlayer = 'player2';
            winnerMessage = '获胜！🎉';
        } else {
            winnerPlayer = null;
            winnerMessage = '平局！🤝';
        }
        
        // 显示获胜者头像（如果不是平局）
        if (winnerPlayer) {
            const player = players[winnerPlayer];
            if (winnerAvatarCanvas && player.avatarType !== null) {
                const ctx = winnerAvatarCanvas.getContext('2d');
                ctx.clearRect(0, 0, winnerAvatarCanvas.width, winnerAvatarCanvas.height);
                
                const avatarType = player.avatarType;
                const color = player.color;
                const size = 40;
                const centerX = winnerAvatarCanvas.width / 2;
                const centerY = winnerAvatarCanvas.height / 2;
                
                // 获取拳套样式
                const avatarInfo = avatarTypes[avatarType];
                const style = avatarInfo ? avatarInfo.style : 'classic';
                
                drawGlove(ctx, centerX, centerY, size, color, style);
                winnerAvatarCanvas.style.display = 'block';
            } else {
                winnerAvatarCanvas.style.display = 'none';
            }
        } else {
            // 平局时不显示头像
            winnerAvatarCanvas.style.display = 'none';
        }
        
        winnerText.textContent = winnerMessage;
        
        // 显示玩家头像和分数
        updateGameOverAvatars();
        document.getElementById('gameOverPlayer1Score').textContent = `${players.player1.score} 分`;
        document.getElementById('gameOverPlayer2Score').textContent = `${players.player2.score} 分`;
        
        document.getElementById('gameOverScreen').classList.add('show');
    }, 100);
}

// 更新游戏结束界面中的头像
function updateGameOverAvatars() {
    // 更新左手武器
    const canvas1 = document.getElementById('gameOverPlayer1Avatar');
    if (canvas1 && players.player1.avatarType !== null) {
        const ctx1 = canvas1.getContext('2d');
        ctx1.clearRect(0, 0, canvas1.width, canvas1.height);
        
        const avatarType1 = players.player1.avatarType;
        const color1 = players.player1.color;
        const size = 25;
        const centerX = canvas1.width / 2;
        const centerY = canvas1.height / 2;
        
        // 获取拳套样式
        const avatarInfo1 = avatarTypes[avatarType1];
        const style1 = avatarInfo1 ? avatarInfo1.style : 'classic';
        
        drawGlove(ctx1, centerX, centerY, size, color1, style1);
    }
    
    // 更新右手武器
    const canvas2 = document.getElementById('gameOverPlayer2Avatar');
    if (canvas2 && players.player2.avatarType !== null) {
        const ctx2 = canvas2.getContext('2d');
        ctx2.clearRect(0, 0, canvas2.width, canvas2.height);
        
        const avatarType2 = players.player2.avatarType;
        const color2 = players.player2.color;
        const size = 25;
        const centerX = canvas2.width / 2;
        const centerY = canvas2.height / 2;
        
        // 获取拳套样式
        const avatarInfo2 = avatarTypes[avatarType2];
        const style2 = avatarInfo2 ? avatarInfo2.style : 'classic';
        
        drawGlove(ctx2, centerX, centerY, size, color2, style2);
    }
}

// 播放收集音效（bang bang bang）
function playCollectSound() {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const now = audioContext.currentTime;
        
        // 创建三个连续的"bang"声音
        const bangTimes = [0, 0.05, 0.1]; // 三个bang的间隔时间（秒）
        const frequencies = [80, 100, 120]; // 三个bang的频率（低频冲击音）
        
        bangTimes.forEach((delay, index) => {
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            const filterNode = audioContext.createBiquadFilter();
            
            oscillator.connect(filterNode);
            filterNode.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            // 使用低频方波产生"bang"的冲击感
            oscillator.frequency.value = frequencies[index];
            oscillator.type = 'square';
            
            // 添加低通滤波器，使声音更闷更有冲击感
            filterNode.type = 'lowpass';
            filterNode.frequency.value = 200;
            
            // 快速衰减的音量包络
            const startTime = now + delay;
            const duration = 0.08;
            
            gainNode.gain.setValueAtTime(0, startTime);
            gainNode.gain.linearRampToValueAtTime(0.4, startTime + 0.01);
            gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
            
            oscillator.start(startTime);
            oscillator.stop(startTime + duration);
        });
    } catch (e) {
        // 忽略音频错误
        console.log('Audio error:', e);
    }
}

// 绘制玩家头像（拳套）
function drawPlayerAvatar(x, y, width, height, avatarType, color) {
    const ctx = config.ctx;
    const centerX = x + width / 2;
    const centerY = y + height / 2;
    const size = Math.min(width, height) * 0.9;
    
    // 获取拳套样式
    const avatarInfo = avatarTypes[avatarType];
    const style = avatarInfo ? avatarInfo.style : 'classic';
    
    drawGlove(ctx, centerX, centerY, size, color, style);
}

// 绘制收集物（宝石、水果等）
function drawCollectible(x, y, size, color, shape, time) {
    const ctx = config.ctx;
    if (!ctx) return;
    
    // 确保收集物大小至少为8px，最大15px
    const actualSize = Math.max(8, Math.min(15, size));
    const bobOffset = Math.sin(time * 0.005) * 2;
    const centerX = x + actualSize / 2;
    const centerY = y + actualSize / 2 + bobOffset;
    
    ctx.save();
    ctx.translate(centerX, centerY);
    
    if (shape === 'diamond') {
        // 绘制钻石
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(0, -actualSize/2);
        ctx.lineTo(actualSize/3, 0);
        ctx.lineTo(0, actualSize/2);
        ctx.lineTo(-actualSize/3, 0);
        ctx.closePath();
        ctx.fill();
        
        // 边框
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.lineWidth = 1;
        ctx.stroke();
        
        // 高光
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.beginPath();
        ctx.moveTo(0, -actualSize/2);
        ctx.lineTo(actualSize/6, -actualSize/4);
        ctx.lineTo(0, 0);
        ctx.closePath();
        ctx.fill();
    } else if (shape === 'star') {
        // 绘制星星
        ctx.fillStyle = color;
        ctx.beginPath();
        const spikes = 5;
        const outerRadius = actualSize/2;
        const innerRadius = actualSize/4;
        let rot = Math.PI / 2 * 3;
        ctx.moveTo(0, -outerRadius);
        for (let i = 0; i < spikes; i++) {
            let x = Math.cos(rot) * outerRadius;
            let y = Math.sin(rot) * outerRadius;
            ctx.lineTo(x, y);
            rot += Math.PI / spikes;
            
            x = Math.cos(rot) * innerRadius;
            y = Math.sin(rot) * innerRadius;
            ctx.lineTo(x, y);
            rot += Math.PI / spikes;
        }
        ctx.closePath();
        ctx.fill();
        
        // 边框
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.lineWidth = 1;
        ctx.stroke();
    } else if (shape === 'ellipse') {
        // 绘制椭圆（梨、芒果、火龙果、榴莲等）
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.ellipse(0, 0, actualSize/3, actualSize/2, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // 边框
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.lineWidth = 1;
        ctx.stroke();
        
        // 高光
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.beginPath();
        ctx.ellipse(-actualSize/8, -actualSize/6, actualSize/8, actualSize/6, 0, 0, Math.PI * 2);
        ctx.fill();
    } else if (shape === 'banana') {
        // 绘制香蕉（弯月形）
        ctx.fillStyle = color;
        ctx.beginPath();
        // 绘制弯月形
        ctx.arc(0, 0, actualSize/2, 0.3 * Math.PI, 1.7 * Math.PI, false);
        ctx.arc(0, -actualSize/6, actualSize/2.5, 0.3 * Math.PI, 1.7 * Math.PI, true);
        ctx.closePath();
        ctx.fill();
        
        // 边框
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.lineWidth = 1;
        ctx.stroke();
        
        // 高光
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.beginPath();
        ctx.arc(-actualSize/8, -actualSize/8, actualSize/6, 0, Math.PI * 2);
        ctx.fill();
    } else {
        // 绘制圆形（苹果、葡萄、樱桃、橘子等）
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(0, 0, actualSize/2, 0, Math.PI * 2);
        ctx.fill();
        
        // 边框
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.lineWidth = 1;
        ctx.stroke();
        
        // 高光
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.beginPath();
        ctx.arc(-actualSize/6, -actualSize/6, actualSize/4, 0, Math.PI * 2);
        ctx.fill();
    }
    
    ctx.restore();
}

// 绘制游戏画面
function draw() {
    const ctx = config.ctx;
    const canvas = config.canvas;
    
    if (!ctx || !canvas) return;
    
    const time = Date.now();
    
    // 清空画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 绘制背景装饰
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.beginPath();
    ctx.arc(100, 50, 20, 0, Math.PI * 2);
    ctx.arc(130, 50, 25, 0, Math.PI * 2);
    ctx.arc(160, 50, 20, 0, Math.PI * 2);
    ctx.fill();
    
    // 绘制收集物（只有在游戏运行时才绘制）
    if (config.gameRunning || collectibles.length > 0) {
        collectibles.forEach(collectible => {
            if (!collectible.collected) {
                drawCollectible(
                    collectible.x, 
                    collectible.y, 
                    collectible.size, 
                    collectible.color, 
                    collectible.shape,
                    time + collectible.bobOffset * 1000
                );
            }
        });
    }
    
    // 绘制玩家（只有在游戏运行时或已选择武器时才绘制）
    if (config.gameRunning || players.player1.avatarType !== null) {
        const avatar1 = players.player1.avatarType !== null ? players.player1.avatarType : 0;
        drawPlayerAvatar(
            players.player1.x, 
            players.player1.y, 
            players.player1.width, 
            players.player1.height,
            avatar1,
            players.player1.color
        );
        
        // 绘制玩家名称标签
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 3;
        ctx.strokeText('左手', players.player1.x + players.player1.width / 2, players.player1.y - 10);
        ctx.fillText('左手', players.player1.x + players.player1.width / 2, players.player1.y - 10);
    }
    
    if (config.gameRunning || players.player2.avatarType !== null) {
        const avatar2 = players.player2.avatarType !== null ? players.player2.avatarType : 0;
        drawPlayerAvatar(
            players.player2.x, 
            players.player2.y, 
            players.player2.width, 
            players.player2.height,
            avatar2,
            players.player2.color
        );
        
        // 绘制玩家名称标签
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 3;
        ctx.strokeText('右手', players.player2.x + players.player2.width / 2, players.player2.y - 10);
        ctx.fillText('右手', players.player2.x + players.player2.width / 2, players.player2.y - 10);
    }
    
    // 绘制爆炸特效（在最上层）
    drawExplosions();
}

// 游戏主循环
function gameLoop() {
    if (config.gameRunning) {
        updatePlayers();
        checkCollisions();
    }
    
    // 更新爆炸特效
    updateExplosions();
    
    draw();
    
    // 继续循环
    if (config.gameLoopRunning) {
        requestAnimationFrame(gameLoop);
    }
}

// 页面加载完成后初始化游戏
window.addEventListener('load', () => {
    init();
    
    // 绑定开始游戏按钮（只绑定一次）
    const startBtn = document.getElementById('startGameBtn');
    if (!startBtn.hasListener) {
        startBtn.addEventListener('click', startGame);
        startBtn.hasListener = true;
    }
    
    // 绑定重新开始按钮（只绑定一次）
    const restartBtn = document.getElementById('restartBtn');
    if (!restartBtn.hasListener) {
        restartBtn.addEventListener('click', () => {
            showAvatarSelection();
        });
        restartBtn.hasListener = true;
    }
});