// Utility functions

export function randomSize(min, max) {
  return (Math.random() * (max - min) + min).toFixed(2);
}

export function getGridPosition(box) {
  const style = window.getComputedStyle(box);
  const gridColumn = style.gridColumn;
  const gridRow = style.gridRow;
  
  // Parse grid-column: "1 / 4" or "1 / span 3"
  const colMatch = gridColumn.match(/(\d+)\s*\/\s*(\d+)/);
  const rowMatch = gridRow.match(/(\d+)\s*\/\s*(\d+)/);
  
  if (colMatch && rowMatch) {
    return {
      colStart: parseInt(colMatch[1]),
      colEnd: parseInt(colMatch[2]),
      rowStart: parseInt(rowMatch[1]),
      rowEnd: parseInt(rowMatch[2])
    };
  }
  return null;
}

