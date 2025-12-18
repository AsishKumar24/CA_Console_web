import React, { useEffect, useState } from "react";
import PageMeta from "../common/PageMeta";

/* ---------- Types & constants ---------- */
type Photo = { id: string; dataUrl: string; name: string; createdAt: number };

const STORAGE_KEY = "androblight_photo_gallery";
const MAX_PHOTOS = 20;

const uid = () =>
  Math.random().toString(36).slice(2) + Date.now().toString(36);

const loadPhotos = (): Photo[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
};

const savePhotos = (arr: Photo[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
  } catch (e) {
    console.warn("Failed to save photos (quota/full?):", e);
  }
};
/* ---------- Lightbox ---------- */
function Lightbox({
  src,
  onClose,
}: {
  src: string | null;
  onClose: () => void;
}) {
  if (!src) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
    >
      <img
        src={src}
        alt="preview"
        className="max-h-[90vh] max-w-[90vw] rounded-xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      />
      <button
        className="absolute right-6 top-6 rounded-full bg-white/90 px-3 py-1 text-sm font-medium text-gray-800 shadow hover:bg-white"
        onClick={onClose}
      >
        Close
      </button>
    </div>
  );
}

/* ---------- Page ---------- */
export default function PhotoGallery() {
  const [photos, setPhotos] = useState<Photo[]>(() => loadPhotos());
  const [isOver, setIsOver] = useState(false);
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [nameDraft, setNameDraft] = useState("");

  const remaining = Math.max(0, MAX_PHOTOS - photos.length);
  const canAddMore = photos.length < MAX_PHOTOS;

  // Initialize directly from localStorage (lazy initializer)


// Automatically save when photos change
useEffect(() => {
  savePhotos(photos);
}, [photos]);


  async function filesToDataUrls(files: FileList | null): Promise<Photo[]> {
    if (!files) return [];
    const allowed = Array.from(files)
      .filter((f) => f.type.startsWith("image/"))
      .slice(0, remaining); // cap to remaining slots

    const reads = await Promise.all(
      allowed.map(
        (file) =>
          new Promise<{ dataUrl: string; name: string }>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () =>
              resolve({
                dataUrl: String(reader.result),
                name:
                  (file.name || "Untitled")
                    .replace(/\.[^.]+$/, "") // strip extension
                    .slice(0, 80) || "Untitled",
              });
            reader.onerror = () => reject(new Error("read error"));
            reader.readAsDataURL(file);
          })
      )
    );

    const now = Date.now();
    return reads.map((r, idx) => ({
      id: uid(),
      dataUrl: r.dataUrl,
      name: r.name,
      createdAt: now + idx,
    }));
  }

  async function handleFiles(files: FileList | null) {
    if (!canAddMore || !files || files.length === 0) return;
    const nextBatch = await filesToDataUrls(files);
    if (nextBatch.length === 0) return;

    setPhotos((prev) => [...nextBatch, ...prev].slice(0, MAX_PHOTOS));
  }

  function onDelete(id: string) {
    setPhotos((prev) => prev.filter((p) => p.id !== id));
    if (editingId === id) {
      setEditingId(null);
      setNameDraft("");
    }
  }

  function onClearAll() {
    setPhotos([]);
    setEditingId(null);
    setNameDraft("");
  }

  function startEdit(id: string, currentName: string) {
    setEditingId(id);
    setNameDraft(currentName);
  }

  function cancelEdit() {
    setEditingId(null);
    setNameDraft("");
  }

  function saveEdit() {
    if (!editingId) return;
    const trimmed = nameDraft.trim() || "Untitled";
    setPhotos((prev) =>
      prev.map((p) => (p.id === editingId ? { ...p, name: trimmed } : p))
    );
    setEditingId(null);
    setNameDraft("");
  }

  return (

    <>
      <PageMeta
        title="React.js Profile Dashboard | TailAdmin - Next.js Admin Dashboard Template"
        description="This is React.js Profile Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />
      <div className="space-y-6">
      {/* Header / Uploader */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Gallery
            </h3>
            {/* <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Add up to {MAX_PHOTOS} screenshots or result images. Drag & drop
              or click to upload. You can rename each photo.
            </p> */}
          </div>
          <span
            className={`text-xs inline-flex items-center rounded-full border px-3 py-1 font-semibold ${
              remaining > 0
                ? "border-gray-300 text-gray-600 dark:border-gray-700 dark:text-gray-300"
                : "border-red-400 text-red-600 dark:text-red-400"
            }`}
          >
            {remaining > 0
              ? `${remaining} slots remaining`
              : "Storage full"}
          </span>
        </div>

        {/* Drop zone */}
        <label
          onDragOver={(e) => {
            e.preventDefault();
            setIsOver(true);
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            setIsOver(false);
          }}
          onDrop={async (e) => {
            e.preventDefault();
            setIsOver(false);
            await handleFiles(e.dataTransfer.files);
          }}
          className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-8 text-center transition ${
            isOver
              ? "border-indigo-500 bg-indigo-50/60 dark:border-indigo-400/60 dark:bg-indigo-950/20"
              : "border-gray-300 hover:border-gray-400 dark:border-gray-700 dark:hover:border-gray-600"
          }`}
        >
          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={async (e) => {
              await handleFiles(e.target.files);
              // reset to allow selecting the same file again later
              e.currentTarget.value = "";
            }}
          />
          <svg
            className="h-8 w-8 text-gray-400 dark:text-gray-500"
            viewBox="0 0 24 24"
            fill="none"
          >
            <path
              d="M12 16v-8m0 0l-3 3m3-3l3 3M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H9a2 2 0 00-2 2v0"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          </svg>
          <div className="text-sm text-gray-700 dark:text-gray-300">
            <span className="font-medium text-indigo-600 dark:text-indigo-400">
              Click to upload
            </span>{" "}
            or drag & drop
          </div>
          {/* <div className="text-xs text-gray-500 dark:text-gray-400">
            PNG, JPG up to your browser limit
          </div> */}
        </label>

        {/* Toolbar */}
        <div className="mt-4 flex items-center justify-end gap-2">
          <button
            onClick={onClearAll}
            disabled={photos.length === 0}
            className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 shadow hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-white/[0.03]"
          >
            Clear All
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {photos.length === 0 ? (
          <div className="col-span-2 sm:col-span-3 md:col-span-4 lg:col-span-5">
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 p-10 text-center dark:border-gray-700">
              <svg
                className="h-10 w-10 text-gray-400 dark:text-gray-500"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0Z"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
              </svg>
              <h3 className="mt-3 text-base font-semibold text-gray-800 dark:text-white/90">
                No photos yet
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Add images using the uploader above.
              </p>
            </div>
          </div>
        ) : (
          photos.map((p) => {
            const isEditing = editingId === p.id;
            return (
              <div
                key={p.id}
                className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]"
              >
                {/* Image */}
                <button
                  onClick={() => setLightboxSrc(p.dataUrl)}
                  className="block h-32 w-full overflow-hidden"
                  title="View"
                >
                  <img
                    src={p.dataUrl}
                    alt={p.name || "shot"}
                    className="h-32 w-full object-cover transition group-hover:scale-105"
                  />
                </button>

                {/* Name / Caption */}
                <div className="border-t border-gray-100 p-2 dark:border-gray-800">
                  {!isEditing ? (
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-xs font-medium text-gray-800 dark:text-gray-200">
                        {p.name || "Untitled"}
                      </p>
                      <div className="flex items-center gap-1 opacity-0 transition group-hover:opacity-100">
                        <button
                          onClick={() => startEdit(p.id, p.name)}
                          className="rounded-md bg-white/90 px-2 py-1 text-[11px] font-medium text-gray-800 shadow hover:bg-white dark:bg-gray-900/90 dark:text-gray-200"
                          title="Rename"
                        >
                          Rename
                        </button>
                        <button
                          onClick={() => onDelete(p.id)}
                          className="rounded-md bg-white/90 px-2 py-1 text-[11px] font-medium text-gray-800 shadow hover:bg-white dark:bg-gray-900/90 dark:text-gray-200"
                          title="Delete"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <input
                        autoFocus
                        value={nameDraft}
                        onChange={(e) => setNameDraft(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") saveEdit();
                          if (e.key === "Escape") cancelEdit();
                        }}
                        className="w-full rounded-md border border-gray-300 bg-white px-2 py-1 text-xs text-gray-800 outline-none focus:border-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
                        placeholder="Photo name"
                      />
                      <button
                        onClick={saveEdit}
                        className="rounded-md bg-indigo-600 px-2 py-1 text-[11px] font-medium text-white hover:bg-indigo-700"
                        title="Save"
                      >
                        Save
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="rounded-md bg-gray-200 px-2 py-1 text-[11px] font-medium text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                        title="Cancel"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>

                {/* Quick delete on image hover (top-right) */}
                <div className="absolute right-2 top-2 hidden gap-1 opacity-0 transition group-hover:flex group-hover:opacity-100">
                  <button
                    onClick={() => onDelete(p.id)}
                    className="rounded-md bg-white/90 px-2 py-1 text-xs font-medium text-gray-800 shadow hover:bg-white dark:bg-gray-900/90 dark:text-gray-200"
                    title="Delete"
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Lightbox */}
      <Lightbox src={lightboxSrc} onClose={() => setLightboxSrc(null)} />
    </div>
      </>

  );
}
