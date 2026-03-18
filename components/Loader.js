import TopGrid from "./grid/TopGrid";
import React from "react";
import { useSession } from "next-auth/react";
import { ru } from "./messages/ru";
import { en } from "./messages/en";
import { useRouter } from "next/router";
import Achievments from "./details/achievments";
import { useGetMongo } from "./api";

const Loader = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const t = router.locale === "en" ? en : ru;

  const fetchId = session ? session.user._id : "default";
  const { data: list, isLoading, isError } = useGetMongo(fetchId, "defaultlist");

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="spinner" />
      </div>
    );
  }

  if (isError) {
    return <div className="text-danger text-center py-20 text-sm">{t.errs}</div>;
  }

  const games = list?.games || [];
  const listName = list?.name || t.toptitle;
  const listDesc = list?.description || t.topsubtitle;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        {list?.imageBase64 ? (
          <img src={list.imageBase64} alt={listName} className="w-28 h-28 rounded-xl object-cover border border-border flex-shrink-0" />
        ) : (
          <div className="w-28 h-28 rounded-xl bg-bg-glass border border-border flex items-center justify-center flex-shrink-0">
            <span className="text-2xl">📋</span>
          </div>
        )}
        <div>
          <h1 className="text-2xl font-bold text-gradient">{listName}</h1>
          <p className="text-sm text-text-secondary mt-1">{listDesc}</p>
        </div>
      </div>

      {/* Achievements */}
      {games.length > 0 && <Achievments data={games} />}

      {/* Grid */}
      {games.length > 0 ? (
        <TopGrid data={games} />
      ) : (
        <div className="glass-card p-12 text-text-muted text-center text-sm">{t.list_empty}</div>
      )}
    </div>
  );
};

export default Loader;
