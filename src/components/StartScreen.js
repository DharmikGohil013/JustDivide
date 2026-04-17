import React from 'react';
import './StartScreen.css';

export default function StartScreen({ savedData, onPlay, onContinue }) {
  const hasSave = savedData && savedData.level > 0;

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

        <h1 className="start-title">JUST DIVIDE</h1>
        <p className="start-subtitle">Kid Mode</p>
        <p className="start-desc">
          Divide with the numbers to solve the rows and columns!
        </p>

        {hasSave && (
          <div className="start-save-info">
            <div className="save-badge">
              <span className="save-label">Last Progress</span>
              <span className="save-detail">Level {savedData.level} &bull; Score {savedData.score} &bull; Best {savedData.bestScore}</span>
            </div>
            <button className="start-btn continue-btn" onClick={onContinue}>
              ▶ Continue Level {savedData.level}
            </button>
          </div>
        )}

        <button className="start-btn play-btn" onClick={onPlay}>
          {hasSave ? '🔄 New Game' : '▶ PLAY'}
        </button>

        <div className="start-keys">
          <span><b>Z</b> Undo</span>
          <span><b>R</b> Restart</span>
          <span><b>G</b> Hints</span>
          <span><b>1-3</b> Difficulty</span>
        </div>
      </div>
    </div>
  );
}
