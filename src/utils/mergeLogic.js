export function getNeighbors(index) {
  const row = Math.floor(index / 4);
  const col = index % 4;
  const neighbors = [];
  if (row > 0) neighbors.push(index - 4);
  if (row < 3) neighbors.push(index + 4);
  if (col > 0) neighbors.push(index - 1);
  if (col < 3) neighbors.push(index + 1);
  return neighbors;
}

export function resolveMerges(grid, placedIndex) {
  let g = [...grid];
  let totalPoints = 0;
  let changed = true;

  while (changed) {
    changed = false;
    for (let i = 0; i < 16; i++) {
      if (g[i] === null) continue;
      const neighbors = getNeighbors(i);
      for (const ni of neighbors) {
        if (g[ni] === null) continue;
        const a = g[i];
        const b = g[ni];

        if (a === b) {
          g[i] = null;
          g[ni] = null;
          totalPoints += a;
          changed = true;
          break;
        }

        const larger = Math.max(a, b);
        const smaller = Math.min(a, b);
        if (larger % smaller === 0) {
          const result = larger / smaller;
          if (result === 1) {
            g[i] = null;
            g[ni] = null;
            totalPoints += larger;
          } else {
            if (g[i] === larger) {
              g[i] = result;
              g[ni] = null;
            } else {
              g[ni] = result;
              g[i] = null;
            }
            totalPoints += smaller;
          }
          changed = true;
          break;
        }
      }
      if (changed) break;
    }
  }

  return { newGrid: g, points: totalPoints };
}

export function wouldMerge(grid, cellIndex, tileValue) {
  if (grid[cellIndex] !== null) return false;
  const neighbors = getNeighbors(cellIndex);
  for (const ni of neighbors) {
    if (grid[ni] === null) continue;
    const b = grid[ni];
    if (tileValue === b) return true;
    const larger = Math.max(tileValue, b);
    const smaller = Math.min(tileValue, b);
    if (larger % smaller === 0) return true;
  }
  return false;
}

export function isGameOver(grid) {
  if (grid.some(cell => cell === null)) return false;
  for (let i = 0; i < 16; i++) {
    const neighbors = getNeighbors(i);
    for (const ni of neighbors) {
      const a = grid[i];
      const b = grid[ni];
      if (a === b) return false;
      const larger = Math.max(a, b);
      const smaller = Math.min(a, b);
      if (larger % smaller === 0) return false;
    }
  }
  return true;
}
