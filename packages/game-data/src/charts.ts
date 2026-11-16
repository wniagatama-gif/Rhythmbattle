import demoSongEasyJson from "../charts/demo-song-001-easy.json";
import demoSongJson from "../charts/demo-song-001.json";
import streamDrillJson from "../charts/stream-drill-002.json";
import streamDrillExpertJson from "../charts/stream-drill-002-expert.json";

import bopeeboEasyJson from "../charts/fnf-bopeebo-easy.json";
import bopeeboNormalJson from "../charts/fnf-bopeebo-normal.json";
import bopeeboHardJson from "../charts/fnf-bopeebo-hard.json";

import freshEasyJson from "../charts/fnf-fresh-easy.json";
import freshNormalJson from "../charts/fnf-fresh-normal.json";
import freshHardJson from "../charts/fnf-fresh-hard.json";

import dadbattleEasyJson from "../charts/fnf-dadbattle-easy.json";
import dadbattleNormalJson from "../charts/fnf-dadbattle-normal.json";
import dadbattleHardJson from "../charts/fnf-dadbattle-hard.json";

import spookeezEasyJson from "../charts/fnf-spookeez-easy.json";
import spookeezNormalJson from "../charts/fnf-spookeez-normal.json";
import spookeezHardJson from "../charts/fnf-spookeez-hard.json";

export const OFFICIAL_FNF_CHART_FILES: readonly unknown[] = [
  bopeeboEasyJson,
  bopeeboNormalJson,
  bopeeboHardJson,
  freshEasyJson,
  freshNormalJson,
  freshHardJson,
  dadbattleEasyJson,
  dadbattleNormalJson,
  dadbattleHardJson,
  spookeezEasyJson,
  spookeezNormalJson,
  spookeezHardJson
];

export const RAW_CHART_FILES: readonly unknown[] = [
  demoSongEasyJson,
  demoSongJson,
  streamDrillJson,
  streamDrillExpertJson
];

export const ALL_CHART_FILES: readonly unknown[] = [
  ...OFFICIAL_FNF_CHART_FILES,
  ...RAW_CHART_FILES
];
