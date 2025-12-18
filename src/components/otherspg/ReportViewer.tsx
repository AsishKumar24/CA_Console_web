import { useEffect, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import PageMeta from "../common/PageMeta";
// import "react-pdf/dist/esm/Page/TextLayer.css";
// import "react-pdf/dist/esm/Page/AnnotationLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export default function ReportViewer() {
  const [numPages, setNumPages] = useState<number>();
  const [pageNumber, setPageNumber] = useState(1);
  const [viewerHeight, setViewerHeight] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const fsRef = useRef<HTMLDivElement | null>(null);

  // Use BASE_URL so it works in subpath deploys
  const pdfPath = "/Reports/AndroBlight.pdf"; // put file in /public/reports/AndroBlight.pdf

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    setPageNumber(1);
  }

  // Fit page height to container; no scroll (normal view)
  useEffect(() => {
    if (!containerRef.current) return;
    const resize = () => {
      const rect = containerRef.current!.getBoundingClientRect();
      setViewerHeight(Math.max(0, Math.floor(rect.height - 24)));
    };
    const ro = new ResizeObserver(resize);
    ro.observe(containerRef.current);
    resize();
    return () => ro.disconnect();
  }, []);

  // Keyboard ← → and ESC to exit fullscreen
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" && pageNumber > 1) setPageNumber((p) => p - 1);
      if (e.key === "ArrowRight" && numPages && pageNumber < numPages) setPageNumber((p) => p + 1);
      if (e.key === "Escape" && isFullscreen) setIsFullscreen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [pageNumber, numPages, isFullscreen]);

  const canPrev = pageNumber > 1;
  const canNext = !!numPages && pageNumber < numPages;

  return (
    <>
      <PageMeta
        title="React.js Profile Dashboard | TailAdmin - Next.js Admin Dashboard Template"
        description="This is React.js Profile Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />
      {/* Normal page (edge-to-edge, not scrollable) */}
      <div className="relative h-screen w-screen bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <h1 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white">AndroBlight Report</h1>
          <div className="flex items-center gap-2">
            <a
              href={pdfPath}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 shadow hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-white/[0.03]"
            >
              Open in New Tab
            </a>
            <button
              onClick={() => setIsFullscreen(true)}
              className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white shadow hover:bg-blue-700"
            >
              Enter Fullscreen
            </button>
            <span className="ml-2 text-xs sm:text-sm text-gray-600 dark:text-gray-300">
              Page {pageNumber} / {numPages ?? "--"}
            </span>
          </div>
        </div>

        {/* Viewer (fills the rest of the viewport, no scrollbars) */}
        <div
          ref={containerRef}
          className="relative h-[calc(100vh-60px)] w-screen overflow-hidden bg-white dark:bg-gray-800"
        >
          <div className="flex h-full w-full items-center justify-center">
            <Document
              file={pdfPath}
              onLoadSuccess={onDocumentLoadSuccess}
              loading={<p className="text-gray-500 dark:text-gray-300">Loading PDF…</p>}
              error={<p className="text-red-500 dark:text-red-400">Failed to load PDF.</p>}
            >
              <Page
                pageNumber={pageNumber}
                height={viewerHeight > 0 ? viewerHeight : undefined}
                renderAnnotationLayer={false}
                renderTextLayer={false}
                className="rounded-lg shadow"
              />
            </Document>
          </div>

          {/* Prev / Next overlay */}
          <button
            onClick={() => canPrev && setPageNumber((p) => p - 1)}
            disabled={!canPrev}
            className="group absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-3 shadow-lg ring-1 ring-black/10 hover:bg-white disabled:cursor-not-allowed disabled:opacity-40 dark:bg-gray-900/90 dark:ring-white/10"
            aria-label="Previous page"
            title="Previous (←)"
          >
            <svg className="h-5 w-5 text-gray-800 group-hover:text-blue-600 dark:text-gray-200 dark:group-hover:text-blue-400" viewBox="0 0 24 24" fill="none">
              <path d="M15 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          <button
            onClick={() => canNext && setPageNumber((p) => p + 1)}
            disabled={!canNext}
            className="group absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-3 shadow-lg ring-1 ring-black/10 hover:bg-white disabled:cursor-not-allowed disabled:opacity-40 dark:bg-gray-900/90 dark:ring-white/10"
            aria-label="Next page"
            title="Next (→)"
          >
            <svg className="h-5 w-5 text-gray-800 group-hover:text-blue-600 dark:text-gray-200 dark:group-hover:text-blue-400" viewBox="0 0 24 24" fill="none">
              <path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          {/* Page chip */}
          <div className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/70 px-3 py-1 text-xs font-medium text-white shadow-md">
            {pageNumber} / {numPages ?? "--"}
          </div>
        </div>
      </div>

      {/* Fullscreen Overlay */}
      {isFullscreen && (
        <div
          ref={fsRef}
          className="fixed inset-0 z-[999] flex flex-col bg-black/80"
          role="dialog"
          aria-modal="true"
        >
          {/* FS header */}
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-sm font-medium text-white/90">
              AndroBlight Report — Page {pageNumber} / {numPages ?? "--"}
            </span>
            <div className="flex items-center gap-2">
              <a
                href={pdfPath}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg bg-white/10 px-3 py-1.5 text-xs font-medium text-white hover:bg-white/20"
              >
                Open in New Tab
              </a>
              <button
                onClick={() => setIsFullscreen(false)}
                className="rounded-lg bg-white/10 px-3 py-1.5 text-xs font-medium text-white hover:bg-white/20"
              >
                Exit Fullscreen (Esc)
              </button>
            </div>
          </div>

          {/* FS viewer (no scroll, page fitted by height) */}
          <div className="relative flex-1 overflow-hidden bg-gray-900">
            <div className="flex h-full w-full items-center justify-center">
              <Document
                file={pdfPath}
                onLoadSuccess={onDocumentLoadSuccess}
                loading={<p className="text-gray-300">Loading PDF…</p>}
                error={<p className="text-red-400">Failed to load PDF.</p>}
              >
                <Page
                  pageNumber={pageNumber}
                  height={window.innerHeight - 100} // fits roughly under FS header
                  renderAnnotationLayer={false}
                  renderTextLayer={false}
                  className="rounded-lg shadow"
                />
              </Document>
            </div>

            {/* FS Prev / Next */}
            <button
              onClick={() => canPrev && setPageNumber((p) => p - 1)}
              disabled={!canPrev}
              className="group absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-3 shadow-lg ring-1 ring-black/10 hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Previous page"
              title="Previous (←)"
            >
              <svg className="h-5 w-5 text-gray-800 group-hover:text-blue-600" viewBox="0 0 24 24" fill="none">
                <path d="M15 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            <button
              onClick={() => canNext && setPageNumber((p) => p + 1)}
              disabled={!canNext}
              className="group absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-3 shadow-lg ring-1 ring-black/10 hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Next page"
              title="Next (→)"
            >
              <svg className="h-5 w-5 text-gray-800 group-hover:text-blue-600" viewBox="0 0 24 24" fill="none">
                <path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
