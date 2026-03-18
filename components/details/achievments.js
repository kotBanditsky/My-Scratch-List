import { ru } from "../messages/ru";
import { en } from "../messages/en";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import Link from "next/link";
import React, { useState } from "react";

const ACHIEVEMENTS = [
  { key: "ach_first", icon: "⭐", threshold: 1, type: "count" },
  { key: "ach_five", icon: "🖐", threshold: 5, type: "count" },
  { key: "ach_ten", icon: "🔟", threshold: 10, type: "count" },
  { key: "ach_twenty", icon: "🎲", threshold: 20, type: "count" },
  { key: "ach_quarter", icon: "🏅", threshold: 25, type: "count" },
  { key: "ach_thirty", icon: "🎪", threshold: 30, type: "count" },
  { key: "ach_half", icon: "🌟", threshold: 50, type: "count" },
  { key: "ach_sixty", icon: "🔥", threshold: 60, type: "count" },
  { key: "ach_three_q", icon: "💫", threshold: 75, type: "count" },
  { key: "ach_ninety", icon: "🚀", threshold: 90, type: "count" },
  { key: "ach_full", icon: "🏆", threshold: 100, type: "count" },
  { key: "ach_number_one", icon: "👑", threshold: 1, type: "top1" },
  { key: "ach_top3", icon: "🥇", threshold: 3, type: "top3" },
  { key: "ach_top5", icon: "🎖", threshold: 5, type: "top5" },
  { key: "ach_top10", icon: "🎯", threshold: 10, type: "top10" },
  { key: "ach_top20", icon: "💎", threshold: 20, type: "top20" },
  { key: "ach_bottom10", icon: "🔮", threshold: 10, type: "bottom10" },
  { key: "ach_serial", icon: "⚡", threshold: 3, type: "serial" },
  { key: "ach_explorer", icon: "🧭", threshold: 1, type: "explorer" },
  { key: "ach_perfectionist", icon: "✨", threshold: 100, type: "count" },
];

export { ACHIEVEMENTS };

export function calcAchievementStats(data) {
  let scratched = 0, top1 = false, top3 = 0, top5 = 0, top10 = 0, top20 = 0, bottom10 = 0;
  const total = data.length;
  data.forEach((item, i) => {
    if (item.scratched) {
      scratched++;
      if (i === 0) top1 = true;
      if (i < 3) top3++;
      if (i < 5) top5++;
      if (i < 10) top10++;
      if (i < 20) top20++;
      if (i >= total - 10) bottom10++;
    }
  });
  return { scratched, top1, top3, top5, top10, top20, bottom10, total };
}

export function isUnlocked(ach, stats) {
  switch (ach.type) {
    case "count": return stats.scratched >= ach.threshold;
    case "top1": return stats.top1;
    case "top3": return stats.top3 >= 3;
    case "top5": return stats.top5 >= 5;
    case "top10": return stats.top10 >= 10;
    case "top20": return stats.top20 >= 20;
    case "bottom10": return stats.bottom10 >= 10;
    case "serial": return stats.scratched >= 3;
    case "explorer": return stats.scratched >= 1;
    default: return false;
  }
}

export function getProgress(ach, stats) {
  switch (ach.type) {
    case "count": return `${Math.min(stats.scratched, ach.threshold)}/${ach.threshold}`;
    case "top1": return stats.top1 ? "✓" : "—";
    case "top3": return `${stats.top3}/3`;
    case "top5": return `${stats.top5}/5`;
    case "top10": return `${stats.top10}/10`;
    case "top20": return `${stats.top20}/20`;
    case "bottom10": return `${stats.bottom10}/10`;
    case "serial": return stats.scratched >= 3 ? "✓" : "—";
    case "explorer": return stats.scratched >= 1 ? "✓" : "—";
    default: return "";
  }
}

function AchievementIcon({ ach, unlocked, t, stats, showTooltip = true }) {
  const [hover, setHover] = useState(false);

  return (
    <span
      className="relative cursor-default text-xl"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <span className={unlocked ? "" : "grayscale opacity-20"}>{ach.icon}</span>
      {showTooltip && hover && (
        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2.5 rounded-xl bg-[#16152a] border border-border text-text-primary shadow-2xl min-w-[200px]" style={{ zIndex: 9990 }}>
          <span className="block text-sm font-semibold">{t[ach.key]}</span>
          {t[ach.key + "_desc"] && (
            <span className="block text-xs text-text-secondary mt-0.5">{t[ach.key + "_desc"]}</span>
          )}
          <span className="block text-xs text-accent mt-1 font-medium">{getProgress(ach, stats)}</span>
          <span className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-[#16152a]" />
        </span>
      )}
    </span>
  );
}

export default function Achievments({ data, compact = true }) {
  const router = useRouter();
  const { data: session } = useSession();
  const t = router.locale === "en" ? en : ru;
  const stats = calcAchievementStats(data);
  const unlockedCount = ACHIEVEMENTS.filter((a) => isUnlocked(a, stats)).length;

  if (compact) {
    return (
      <div className="flex items-center gap-3 py-1">
        <div className="flex gap-1.5 flex-wrap">
          {ACHIEVEMENTS.map((ach) => (
            <AchievementIcon
              key={ach.key}
              ach={ach}
              unlocked={isUnlocked(ach, stats)}
              t={t}
              stats={stats}
            />
          ))}
        </div>
        <Link href="/achievements">
          <a className="text-sm text-text-muted hover:text-accent transition-colors whitespace-nowrap">
            {unlockedCount}/{ACHIEVEMENTS.length}
          </a>
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
      {ACHIEVEMENTS.map((ach) => {
        const unlocked = isUnlocked(ach, stats);
        return (
          <div
            key={ach.key}
            className={`glass-card flex flex-col items-center justify-center py-5 px-3 transition-all ${
              unlocked ? "border-border-glow shadow-glow" : ""
            }`}
          >
            <span className={`text-3xl mb-3 ${unlocked ? "" : "grayscale opacity-30"}`}>
              {ach.icon}
            </span>
            <p className={`text-sm font-semibold text-center mb-1 ${
              unlocked ? "text-accent-light" : "text-text-muted"
            }`}>
              {t[ach.key]}
            </p>
            <p className={`text-xs text-center ${
              unlocked ? "text-text-secondary" : "text-text-muted"
            }`}>
              {t[ach.key + "_desc"] || ""}
            </p>
            {session && (
              <p className={`text-xs mt-2 font-medium ${
                unlocked ? "text-accent" : "text-text-muted"
              }`}>
                {getProgress(ach, stats)}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
