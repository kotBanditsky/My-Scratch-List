import Head from "next/head";
import Layout from "../../components/Layout";
import React from "react";
import { useSession, getSession } from "next-auth/react";
import { useRouter } from "next/router";
import { ru } from "../../components/messages/ru";
import { en } from "../../components/messages/en";
import { useGetMongo } from "../../components/api";
import TopGrid from "../../components/grid/TopGrid";
import Achievments from "../../components/details/achievments";
import CircularProgress from "@mui/material/CircularProgress";

export default function ListPage() {
  const router = useRouter();
  const { slug } = router.query;
  const t = router.locale === "en" ? en : ru;
  const { data: list, isLoading, isError } = useGetMongo(slug || "x", "toplist");

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <CircularProgress sx={{ color: "#8B5CF6" }} size={32} />
        </div>
      </Layout>
    );
  }

  if (isError || !list) {
    return (
      <Layout>
        <div className="text-text-muted text-center py-20">{t.list_not_found}</div>
      </Layout>
    );
  }

  return (
    <>
      <Head>
        <title>{list.name} | BoardGamerFun</title>
        <meta name="description" content={list.description} />
      </Head>
      <Layout>
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            {list.imageBase64 ? (
              <img src={list.imageBase64} alt={list.name} className="w-28 h-28 rounded-xl object-cover border border-border flex-shrink-0" />
            ) : (
              <div className="w-28 h-28 rounded-xl bg-bg-glass border border-border flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">📋</span>
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold text-gradient">{list.name}</h1>
              {list.description && (
                <p className="text-sm text-text-secondary mt-1">{list.description}</p>
              )}
            </div>
          </div>

          {list.games?.length > 0 && <Achievments data={list.games} />}

          {list.games?.length > 0 ? (
            <TopGrid data={list.games} />
          ) : (
            <div className="glass-card p-12 text-text-muted text-center text-sm">{t.list_empty}</div>
          )}
        </div>
      </Layout>
    </>
  );
}

export async function getServerSideProps(ctx) {
  return { props: { session: await getSession(ctx) } };
}
