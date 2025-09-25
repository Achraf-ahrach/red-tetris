import React from "react";

function Cell({ type, isEmpty }) {
  const getCellColor = (cellType) => {
    if (isEmpty) return "bg-gray-900";

    const colors = {
      I: "bg-cyan-400", // Cyan for I piece
      J: "bg-blue-500", // Blue for J piece
      L: "bg-orange-500", // Orange for L piece
      O: "bg-yellow-400", // Yellow for O piece
      S: "bg-green-500", // Green for S piece
      T: "bg-purple-500", // Purple for T piece
      Z: "bg-red-500", // Red for Z piece
      Empty: "bg-gray-900",
    };
    return colors[cellType] || "bg-gray-500";
  };

  return (
    <div
      className={`w-8 h-8 border border-gray-600 ${getCellColor(
        type
      )} transition-colors duration-150`}
    />
  );
}

export default Cell;
