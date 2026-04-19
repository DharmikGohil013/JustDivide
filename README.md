    # Just Math - Kid Mode

A math puzzle game for kids aged 7-12 with 2 modes: Divide and Multiply.

## Setup

```bash
npm install
npm start
```

## Game Modes

- **Divide** – Match tiles where one divides the other evenly
- **Multiply** – Drop powers of 2 into columns; same-value tiles merge (2+2→4, 4+4→8…2048)

### Multiply Mode Mechanics

- Tiles are powers of 2 (2, 4, 8, 16, 32, 64…2048) with weighted randomness (small values appear more often)
- Select a column to drop the current tile — it stacks at the bottom like gravity
- When two adjacent tiles (vertical or horizontal) share the same value, they merge and double
- Chain reactions: merges can trigger further merges as tiles collapse
- Game over when all cells are full and no merges remain

## Level Progression

- Levels 1-3: 4×4 grid, easy tiles
- Levels 4-7: 4×4 grid, medium tiles
- Levels 8-11: 5×5 grid, medium tiles
- Levels 12+: 5×5 grid, hard tiles
- Every 4th level: Breather (easy tiles + bonus trash)

## Controls

- **Click column ▼** or **number keys 1-5**: Drop tile into column (Multiply mode)
- **Click cell**: Place tile (Divide mode)
- **Z**: Undo
- **R**: Restart
- **G**: Toggle hints
