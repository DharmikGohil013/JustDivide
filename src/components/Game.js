import React, { useState, useRef, useCallback, useEffect } from 'react';
import useGameState from '../hooks/useGameState';
import Header from './Header';
import Grid from './Grid';
import SidePanel from './SidePanel';
import GameOver from './GameOver';
import './Game.css';

export default function Game({ resumeData, onBackToStart }) {
  const {
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
    hintsEnabled,
    placeTile,
    storeKeep,
    discardTrash,
    undo,
    restart,
    toggleHints,
    togglePause,
    getHintCells,
  } = useGameState(resumeData);

  const [touchDrag, setTouchDrag] = useState(null);
  const gameAreaRef = useRef(null);

  const hintCells = getHintCells();

  const handleDrop = useCallback((cellIndex) => {
    placeTile(cellIndex);
  }, [placeTile]);

  const handleDragStartActive = useCallback(() => {
  }, []);

  const handleTouchMove = useCallback((e) => {
    if (!touchDrag) return;
    e.preventDefault();
    const touch = e.touches[0];
    setTouchDrag(prev => ({
      ...prev,
      x: touch.clientX,
      y: touch.clientY,
    }));
  }, [touchDrag]);

  const handleTouchEnd = useCallback((e) => {
    if (!touchDrag) return;
    const { x, y } = touchDrag;
    
    const cells = document.querySelectorAll('.grid-cell');
    for (const cell of cells) {
      const rect = cell.getBoundingClientRect();
      if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
        const index = parseInt(cell.dataset.index, 10);
        placeTile(index);
        break;
      }
    }

    const keepSlot = document.querySelector('.keep-slot');
    if (keepSlot) {
      const rect = keepSlot.getBoundingClientRect();
      if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
        storeKeep();
      }
    }

    const trashSlot = document.querySelector('.trash-slot');
    if (trashSlot) {
      const rect = trashSlot.getBoundingClientRect();
      if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
        discardTrash();
      }
    }

    setTouchDrag(null);
  }, [touchDrag, placeTile, storeKeep, discardTrash]);

  useEffect(() => {
    if (touchDrag) {
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleTouchEnd);
      return () => {
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, [touchDrag, handleTouchMove, handleTouchEnd]);

  useEffect(() => {
    const handleDragEnd = () => {};
    document.addEventListener('dragend', handleDragEnd);
    return () => document.removeEventListener('dragend', handleDragEnd);
  }, []);

  return (
    <div className="game-wrapper">
      <img
        src={`${process.env.PUBLIC_URL}/assets/bg-desktop.png`}
        alt=""
        className="game-bg game-bg-desktop"
      />
      <img
        src={`${process.env.PUBLIC_URL}/assets/bg-landscape.png`}
        alt=""
        className="game-bg game-bg-landscape"
      />
      <img
        src={`${process.env.PUBLIC_URL}/assets/bg-portrait.png`}
        alt=""
        className="game-bg game-bg-portrait"
      />

      <div className="game-content" ref={gameAreaRef}>
        <Header
          timer={timer}
          paused={paused}
          onPause={togglePause}
          onHelp={toggleHints}
        />

        <div className="game-main">
          <div className="game-center">
            <div className="cat-badges-row">
              <div className="badge level-badge">
                <img
                  src={`${process.env.PUBLIC_URL}/assets/badge.png`}
                  alt=""
                  className="badge-bg"
                  draggable={false}
                />
                <span className="badge-text">LEVEL {level}</span>
              </div>

              <img
                src={`${process.env.PUBLIC_URL}/assets/Cat.png`}
                alt="Cat mascot"
                className="cat-image"
                draggable={false}
              />

              <div className="badge score-badge">
                <img
                  src={`${process.env.PUBLIC_URL}/assets/badge.png`}
                  alt=""
                  className="badge-bg"
                  draggable={false}
                />
                <span className="badge-text">SCORE {score}</span>
              </div>
            </div>

            <Grid
              grid={grid}
              hintCells={hintCells}
              onDrop={handleDrop}
              paused={paused}
            />
          </div>

          <SidePanel
            queue={queue}
            keepVal={keepVal}
            trashCount={trashCount}
            onKeep={storeKeep}
            onTrash={discardTrash}
            onDragStartActive={handleDragStartActive}
            paused={paused}
          />
        </div>

        <div className="bottom-controls">
          <button className="undo-btn" onClick={undo} title="Undo (Z)">
            ↩ Undo
          </button>
          <button className="restart-btn" onClick={restart} title="Restart (R)">
            🔄 Restart
          </button>
          {hintsEnabled && (
            <span className="hints-indicator">💡 Hints ON</span>
          )}
        </div>
      </div>

      {touchDrag && (
        <div
          className="touch-ghost"
          style={{
            left: touchDrag.x - 30,
            top: touchDrag.y - 30,
          }}
        >
          <span className="touch-ghost-number">{touchDrag.value}</span>
        </div>
      )}

      {paused && !gameOver && (
        <div className="pause-overlay" onClick={togglePause}>
          <div className="pause-modal">
            <h2>PAUSED</h2>
            <p>Click anywhere to resume</p>
          </div>
        </div>
      )}

      {gameOver && (
        <GameOver score={score} bestScore={bestScore} onRestart={restart} onBackToStart={onBackToStart} />
      )}
    </div>
  );
}
