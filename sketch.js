// --- 動畫資源 ---
let stopSheet, runSheet, jumpSheet, emissionSheet;
let stopAnimation = [];
let runAnimation = [];
let jumpAnimation = [];
let emissionAnimation = [];

// --- 動畫參數 ---
const STOP_FRAMES = 5;
const STOP_SHEET_W = 525, STOP_SHEET_H = 149;
const STOP_FRAME_W = STOP_SHEET_W / STOP_FRAMES;

const RUN_FRAMES = 6;
const RUN_SHEET_W = 757, RUN_SHEET_H = 150;
const RUN_FRAME_W = RUN_SHEET_W / RUN_FRAMES;

const JUMP_FRAMES = 5;
const JUMP_SHEET_W = 540, JUMP_SHEET_H = 162;
const JUMP_FRAME_W = JUMP_SHEET_W / JUMP_FRAMES;

const EMISSION_FRAMES = 6;
const EMISSION_SHEET_W = 1561, EMISSION_SHEET_H = 151;
const EMISSION_FRAME_W = EMISSION_SHEET_W / EMISSION_FRAMES;

// --- 角色狀態 ---
let characterX, characterY;
let speed = 4;
let direction = 1; // 1: 向右, -1: 向左
let state = 'idle'; // 'idle', 'running', 'jumping', 'shooting'

// --- 射擊狀態 ---
let isShooting = false;
let shootFrameCounter = 0;

// --- 跳躍物理 ---
let velocityY = 0;
let gravity = 0.6;
let jumpForce = -15;
let isJumping = false;
let groundY;

// --- 子彈 ---
let projectiles = [];
let projectileImg;

// p5.js 預載入資源的函式
function preload() {
    stopSheet = loadImage('1/stop/stop_1.png');
    runSheet = loadImage('1/run/run_1.png');
    jumpSheet = loadImage('1/jump/jump_1.png');
    emissionSheet = loadImage('1/emission/emission_1.png');
}

// p5.js 設定初始狀態的函式 (只執行一次)
function setup() {
    createCanvas(windowWidth, windowHeight);

    // 初始化角色位置在畫面中央
    characterX = width / 2;
    characterY = height / 2;
    groundY = characterY; // 設定地面高度

    // 切割站立動畫的每一幀
    for (let i = 0; i < STOP_FRAMES; i++) {
        let img = stopSheet.get(i * STOP_FRAME_W, 0, STOP_FRAME_W, STOP_SHEET_H);
        stopAnimation.push(img);
    }
    // 從站立動畫中取得子彈的圖片 (最後一幀)
    projectileImg = stopAnimation[4];

    // 切割走路動畫的每一幀
    for (let i = 0; i < RUN_FRAMES; i++) {
        let img = runSheet.get(i * RUN_FRAME_W, 0, RUN_FRAME_W, RUN_SHEET_H);
        runAnimation.push(img);
    }

    // 切割跳躍動畫的每一幀
    for (let i = 0; i < JUMP_FRAMES; i++) {
        let img = jumpSheet.get(i * JUMP_FRAME_W, 0, JUMP_FRAME_W, JUMP_SHEET_H);
        jumpAnimation.push(img);
    }

    // 切割射擊動畫的每一幀
    for (let i = 0; i < EMISSION_FRAMES; i++) {
        let img = emissionSheet.get(i * EMISSION_FRAME_W, 0, EMISSION_FRAME_W, EMISSION_SHEET_H);
        emissionAnimation.push(img);
    }
}

// p5.js 偵測單次按鍵事件的函式
function keyPressed() {
    // 當按下向上鍵且角色不在空中時，觸發跳躍
    if (keyCode === UP_ARROW && !isJumping && !isShooting) {
        isJumping = true;
        velocityY = jumpForce;
    }

    // 當按下空白鍵且角色在地面上時，觸發射擊
    if (key === ' ' && !isJumping && !isShooting) {
        isShooting = true;
        state = 'shooting';
        shootFrameCounter = 0; // 重置射擊動畫計數器
    }
}

// p5.js 繪圖和動畫的函式 (不斷重複執行)
function draw() {
    background('#f5ebe0');

    // --- 狀態更新 ---

    // 處理射擊動畫
    if (isShooting) {
        shootFrameCounter++;
        let animationSpeed = 5; // 數字越小，動畫越快
        let currentFrame = floor(shootFrameCounter / animationSpeed);

        // 在動畫的第4幀發射子彈 (索引為3)
        if (currentFrame === 3 && floor((shootFrameCounter - 1) / animationSpeed) < 3) {
            // 建立一個新的子彈物件
            let p = {
                x: characterX + (direction * 50), // 從角色前方發射
                y: characterY - 10, // 調整子彈的垂直位置
                dir: direction,
                speed: 10
            };
            projectiles.push(p);
        }

        // 動畫播放完畢
        if (currentFrame >= EMISSION_FRAMES) {
            isShooting = false;
            state = 'idle';
        }
    }

    // 處理跳躍物理
    if (isJumping) {
        state = 'jumping';
        characterY += velocityY;
        velocityY += gravity;

        // 如果角色回到或低於地面
        if (characterY >= groundY) {
            characterY = groundY;
            isJumping = false;
            state = 'idle'; // 跳躍結束後回到站立狀態
        }
    }

    // 只有在不跳躍且不射擊時，才能左右移動
    if (!isJumping && !isShooting) {
        if (keyIsDown(RIGHT_ARROW)) {
            direction = 1;
            state = 'running';
            characterX += speed;
        } else if (keyIsDown(LEFT_ARROW)) {
            direction = -1;
            state = 'running';
            characterX -= speed;
        } else {
            state = 'idle';
        }
    } else if (isJumping) { // isJumping is true
        // 在空中時也可以左右移動 (空中控制)
        if (keyIsDown(RIGHT_ARROW)) {
            characterX += speed;
        } else if (keyIsDown(LEFT_ARROW)) {
            characterX -= speed;
        }
    }

    // --- 更新並繪製子彈 ---
    for (let i = projectiles.length - 1; i >= 0; i--) {
        let p = projectiles[i];
        p.x += p.speed * p.dir;
        image(projectileImg, p.x, p.y);

        // 如果子彈超出畫面，就從陣列中移除
        if (p.x > width || p.x < 0) {
            projectiles.splice(i, 1);
        }
    }

    // --- 根據狀態繪製角色 ---
    push(); // 保存目前的繪圖設定
    translate(characterX, characterY); // 將原點移動到角色位置
    scale(direction, 1); // 根據方向翻轉畫布
    imageMode(CENTER); // 將圖片繪製模式設為中心對齊

    switch (state) {
        case 'shooting':
            let shootFrameIndex = floor(shootFrameCounter / 5) % EMISSION_FRAMES;
            image(emissionAnimation[shootFrameIndex], 0, 0);
            break;
        case 'jumping':
            // 根據垂直速度判斷顯示上升或下降的影格
            // 您的 jump_1.png 前4張是上升/滯空，最後1張是下降
            let jumpFrameIndex;
            if (velocityY < 0) { // 上升中
                jumpFrameIndex = floor(map(velocityY, jumpForce, 0, 0, 3.9));
            } else { // 下降中
                jumpFrameIndex = 4;
            }
            image(jumpAnimation[jumpFrameIndex], 0, 0);
            break;
        case 'running':
            let runFrameIndex = floor(frameCount / 6) % RUN_FRAMES;
            image(runAnimation[runFrameIndex], 0, 0);
            break;
        default: // 'idle'
            image(stopAnimation[0], 0, 0);
            break;
    }

    pop(); // 恢復原本的繪圖設定
}

// 視窗大小改變時重新設定畫布大小，以保持全視窗
function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}
