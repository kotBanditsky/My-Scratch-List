import Head from "next/head";
import Layout from "../../../components/Layout";
import React, { useState } from "react";
import { getSession } from "next-auth/react";
import { useRouter } from "next/router";
import { ru } from "../../../components/messages/ru";
import { en } from "../../../components/messages/en";
import { useGetMongo, universalPost } from "../../../components/api";
import { useAtom } from "jotai";
import { isOpeningAll } from "../../../components/atoms/atoms";
import {
  TrashIcon,
  PencilIcon,
  SparklesIcon,
  PlusIcon,
  ArrowUpTrayIcon,
  ArrowDownTrayIcon,
  CheckIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

export default function AdminListEditor() {
  const router = useRouter();
  const { slug } = router.query;
  const t = router.locale === "en" ? en : ru;
  const [, setOpeningAll] = useAtom(isOpeningAll);

  const { data: list, isLoading, mutate } = useGetMongo(slug || "x", "toplist");
  const { data: settings } = useGetMongo("admin", "adminsettings");

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [imagePrompt, setImagePrompt] = useState("");
  const [generating, setGenerating] = useState(false);
  const [coverPreview, setCoverPreview] = useState(null);
  const [initialized, setInitialized] = useState(false);

  // Add item form
  const [showAddItem, setShowAddItem] = useState(false);
  const [itemTitle, setItemTitle] = useState("");
  const [itemDesc, setItemDesc] = useState("");
  const [itemRank, setItemRank] = useState("");
  const [itemRating, setItemRating] = useState("");
  const [itemImage, setItemImage] = useState("");
  const [itemLink, setItemLink] = useState("");

  // Import
  const [showImport, setShowImport] = useState(false);
  const [importJson, setImportJson] = useState("");

  // Inline editing
  const [editingSlug, setEditingSlug] = useState(null);
  const [editForm, setEditForm] = useState({});

  // Image generation
  const [generatingItemSlug, setGeneratingItemSlug] = useState(null);
  const [batchGenerating, setBatchGenerating] = useState(false);
  const [batchProgress, setBatchProgress] = useState({ current: 0, total: 0 });

  if (list && !initialized) {
    setName(list.name || "");
    setDescription(list.description || "");
    setImagePrompt(list.imagePrompt || "");
    setInitialized(true);
  }

  if (isLoading || !list) {
    return (
      <Layout>
        <div className="w-full h-screen flex justify-center pt-20">
          <div className="spinner" />
        </div>
      </Layout>
    );
  }

  const model = settings?.imageModel || "black-forest-labs/FLUX.1-schnell";

  const handleSave = async () => {
    const result = await universalPost(
      list._id,
      JSON.stringify({ methodic: "updatetoplist", name, description, imagePrompt }),
      "updatetoplist",
      t.admin_saved
    );
    setOpeningAll(result);
    mutate();
  };

  const handleGenerateImage = async () => {
    const prompt = imagePrompt.trim() || description.trim();
    if (!prompt) return;
    setGenerating(true);
    const result = await fetch(`/api/universalpostapi/${list._id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ methodic: "generatepreview", prompt, model }),
    }).then((r) => r.json());
    setGenerating(false);
    if (result.imageBase64) {
      setCoverPreview(result.imageBase64);
    }
  };

  const handleSaveCover = async () => {
    if (!coverPreview) return;
    await universalPost(
      list._id,
      JSON.stringify({
        methodic: "updatetoplist",
        name,
        description,
        imagePrompt,
        imageBase64: coverPreview,
      }),
      "updatetoplist",
      t.admin_saved
    );
    setCoverPreview(null);
    mutate();
  };

  const handleAddItem = async () => {
    if (!itemTitle.trim()) return;
    await universalPost(
      list._id,
      JSON.stringify({
        methodic: "addgametolist",
        title: itemTitle,
        description: itemDesc,
        rank: itemRank,
        rating: itemRating,
        image: itemImage,
        link: itemLink,
      }),
      "addgametolist",
      t.admin_saved
    );
    setItemTitle(""); setItemDesc(""); setItemRank("");
    setItemRating(""); setItemImage(""); setItemLink("");
    setShowAddItem(false);
    mutate();
  };

  const handleRemoveItem = async (gameSlug) => {
    if (!confirm(t.admin_confirm_delete)) return;
    await universalPost(
      list._id,
      JSON.stringify({ methodic: "removegamefromlist", gameSlug }),
      "removegamefromlist",
      t.admin_deleted
    );
    mutate();
  };

  const handleImport = async () => {
    try {
      const items = JSON.parse(importJson);
      if (!Array.isArray(items)) throw new Error("Not an array");
      await universalPost(
        list._id,
        JSON.stringify({ methodic: "importgames", games: items }),
        "importgames",
        t.admin_saved
      );
      setImportJson(""); setShowImport(false);
      mutate();
    } catch (e) {
      alert("Invalid JSON: " + e.message);
    }
  };

  // Inline edit handlers
  const startEdit = (game) => {
    setEditingSlug(game.slug);
    setEditForm({
      title: game.title || "",
      rank: game.rank || "",
      rating: game.rating || "",
      description: game.description || "",
      image: game.image || "",
      link: game.link || "",
      imagePrompt: game.imagePrompt || "",
    });
  };

  const cancelEdit = () => {
    setEditingSlug(null);
    setEditForm({});
  };

  const saveEdit = async (gameSlug) => {
    const { imageBase64, ...fields } = editForm;

    // If preview image was generated, save it separately
    if (imageBase64) {
      await universalPost(
        list._id,
        JSON.stringify({
          methodic: "generategameimage",
          gameSlug,
          prompt: "_save_only_",
          model: "_skip_",
        }),
        "",
        ""
      ).catch(() => {});

      // Save image directly
      await fetch(`/api/universalpostapi/${list._id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          methodic: "savegameimage",
          gameSlug,
          imageBase64,
        }),
      });
    }

    await universalPost(
      list._id,
      JSON.stringify({
        methodic: "updategameinlist",
        gameSlug,
        ...fields,
      }),
      "updategameinlist",
      t.admin_saved
    );
    setEditingSlug(null);
    setEditForm({});
    mutate();
  };

  const handleGenerateItemImage = async (game) => {
    const editPrompt = editingSlug === game.slug ? editForm.imagePrompt : game.imagePrompt;
    const prompt = editPrompt || (game.description || "").trim();
    if (!prompt) return;
    setGeneratingItemSlug(game.slug);
    const result = await fetch(`/api/universalpostapi/${list._id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ methodic: "generatepreview", prompt, model }),
    }).then((r) => r.json());
    setGeneratingItemSlug(null);
    if (result.imageBase64) {
      setEditForm((prev) => ({ ...prev, imageBase64: result.imageBase64 }));
    }
  };

  const handleQuickGenerate = async (game) => {
    const prompt = game.imagePrompt || (game.description || "").trim();
    if (!prompt) return;
    setGeneratingItemSlug(game.slug);
    await universalPost(
      list._id,
      JSON.stringify({
        methodic: "generategameimage",
        gameSlug: game.slug,
        prompt,
        model,
      }),
      "generategameimage",
      t.admin_saved
    );
    setGeneratingItemSlug(null);
    mutate();
  };

  const handleBatchGenerate = async () => {
    if (!list?.games?.length || batchGenerating) return;
    const items = list.games.filter((g) => !g.hasImage);
    if (items.length === 0) {
      setOpeningAll({ opening: true, severity: "info", alerttext: "All items already have images" });
      return;
    }
    setBatchGenerating(true);
    setBatchProgress({ current: 0, total: items.length });

    const BATCH_SIZE = 3;
    for (let i = 0; i < items.length; i += BATCH_SIZE) {
      const batch = items.slice(i, i + BATCH_SIZE);
      await Promise.all(
        batch.map(async (game) => {
          const prompt = game.imagePrompt || (game.description || "").trim();
          if (!prompt) return;
          try {
            await universalPost(
              list._id,
              JSON.stringify({
                methodic: "generategameimage",
                gameSlug: game.slug,
                prompt,
                model,
              }),
              "generategameimage",
              ""
            );
          } catch (e) {
            console.error("Batch gen error:", game.slug, e);
          }
        })
      );
      setBatchProgress((prev) => ({ ...prev, current: Math.min(i + BATCH_SIZE, items.length) }));
      mutate();
    }

    setBatchGenerating(false);
    setBatchProgress({ current: 0, total: 0 });
    setOpeningAll({ opening: true, severity: "success", alerttext: `${items.length} images generated` });
    mutate();
  };

  const handleExport = () => {
    const items = (list.games || []).map(({ title, slug, description, image, rank, rating, link, imagePrompt }) => ({
      title, slug, description, image, rank, rating, link, imagePrompt,
    }));
    const json = JSON.stringify(items, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${list.slug || "list"}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const inputClass = "input-dark";

  return (
    <>
      <Head>
        <title>{t.admin_edit_list}: {list.name} | BoardGamerFun</title>
      </Head>

      <Layout>
        <div className="py-8 max-w-4xl mx-auto">
          <h1 className="text-3xl font-extrabold text-text-primary mb-8">
            {t.admin_edit_list}: {list.name}
          </h1>

          {/* List metadata form */}
          <div className="glass-card p-6 mb-6 space-y-4">
            <div>
              <label className="block text-text-secondary mb-1">{t.admin_list_name}</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 input-dark" />
            </div>
            <div>
              <label className="block text-text-secondary mb-1">{t.admin_list_desc}</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-2 input-dark" rows={3} />
            </div>
            <div>
              <label className="block text-text-secondary mb-1">{t.admin_image_prompt}</label>
              <div className="flex gap-2">
                <input type="text" value={imagePrompt} onChange={(e) => setImagePrompt(e.target.value)}
                  className="flex-1 px-4 py-2 input-dark" />
                <button onClick={handleGenerateImage} disabled={generating}
                  className="flex items-center gap-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-bg-surface text-text-primary rounded-lg font-medium">
                  <SparklesIcon className="h-5 w-5" />
                  {generating ? t.admin_generating : t.admin_generate}
                </button>
              </div>
            </div>
            {/* Cover preview / current */}
            {coverPreview ? (
              <div>
                <label className="block text-text-secondary mb-1">{t.admin_cover} — {t.admin_preview}</label>
                <img src={coverPreview} alt="preview" className="w-64 h-64 rounded-xl object-cover mb-3" />
                <div className="flex gap-2">
                  <button onClick={handleSaveCover}
                    className="flex items-center gap-1 px-4 py-2 bg-success hover:bg-success/80 text-text-primary rounded-lg font-medium">
                    <CheckIcon className="h-5 w-5" /> {t.admin_save}
                  </button>
                  <button onClick={handleGenerateImage} disabled={generating}
                    className="flex items-center gap-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-bg-surface text-text-primary rounded-lg font-medium">
                    <SparklesIcon className="h-5 w-5" /> {generating ? t.admin_generating : t.admin_regenerate}
                  </button>
                  <button onClick={() => setCoverPreview(null)}
                    className="flex items-center gap-1 px-4 py-2 bg-bg-surface hover:bg-border text-text-primary rounded-lg font-medium">
                    <XMarkIcon className="h-5 w-5" /> {t.admin_cancel}
                  </button>
                </div>
              </div>
            ) : list.imageBase64 ? (
              <div>
                <label className="block text-text-secondary mb-1">{t.admin_cover}</label>
                <img src={list.imageBase64} alt={list.name} className="w-64 h-64 rounded-xl object-cover" />
              </div>
            ) : null}
            <button onClick={handleSave}
              className="px-6 py-2 bg-success hover:bg-success/80 text-text-primary rounded-lg font-medium">
              {t.admin_save}
            </button>
          </div>

          {/* Items section */}
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-text-primary">
                {t.admin_items} ({list.games?.length || 0})
              </h2>
              <div className="flex gap-2">
                <button onClick={() => setShowAddItem(!showAddItem)}
                  className="flex items-center gap-1 px-3 py-2 bg-accent hover:bg-accent-light text-text-primary rounded-lg text-sm font-medium">
                  <PlusIcon className="h-4 w-4" />
                  {t.admin_add_item}
                </button>
                <button onClick={() => setShowImport(!showImport)}
                  className="flex items-center gap-1 px-3 py-2 bg-accent/80 hover:bg-accent text-text-primary rounded-lg text-sm font-medium">
                  <ArrowUpTrayIcon className="h-4 w-4" />
                  {t.admin_import}
                </button>
                <button onClick={handleExport}
                  className="flex items-center gap-1 px-3 py-2 border border-border hover:border-border-glow text-text-secondary hover:text-accent rounded-lg text-sm font-medium transition-all">
                  <ArrowDownTrayIcon className="h-4 w-4" />
                  {t.admin_export}
                </button>
                <button onClick={handleBatchGenerate} disabled={batchGenerating}
                  className="flex items-center gap-1 px-3 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-bg-surface text-white disabled:text-text-muted rounded-lg text-sm font-medium transition-all">
                  <SparklesIcon className="h-4 w-4" />
                  {batchGenerating
                    ? `${batchProgress.current}/${batchProgress.total}...`
                    : t.admin_generate_all}
                </button>
              </div>
            </div>

            {/* Add item form */}
            {showAddItem && (
              <div className="bg-bg-glass rounded-lg border border-border p-4 mb-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <input type="text" value={itemTitle} onChange={(e) => setItemTitle(e.target.value)}
                    placeholder={t.admin_item_title} className={inputClass} />
                  <input type="text" value={itemRank} onChange={(e) => setItemRank(e.target.value)}
                    placeholder={t.admin_item_rank} className={inputClass} />
                  <input type="text" value={itemRating} onChange={(e) => setItemRating(e.target.value)}
                    placeholder={t.admin_item_rating} className={inputClass} />
                  <input type="text" value={itemImage} onChange={(e) => setItemImage(e.target.value)}
                    placeholder={t.admin_item_image} className={inputClass} />
                </div>
                <input type="text" value={itemDesc} onChange={(e) => setItemDesc(e.target.value)}
                  placeholder={t.admin_list_desc} className={"w-full " + inputClass} />
                <input type="text" value={itemLink} onChange={(e) => setItemLink(e.target.value)}
                  placeholder="Link (URL)" className={"w-full " + inputClass} />
                <button onClick={handleAddItem}
                  className="px-4 py-2 bg-success hover:bg-success/80 text-text-primary rounded-lg font-medium">
                  {t.admin_add_item}
                </button>
              </div>
            )}

            {/* Import JSON */}
            {showImport && (
              <div className="bg-bg-glass rounded-lg border border-border p-4 mb-4 space-y-3">
                <textarea value={importJson} onChange={(e) => setImportJson(e.target.value)}
                  placeholder='[{"title": "Item", "rank": "1", "rating": "8.5"}]'
                  className="w-full px-3 py-2 rounded-lg bg-bg-surface text-text-primary border border-border focus:outline-none font-mono text-sm"
                  rows={6} />
                <button onClick={handleImport}
                  className="px-4 py-2 bg-accent/80 hover:bg-accent text-text-primary rounded-lg font-medium">
                  {t.admin_import}
                </button>
              </div>
            )}

            {/* Items list */}
            <div className="space-y-2">
              {list.games && list.games.map((game, idx) => (
                <div key={game.slug + idx} className="bg-bg-glass rounded-lg border border-border p-3 flex flex-col gap-2">
                  {editingSlug === game.slug ? (
                    /* Edit mode */
                    <>
                      <div className="grid grid-cols-2 gap-2">
                        <input type="text" value={editForm.title}
                          onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                          placeholder={t.admin_item_title} className={inputClass} />
                        <input type="text" value={editForm.rank}
                          onChange={(e) => setEditForm({ ...editForm, rank: e.target.value })}
                          placeholder={t.admin_item_rank} className={inputClass} />
                        <input type="text" value={editForm.rating}
                          onChange={(e) => setEditForm({ ...editForm, rating: e.target.value })}
                          placeholder={t.admin_item_rating} className={inputClass} />
                        <input type="text" value={editForm.image}
                          onChange={(e) => setEditForm({ ...editForm, image: e.target.value })}
                          placeholder={t.admin_item_image} className={inputClass} />
                      </div>
                      <input type="text" value={editForm.description}
                        onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                        placeholder={t.admin_list_desc} className={"w-full " + inputClass} />
                      <input type="text" value={editForm.link}
                        onChange={(e) => setEditForm({ ...editForm, link: e.target.value })}
                        placeholder="Link (URL)" className={"w-full " + inputClass} />
                      <div className="flex gap-2">
                        <input type="text" value={editForm.imagePrompt}
                          onChange={(e) => setEditForm({ ...editForm, imagePrompt: e.target.value })}
                          placeholder={t.admin_image_prompt} className={"flex-1 " + inputClass} />
                        <button onClick={() => handleGenerateItemImage(game)}
                          disabled={generatingItemSlug === game.slug}
                          className="flex items-center gap-1 px-2 py-1 bg-purple-600 hover:bg-purple-700 disabled:bg-bg-surface text-text-primary rounded text-sm">
                          <SparklesIcon className="h-3 w-3" />
                          {generatingItemSlug === game.slug ? "..." : t.admin_generate}
                        </button>
                      </div>
                      {/* Image preview */}
                      {editForm.imageBase64 && (
                        <div className="flex items-center gap-3">
                          <img src={editForm.imageBase64} alt="preview" className="w-20 h-20 rounded-lg object-cover" />
                          <span className="text-accent-green text-sm">{t.admin_preview}</span>
                        </div>
                      )}
                      <div className="flex gap-2">
                        <button onClick={() => saveEdit(game.slug)}
                          className="flex items-center gap-1 px-3 py-1 bg-success hover:bg-success/80 text-text-primary rounded text-sm">
                          <CheckIcon className="h-4 w-4" /> {t.admin_save}
                        </button>
                        <button onClick={cancelEdit}
                          className="flex items-center gap-1 px-3 py-1 bg-bg-surface hover:bg-border text-text-primary rounded text-sm">
                          <XMarkIcon className="h-4 w-4" /> {t.admin_cancel}
                        </button>
                      </div>
                    </>
                  ) : (
                    /* View mode */
                    <>
                      <div className="flex items-center gap-3">
                        {(game.imageUrl || game.hasImage) ? (
                          <img src={`/api/universalgetapi/${list._id}?route=gameimage&slug=${game.slug}&t=${Date.now()}`} alt={game.title} className="w-20 h-20 rounded-lg object-cover flex-shrink-0" />
                        ) : (
                          <div className="w-20 h-20 rounded-lg bg-bg-surface flex items-center justify-center text-text-muted text-xs flex-shrink-0">?</div>
                        )}
                        <span className="text-text-muted font-mono w-8">#{game.rank}</span>
                        <span className="text-text-primary font-medium flex-1">{game.title}</span>
                        <span className="text-accent text-sm">{game.rating}</span>
                        <button
                          onClick={() => handleQuickGenerate(game)}
                          disabled={generatingItemSlug === game.slug}
                          className="p-1 text-purple-400 hover:text-purple-300 disabled:text-gray-500"
                          title={t.admin_generate}
                        >
                          {generatingItemSlug === game.slug ? (
                            <div className="spinner" />
                          ) : (
                            <SparklesIcon className="h-4 w-4" />
                          )}
                        </button>
                        <button onClick={() => startEdit(game)} className="p-1 text-blue-400 hover:text-blue-300">
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button onClick={() => handleRemoveItem(game.slug)} className="p-1 text-red-400 hover:text-red-300">
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
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
