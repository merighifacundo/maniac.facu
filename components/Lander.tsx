"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const VW = 320;
const VH = 200;

const GRAVITY = 0.011;
const THRUST = 0.04;
const SIDE_THRUST = 0.025;
const TICK_MS = 30;
const MAX_FUEL = 1000;
const SAFE_VY = 1.6;
const SAFE_VX = 0.7;

const GROUND_Y = 178;
const PAD_X = 130;
const PAD_W = 60;
const ROCKET_HALF_H = 11;

type Status = "playing" | "landed" | "crashed";

type GameState = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  fuel: number;
  status: Status;
  thrust: boolean;
  side: -1 | 0 | 1;
  flameFrame: number;
};

const initial = (): GameState => ({
  x: 50,
  y: 20,
  vx: 0.5,
  vy: 0,
  fuel: MAX_FUEL,
  status: "playing",
  thrust: false,
  side: 0,
  flameFrame: 0,
});

export default function Lander() {
  const stateRef = useRef<GameState>(initial());
  const [, setTick] = useState(0);
  const keysRef = useRef({ up: false, left: false, right: false });

  const reset = useCallback(() => {
    stateRef.current = initial();
    setTick((t) => t + 1);
  }, []);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "ArrowUp" || e.key === " ") {
        keysRef.current.up = true;
        e.preventDefault();
      } else if (e.key === "ArrowLeft") {
        keysRef.current.left = true;
      } else if (e.key === "ArrowRight") {
        keysRef.current.right = true;
      } else if (e.key === "r" || e.key === "R") {
        reset();
      }
    };
    const up = (e: KeyboardEvent) => {
      if (e.key === "ArrowUp" || e.key === " ") keysRef.current.up = false;
      else if (e.key === "ArrowLeft") keysRef.current.left = false;
      else if (e.key === "ArrowRight") keysRef.current.right = false;
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, [reset]);

  useEffect(() => {
    const id = setInterval(() => {
      const s = stateRef.current;
      if (s.status !== "playing") return;
      const k = keysRef.current;
      const wantThrust = k.up && s.fuel > 0;
      const wantSide: -1 | 0 | 1 = k.left && !k.right ? -1 : k.right && !k.left ? 1 : 0;
      const usingSide = wantSide !== 0 && s.fuel > 0;

      const ay = GRAVITY - (wantThrust ? THRUST : 0);
      const ax = usingSide ? wantSide * SIDE_THRUST : 0;

      let nvx = s.vx + ax;
      let nvy = s.vy + ay;
      let nx = s.x + nvx;
      let ny = s.y + nvy;

      if (nx < 6) {
        nx = 6;
        nvx = Math.abs(nvx) * 0.3;
      }
      if (nx > VW - 6) {
        nx = VW - 6;
        nvx = -Math.abs(nvx) * 0.3;
      }
      if (ny < 8) {
        ny = 8;
        nvy = Math.max(0, nvy);
      }

      let fuel = s.fuel;
      if (wantThrust) fuel -= 1.4;
      if (usingSide) fuel -= 0.7;
      if (fuel < 0) fuel = 0;

      let status: Status = "playing";
      const bottom = ny + ROCKET_HALF_H;
      if (bottom >= GROUND_Y) {
        ny = GROUND_Y - ROCKET_HALF_H;
        const padLeft = PAD_X + 6;
        const padRight = PAD_X + PAD_W - 6;
        const onPad = nx >= padLeft && nx <= padRight;
        const soft = Math.abs(nvy) <= SAFE_VY && Math.abs(nvx) <= SAFE_VX;
        status = onPad && soft ? "landed" : "crashed";
        nvx = 0;
        nvy = 0;
      }

      stateRef.current = {
        x: nx,
        y: ny,
        vx: nvx,
        vy: nvy,
        fuel,
        status,
        thrust: wantThrust,
        side: wantSide,
        flameFrame: (s.flameFrame + 1) % 2,
      };
      setTick((t) => t + 1);
    }, TICK_MS);
    return () => clearInterval(id);
  }, []);

  const s = stateRef.current;
  const fuelPct = Math.max(0, Math.min(100, (s.fuel / MAX_FUEL) * 100));

  const touchHandlers = (key: "up" | "left" | "right") => ({
    onPointerDown: (e: React.PointerEvent) => {
      e.preventDefault();
      (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
      keysRef.current[key] = true;
    },
    onPointerUp: (e: React.PointerEvent) => {
      e.preventDefault();
      keysRef.current[key] = false;
    },
    onPointerLeave: () => {
      keysRef.current[key] = false;
    },
    onPointerCancel: () => {
      keysRef.current[key] = false;
    },
  });

  return (
    <main
      style={{
        maxWidth: 720,
        margin: "0 auto",
        padding: 16,
        display: "flex",
        flexDirection: "column",
        gap: 8,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          color: "var(--ega-yellow)",
          fontSize: 8,
          letterSpacing: 1,
        }}
      >
        <a href="/" style={{ color: "var(--ega-lcyan)", textDecoration: "none" }}>
          {"<"} BACK
        </a>
        <span>MOON LANDER</span>
        <span style={{ color: "var(--ega-lgray)" }}>PRESS R TO RESET</span>
      </div>

      <div
        style={{
          position: "relative",
          width: "100%",
          aspectRatio: `${VW} / ${VH}`,
          background: "var(--ega-black)",
          border: "2px solid var(--ega-lgray)",
          overflow: "hidden",
        }}
      >
        <svg
          viewBox={`0 0 ${VW} ${VH}`}
          preserveAspectRatio="xMidYMid meet"
          style={{
            width: "100%",
            height: "100%",
            display: "block",
            shapeRendering: "crispEdges",
          }}
        >
          <Stars />

          {/* Earth in distance */}
          <circle cx={42} cy={32} r={9} fill="#0000aa" />
          <circle cx={39} cy={29} r={3} fill="#00aaaa" />
          <circle cx={45} cy={34} r={2} fill="#55ff55" />

          {/* Mountains */}
          <polygon
            points={`0,${GROUND_Y} 40,${GROUND_Y - 18} 70,${GROUND_Y - 10} 110,${GROUND_Y - 22} 150,${GROUND_Y - 8} 180,${GROUND_Y - 16} 220,${GROUND_Y - 6} 260,${GROUND_Y - 20} 300,${GROUND_Y - 10} 320,${GROUND_Y}`}
            fill="#555555"
          />

          {/* Ground */}
          <rect x={0} y={GROUND_Y} width={VW} height={VH - GROUND_Y} fill="#aaaaaa" />

          {/* Craters */}
          <ellipse cx={70} cy={GROUND_Y + 6} rx={10} ry={3} fill="#555555" />
          <ellipse cx={70} cy={GROUND_Y + 5} rx={6} ry={1} fill="#ffffff" opacity={0.3} />
          <ellipse cx={240} cy={GROUND_Y + 8} rx={14} ry={4} fill="#555555" />
          <ellipse cx={240} cy={GROUND_Y + 6} rx={8} ry={1} fill="#ffffff" opacity={0.3} />
          <ellipse cx={300} cy={GROUND_Y + 4} rx={6} ry={2} fill="#555555" />

          {/* Landing pad */}
          <rect x={PAD_X} y={GROUND_Y - 2} width={PAD_W} height={4} fill="#ffff55" />
          <rect x={PAD_X} y={GROUND_Y - 2} width={PAD_W} height={1} fill="#ffffff" />
          {Array.from({ length: 6 }).map((_, i) => (
            <rect
              key={i}
              x={PAD_X + 4 + i * 10}
              y={GROUND_Y + 2}
              width={2}
              height={4}
              fill="#555555"
            />
          ))}
          {/* Flag */}
          <line
            x1={PAD_X + PAD_W - 4}
            y1={GROUND_Y - 12}
            x2={PAD_X + PAD_W - 4}
            y2={GROUND_Y - 2}
            stroke="#aaaaaa"
            strokeWidth={1}
          />
          <polygon
            points={`${PAD_X + PAD_W - 4},${GROUND_Y - 12} ${PAD_X + PAD_W + 2},${GROUND_Y - 10} ${PAD_X + PAD_W - 4},${GROUND_Y - 8}`}
            fill="#aa0000"
          />

          {/* Rocket */}
          <g transform={`translate(${s.x}, ${s.y})`}>
            <Rocket
              thrust={s.thrust}
              side={s.side}
              flameFrame={s.flameFrame}
              crashed={s.status === "crashed"}
            />
          </g>
        </svg>

        {/* HUD */}
        <div
          style={{
            position: "absolute",
            top: 6,
            left: 6,
            display: "flex",
            flexDirection: "column",
            gap: 2,
            fontSize: 8,
            color: "var(--ega-white)",
            pointerEvents: "none",
          }}
        >
          <div>
            FUEL{" "}
            <span style={{ color: fuelPct < 25 ? "var(--ega-lred)" : "var(--ega-lgreen)" }}>
              {Math.round(fuelPct)}%
            </span>
          </div>
          <div>
            V-SPD{" "}
            <span style={{ color: Math.abs(s.vy) > SAFE_VY ? "var(--ega-lred)" : "var(--ega-lgreen)" }}>
              {s.vy.toFixed(1)}
            </span>
          </div>
          <div>
            H-SPD{" "}
            <span style={{ color: Math.abs(s.vx) > SAFE_VX ? "var(--ega-lred)" : "var(--ega-lgreen)" }}>
              {s.vx.toFixed(1)}
            </span>
          </div>
        </div>

        {s.status !== "playing" && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              background: "rgba(0,0,0,0.65)",
              color: s.status === "landed" ? "var(--ega-lgreen)" : "var(--ega-lred)",
            }}
          >
            <div style={{ fontSize: 18, letterSpacing: 2 }}>
              {s.status === "landed" ? "LANDED!" : "CRASHED!"}
            </div>
            <div style={{ fontSize: 8, color: "var(--ega-white)" }}>
              {s.status === "landed" ? "Nice piloting!" : "Try again!"}
            </div>
            <button
              onClick={reset}
              style={{
                marginTop: 6,
                padding: "8px 16px",
                border: "2px solid var(--ega-lgray)",
                color: "var(--ega-yellow)",
                fontSize: 10,
                background: "var(--ega-black)",
              }}
            >
              PLAY AGAIN
            </button>
          </div>
        )}
      </div>

      {/* Touch controls */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 2fr 1fr",
          gap: 8,
          marginTop: 4,
        }}
      >
        <button {...touchHandlers("left")} style={btnStyle} aria-label="Left">
          {"<"}
        </button>
        <button
          {...touchHandlers("up")}
          style={{ ...btnStyle, color: "var(--ega-yellow)" }}
          aria-label="Thrust"
        >
          THRUST
        </button>
        <button {...touchHandlers("right")} style={btnStyle} aria-label="Right">
          {">"}
        </button>
      </div>

      <div style={{ color: "var(--ega-lgray)", fontSize: 8, textAlign: "center" }}>
        ARROW KEYS or buttons. Land softly on the yellow pad.
      </div>
    </main>
  );
}

const btnStyle: React.CSSProperties = {
  padding: 14,
  border: "2px solid var(--ega-lgray)",
  color: "var(--ega-lgreen)",
  fontSize: 12,
  touchAction: "none",
  userSelect: "none",
  background: "var(--ega-black)",
};

function Stars() {
  const stars: Array<[number, number]> = [
    [12, 12], [28, 40], [52, 22], [80, 8], [100, 56], [120, 20],
    [140, 44], [160, 14], [180, 60], [200, 30], [220, 18], [240, 50],
    [260, 36], [280, 12], [296, 48], [304, 24], [60, 80], [200, 90],
    [16, 70], [276, 78], [148, 100], [40, 110], [260, 100], [88, 26],
    [172, 76], [232, 8], [108, 130], [292, 90],
  ];
  return (
    <g>
      {stars.map(([x, y], i) => (
        <rect
          key={i}
          x={x}
          y={y}
          width={1}
          height={1}
          fill={i % 5 === 0 ? "#ffff55" : "#ffffff"}
        />
      ))}
    </g>
  );
}

function Rocket({
  thrust,
  side,
  flameFrame,
  crashed,
}: {
  thrust: boolean;
  side: -1 | 0 | 1;
  flameFrame: number;
  crashed: boolean;
}) {
  if (crashed) {
    return (
      <g>
        <polygon points="-7,4 -3,-3 0,4 3,-2 6,4" fill="#aa0000" />
        <polygon points="-4,-2 -1,-5 1,-2 3,-4" fill="#ffff55" />
        <rect x={-2} y={2} width={4} height={2} fill="#555555" />
      </g>
    );
  }
  return (
    <g>
      <polygon points="0,-11 -3,-7 3,-7" fill="#ff5555" />
      <rect x={-4} y={-7} width={8} height={12} fill="#aaaaaa" />
      <rect x={-4} y={-7} width={1} height={12} fill="#ffffff" />
      <rect x={3} y={-7} width={1} height={12} fill="#555555" />
      <rect x={-2} y={-4} width={4} height={3} fill="#00aaaa" />
      <rect x={-2} y={-4} width={4} height={1} fill="#55ffff" />
      <polygon points="-4,2 -7,7 -4,7" fill="#aa0000" />
      <polygon points="4,2 7,7 4,7" fill="#aa0000" />
      <rect x={-3} y={5} width={6} height={2} fill="#555555" />
      {thrust && (
        <g>
          <polygon points={`-3,7 0,${11 + flameFrame * 2} 3,7`} fill="#ffff55" />
          <polygon points={`-2,7 0,${9 + flameFrame} 2,7`} fill="#ff5555" />
        </g>
      )}
      {side === 1 && <polygon points="-4,-1 -8,1 -4,3" fill="#ffff55" />}
      {side === -1 && <polygon points="4,-1 8,1 4,3" fill="#ffff55" />}
    </g>
  );
}
