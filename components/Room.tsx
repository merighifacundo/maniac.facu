"use client";

import Character from "./Character";
import KitchenScene from "./scenes/KitchenScene";
import LabScene from "./scenes/LabScene";
import type { RoomId, RoomObject } from "@/lib/scenes";

type Props = {
  roomId: RoomId;
  objects: RoomObject[];
  doorOpen: boolean;
  showKey: boolean;
  lightsOn: boolean;
  message: string;
  charX: number;
  charDirection: "left" | "right";
  walkFrame: 0 | 1;
  transitioning: boolean;
  onObjectClick: (obj: RoomObject) => void;
  onObjectHover: (id: string | null) => void;
  onFloorClick: (x: number) => void;
};

const VW = 320;
const VH = 160;
const FOOT_Y = 158;

export default function Room({
  roomId,
  objects,
  doorOpen,
  showKey,
  lightsOn,
  message,
  charX,
  charDirection,
  walkFrame,
  transitioning,
  onObjectClick,
  onObjectHover,
  onFloorClick,
}: Props) {
  function handleSvgClick(e: React.MouseEvent<SVGSVGElement>) {
    if (transitioning) return;
    const svg = e.currentTarget;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const ctm = svg.getScreenCTM();
    if (!ctm) return;
    const local = pt.matrixTransform(ctm.inverse());
    onFloorClick(local.x);
  }

  return (
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
        onClick={handleSvgClick}
        style={{
          width: "100%",
          height: "100%",
          display: "block",
          shapeRendering: "crispEdges",
          cursor: "pointer",
        }}
      >
        {roomId === "kitchen" && <KitchenScene doorOpen={doorOpen} showKey={showKey} />}
        {roomId === "lab" && <LabScene lightsOn={lightsOn} />}

        {/* character */}
        <Character x={charX} y={FOOT_Y} direction={charDirection} walkFrame={walkFrame} />

        {/* hotspots */}
        {objects.map((o) => (
          <rect
            key={o.id}
            x={o.x}
            y={o.y}
            width={o.w}
            height={o.h}
            fill="transparent"
            style={{ cursor: "pointer" }}
            onClick={(e) => {
              e.stopPropagation();
              onObjectClick(o);
            }}
            onMouseEnter={() => onObjectHover(o.id)}
            onMouseLeave={() => onObjectHover(null)}
          />
        ))}
      </svg>

      {message && (
        <div
          style={{
            position: "absolute",
            top: 6,
            left: 0,
            right: 0,
            textAlign: "center",
            color: "var(--ega-white)",
            textShadow: "1px 1px 0 var(--ega-black)",
            fontSize: 8,
            pointerEvents: "none",
          }}
        >
          {message}
        </div>
      )}

      {/* fade overlay for room transitions */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "var(--ega-black)",
          opacity: transitioning ? 1 : 0,
          transition: "opacity 220ms",
          pointerEvents: "none",
        }}
      />
    </div>
  );
}
