const TILE_POOLS = {
  divide: {
    1: [2, 3, 4, 5, 6, 8, 9, 10, 12],
    2: [2, 3, 4, 5, 6, 8, 9, 10, 12, 15, 16, 18, 20],
    3: [2, 3, 4, 5, 6, 8, 9, 10, 12, 15, 16, 18, 20, 24, 25, 27, 30, 32, 36],
  },
  addition: {
    1: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    2: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14],
    3: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19],
  },
  subtraction: {
    1: [2, 3, 4, 5, 6, 7, 8, 9, 10],
    2: [2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 14, 15],
    3: [2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 14, 15, 16, 18, 20],
  },
  multiply: {
    1: [2, 3, 4, 5],
    2: [2, 3, 4, 5, 6, 7],
    3: [2, 3, 4, 5, 6, 7, 8, 9],
  },
};

export function generateTile(difficultyTier = 1, gameMode = 'divide') {
  const modePools = TILE_POOLS[gameMode] || TILE_POOLS['divide'];
  const pool = modePools[difficultyTier] || modePools[1];
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
  return 'red';
}

export function getTileImage(value) {
  const color = getTileColor(value);
  return `${process.env.PUBLIC_URL}/assets/${color}.png`;
}
