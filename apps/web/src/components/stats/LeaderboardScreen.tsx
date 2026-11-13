import { useEffect } from "react";
import { AudioManager } from "../../game/engine/AudioManager";
import type { BestScoresMap } from "../../game/storage/bestScores";
import type { ChartFile } from "../../game/types/chart";

interface LeaderboardScreenProps {
  charts: ChartFile[];
  bestScores: BestScoresMap;
  onBack: () => void;
}

export function LeaderboardScreen({ charts, bestScores, onBack }: LeaderboardScreenProps) {
  const audio = AudioManager.getInstance();

  useEffect(() => {
    audio.playMenuMusic();
  }, [audio]);

  const handleBack = (): void => {
    audio.playCancel();
    onBack();
  };

  return (
    <div className="relative min-h-dvh w-full overflow-hidden flex flex-col justify-between select-none">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center filter hue-rotate-[90deg] brightness-90"
        style={{ backgroundImage: "url('/assets/images/menu/menuDesat.png')" }}
      />
      <div className="absolute inset-0 bg-black/55 backdrop-blur-[2px]" />

      {/* Header */}
      <header className="relative z-10 pt-6 px-6 max-w-5xl mx-auto w-full flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleBack}
            className="min-h-[44px] px-4 py-2 rounded-xl bg-[#000000]/70 border-2 border-[#FDE047] text-white font-black text-sm uppercase hover:bg-black transition-transform active:translate-y-0.5"
          >
            ◀ BACK (ESC)
          </button>
          <h2 className="text-2xl sm:text-3xl font-black italic tracking-wider text-white uppercase drop-shadow-[0_4px_0_#000]">
            HALL OF FAME LEADERBOARD
          </h2>
        </div>
      </header>

      {/* Main Table */}
      <main className="relative z-10 my-auto py-6 px-4 sm:px-8 max-w-5xl mx-auto w-full">
        <div className="bg-black/85 border-4 border-[#FDE047] shadow-[0_8px_0_#000] rounded-2xl p-6 overflow-hidden transform -skew-x-2">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-white">
              <thead>
                <tr className="border-b-2 border-white/20 text-xs font-black uppercase tracking-wider text-[#FDE047]">
                  <th className="pb-3 px-3"># Track Title</th>
                  <th className="pb-3 px-3">Difficulty</th>
                  <th className="pb-3 px-3">BPM</th>
                  <th className="pb-3 px-3 text-right">Best Score</th>
                  <th className="pb-3 px-3 text-right">Accuracy</th>
                  <th className="pb-3 px-3 text-right">Max Combo</th>
                  <th className="pb-3 px-3 text-center">Rank</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10 font-bold">
                {charts.map((chart, index) => {
                  const record = bestScores[chart.id];
                  const hasClear = Boolean(record && record.score > 0);
                  const acc = record?.accuracy ?? 0;
                  const rankBadge = !hasClear
                    ? "UNPLAYED"
                    : acc >= 98
                    ? "SICK!!"
                    : acc >= 90
                    ? "GOOD"
                    : "PASS";

                  return (
                    <tr key={chart.id} className="hover:bg-white/5 transition-colors">
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-2">
                          <span className="text-[#FDE047] font-black">{index + 1}.</span>
                          <span className="font-black text-base">{chart.title}</span>
                          <span className="text-xs text-gray-400 font-semibold">
                            (vs {chart.artist})
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-3">
                        <span className="px-2 py-0.5 rounded bg-[#1E2436] text-[11px] font-black uppercase text-[#38BDF8] border border-white/20">
                          {chart.difficulty}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 tabular-nums text-gray-300">{chart.bpm}</td>
                      <td className="py-3.5 px-3 text-right tabular-nums font-black text-[#FDE047] text-base">
                        {record ? record.score.toLocaleString() : "--"}
                      </td>
                      <td className="py-3.5 px-3 text-right tabular-nums text-[#34D399]">
                        {record ? `${record.accuracy.toFixed(1)}%` : "--"}
                      </td>
                      <td className="py-3.5 px-3 text-right tabular-nums text-[#38BDF8]">
                        {record ? `${record.maxCombo}x` : "--"}
                      </td>
                      <td className="py-3.5 px-3 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded text-xs font-black uppercase ${
                            rankBadge === "SICK!!"
                              ? "bg-[#E11D48] text-white"
                              : rankBadge === "GOOD"
                              ? "bg-[#0284C7] text-white"
                              : rankBadge === "PASS"
                              ? "bg-[#34D399] text-black"
                              : "bg-gray-800 text-gray-400"
                          }`}
                        >
                          {rankBadge}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 pb-6 text-center text-xs font-black text-white drop-shadow-[0_2px_0_#000]">
        Clear tracks with high accuracy to earn the coveted SICK!! rank.
      </footer>
    </div>
  );
}
