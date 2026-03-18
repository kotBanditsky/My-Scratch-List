import Head from "next/head";
import Layout from "../../components/Layout";
import React, { useState } from "react";
import { getSession } from "next-auth/react";
import { useRouter } from "next/router";
import { ru } from "../../components/messages/ru";
import { en } from "../../components/messages/en";
import { useGetMongo, universalPost } from "../../components/api";
import CircularProgress from "@mui/material/CircularProgress";
import Link from "next/link";
import {
  PencilIcon,
  TrashIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import { StarIcon as StarIconSolid } from "@heroicons/react/24/solid";

const STYLE_KEYS = [
  { value: "digital painting", key: "style_painting", icon: "🎨" },
  { value: "photorealistic", key: "style_realism", icon: "📷" },
  { value: "cinematic lighting, movie scene", key: "style_cinematic", icon: "🎬" },
  { value: "concept art, illustration", key: "style_art", icon: "🖼" },
  { value: "vibrant colors, saturated", key: "style_vibrant", icon: "🌈" },
  { value: "dark moody atmosphere", key: "style_dark", icon: "🌑" },
  { value: "minimalist, clean", key: "style_minimal", icon: "◻️" },
  { value: "watercolor painting", key: "style_watercolor", icon: "💧" },
  { value: "3d render, octane", key: "style_3d", icon: "🧊" },
  { value: "anime style, manga", key: "style_anime", icon: "🏮" },
  { value: "retro vintage, 80s", key: "style_retro", icon: "📼" },
  { value: "fantasy, magical, ethereal", key: "style_fantasy", icon: "✨" },
  { value: "noir, black and white, high contrast", key: "style_noir", icon: "🖤" },
  { value: "pixel art, 8-bit", key: "style_pixel", icon: "👾" },
  { value: "oil painting, classical", key: "style_oil", icon: "🖌" },
  { value: "neon glow, cyberpunk", key: "style_neon", icon: "💜" },
];

export default function AdminPanel() {
  const router = useRouter();
  const t = router.locale === "en" ? en : ru;
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newPrompt, setNewPrompt] = useState("");
  const [settingsModel, setSettingsModel] = useState("");
  const [styleTags, setStyleTags] = useState(null);

  const { data: lists, isLoading, mutate } = useGetMongo("admin", "alltoplists");
  const { data: settings } = useGetMongo("admin", "adminsettings");
  const { data: models } = useGetMongo("admin", "togethermodels");

  if (isLoading) {
    return (
      <Layout>
        <div className="w-full h-screen flex justify-center pt-20">
          <CircularProgress sx={{ color: "#D4AF37" }} />
        </div>
      </Layout>
    );
  }

  const inputClass = "input-dark";

  const handleCreate = async () => {
    if (!newName.trim()) return;
    await universalPost("admin", JSON.stringify({
      methodic: "createtoplist", name: newName, description: newDesc, imagePrompt: newPrompt,
    }), "createtoplist", t.admin_saved);
    setNewName(""); setNewDesc(""); setNewPrompt("");
    setShowCreate(false); mutate();
  };

  const handleDelete = async (listId) => {
    if (!confirm(t.admin_confirm_delete)) return;
    await universalPost(listId, JSON.stringify({ methodic: "deletetoplist" }), "deletetoplist", t.admin_deleted);
    mutate();
  };

  const handleSetDefault = async (listId) => {
    await universalPost(listId, JSON.stringify({ methodic: "setdefaultlist" }), "setdefaultlist", t.admin_saved);
    mutate();
  };

  const handleSaveSettings = async () => {
    await universalPost("admin", JSON.stringify({
      methodic: "savesettings",
      imageModel: settingsModel || settings?.imageModel,
      styleTags: styleTags ?? settings?.styleTags ?? [],
    }), "savesettings", t.admin_saved);
  };

  return (
    <>
      <Head>
        <title>{t.admin_title} | BoardGamerFun</title>
      </Head>

      <Layout>
        <div className="py-8 max-w-4xl mx-auto">
          <h1 className="text-3xl font-semibold text-text-primary mb-8">
            {t.admin_title}
          </h1>

          <div className="mb-6">
            <button
              onClick={() => setShowCreate(!showCreate)}
              className="flex items-center gap-2 px-5 py-2.5 bg-accent hover:bg-accent-light text-white rounded-xl font-semibold transition-all duration-300"
            >
              <PlusIcon className="h-5 w-5" />
              {t.admin_create_list}
            </button>
          </div>

          {showCreate && (
            <div className="glass-card p-6 mb-6 space-y-4">
              <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)}
                placeholder={t.admin_list_name} className={inputClass} />
              <textarea value={newDesc} onChange={(e) => setNewDesc(e.target.value)}
                placeholder={t.admin_list_desc} className={inputClass} rows={3} />
              <input type="text" value={newPrompt} onChange={(e) => setNewPrompt(e.target.value)}
                placeholder={t.admin_image_prompt} className={inputClass} />
              <button onClick={handleCreate}
                className="px-6 py-2.5 bg-accent hover:bg-accent-light text-white rounded-xl font-semibold transition-all duration-300">
                {t.admin_save}
              </button>
            </div>
          )}

          <div className="space-y-3">
            {lists && lists.map((list) => (
              <div key={list._id}
                className="glass-card hover:border-border-glow p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all duration-300">
                <div className="flex items-center gap-3 flex-1">
                  {list.imageBase64 ? (
                    <img src={list.imageBase64} alt={list.name} className="w-12 h-12 rounded-xl object-cover border border-border" />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-bg-elevated border border-border flex items-center justify-center">
                      <span className="text-text-muted text-xs">—</span>
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-semibold text-text-primary">{list.name}</h3>
                      {list.isDefault && <StarIconSolid className="h-4 w-4 text-accent" />}
                    </div>
                    <p className="text-text-muted text-sm">{list.description}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link href={`/admin/list/${list.slug}`}>
                    <a className="p-2 border border-border hover:border-gold/30 text-text-secondary hover:text-accent rounded-xl transition-all duration-300">
                      <PencilIcon className="h-4 w-4" />
                    </a>
                  </Link>
                  {!list.isDefault && (
                    <button onClick={() => handleDelete(list._id)}
                      className="p-2 border border-border hover:border-accent-red/30 text-text-secondary hover:text-accent-red rounded-xl transition-all duration-300">
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Settings */}
          <div className="mt-12 glass-card p-6 space-y-6">
            <h2 className="text-xl font-semibold text-text-primary">{t.admin_settings}</h2>

            <div>
              <label className="block text-text-secondary text-sm mb-2">{t.admin_set_default}</label>
              <select value={lists?.find((l) => l.isDefault)?._id || ""} onChange={(e) => handleSetDefault(e.target.value)}
                className={inputClass}>
                {lists && lists.map((l) => (
                  <option key={l._id} value={l._id}>{l.name}{l.isDefault ? " ★" : ""}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-text-secondary text-sm mb-2">{t.admin_model}</label>
              <select value={settingsModel || settings?.imageModel || "black-forest-labs/FLUX.1-schnell"}
                onChange={(e) => setSettingsModel(e.target.value)} className={inputClass}>
                {models && models.length > 0 ? (
                  models.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)
                ) : (
                  <option value="black-forest-labs/FLUX.1-schnell">FLUX.1 Schnell</option>
                )}
              </select>
            </div>

            {/* Style tags */}
            <div>
              <label className="block text-text-secondary text-sm mb-2">{t.admin_style_tags}</label>
              <div className="flex flex-wrap gap-2">
                {STYLE_KEYS.map((tag) => {
                  const active = (styleTags ?? settings?.styleTags ?? []).includes(tag.value);
                  return (
                    <button
                      key={tag.value}
                      onClick={() => {
                        const current = styleTags ?? settings?.styleTags ?? [];
                        if (active) {
                          setStyleTags(current.filter((v) => v !== tag.value));
                        } else {
                          setStyleTags([...current, tag.value]);
                        }
                      }}
                      className={`px-3 py-1.5 rounded-lg text-sm transition-all border ${
                        active
                          ? "bg-accent text-white border-accent"
                          : "bg-bg-glass text-text-secondary border-border hover:border-accent/50"
                      }`}
                    >
                      {tag.icon} {t[tag.key]}
                    </button>
                  );
                })}
              </div>
            </div>

            <button onClick={handleSaveSettings}
              className="px-6 py-2.5 bg-accent hover:bg-accent-light text-white rounded-xl font-semibold transition-all duration-300">
              {t.admin_save}
            </button>
          </div>
        </div>
      </Layout>
    </>
  );
}

export async function getServerSideProps(ctx) {
  const session = await getSession(ctx);
  if (!session || session.user.role !== "admin") {
    return { redirect: { destination: "/" } };
  }
  return { props: { session } };
}
