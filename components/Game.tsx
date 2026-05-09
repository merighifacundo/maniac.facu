"use client";

import { useEffect, useRef, useState } from "react";
import Room from "./Room";
import VerbGrid, { type Verb } from "./VerbGrid";
import Inventory from "./Inventory";
import Sentence from "./Sentence";
import { SCENES, LOCKED_DOOR_ID, type Exit, type RoomId, type RoomObject } from "@/lib/scenes";

const WALK_MIN_X = 14;
const WALK_MAX_X = 306;
const WALK_SPEED = 1.4;
const TICK_MS = 30;
const TRANSITION_MS = 250;

function approachX(obj: RoomObject) {
  const center = obj.x + obj.w / 2;
  return Math.max(WALK_MIN_X, Math.min(WALK_MAX_X, center));
}

function lookHint(roomId: RoomId, objId: string, doorOpen: boolean): string {
  if (roomId === "kitchen") {
    const map: Record<string, string> = {
      door: doorOpen ? "The door is open. Through it, a laboratory." : "A heavy wooden door. It's locked.",
      key: "A small brass key. Looks important.",
      window: "It's pitch black outside.",
      rug: "Faded, dusty. Something feels off about it.",
    };
    return map[objId] ?? "Just an ordinary thing.";
  }
  const map: Record<string, string> = {
    "door-back": "Back to the kitchen.",
    computer: "The screen reads: 'PURPLE TENTACLE: ESCAPE PLAN ALPHA'.",
    beakers: "Strange chemicals. Best not to mix them.",
    "brain-jar": "A pink brain pulses gently. Is it... thinking?",
    switch: "A big red switch. Marked DANGER.",
  };
  return map[objId] ?? "Something sciency.";
}

export default function Game() {
  const [room, setRoom] = useState<RoomId>("kitchen");
  const [verb, setVerb] = useState<Verb>("Walk to");
  const [target, setTarget] = useState<string | null>(null);
  const [inventory, setInventory] = useState<string[]>([]);
  const [removed, setRemoved] = useState<Record<RoomId, Set<string>>>({
    kitchen: new Set(),
    lab: new Set(),
  });
  const [message, setMessage] = useState<string>("");
  const [doorOpen, setDoorOpen] = useState(false);
  const [lightsOn, setLightsOn] = useState(true);
  const [transitioning, setTransitioning] = useState(false);

  const [charX, setCharX] = useState(160);
  const [targetX, setTargetX] = useState<number | null>(null);
  const [direction, setDirection] = useState<"left" | "right">("right");
  const [walkFrame, setWalkFrame] = useState<0 | 1>(0);
  const pendingRef = useRef<{ verb: Verb; obj: RoomObject } | null>(null);

  const isWalking = targetX !== null;
  const scene = SCENES[room];
  const visibleObjects = scene.objects.filter((o) => !removed[room].has(o.id));

  // Movement tick
  useEffect(() => {
    if (targetX === null) return;
    const id = setInterval(() => {
      setCharX((curr) => {
        const dx = targetX - curr;
        if (Math.abs(dx) <= WALK_SPEED) return targetX;
        return curr + Math.sign(dx) * WALK_SPEED;
      });
    }, TICK_MS);
    return () => clearInterval(id);
  }, [targetX]);

  // Arrival detection
  useEffect(() => {
    if (targetX !== null && charX === targetX) {
      const pending = pendingRef.current;
      pendingRef.current = null;
      setTargetX(null);
      if (pending) runAction(pending.verb, pending.obj);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [charX, targetX]);

  // Walk frame animation
  useEffect(() => {
    if (!isWalking) {
      setWalkFrame(0);
      return;
    }
    const id = setInterval(() => setWalkFrame((f) => (f === 0 ? 1 : 0)), 150);
    return () => clearInterval(id);
  }, [isWalking]);

  // Direction
  useEffect(() => {
    if (targetX === null) return;
    setDirection(targetX < charX ? "left" : "right");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetX]);

  const targetName =
    target && (scene.objects.find((o) => o.id === target)?.name ?? target);

  function clearAction() {
    setVerb("Walk to");
    setTarget(null);
    setMessage("");
    pendingRef.current = null;
    setTargetX(null);
  }

  function handleFloorClick(x: number) {
    if (transitioning) return;
    const clamped = Math.max(WALK_MIN_X, Math.min(WALK_MAX_X, x));
    pendingRef.current = null;
    setTarget(null);
    setVerb("Walk to");
    setMessage("");
    setTargetX(clamped);
  }

  function handleObjectClick(obj: RoomObject) {
    if (transitioning) return;
    setTarget(obj.id);
    setMessage("");
    if (verb === "Walk to") {
      pendingRef.current = { verb, obj };
      setTargetX(approachX(obj));
      return;
    }
    pendingRef.current = { verb, obj };
    setTargetX(approachX(obj));
  }

  function handleInventoryClick(itemId: string) {
    setTarget(itemId);
    const fakeObj: RoomObject = { id: itemId, name: itemId, x: 0, y: 0, w: 0, h: 0 };
    runAction(verb, fakeObj);
  }

  function doExit(exit: Exit) {
    setTransitioning(true);
    setTimeout(() => {
      setRoom(exit.toRoom);
      setCharX(exit.entryX);
      setDirection(exit.entryDirection);
      setTargetX(null);
      pendingRef.current = null;
      setVerb("Walk to");
      setTarget(null);
      setMessage(`You enter the ${SCENES[exit.toRoom].name.toLowerCase()}.`);
      setTransitioning(false);
    }, TRANSITION_MS);
  }

  function canExitThrough(obj: RoomObject, openNow: boolean): boolean {
    if (!obj.exit) return false;
    if (obj.id === LOCKED_DOOR_ID) return openNow;
    return true;
  }

  function runAction(v: Verb, obj: RoomObject) {
    let openNow = doorOpen;
    let triggerExit = false;

    if (v === "Pick up") {
      if (obj.takeable) {
        setInventory((inv) => Array.from(new Set([...inv, obj.id])));
        setRemoved((r) => ({ ...r, [room]: new Set(r[room]).add(obj.id) }));
        setMessage(`You pick up the ${obj.name}.`);
      } else {
        setMessage(`You can't pick up the ${obj.name}.`);
      }
      return;
    }

    if (v === "Look at") {
      setMessage(lookHint(room, obj.id, doorOpen));
      return;
    }

    if (v === "Open" && obj.id === LOCKED_DOOR_ID) {
      if (doorOpen) {
        setMessage("");
        triggerExit = true;
      } else if (inventory.includes("key")) {
        setDoorOpen(true);
        openNow = true;
        setMessage("You unlock the door. It creaks open.");
        triggerExit = true;
      } else {
        setMessage("It's locked. You need a key.");
      }
    } else if (v === "Open" && obj.exit) {
      setMessage("");
      triggerExit = true;
    } else if (v === "Walk to" && obj.exit) {
      if (canExitThrough(obj, openNow)) {
        setMessage("");
        triggerExit = true;
      } else {
        setMessage(`The ${obj.name} is locked.`);
      }
    } else if (v === "Walk to") {
      setMessage(`You walk to the ${obj.name}.`);
    } else if (v === "Use" && obj.id === "key") {
      setMessage("Use the key on what?");
    } else if ((v === "Use" || v === "Push" || v === "Pull") && obj.id === "switch") {
      setLightsOn((on) => {
        setMessage(on ? "You flip the switch. The lab plunges into darkness." : "You flip the switch back. Light returns.");
        return !on;
      });
    } else if (v === "Close" && obj.id === LOCKED_DOOR_ID) {
      if (doorOpen) {
        setDoorOpen(false);
        setMessage("You close the door.");
      } else {
        setMessage("It's already closed.");
      }
    } else {
      setMessage("Nothing happens.");
    }

    if (triggerExit && obj.exit) {
      doExit(obj.exit);
    }
  }

  return (
    <main
      style={{
        maxWidth: 960,
        margin: "0 auto",
        padding: 16,
        display: "flex",
        flexDirection: "column",
        gap: 8,
      }}
    >
      <div style={{ color: "var(--ega-yellow)", fontSize: 8, letterSpacing: 1 }}>
        {scene.name.toUpperCase()}
      </div>
      <Room
        roomId={room}
        objects={visibleObjects}
        doorOpen={doorOpen}
        showKey={!removed.kitchen.has("key")}
        lightsOn={lightsOn}
        message={message}
        charX={charX}
        charDirection={direction}
        walkFrame={walkFrame}
        transitioning={transitioning}
        onObjectClick={handleObjectClick}
        onObjectHover={(id) => !target && setTarget(id)}
        onFloorClick={handleFloorClick}
      />
      <Sentence verb={verb} targetName={targetName ?? null} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <VerbGrid
          active={verb}
          onPick={(v) => {
            setVerb(v);
            setTarget(null);
            setMessage("");
          }}
        />
        <Inventory items={inventory} onClick={handleInventoryClick} />
      </div>
      <button
        onClick={clearAction}
        style={{
          alignSelf: "flex-end",
          padding: "4px 8px",
          color: "var(--ega-lgray)",
          fontSize: 8,
        }}
      >
        [reset]
      </button>
    </main>
  );
}
