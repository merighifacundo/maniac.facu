"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const VW = 320;
const VH = 180;

const GROUND_Y = 138;
const SHORE_END = 78;
const LAKE_END = 316;
const GRAVITY = 0.22;
const THROW_ANGLE_DEG = 58;
const POWER_MIN = 2.6;
const POWER_MAX = 6.4;

const PRINCE_RED_X = 36;
const PRINCE_BLUE_X = 62;
const HAND_Y = 118;
const TICK_MS = 30;
const INTRO_FRAME_MS = 80;
const INTRO_AUDIO_SRC = "/audio/princes-intro.m4a";

type Phase = "intro" | "p1-aim" | "p1-throw" | "p2-aim" | "p2-throw" | "result";
type Rock = { x: number; y: number; vx: number; vy: number };
type Splash = { x: number; framesLeft: number; player: 1 | 2 };

export default function Princes() {
  const [phase, setPhase] = useState<Phase>("intro");
  const [power, setPower] = useState(0);
  const [meterRunning, setMeterRunning] = useState(false);
  const [rock, setRock] = useState<Rock | null>(null);
  const [splash, setSplash] = useState<Splash | null>(null);
  const [p1Dist, setP1Dist] = useState<number | null>(null);
  const [p2Dist, setP2Dist] = useState<number | null>(null);
  const [introFrame, setIntroFrame] = useState(0);
  const [introPlaying, setIntroPlaying] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const phaseRef = useRef(phase);
  const meterRunningRef = useRef(false);
  const meterDirRef = useRef<1 | -1>(1);
  const powerRef = useRef(0);
  const rockRef = useRef<Rock | null>(null);
  const splashRef = useRef<Splash | null>(null);
  const keyDownRef = useRef(false);

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);
  useEffect(() => {
    meterRunningRef.current = meterRunning;
  }, [meterRunning]);

  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setIntroPlaying(false);
  }, []);

  const reset = useCallback(() => {
    stopAudio();
    setPhase("intro");
    setPower(0);
    setMeterRunning(false);
    setRock(null);
    setSplash(null);
    setP1Dist(null);
    setP2Dist(null);
    setIntroFrame(0);
    powerRef.current = 0;
    rockRef.current = null;
    splashRef.current = null;
    meterDirRef.current = 1;
  }, [stopAudio]);

  const handlePress = useCallback(() => {
    const p = phaseRef.current;
    if (p === "intro") {
      if (audioRef.current) {
        stopAudio();
        setPhase("p1-aim");
        setMeterRunning(false);
        powerRef.current = 0;
        setPower(0);
        return;
      }
      const audio = new Audio(INTRO_AUDIO_SRC);
      audioRef.current = audio;
      setIntroPlaying(true);
      let finished = false;
      const finish = () => {
        if (finished) return;
        finished = true;
        if (audioRef.current === audio) audioRef.current = null;
        setIntroPlaying(false);
        setPhase("p1-aim");
        setMeterRunning(false);
        powerRef.current = 0;
        setPower(0);
      };
      audio.addEventListener("ended", finish);
      audio.addEventListener("error", finish);
      audio.play().catch(finish);
      return;
    }
    if (p === "p1-aim" || p === "p2-aim") {
      if (!meterRunningRef.current) {
        setMeterRunning(true);
        meterDirRef.current = 1;
        powerRef.current = 0;
        setPower(0);
      } else {
        setMeterRunning(false);
        const pwr = powerRef.current;
        const power01 = Math.max(0.08, pwr / 100);
        const speed = POWER_MIN + power01 * (POWER_MAX - POWER_MIN);
        const rad = (THROW_ANGLE_DEG * Math.PI) / 180;
        const vx = speed * Math.cos(rad);
        const vy = -speed * Math.sin(rad);
        const handX = p === "p1-aim" ? PRINCE_RED_X + 8 : PRINCE_BLUE_X + 8;
        const newRock: Rock = { x: handX, y: HAND_Y - 4, vx, vy };
        rockRef.current = newRock;
        setRock(newRock);
        setPhase(p === "p1-aim" ? "p1-throw" : "p2-throw");
      }
      return;
    }
    if (p === "result") {
      reset();
    }
  }, [reset, stopAudio]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key !== " " && e.key !== "Enter") return;
      e.preventDefault();
      if (keyDownRef.current) return;
      keyDownRef.current = true;
      handlePress();
    };
    const up = (e: KeyboardEvent) => {
      if (e.key !== " " && e.key !== "Enter") return;
      keyDownRef.current = false;
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, [handlePress]);

  useEffect(() => {
    if (phase !== "intro") return;
    const id = setInterval(() => {
      setIntroFrame((f) => (f + 1) % 100000);
    }, INTRO_FRAME_MS);
    return () => clearInterval(id);
  }, [phase]);

  useEffect(() => {
    if (phase !== "intro" && audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
      setIntroPlaying(false);
    }
  }, [phase]);

  useEffect(
    () => () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    },
    [],
  );

  useEffect(() => {
    const id = setInterval(() => {
      if (meterRunningRef.current) {
        let v = powerRef.current + meterDirRef.current * 3;
        if (v >= 100) {
          v = 100;
          meterDirRef.current = -1;
        }
        if (v <= 0) {
          v = 0;
          meterDirRef.current = 1;
        }
        powerRef.current = v;
        setPower(v);
      }

      const r = rockRef.current;
      const ph = phaseRef.current;
      if (r && (ph === "p1-throw" || ph === "p2-throw")) {
        const nvx = r.vx;
        const nvy = r.vy + GRAVITY;
        const nx = r.x + nvx;
        const ny = r.y + nvy;
        if (ny >= GROUND_Y || nx >= LAKE_END) {
          const landX = Math.min(Math.max(nx, SHORE_END), LAKE_END);
          const player = ph === "p1-throw" ? 1 : 2;
          const ns: Splash = { x: landX, framesLeft: 16, player };
          splashRef.current = ns;
          setSplash(ns);
          rockRef.current = null;
          setRock(null);
        } else {
          const next = { x: nx, y: ny, vx: nvx, vy: nvy };
          rockRef.current = next;
          setRock(next);
        }
      }

      const s = splashRef.current;
      if (s) {
        const next = s.framesLeft - 1;
        if (next <= 0) {
          const player = s.player;
          const baseX = player === 1 ? PRINCE_RED_X + 8 : PRINCE_BLUE_X + 8;
          const dist = Math.max(0, Math.round(s.x - baseX));
          splashRef.current = null;
          setSplash(null);
          powerRef.current = 0;
          setPower(0);
          if (player === 1) {
            setP1Dist(dist);
            setPhase("p2-aim");
          } else {
            setP2Dist(dist);
            setPhase("result");
          }
        } else {
          const ns = { ...s, framesLeft: next };
          splashRef.current = ns;
          setSplash(ns);
        }
      }
    }, TICK_MS);
    return () => clearInterval(id);
  }, []);

  const activePlayer: 1 | 2 | null =
    phase === "p1-aim" || phase === "p1-throw"
      ? 1
      : phase === "p2-aim" || phase === "p2-throw"
        ? 2
        : null;

  const meterActive =
    phase === "p1-aim" || phase === "p2-aim" || phase === "p1-throw" || phase === "p2-throw";

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
        <span>TWO PRINCES</span>
        <span style={{ color: "var(--ega-lgray)" }}>SPACE</span>
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
          <rect x={0} y={0} width={VW} height={VH} fill="#5555ff" />
          <circle cx={250} cy={28} r={10} fill="#ffff55" />
          <rect x={40} y={20} width={6} height={2} fill="#ffffff" opacity={0.6} />
          <rect x={36} y={22} width={3} height={1} fill="#ffffff" opacity={0.6} />
          <rect x={140} y={14} width={8} height={2} fill="#ffffff" opacity={0.6} />
          <rect x={146} y={16} width={4} height={1} fill="#ffffff" opacity={0.6} />

          {phase === "intro" ? (
            <IntroScene frame={introFrame} />
          ) : (
            <LakeScene p1Dist={p1Dist} p2Dist={p2Dist} />
          )}

          {phase !== "intro" && (
            <>
              <Prince
                x={PRINCE_RED_X}
                y={HAND_Y + 12}
                color="#aa0000"
                accent="#ff5555"
                active={activePlayer === 1}
                throwing={phase === "p1-throw"}
              />
              <Prince
                x={PRINCE_BLUE_X}
                y={HAND_Y + 12}
                color="#0000aa"
                accent="#5555ff"
                active={activePlayer === 2}
                throwing={phase === "p2-throw"}
              />

              {rock && (
                <g>
                  <circle cx={rock.x} cy={rock.y} r={2} fill="#aaaaaa" />
                  <rect x={rock.x - 1} y={rock.y - 1} width={1} height={1} fill="#ffffff" />
                </g>
              )}

              {splash && (
                <g>
                  <rect x={splash.x - 5} y={GROUND_Y - 4} width={1} height={3} fill="#ffffff" />
                  <rect x={splash.x + 4} y={GROUND_Y - 3} width={1} height={2} fill="#ffffff" />
                  <rect x={splash.x - 7} y={GROUND_Y - 2} width={1} height={2} fill="#55ffff" />
                  <rect x={splash.x + 6} y={GROUND_Y - 2} width={1} height={2} fill="#55ffff" />
                  <ellipse cx={splash.x} cy={GROUND_Y} rx={7} ry={1.2} fill="#ffffff" opacity={0.7} />
                </g>
              )}
            </>
          )}
        </svg>

        {phase === "intro" && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-end",
              alignItems: "center",
              padding: 12,
              gap: 4,
              color: "var(--ega-white)",
              background: "linear-gradient(to top, rgba(0,0,0,0.75) 30%, transparent 80%)",
              pointerEvents: "none",
            }}
          >
            <div
              style={{
                color: "var(--ega-yellow)",
                fontSize: 12,
                letterSpacing: 2,
                marginBottom: 6,
              }}
            >
              TWO PRINCES
            </div>
            <div style={{ fontSize: 8, lineHeight: 1.7, textAlign: "center" }}>
              In a kingdom by a lake, two princes fought for the throne.
              <br />
              The king decreed:
              <br />
              <span style={{ color: "var(--ega-yellow)" }}>
                whoever throws a stone farthest into the lake shall be king.
              </span>
            </div>
            <div
              style={{
                color: introPlaying ? "var(--ega-yellow)" : "var(--ega-lgreen)",
                fontSize: 8,
                marginTop: 8,
              }}
            >
              {introPlaying ? "(PLAYING TALE — SPACE TO SKIP)" : "PRESS SPACE TO BEGIN"}
            </div>
          </div>
        )}

        {(phase === "p1-aim" || phase === "p2-aim") && (
          <div
            style={{
              position: "absolute",
              top: 6,
              left: 0,
              right: 0,
              textAlign: "center",
              fontSize: 8,
              color: phase === "p1-aim" ? "var(--ega-lred)" : "var(--ega-lcyan)",
              pointerEvents: "none",
            }}
          >
            {phase === "p1-aim" ? "RED PRINCE" : "BLUE PRINCE"} —{" "}
            {meterRunning ? "PRESS SPACE TO THROW" : "PRESS SPACE TO CHARGE"}
          </div>
        )}

        {phase === "result" && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              background: "rgba(0,0,0,0.75)",
            }}
          >
            {(() => {
              const r1 = p1Dist ?? 0;
              const r2 = p2Dist ?? 0;
              const winner = r1 === r2 ? "tie" : r1 > r2 ? "red" : "blue";
              const text =
                winner === "tie"
                  ? "IT'S A TIE!"
                  : winner === "red"
                    ? "THE RED PRINCE IS KING!"
                    : "THE BLUE PRINCE IS KING!";
              const color =
                winner === "red"
                  ? "var(--ega-lred)"
                  : winner === "blue"
                    ? "var(--ega-lcyan)"
                    : "var(--ega-yellow)";
              return (
                <>
                  <div
                    style={{
                      fontSize: 12,
                      color,
                      letterSpacing: 2,
                      textAlign: "center",
                      padding: "0 12px",
                    }}
                  >
                    {text}
                  </div>
                  <div style={{ fontSize: 8, color: "var(--ega-white)" }}>
                    RED {r1} paces · BLUE {r2} paces
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
                </>
              );
            })()}
          </div>
        )}
      </div>

      <div
        style={{
          height: 16,
          border: "2px solid var(--ega-lgray)",
          position: "relative",
          background: "var(--ega-black)",
          opacity: meterActive ? 1 : 0.35,
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: `${power}%`,
            background:
              power > 80
                ? "var(--ega-lred)"
                : power > 50
                  ? "var(--ega-yellow)"
                  : "var(--ega-lgreen)",
            transition: "background 80ms",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 8,
            color: "var(--ega-white)",
            textShadow: "1px 1px 0 #000",
          }}
        >
          POWER {Math.round(power)}
        </div>
      </div>

      <div style={{ color: "var(--ega-lgray)", fontSize: 8, textAlign: "center" }}>
        SPACE to start the meter, press again to throw.
      </div>
    </main>
  );
}

function IntroScene({ frame }: { frame: number }) {
  const cloud1X = ((frame * 0.6) % 380) - 40;
  const cloud2X = ((frame * 0.4 + 220) % 380) - 40;
  const cloud3X = ((frame * 0.5 + 110) % 380) - 40;
  const flagFrame = Math.floor(frame / 4) % 2;
  const bobA = Math.floor(frame / 6) % 2 === 0 ? 0 : -1;
  const bobB = Math.floor((frame + 3) / 6) % 2 === 0 ? 0 : -1;
  const sunPulse = Math.floor(frame / 10) % 2;

  return (
    <g>
      <Cloud x={cloud1X} y={22} />
      <Cloud x={cloud2X} y={42} />
      <Cloud x={cloud3X} y={12} />

      {sunPulse === 1 && (
        <g opacity={0.5}>
          <rect x={234} y={28} width={2} height={1} fill="#ffff55" />
          <rect x={264} y={28} width={2} height={1} fill="#ffff55" />
          <rect x={249} y={14} width={1} height={2} fill="#ffff55" />
          <rect x={249} y={42} width={1} height={2} fill="#ffff55" />
        </g>
      )}

      <polygon points={`180,140 250,30 320,140`} fill="#555555" />
      <polygon points={`200,80 250,30 260,50 250,55 240,70 220,75`} fill="#aaaaaa" opacity={0.4} />
      <polygon points={`230,55 250,30 270,55`} fill="#ffffff" />
      <polygon points={`140,140 180,70 220,140`} fill="#3a3a4a" />
      <polygon points={`170,82 180,70 190,82`} fill="#aaaaaa" />

      <rect x={0} y={140} width={VW} height={VH - 140} fill="#00aa00" />
      <rect x={0} y={140} width={VW} height={1} fill="#55ff55" />
      <rect x={20} y={148} width={2} height={3} fill="#aa5500" />
      <rect x={80} y={152} width={2} height={3} fill="#aa5500" />
      <rect x={120} y={150} width={2} height={3} fill="#aa5500" />
      <rect x={170} y={154} width={2} height={3} fill="#aa5500" />

      <g transform="translate(20, 60)">
        <rect x={20} y={20} width={40} height={60} fill="#aaaaaa" />
        <rect x={20} y={20} width={40} height={2} fill="#ffffff" />
        <rect x={20} y={16} width={6} height={4} fill="#aaaaaa" />
        <rect x={30} y={16} width={6} height={4} fill="#aaaaaa" />
        <rect x={40} y={16} width={6} height={4} fill="#aaaaaa" />
        <rect x={50} y={16} width={6} height={4} fill="#aaaaaa" />

        <rect x={8} y={30} width={12} height={50} fill="#aaaaaa" />
        <rect x={6} y={26} width={2} height={4} fill="#aaaaaa" />
        <rect x={10} y={26} width={2} height={4} fill="#aaaaaa" />
        <rect x={14} y={26} width={2} height={4} fill="#aaaaaa" />
        <rect x={18} y={26} width={2} height={4} fill="#aaaaaa" />
        <rect x={60} y={30} width={12} height={50} fill="#aaaaaa" />
        <rect x={60} y={26} width={2} height={4} fill="#aaaaaa" />
        <rect x={64} y={26} width={2} height={4} fill="#aaaaaa" />
        <rect x={68} y={26} width={2} height={4} fill="#aaaaaa" />

        <rect x={32} y={32} width={4} height={6} fill="#0000aa" />
        <rect x={44} y={32} width={4} height={6} fill="#0000aa" />
        <rect x={32} y={46} width={4} height={6} fill="#0000aa" />
        <rect x={44} y={46} width={4} height={6} fill="#0000aa" />
        <rect x={11} y={40} width={3} height={5} fill="#0000aa" />
        <rect x={63} y={40} width={3} height={5} fill="#0000aa" />

        <rect x={36} y={60} width={8} height={20} fill="#5a3010" />
        <ellipse cx={40} cy={62} rx={4} ry={4} fill="#5a3010" />

        <line x1={40} y1={4} x2={40} y2={16} stroke="#ffffff" strokeWidth={1} />
        {flagFrame === 0 ? (
          <polygon points="40,4 50,8 40,12" fill="#aa0000" />
        ) : (
          <polygon points="40,4 52,6 49,9 52,11 40,12" fill="#aa0000" />
        )}
      </g>

      <TinyPrince x={104} y={140 + bobA} color="#aa0000" />
      <TinyPrince x={120} y={140 + bobB} color="#0000aa" />
    </g>
  );
}

function Cloud({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x}, ${y})`} opacity={0.85}>
      <rect x={2} y={1} width={12} height={3} fill="#ffffff" />
      <rect x={0} y={3} width={16} height={2} fill="#ffffff" />
      <rect x={4} y={0} width={6} height={1} fill="#ffffff" />
      <rect x={12} y={0} width={3} height={1} fill="#ffffff" />
    </g>
  );
}

function TinyPrince({ x, y, color }: { x: number; y: number; color: string }) {
  return (
    <g transform={`translate(${x}, ${y})`}>
      <rect x={1} y={-9} width={4} height={2} fill="#ffff55" />
      <rect x={1} y={-10} width={1} height={1} fill="#ffff55" />
      <rect x={3} y={-10} width={1} height={1} fill="#ffff55" />
      <rect x={1} y={-7} width={4} height={2} fill="#ffbb99" />
      <rect x={2} y={-6} width={1} height={1} fill="#000000" />
      <rect x={4} y={-6} width={1} height={1} fill="#000000" />
      <rect x={0} y={-5} width={6} height={4} fill={color} />
      <rect x={0} y={-3} width={6} height={1} fill="#aa5500" />
      <rect x={1} y={-1} width={1} height={1} fill="#5a3010" />
      <rect x={4} y={-1} width={1} height={1} fill="#5a3010" />
    </g>
  );
}

function LakeScene({ p1Dist, p2Dist }: { p1Dist: number | null; p2Dist: number | null }) {
  return (
    <g>
      <polygon points={`0,138 60,80 120,138`} fill="#555555" />
      <polygon points={`40,98 60,80 80,98`} fill="#ffffff" />
      <polygon points={`200,138 240,90 290,138`} fill="#3a3a4a" />
      <polygon points={`230,105 240,90 250,105`} fill="#ffffff" />

      <g transform="translate(140, 110)">
        <rect x={0} y={0} width={20} height={28} fill="#555555" />
        <rect x={0} y={0} width={20} height={1} fill="#aaaaaa" />
        <rect x={-2} y={-4} width={4} height={4} fill="#555555" />
        <rect x={18} y={-4} width={4} height={4} fill="#555555" />
        <rect x={8} y={-6} width={8} height={6} fill="#555555" />
        <line x1={12} y1={-10} x2={12} y2={-6} stroke="#ffffff" strokeWidth={1} />
        <polygon points="12,-10 17,-9 12,-7" fill="#aa0000" />
        <rect x={8} y={12} width={4} height={6} fill="#000000" />
        <rect x={3} y={6} width={2} height={3} fill="#ffff55" />
        <rect x={15} y={6} width={2} height={3} fill="#ffff55" />
      </g>

      <rect x={SHORE_END} y={GROUND_Y} width={LAKE_END - SHORE_END} height={VH - GROUND_Y} fill="#0000aa" />
      <rect x={SHORE_END} y={GROUND_Y} width={LAKE_END - SHORE_END} height={2} fill="#00aaaa" />
      {Array.from({ length: 8 }).map((_, i) => (
        <rect
          key={i}
          x={SHORE_END + 8 + i * 30}
          y={GROUND_Y + 6 + (i % 2) * 4}
          width={6}
          height={1}
          fill="#5555ff"
        />
      ))}
      {Array.from({ length: 5 }).map((_, i) => (
        <rect
          key={`w2-${i}`}
          x={SHORE_END + 24 + i * 50}
          y={GROUND_Y + 14 + (i % 2) * 3}
          width={4}
          height={1}
          fill="#5555ff"
        />
      ))}

      <rect x={0} y={GROUND_Y} width={SHORE_END} height={VH - GROUND_Y} fill="#aa5500" />
      <rect x={0} y={GROUND_Y} width={SHORE_END} height={2} fill="#00aa00" />
      <rect x={10} y={GROUND_Y + 4} width={2} height={2} fill="#555555" />
      <rect x={28} y={GROUND_Y + 8} width={3} height={2} fill="#555555" />
      <rect x={60} y={GROUND_Y + 6} width={2} height={2} fill="#555555" />

      {p1Dist !== null && (
        <g>
          <rect x={PRINCE_RED_X + 8 + p1Dist - 1} y={GROUND_Y - 4} width={2} height={6} fill="#ff5555" />
          <rect x={PRINCE_RED_X + 8 + p1Dist - 2} y={GROUND_Y - 6} width={4} height={2} fill="#aa0000" />
        </g>
      )}
      {p2Dist !== null && (
        <g>
          <rect x={PRINCE_BLUE_X + 8 + p2Dist - 1} y={GROUND_Y - 4} width={2} height={6} fill="#5555ff" />
          <rect x={PRINCE_BLUE_X + 8 + p2Dist - 2} y={GROUND_Y - 6} width={4} height={2} fill="#0000aa" />
        </g>
      )}
    </g>
  );
}

function Prince({
  x,
  y,
  color,
  accent,
  active,
  throwing,
}: {
  x: number;
  y: number;
  color: string;
  accent: string;
  active: boolean;
  throwing: boolean;
}) {
  return (
    <g transform={`translate(${x}, ${y - 24})`}>
      <rect x={-3} y={22} width={2} height={2} fill="#5a3010" />
      <rect x={1} y={22} width={2} height={2} fill="#5a3010" />

      <polygon points="-6,10 -5,2 5,2 6,10 6,22 -6,22" fill={color} />
      <rect x={-6} y={11} width={12} height={1} fill={accent} />
      <rect x={-6} y={9} width={12} height={2} fill="#aa5500" />
      <rect x={-1} y={5} width={2} height={4} fill="#ffff55" />

      <rect x={-3} y={-4} width={6} height={6} fill="#ffbb99" />
      <rect x={-2} y={-2} width={1} height={1} fill="#000000" />
      <rect x={1} y={-2} width={1} height={1} fill="#000000" />
      <rect x={-1} y={0} width={2} height={1} fill="#aa0000" />

      <rect x={-3} y={-7} width={6} height={2} fill="#ffff55" />
      <rect x={-3} y={-8} width={1} height={1} fill="#ffff55" />
      <rect x={-1} y={-8} width={1} height={1} fill="#ffff55" />
      <rect x={1} y={-8} width={1} height={1} fill="#ffff55" />
      <rect x={2} y={-9} width={1} height={1} fill="#ff5555" />

      {throwing ? (
        <>
          <rect x={3} y={-6} width={5} height={1} fill="#ffbb99" />
          <rect x={7} y={-7} width={1} height={1} fill="#ffbb99" />
        </>
      ) : (
        <rect x={4} y={3} width={1} height={5} fill="#ffbb99" />
      )}

      {active && <polygon points="0,-13 -2,-10 2,-10" fill="#ffff55" />}
    </g>
  );
}
