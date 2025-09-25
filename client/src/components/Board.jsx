import { EmptyCell } from "../types";

const getCellColor = (cellType) => {
  const colors = {
    I: "bg-cyan-400", // Cyan for I piece
    J: "bg-blue-500", // Blue for J piece
    L: "bg-orange-500", // Orange for L piece
    O: "bg-yellow-400", // Yellow for O piece
    S: "bg-green-500", // Green for S piece
    T: "bg-purple-500", // Purple for T piece
    Z: "bg-red-500", // Red for Z piece
  };
  return colors[cellType] || "bg-gray-500";
};

function Board({ currentBoard }) {
  return (
    <div className="inline-block border-2 border-gray-400 bg-black p-2 mx-auto">
      {currentBoard.map((row, rowIndex) => (
        <div key={rowIndex} className="flex">
          {row.map((cell, cellIndex) => (
            <div
              key={cellIndex}
              className={`w-6 h-6 border border-gray-600 ${
                cell === EmptyCell.Empty ? "bg-gray-900" : getCellColor(cell)
              }`}
            >
              {cell !== EmptyCell.Empty ? "" : ""}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

export default Board;
