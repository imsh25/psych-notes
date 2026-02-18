"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import dynamic from "next/dynamic";

export const dynamicRendering = "force-dynamic";

// ✅ Dynamically import react-pdf components (SSR disabled)
const Document = dynamic(
  () => import("react-pdf").then((mod) => mod.Document),
  { ssr: false }
);

const Page = dynamic(
  () => import("react-pdf").then((mod) => mod.Page),
  { ssr: false }
);

import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

export default function Viewer() {
  const searchParams = useSearchParams();
  const url = searchParams.get("url");

  const [numPages, setNumPages] = useState(null);

  if (!url) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        Invalid file
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex justify-center p-6">
      <div className="w-full max-w-4xl">
        <Document
          file={url}
          onLoadSuccess={({ numPages }) =>
            setNumPages(numPages)
          }
        >
          {numPages &&
            Array.from(
              new Array(numPages),
              (el, index) => (
                <Page
                  key={`page_${index + 1}`}
                  pageNumber={index + 1}
                  renderTextLayer={false}
                  renderAnnotationLayer={false}
                  className="mb-6"
                />
              )
            )}
        </Document>
      </div>
    </div>
  );
}