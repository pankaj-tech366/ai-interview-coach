interface Segment {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

// Deterministic fractal branching (seeded via Math.sin, no Math.random) so SSR/client output matches exactly.
function branch(x: number, y: number, angle: number, length: number, depth: number, seed: number, segs: Segment[]) {
  if (depth === 0 || length < 5) return;
  const rad = (angle * Math.PI) / 180;
  const x2 = x + Math.sin(rad) * length;
  const y2 = y - Math.cos(rad) * length;
  segs.push({ x1: x, y1: y, x2, y2 });
  const spread = 20 + Math.abs(Math.sin(seed + depth)) * 16;
  branch(x2, y2, angle - spread, length * 0.68, depth - 1, seed + 1.7, segs);
  branch(x2, y2, angle + spread, length * 0.68, depth - 1, seed + 2.3, segs);
}

function treePath(x: number, groundY: number, height: number, seed: number): string {
  const segs: Segment[] = [];
  const lean = Math.sin(seed) * 8;
  branch(x, groundY, lean, height, 4, seed, segs);
  return segs.map((s) => `M${s.x1.toFixed(1)},${s.y1.toFixed(1)} L${s.x2.toFixed(1)},${s.y2.toFixed(1)}`).join(" ");
}

const GROUND_Y = 210;

const TREES = [
  { x: 30, height: 140, seed: 1.1, width: 3.2 },
  { x: 140, height: 90, seed: 2.4, width: 2.2 },
  { x: 250, height: 165, seed: 3.6, width: 3.6 },
  { x: 350, height: 100, seed: 4.15, width: 2.4 },
  { x: 460, height: 150, seed: 5.5, width: 3 },
  { x: 580, height: 115, seed: 0.6, width: 2.4 },
  { x: 690, height: 175, seed: 1.9, width: 3.8 },
  { x: 810, height: 95, seed: 2.9, width: 2.2 },
  { x: 920, height: 155, seed: 4.6, width: 3.2 },
  { x: 1030, height: 120, seed: 5.9, width: 2.6 },
  { x: 1150, height: 170, seed: 1.4, width: 3.6 },
  { x: 1260, height: 105, seed: 2.1, width: 2.4 },
  { x: 1370, height: 145, seed: 3.3, width: 3 },
  { x: 1480, height: 100, seed: 4.9, width: 2.2 },
  { x: 1570, height: 160, seed: 0.9, width: 3.4 },
];

export default function SpookyTreeline() {
  return (
    <svg
      viewBox="0 0 1600 220"
      preserveAspectRatio="xMidYMax slice"
      className="h-36 w-full opacity-90 sm:h-52"
      aria-hidden="true"
    >
      <rect x="0" y={GROUND_Y - 4} width="1600" height="24" fill="#020000" />
      {TREES.map((tree, i) => (
        <path
          key={i}
          d={treePath(tree.x, GROUND_Y, tree.height, tree.seed)}
          stroke="#0c0101"
          strokeWidth={tree.width}
          strokeLinecap="round"
          fill="none"
        />
      ))}
    </svg>
  );
}
