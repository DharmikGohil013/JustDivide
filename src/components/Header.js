import React from 'react';
import './Header.css';

const MODE_TITLES = {
  divide: 'JUST DIVIDE',
  multiply: 'JUST MULTIPLY',
};

const MODE_SUBTITLES = {
  divide: 'DIVIDE WITH THE NUMBERS TO SOLVE THE ROWS AND COLUMNS.',
  multiply: 'DROP & MERGE POWERS OF 2!',
};

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
  const secs = (seconds % 60).toString().padStart(2, '0');
  return `${mins}:${secs}`;
}

export default function Header({ timer, paused, onPause, onHelp, gameMode, isBreather }) {
  return (
    <div className="header">
      <button className="header-btn pause-btn" onClick={onPause} title="Pause">
        {paused ? '▶' : '⏸'}
      </button>

      <div className="header-center">
        <h1 className="game-title">{MODE_TITLES[gameMode] || 'JUST MATH'}</h1>
        <div className="timer-row">
          <span className="timer-icon">⏳</span>
          <span className="timer-text">{formatTime(timer)}</span>
        </div>
        <p className="subtitle">
          {MODE_SUBTITLES[gameMode] || ''}
        </p>
        {isBreather && <span className="breather-badge">🌟 BREATHER LEVEL</span>}
      </div>

      <button className="header-btn help-btn" onClick={onHelp} title="Help / Hints">
        ?
      </button>
    </div>
  );
}
