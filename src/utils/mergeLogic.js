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

/* ================================================================
   DIVIDE MODE  – original merge logic (unchanged)
   ================================================================ */
function canMergePairDivide(a, b) {
  if (a === null || b === null) return null;
  if (a === b) return { result: null, points: a };
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

export function resolveMerges(grid, placedIndex, gameMode = 'divide', gridSize = 4, difficultyTier = 1) {
  /* Multiply mode uses its own column-drop merge system */
  if (gameMode === 'multiply') {
    return resolveMultiplyMerges(grid, gridSize);
  }

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
        const mergeResult = canMergePairDivide(g[i], g[ni]);
        if (mergeResult) {
          const { result, points, replaceLarger } = mergeResult;
          if (result === null || result === undefined) {
            g[i] = null;
            g[ni] = null;
          } else if (replaceLarger) {
            if (g[i] >= g[ni]) { g[i] = result; g[ni] = null; }
            else { g[ni] = result; g[i] = null; }
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
    if (canMergePairDivide(tileValue, grid[ni])) return true;
  }
  return false;
}

export function isGameOver(grid, gameMode = 'divide', gridSize = 4, difficultyTier = 1) {
  if (gameMode === 'multiply') return isMultiplyGameOver(grid, gridSize);
  const totalCells = gridSize * gridSize;
  for (let i = 0; i < totalCells; i++) {
    if (grid[i] === null) return false;
  }
  for (let i = 0; i < totalCells; i++) {
    const neighbors = getNeighbors(i, gridSize);
    for (const ni of neighbors) {
      if (canMergePairDivide(grid[i], grid[ni])) return false;
    }
  }
  return true;
}

/* ================================================================
   MULTIPLY MODE  – column-drop / 2048-stack mechanics
   ================================================================ */

/** Find the lowest empty row in a column. Returns -1 if full. */
export function getDropRow(grid, col, gridSize) {
  for (let row = gridSize - 1; row >= 0; row--) {
    if (grid[row * gridSize + col] === null) return row;
  }
  return -1;
}

/** Pull all tiles downward so there are no floating gaps. */
export function applyGravity(grid, gridSize) {
  const g = [...grid];
  for (let col = 0; col < gridSize; col++) {
    const values = [];
    for (let row = gridSize - 1; row >= 0; row--) {
      const val = g[row * gridSize + col];
      if (val !== null) values.push(val);
    }
    for (let row = gridSize - 1; row >= 0; row--) {
      const vi = gridSize - 1 - row;
      g[row * gridSize + col] = vi < values.length ? values[vi] : null;
    }
  }
  return g;
}

/**
 * After a tile is placed, repeatedly:
 *  1. Apply gravity
 *  2. Scan bottom-up for adjacent same-value pairs (vertical first, then horizontal)
 *  3. Merge them (double one, remove the other)
 *  4. Repeat until stable
 *
 * Scoring: each merge scores the resulting doubled value.
 */
export function resolveMultiplyMerges(grid, gridSize) {
  let g = applyGravity([...grid], gridSize);
  let totalPoints = 0;
  let changed = true;

  while (changed) {
    changed = false;

    /* Scan bottom-up, left-to-right; prefer vertical merges */
    for (let row = gridSize - 1; row >= 0 && !changed; row--) {
      for (let col = 0; col < gridSize && !changed; col++) {
        const idx = row * gridSize + col;
        if (g[idx] === null) continue;

        /* Vertical: merge with tile directly below */
        if (row < gridSize - 1) {
          const belowIdx = (row + 1) * gridSize + col;
          if (g[belowIdx] !== null && g[belowIdx] === g[idx]) {
            g[belowIdx] *= 2;
            totalPoints += g[belowIdx];
            g[idx] = null;
            changed = true;
            continue;
          }
        }

        /* Horizontal: merge with tile to the right */
        if (col < gridSize - 1) {
          const rightIdx = row * gridSize + col + 1;
          if (g[rightIdx] !== null && g[rightIdx] === g[idx]) {
            g[idx] *= 2;
            totalPoints += g[idx];
            g[rightIdx] = null;
            changed = true;
            continue;
          }
        }
      }
    }

    if (changed) {
      g = applyGravity(g, gridSize);
    }
  }

  return { newGrid: g, points: totalPoints };
}

/** Check if placing tileValue in this column would trigger any merge. */
export function wouldMergeInColumn(grid, col, tileValue, gridSize) {
  const row = getDropRow(grid, col, gridSize);
  if (row < 0) return false;

  /* Below */
  if (row < gridSize - 1 && grid[(row + 1) * gridSize + col] === tileValue) return true;
  /* Left */
  if (col > 0 && grid[row * gridSize + (col - 1)] === tileValue) return true;
  /* Right */
  if (col < gridSize - 1 && grid[row * gridSize + (col + 1)] === tileValue) return true;

  return false;
}

/** All cells full AND no adjacent same-value pairs. */
export function isMultiplyGameOver(grid, gridSize) {
  const total = gridSize * gridSize;
  for (let i = 0; i < total; i++) {
    if (grid[i] === null) return false;
  }
  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      const idx = row * gridSize + col;
      if (col < gridSize - 1 && grid[idx] === grid[idx + 1]) return false;
      if (row < gridSize - 1 && grid[idx] === grid[idx + gridSize]) return false;
    }
  }
  return true;
}
