"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function Admin() {
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    const res = await fetch("/api/admin/get-requests", {
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    const data = await res.json();
    setRequests(data);
  };

  const approve = async (request) => {
  console.log("Approve button clicked");

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const res = await fetch("/api/admin/approve", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({
      requestId: request.id,
    }),
  });

  const data = await res.json();
  console.log("Approve response:", data);

  loadRequests();
};
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