import type { SparrowAtlas, SparrowFrame } from "./SparrowAtlas";

// Lane mapping in NOTE_assets:
// lane 0 (LEFT): purple instance / left press instance / left confirm instance
// lane 1 (DOWN): blue instance / down press instance / down confirm instance
// lane 2 (UP): green instance / up press instance / up confirm instance
// lane 3 (RIGHT): red instance / right press instance / right confirm instance
// static: arrow static instance (direction rotated or indexed)

export interface NoteAtlasMapping {
  notePrefix: string;
  pressPrefix: string;
  confirmPrefix: string;
  staticPrefix: string;
  holdPiecePrefix: string;
  holdEndPrefix: string;
}

export const NOTE_ATLAS_MAP: Record<number, NoteAtlasMapping> = {
  0: {
    notePrefix: "purple instance",
    pressPrefix: "left press instance",
    confirmPrefix: "left confirm instance",
    staticPrefix: "arrow static instance 1",
    holdPiecePrefix: "purple hold piece instance",
    holdEndPrefix: "pruple end hold instance", // Typo in original FNF XML preserved
  },
  1: {
    notePrefix: "blue instance",
    pressPrefix: "down press instance",
    confirmPrefix: "down confirm instance",
    staticPrefix: "arrow static instance 2",
    holdPiecePrefix: "blue hold piece instance",
    holdEndPrefix: "blue hold end instance",
  },
  2: {
    notePrefix: "green instance",
    pressPrefix: "up press instance",
    confirmPrefix: "up confirm instance",
    staticPrefix: "arrow static instance 3",
    holdPiecePrefix: "green hold piece instance",
    holdEndPrefix: "green hold end instance",
  },
  3: {
    notePrefix: "red instance",
    pressPrefix: "right press instance",
    confirmPrefix: "right confirm instance",
    staticPrefix: "arrow static instance 4",
    holdPiecePrefix: "red hold piece instance",
    holdEndPrefix: "red hold end instance",
  },
};

export function getAtlasFrame(
  atlas: SparrowAtlas,
  prefix: string,
  frameIndex = 0
): SparrowFrame | undefined {
  const list = atlas.byPrefix.get(prefix);
  if (!list || list.length === 0) {
    return undefined;
  }
  return list[frameIndex % list.length];
}

export function drawAtlasFrame(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  frame: SparrowFrame,
  targetX: number,
  targetY: number,
  targetWidth: number,
  targetHeight: number,
  rotationDeg = 0
): void {
  ctx.save();
  ctx.translate(targetX, targetY);
  if (rotationDeg !== 0) {
    ctx.rotate((rotationDeg * Math.PI) / 180);
  }

  // Handle frameX / frameY offsets
  const scaleX = targetWidth / Math.max(1, frame.frameWidth);
  const scaleY = targetHeight / Math.max(1, frame.frameHeight);
  const drawX = -targetWidth / 2 - frame.frameX * scaleX;
  const drawY = -targetHeight / 2 - frame.frameY * scaleY;
  const drawW = frame.width * scaleX;
  const drawH = frame.height * scaleY;

  ctx.drawImage(
    image,
    frame.x,
    frame.y,
    frame.width,
    frame.height,
    drawX,
    drawY,
    drawW,
    drawH
  );
  ctx.restore();
}

