export type RoomId = "kitchen" | "lab";

export type Exit = {
  toRoom: RoomId;
  entryX: number;
  entryDirection: "left" | "right";
};

export type RoomObject = {
  id: string;
  name: string;
  x: number;
  y: number;
  w: number;
  h: number;
  takeable?: boolean;
  exit?: Exit;
};

export type Scene = {
  id: RoomId;
  name: string;
  objects: RoomObject[];
};

export const SCENES: Record<RoomId, Scene> = {
  kitchen: {
    id: "kitchen",
    name: "Kitchen",
    objects: [
      {
        id: "door",
        name: "door",
        x: 30,
        y: 36,
        w: 28,
        h: 70,
        exit: { toRoom: "lab", entryX: 250, entryDirection: "left" },
      },
      { id: "key", name: "key", x: 178, y: 137, w: 12, h: 8, takeable: true },
      { id: "window", name: "window", x: 220, y: 40, w: 50, h: 40 },
      { id: "rug", name: "rug", x: 110, y: 148, w: 90, h: 8 },
    ],
  },
  lab: {
    id: "lab",
    name: "Laboratory",
    objects: [
      {
        id: "door-back",
        name: "door",
        x: 262,
        y: 36,
        w: 28,
        h: 70,
        exit: { toRoom: "kitchen", entryX: 70, entryDirection: "right" },
      },
      { id: "computer", name: "computer", x: 30, y: 74, w: 42, h: 56 },
      { id: "beakers", name: "beakers", x: 78, y: 100, w: 52, h: 28 },
      { id: "brain-jar", name: "jar", x: 144, y: 86, w: 26, h: 42 },
      { id: "switch", name: "switch", x: 200, y: 68, w: 12, h: 18 },
    ],
  },
};

export const LOCKED_DOOR_ID = "door";
