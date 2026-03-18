import "../styles/globals.css";
import Head from "next/head";
import React, { useEffect, useState } from "react";
import { SessionProvider } from "next-auth/react";
import useSWR, { SWRConfig } from "swr";

function MyApp({ Component, pageProps: { session, ...pageProps } }) {
  const { user } = pageProps;

  return (
    <>
      <Head>
        <meta name="yandex-verification" content="9325bf802941bfe4" />
      </Head>
      <SWRConfig value={{ refreshInterval: 500 }}>
        <SessionProvider session={session}>
          <Component {...pageProps} />
        </SessionProvider>
      </SWRConfig>
    </>
  );
}

export default MyApp;
