"use client";

export const dynamic = "force-dynamic";

import { useSearchParams } from "next/navigation";
import { Document, Page, pdfjs } from "react-pdf";
import { useState } from "react";

import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc =
  "https://unpkg.com/pdfjs-dist@5.4.296/build/pdf.worker.min.mjs";

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
          {Array.from(
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