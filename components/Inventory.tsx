"use client";

type Props = {
  items: string[];
  onClick: (id: string) => void;
};

export default function Inventory({ items, onClick }: Props) {
  const slots = Array.from({ length: 8 }, (_, i) => items[i] ?? null);

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gridAutoRows: "1fr",
        gap: 4,
        padding: 6,
        background: "var(--ega-black)",
        border: "2px solid var(--ega-lgray)",
        minHeight: 110,
      }}
    >
      {slots.map((id, i) => (
        <button
          key={i}
          onClick={() => id && onClick(id)}
          disabled={!id}
          style={{
            border: "1px solid var(--ega-dgray)",
            background: "var(--ega-black)",
            color: "var(--ega-yellow)",
            fontSize: 8,
            padding: 4,
            cursor: id ? "pointer" : "default",
          }}
        >
          {id ?? ""}
        </button>
      ))}
    </div>
  );
}
