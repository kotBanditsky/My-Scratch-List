import React, { useState } from "react";
import { useSession, signIn } from "next-auth/react";
import copy from "copy-to-clipboard";
import { useAtom } from "jotai";
import { isOpeningAll } from "./atoms/atoms";
import { useRouter } from "next/router";
import { ru } from "./messages/ru";
import { en } from "./messages/en";

const LinkButton = () => {
  const [openingall, setOpeningAll] = useAtom(isOpeningAll);
  const { data: session } = useSession();
  const router = useRouter();
  const t = router.locale === "en" ? en : ru;

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const username = session ? session.user.username : "";
  const profileUrl = `${origin}/user/${username}`;

  const copyToClipboard = () => {
    setOpeningAll({ opening: true, severity: "success", alerttext: t.linkcopied });
    copy(profileUrl);
  };

  if (session) {
    return (
      <div
        onClick={copyToClipboard}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-bg-glass border border-border cursor-pointer hover:border-border-glow transition-all"
      >
        <span className="flex-1 text-xs text-accent truncate">{profileUrl}</span>
      </div>
    );
  }

  return (
    <button
      onClick={() => signIn()}
      className="text-xs text-text-muted hover:text-accent transition-colors"
    >
      {t.topinfo}
    </button>
  );
};

export default LinkButton;
