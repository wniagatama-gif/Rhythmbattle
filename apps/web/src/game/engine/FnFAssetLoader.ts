import { parseSparrowXml, type SparrowAtlas } from "./SparrowAtlas";

export interface FnFAssets {
  stageBack: HTMLImageElement;
  stageFront: HTMLImageElement;
  stageCurtains: HTMLImageElement;
  stageLight: HTMLImageElement;
  healthBar: HTMLImageElement;
  iconBf: HTMLImageElement;
  iconSpooky: HTMLImageElement;
  iconDad: HTMLImageElement;
  noteAtlasImage: HTMLImageElement;
  noteAtlas: SparrowAtlas;
  bfAtlasImage: HTMLImageElement;
  bfAtlas: SparrowAtlas;
  spookyAtlasImage: HTMLImageElement;
  spookyAtlas: SparrowAtlas;
}

let cachedAssets: FnFAssets | null = null;
let loadPromise: Promise<FnFAssets> | null = null;

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(new Error(`Failed to load image: ${src} (${String(e)})`));
    img.src = src;
  });
}

async function loadText(src: string): Promise<string> {
  const res = await fetch(src);
  if (!res.ok) {
    throw new Error(`Failed to fetch text resource: ${src} (${res.status})`);
  }
  return res.text();
}

export function loadFnFAssets(): Promise<FnFAssets> {
  if (cachedAssets) {
    return Promise.resolve(cachedAssets);
  }
  if (loadPromise) {
    return loadPromise;
  }

  loadPromise = (async () => {
    const [
      stageBack,
      stageFront,
      stageCurtains,
      stageLight,
      healthBar,
      iconBf,
      iconSpooky,
      iconDad,
      noteAtlasImage,
      noteXmlText,
      bfAtlasImage,
      bfXmlText,
      spookyAtlasImage,
      spookyXmlText,
    ] = await Promise.all([
      loadImage("/assets/images/stage/stageback.png"),
      loadImage("/assets/images/stage/stagefront.png"),
      loadImage("/assets/images/stage/stagecurtains.png"),
      loadImage("/assets/images/stage/stage_light.png"),
      loadImage("/assets/images/stage/healthBar.png"),
      loadImage("/assets/images/icons/icon-bf.png"),
      loadImage("/assets/images/icons/icon-spooky.png"),
      loadImage("/assets/images/icons/icon-dad.png"),
      loadImage("/assets/images/notes/NOTE_assets.png"),
      loadText("/assets/images/notes/NOTE_assets.xml"),
      loadImage("/assets/images/characters/BOYFRIEND.png"),
      loadText("/assets/images/characters/BOYFRIEND.xml"),
      loadImage("/assets/images/characters/SpookyKids.png"),
      loadText("/assets/images/characters/SpookyKids.xml"),
    ]);

    const noteAtlas = parseSparrowXml(noteXmlText, "NOTE_assets.png");
    const bfAtlas = parseSparrowXml(bfXmlText, "BOYFRIEND.png");
    const spookyAtlas = parseSparrowXml(spookyXmlText, "SpookyKids.png");

    cachedAssets = {
      stageBack,
      stageFront,
      stageCurtains,
      stageLight,
      healthBar,
      iconBf,
      iconSpooky,
      iconDad,
      noteAtlasImage,
      noteAtlas,
      bfAtlasImage,
      bfAtlas,
      spookyAtlasImage,
      spookyAtlas,
    };

    return cachedAssets;
  })();

  return loadPromise;
}

export function getCachedFnFAssets(): FnFAssets | null {
  return cachedAssets;
}

