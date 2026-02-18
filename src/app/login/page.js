"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function Login() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setLoading(false);
      alert(error.message);
      return;
    }

    const {
      data: { session },
    } = await supabase.auth.getSession();

    // ✅ Create device ID if not exists
    let deviceId = localStorage.getItem("device_id");

    if (!deviceId) {
      deviceId = crypto.randomUUID();
      localStorage.setItem("device_id", deviceId);
    }

    // ✅ Register device session
    await fetch("/api/register-session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ deviceId }),
    });

    setLoading(false);
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-white/10 border border-white/20 rounded-2xl p-8 text-white"
      >
        <h1 className="text-2xl font-semibold text-center mb-6">
          Login
        </h1>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-4 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full mb-6 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white"
        />

        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full py-3 bg-indigo-500 rounded-lg"
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </motion.div>
    </div>
  );
}