import React, { useState } from "react";
import { signIn, getSession } from "next-auth/react";
import Head from "next/head";
import Layout from "../../components/Layout";
import { ru } from "../../components/messages/ru";
import { en } from "../../components/messages/en";
import { useRouter } from "next/router";
import copy from "copy-to-clipboard";

export default function SignIn() {
  const router = useRouter();
  const t = router.locale === "en" ? en : ru;
  const [mode, setMode] = useState("login"); // login | register | showSeed
  const [seed, setSeed] = useState("");
  const [generatedSeed, setGeneratedSeed] = useState("");
  const [generatedUsername, setGeneratedUsername] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    const result = await signIn("credentials", { seed, redirect: false });
    if (result?.error) {
      setError(t.auth_invalid_seed);
    } else {
      router.push("/");
    }
  };

  const handleRegister = async () => {
    setError("");
    const res = await fetch("/api/auth/register", { method: "POST" });
    if (!res.ok) {
      setError(t.autherror);
      return;
    }
    const data = await res.json();
    setGeneratedSeed(data.seed);
    setGeneratedUsername(data.username);
    setMode("showSeed");
  };

  const handleCopySeed = () => {
    copy(generatedSeed);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSeedSaved = async () => {
    const result = await signIn("credentials", { seed: generatedSeed, redirect: false });
    if (result?.error) {
      setError(result.error);
    } else {
      router.push("/");
    }
  };

  return (
    <>
      <Head>
        <title>{t.singin} | BoardGamerFun</title>
      </Head>
      <Layout>
        <div className="flex justify-center">
          <div className="max-w-lg w-full py-14">
            {mode === "showSeed" ? (
              /* Show generated seed */
              <div className="glass-card p-8 space-y-6">
                <h2 className="text-xl font-bold text-text-primary text-center">
                  {t.auth_your_seed}
                </h2>
                <p className="text-sm text-text-secondary text-center">
                  {t.auth_save_seed_warning}
                </p>

                <div className="text-sm text-text-muted text-center">
                  {t.auth_your_name}: <span className="text-accent font-semibold">{generatedUsername}</span>
                </div>

                <div className="bg-bg-glass rounded-xl p-4 border border-border">
                  <div className="grid grid-cols-3 gap-2">
                    {generatedSeed.split(" ").map((word, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm">
                        <span className="text-text-muted text-xs w-5 text-right">{i + 1}.</span>
                        <span className="text-text-primary font-mono">{word}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleCopySeed}
                    className="flex-1 py-3 text-sm font-medium rounded-xl border border-border text-text-secondary hover:text-text-primary hover:border-accent transition-all"
                  >
                    {copied ? "✓" : t.auth_copy_seed}
                  </button>
                  <button
                    onClick={handleSeedSaved}
                    className="flex-1 py-3 text-sm font-semibold rounded-xl text-white bg-accent hover:bg-accent-light transition-all"
                  >
                    {t.auth_seed_saved}
                  </button>
                </div>
              </div>
            ) : (
              /* Login / Register */
              <div className="glass-card p-8 space-y-6">
                <h2 className="text-xl font-bold text-text-primary text-center">
                  {mode === "login" ? t.authtitle : t.authregister}
                </h2>

                {mode === "login" ? (
                  <form onSubmit={handleLogin} className="space-y-4">
                    <textarea
                      value={seed}
                      onChange={(e) => setSeed(e.target.value)}
                      placeholder={t.auth_enter_seed}
                      rows={3}
                      required
                      className="input-dark w-full font-mono text-sm"
                    />
                    {error && <p className="text-danger text-sm text-center">{error}</p>}
                    <button
                      type="submit"
                      className="w-full py-3 text-sm font-semibold rounded-xl text-white bg-accent hover:bg-accent-light transition-all"
                    >
                      {t.singin}
                    </button>
                  </form>
                ) : null}

                {mode === "register" ? (
                  <div className="space-y-4">
                    <p className="text-sm text-text-secondary text-center">
                      {t.auth_register_desc}
                    </p>
                    {error && <p className="text-danger text-sm text-center">{error}</p>}
                    <button
                      onClick={handleRegister}
                      className="w-full py-3 text-sm font-semibold rounded-xl text-white bg-accent hover:bg-accent-light transition-all"
                    >
                      {t.auth_generate_seed}
                    </button>
                  </div>
                ) : null}

                <div className="text-center">
                  <button
                    onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }}
                    className="text-text-secondary hover:text-accent text-sm transition-colors"
                  >
                    {mode === "login" ? t.authnoaccont : t.authhasaccount}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </Layout>
    </>
  );
}

export async function getServerSideProps(context) {
  const session = await getSession(context);
  if (session) return { redirect: { destination: "/" } };
  return { props: {} };
}
