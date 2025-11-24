// 游戏配置
const config = {
    canvas: null,
    ctx: null,
    canvasWidth: 800, // Canvas 实际绘图宽度
    canvasHeight: 600, // Canvas 实际绘图高度（默认更高，4:3比例）
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
        y: 250, // 调整初始位置，适配更高的Canvas（从125改为250，接近中间位置）
        width: 50,
        height: 50,
        score: 0,
        avatarType: null, // 武器类型
        speed: config.player1Speed,
        color: '#ff6b9d'
    },
    player2: {
        x: 700,
        y: 250, // 调整初始位置，适配更高的Canvas
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

// 检测设备类型
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
                 (window.innerWidth <= 768);

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
    
    // 响应式 Canvas 调整
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('orientationchange', () => {
        setTimeout(resizeCanvas, 100);
    });
    
    // 显示头像选择界面
    showAvatarSelection();
}

// 响应式 Canvas 尺寸调整
function resizeCanvas() {
    if (!config.canvas || !config.ctx) return;
    
    const canvas = config.canvas;
    const container = canvas.parentElement;
    if (!container) return;
    
    const containerWidth = container.clientWidth - 40; // 减去 padding
    const containerHeight = window.innerHeight - 200; // 减去 header 和其他元素的高度，留出更多空间给 Canvas
    
    // 使用更宽的宽高比，让Canvas更高 (4:3 比例，更接近正方形)
    const aspectRatio = 4 / 3; // 原来是 8/3，现在改成 4/3，让Canvas更高
    let newWidth = containerWidth;
    let newHeight = containerWidth / aspectRatio;
    
    // 如果高度超出容器，按高度计算
    if (newHeight > containerHeight) {
        newHeight = containerHeight;
        newWidth = containerHeight * aspectRatio;
    }
    
    // 限制最大尺寸（保持原有最大宽度）
    if (newWidth > 800) {
        newWidth = 800;
        newHeight = 800 / aspectRatio; // 约 600
    }
    
    // 限制最小尺寸
    if (newWidth < 320) {
        newWidth = 320;
        newHeight = 320 / aspectRatio; // 约 240
    }
    
    // 更新实际绘图尺寸（逻辑尺寸）
    config.canvasWidth = newWidth;
    config.canvasHeight = newHeight;
    
    // 确保Canvas有最小高度
    if (config.canvasHeight < 200) {
        config.canvasHeight = 200;
    }
    
    // 设置 Canvas 显示尺寸（CSS 尺寸，逻辑像素）
    canvas.style.width = newWidth + 'px';
    canvas.style.height = newHeight + 'px';
    
    // 保持 Canvas 内部分辨率，确保清晰度（物理像素）
    const devicePixelRatio = window.devicePixelRatio || 1;
    const actualWidth = newWidth * devicePixelRatio;
    const actualHeight = newHeight * devicePixelRatio;
    
    // 只有在尺寸真正改变时才重新设置 Canvas
    if (canvas.width !== actualWidth || canvas.height !== actualHeight) {
        // 保存当前的变换状态（如果有）
        const oldScale = config.ctx ? config.ctx.getTransform() : null;
        
        canvas.width = actualWidth;
        canvas.height = actualHeight;
        
        // 重新获取上下文（因为修改 width/height 会重置上下文）
        config.ctx = canvas.getContext('2d');
        const ctx = config.ctx;
        
        // 缩放绘图上下文以匹配设备像素比
        // 这样所有绘制都使用逻辑坐标，与 config.canvasWidth/Height 一致
        ctx.scale(devicePixelRatio, devicePixelRatio);
        
        // 确保坐标系统与逻辑尺寸一致
        console.log('Canvas 尺寸已更新:', {
            cssSize: `${newWidth}x${newHeight}`,
            physicalSize: `${actualWidth}x${actualHeight}`,
            logicalSize: `${config.canvasWidth}x${config.canvasHeight}`,
            devicePixelRatio: devicePixelRatio
        });
    }
    
    // 如果游戏正在运行，重新绘制
    if (config.gameRunning) {
        draw();
    }
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
        
        // 点击事件（桌面端）
        option.addEventListener('click', () => selectAvatar(index, playerKey));
        
        // 触摸事件（移动端）
        option.addEventListener('touchstart', (e) => {
            e.preventDefault();
            option.style.transform = 'scale(0.95)';
        }, { passive: false });
        
        option.addEventListener('touchend', (e) => {
            e.preventDefault();
            option.style.transform = '';
            selectAvatar(index, playerKey);
        }, { passive: false });
        
        option.addEventListener('touchcancel', (e) => {
            e.preventDefault();
            option.style.transform = '';
        }, { passive: false });
        
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
    if (startBtn) {
        const bothSelected = players.player1.avatarType !== null && players.player2.avatarType !== null;
        startBtn.disabled = !bothSelected;
        console.log('选择武器后，按钮状态:', {
            player1: players.player1.avatarType,
            player2: players.player2.avatarType,
            disabled: !bothSelected
        });
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
    try {
        console.log('startGame 函数被调用');
        console.log('玩家1武器:', players.player1.avatarType);
        console.log('玩家2武器:', players.player2.avatarType);
        
        // 检查是否已选择武器
        if (players.player1.avatarType === null || players.player2.avatarType === null) {
            console.warn('武器未选择完整');
            alert('请先为左右手都选择武器！');
            return;
        }
        
        console.log('武器选择完整，开始游戏');
        
        // 隐藏头像选择界面（先隐藏，避免卡顿）
        const selectionScreen = document.getElementById('avatarSelectionScreen');
        if (selectionScreen) {
            selectionScreen.classList.add('hidden');
            console.log('隐藏武器选择界面');
        }
        
        // 确保canvas已初始化
        if (!config.canvas || !config.ctx) {
            config.canvas = document.getElementById('gameCanvas');
            if (!config.canvas) {
                console.error('无法找到 gameCanvas 元素！');
                alert('游戏初始化失败，请刷新页面重试！');
                return;
            }
            config.ctx = config.canvas.getContext('2d');
            if (!config.ctx) {
                console.error('无法创建 Canvas 上下文！');
                alert('浏览器不支持 Canvas，请更换浏览器！');
                return;
            }
            // 重新调整Canvas尺寸
            resizeCanvas();
        }
        
            // 重置游戏状态
        const canvasWidth = config.canvasWidth || 800;
        const canvasHeight = config.canvasHeight || 600;
        players.player1.score = 0;
        players.player2.score = 0;
        players.player1.x = canvasWidth * 0.125; // 相对位置：12.5%
        players.player1.y = canvasHeight * 0.42; // 相对位置：42%
        players.player2.x = canvasWidth * 0.875 - players.player2.width; // 相对位置：87.5%
        players.player2.y = canvasHeight * 0.42; // 相对位置：42%
        collectibles = [];
        explosions = []; // 清空爆炸特效
        config.gameRunning = true;
        config.timeRemaining = config.gameTime;
        config.gameStartTime = Date.now();
        
        // 重置计时器显示
        const timerDisplay = document.getElementById('timerDisplay');
        if (timerDisplay) {
            timerDisplay.innerHTML = `<span class="timer-value">${config.gameTime}</span><span class="timer-icon">⏰</span>`;
            timerDisplay.classList.remove('warning');
        }
        
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
        
        // 确保触摸控制已绑定（移动端）
        if (!document.hasTouchListeners) {
            bindTouchControls();
            document.hasTouchListeners = true;
        }
        
        // 隐藏游戏结束画面
        const gameOverScreen = document.getElementById('gameOverScreen');
        if (gameOverScreen) {
            gameOverScreen.classList.remove('show');
        }
        
        // 清除之前的计时器（如果有）
        if (timerInterval) {
            clearTimeout(timerInterval);
            timerInterval = null;
        }
        
        // 启动计时器
        updateTimer();
        console.log('计时器已启动');
        
        // 立即绘制一次，确保可以看到游戏内容
        try {
            draw();
            console.log('绘制完成');
        } catch (drawError) {
            console.error('绘制失败:', drawError);
        }
        
        // 开始游戏循环
        if (!config.gameLoopRunning) {
            config.gameLoopRunning = true;
            console.log('开始游戏循环');
            requestAnimationFrame(gameLoop);
        }
        
        console.log('游戏已开始！');
    } catch (error) {
        console.error('开始游戏时出错:', error);
        alert('游戏启动失败：' + (error.message || error.toString()) + '\n请刷新页面重试！');
        
        // 尝试恢复选择界面
        const selectionScreen = document.getElementById('avatarSelectionScreen');
        if (selectionScreen) {
            selectionScreen.classList.remove('hidden');
        }
    }
}

// 生成收集物（宝石、水果等）
function generateCollectibles(count) {
    const canvasWidth = config.canvasWidth || 800;
    const canvasHeight = config.canvasHeight || 600;
    for (let i = 0; i < count; i++) {
        const type = collectibleTypes[Math.floor(Math.random() * collectibleTypes.length)];
        collectibles.push({
            x: Math.random() * (canvasWidth - 20) + 10,
            y: Math.random() * (canvasHeight - 20) + 10,
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
    
    // 触摸事件（移动端直接触摸控制）
    if (!document.hasTouchListeners) {
        bindTouchControls();
        document.hasTouchListeners = true;
    }
}

// 触摸控制状态（多点触摸支持）
const touchControls = {
    touches: new Map(), // 存储当前所有触摸点 {touchId: {player: 'player1'|'player2', startX, startY, lastX, lastY}}
    isMobile: false
};

// 获取 Canvas 内的相对坐标（逻辑坐标，与绘制坐标系统一致）
function getCanvasTouchPos(e, touch) {
    const canvas = config.canvas;
    if (!canvas) {
        return { x: 0, y: 0 };
    }
    
    // 获取 Canvas 在页面中的位置和尺寸（CSS 显示尺寸，逻辑像素）
    // getBoundingClientRect() 返回的是设备像素，但由于CSS单位是px，所以返回的是逻辑像素
    const rect = canvas.getBoundingClientRect();
    
    // Canvas 的逻辑尺寸（与绘制坐标系统一致的尺寸）
    const logicalWidth = config.canvasWidth || 800;
    const logicalHeight = config.canvasHeight || 600;
    
    // 触摸点在页面中的坐标（设备像素坐标）
    const touchX = touch.clientX;
    const touchY = touch.clientY;
    
    // 计算触摸点相对于 Canvas 的偏移量（设备像素）
    const offsetX = touchX - rect.left;
    const offsetY = touchY - rect.top;
    
    // 重要：rect.width 和 rect.height 应该是 Canvas 的 CSS 尺寸（逻辑像素）
    // 但由于浏览器可能返回设备像素，我们需要确保转换正确
    
    // 方法1：直接使用逻辑尺寸计算（推荐）
    // 假设 rect.width 和 rect.height 就是逻辑尺寸（CSS px）
    // 如果它们不匹配，说明可能有缩放或其他问题
    
    // 计算相对位置（0-1 范围）
    const relativeX = offsetX / rect.width;
    const relativeY = offsetY / rect.height;
    
    // 转换为 Canvas 逻辑坐标（与绘制坐标系统一致）
    // 注意：由于使用了 ctx.scale(devicePixelRatio, devicePixelRatio)，
    // 所有绘制都使用逻辑坐标（config.canvasWidth/Height），
    // 所以这里也要使用逻辑坐标
    let logicalX = relativeX * logicalWidth;
    let logicalY = relativeY * logicalHeight;
    
    // 如果 rect 的尺寸和逻辑尺寸不匹配，可能需要调整
    // 但通常它们应该是匹配的，因为我们在 resizeCanvas 中设置了它们相等
    if (Math.abs(rect.width - logicalWidth) > 1 || Math.abs(rect.height - logicalHeight) > 1) {
        // 如果尺寸不匹配，使用直接比例计算
        // 这种情况理论上不应该发生，但如果发生了，使用 rect 的实际尺寸
        logicalX = (offsetX / rect.width) * logicalWidth;
        logicalY = (offsetY / rect.height) * logicalHeight;
    }
    
    // 确保坐标在有效范围内
    return {
        x: Math.max(0, Math.min(logicalWidth, logicalX)),
        y: Math.max(0, Math.min(logicalHeight, logicalY))
    };
}

// 判断触摸点属于哪个玩家区域
function getTouchPlayer(x) {
    const canvasWidth = config.canvasWidth || 800;
    // 左侧区域控制左手，右侧区域控制右手
    return x < canvasWidth / 2 ? 'player1' : 'player2';
}

// 根据触摸移动方向设置按键状态
function updateKeysFromTouch(player, deltaX, deltaY, threshold = 3) {
    // 清除该玩家的所有按键状态
    if (player === 'player1') {
        keys.w = false;
        keys.s = false;
        keys.a = false;
        keys.d = false;
    } else {
        keys.ArrowUp = false;
        keys.ArrowDown = false;
        keys.ArrowLeft = false;
        keys.ArrowRight = false;
    }
    
    // 计算移动距离
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    
    // 如果移动距离足够大，才设置按键状态
    if (distance > threshold) {
        // 计算角度（弧度）
        const angle = Math.atan2(deltaY, deltaX);
        const degrees = angle * 180 / Math.PI;
        
        // 将角度转换为8方向：上、右上、右、右下、下、左下、左、左上
        // 使用更宽松的角度判断
        if (degrees >= -22.5 && degrees < 22.5) {
            // 向右
            if (player === 'player1') keys.d = true;
            else keys.ArrowRight = true;
        } else if (degrees >= 22.5 && degrees < 67.5) {
            // 右下
            if (player === 'player1') {
                keys.d = true;
                keys.s = true;
            } else {
                keys.ArrowRight = true;
                keys.ArrowDown = true;
            }
        } else if (degrees >= 67.5 && degrees < 112.5) {
            // 向下
            if (player === 'player1') keys.s = true;
            else keys.ArrowDown = true;
        } else if (degrees >= 112.5 && degrees < 157.5) {
            // 左下
            if (player === 'player1') {
                keys.a = true;
                keys.s = true;
            } else {
                keys.ArrowLeft = true;
                keys.ArrowDown = true;
            }
        } else if (degrees >= 157.5 || degrees < -157.5) {
            // 向左
            if (player === 'player1') keys.a = true;
            else keys.ArrowLeft = true;
        } else if (degrees >= -157.5 && degrees < -112.5) {
            // 左上
            if (player === 'player1') {
                keys.a = true;
                keys.w = true;
            } else {
                keys.ArrowLeft = true;
                keys.ArrowUp = true;
            }
        } else if (degrees >= -112.5 && degrees < -67.5) {
            // 向上
            if (player === 'player1') keys.w = true;
            else keys.ArrowUp = true;
        } else if (degrees >= -67.5 && degrees < -22.5) {
            // 右上
            if (player === 'player1') {
                keys.d = true;
                keys.w = true;
            } else {
                keys.ArrowRight = true;
                keys.ArrowUp = true;
            }
        }
    }
}

// 绑定触摸控制（Canvas 直接触摸）
function bindTouchControls() {
    const canvas = config.canvas;
    if (!canvas) {
        // 如果 Canvas 还未初始化，稍后重试
        setTimeout(bindTouchControls, 100);
        return;
    }
    
    // 如果已经绑定过，不重复绑定
    if (canvas.hasTouchControlsBound) return;
    
    // 检测是否为移动设备
    touchControls.isMobile = isMobile || ('ontouchstart' in window) || 
                            (window.innerWidth <= 768);
    
    // 如果不是移动设备，绑定虚拟按钮
    if (!touchControls.isMobile) {
        bindVirtualButtons();
        return;
    }
    
    // 移动设备：Canvas 直接触摸控制
    // 标记已绑定，防止重复绑定
    canvas.hasTouchControlsBound = true;
    
    // 触摸开始
    canvas.addEventListener('touchstart', (e) => {
        // 游戏未运行时也允许触摸（但只记录位置，不控制）
        e.preventDefault();
        if (!config.gameRunning) return;
        
        Array.from(e.changedTouches).forEach(touch => {
            const pos = getCanvasTouchPos(e, touch);
            const player = getTouchPlayer(pos.x);
            
            // 获取玩家对象，直接设置初始位置
            const playerObj = players[player];
            if (playerObj) {
                // 让玩家立即移动到触摸位置（第一次触摸时）
                const targetX = pos.x - playerObj.width / 2;
                const targetY = pos.y - playerObj.height / 2;
                const canvasWidth = config.canvasWidth || 800;
                const canvasHeight = config.canvasHeight || 600;
                
                playerObj.x = Math.max(0, Math.min(canvasWidth - playerObj.width, targetX));
                playerObj.y = Math.max(0, Math.min(canvasHeight - playerObj.height, targetY));
            }
            
            touchControls.touches.set(touch.identifier, {
                player: player,
                startX: pos.x,
                startY: pos.y,
                lastX: pos.x,
                lastY: pos.y,
                active: true
            });
        });
    }, { passive: false });
    
    // 触摸移动（直接定位模式：触摸哪里，玩家就移动到哪里）
    canvas.addEventListener('touchmove', (e) => {
        e.preventDefault();
        if (!config.gameRunning) return;
        
        Array.from(e.changedTouches).forEach(touch => {
            const touchData = touchControls.touches.get(touch.identifier);
            if (!touchData || !touchData.active) return;
            
            const pos = getCanvasTouchPos(e, touch);
            const player = touchData.player;
            
            // 获取玩家对象
            const playerObj = players[player];
            if (!playerObj) return;
            
            // 计算目标位置（触摸点位置，让玩家中心移动到触摸点）
            const targetX = pos.x - playerObj.width / 2;
            const targetY = pos.y - playerObj.height / 2;
            
            // 获取Canvas边界
            const canvasWidth = config.canvasWidth || 800;
            const canvasHeight = config.canvasHeight || 600;
            
            // 限制在Canvas范围内
            const clampedX = Math.max(0, Math.min(canvasWidth - playerObj.width, targetX));
            const clampedY = Math.max(0, Math.min(canvasHeight - playerObj.height, targetY));
            
            // 计算需要移动的距离和方向
            const deltaX = clampedX - playerObj.x;
            const deltaY = clampedY - playerObj.y;
            
            // 计算距离
            const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
            
            // 如果距离很小，直接移动到目标位置
            if (distance < 3) {
                playerObj.x = clampedX;
                playerObj.y = clampedY;
            } else {
                // 直接移动玩家（使用更快的速度），让玩家快速移动到触摸位置
                const moveSpeed = Math.min(distance, playerObj.speed * 2); // 加速移动
                const angle = Math.atan2(deltaY, deltaX);
                
                playerObj.x += Math.cos(angle) * moveSpeed;
                playerObj.y += Math.sin(angle) * moveSpeed;
                
                // 确保不超出边界
                playerObj.x = Math.max(0, Math.min(canvasWidth - playerObj.width, playerObj.x));
                playerObj.y = Math.max(0, Math.min(canvasHeight - playerObj.height, playerObj.y));
            }
            
            // 更新最后触摸位置
            touchData.lastX = pos.x;
            touchData.lastY = pos.y;
            touchData.targetX = clampedX;
            touchData.targetY = clampedY;
        });
    }, { passive: false });
    
    // 触摸结束
    canvas.addEventListener('touchend', (e) => {
        e.preventDefault();
        if (!config.gameRunning) return;
        
        Array.from(e.changedTouches).forEach(touch => {
            const touchData = touchControls.touches.get(touch.identifier);
            if (!touchData) return;
            
            // 清除该玩家的按键状态
            if (touchData.player === 'player1') {
                keys.w = false;
                keys.s = false;
                keys.a = false;
                keys.d = false;
            } else {
                keys.ArrowUp = false;
                keys.ArrowDown = false;
                keys.ArrowLeft = false;
                keys.ArrowRight = false;
            }
            
            touchControls.touches.delete(touch.identifier);
        });
    }, { passive: false });
    
    // 触摸取消
    canvas.addEventListener('touchcancel', (e) => {
        e.preventDefault();
        if (!config.gameRunning) return;
        
        Array.from(e.changedTouches).forEach(touch => {
            const touchData = touchControls.touches.get(touch.identifier);
            if (!touchData) return;
            
            // 清除该玩家的按键状态
            if (touchData.player === 'player1') {
                keys.w = false;
                keys.s = false;
                keys.a = false;
                keys.d = false;
            } else {
                keys.ArrowUp = false;
                keys.ArrowDown = false;
                keys.ArrowLeft = false;
                keys.ArrowRight = false;
            }
            
            touchControls.touches.delete(touch.identifier);
        });
    }, { passive: false });
}

// 绑定虚拟按钮（桌面端使用）
function bindVirtualButtons() {
    const controlButtons = document.querySelectorAll('.control-btn');
    
    controlButtons.forEach(button => {
        const key = button.getAttribute('data-key');
        if (!key) return;
        
        // 触摸开始（按下）
        button.addEventListener('touchstart', (e) => {
            e.preventDefault();
            button.classList.add('active');
            if (keys.hasOwnProperty(key)) {
                keys[key] = true;
            }
        }, { passive: false });
        
        // 触摸结束（释放）
        button.addEventListener('touchend', (e) => {
            e.preventDefault();
            button.classList.remove('active');
            if (keys.hasOwnProperty(key)) {
                keys[key] = false;
            }
        }, { passive: false });
        
        // 触摸取消
        button.addEventListener('touchcancel', (e) => {
            e.preventDefault();
            button.classList.remove('active');
            if (keys.hasOwnProperty(key)) {
                keys[key] = false;
            }
        }, { passive: false });
        
        // 鼠标事件（桌面浏览器测试用）
        button.addEventListener('mousedown', (e) => {
            e.preventDefault();
            button.classList.add('active');
            if (keys.hasOwnProperty(key)) {
                keys[key] = true;
            }
        });
        
        button.addEventListener('mouseup', (e) => {
            e.preventDefault();
            button.classList.remove('active');
            if (keys.hasOwnProperty(key)) {
                keys[key] = false;
            }
        });
        
        button.addEventListener('mouseleave', (e) => {
            e.preventDefault();
            button.classList.remove('active');
            if (keys.hasOwnProperty(key)) {
                keys[key] = false;
            }
        });
    });
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
    const timerValue = timerDisplay.querySelector('.timer-value');
    const remainingSeconds = Math.ceil(config.timeRemaining);
    if (timerValue) {
        timerValue.textContent = remainingSeconds;
    } else {
        // 向后兼容：如果没有找到.timer-value，更新整个文本
        timerDisplay.innerHTML = `<span class="timer-value">${remainingSeconds}</span><span class="timer-icon">⏰</span>`;
    }
    
    // 最后3秒红色警示
    if (config.timeRemaining <= 3 && config.timeRemaining > 0) {
        timerDisplay.classList.add('warning');
    } else {
        timerDisplay.classList.remove('warning');
    }
    
    // 时间到了
    if (config.timeRemaining <= 0) {
        config.gameRunning = false;
        const timerValue = timerDisplay.querySelector('.timer-value');
        if (timerValue) {
            timerValue.textContent = '0';
        } else {
            timerDisplay.innerHTML = `<span class="timer-value">0</span><span class="timer-icon">⏰</span>`;
        }
        
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
    
    // 使用实际绘图尺寸进行边界检测
    const canvasWidth = config.canvasWidth || config.canvas.width / (window.devicePixelRatio || 1);
    const canvasHeight = config.canvasHeight || config.canvas.height / (window.devicePixelRatio || 1);
    
    // 左手控制（WASD）
    if (keys.w && players.player1.y > 0) {
        players.player1.y -= players.player1.speed;
    }
    if (keys.s && players.player1.y < canvasHeight - players.player1.height) {
        players.player1.y += players.player1.speed;
    }
    if (keys.a && players.player1.x > 0) {
        players.player1.x -= players.player1.speed;
    }
    if (keys.d && players.player1.x < canvasWidth - players.player1.width) {
        players.player1.x += players.player1.speed;
    }
    
    // 右手控制（方向键）
    if (keys.ArrowUp && players.player2.y > 0) {
        players.player2.y -= players.player2.speed;
    }
    if (keys.ArrowDown && players.player2.y < canvasHeight - players.player2.height) {
        players.player2.y += players.player2.speed;
    }
    if (keys.ArrowLeft && players.player2.x > 0) {
        players.player2.x -= players.player2.speed;
    }
    if (keys.ArrowRight && players.player2.x < canvasWidth - players.player2.width) {
        players.player2.x += players.player2.speed;
    }
}

// 创建爆炸特效（优化版本，限制数量）
function createExplosion(x, y, color) {
    // 如果爆炸特效太多，不创建新的
    if (explosions.length > MAX_EXPLOSIONS - 8) {
        return;
    }
    
    const particleCount = 6; // 减少粒子数量，提高性能
    for (let i = 0; i < particleCount; i++) {
        const angle = (Math.PI * 2 * i) / particleCount;
        const speed = 2 + Math.random() * 2;
        explosions.push({
            x: x,
            y: y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            color: color || '#ffd700',
            life: 15, // 减少生命周期，提高性能
            maxLife: 15,
            size: 3 + Math.random() * 3
        });
    }
}

// 更新爆炸特效（优化版本，限制数量）
const MAX_EXPLOSIONS = 50; // 限制最大爆炸特效数量，避免性能问题

function updateExplosions() {
    // 如果爆炸特效太多，移除最旧的
    if (explosions.length > MAX_EXPLOSIONS) {
        explosions = explosions.slice(-MAX_EXPLOSIONS);
    }
    
    // 更新并过滤已结束的爆炸
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
    
    // 优化：只遍历未收集的物品，减少循环次数
    for (let i = collectibles.length - 1; i >= 0; i--) {
        const collectible = collectibles[i];
        if (collectible.collected) continue;
        
        let collected = false;
        let collector = null;
        
        // 检查左手碰撞
        if (isColliding(players.player1, collectible)) {
            collected = true;
            collector = players.player1;
        }
        // 检查右手碰撞（如果左手没收集到）
        else if (isColliding(players.player2, collectible)) {
            collected = true;
            collector = players.player2;
        }
        
        if (collected && collector) {
            collectible.collected = true;
            collector.score++;
            
            // 延迟更新分数，减少DOM操作
            scheduleScoreUpdate();
            
            // 播放音效（已内部节流）
            playCollectSound();
            
            // 创建爆炸特效
            const centerX = collectible.x + collectible.size / 2;
            const centerY = collectible.y + collectible.size / 2;
            createExplosion(centerX, centerY, collectible.color);
            
            // 生成新的收集物
            generateNewCollectible(collectible);
        }
    }
    
    // 移除已收集的
    collectibles = collectibles.filter(c => !c.collected);
}

// 生成新的收集物替换被收集的
function generateNewCollectible(oldCollectible) {
    const canvasWidth = config.canvasWidth || 800;
    const canvasHeight = config.canvasHeight || 600;
    const type = collectibleTypes[Math.floor(Math.random() * collectibleTypes.length)];
    const newCollectible = {
        x: Math.random() * (canvasWidth - 20) + 10,
        y: Math.random() * (canvasHeight - 20) + 10,
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
            newCollectible.x = Math.random() * (canvasWidth - 20) + 10;
            newCollectible.y = Math.random() * (canvasHeight - 20) + 10;
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

// 更新分数显示（优化版本，减少DOM操作）
// 更新分数显示（优化版本，减少DOM操作）
let scoreUpdateScheduled = false;
let cachedScore1 = -1;
let cachedScore2 = -1;

function updateScore() {
    const score1El = document.getElementById('score1');
    const score2El = document.getElementById('score2');
    
    // 只在分数变化时更新DOM，避免不必要的操作
    if (score1El && cachedScore1 !== players.player1.score) {
        score1El.textContent = players.player1.score;
        cachedScore1 = players.player1.score;
    }
    if (score2El && cachedScore2 !== players.player2.score) {
        score2El.textContent = players.player2.score;
        cachedScore2 = players.player2.score;
    }
    
    scoreUpdateScheduled = false;
}

// 延迟更新分数（防抖）
function scheduleScoreUpdate() {
    if (!scoreUpdateScheduled) {
        scoreUpdateScheduled = true;
        requestAnimationFrame(updateScore);
    }
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

// 音频上下文单例（避免重复创建导致错误）
let audioContext = null;
let lastSoundTime = 0;
const soundCooldown = 50; // 音效冷却时间（毫秒），避免过于频繁播放

// 初始化音频上下文
function initAudioContext() {
    if (!audioContext && (window.AudioContext || window.webkitAudioContext)) {
        try {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // 监听音频上下文状态变化
            audioContext.addEventListener('statechange', () => {
                if (audioContext.state === 'suspended') {
                    // 音频上下文被暂停（浏览器策略），尝试恢复
                    audioContext.resume().catch(() => {
                        // 静默失败
                    });
                }
            });
        } catch (e) {
            console.log('无法创建音频上下文（这是正常的，某些浏览器需要用户交互）:', e.message);
            audioContext = null;
        }
    }
    return audioContext;
}

// 播放收集音效（bang bang bang）
function playCollectSound() {
    // 音效节流，避免过于频繁播放
    const now = Date.now();
    if (now - lastSoundTime < soundCooldown) {
        return; // 太频繁，跳过
    }
    lastSoundTime = now;
    
    try {
        // 使用单例音频上下文
        const ctx = initAudioContext();
        if (!ctx) return; // 音频不可用，静默失败
        
        // 如果音频上下文被暂停，尝试恢复（浏览器策略）
        if (ctx.state === 'suspended') {
            ctx.resume().catch(() => {
                // 静默失败
            });
            return;
        }
        
        const now = ctx.currentTime;
        
        // 创建三个连续的"bang"声音
        const bangTimes = [0, 0.05, 0.1]; // 三个bang的间隔时间（秒）
        const frequencies = [80, 100, 120]; // 三个bang的频率（低频冲击音）
        
        bangTimes.forEach((delay, index) => {
            try {
                const oscillator = ctx.createOscillator();
                const gainNode = ctx.createGain();
                const filterNode = ctx.createBiquadFilter();
                
                oscillator.connect(filterNode);
                filterNode.connect(gainNode);
                gainNode.connect(ctx.destination);
                
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
                gainNode.gain.linearRampToValueAtTime(0.3, startTime + 0.01); // 降低音量
                gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
                
                oscillator.start(startTime);
                oscillator.stop(startTime + duration);
            } catch (e) {
                // 单个音效创建失败，继续处理其他音效
            }
        });
    } catch (e) {
        // 音频错误，静默失败（不显示错误）
        // console.log('Audio error:', e);
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
    
    // 获取逻辑尺寸（实际绘图尺寸）
    const canvasWidth = config.canvasWidth || 800;
    const canvasHeight = config.canvasHeight || 600;
    
    // 清空画布（使用逻辑尺寸）
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    
    // 绘制背景装饰（简化版，减少绘制开销）
    if (!config.gameRunning || config.timeRemaining > 3) {
        // 只在游戏未运行或时间充足时绘制背景装饰，减少绘制负担
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.beginPath();
        ctx.arc(100, 50, 20, 0, Math.PI * 2);
        ctx.arc(130, 50, 25, 0, Math.PI * 2);
        ctx.arc(160, 50, 20, 0, Math.PI * 2);
        ctx.fill();
    }
    
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

// 游戏主循环（性能优化版本）
let lastFrameTime = 0;
const targetFPS = 60;
const frameInterval = 1000 / targetFPS;

function gameLoop(currentTime = performance.now()) {
    // 限制帧率，避免过度渲染
    const deltaTime = currentTime - lastFrameTime;
    
    if (deltaTime >= frameInterval) {
        lastFrameTime = currentTime - (deltaTime % frameInterval);
        
        // 只在游戏运行时更新逻辑
        if (config.gameRunning) {
            updatePlayers();
            checkCollisions();
        }
        
        // 更新爆炸特效（始终更新，以便动画流畅）
        updateExplosions();
        
        // 绘制（始终绘制）
        draw();
    }
    
    // 继续循环（使用 requestAnimationFrame 自动控制帧率）
    if (config.gameLoopRunning) {
        requestAnimationFrame(gameLoop);
    }
}

// 页面加载完成后初始化游戏
window.addEventListener('load', () => {
    init();
    
    // 绑定触摸控制（在 init 之后，确保 DOM 已加载）
    if (!document.hasTouchListeners) {
        bindTouchControls();
        document.hasTouchListeners = true;
    }
    
    // 绑定开始游戏按钮（只绑定一次）
    const startBtn = document.getElementById('startGameBtn');
    if (!startBtn) {
        console.error('无法找到开始游戏按钮！');
        return;
    }
    
    console.log('找到开始游戏按钮，准备绑定事件');
    console.log('按钮初始状态 - disabled:', startBtn.disabled, 'hasListener:', startBtn.hasListener);
    
    if (!startBtn.hasListener) {
        // 点击事件（桌面端）
        startBtn.addEventListener('click', (e) => {
            console.log('按钮点击事件触发！');
            console.log('按钮 disabled 状态:', startBtn.disabled);
            e.preventDefault();
            e.stopPropagation();
            
            if (!startBtn.disabled) {
                console.log('开始游戏按钮被点击，调用 startGame');
                try {
                    startGame();
                } catch (err) {
                    console.error('调用 startGame 时出错:', err);
                    alert('启动游戏失败：' + err.message);
                }
            } else {
                console.warn('按钮被禁用，无法开始游戏');
            }
        });
        
        console.log('点击事件已绑定');
        
        // 触摸事件（移动端）
        let touchStarted = false;
        
        startBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('按钮触摸开始，disabled状态:', startBtn.disabled);
            if (!startBtn.disabled) {
                touchStarted = true;
                console.log('开始游戏按钮被触摸');
                startBtn.style.transform = 'scale(0.98)';
                startBtn.style.opacity = '0.8';
            }
        }, { passive: false });
        
        startBtn.addEventListener('touchend', (e) => {
            e.preventDefault();
            e.stopPropagation();
            startBtn.style.transform = '';
            startBtn.style.opacity = '';
            
            if (touchStarted && !startBtn.disabled) {
                touchStarted = false;
                console.log('开始游戏按钮触摸结束，disabled状态:', startBtn.disabled);
                console.log('调用 startGame 函数');
                
                // 延迟一帧确保状态正确
                setTimeout(() => {
                    try {
                        startGame();
                    } catch (err) {
                        console.error('调用 startGame 失败:', err);
                        alert('启动游戏失败，请重试！');
                    }
                }, 10);
            } else {
                touchStarted = false;
            }
        }, { passive: false });
        
        startBtn.addEventListener('touchcancel', (e) => {
            e.preventDefault();
            e.stopPropagation();
            touchStarted = false;
            startBtn.style.transform = '';
            startBtn.style.opacity = '';
        }, { passive: false });
        
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
    
    // 注册 Service Worker（PWA 支持，只在 HTTPS 或 localhost 环境下）
    if ('serviceWorker' in navigator && 
        (location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1')) {
        navigator.serviceWorker.register('./service-worker.js')
            .then(reg => {
                console.log('Service Worker 注册成功:', reg);
            })
            .catch(err => {
                // 静默失败，避免控制台错误（本地文件访问时会失败）
                console.log('Service Worker 注册失败（本地文件访问时这是正常的）:', err.message);
            });
    }
});