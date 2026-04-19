import React from 'react';
import { getTileImage } from '../utils/tileGenerator';
import './Tile.css';

export default function Tile({ value, draggable, onDragStart, size = 'normal' }) {
  if (value === null || value === undefined) return null;

  const handleDragStart = (e) => {
    if (!draggable) return;
    e.dataTransfer.setData('text/plain', String(value));
    e.dataTransfer.effectAllowed = 'move';
    if (onDragStart) onDragStart(e);
  };

  const handleTouchStart = (e) => {
    if (!draggable) return;
    if (onDragStart) onDragStart(e);
  };

  const sizeClass = value >= 1000 ? 'tile-number-xlarge' : value >= 100 ? 'tile-number-large' : '';

  return (
    <div
      className={`tile tile-${size} ${draggable ? 'tile-draggable' : ''}`}
      draggable={draggable}
      onDragStart={handleDragStart}
      onTouchStart={handleTouchStart}
    >
      <img src={getTileImage(value)} alt="" className="tile-bg" draggable={false} />
      <span className={`tile-number ${sizeClass}`}>{value}</span>
    </div>
  );
}
