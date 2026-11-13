import { useEffect, useRef, useState } from "react";
import type { CharacterAnimState } from "../../game/types/game";
import { getCachedFnFAssets, loadFnFAssets, type FnFAssets } from "../../game/engine/FnFAssetLoader";
import type { SparrowFrame } from "../../game/engine/SparrowAtlas";

export interface FnFAnimatedCharacterProps {
  character: "bf" | "spooky";
  state: CharacterAnimState;
  facing: "left" | "right";
  width?: number;
  height?: number;
  beatPhase?: number;
}

// Map 10 CharacterAnimStates to Sparrow XML animation prefixes in BOYFRIEND.xml and SpookyKids.xml
const BF_ANIM_PREFIXES: Record<CharacterAnimState, string> = {
  idle: "BF idle dance",
  singLeft: "BF NOTE LEFT",
  singDown: "BF NOTE DOWN",
  singUp: "BF NOTE UP",
  singRight: "BF NOTE RIGHT",
  miss: "BF NOTE DOWN MISS",
  hurt: "BF hit",
  special: "boyfriend attack",
  victory: "BF HEY!!",
  defeat: "BF dies",
};

const SPOOKY_ANIM_PREFIXES: Record<CharacterAnimState, string> = {
  idle: "spooky dance idle",
  singLeft: "note sing left",
  singDown: "spooky DOWN note",
  singUp: "spooky UP NOTE",
  singRight: "spooky sing right",
  miss: "spooky DOWN note",
  hurt: "spooky dance idle",
  special: "Spookiez YEAH cheer",
  victory: "Spookiez YEAH cheer",
  defeat: "spooky dance idle",
};

export function FnFAnimatedCharacter({
  character,
  state,
  facing,
  width = 300,
  height = 340,
}: FnFAnimatedCharacterProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [assets, setAssets] = useState<FnFAssets | null>(getCachedFnFAssets);
  const frameIndexRef = useRef(0);
  const lastStateRef = useRef(state);

  useEffect(() => {
    if (!assets) {
      loadFnFAssets().then(setAssets).catch(() => {});
    }
  }, [assets]);

  useEffect(() => {
    if (lastStateRef.current !== state) {
      lastStateRef.current = state;
      frameIndexRef.current = 0;
    }
  }, [state]);

  useEffect(() => {
    if (!assets) return;

    let animId: number;
    let lastTime = performance.now();
    const fps = 24; // FNF standard 24fps
    const frameInterval = 1000 / fps;

    const render = (time: number) => {
      animId = requestAnimationFrame(render);
      const delta = time - lastTime;
      if (delta < frameInterval) return;
      lastTime = time - (delta % frameInterval);

      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const atlas = character === "bf" ? assets.bfAtlas : assets.spookyAtlas;
      const image = character === "bf" ? assets.bfAtlasImage : assets.spookyAtlasImage;
      const prefixMap = character === "bf" ? BF_ANIM_PREFIXES : SPOOKY_ANIM_PREFIXES;
      const prefix = prefixMap[state] ?? prefixMap.idle;

      const frames = atlas.byPrefix.get(prefix) ?? atlas.frames;
      if (!frames || frames.length === 0) return;

      const currentFrame = frames[frameIndexRef.current % frames.length] as SparrowFrame;
      frameIndexRef.current += 1;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();

      // Horizontal flip if facing left or right
      const shouldFlip = facing === "left";
      if (shouldFlip) {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
      }

      // Draw frame honoring frameX / frameY / frameWidth / frameHeight offsets
      const scale = Math.min(
        canvas.width / Math.max(1, currentFrame.frameWidth || currentFrame.width),
        canvas.height / Math.max(1, currentFrame.frameHeight || currentFrame.height)
      ) * 0.92;

      const drawW = currentFrame.width * scale;
      const drawH = currentFrame.height * scale;
      const offsetX = (currentFrame.frameX || 0) * scale;
      const offsetY = (currentFrame.frameY || 0) * scale;
      const destX = (canvas.width - (currentFrame.frameWidth || currentFrame.width) * scale) / 2 - offsetX;
      const destY = canvas.height - (currentFrame.frameHeight || currentFrame.height) * scale - offsetY;

      ctx.drawImage(
        image,
        currentFrame.x,
        currentFrame.y,
        currentFrame.width,
        currentFrame.height,
        destX,
        destY,
        drawW,
        drawH
      );

      ctx.restore();
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [assets, character, state, facing]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="pointer-events-none drop-shadow-[0_8px_16px_rgba(0,0,0,0.6)]"
      style={{ width: `${width}px`, height: `${height}px` }}
    />
  );
}

