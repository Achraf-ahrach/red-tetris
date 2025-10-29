import React, { memo, useMemo } from "react";
import { BOARD_WIDTH, BOARD_HEIGHT, EmptyCell } from "@/types";

// Map tetromino codes to hex colors (defined outside component for performance)
const COLOR_MAP = {
  I: "#00e5ff",
  O: "#facc15",
  T: "#a855f7",
  S: "#22c55e",
  Z: "#ef4444",
  J: "#3b82f6",
  L: "#f59e0b",
};

const toHex = (value) => {
  if (!value || value === EmptyCell.Empty) return null;
  if (typeof value === "string" && value.startsWith("#")) return value;
  return COLOR_MAP[value] || null;
};

// Compact opponent board for 1v1 multiplayer mode
const OpponentBoard = memo(function OpponentBoard({
  opponentBoard,
  opponentName = "Opponent",
  opponentScore = 0,
  opponentLines = 0,
  isActive = true,
}) {
  const aspect = BOARD_WIDTH / BOARD_HEIGHT;

  // Memoize cells to prevent unnecessary re-renders
  const cells = useMemo(() => {
    return Array.from({ length: BOARD_HEIGHT }).map((_, y) =>
      Array.from({ length: BOARD_WIDTH }).map((_, x) => {
        const cell = opponentBoard?.[y]?.[x];
        const colorHex = toHex(cell);
        return { y, x, colorHex };
      })
    );
  }, [opponentBoard]);

  return (
    <div className="relative">
      {/* Opponent info header */}
      <div className="mb-2 flex items-center justify-between bg-white/5 backdrop-blur-sm rounded-lg p-2 border border-white/10">
        <div className="flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full ${
              isActive ? "bg-green-400 animate-pulse" : "bg-gray-500"
            }`}
          />
          <span className="text-sm font-semibold text-white truncate max-w-[100px]">
            {opponentName}
          </span>
        </div>
        <div className="flex gap-3 text-xs">
          <div className="text-gray-300">
            <span className="text-primary font-bold">{opponentScore}</span>
          </div>
          <div className="text-gray-300">
            L: <span className="text-accent font-bold">{opponentLines}</span>
          </div>
        </div>
      </div>

      {/* Compact board preview */}
      <div
        className="relative mx-auto"
        style={{
          height: "220px",
          width: `calc(220px * ${aspect})`,
        }}
      >
        <div className="relative h-full w-full rounded-xl overflow-hidden bg-black/85 backdrop-blur-sm border border-white/20 shadow-xl">
          {/* Top sheen */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />

          {/* Overlay grid lines */}
          <div
            className="pointer-events-none absolute inset-0 opacity-15"
            style={{
              backgroundImage:
                "linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px)",
              backgroundSize: `calc(100% / ${BOARD_WIDTH}) calc(100% / ${BOARD_HEIGHT})`,
            }}
          />

          {/* Cells grid */}
          <div
            className="absolute inset-0 grid gap-[1px] p-2"
            style={{
              gridTemplateColumns: `repeat(${BOARD_WIDTH}, 1fr)`,
              gridTemplateRows: `repeat(${BOARD_HEIGHT}, 1fr)`,
            }}
          >
            {cells.map((row) =>
              row.map(({ y, x, colorHex }) => {
                if (colorHex) {
                  return (
                    <div key={`${y}-${x}`} className="w-full h-full relative">
                      {/* Simplified cell with color */}
                      <div
                        className="absolute inset-[12%] rounded-[3px]"
                        style={{
                          background: `linear-gradient(135deg, ${colorHex}ff, ${colorHex}cc)`,
                          boxShadow: `0 0 6px ${colorHex}55, inset 0 -1px 3px rgba(0,0,0,0.4)`,
                        }}
                      />
                    </div>
                  );
                }

                return (
                  <div
                    key={`${y}-${x}`}
                    className="w-full h-full bg-black/10"
                  />
                );
              })
            )}
          </div>

          {/* Inactive overlay */}
          {!isActive && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center">
              <span className="text-xs text-gray-400 font-semibold">
                Disconnected
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

export default OpponentBoard;
