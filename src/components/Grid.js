import React from 'react';
import Tile from './Tile';
import './Grid.css';

export default function Grid({ grid, hintCells, onDrop, onDropColumn, paused, gridSize = 4, gameMode = 'divide' }) {
  const isMultiply = gameMode === 'multiply';

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDropOnCell = (e, index) => {
    e.preventDefault();
    if (paused) return;
    if (isMultiply) {
      const col = index % gridSize;
      if (onDropColumn) onDropColumn(col);
    } else {
      onDrop(index);
    }
  };

  const handleCellClick = (index) => {
    if (paused) return;
    if (isMultiply) {
      const col = index % gridSize;
      if (onDropColumn) onDropColumn(col);
    }
  };

  const totalCells = gridSize * gridSize;
  const displayGrid = grid.slice(0, totalCells);

  return (
    <div className="grid-container">
      {/* Column drop buttons for Multiply mode */}
      {isMultiply && (
        <div
          className="column-indicators"
          style={{ gridTemplateColumns: `repeat(${gridSize}, 1fr)` }}
        >
          {Array.from({ length: gridSize }, (_, col) => {
            const colFull = grid[col] !== null; /* top cell of column */
            return (
              <button
                key={col}
                className="column-drop-btn"
                onClick={() => !paused && onDropColumn && onDropColumn(col)}
                disabled={paused || colFull}
                data-col={col}
              >
                ▼
              </button>
            );
          })}
        </div>
      )}

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
              onDrop={(e) => handleDropOnCell(e, index)}
              onClick={() => handleCellClick(index)}
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
