const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const statusNode = document.getElementById("status");

const tileSize = 24;
const chunkSize = 16;
const loadRadius = 2;
const spawnCooldownMs = 1400;
const maxEnemiesPerDimension = 14;
const maxFrameTimeSeconds = 0.033;
const zombieSpawnProbability = 0.65;
const creeperFlashThreshold = 0.6;
const minEnemySpawnRadius = 8;
const enemySpawnRadiusRange = 9;
const zombieDamagePerSecond = 13;
const creeperExplosionDamage = 33;
const hashPrimeX = 374761393;
const hashPrimeY = 668265263;
const hashPrimeSeed = 362437;
const hashShiftA = 13;
const hashPrimeMix = 1274126177;
const hashShiftB = 16;
const dimensionSeeds = { overworld: 1, nether: 2, end: 3 };

const dimensions = {
  overworld: {
    label: "Overworld",
    background: "#7dd3fc",
    blocks: ["#22c55e", "#16a34a", "#65a30d", "#15803d"],
    enemyTint: "#14532d",
  },
  nether: {
    label: "Nether",
    background: "#7f1d1d",
    blocks: ["#991b1b", "#7f1d1d", "#b91c1c", "#450a0a"],
    enemyTint: "#fecaca",
  },
  end: {
    label: "The End",
    background: "#1e1b4b",
    blocks: ["#eab308", "#fde68a", "#a16207", "#fef08a"],
    enemyTint: "#dbeafe",
  },
};

const chunks = {
  overworld: new Map(),
  nether: new Map(),
  end: new Map(),
};

const player = {
  x: 0,
  y: 0,
  health: 100,
  speedTilesPerSecond: 5.5,
  dimension: "overworld",
};

const keys = new Set();
const enemies = [];
let lastSpawn = 0;

function hash(x, y, dimSeed) {
  let n = x * hashPrimeX + y * hashPrimeY + dimSeed * hashPrimeSeed;
  n = (n ^ (n >>> hashShiftA)) * hashPrimeMix;
  return (n ^ (n >>> hashShiftB)) >>> 0;
}

function keyForChunk(cx, cy) {
  return `${cx},${cy}`;
}

function generateChunk(dimension, cx, cy) {
  const dimSeed = dimensionSeeds[dimension];
  const data = new Array(chunkSize * chunkSize);

  for (let y = 0; y < chunkSize; y += 1) {
    for (let x = 0; x < chunkSize; x += 1) {
      const wx = cx * chunkSize + x;
      const wy = cy * chunkSize + y;
      const rnd = hash(wx, wy, dimSeed) % 100;
      data[y * chunkSize + x] = rnd < 70 ? 0 : rnd < 85 ? 1 : rnd < 95 ? 2 : 3;
    }
  }

  return data;
}

function loadChunksAroundPlayer() {
  const map = chunks[player.dimension];
  const pcx = Math.floor(player.x / chunkSize);
  const pcy = Math.floor(player.y / chunkSize);

  for (let cy = pcy - loadRadius; cy <= pcy + loadRadius; cy += 1) {
    for (let cx = pcx - loadRadius; cx <= pcx + loadRadius; cx += 1) {
      const key = keyForChunk(cx, cy);
      if (!map.has(key)) {
        map.set(key, generateChunk(player.dimension, cx, cy));
      }
    }
  }
}

function getBlock(x, y) {
  const cx = Math.floor(x / chunkSize);
  const cy = Math.floor(y / chunkSize);
  const lx = ((x % chunkSize) + chunkSize) % chunkSize;
  const ly = ((y % chunkSize) + chunkSize) % chunkSize;
  const key = keyForChunk(cx, cy);
  const map = chunks[player.dimension];

  if (!map.has(key)) {
    map.set(key, generateChunk(player.dimension, cx, cy));
  }

  const chunk = map.get(key);
  return chunk[ly * chunkSize + lx];
}

function spawnEnemy(timeMs) {
  if (timeMs - lastSpawn < spawnCooldownMs) {
    return;
  }

  const sameDimEnemies = enemies.filter((enemy) => enemy.dimension === player.dimension);
  if (sameDimEnemies.length >= maxEnemiesPerDimension) {
    return;
  }

  lastSpawn = timeMs;
  const angle = Math.random() * Math.PI * 2;
  const radius = minEnemySpawnRadius + Math.random() * enemySpawnRadiusRange;
  const type = Math.random() < zombieSpawnProbability ? "zombie" : "creeper";

  enemies.push({
    type,
    x: player.x + Math.cos(angle) * radius,
    y: player.y + Math.sin(angle) * radius,
    dimension: player.dimension,
    fuse: 0,
  });
}

function updatePlayer(dt) {
  let dx = 0;
  let dy = 0;

  if (keys.has("w") || keys.has("arrowup")) dy -= 1;
  if (keys.has("s") || keys.has("arrowdown")) dy += 1;
  if (keys.has("a") || keys.has("arrowleft")) dx -= 1;
  if (keys.has("d") || keys.has("arrowright")) dx += 1;

  if (dx !== 0 || dy !== 0) {
    const len = Math.hypot(dx, dy);
    player.x += (dx / len) * player.speedTilesPerSecond * dt;
    player.y += (dy / len) * player.speedTilesPerSecond * dt;
  }
}

function updateEnemies(dt) {
  for (const enemy of enemies) {
    if (enemy.dimension !== player.dimension) {
      continue;
    }

    const speed = enemy.type === "zombie" ? 1.75 : 2.1;
    const dx = player.x - enemy.x;
    const dy = player.y - enemy.y;
    const dist = Math.hypot(dx, dy);
    const safeDist = dist || 1;

    enemy.x += (dx / safeDist) * speed * dt;
    enemy.y += (dy / safeDist) * speed * dt;

    if (enemy.type === "zombie" && dist < 0.8) {
      player.health = Math.max(0, player.health - zombieDamagePerSecond * dt);
    }

    if (enemy.type === "creeper") {
      if (dist < 1.2) {
        enemy.fuse += dt;
        if (enemy.fuse >= 1.25) {
          player.health = Math.max(0, player.health - creeperExplosionDamage);
          enemy.x += (Math.random() - 0.5) * 20;
          enemy.y += (Math.random() - 0.5) * 20;
          enemy.fuse = 0;
        }
      } else {
        enemy.fuse = 0;
      }
    }
  }
}

function renderWorld() {
  const dimConfig = dimensions[player.dimension];
  ctx.fillStyle = dimConfig.background;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const halfTilesX = Math.ceil(canvas.width / tileSize / 2) + 1;
  const halfTilesY = Math.ceil(canvas.height / tileSize / 2) + 1;

  const startX = Math.floor(player.x) - halfTilesX;
  const endX = Math.floor(player.x) + halfTilesX;
  const startY = Math.floor(player.y) - halfTilesY;
  const endY = Math.floor(player.y) + halfTilesY;

  for (let wy = startY; wy <= endY; wy += 1) {
    for (let wx = startX; wx <= endX; wx += 1) {
      const block = getBlock(wx, wy);
      const sx = (wx - player.x) * tileSize + canvas.width / 2;
      const sy = (wy - player.y) * tileSize + canvas.height / 2;
      ctx.fillStyle = dimConfig.blocks[block];
      ctx.fillRect(Math.floor(sx), Math.floor(sy), tileSize, tileSize);
      ctx.strokeStyle = "rgba(15, 23, 42, 0.2)";
      ctx.strokeRect(Math.floor(sx), Math.floor(sy), tileSize, tileSize);
    }
  }
}

function renderEntities() {
  for (const enemy of enemies) {
    if (enemy.dimension !== player.dimension) {
      continue;
    }

    const sx = (enemy.x - player.x) * tileSize + canvas.width / 2;
    const sy = (enemy.y - player.y) * tileSize + canvas.height / 2;

    ctx.beginPath();
    ctx.arc(sx, sy, tileSize * 0.34, 0, Math.PI * 2);

    if (enemy.type === "zombie") {
      ctx.fillStyle = "#16a34a";
      ctx.strokeStyle = "#052e16";
    } else {
      const flash = enemy.fuse > creeperFlashThreshold ? 255 : 0;
      ctx.fillStyle = `rgb(${flash}, 255, ${flash})`;
      ctx.strokeStyle = "#14532d";
    }

    ctx.fill();
    ctx.stroke();
  }

  ctx.beginPath();
  ctx.arc(canvas.width / 2, canvas.height / 2, tileSize * 0.38, 0, Math.PI * 2);
  ctx.fillStyle = "#60a5fa";
  ctx.strokeStyle = "#1d4ed8";
  ctx.fill();
  ctx.stroke();
}

function renderHud() {
  const loaded = chunks[player.dimension].size;
  const visibleEnemies = enemies.filter((enemy) => enemy.dimension === player.dimension).length;

  statusNode.textContent = `Dimension: ${dimensions[player.dimension].label} | Health: ${Math.ceil(
    player.health,
  )} | Chunks Loaded: ${loaded} | Enemies: ${visibleEnemies}`;
}

function switchDimension(target) {
  if (!dimensions[target] || player.dimension === target) {
    return;
  }

  player.dimension = target;
  player.x = 0;
  player.y = 0;
  loadChunksAroundPlayer();
}

function resizeCanvas() {
  const cssWidth = Math.max(640, window.innerWidth - 280);
  canvas.width = cssWidth;
  canvas.height = window.innerHeight;
}

let lastTime = performance.now();
function tick(now) {
  const dt = Math.min(maxFrameTimeSeconds, (now - lastTime) / 1000);
  lastTime = now;

  if (player.health <= 0) {
    player.health = 100;
    player.x = 0;
    player.y = 0;
    enemies.length = 0;
  }

  updatePlayer(dt);
  loadChunksAroundPlayer();
  spawnEnemy(now);
  updateEnemies(dt);
  renderWorld();
  renderEntities();
  renderHud();

  requestAnimationFrame(tick);
}

window.addEventListener("keydown", (event) => {
  const key = event.key.toLowerCase();
  if (["1", "2", "3"].includes(key)) {
    if (key === "1") switchDimension("overworld");
    if (key === "2") switchDimension("nether");
    if (key === "3") switchDimension("end");
    return;
  }

  keys.add(key);
});

window.addEventListener("keyup", (event) => {
  keys.delete(event.key.toLowerCase());
});

window.addEventListener("resize", resizeCanvas);

resizeCanvas();
loadChunksAroundPlayer();
requestAnimationFrame(tick);
