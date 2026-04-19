import React from 'react';
import { loadSavedProgress } from '../hooks/useGameState';
import './StartScreen.css';

const MODES = [
  { key: 'divide',      label: '÷', name: 'Divide',   color: '#27ae60', desc: 'Divide numbers to clear the grid!' },
  { key: 'multiply',    label: '×', name: 'Multiply',  color: '#e67e22', desc: 'Drop & merge powers of 2!' },
];

export default function StartScreen({ onPlay, onContinue }) {
  return (
    <div className="start-wrapper">
      <img
        src={`${process.env.PUBLIC_URL}/assets/bg-desktop.png`}
        alt=""
        className="start-bg start-bg-desktop"
      />
      <img
        src={`${process.env.PUBLIC_URL}/assets/bg-landscape.png`}
        alt=""
        className="start-bg start-bg-landscape"
      />
      <img
        src={`${process.env.PUBLIC_URL}/assets/bg-portrait.png`}
        alt=""
        className="start-bg start-bg-portrait"
      />

      <div className="start-content">
        <img
          src={`${process.env.PUBLIC_URL}/assets/Cat.png`}
          alt="Cat mascot"
          className="start-cat"
          draggable={false}
        />

        <h1 className="start-title">JUST MATH</h1>
        <p className="start-subtitle">Kid Mode</p>
        <p className="start-desc">Pick a mode and solve the puzzle!</p>

        <div className="mode-grid">
          {MODES.map((mode) => {
            const saved = loadSavedProgress(mode.key);
            const hasSave = saved && saved.level > 0;
            return (
              <div key={mode.key} className="mode-card" style={{ borderColor: mode.color }}>
                <div className="mode-symbol" style={{ background: mode.color }}>
                  {mode.label}
                </div>
                <span className="mode-name">{mode.name}</span>
                <p className="mode-desc">{mode.desc}</p>
                {hasSave && (
                  <div className="mode-save-info">
                    <span className="mode-save-text">
                      Lvl {saved.level} &bull; {saved.score}pts
                    </span>
                    <button
                      className="mode-btn mode-continue-btn"
                      style={{ background: mode.color }}
                      onClick={() => onContinue(mode.key)}
                    >
                      Continue
                    </button>
                  </div>
                )}
                <button
                  className="mode-btn mode-play-btn"
                  style={{ background: mode.color }}
                  onClick={() => onPlay(mode.key)}
                >
                  {hasSave ? 'New Game' : 'PLAY'}
                </button>
              </div>
            );
          })}
        </div>

        <div className="start-keys">
          <span><b>Z</b> Undo</span>
          <span><b>R</b> Restart</span>
          <span><b>G</b> Hints</span>
        </div>
      </div>
    </div>
  );
}
