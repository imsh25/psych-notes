"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function Dashboard() {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [notes, setNotes] = useState([]);
  const [purchased, setPurchased] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [viewingId, setViewingId] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.push("/login");
        return;
      }

      setUser(session.user);

      const { data: notesData } = await supabase
        .from("notes")
        .select("*");

      const { data: purchaseData } = await supabase
        .from("purchases")
        .select("note_id")
        .eq("user_id", session.user.id);

      setNotes(notesData || []);
      setPurchased(purchaseData?.map((p) => p.note_id) || []);
      setLoading(false);
    };

    loadData();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const handleBuy = async (noteId) => {
  setProcessingId(noteId);

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const res = await fetch("/api/create-payment-request", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({ noteId }),
  });

  if (res.ok) {
    alert(
      "Payment request submitted.\n\nSend payment screenshot to admin for approval."
    );
  } else {
    alert("Something went wrong.");
  }

  setProcessingId(null);
};

  const handleView = async (noteId) => {
  setViewingId(noteId);

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    alert("Not authenticated");
    setViewingId(null);
    return;
  }

  const res = await fetch("/api/get-note", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${session.access_token}`,
    "x-device-id": localStorage.getItem("device_id"),
  },
  body: JSON.stringify({ noteId }),
});
  if (!res.ok) {
    alert("Access denied");
    setViewingId(null);
    return;
  }

  const blob = await res.blob();
  const fileURL = URL.createObjectURL(blob);

  router.push(`/viewer?url=${encodeURIComponent(fileURL)}`);

  setViewingId(null);
};

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white px-6 py-8">

      {/* Header */}
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="text-gray-400 text-sm">{user?.email}</p>
        </div>

        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition"
        >
          Logout
        </button>
      </div>

      {/* Notes */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {notes.map((note) => {
          const isPurchased = purchased.includes(note.id);

          return (
            <motion.div
              key={note.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6 shadow-lg"
            >
              <h2 className="text-lg font-semibold mb-2">
                {note.title}
              </h2>

              <p className="text-gray-400 text-sm mb-4">
                {note.description}
              </p>

              <div className="flex justify-between items-center">
                {isPurchased ? (
                  <span className="text-green-400 text-sm font-medium">
                    ✔ Purchased
                  </span>
                ) : (
                  <span className="text-indigo-400 font-medium">
                    ₹{note.price}
                  </span>
                )}

                {isPurchased ? (
                  <button
                    onClick={() => handleView(note.id)}
                    disabled={viewingId === note.id}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg transition disabled:opacity-50"
                  >
                    {viewingId === note.id ? "Opening..." : "View"}
                  </button>
                ) : (
                  <button
                    onClick={() => handleBuy(note.id)}
                    disabled={processingId === note.id}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition disabled:opacity-50"
                  >
                    {processingId === note.id
                      ? "Processing..."
                      : "Buy"}
                  </button>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Full Screen Viewer Loader */}
      {viewingId && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-white mt-4">
              Opening secure viewer...
            </p>
          </div>
        </div>
      )}
    </div>
  );
}