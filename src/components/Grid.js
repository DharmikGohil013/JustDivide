import React from 'react';
import Tile from './Tile';
import './Grid.css';

export default function Grid({ grid, hintCells, onDrop, paused, gridSize = 4 }) {
  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, index) => {
    e.preventDefault();
    if (!paused) {
      onDrop(index);
    }
  };

  const totalCells = gridSize * gridSize;
  const displayGrid = grid.slice(0, totalCells);

  return (
    <div className="grid-container">
      <div
        className="grid-board"
        style={{
          gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
          gridTemplateRows: `repeat(${gridSize}, 1fr)`,
        }}
      >
        {displayGrid.map((cell, index) => {
          const isHint = hintCells.includes(index);
          return (
            <div
              key={index}
              className={`grid-cell ${isHint ? 'grid-cell-hint' : ''} ${cell !== null ? 'grid-cell-filled' : ''}`}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, index)}
              data-index={index}
            >
              <img
                src={`${process.env.PUBLIC_URL}/assets/Placement_Box.png`}
                alt=""
                className="cell-bg"
                draggable={false}
              />
              {cell !== null && (
                <div className="cell-tile">
                  <Tile value={cell} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
