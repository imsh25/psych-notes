"use client";

export const dynamic = "force-dynamic";
export const revalidate = 0;

import dynamicImport from "next/dynamic";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

// Dynamically import react-pdf (NO SSR)
const Document = dynamicImport(
  () => import("react-pdf").then((mod) => mod.Document),
  { ssr: false }
);

const Page = dynamicImport(
  () => import("react-pdf").then((mod) => mod.Page),
  { ssr: false }
);

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
          onLoadSuccess={({ numPages }) => setNumPages(numPages)}
        >
          {numPages &&
            Array.from({ length: numPages }, (_, i) => (
              <Page
                key={i}
                pageNumber={i + 1}
                renderTextLayer={false}
                renderAnnotationLayer={false}
                className="mb-6"
              />
            ))}
        </Document>
      </div>
    </div>
  );
}