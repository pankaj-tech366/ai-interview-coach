// Deterministic pseudo-random leaf layout so server and client render identically (no hydration mismatch).
const LEAF_COUNT = 20;

interface LeafConfig {
  id: number;
  left: number;
  size: number;
  duration: number;
  delay: number;
  drift: number;
  rotateStart: number;
  opacity: number;
  hue: number;
}

const LEAVES: LeafConfig[] = Array.from({ length: LEAF_COUNT }, (_, i) => ({
  id: i,
  left: (i * 47) % 100,
  size: 10 + ((i * 13) % 16),
  duration: 11 + ((i * 7) % 14),
  delay: (i * 2.7) % 18,
  drift: 30 + ((i * 19) % 100),
  rotateStart: (i * 53) % 360,
  opacity: 0.35 + ((i % 5) * 0.1),
  hue: i % 2,
}));

export default function FallingLeaves() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {LEAVES.map((leaf) => (
        <span
          key={leaf.id}
          className={leaf.hue === 0 ? "leaf leaf-red" : "leaf leaf-ash"}
          style={
            {
              left: `${leaf.left}%`,
              width: `${leaf.size}px`,
              height: `${leaf.size}px`,
              opacity: leaf.opacity,
              animationDuration: `${leaf.duration}s`,
              animationDelay: `-${leaf.delay}s`,
              "--drift": `${leaf.drift}px`,
              "--rotate-start": `${leaf.rotateStart}deg`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}
