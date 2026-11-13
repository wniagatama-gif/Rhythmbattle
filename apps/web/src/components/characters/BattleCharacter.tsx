import type { CharacterAnimState } from "../../game/types/game";

export interface CharacterModelConfig {
  renderer: "2d-placeholder" | "glb";
  modelUrl?: string;
}

export interface BattleCharacterProps {
  role: "player" | "opponent";
  name: string;
  title?: string;
  state: CharacterAnimState;
  facing: "left" | "right";
  beatPhase?: number;
  modelConfig?: CharacterModelConfig;
  compact?: boolean;
}

const STATE_TRANSFORM: Record<CharacterAnimState, string> = {
  idle: "translate-y-0 rotate-0 scale-100",
  singLeft: "-translate-x-2 rotate-[-5deg] scale-[1.03]",
  singDown: "translate-y-2.5 scale-y-[0.94] scale-x-[1.05]",
  singUp: "-translate-y-3 scale-y-[1.05] scale-x-[0.97]",
  singRight: "translate-x-2 rotate-[5deg] scale-[1.03]",
  miss: "translate-y-1.5 rotate-[4deg] scale-[0.97]",
  hurt: "translate-y-1 rotate-[-9deg] scale-[0.93]",
  special: "-translate-y-4 scale-[1.09]",
  victory: "-translate-y-2.5 scale-[1.06]",
  defeat: "translate-y-3 rotate-[6deg] scale-[0.93] opacity-75"
};

const STATE_ACCENT_COLOR: Record<CharacterAnimState, string> = {
  idle: "transparent",
  singLeft: "#F43F5E",
  singDown: "#38BDF8",
  singUp: "#F59E0B",
  singRight: "#A855F7",
  miss: "#94A3B8",
  hurt: "#FB7185",
  special: "#F59E0B",
  victory: "#34D399",
  defeat: "#64748B"
};

export function CharacterAvatarIcon({
  role,
  size = 38
}: {
  role: "player" | "opponent";
  size?: number;
}) {
  const isPlayer = role === "player";
  const primary = isPlayer ? "#E11D48" : "#0284C7";
  const secondary = isPlayer ? "#F59E0B" : "#38BDF8";

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      aria-hidden="true"
      className="shrink-0"
    >
      <rect
        x="3"
        y="3"
        width="42"
        height="42"
        rx="10"
        fill="#141824"
        stroke="#090B10"
        strokeWidth="3"
      />
      <rect
        x="6"
        y="6"
        width="36"
        height="36"
        rx="7"
        fill={primary}
        fillOpacity="0.22"
      />
      {isPlayer ? (
        <g>
          <path
            d="M13 24 C13 15, 35 15, 35 24 L35 34 C35 36, 13 36, 13 34 Z"
            fill="#F8FAFC"
            stroke="#090B10"
            strokeWidth="2.5"
          />
          <path
            d="M12 21 L38 17 L34 12 L15 14 Z"
            fill={primary}
            stroke="#090B10"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          <circle cx="21" cy="26" r="2.3" fill="#090B10" />
          <circle cx="29" cy="26" r="2.3" fill="#090B10" />
          <path d="M21 31 Q25 34 29 31" stroke="#090B10" strokeWidth="2.2" fill="none" strokeLinecap="round" />
        </g>
      ) : (
        <g>
          <path
            d="M14 21 C14 13, 34 13, 34 21 L34 34 L14 34 Z"
            fill="#CBD5E1"
            stroke="#090B10"
            strokeWidth="2.5"
          />
          <rect
            x="16"
            y="20"
            width="16"
            height="7"
            rx="3"
            fill="#090B10"
          />
          <rect x="18.5" y="22.2" width="4.5" height="2.6" rx="1" fill={secondary} />
          <rect x="25" y="22.2" width="4.5" height="2.6" rx="1" fill={secondary} />
          <path d="M19 31 L29 31" stroke="#090B10" strokeWidth="2.2" strokeLinecap="round" />
        </g>
      )}
    </svg>
  );
}

export function BattleCharacter({
  role,
  name,
  title,
  state,
  facing,
  beatPhase = 0,
  modelConfig = { renderer: "2d-placeholder" },
  compact = false
}: BattleCharacterProps) {
  const isPlayer = role === "player";
  const isSinging =
    state === "singLeft" ||
    state === "singDown" ||
    state === "singUp" ||
    state === "singRight" ||
    state === "special";
  const isHurt = state === "hurt" || state === "defeat";
  const isMiss = state === "miss";
  const accentColor = STATE_ACCENT_COLOR[state];
  const beatOffsetPx = beatPhase % 2 === 0 ? 0 : -4;

  // Placeholder mount point prepared for Phase 3/4 Three.js GLB renderer replacement.
  const useGlbPlaceholder = modelConfig.renderer === "glb" && Boolean(modelConfig.modelUrl);

  const jacketColor = isPlayer ? "#E11D48" : "#0284C7";
  const jacketShade = isPlayer ? "#9F1239" : "#0369A1";
  const trimColor = isPlayer ? "#F59E0B" : "#38BDF8";

  return (
    <div
      data-character-role={role}
      data-character-state={state}
      data-renderer={modelConfig.renderer}
      className={`flex flex-col items-center select-none ${compact ? "gap-1.5" : "gap-2.5"}`}
    >
      <div
        className={`relative transition-transform duration-100 ease-out ${STATE_TRANSFORM[state]}`}
        style={{
          transform: state === "idle" ? `translateY(${beatOffsetPx}px)` : undefined
        }}
      >
        {useGlbPlaceholder ? (
          <div
            data-glb-model-url={modelConfig.modelUrl}
            className="w-40 h-52 rounded-xl border-2 border-[#475569] bg-[#141824] flex items-center justify-center text-xs text-[#CBD5E1]"
          >
            3D Model Ready
          </div>
        ) : (
          <svg
            viewBox="0 0 220 260"
            aria-label={`${name} character pose ${state}`}
            className={`${compact ? "w-28 h-36" : "w-44 h-52 lg:w-52 lg:h-60"} drop-shadow-[0_8px_0_rgba(5,7,11,0.85)]`}
          >
            {/* Stage Spotlight Base */}
            <ellipse
              cx="110"
              cy="242"
              rx="74"
              ry="12"
              fill={accentColor !== "transparent" ? accentColor : jacketColor}
              fillOpacity={accentColor !== "transparent" ? "0.35" : "0.18"}
            />

            {/* Mirror character horizontally so Player faces right and Opponent faces left */}
            <g transform={facing === "left" ? "translate(220, 0) scale(-1, 1)" : undefined}>
              {/* Back Arm */}
              <path
                d={
                  state === "victory" || state === "special"
                    ? "M76 136 L44 92"
                    : "M78 136 L58 172"
                }
                stroke="#090B10"
                strokeWidth="22"
                strokeLinecap="round"
              />
              <path
                d={
                  state === "victory" || state === "special"
                    ? "M76 136 L44 92"
                    : "M78 136 L58 172"
                }
                stroke={jacketShade}
                strokeWidth="14"
                strokeLinecap="round"
              />

              {/* Legs */}
              <path
                d="M94 186 L86 232 M128 186 L138 232"
                stroke="#090B10"
                strokeWidth="24"
                strokeLinecap="round"
              />
              <path
                d="M94 186 L86 232 M128 186 L138 232"
                stroke="#1E293B"
                strokeWidth="16"
                strokeLinecap="round"
              />

              {/* Sneakers */}
              <rect
                x="72"
                y="224"
                width="34"
                height="16"
                rx="6"
                fill={trimColor}
                stroke="#090B10"
                strokeWidth="4"
              />
              <rect
                x="124"
                y="224"
                width="36"
                height="16"
                rx="6"
                fill={trimColor}
                stroke="#090B10"
                strokeWidth="4"
              />

              {/* Torso / Stylized Arcade Jacket */}
              <path
                d="M74 124 L146 124 L138 192 L82 192 Z"
                fill={jacketColor}
                stroke="#090B10"
                strokeWidth="5"
                strokeLinejoin="round"
              />
              <path
                d="M104 124 L118 124 L115 190 L106 190 Z"
                fill={trimColor}
              />

              {/* Head */}
              <rect
                x="72"
                y="46"
                width="76"
                height="72"
                rx="24"
                fill={isPlayer ? "#F8FAFC" : "#CBD5E1"}
                stroke="#090B10"
                strokeWidth="5"
              />

              {/* Headgear (Player Cap vs Opponent Synth Visor/Horns) */}
              {isPlayer ? (
                <g>
                  <path
                    d="M68 68 C68 38, 152 38, 152 68 Z"
                    fill={jacketColor}
                    stroke="#090B10"
                    strokeWidth="5"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M126 62 L176 58 L170 70 L118 70 Z"
                    fill={trimColor}
                    stroke="#090B10"
                    strokeWidth="4"
                    strokeLinejoin="round"
                  />
                </g>
              ) : (
                <g>
                  <path
                    d="M84 48 L72 22 L102 44 Z M136 48 L152 22 L120 44 Z"
                    fill={jacketColor}
                    stroke="#090B10"
                    strokeWidth="4.5"
                    strokeLinejoin="round"
                  />
                  <rect
                    x="80"
                    y="68"
                    width="64"
                    height="20"
                    rx="7"
                    fill="#090B10"
                  />
                  <rect
                    x="88"
                    y="74"
                    width="18"
                    height="7"
                    rx="2"
                    fill={isHurt ? "#FB7185" : trimColor}
                  />
                  <rect
                    x="116"
                    y="74"
                    width="18"
                    height="7"
                    rx="2"
                    fill={isHurt ? "#FB7185" : trimColor}
                  />
                </g>
              )}

              {/* Face Details */}
              {isPlayer && (
                <g>
                  {isHurt ? (
                    <g stroke="#090B10" strokeWidth="4" strokeLinecap="round">
                      <path d="M96 76 L104 84 M104 76 L96 84" />
                      <path d="M122 76 L130 84 M130 76 L122 84" />
                    </g>
                  ) : isMiss ? (
                    <g>
                      <line x1="95" y1="81" x2="106" y2="81" stroke="#090B10" strokeWidth="4" strokeLinecap="round" />
                      <line x1="121" y1="81" x2="132" y2="81" stroke="#090B10" strokeWidth="4" strokeLinecap="round" />
                      <path d="M142 66 Q148 76 142 82 Q136 76 142 66 Z" fill="#38BDF8" stroke="#090B10" strokeWidth="2" />
                    </g>
                  ) : (
                    <g>
                      <circle cx="102" cy="82" r="4.5" fill="#090B10" />
                      <circle cx="128" cy="82" r="4.5" fill="#090B10" />
                    </g>
                  )}
                </g>
              )}

              {/* Mouth Expression */}
              {isSinging ? (
                <ellipse
                  cx="116"
                  cy="102"
                  rx="10"
                  ry="8"
                  fill="#090B10"
                  stroke={accentColor !== "transparent" ? accentColor : "#090B10"}
                  strokeWidth="2"
                />
              ) : isHurt || isMiss ? (
                <path
                  d="M104 104 Q116 96 128 104"
                  stroke="#090B10"
                  strokeWidth="4"
                  fill="none"
                  strokeLinecap="round"
                />
              ) : (
                <path
                  d="M104 100 Q116 108 128 99"
                  stroke="#090B10"
                  strokeWidth="4"
                  fill="none"
                  strokeLinecap="round"
                />
              )}

              {/* Front Singing Arm + Handheld Microphone */}
              <g
                transform={
                  state === "singUp"
                    ? "translate(0, -14)"
                    : state === "singDown"
                    ? "translate(0, 10)"
                    : state === "singRight"
                    ? "translate(10, -4)"
                    : state === "singLeft"
                    ? "translate(-8, -4)"
                    : undefined
                }
              >
                <path
                  d="M136 138 L166 116"
                  stroke="#090B10"
                  strokeWidth="22"
                  strokeLinecap="round"
                />
                <path
                  d="M136 138 L166 116"
                  stroke={jacketColor}
                  strokeWidth="14"
                  strokeLinecap="round"
                />
                {/* Mic Handle & Grille */}
                <line
                  x1="164"
                  y1="126"
                  x2="178"
                  y2="98"
                  stroke="#090B10"
                  strokeWidth="11"
                  strokeLinecap="round"
                />
                <line
                  x1="164"
                  y1="126"
                  x2="178"
                  y2="98"
                  stroke="#94A3B8"
                  strokeWidth="5"
                  strokeLinecap="round"
                />
                <circle
                  cx="181"
                  cy="92"
                  r="10"
                  fill={isSinging ? trimColor : "#475569"}
                  stroke="#090B10"
                  strokeWidth="4"
                />
              </g>
            </g>
          </svg>
        )}
      </div>

      {/* Character Identity Nameplate */}
      <div
        className={`px-3 py-1 rounded-md border-2 border-[#090B10] bg-[#141824] shadow-[0_3px_0_#05070B] text-center ${
          compact ? "min-w-[116px]" : "min-w-[148px]"
        }`}
      >
        <div className="flex items-center justify-center gap-1.5">
          <span
            className="inline-block w-2.5 h-2.5 rounded-sm border border-[#090B10]"
            style={{ backgroundColor: jacketColor }}
          />
          <span className="text-xs font-extrabold tracking-wide uppercase text-[#F8FAFC]">
            {name}
          </span>
        </div>
        {title && (
          <div className="text-[11px] font-medium text-[#CBD5E1] truncate max-w-[160px]">
            {title}
          </div>
        )}
      </div>
    </div>
  );
}

