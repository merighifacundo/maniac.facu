"use client";

type Props = {
  verb: string;
  targetName: string | null;
};

export default function Sentence({ verb, targetName }: Props) {
  return (
    <div
      style={{
        textAlign: "center",
        padding: "6px 8px",
        color: "var(--ega-white)",
        background: "var(--ega-black)",
        border: "2px solid var(--ega-lgray)",
        fontSize: 12,
        letterSpacing: 1,
      }}
    >
      {verb}
      {targetName ? ` ${targetName}` : ""}
    </div>
  );
}
