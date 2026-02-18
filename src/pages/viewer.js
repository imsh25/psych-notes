import { useRouter } from "next/router";
import { useState } from "react";
import dynamic from "next/dynamic";

// Disable SSR completely
const Document = dynamic(
  () => import("react-pdf").then((mod) => mod.Document),
  { ssr: false }
);

const Page = dynamic(
  () => import("react-pdf").then((mod) => mod.Page),
  { ssr: false }
);

export default function Viewer() {
  const router = useRouter();
  const { url } = router.query;

  const [numPages, setNumPages] = useState(null);

  if (!url) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        Loading...
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