import React from 'react';
import './GameOver.css';

export default function GameOver({ score, bestScore, onRestart, onBackToStart }) {
  return (
    <div className="gameover-overlay">
      <div className="gameover-modal">
        <h2 className="gameover-title">GAME OVER!</h2>
        <div className="gameover-scores">
          <div className="gameover-score-item">
            <span className="gameover-label">Score</span>
            <span className="gameover-value">{score}</span>
          </div>
          <div className="gameover-score-item">
            <span className="gameover-label">Best</span>
            <span className="gameover-value best">{bestScore}</span>
          </div>
        </div>
        <button className="gameover-restart" onClick={onRestart}>
          Play Again
        </button>
        {onBackToStart && (
          <button className="gameover-home" onClick={onBackToStart}>
            Home
          </button>
        )}
      </div>
    </div>
  );
}
