import React, { useState } from "react";
import Head from "next/head";
import Layout from "../../components/Layout";
import { getSession, useSession } from "next-auth/react";
import { useAtom } from "jotai";
import { isOpeningAll } from "../../components/atoms/atoms";
import copy from "copy-to-clipboard";
import { universalPost, useGetMongo } from "../../components/api";
import { useRouter } from "next/router";
import { ru } from "../../components/messages/ru";
import { en } from "../../components/messages/en";
import {
  LinkIcon,
  DocumentDuplicateIcon,
  UserIcon,
  InboxArrowDownIcon,
} from "@heroicons/react/24/outline";

export default function Account() {
  const { data: session } = useSession();
  const router = useRouter();
  const t = router.locale === "en" ? en : ru;
  const [openingall, setOpeningAll] = useAtom(isOpeningAll);
  const [showDelete, setShowDelete] = useState(false);
  const [deleter, setDeleter] = useState("");

  function UserInfo() {
    const [inputName, setInputName] = useState("");
    const { data, isLoading, isError, mutate } = useGetMongo(
      session.user._id,
      "userlog"
    );

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

    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const profileUrl = `${origin}/user/${session.user.username}`;

    const copyToClipboard = () => {
      setOpeningAll({ opening: true, severity: "success", alerttext: t.linkcopied });
      copy(profileUrl);
    };

    function onSubmitName() {
      if (!inputName.trim()) return;
      universalPost(
        session.user.id,
        JSON.stringify({
          userId: session.user._id,
          name: inputName,
          methodic: "uniapisavenickname",
        }),
        "uniapisavenickname",
        t.savedname
      ).then((result) => setOpeningAll(result));
      setInputName("");
    }

    const userData = data?.[0];
    if (!userData) {
      return <div className="text-text-muted text-center py-20 text-sm">{t.errs}</div>;
    }

    let datesub = new Date();
    if (userData._id) {
      const timestamp = userData._id.toString().substring(0, 8);
      datesub = new Date(parseInt(timestamp, 16) * 1000);
    }

    function handleDelete() {
      universalPost(
        session.user._id,
        JSON.stringify({
          seedHash: userData?.seedHash,
          methodic: "uniapideaccount",
        }),
        "uniapideaccount",
        t.admin_deleted
      ).then(() => router.push("/"));
    }

    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-text-primary">{t.profileinfo}</h1>

        <div className="glass-card divide-y divide-border">
          {/* Name */}
          <div className="p-4 flex flex-col sm:flex-row sm:items-center gap-3">
            <span className="text-sm text-text-secondary w-40 flex-shrink-0">{t.profilename}</span>
            <span className="text-sm text-text-primary">{userData.name}</span>
          </div>

          {/* Profile link */}
          <div className="p-4 flex flex-col sm:flex-row sm:items-center gap-3">
            <span className="text-sm text-text-secondary w-40 flex-shrink-0">{t.profilelink}</span>
            <div className="flex items-center gap-2 flex-1">
              <LinkIcon className="h-4 w-4 text-text-muted flex-shrink-0" />
              <span className="flex-1 px-3 py-2 text-sm text-accent truncate">{profileUrl}</span>
              <button
                onClick={copyToClipboard}
                className="p-2 bg-accent hover:bg-accent-light text-white rounded-lg transition-all"
                title={t.profilecopy}
              >
                <DocumentDuplicateIcon className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Registration date */}
          <div className="p-4 flex flex-col sm:flex-row sm:items-center gap-3">
            <span className="text-sm text-text-secondary w-40 flex-shrink-0">{t.profiledate}</span>
            <span className="text-sm text-text-primary">{datesub.toISOString().substring(0, 10)}</span>
          </div>

        </div>

        {/* Delete account */}
        <div className="pt-4">
          {!showDelete ? (
            <button
              onClick={() => setShowDelete(true)}
              className="text-xs text-text-muted hover:text-danger transition-colors"
            >
              {t.profileedelete}
            </button>
          ) : (
            <div className="glass-card p-4 space-y-3">
              <p className="text-sm text-danger font-medium">{t.profilealert}</p>
              <p className="text-xs text-text-secondary">{t.profiledeldesc}</p>
              <input
                type="text"
                value={deleter}
                onChange={(e) => setDeleter(e.target.value)}
                placeholder={t.profileform}
                className="w-full px-3 py-2 text-sm bg-bg-glass border border-border rounded-lg text-text-primary focus:border-danger focus:outline-none transition-colors"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleDelete}
                  disabled={deleter !== t.profiledel}
                  className="px-4 py-2 text-xs bg-danger hover:bg-danger/80 text-white rounded-lg disabled:opacity-30 transition-all"
                >
                  {t.profileedelete}
                </button>
                <button
                  onClick={() => { setShowDelete(false); setDeleter(""); }}
                  className="px-4 py-2 text-xs text-text-secondary border border-border rounded-lg hover:bg-bg-glass-hover transition-all"
                >
                  {t.profilecancel}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{t.profiletitle} | BoardGamerFun</title>
      </Head>
      <Layout>
        {session ? (
          <UserInfo />
        ) : (
          <div className="text-text-muted text-center py-20 text-sm">{t.offlenealert}</div>
        )}
      </Layout>
    </>
  );
}

export async function getServerSideProps(ctx) {
  return { props: { session: await getSession(ctx) } };
}
