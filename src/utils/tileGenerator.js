const TILE_POOLS = {
  1: [2, 3, 4, 5, 6, 8, 9, 10, 12],
  2: [2, 3, 4, 5, 6, 8, 9, 10, 12, 15, 16, 18, 20],
  3: [2, 3, 4, 5, 6, 8, 9, 10, 12, 15, 16, 18, 20, 24, 25, 27, 30, 32, 35, 36],
};

export function generateTile(difficulty = 1) {
  const pool = TILE_POOLS[difficulty] || TILE_POOLS[1];
  return pool[Math.floor(Math.random() * pool.length)];
}

export function generateQueue(count = 3, difficulty = 1) {
  const queue = [];
  for (let i = 0; i < count; i++) {
    queue.push(generateTile(difficulty));
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
