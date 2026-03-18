import Head from "next/head";
import Layout from "../../components/Layout";
import React from "react";
import { useRouter } from "next/router";
import { ru } from "../../components/messages/ru";
import { en } from "../../components/messages/en";
import OffLoader from "../../components/OffLoader";

export default function UserProfile() {
  const router = useRouter();
  const { username } = router.query;
  const t = router.locale === "en" ? en : ru;

  return (
    <>
      <Head>
        <title>
          {t.userpage} {username} | BoardGamerFun
        </title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Layout>
        <OffLoader />
      </Layout>
    </>
  );
}
