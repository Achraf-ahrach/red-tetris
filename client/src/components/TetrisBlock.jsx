


// TetrisBlock component for visual elements
export const TetrisBlock = ({ color, size = 20 }) => (
  <div
    className="rounded-sm border border-white/20"
    style={{
      width: size,
      height: size,
      backgroundColor: color,
      boxShadow: `inset 0 0 0 1px ${color}80, 0 0 8px ${color}40`,
    }}
  />
)
