import React, { useState } from "react";
import { ru } from "./messages/ru";
import { en } from "./messages/en";
import { useRouter } from "next/router";
import TopGrid from "./grid/TopGrid";
import { useGetMongo } from "./api";
import CircularProgress from "@mui/material/CircularProgress";
import Achievments from "./details/achievments";

const OffLoader = () => {
  const router = useRouter();
  const { username } = router.query;
  const t = router.locale === "en" ? en : ru;
  const [selectedSlug, setSelectedSlug] = useState(null);

  const { data: lists } = useGetMongo("sidebar", "alltoplists");
  const { data: userData } = useGetMongo(username || "x", "offlineuser");

  // Find default list or selected list
  const activeSlug = selectedSlug || lists?.find((l) => l.isDefault)?.slug;
  const { data: list, isLoading } = useGetMongo(activeSlug || "x", "toplist");

  if (isLoading || !lists) {
    return (
      <div className="flex justify-center items-center h-64">
        <CircularProgress sx={{ color: "#8B5CF6" }} size={32} />
      </div>
    );
  }

  // Merge scratch status from user data
  const games = (list?.games || []).map((game) => {
    const userGames = userData?.[0]?.games || [];
    const scratched = userGames.find((ug) => ug.name === game.title);
    if (scratched) {
      return {
        ...game,
        scratched: true,
        scratchedtime: new Date(scratched.date).toLocaleDateString(),
      };
    }
    return game;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        {list?.imageBase64 ? (
          <img src={list.imageBase64} alt={list.name} className="w-28 h-28 rounded-xl object-cover border border-border flex-shrink-0" />
        ) : (
          <div className="w-28 h-28 rounded-xl bg-bg-glass border border-border flex items-center justify-center flex-shrink-0">
            <span className="text-3xl">📋</span>
          </div>
        )}
        <div>
          <p className="text-sm text-text-secondary mb-1">{t.off}</p>
          <h1 className="text-2xl font-bold text-accent mb-1">{username}</h1>
          <h2 className="text-lg font-semibold text-gradient">{list?.name || ""}</h2>
          {list?.description && (
            <p className="text-sm text-text-muted mt-1">{list.description}</p>
          )}
        </div>
      </div>

      {/* List selector */}
      {lists && lists.length > 1 && (
        <div className="flex gap-2 flex-wrap">
          {lists.map((l) => (
            <button
              key={l._id}
              onClick={() => setSelectedSlug(l.slug)}
              className={`px-3 py-1.5 rounded-lg text-sm transition-all border ${
                activeSlug === l.slug
                  ? "bg-accent text-white border-accent"
                  : "bg-bg-glass text-text-secondary border-border hover:border-accent/50"
              }`}
            >
              {l.name}
            </button>
          ))}
        </div>
      )}

      {/* Achievements + Grid */}
      {games.length > 0 ? (
        <>
          <Achievments data={games} />
          <TopGrid data={games} />
        </>
      ) : (
        <div className="glass-card p-12 text-text-muted text-center text-sm">{t.list_empty}</div>
      )}
    </div>
  );
};

export default OffLoader;
