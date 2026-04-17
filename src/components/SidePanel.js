import React from 'react';
import Tile from './Tile';
import './SidePanel.css';

export default function SidePanel({
  queue,
  keepVal,
  trashCount,
  onKeep,
  onTrash,
  onDragStartActive,
  paused,
}) {
  const handleDragOver = (e) => {
    e.preventDefault();
  };

  return (
    <div className="side-panel">
      {/* KEEP Slot */}
      <div className="keep-section">
        <div
          className="keep-slot"
          onDragOver={handleDragOver}
          onDrop={(e) => { e.preventDefault(); onKeep(); }}
        >
          {keepVal !== null ? (
            <Tile value={keepVal} size="normal" />
          ) : (
            <img
              src={`${process.env.PUBLIC_URL}/assets/Placement_Box.png`}
              alt="empty"
              className="keep-empty"
              draggable={false}
            />
          )}
        </div>
        <span className="section-label keep-label">KEEP</span>
      </div>

      {/* Queue */}
      <div className="queue-section">
        <div className="queue-tiles">
          {queue.map((val, i) => (
            <div key={i} className={`queue-tile ${i === 0 ? 'queue-active' : 'queue-next'}`}>
              <Tile
                value={val}
                draggable={i === 0 && !paused}
                onDragStart={i === 0 ? onDragStartActive : undefined}
                size={i === 0 ? 'normal' : 'small'}
              />
            </div>
          ))}
        </div>
      </div>

      {/* TRASH Slot */}
      <div className="trash-section">
        <span className="section-label trash-label">TRASH</span>
        <div
          className="trash-slot"
          onDragOver={handleDragOver}
          onDrop={(e) => { e.preventDefault(); onTrash(); }}
          onClick={onTrash}
        >
          <div className="trash-icon">🗑️</div>
          <div className="trash-count">×{trashCount}</div>
        </div>
      </div>
    </div>
  );
}
