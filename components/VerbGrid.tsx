"use client";

export type Verb =
  | "Give"
  | "Pick up"
  | "Use"
  | "Open"
  | "Look at"
  | "Push"
  | "Close"
  | "Talk to"
  | "Pull"
  | "Walk to";

const VERBS: Verb[] = [
  "Give", "Pick up", "Use",
  "Open", "Look at", "Push",
  "Close", "Talk to", "Pull",
];

type Props = {
  active: Verb;
  onPick: (v: Verb) => void;
};

export default function VerbGrid({ active, onPick }: Props) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: 4,
        padding: 6,
        background: "var(--ega-black)",
        border: "2px solid var(--ega-lgray)",
      }}
    >
      {VERBS.map((v) => (
        <button
          key={v}
          onClick={() => onPick(v)}
          style={{
            padding: "8px 4px",
            color: active === v ? "var(--ega-white)" : "var(--ega-lgreen)",
            background: active === v ? "var(--ega-dgray)" : "transparent",
            border: "1px solid transparent",
            fontSize: 9,
            textAlign: "left",
          }}
          onMouseEnter={(e) => {
            if (active !== v) e.currentTarget.style.color = "var(--ega-white)";
          }}
          onMouseLeave={(e) => {
            if (active !== v) e.currentTarget.style.color = "var(--ega-lgreen)";
          }}
        >
          {v}
        </button>
      ))}
    </div>
  );
}
