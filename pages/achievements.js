import Head from "next/head";
import Layout from "../components/Layout";
import React from "react";
import { useSession, getSession } from "next-auth/react";
import { useRouter } from "next/router";
import { ru } from "../components/messages/ru";
import { en } from "../components/messages/en";
import { useGetMongo } from "../components/api";
import Achievments from "../components/details/achievments";
import CircularProgress from "@mui/material/CircularProgress";

export default function AchievementsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const t = router.locale === "en" ? en : ru;

  const fetchId = session ? session.user._id : "default";
  const { data: list, isLoading } = useGetMongo(fetchId, "defaultlist");

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <CircularProgress sx={{ color: "#8B5CF6" }} size={32} />
        </div>
      </Layout>
    );
  }

  const games = list?.games || [];

  return (
    <>
      <Head>
        <title>{t.ach_title} | BoardGamerFun</title>
      </Head>
      <Layout>
        <div className="space-y-6">
          <h1 className="text-2xl font-bold text-text-primary">{t.ach_title}</h1>
          <p className="text-sm text-text-secondary">{t.ach_desc}</p>
          {games.length > 0 ? (
            <Achievments data={games} compact={false} />
          ) : (
            <div className="glass-card p-12 text-text-muted text-center text-sm">
              {t.list_empty}
            </div>
          )}
        </div>
      </Layout>
    </>
  );
}

export async function getServerSideProps(ctx) {
  return { props: { session: await getSession(ctx) } };
}
