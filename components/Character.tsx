"use client";

const NERD_BODY = [
  "....HHHH....", //  0  hair top
  "...HHHHHH...", //  1
  "..HHHHHHHH..", //  2
  "..HSSSSSSH..", //  3  forehead (S=skin)
  "..HSSSSSSH..", //  4
  "..FFFFFFFF..", //  5  glasses frame top
  "..FLLFFLLF..", //  6  lenses
  "..FWLFFWLF..", //  7  pupils on outer edge
  "..FFFFFFFF..", //  8
  "...SSSSSS...", //  9  nose/cheeks
  "...SMMMMS...", // 10  mouth
  "..CCCCCCCC..", // 11  collar
  ".CCCCCCCCCC.", // 12  shoulders
  ".CCKCCCCCCC.", // 13  pocket protector
  ".CCKCCCCCCC.", // 14
  ".CCCCCCCCCC.", // 15
  ".CCCCCCCCCC.", // 16
  "..PPPPPPPP..", // 17  belt
];

const LEGS_IDLE = [
  "..PP....PP..",
  "..PP....PP..",
  "..BB....BB..",
];

const LEGS_STEP = [
  "..PPPPPPPP..",
  "...PPPPPP...",
  "...BBBBBB...",
];

const SPRITE_W = 12;
const SPRITE_H = NERD_BODY.length + LEGS_IDLE.length;

const COLORS: Record<string, string> = {
  H: "#aa5500",   // hair (EGA brown)
  S: "#ffbb99",   // skin
  F: "#000000",   // glasses frame
  L: "#ffffff",   // lens
  W: "#0000aa",   // pupil
  M: "#aa0000",   // mouth
  C: "#5555ff",   // shirt (light blue)
  K: "#ffffff",   // pocket protector
  P: "#555555",   // pants (dark gray)
  B: "#000000",   // shoes
};

type Props = {
  x: number;        // foot center x in viewBox units
  y: number;        // foot y (bottom of sprite)
  direction: "left" | "right";
  walkFrame: 0 | 1;
};

export default function Character({ x, y, direction, walkFrame }: Props) {
  const legs = walkFrame === 0 ? LEGS_IDLE : LEGS_STEP;
  const rows = [...NERD_BODY, ...legs];

  const ox = x - SPRITE_W / 2;
  const oy = y - SPRITE_H;
  const flipTransform =
    direction === "left" ? ` translate(${SPRITE_W}, 0) scale(-1, 1)` : "";

  return (
    <g transform={`translate(${ox}, ${oy})${flipTransform}`}>
      {rows.flatMap((row, ry) =>
        row.split("").map((ch, rx) => {
          const c = COLORS[ch];
          if (!c) return null;
          return (
            <rect
              key={`${rx}-${ry}`}
              x={rx}
              y={ry}
              width={1}
              height={1}
              fill={c}
            />
          );
        }),
      )}
    </g>
  );
}
