import React from 'react';
import './Header.css';

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
  const secs = (seconds % 60).toString().padStart(2, '0');
  return `${mins}:${secs}`;
}

export default function Header({ timer, paused, onPause, onHelp }) {
  return (
    <div className="header">
      <button className="header-btn pause-btn" onClick={onPause} title="Pause">
        {paused ? '▶' : '⏸'}
      </button>

      <div className="header-center">
        <h1 className="game-title">JUST DIVIDE</h1>
        <div className="timer-row">
          <span className="timer-icon">⏳</span>
          <span className="timer-text">{formatTime(timer)}</span>
        </div>
        <p className="subtitle">
          DIVIDE WITH THE NUMBERS TO SOLVE THE ROWS AND COLUMNS.
        </p>
      </div>

      <button className="header-btn help-btn" onClick={onHelp} title="Help / Hints">
        ?
      </button>
    </div>
  );
}
