// Official FNF Asset Manifest Catalog
// Source: https://github.com/FunkinCrew/funkin.assets & https://github.com/FunkinCrew/Funkin
// License: Apache-2.0

export interface AssetManifestEntry {
  id: string;
  name: string;
  category: "characters" | "stages" | "notes" | "hud" | "menus" | "audio" | "charts";
  path: string;
  sourceRepo: "FunkinCrew/funkin.assets" | "FunkinCrew/Funkin";
  originalPath: string;
  description: string;
}

export const OFFICIAL_ASSET_MANIFEST: readonly AssetManifestEntry[] = [
  // Characters
  {
    id: "char-bf-spritesheet",
    name: "Boyfriend Sprite Atlas",
    category: "characters",
    path: "/assets/images/characters/BOYFRIEND.png",
    sourceRepo: "FunkinCrew/funkin.assets",
    originalPath: "shared/images/characters/BOYFRIEND.png",
    description: "Full Sparrow v2 sprite sheet texture for Boyfriend"
  },
  {
    id: "char-bf-xml",
    name: "Boyfriend Atlas XML",
    category: "characters",
    path: "/assets/images/characters/BOYFRIEND.xml",
    sourceRepo: "FunkinCrew/funkin.assets",
    originalPath: "shared/images/characters/BOYFRIEND.xml",
    description: "Sparrow v2 frame coordinates and animation prefixes for Boyfriend"
  },
  {
    id: "char-spooky-spritesheet",
    name: "Spooky Kids Sprite Atlas",
    category: "characters",
    path: "/assets/images/characters/SpookyKids.png",
    sourceRepo: "FunkinCrew/funkin.assets",
    originalPath: "week2/images/characters/spooky/SpookyKids.png",
    description: "Full Sparrow v2 sprite sheet texture for Skid & Pump"
  },
  {
    id: "char-spooky-xml",
    name: "Spooky Kids Atlas XML",
    category: "characters",
    path: "/assets/images/characters/SpookyKids.xml",
    sourceRepo: "FunkinCrew/funkin.assets",
    originalPath: "week2/images/characters/spooky/SpookyKids.xml",
    description: "Sparrow v2 frame definitions for Skid & Pump"
  },
  {
    id: "icon-bf",
    name: "Boyfriend Health Icon",
    category: "characters",
    path: "/assets/images/icons/icon-bf.png",
    sourceRepo: "FunkinCrew/funkin.assets",
    originalPath: "preload/images/icons/icon-bf.png",
    description: "Health bar avatar icon for Boyfriend"
  },
  {
    id: "icon-spooky",
    name: "Spooky Kids Health Icon",
    category: "characters",
    path: "/assets/images/icons/icon-spooky.png",
    sourceRepo: "FunkinCrew/funkin.assets",
    originalPath: "preload/images/icons/icon-spooky.png",
    description: "Health bar avatar icon for Skid & Pump"
  },
  {
    id: "icon-dad",
    name: "Daddy Dearest Health Icon",
    category: "characters",
    path: "/assets/images/icons/icon-dad.png",
    sourceRepo: "FunkinCrew/funkin.assets",
    originalPath: "preload/images/icons/icon-dad.png",
    description: "Health bar avatar icon for Daddy Dearest"
  },

  // Stages
  {
    id: "stage-back",
    name: "Concert Stage Backdrop",
    category: "stages",
    path: "/assets/images/stage/stageback.png",
    sourceRepo: "FunkinCrew/funkin.assets",
    originalPath: "shared/images/stageback.png",
    description: "Main stage concert wall background"
  },
  {
    id: "stage-front",
    name: "Stage Platform",
    category: "stages",
    path: "/assets/images/stage/stagefront.png",
    sourceRepo: "FunkinCrew/funkin.assets",
    originalPath: "shared/images/stagefront.png",
    description: "Main stage concert wooden platform foreground"
  },
  {
    id: "stage-curtains",
    name: "Stage Curtains",
    category: "stages",
    path: "/assets/images/stage/stagecurtains.png",
    sourceRepo: "FunkinCrew/funkin.assets",
    originalPath: "shared/images/stagecurtains.png",
    description: "Overhead concert stage curtains framing the arena"
  },
  {
    id: "stage-light",
    name: "Stage Lights",
    category: "stages",
    path: "/assets/images/stage/stage_light.png",
    sourceRepo: "FunkinCrew/funkin.assets",
    originalPath: "shared/images/stage_light.png",
    description: "Overhead spotlight fixtures"
  },

  // Notes & Receptors
  {
    id: "notes-atlas-png",
    name: "NOTE Assets Texture",
    category: "notes",
    path: "/assets/images/notes/NOTE_assets.png",
    sourceRepo: "FunkinCrew/funkin.assets",
    originalPath: "preload/images/NOTE_assets.png",
    description: "Sparrow v2 texture atlas for arrows, receptors, and hold pieces"
  },
  {
    id: "notes-atlas-xml",
    name: "NOTE Assets XML",
    category: "notes",
    path: "/assets/images/notes/NOTE_assets.xml",
    sourceRepo: "FunkinCrew/funkin.assets",
    originalPath: "preload/images/NOTE_assets.xml",
    description: "Sparrow v2 atlas metadata for arrows, receptors, and holds"
  },

  // HUD & Popups
  {
    id: "hud-healthbar",
    name: "Health Bar Texture",
    category: "hud",
    path: "/assets/images/stage/healthBar.png",
    sourceRepo: "FunkinCrew/funkin.assets",
    originalPath: "shared/images/healthBar.png",
    description: "Center health bar frame graphic"
  },
  {
    id: "popup-sick",
    name: "SICK! Rating Popup",
    category: "hud",
    path: "/assets/images/ui/popup/sick.png",
    sourceRepo: "FunkinCrew/funkin.assets",
    originalPath: "preload/images/ui/popup/funkin/sick.png",
    description: "Official SICK! hit judgment splash popup"
  },
  {
    id: "popup-good",
    name: "GOOD! Rating Popup",
    category: "hud",
    path: "/assets/images/ui/popup/good.png",
    sourceRepo: "FunkinCrew/funkin.assets",
    originalPath: "preload/images/ui/popup/funkin/good.png",
    description: "Official GOOD! hit judgment splash popup"
  },
  {
    id: "popup-bad",
    name: "BAD Rating Popup",
    category: "hud",
    path: "/assets/images/ui/popup/bad.png",
    sourceRepo: "FunkinCrew/funkin.assets",
    originalPath: "preload/images/ui/popup/funkin/bad.png",
    description: "Official BAD hit judgment splash popup"
  },
  {
    id: "popup-shit",
    name: "SHIT Rating Popup",
    category: "hud",
    path: "/assets/images/ui/popup/shit.png",
    sourceRepo: "FunkinCrew/funkin.assets",
    originalPath: "preload/images/ui/popup/funkin/shit.png",
    description: "Official SHIT hit judgment splash popup"
  },
  {
    id: "popup-combo",
    name: "Combo Splash Text",
    category: "hud",
    path: "/assets/images/ui/popup/combo.png",
    sourceRepo: "FunkinCrew/funkin.assets",
    originalPath: "preload/images/ui/popup/funkin/combo.png",
    description: "Official COMBO splash banner graphic"
  },
  {
    id: "countdown-ready",
    name: "Ready Countdown Popup",
    category: "hud",
    path: "/assets/images/ui/countdown/ready.png",
    sourceRepo: "FunkinCrew/funkin.assets",
    originalPath: "shared/images/ui/countdown/funkin/ready.png",
    description: "Official READY countdown graphic"
  },
  {
    id: "countdown-set",
    name: "Set Countdown Popup",
    category: "hud",
    path: "/assets/images/ui/countdown/set.png",
    sourceRepo: "FunkinCrew/funkin.assets",
    originalPath: "shared/images/ui/countdown/funkin/set.png",
    description: "Official SET countdown graphic"
  },
  {
    id: "countdown-go",
    name: "Go Countdown Popup",
    category: "hud",
    path: "/assets/images/ui/countdown/go.png",
    sourceRepo: "FunkinCrew/funkin.assets",
    originalPath: "shared/images/ui/countdown/funkin/go.png",
    description: "Official GO! countdown graphic"
  },

  // Results Screen
  {
    id: "results-bg",
    name: "Results Screen Banner",
    category: "menus",
    path: "/assets/images/results/results.png",
    sourceRepo: "FunkinCrew/funkin.assets",
    originalPath: "shared/images/resultScreen/results.png",
    description: "Results screen frame and backdrop atlas"
  },
  {
    id: "results-topbar",
    name: "Results Top Bar",
    category: "menus",
    path: "/assets/images/results/topBarBlack.png",
    sourceRepo: "FunkinCrew/funkin.assets",
    originalPath: "shared/images/resultScreen/topBarBlack.png",
    description: "Black top accent bar for results screen"
  },
  {
    id: "rank-perfect",
    name: "PERFECT Rank Banner",
    category: "menus",
    path: "/assets/images/results/rankTextPERFECT.png",
    sourceRepo: "FunkinCrew/funkin.assets",
    originalPath: "shared/images/resultScreen/rankText/rankTextPERFECT.png",
    description: "PERFECT rank banner graphic"
  },
  {
    id: "rank-excellent",
    name: "EXCELLENT Rank Banner",
    category: "menus",
    path: "/assets/images/results/rankTextEXCELLENT.png",
    sourceRepo: "FunkinCrew/funkin.assets",
    originalPath: "shared/images/resultScreen/rankText/rankTextEXCELLENT.png",
    description: "EXCELLENT rank banner graphic"
  },
  {
    id: "rank-great",
    name: "GREAT Rank Banner",
    category: "menus",
    path: "/assets/images/results/rankTextGREAT.png",
    sourceRepo: "FunkinCrew/funkin.assets",
    originalPath: "shared/images/resultScreen/rankText/rankTextGREAT.png",
    description: "GREAT rank banner graphic"
  },
  {
    id: "rank-good",
    name: "GOOD Rank Banner",
    category: "menus",
    path: "/assets/images/results/rankTextGOOD.png",
    sourceRepo: "FunkinCrew/funkin.assets",
    originalPath: "shared/images/resultScreen/rankText/rankTextGOOD.png",
    description: "GOOD rank banner graphic"
  },
  {
    id: "rank-loss",
    name: "LOSS Rank Banner",
    category: "menus",
    path: "/assets/images/results/rankTextLOSS.png",
    sourceRepo: "FunkinCrew/funkin.assets",
    originalPath: "shared/images/resultScreen/rankText/rankTextLOSS.png",
    description: "LOSS rank banner graphic"
  },

  // Songs & Audio
  {
    id: "audio-freakymenu",
    name: "Freaky Menu Theme",
    category: "audio",
    path: "/assets/music/freakyMenu.ogg",
    sourceRepo: "FunkinCrew/funkin.assets",
    originalPath: "preload/music/freakyMenu/freakyMenu.ogg",
    description: "Iconic Friday Night Funkin' main menu theme music by Kawai Sprite"
  },
  {
    id: "audio-bopeebo-inst",
    name: "Bopeebo Instrumental",
    category: "audio",
    path: "/assets/songs/bopeebo/Inst.ogg",
    sourceRepo: "FunkinCrew/funkin.assets",
    originalPath: "songs/bopeebo/Inst.ogg",
    description: "Official Bopeebo instrumental audio track"
  },
  {
    id: "audio-fresh-inst",
    name: "Fresh Instrumental",
    category: "audio",
    path: "/assets/songs/fresh/Inst.ogg",
    sourceRepo: "FunkinCrew/funkin.assets",
    originalPath: "songs/fresh/Inst.ogg",
    description: "Official Fresh instrumental audio track"
  },
  {
    id: "audio-dadbattle-inst",
    name: "Dad Battle Instrumental",
    category: "audio",
    path: "/assets/songs/dadbattle/Inst.ogg",
    sourceRepo: "FunkinCrew/funkin.assets",
    originalPath: "songs/dadbattle/Inst.ogg",
    description: "Official Dad Battle instrumental audio track"
  },
  {
    id: "audio-spookeez-inst",
    name: "Spookeez Instrumental",
    category: "audio",
    path: "/assets/songs/spookeez/Inst.ogg",
    sourceRepo: "FunkinCrew/funkin.assets",
    originalPath: "songs/spookeez/Inst.ogg",
    description: "Official Spookeez instrumental audio track"
  }
];
