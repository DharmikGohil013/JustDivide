/* ---- Divide mode: uniform random from pool ---- */
const DIVIDE_POOLS = {
  1: [2, 3, 4, 5, 6, 8, 9, 10, 12],
  2: [2, 3, 4, 5, 6, 8, 9, 10, 12, 15, 16, 18, 20],
  3: [2, 3, 4, 5, 6, 8, 9, 10, 12, 15, 16, 18, 20, 24, 25, 27, 30, 32, 36],
};

/* ---- Multiply mode: weighted powers of 2 ---- */
const MULTIPLY_POOLS = {
  1: [
    { value: 2, weight: 40 },
    { value: 4, weight: 30 },
    { value: 8, weight: 18 },
    { value: 16, weight: 8 },
    { value: 32, weight: 3 },
    { value: 64, weight: 1 },
  ],
  2: [
    { value: 2, weight: 30 },
    { value: 4, weight: 25 },
    { value: 8, weight: 18 },
    { value: 16, weight: 12 },
    { value: 32, weight: 7 },
    { value: 64, weight: 4 },
    { value: 128, weight: 2 },
    { value: 256, weight: 1.2 },
    { value: 512, weight: 0.8 },
  ],
  3: [
    { value: 2, weight: 22 },
    { value: 4, weight: 20 },
    { value: 8, weight: 16 },
    { value: 16, weight: 13 },
    { value: 32, weight: 10 },
    { value: 64, weight: 7 },
    { value: 128, weight: 5 },
    { value: 256, weight: 3 },
    { value: 512, weight: 2 },
    { value: 1024, weight: 1.2 },
    { value: 2048, weight: 0.8 },
  ],
};

function weightedRandom(pool) {
  const total = pool.reduce((sum, item) => sum + item.weight, 0);
  let r = Math.random() * total;
  for (const item of pool) {
    r -= item.weight;
    if (r <= 0) return item.value;
  }
  return pool[pool.length - 1].value;
}

export function generateTile(difficultyTier = 1, gameMode = 'divide') {
  if (gameMode === 'multiply') {
    const pool = MULTIPLY_POOLS[difficultyTier] || MULTIPLY_POOLS[1];
    return weightedRandom(pool);
  }
  const pool = DIVIDE_POOLS[difficultyTier] || DIVIDE_POOLS[1];
  return pool[Math.floor(Math.random() * pool.length)];
}

export function generateQueue(count = 3, difficultyTier = 1, gameMode = 'divide') {
  const queue = [];
  for (let i = 0; i < count; i++) {
    queue.push(generateTile(difficultyTier, gameMode));
  }
  return queue;
}

export function getTileColor(value) {
  if (value <= 5) return 'blue';
  if (value <= 10) return 'orange';
  if (value <= 15) return 'purpule';
  if (value <= 20) return 'red';
  if (value <= 30) return 'pink';
  if (value <= 64) return 'orange';
  if (value <= 128) return 'blue';
  if (value <= 256) return 'purpule';
  if (value <= 512) return 'pink';
  if (value <= 1024) return 'red';
  return 'pink';
}

export function getTileImage(value) {
  const color = getTileColor(value);
  return `${process.env.PUBLIC_URL}/assets/${color}.png`;
}
