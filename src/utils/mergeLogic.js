export function getNeighbors(index, gridSize = 4) {
  const row = Math.floor(index / gridSize);
  const col = index % gridSize;
  const neighbors = [];
  if (row > 0) neighbors.push(index - gridSize);
  if (row < gridSize - 1) neighbors.push(index + gridSize);
  if (col > 0) neighbors.push(index - 1);
  if (col < gridSize - 1) neighbors.push(index + 1);
  return neighbors;
}

/* ---- Addition: target sums per tier ---- */
const ADD_TARGETS = { 1: [10], 2: [10, 15], 3: [10, 15, 20] };

/* ---- Subtraction: max allowed difference per tier ---- */
const SUB_THRESHOLDS = { 1: 5, 2: 4, 3: 3 };

/* ---- Multiply: product cap per tier ---- */
const MUL_CAPS = { 1: 20, 2: 36, 3: 50 };

function canMergePair(a, b, gameMode, difficultyTier) {
  if (a === null || b === null) return null;

  /* Universal rule: identical tiles always clear each other */
  if (a === b) {
    return { result: null, points: a };
  }

  switch (gameMode) {
    case 'divide': {
      const larger = Math.max(a, b);
      const smaller = Math.min(a, b);
      if (larger % smaller === 0) {
        const result = larger / smaller;
        return result === 1
          ? { result: null, points: larger }
          : { result, points: smaller, replaceLarger: true };
      }
      return null;
    }

    case 'addition': {
      const sum = a + b;
      const targets = ADD_TARGETS[difficultyTier] || ADD_TARGETS[1];
      if (targets.includes(sum)) {
        return { result: null, points: sum };
      }
      return null;
    }

    case 'subtraction': {
      const larger = Math.max(a, b);
      const smaller = Math.min(a, b);
      const diff = larger - smaller;
      const threshold = SUB_THRESHOLDS[difficultyTier] || SUB_THRESHOLDS[1];
      if (diff > 0 && diff <= threshold) {
        return { result: diff, points: smaller, replaceLarger: true };
      }
      return null;
    }

    case 'multiply': {
      const product = a * b;
      const cap = MUL_CAPS[difficultyTier] || MUL_CAPS[1];
      if (product <= cap) {
        return { result: product, points: Math.min(a, b) };
      }
      return null;
    }

    default:
      return null;
  }
}

export function resolveMerges(grid, placedIndex, gameMode = 'divide', gridSize = 4, difficultyTier = 1) {
  const totalCells = gridSize * gridSize;
  let g = [...grid];
  let totalPoints = 0;
  let changed = true;

  while (changed) {
    changed = false;
    for (let i = 0; i < totalCells; i++) {
      if (g[i] === null) continue;
      const neighbors = getNeighbors(i, gridSize);
      for (const ni of neighbors) {
        if (g[ni] === null) continue;
        const mergeResult = canMergePair(g[i], g[ni], gameMode, difficultyTier);
        if (mergeResult) {
          const { result, points, replaceLarger } = mergeResult;
          if (result === null || result === undefined) {
            g[i] = null;
            g[ni] = null;
          } else if (replaceLarger) {
            if (g[i] >= g[ni]) {
              g[i] = result;
              g[ni] = null;
            } else {
              g[ni] = result;
              g[i] = null;
            }
          } else {
            g[i] = result;
            g[ni] = null;
          }
          totalPoints += points;
          changed = true;
          break;
        }
      }
      if (changed) break;
    }
  }

  return { newGrid: g, points: totalPoints };
}

export function wouldMerge(grid, cellIndex, tileValue, gameMode = 'divide', gridSize = 4, difficultyTier = 1) {
  if (grid[cellIndex] !== null) return false;
  const neighbors = getNeighbors(cellIndex, gridSize);
  for (const ni of neighbors) {
    if (grid[ni] === null) continue;
    if (canMergePair(tileValue, grid[ni], gameMode, difficultyTier)) return true;
  }
  return false;
}

export function isGameOver(grid, gameMode = 'divide', gridSize = 4, difficultyTier = 1) {
  const totalCells = gridSize * gridSize;
  for (let i = 0; i < totalCells; i++) {
    if (grid[i] === null) return false;
  }
  for (let i = 0; i < totalCells; i++) {
    const neighbors = getNeighbors(i, gridSize);
    for (const ni of neighbors) {
      if (canMergePair(grid[i], grid[ni], gameMode, difficultyTier)) return false;
    }
  }
  return true;
}
