// ==================== CANVAS + CAMERA ====================
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let camX = 0, camY = 0;
let gamePaused = false;

// ==================== PLAYER ====================
const player = {
  x: 500,
  y: 500,
  size: 40,
  speed: 3,
  vx: 0,
  vy: 0,
  running: false,
  color: "lime"
};

// ==================== MAP ====================
const map = {
  width: 3000,
  height: 3000,
  tileSize: 80
};

// ==================== NPC SYSTEM ====================
let npcs = [];
for (let i = 0; i < 5; i++) {
  npcs.push({
    x: Math.random() * 2000 + 200,
    y: Math.random() * 2000 + 200,
    size: 35,
    vx: 0,
    vy: 0,
    color: "orange",
    aiTimer: 0
  });
}

function updateNPC(npc) {
  npc.aiTimer--;
  if (npc.aiTimer <= 0) {
    npc.vx = (Math.random() - 0.5) * 2;
    npc.vy = (Math.random() - 0.5) * 2;
    npc.aiTimer = 60 + Math.random() * 60;
  }
  npc.x += npc.vx;
  npc.y += npc.vy;
}

// ==================== BULLETS ====================
let bullets = [];

function shootBullet() {
  bullets.push({
    x: player.x + player.size/2,
    y: player.y + player.size/2,
    size: 6,
    speed: 10,
    vx: 1,
    vy: 0,
    life: 40
  });
}

// ==================== MOVEMENT ====================
let keys = {};

document.addEventListener("keydown", e => keys[e.key] = true);
document.addEventListener("keyup", e => keys[e.key] = false);

function updatePlayer() {
  let speed = player.running ? player.speed * 1.8 : player.speed;

  player.vx = (keys["a"] || keys["ArrowLeft"]) ? -speed :
              (keys["d"] || keys["ArrowRight"]) ? speed : 0;

  player.vy = (keys["w"] || keys["ArrowUp"]) ? -speed :
              (keys["s"] || keys["ArrowDown"]) ? speed : 0;

  player.running = keys["Shift"];

  player.x += player.vx;
  player.y += player.vy;

  // Boundaries
  player.x = Math.max(0, Math.min(map.width - player.size, player.x));
  player.y = Math.max(0, Math.min(map.height - player.size, player.y));
}

// ==================== CAMERA FOLLOW ====================
function updateCamera() {
  camX = player.x - canvas.width / 2 + player.size/2;
  camY = player.y - canvas.height / 2 + player.size/2;

  // clamp
  camX = Math.max(0, Math.min(map.width - canvas.width, camX));
  camY = Math.max(0, Math.min(map.height - canvas.height, camY));
}

// ==================== DRAW FUNCTIONS ====================
function drawMap() {
  ctx.fillStyle = "#333";
  ctx.fillRect(-camX, -camY, map.width, map.height);
}

function drawPlayer() {
  ctx.fillStyle = player.color;
  ctx.fillRect(player.x - camX, player.y - camY, player.size, player.size);
}

function drawNPC(npc) {
  ctx.fillStyle = npc.color;
  ctx.fillRect(npc.x - camX, npc.y - camY, npc.size, npc.size);
}

function drawBullets() {
  ctx.fillStyle = "yellow";
  bullets.forEach(b => {
    ctx.fillRect(b.x - camX, b.y - camY, b.size, b.size);
  });
}

// ==================== MINIMAP ====================
function drawMiniMap() {
  const mw = 200;
  const mh = 200;
  const scale = mw / map.width;

  ctx.fillStyle = "rgba(0,0,0,0.7)";
  ctx.fillRect(20, 20, mw, mh);

  // player
  ctx.fillStyle = "lime";
  ctx.fillRect(20 + player.x * scale, 20 + player.y * scale, 6, 6);

  // NPCs
  ctx.fillStyle = "orange";
  npcs.forEach(npc => {
    ctx.fillRect(20 + npc.x * scale, 20 + npc.y * scale, 5, 5);
  });
}

// ==================== MAIN LOOP ====================
function gameLoop() {
  if (!gamePaused) {
    updatePlayer();
    updateCamera();

    npcs.forEach(updateNPC);

    bullets.forEach(b => {
      b.x += b.vx * b.speed;
      b.y += b.vy * b.speed;
      b.life--;
    });
    bullets = bullets.filter(b => b.life > 0);

    // drawing
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawMap();
    drawNPCs();
    drawBullets();
    drawPlayer();
    drawMiniMap();
  }
  requestAnimationFrame(gameLoop);
}

function drawNPCs() {
  npcs.forEach(drawNPC);
}

// ==================== BUTTONS ====================
document.getElementById("shootBtn").onclick = shootBullet;
document.getElementById("pauseBtn").onclick = () => {
  gamePaused = true;
  document.getElementById("pauseMenu").style.display = "block";
};
document.getElementById("resumeBtn").onclick = () => {
  gamePaused = false;
  document.getElementById("pauseMenu").style.display = "none";
};

// ==================== MOBILE JOYSTICK ====================
const joystick = document.getElementById("joystick");
const stick = document.getElementById("stick");
let joyX = 0, joyY = 0;

joystick.addEventListener("touchmove", e => {
  const t = e.touches[0];
  const rect = joystick.getBoundingClientRect();
  let x = t.clientX - rect.left - 60;
  let y = t.clientY - rect.top - 60;

  x = Math.max(-40, Math.min(40, x));
  y = Math.max(-40, Math.min(40, y));

  joyX = x / 10;
  joyY = y / 10;

  stick.style.left = `${60 + x - 22}px`;
  stick.style.top = `${60 + y - 22}px`;

  e.preventDefault();
});

joystick.addEventListener("touchend", () => {
  joyX = 0;
  joyY = 0;
  stick.style.left = "37px";
  stick.style.top = "37px";
});

// integrate joystick movement
setInterval(() => {
  player.x += joyX;
  player.y += joyY;
}, 16);

// ==================== START ====================
gameLoop();
