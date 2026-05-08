"use client";

type Props = {
  doorOpen: boolean;
  showKey: boolean;
};

export default function KitchenScene({ doorOpen, showKey }: Props) {
  return (
    <>
      {/* back wall */}
      <rect x={0} y={0} width={320} height={130} fill="var(--ega-brown)" />
      <rect x={0} y={126} width={320} height={4} fill="var(--ega-dgray)" />
      {/* floor */}
      <rect x={0} y={130} width={320} height={30} fill="var(--ega-dgray)" />
      {Array.from({ length: 8 }).map((_, i) => (
        <line
          key={i}
          x1={i * 40}
          y1={130}
          x2={i * 40}
          y2={160}
          stroke="var(--ega-black)"
          strokeWidth={1}
        />
      ))}

      {/* door frame */}
      <rect x={28} y={34} width={32} height={74} fill="var(--ega-black)" />
      {doorOpen ? (
        <rect x={30} y={36} width={6} height={70} fill="var(--ega-red)" />
      ) : (
        <>
          <rect x={30} y={36} width={28} height={70} fill="var(--ega-red)" />
          <circle cx={52} cy={72} r={1.5} fill="var(--ega-yellow)" />
        </>
      )}

      {/* window */}
      <rect x={220} y={40} width={50} height={40} fill="var(--ega-blue)" />
      <rect x={220} y={40} width={50} height={40} fill="none" stroke="var(--ega-lgray)" strokeWidth={2} />
      <line x1={245} y1={40} x2={245} y2={80} stroke="var(--ega-lgray)" strokeWidth={1} />
      <line x1={220} y1={60} x2={270} y2={60} stroke="var(--ega-lgray)" strokeWidth={1} />

      {/* rug */}
      <rect x={110} y={148} width={90} height={8} fill="var(--ega-magenta)" />
      <rect x={114} y={150} width={82} height={4} fill="var(--ega-lmagenta)" />

      {/* key */}
      {showKey && (
        <g>
          <rect x={180} y={140} width={6} height={2} fill="var(--ega-yellow)" />
          <rect x={186} y={139} width={4} height={4} fill="var(--ega-yellow)" />
          <rect x={187} y={140} width={2} height={2} fill="var(--ega-brown)" />
        </g>
      )}
    </>
  );
}
