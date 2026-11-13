export interface SparrowFrame {
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  frameX: number;
  frameY: number;
  frameWidth: number;
  frameHeight: number;
}

export interface SparrowAtlas {
  imagePath: string;
  frames: SparrowFrame[];
  byPrefix: Map<string, SparrowFrame[]>;
}

export function parseSparrowXml(xmlText: string, imagePath = ""): SparrowAtlas {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlText, "text/xml");
  const root = doc.querySelector("TextureAtlas");
  const resolvedImagePath = root?.getAttribute("imagePath") ?? imagePath;
  const subTextures = Array.from(doc.querySelectorAll("SubTexture"));

  const frames: SparrowFrame[] = [];
  const byPrefix = new Map<string, SparrowFrame[]>();

  for (const st of subTextures) {
    const name = st.getAttribute("name") ?? "";
    const x = parseInt(st.getAttribute("x") ?? "0", 10);
    const y = parseInt(st.getAttribute("y") ?? "0", 10);
    const width = parseInt(st.getAttribute("width") ?? "0", 10);
    const height = parseInt(st.getAttribute("height") ?? "0", 10);
    const frameX = parseInt(st.getAttribute("frameX") ?? "0", 10);
    const frameY = parseInt(st.getAttribute("frameY") ?? "0", 10);
    const frameWidth = parseInt(st.getAttribute("frameWidth") ?? width.toString(), 10);
    const frameHeight = parseInt(st.getAttribute("frameHeight") ?? height.toString(), 10);

    const frame: SparrowFrame = {
      name,
      x,
      y,
      width,
      height,
      frameX,
      frameY,
      frameWidth,
      frameHeight,
    };
    frames.push(frame);

    // Group by prefix (strip 4 trailing digits e.g. "0000")
    const match = name.match(/^(.*?)(?:0*(\d{1,4}))?$/);
    const prefix = match && match[1] ? match[1].trim() : name;
    let list = byPrefix.get(prefix);
    if (!list) {
      list = [];
      byPrefix.set(prefix, list);
    }
    list.push(frame);
  }

  return {
    imagePath: resolvedImagePath,
    frames,
    byPrefix,
  };
}

