"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";

export default function Admin() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      router.push("/login");
      return;
    }

    loadRequests(session);
  };

  const loadRequests = async (session) => {
    const res = await fetch("/api/admin/get-requests", {
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    const data = await res.json();
    setRequests(data);
    setLoading(false);
  };

  const approve = async (request) => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) return;

    await fetch("/api/admin/approve", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        requestId: request.id,
      }),
    });

    loadRequests(session);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-10">
      <h1 className="text-2xl mb-6">Pending Payments</h1>

      {requests.length === 0 && <p>No pending requests</p>}

      {requests.map((req) => (
        <div key={req.id} className="border p-4 mb-4 rounded-lg">
          <p>User ID: {req.user_id}</p>
          <p>Note ID: {req.note_id}</p>

          <button
            onClick={() => approve(req)}
            className="mt-3 px-4 py-2 bg-green-600 rounded"
          >
            Approve
          </button>
        </div>
      ))}
    </div>
  );
}