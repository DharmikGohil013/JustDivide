import { useState, useEffect, useCallback, useRef } from 'react';
import { resolveMerges, isGameOver, wouldMerge } from '../utils/mergeLogic';
import { generateTile, generateQueue } from '../utils/tileGenerator';

const INITIAL_TRASH = 10;
const MAX_UNDO = 10;
const POINTS_PER_LEVEL = 10;

function loadBestScore() {
  try {
    return parseInt(localStorage.getItem('justdivide_best') || '0', 10);
  } catch {
    return 0;
  }
}

function saveBestScore(score) {
  try {
    localStorage.setItem('justdivide_best', String(score));
  } catch {
  }
}

export function loadSavedProgress() {
  try {
    const raw = localStorage.getItem('justdivide_progress');
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (data && typeof data.level === 'number') return data;
    return null;
  } catch {
    return null;
  }
}

function saveProgress(state) {
  try {
    localStorage.setItem('justdivide_progress', JSON.stringify(state));
  } catch {
  }
}

export function clearSavedProgress() {
  try {
    localStorage.removeItem('justdivide_progress');
  } catch {
  }
}

export default function useGameState(resumeData) {
  const [grid, setGrid] = useState(() => resumeData?.grid || Array(16).fill(null));
  const [queue, setQueue] = useState(() => resumeData?.queue || generateQueue(3, 1));
  const [keepVal, setKeepVal] = useState(() => resumeData?.keepVal ?? null);
  const [score, setScore] = useState(() => resumeData?.score || 0);
  const [bestScore, setBestScore] = useState(loadBestScore);
  const [level, setLevel] = useState(() => resumeData?.level || 1);
  const [trashCount, setTrashCount] = useState(() => resumeData?.trashCount ?? INITIAL_TRASH);
  const [undoStack, setUndoStack] = useState([]);
  const [hintsEnabled, setHintsEnabled] = useState(false);
  const [timer, setTimer] = useState(() => resumeData?.timer || 0);
  const [gameOver, setGameOver] = useState(false);
  const [paused, setPaused] = useState(false);
  const [difficulty, setDifficulty] = useState(() => resumeData?.difficulty || 1);
  const timerRef = useRef(null);

  useEffect(() => {
    if (gameOver || paused) {
      clearInterval(timerRef.current);
      return;
    }
    timerRef.current = setInterval(() => {
      setTimer(t => t + 1);
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [gameOver, paused]);

  useEffect(() => {
    if (score > bestScore) {
      setBestScore(score);
      saveBestScore(score);
    }
  }, [score, bestScore]);

  useEffect(() => {
    const newLevel = Math.floor(score / POINTS_PER_LEVEL) + 1;
    if (newLevel > level) {
      setLevel(newLevel);
      setTrashCount(tc => tc + 3);
    }
  }, [score, level]);

  useEffect(() => {
    if (!gameOver) {
      saveProgress({ grid, queue, keepVal, score, bestScore, level, trashCount, timer, difficulty });
    }
  }, [grid, queue, keepVal, score, bestScore, level, trashCount, timer, difficulty, gameOver]);

  const activeTile = queue[0] || null;

  const pushUndo = useCallback(() => {
    setUndoStack(prev => {
      const snap = { grid: [...grid], queue: [...queue], keepVal, score, level, trashCount };
      const next = [snap, ...prev];
      return next.slice(0, MAX_UNDO);
    });
  }, [grid, queue, keepVal, score, level, trashCount]);

  const placeTile = useCallback((cellIndex) => {
    if (grid[cellIndex] !== null || activeTile === null || gameOver || paused) return false;

    pushUndo();

    const newGrid = [...grid];
    newGrid[cellIndex] = activeTile;

    const { newGrid: resolved, points } = resolveMerges(newGrid, cellIndex);

    setGrid(resolved);
    setScore(s => s + points);

    const newQueue = [...queue.slice(1), generateTile(difficulty)];
    setQueue(newQueue);

    setTimeout(() => {
      if (isGameOver(resolved)) {
        setGameOver(true);
      }
    }, 300);

    return true;
  }, [grid, activeTile, queue, gameOver, paused, pushUndo, difficulty]);

  const storeKeep = useCallback(() => {
    if (activeTile === null || gameOver || paused) return;
    pushUndo();

    if (keepVal !== null) {
      const old = keepVal;
      setKeepVal(activeTile);
      setQueue([old, ...queue.slice(1)]);
    } else {
      setKeepVal(activeTile);
      const newQueue = [...queue.slice(1), generateTile(difficulty)];
      setQueue(newQueue);
    }
  }, [activeTile, keepVal, queue, gameOver, paused, pushUndo, difficulty]);

  const discardTrash = useCallback(() => {
    if (activeTile === null || trashCount <= 0 || gameOver || paused) return;
    pushUndo();
    setTrashCount(tc => tc - 1);
    const newQueue = [...queue.slice(1), generateTile(difficulty)];
    setQueue(newQueue);
  }, [activeTile, trashCount, queue, gameOver, paused, pushUndo, difficulty]);

  const undo = useCallback(() => {
    if (undoStack.length === 0 || gameOver) return;
    const [prev, ...rest] = undoStack;
    setGrid(prev.grid);
    setQueue(prev.queue);
    setKeepVal(prev.keepVal);
    setScore(prev.score);
    setLevel(prev.level);
    setTrashCount(prev.trashCount);
    setUndoStack(rest);
    setGameOver(false);
  }, [undoStack, gameOver]);

  const restart = useCallback(() => {
    setGrid(Array(16).fill(null));
    setQueue(generateQueue(3, difficulty));
    setKeepVal(null);
    setScore(0);
    setLevel(1);
    setTrashCount(INITIAL_TRASH);
    setUndoStack([]);
    setTimer(0);
    setGameOver(false);
    setPaused(false);
  }, [difficulty]);

  const toggleHints = useCallback(() => {
    setHintsEnabled(h => !h);
  }, []);

  const togglePause = useCallback(() => {
    setPaused(p => !p);
  }, []);

  const changeDifficulty = useCallback((d) => {
    setDifficulty(d);
    setGrid(Array(16).fill(null));
    setQueue(generateQueue(3, d));
    setKeepVal(null);
    setScore(0);
    setLevel(1);
    setTrashCount(INITIAL_TRASH);
    setUndoStack([]);
    setTimer(0);
    setGameOver(false);
    setPaused(false);
  }, []);

  const getHintCells = useCallback(() => {
    if (!hintsEnabled || !activeTile) return [];
    const hints = [];
    for (let i = 0; i < 16; i++) {
      if (grid[i] === null && wouldMerge(grid, i, activeTile)) {
        hints.push(i);
      }
    }
    return hints;
  }, [grid, activeTile, hintsEnabled]);

  useEffect(() => {
    const handleKey = (e) => {
      switch (e.key.toLowerCase()) {
        case 'z': undo(); break;
        case 'r': restart(); break;
        case 'g': toggleHints(); break;
        case '1': changeDifficulty(1); break;
        case '2': changeDifficulty(2); break;
        case '3': changeDifficulty(3); break;
        default: break;
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [undo, restart, toggleHints, changeDifficulty]);

  return {
    grid,
    queue,
    keepVal,
    score,
    bestScore,
    level,
    trashCount,
    timer,
    gameOver,
    paused,
    difficulty,
    hintsEnabled,
    activeTile,
    placeTile,
    storeKeep,
    discardTrash,
    undo,
    restart,
    toggleHints,
    togglePause,
    changeDifficulty,
    getHintCells,
  };
}
