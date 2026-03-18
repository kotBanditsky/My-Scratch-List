import Head from "next/head";
import Layout from "../components/Layout";
import Loader from "../components/Loader";
import React from "react";
import { useSession, getSession } from "next-auth/react";
import { useRouter } from "next/router";
import { ru } from "../components/messages/ru";
import { en } from "../components/messages/en";

export default function Top() {
  const { data: session } = useSession();
  const router = useRouter();
  const t = router.locale === "en" ? en : ru;

  return (
    <>
      <Head>
        <title>{t.sitename} | BoardGamerFun</title>
        <meta
          name="description"
          content="Check your played board games online on BoardGamerFun | TOP-100 Board Games Scratch Poster Digital Edition"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Layout>
        <Loader />
      </Layout>
    </>
  );
}

export async function getServerSideProps(ctx) {
  return {
    props: {
      session: await getSession(ctx),
    },
  };
}
