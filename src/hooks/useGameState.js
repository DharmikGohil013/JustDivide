import { useState, useEffect, useCallback, useRef } from 'react';
import { resolveMerges, isGameOver, wouldMerge } from '../utils/mergeLogic';
import { generateTile, generateQueue } from '../utils/tileGenerator';

const INITIAL_TRASH = 10;
const MAX_UNDO = 10;
const POINTS_PER_LEVEL = 10;

/* ---- Level → grid-size / difficulty mapping ---- */
export function getLevelConfig(level) {
  const isBreather = level > 1 && level % 4 === 0;
  let gridSize, difficultyTier, bonusTrash;

  if (isBreather) {
    gridSize = level >= 12 ? 5 : 4;
    difficultyTier = 1;
    bonusTrash = 5;
  } else if (level <= 3) {
    gridSize = 4;
    difficultyTier = 1;
    bonusTrash = 0;
  } else if (level <= 7) {
    gridSize = 4;
    difficultyTier = 2;
    bonusTrash = 0;
  } else if (level <= 11) {
    gridSize = 5;
    difficultyTier = 2;
    bonusTrash = 0;
  } else {
    gridSize = 5;
    difficultyTier = 3;
    bonusTrash = 0;
  }

  return { gridSize, difficultyTier, isBreather, bonusTrash };
}

/* ---- localStorage helpers (mode-scoped) ---- */
function storageKey(mode, suffix) {
  return `justmath_${mode}_${suffix}`;
}

function loadBestScore(mode) {
  try {
    return parseInt(localStorage.getItem(storageKey(mode, 'best')) || '0', 10);
  } catch {
    return 0;
  }
}

function saveBestScore(mode, val) {
  try {
    localStorage.setItem(storageKey(mode, 'best'), String(val));
  } catch {}
}

export function loadSavedProgress(mode = 'divide') {
  try {
    const raw = localStorage.getItem(storageKey(mode, 'progress'));
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (data && typeof data.level === 'number') return data;
    return null;
  } catch {
    return null;
  }
}

function saveProgress(mode, state) {
  try {
    localStorage.setItem(storageKey(mode, 'progress'), JSON.stringify(state));
  } catch {}
}

export function clearSavedProgress(mode = 'divide') {
  try {
    localStorage.removeItem(storageKey(mode, 'progress'));
  } catch {}
}

/* ================================================================== */
export default function useGameState(resumeData, gameMode = 'divide') {
  const initConfig = getLevelConfig(resumeData?.level || 1);
  const initGridSize = resumeData?.gridSize || initConfig.gridSize;

  const [grid, setGrid] = useState(() =>
    resumeData?.grid || Array(initGridSize * initGridSize).fill(null)
  );
  const [queue, setQueue] = useState(() =>
    resumeData?.queue || generateQueue(3, initConfig.difficultyTier, gameMode)
  );
  const [keepVal, setKeepVal] = useState(() => resumeData?.keepVal ?? null);
  const [score, setScore] = useState(() => resumeData?.score || 0);
  const [bestScore, setBestScore] = useState(() => loadBestScore(gameMode));
  const [level, setLevel] = useState(() => resumeData?.level || 1);
  const [trashCount, setTrashCount] = useState(
    () => resumeData?.trashCount ?? INITIAL_TRASH
  );
  const [undoStack, setUndoStack] = useState([]);
  const [hintsEnabled, setHintsEnabled] = useState(false);
  const [timer, setTimer] = useState(() => resumeData?.timer || 0);
  const [gameOver, setGameOver] = useState(false);
  const [paused, setPaused] = useState(false);
  const [gridSize, setGridSize] = useState(initGridSize);
  const [difficultyTier, setDifficultyTier] = useState(initConfig.difficultyTier);
  const [isBreather, setIsBreather] = useState(initConfig.isBreather);
  const timerRef = useRef(null);
  const prevLevelRef = useRef(resumeData?.level || 1);

  /* ---- timer ---- */
  useEffect(() => {
    if (gameOver || paused) {
      clearInterval(timerRef.current);
      return;
    }
    timerRef.current = setInterval(() => setTimer((t) => t + 1), 1000);
    return () => clearInterval(timerRef.current);
  }, [gameOver, paused]);

  /* ---- best-score tracking ---- */
  useEffect(() => {
    if (score > bestScore) {
      setBestScore(score);
      saveBestScore(gameMode, score);
    }
  }, [score, bestScore, gameMode]);

  /* ---- level progression ---- */
  useEffect(() => {
    const newLevel = Math.floor(score / POINTS_PER_LEVEL) + 1;
    if (newLevel > level) {
      setLevel(newLevel);
      const config = getLevelConfig(newLevel);
      const prevConfig = getLevelConfig(prevLevelRef.current);

      setDifficultyTier(config.difficultyTier);
      setIsBreather(config.isBreather);

      if (config.bonusTrash > 0) {
        setTrashCount((tc) => tc + config.bonusTrash);
      } else {
        setTrashCount((tc) => tc + 3);
      }

      /* grid-size change → reset the board */
      if (config.gridSize !== prevConfig.gridSize) {
        const sz = config.gridSize;
        setGridSize(sz);
        setGrid(Array(sz * sz).fill(null));
      }

      prevLevelRef.current = newLevel;
    }
  }, [score, level, gameMode]);

  /* ---- auto-save ---- */
  useEffect(() => {
    if (!gameOver) {
      saveProgress(gameMode, {
        grid, queue, keepVal, score, bestScore,
        level, trashCount, timer, gridSize,
      });
    }
  }, [grid, queue, keepVal, score, bestScore, level, trashCount, timer, gridSize, gameOver, gameMode]);

  /* ---- derived ---- */
  const activeTile = queue[0] || null;

  /* ---- undo snapshot ---- */
  const pushUndo = useCallback(() => {
    setUndoStack((prev) => {
      const snap = {
        grid: [...grid], queue: [...queue], keepVal,
        score, level, trashCount, gridSize, difficultyTier,
      };
      return [snap, ...prev].slice(0, MAX_UNDO);
    });
  }, [grid, queue, keepVal, score, level, trashCount, gridSize, difficultyTier]);

  /* ---- actions ---- */
  const placeTile = useCallback(
    (cellIndex) => {
      if (grid[cellIndex] !== null || activeTile === null || gameOver || paused)
        return false;
      pushUndo();

      const newGrid = [...grid];
      newGrid[cellIndex] = activeTile;

      const { newGrid: resolved, points } = resolveMerges(
        newGrid, cellIndex, gameMode, gridSize, difficultyTier
      );
      setGrid(resolved);
      setScore((s) => s + points);

      const newQueue = [
        ...queue.slice(1),
        generateTile(difficultyTier, gameMode),
      ];
      setQueue(newQueue);

      setTimeout(() => {
        if (isGameOver(resolved, gameMode, gridSize, difficultyTier)) {
          setGameOver(true);
        }
      }, 300);

      return true;
    },
    [grid, activeTile, queue, gameOver, paused, pushUndo, gameMode, gridSize, difficultyTier]
  );

  const storeKeep = useCallback(() => {
    if (activeTile === null || gameOver || paused) return;
    pushUndo();
    if (keepVal !== null) {
      const old = keepVal;
      setKeepVal(activeTile);
      setQueue([old, ...queue.slice(1)]);
    } else {
      setKeepVal(activeTile);
      setQueue([...queue.slice(1), generateTile(difficultyTier, gameMode)]);
    }
  }, [activeTile, keepVal, queue, gameOver, paused, pushUndo, difficultyTier, gameMode]);

  const discardTrash = useCallback(() => {
    if (activeTile === null || trashCount <= 0 || gameOver || paused) return;
    pushUndo();
    setTrashCount((tc) => tc - 1);
    setQueue([...queue.slice(1), generateTile(difficultyTier, gameMode)]);
  }, [activeTile, trashCount, queue, gameOver, paused, pushUndo, difficultyTier, gameMode]);

  const undo = useCallback(() => {
    if (undoStack.length === 0 || gameOver) return;
    const [prev, ...rest] = undoStack;
    setGrid(prev.grid);
    setQueue(prev.queue);
    setKeepVal(prev.keepVal);
    setScore(prev.score);
    setLevel(prev.level);
    setTrashCount(prev.trashCount);
    setGridSize(prev.gridSize);
    setDifficultyTier(prev.difficultyTier);
    setUndoStack(rest);
    setGameOver(false);
  }, [undoStack, gameOver]);

  const restart = useCallback(() => {
    const config = getLevelConfig(1);
    setGridSize(config.gridSize);
    setDifficultyTier(config.difficultyTier);
    setIsBreather(false);
    setGrid(Array(config.gridSize * config.gridSize).fill(null));
    setQueue(generateQueue(3, config.difficultyTier, gameMode));
    setKeepVal(null);
    setScore(0);
    setLevel(1);
    setTrashCount(INITIAL_TRASH);
    setUndoStack([]);
    setTimer(0);
    setGameOver(false);
    setPaused(false);
    prevLevelRef.current = 1;
  }, [gameMode]);

  const toggleHints = useCallback(() => setHintsEnabled((h) => !h), []);
  const togglePause = useCallback(() => setPaused((p) => !p), []);

  const getHintCells = useCallback(() => {
    if (!hintsEnabled || !activeTile) return [];
    const hints = [];
    const totalCells = gridSize * gridSize;
    for (let i = 0; i < totalCells; i++) {
      if (
        grid[i] === null &&
        wouldMerge(grid, i, activeTile, gameMode, gridSize, difficultyTier)
      ) {
        hints.push(i);
      }
    }
    return hints;
  }, [grid, activeTile, hintsEnabled, gameMode, gridSize, difficultyTier]);

  /* ---- keyboard shortcuts ---- */
  useEffect(() => {
    const handleKey = (e) => {
      switch (e.key.toLowerCase()) {
        case 'z': undo(); break;
        case 'r': restart(); break;
        case 'g': toggleHints(); break;
        default: break;
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [undo, restart, toggleHints]);

  return {
    grid, queue, keepVal, score, bestScore, level, trashCount,
    timer, gameOver, paused, hintsEnabled, activeTile,
    gridSize, difficultyTier, isBreather,
    placeTile, storeKeep, discardTrash, undo, restart,
    toggleHints, togglePause, getHintCells,
  };
}
