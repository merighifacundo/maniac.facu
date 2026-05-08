"use client";

export default function LabScene() {
  return (
    <>
      {/* back wall — cold gray */}
      <rect x={0} y={0} width={320} height={130} fill="#3a3a4a" />
      {/* tile pattern on wall */}
      {Array.from({ length: 10 }).map((_, i) => (
        <line
          key={`wv-${i}`}
          x1={i * 32}
          y1={20}
          x2={i * 32}
          y2={126}
          stroke="#2a2a36"
          strokeWidth={1}
        />
      ))}
      {Array.from({ length: 4 }).map((_, i) => (
        <line
          key={`wh-${i}`}
          x1={0}
          y1={20 + i * 28}
          x2={320}
          y2={20 + i * 28}
          stroke="#2a2a36"
          strokeWidth={1}
        />
      ))}

      {/* ceiling pipe */}
      <rect x={0} y={10} width={320} height={6} fill="#555555" />
      <rect x={0} y={11} width={320} height={1} fill="#888888" />
      <rect x={0} y={15} width={320} height={1} fill="#222222" />

      {/* baseboard */}
      <rect x={0} y={126} width={320} height={4} fill="#1a1a22" />

      {/* floor — checker tile */}
      <rect x={0} y={130} width={320} height={30} fill="var(--ega-lgray)" />
      {Array.from({ length: 16 }).map((_, i) =>
        i % 2 === 0 ? (
          <rect
            key={`tile-${i}`}
            x={i * 20}
            y={130}
            width={20}
            height={30}
            fill="#888888"
          />
        ) : null,
      )}
      {Array.from({ length: 17 }).map((_, i) => (
        <line
          key={`fv-${i}`}
          x1={i * 20}
          y1={130}
          x2={i * 20}
          y2={160}
          stroke="var(--ega-black)"
          strokeWidth={1}
        />
      ))}

      {/* door (right wall) */}
      <rect x={260} y={32} width={32} height={76} fill="var(--ega-black)" />
      <rect x={262} y={36} width={28} height={70} fill="var(--ega-cyan)" />
      <rect x={262} y={36} width={28} height={4} fill="var(--ega-lcyan)" />
      <circle cx={268} cy={72} r={1.5} fill="var(--ega-yellow)" />
      {/* EXIT sign above door */}
      <rect x={264} y={22} width={24} height={8} fill="var(--ega-red)" />
      <rect x={266} y={24} width={20} height={4} fill="var(--ega-yellow)" />

      {/* computer terminal (left side) */}
      <rect x={30} y={74} width={42} height={56} fill="#222222" />
      <rect x={30} y={74} width={42} height={2} fill="#555555" />
      {/* screen bezel */}
      <rect x={34} y={78} width={34} height={26} fill="#000000" />
      {/* CRT screen */}
      <rect x={36} y={80} width={30} height={22} fill="#003300" />
      {/* scanlines as text */}
      <rect x={38} y={84} width={20} height={2} fill="var(--ega-lgreen)" />
      <rect x={38} y={88} width={14} height={2} fill="var(--ega-lgreen)" />
      <rect x={38} y={92} width={22} height={2} fill="var(--ega-lgreen)" />
      <rect x={38} y={96} width={10} height={2} fill="var(--ega-lgreen)" />
      <rect x={50} y={96} width={2} height={2} fill="var(--ega-yellow)" />
      {/* keyboard slot */}
      <rect x={32} y={108} width={38} height={6} fill="#444444" />
      <rect x={34} y={110} width={34} height={2} fill="#222222" />

      {/* workbench */}
      <rect x={75} y={108} width={62} height={4} fill="var(--ega-brown)" />
      <rect x={75} y={108} width={62} height={1} fill="#cc7722" />
      <rect x={77} y={112} width={3} height={18} fill="var(--ega-brown)" />
      <rect x={132} y={112} width={3} height={18} fill="var(--ega-brown)" />

      {/* erlenmeyer flask — green */}
      <rect x={86} y={104} width={2} height={4} fill="#222" />
      <polygon points="83,108 92,108 90,103 86,103" fill="#222" />
      <polygon points="84,107 91,107 89,104 87,104" fill="var(--ega-lgreen)" />

      {/* round-bottom flask — red */}
      <rect x={102} y={102} width={2} height={4} fill="#222" />
      <circle cx={103} cy={108} r={3.5} fill="#222" />
      <circle cx={103} cy={108} r={2.5} fill="var(--ega-lred)" />

      {/* small beaker — blue */}
      <rect x={116} y={104} width={6} height={5} fill="#222" />
      <rect x={117} y={105} width={4} height={3} fill="var(--ega-lblue)" />
      <rect x={116} y={104} width={6} height={1} fill="#444" />

      {/* tall test tube — yellow */}
      <rect x={126} y={102} width={3} height={7} fill="#222" />
      <rect x={127} y={103} width={1} height={5} fill="var(--ega-yellow)" />

      {/* brain in jar */}
      <rect x={142} y={84} width={28} height={4} fill="#888888" />
      <rect x={144} y={86} width={24} height={2} fill="#aaaaaa" />
      <rect x={144} y={88} width={24} height={40} fill="#001a00" />
      <rect x={145} y={89} width={22} height={38} fill="var(--ega-green)" opacity={0.55} />
      <rect x={144} y={88} width={24} height={40} fill="none" stroke="#aaaaaa" strokeWidth={1} />
      {/* brain blob */}
      <rect x={150} y={102} width={12} height={2} fill="var(--ega-lmagenta)" />
      <rect x={148} y={104} width={16} height={8} fill="var(--ega-lmagenta)" />
      <rect x={150} y={112} width={12} height={2} fill="var(--ega-lmagenta)" />
      {/* brain folds */}
      <rect x={150} y={106} width={12} height={1} fill="var(--ega-magenta)" />
      <rect x={152} y={109} width={8} height={1} fill="var(--ega-magenta)" />
      <rect x={155} y={104} width={1} height={6} fill="var(--ega-magenta)" />

      {/* danger switch */}
      <rect x={199} y={66} width={14} height={22} fill="#000000" />
      <rect x={201} y={68} width={10} height={18} fill="var(--ega-red)" />
      <rect x={203} y={70} width={6} height={3} fill="var(--ega-yellow)" />
      <rect x={205} y={73} width={2} height={6} fill="#222222" />
      {/* DANGER label */}
      <rect x={199} y={88} width={14} height={4} fill="var(--ega-yellow)" />
      <rect x={200} y={89} width={1} height={2} fill="#000" />
      <rect x={202} y={89} width={1} height={2} fill="#000" />
      <rect x={204} y={89} width={1} height={2} fill="#000" />
      <rect x={206} y={89} width={1} height={2} fill="#000" />
      <rect x={208} y={89} width={1} height={2} fill="#000" />
      <rect x={210} y={89} width={1} height={2} fill="#000" />
    </>
  );
}
