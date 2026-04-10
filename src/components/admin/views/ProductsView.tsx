"use client";

import { useAdminData } from "@/context/AdminDataContext";
import {
  createSupabaseBrowserClient,
  isSupabaseConfigured,
  SUPABASE_CLIENT_SETUP_MESSAGE,
} from "@/lib/supabase/client";
import { formatCedis } from "@/lib/currency";
import { isWatchProductCategory } from "@/lib/productGroups";
import { mapProductRow } from "@/lib/supabase/maps";
import { WATCH_BRAND_SUGGESTIONS } from "@/lib/watchBrandSuggestions";
import type { Product, ProductColorOption } from "@/types";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { categoryCounts, downloadTextFile, productsToCsv } from "../adminUtils";
import s from "../adminShared.module.css";

const STORAGE_BUCKET = "product-images";

const emptyForm = {
  name: "",
  brand: "",
  price: "",
  category: "",
  description: "",
  stock: "",
  featured: false,
  colorOptionsJson: "[]",
};

function parseColorOptionsJson(raw: string): ProductColorOption[] | null {
  try {
    const parsed = JSON.parse(raw || "[]") as unknown;
    if (!Array.isArray(parsed)) return null;
    const out: ProductColorOption[] = [];
    for (const x of parsed) {
      if (!x || typeof x !== "object") return null;
      const o = x as Record<string, unknown>;
      if (typeof o.name !== "string" || !o.name.trim()) return null;
      out.push({
        name: o.name.trim(),
        ...(typeof o.hex === "string" ? { hex: o.hex } : {}),
        ...(typeof o.image === "string" ? { image: o.image } : {}),
      });
    }
    return out;
  } catch {
    return null;
  }
}

export function ProductsView() {
  const { products, refresh, supabaseReady, loading } = useAdminData();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>("");
  const [lowOnly, setLowOnly] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [files, setFiles] = useState<FileList | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(
    null,
  );
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const headerSelectRef = useRef<HTMLInputElement>(null);

  const categories = useMemo(
    () => categoryCounts(products.map((p) => p.category)).map((c) => c.name),
    [products],
  );

  const watchBrandDatalist = useMemo(() => {
    const fromInventory = new Set<string>([...WATCH_BRAND_SUGGESTIONS]);
    for (const p of products) {
      if (!isWatchProductCategory(p.category)) continue;
      const b = p.brand.trim();
      if (b) fromInventory.add(b);
    }
    return [...fromInventory].sort((a, b) =>
      a.localeCompare(b, undefined, { sensitivity: "base" }),
    );
  }, [products]);

  const filtered = useMemo(() => {
    let list = products;
    const needle = q.trim().toLowerCase();
    if (needle) {
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(needle) ||
          p.brand.toLowerCase().includes(needle) ||
          p.category.toLowerCase().includes(needle) ||
          p.description.toLowerCase().includes(needle),
      );
    }
    if (cat) {
      list = list.filter((p) => p.category === cat);
    }
    if (lowOnly) {
      list = list.filter((p) => p.stock > 0 && p.stock <= 5);
    }
    return list;
  }, [products, q, cat, lowOnly]);

  const selectedInView = useMemo(
    () => filtered.filter((p) => selectedIds.includes(p.id)),
    [filtered, selectedIds],
  );
  const allInViewSelected =
    filtered.length > 0 && selectedInView.length === filtered.length;

  useEffect(() => {
    const el = headerSelectRef.current;
    if (!el) return;
    el.indeterminate =
      selectedInView.length > 0 && selectedInView.length < filtered.length;
  }, [filtered.length, selectedInView.length]);

  const toggleSelectId = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const toggleSelectAllInView = () => {
    const ids = new Set(filtered.map((p) => p.id));
    if (allInViewSelected) {
      setSelectedIds((prev) => prev.filter((id) => !ids.has(id)));
    } else {
      setSelectedIds((prev) => [...new Set([...prev, ...ids])]);
    }
  };

  const clearSelection = () => setSelectedIds([]);

  const exportSelectedCsv = () => {
    const rows = products.filter((p) => selectedIds.includes(p.id));
    if (rows.length === 0) return;
    downloadTextFile(
      `products-export-${new Date().toISOString().slice(0, 10)}.csv`,
      productsToCsv(rows),
    );
  };

  const bulkSetFeatured = async (featured: boolean) => {
    if (!isSupabaseConfigured() || selectedIds.length === 0) return;
    setBusy(true);
    setMessage(null);
    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase
        .from("products")
        .update({ featured })
        .in("id", selectedIds);
      if (error) throw error;
      setMessage({
        type: "ok",
        text: `Updated featured=${featured} for ${selectedIds.length} products.`,
      });
      await refresh();
    } catch {
      setMessage({ type: "err", text: "Bulk update failed." });
    } finally {
      setBusy(false);
    }
  };

  const bulkDeleteSelected = async () => {
    if (!isSupabaseConfigured() || selectedIds.length === 0) return;
    if (
      !window.confirm(
        `Permanently delete ${selectedIds.length} product(s)? This cannot be undone.`,
      )
    ) {
      return;
    }
    setBusy(true);
    setMessage(null);
    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.from("products").delete().in("id", selectedIds);
      if (error) throw error;
      if (editingId && selectedIds.includes(editingId)) resetForm();
      setSelectedIds([]);
      setMessage({ type: "ok", text: "Products deleted." });
      await refresh();
    } catch {
      setMessage({ type: "err", text: "Bulk delete failed." });
    } finally {
      setBusy(false);
    }
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setFiles(null);
  };

  const uploadNewImages = async (productId: string): Promise<string[]> => {
    if (!files || files.length === 0) return [];
    const supabase = createSupabaseBrowserClient();
    const urls: string[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files.item(i);
      if (!file) continue;
      const safe = file.name.replace(/[^\w.-]+/g, "_");
      const path = `products/${productId}/${Date.now()}_${i}_${safe}`;
      const { error: upErr } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(path, file, { upsert: false });
      if (upErr) throw upErr;
      const { data: pub } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
      urls.push(pub.publicUrl);
    }
    return urls;
  };

  const saveProduct = async (e?: FormEvent) => {
    e?.preventDefault();
    setMessage(null);
    if (!isSupabaseConfigured()) {
      setMessage({ type: "err", text: SUPABASE_CLIENT_SETUP_MESSAGE });
      return;
    }
    const price = Number(form.price);
    const stock = Number(form.stock);
    if (!form.name.trim() || !form.category.trim() || Number.isNaN(price) || Number.isNaN(stock)) {
      setMessage({ type: "err", text: "Name, category, price, and stock are required." });
      return;
    }
    const colorOptions = parseColorOptionsJson(form.colorOptionsJson);
    if (colorOptions === null) {
      setMessage({
        type: "err",
        text: "Colour options must be a JSON array like [{\"name\":\"Black\",\"hex\":\"#111\",\"image\":\"https://...\"}].",
      });
      return;
    }
    setBusy(true);
    try {
      const supabase = createSupabaseBrowserClient();
      if (editingId) {
        const urls = await uploadNewImages(editingId);
        const existing = products.find((p) => p.id === editingId);
        const images = [...(existing?.images ?? []), ...urls];
        const { error: upErr } = await supabase
          .from("products")
          .update({
            name: form.name.trim(),
            brand: form.brand.trim(),
            price,
            category: form.category.trim(),
            description: form.description.trim(),
            stock,
            featured: form.featured,
            color_options: colorOptions,
            ...(urls.length ? { images } : {}),
          })
          .eq("id", editingId);
        if (upErr) throw upErr;
        setMessage({ type: "ok", text: "Product updated." });
      } else {
        const { data: inserted, error: insErr } = await supabase
          .from("products")
          .insert({
            name: form.name.trim(),
            brand: form.brand.trim(),
            price,
            category: form.category.trim(),
            description: form.description.trim(),
            stock,
            featured: form.featured,
            images: [] as string[],
            color_options: colorOptions,
          })
          .select("id")
          .single();
        if (insErr) throw insErr;
        const newId = inserted!.id as string;
        const urls = await uploadNewImages(newId);
        if (urls.length) {
          const { error: imgErr } = await supabase
            .from("products")
            .update({ images: urls })
            .eq("id", newId);
          if (imgErr) throw imgErr;
        }
        setMessage({ type: "ok", text: "Product created." });
      }
      resetForm();
      await refresh();
    } catch {
      setMessage({ type: "err", text: "Save failed. Check RLS, Storage policies, and admin role." });
    } finally {
      setBusy(false);
    }
  };

  const editProduct = (p: Product) => {
    setEditingId(p.id);
    setForm({
      name: p.name,
      brand: p.brand,
      price: String(p.price),
      category: p.category,
      description: p.description,
      stock: String(p.stock),
      featured: p.featured,
      colorOptionsJson: JSON.stringify(
        p.colorOptions.map(({ name, hex, image }) => {
          const o: Record<string, string> = { name };
          if (hex) o.hex = hex;
          if (image) o.image = image;
          return o;
        }),
        null,
        2,
      ),
    });
    setFiles(null);
    setMessage(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const removeProduct = async (id: string) => {
    if (!isSupabaseConfigured()) {
      setMessage({ type: "err", text: SUPABASE_CLIENT_SETUP_MESSAGE });
      return;
    }
    if (!window.confirm("Delete this product?")) return;
    setBusy(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;
      await refresh();
      if (editingId === id) resetForm();
      setMessage({ type: "ok", text: "Product deleted." });
    } catch {
      setMessage({ type: "err", text: "Delete failed." });
    } finally {
      setBusy(false);
    }
  };

  const toggleFeatured = async (p: Product) => {
    if (!isSupabaseConfigured()) {
      setMessage({ type: "err", text: SUPABASE_CLIENT_SETUP_MESSAGE });
      return;
    }
    setBusy(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase
        .from("products")
        .update({ featured: !p.featured })
        .eq("id", p.id);
      if (error) throw error;
      await refresh();
    } catch {
      setMessage({ type: "err", text: "Could not update featured flag." });
    } finally {
      setBusy(false);
    }
  };

  const duplicateProduct = async (p: Product) => {
    if (!isSupabaseConfigured()) return;
    setBusy(true);
    setMessage(null);
    try {
      const supabase = createSupabaseBrowserClient();
      const { data: inserted, error } = await supabase
        .from("products")
        .insert({
          name: `${p.name} (copy)`,
          brand: p.brand,
          price: p.price,
          category: p.category,
          description: p.description,
          stock: 0,
          featured: false,
          images: [...p.images],
          color_options: p.colorOptions.map(({ name, hex, image }) => ({
            name,
            ...(hex ? { hex } : {}),
            ...(image ? { image } : {}),
          })),
        })
        .select("*")
        .single();
      if (error) throw error;
      const mapped = mapProductRow(inserted as Record<string, unknown>);
      if (mapped) {
        setMessage({ type: "ok", text: "Duplicate created as draft (stock 0). Edit below." });
        editProduct(mapped);
      }
      await refresh();
    } catch {
      setMessage({ type: "err", text: "Duplicate failed." });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <div className={s.panel}>
        <h2 className={s.panelTitle}>
          {editingId ? "Edit product" : "Add product"}
        </h2>
        <form className={s.form} onSubmit={(e) => void saveProduct(e)}>
          <label className={s.label}>
            <span>Name</span>
            <input
              className={s.input}
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
          </label>
          <label className={s.label}>
            <span>Brand</span>
            <input
              className={s.input}
              value={form.brand}
              onChange={(e) => setForm((f) => ({ ...f, brand: e.target.value }))}
              list="admin-watch-brand-suggestions"
              placeholder="e.g. Rolex, Coach, Fossil"
            />
            <datalist id="admin-watch-brand-suggestions">
              {watchBrandDatalist.map((b) => (
                <option key={b} value={b} />
              ))}
            </datalist>
            <p className={s.fieldHint}>
              On the shop, each category (bags, perfumes, watches, etc.) has brand
              filters; products with the same brand show together. Pick a suggestion or
              type any brand.
            </p>
          </label>
          <div className={s.row2}>
            <label className={s.label}>
              <span>Price (GH₵)</span>
              <input
                className={s.input}
                type="number"
                min={0}
                step="0.01"
                placeholder="1850.00"
                value={form.price}
                onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
              />
              <p className={s.fieldHint}>
                Cedis only. Do not enter pesewas as extra zeros.
              </p>
            </label>
            <label className={s.label}>
              <span>Stock</span>
              <input
                className={s.input}
                type="number"
                min={0}
                value={form.stock}
                onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))}
              />
            </label>
          </div>
          <label className={s.label}>
            <span>Category</span>
            <input
              className={s.input}
              value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              list="admin-category-suggestions"
            />
            <datalist id="admin-category-suggestions">
              {categories.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </label>
          <label className={s.label}>
            <span>Description</span>
            <textarea
              className={s.textarea}
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
            />
          </label>
          <label className={s.label}>
            <span>Colour options (JSON)</span>
            <textarea
              className={s.textarea}
              value={form.colorOptionsJson}
              onChange={(e) =>
                setForm((f) => ({ ...f, colorOptionsJson: e.target.value }))
              }
              spellCheck={false}
              placeholder={`[\n  { "name": "Black", "hex": "#1a1a1a", "image": "https://..." }\n]`}
            />
          </label>
          <label className={s.check}>
            <input
              type="checkbox"
              checked={form.featured}
              onChange={(e) =>
                setForm((f) => ({ ...f, featured: e.target.checked }))
              }
            />
            Featured
          </label>
          <label className={s.label}>
            <span>Images (upload)</span>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => setFiles(e.target.files)}
            />
          </label>
          <div className={s.actions}>
            <button
              type="submit"
              className={s.btn}
              disabled={!supabaseReady || busy}
            >
              {editingId ? "Update" : "Create"}
            </button>
            {editingId && (
              <button
                type="button"
                className={s.btnGhost}
                disabled={!supabaseReady || busy}
                onClick={resetForm}
              >
                Cancel
              </button>
            )}
          </div>
          {message && (
            <p className={message.type === "ok" ? s.msgOk : s.msgError}>
              {message.text}
            </p>
          )}
        </form>
      </div>

      <div className={s.panel}>
        <h2 className={s.panelTitle}>Inventory ({filtered.length})</h2>
        <div className={s.toolbar}>
          <input
            className={`${s.input} ${s.searchInput}`}
            type="search"
            placeholder="Search name, category, description…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <select
            className={s.select}
            value={cat}
            onChange={(e) => setCat(e.target.value)}
          >
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <label className={s.check} style={{ margin: 0 }}>
            <input
              type="checkbox"
              checked={lowOnly}
              onChange={(e) => setLowOnly(e.target.checked)}
            />
            Low stock (1–5)
          </label>
        </div>
        {selectedIds.length > 0 && (
          <div
            className={s.toolbar}
            style={{
              marginTop: "0.65rem",
              flexWrap: "wrap",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <span style={{ fontSize: "0.8rem", color: "var(--muted)" }}>
              {selectedIds.length} selected
            </span>
            <button
              type="button"
              className={s.btnGhost}
              disabled={!supabaseReady || busy}
              onClick={() => void bulkSetFeatured(true)}
            >
              Featured on
            </button>
            <button
              type="button"
              className={s.btnGhost}
              disabled={!supabaseReady || busy}
              onClick={() => void bulkSetFeatured(false)}
            >
              Featured off
            </button>
            <button
              type="button"
              className={s.btnGhost}
              disabled={selectedIds.length === 0}
              onClick={exportSelectedCsv}
            >
              Export CSV
            </button>
            <button
              type="button"
              className={s.btnDanger}
              disabled={!supabaseReady || busy}
              onClick={() => void bulkDeleteSelected()}
            >
              Delete selected
            </button>
            <button
              type="button"
              className={s.btnGhost}
              onClick={clearSelection}
            >
              Clear selection
            </button>
          </div>
        )}
        {loading ? (
          <p className={s.msg}>Loading…</p>
        ) : (
          <div className={s.tableWrap}>
            <table className={s.table}>
              <thead>
                <tr>
                  <th style={{ width: 36 }}>
                    <input
                      ref={headerSelectRef}
                      type="checkbox"
                      checked={allInViewSelected}
                      title="Select all in this list"
                      aria-label="Select all products in this list"
                      onChange={toggleSelectAllInView}
                    />
                  </th>
                  <th />
                  <th>Name</th>
                  <th>Brand</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Featured</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(p.id)}
                        aria-label={`Select ${p.name}`}
                        onChange={() => toggleSelectId(p.id)}
                      />
                    </td>
                    <td>
                      {p.images[0] ? (
                        <span className={s.thumbClip}>
                          <Image
                            className={`${s.thumb} photo-surface-motion-subtle`}
                            src={p.images[0]}
                            alt=""
                            width={40}
                            height={52}
                          />
                        </span>
                      ) : (
                        <span className={s.thumb} />
                      )}
                    </td>
                    <td>{p.name}</td>
                    <td>{p.brand || "—"}</td>
                    <td>{p.category}</td>
                    <td>{formatCedis(p.price)}</td>
                    <td>
                      {p.stock === 0 ? (
                        <span className={s.badgeWarn}>0</span>
                      ) : p.stock <= 5 ? (
                        <span className={s.badgePending}>{p.stock}</span>
                      ) : (
                        p.stock
                      )}
                    </td>
                    <td>
                      <button
                        type="button"
                        className={s.btnGhost}
                        style={{ padding: "0.35rem 0.5rem" }}
                        disabled={!supabaseReady || busy}
                        onClick={() => void toggleFeatured(p)}
                      >
                        {p.featured ? "Yes" : "No"}
                      </button>
                    </td>
                    <td>
                      <div
                        style={{
                          display: "flex",
                          gap: "0.35rem",
                          flexWrap: "wrap",
                        }}
                      >
                        <button
                          type="button"
                          className={s.btnGhost}
                          style={{ padding: "0.35rem 0.5rem" }}
                          disabled={!supabaseReady}
                          onClick={() => editProduct(p)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className={s.btnGhost}
                          style={{ padding: "0.35rem 0.5rem" }}
                          disabled={!supabaseReady || busy}
                          onClick={() => void duplicateProduct(p)}
                        >
                          Duplicate
                        </button>
                        <button
                          type="button"
                          className={s.btnDanger}
                          disabled={!supabaseReady || busy}
                          onClick={() => void removeProduct(p.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
