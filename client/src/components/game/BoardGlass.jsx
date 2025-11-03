import React, { memo, useMemo } from "react";
import Cell from "./Cell";
import { BOARD_WIDTH, BOARD_HEIGHT, EmptyCell, SOLID_PENALTY } from "@/types";
import { isValidMove } from "@/utils/gameLogic";

// Map tetromino codes (I,O,T,S,Z,J,L) to hex colors
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
  if (value === SOLID_PENALTY) return "#808080"; // penalty color
  if (typeof value === "string" && value.startsWith("#")) return value;
  return COLOR_MAP[value] || null;
};

const getGhostY = (board, shape, pos) => {
  if (!shape || !pos) return null;
  let y = pos.y;
  while (isValidMove(board, shape, { x: pos.x, y: y + 1 })) y++;
  return y;
};

const BoardGlass = memo(function BoardGlass({
  currentBoard,
  currentPiece,
  currentPosition,
  isGameOver,
}) {
  const aspect = BOARD_WIDTH / BOARD_HEIGHT;

  // Memoize active piece coordinates for performance
  const activeSet = useMemo(() => {
    const set = new Set();
    if (currentPiece && currentPosition) {
      const { x, y } = currentPosition;
      for (let r = 0; r < currentPiece.shape.length; r++) {
        for (let c = 0; c < currentPiece.shape[r].length; c++) {
          if (currentPiece.shape[r][c]) {
            const ny = y + r;
            const nx = x + c;
            if (ny >= 0 && ny < BOARD_HEIGHT && nx >= 0 && nx < BOARD_WIDTH) {
              set.add(`${ny},${nx}`);
            }
          }
        }
      }
    }
    return set;
  }, [currentPiece, currentPosition]);

  const activeColor = useMemo(
    () => toHex(currentPiece?.color),
    [currentPiece?.color]
  );

  // Memoize ghost piece coordinates
  const ghostSet = useMemo(() => {
    const set = new Set();
    if (!currentPiece || !currentPosition) return set;

    const ghostY = getGhostY(currentBoard, currentPiece.shape, currentPosition);
    if (ghostY === null) return set;

    const { x } = currentPosition;
    for (let r = 0; r < currentPiece.shape.length; r++) {
      for (let c = 0; c < currentPiece.shape[r].length; c++) {
        if (currentPiece.shape[r][c]) {
          const ny = ghostY + r;
          const nx = x + c;
          if (
            ny >= 0 &&
            ny < BOARD_HEIGHT &&
            nx >= 0 &&
            nx < BOARD_WIDTH &&
            currentBoard[ny][nx] === EmptyCell.Empty &&
            !activeSet.has(`${ny},${nx}`)
          ) {
            set.add(`${ny},${nx}`);
          }
        }
      }
    }
    return set;
  }, [currentBoard, currentPiece, currentPosition, activeSet]);

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <div
        className="relative"
        style={{
          height: `min(90vh, calc(100vw / ${aspect} * 0.9))`,
          width: `calc(min(90vh, calc(100vw / ${aspect} * 0.9)) * ${aspect} * 1.15)`,
          maxHeight: "90vh",
          maxWidth: "100%",
        }}
      >
        {/* Glass frame - darker to match site background */}
        <div className="relative h-full w-full rounded-2xl overflow-hidden bg-black/90 backdrop-blur-md border border-white/20 shadow-[0_20px_60px_rgba(0,0,0,0.8)]">
          {/* Top sheen */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />
          {/* Inner vignette */}
          <div className="pointer-events-none absolute inset-0 shadow-[inset_0_0_60px_rgba(0,0,0,0.6)]" />
          {/* Overlay grid lines */}
          <div
            className="pointer-events-none absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                "linear-gradient(to right, rgba(255,255,255,0.12) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.12) 1px, transparent 1px)",
              backgroundSize: `calc(100% / ${BOARD_WIDTH}) calc(100% / ${BOARD_HEIGHT})`,
              backgroundPosition: "top left",
            }}
          />

          {/* Cells grid */}
          <div
            className="absolute inset-0 grid gap-[2px] p-3"
            style={{
              gridTemplateColumns: `repeat(${BOARD_WIDTH}, 1fr)`,
              gridTemplateRows: `repeat(${BOARD_HEIGHT}, 1fr)`,
            }}
          >
            {Array.from({ length: BOARD_HEIGHT }).map((_, y) =>
              Array.from({ length: BOARD_WIDTH }).map((_, x) => {
                const key = `${y},${x}`;
                const isActive = activeSet.has(key);
                const baseFilled = currentBoard[y][x] !== EmptyCell.Empty;
                const colorHex = isActive
                  ? activeColor
                  : baseFilled
                  ? toHex(currentBoard[y][x])
                  : null;

                if (colorHex) {
                  return <Cell key={key} color={colorHex} />;
                }

                const isGhost = ghostSet.has(key);
                return (
                  <div key={key} className="w-full h-full relative bg-black/20">
                    {isGhost ? (
                      <div
                        className="absolute inset-[8%] rounded-[4px] border-2 border-dashed opacity-40"
                        style={{ borderColor: activeColor || "#ffffff" }}
                      />
                    ) : null}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {isGameOver && (
        <div className="absolute inset-0 flex items-center justify-center rounded-2xl z-50">
          <div className="absolute inset-0 rounded-2xl bg-black/80 backdrop-blur-sm" />
          <div className="relative text-center bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-xl p-10 rounded-3xl border border-white/30 shadow-2xl">
            <h2 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-pink-400 to-rose-500 mb-4 drop-shadow-lg">
              GAME OVER
            </h2>
            <p className="text-xl md:text-2xl text-gray-100 font-medium">
              Press Play Again to continue
            </p>
          </div>
        </div>
      )}
    </div>
  );
});

export default BoardGlass;
