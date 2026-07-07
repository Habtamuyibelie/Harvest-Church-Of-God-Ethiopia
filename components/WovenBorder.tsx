export default function WovenBorder({
  tone = "terracotta",
  className = "",
}: {
  tone?: "terracotta" | "gold" | "forest" | "blue" | "cream";
  className?: string;
}) {
  const colors: Record<string, string> = {
    terracotta: "#C32A2E",
    gold: "#E0A82E",
    forest: "#1E6B3C",
    blue: "#1B3F8B",
    cream: "#F8F4E9",
  };
  const c = colors[tone];
  // A repeating diamond/triangle motif echoing Ethiopian habesha kemis telet borders,
  // doubling as a stylised row of grain heads for "harvest".
  return (
    <svg
      className={className}
      viewBox="0 0 240 16"
      preserveAspectRatio="xMidYMid repeat"
      width="100%"
      height="16"
      aria-hidden="true"
    >
      {Array.from({ length: 12 }).map((_, i) => (
        <g key={i} transform={`translate(${i * 20}, 0)`}>
          <polygon points="10,1 16,8 10,15 4,8" fill={c} opacity={0.9} />
          <circle cx="10" cy="8" r="1.4" fill="#F8F4E9" />
        </g>
      ))}
    </svg>
  );
}
