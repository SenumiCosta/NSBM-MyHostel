"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../contexts/AuthContext";

export default function WardenLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();
  const { login } = useAuth();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      setMessage("");
      // Call actual login API to get user object and token
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role: "warden" }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setMessage(data.error || data.message || "Login failed");
        return;
      }

      // API returns { user, idToken }
      try {
        await login(data.user, data.idToken);
      } catch (e) {
        // fallback: set user directly if login wrapper throws
        login(data.user, data.idToken);
      }

      router.push("/wardens");
    } catch (err) {
      console.error(err);
      setMessage("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-64 bg-white/80 dark:bg-slate-800/80 p-3 rounded-md shadow-sm">
      <div className="mb-2">
        <label className="text-xs text-zinc-600 dark:text-zinc-300">Warden Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="mt-1 w-full rounded border border-zinc-200 px-2 py-1 text-sm dark:bg-slate-900 dark:border-slate-700"
          placeholder="warden@nsbm.lk"
        />
      </div>

      <div className="mb-2">
        <label className="text-xs text-zinc-600 dark:text-zinc-300">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="mt-1 w-full rounded border border-zinc-200 px-2 py-1 text-sm dark:bg-slate-900 dark:border-slate-700"
          placeholder="••••••••"
        />
      </div>

      <div className="flex items-center gap-2">
        <button
          type="submit"
          className="flex-1 text-sm bg-black text-white py-1 rounded disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "Signing in..." : "Warden Login"}
        </button>
      </div>

      {message && <div className="mt-2 text-xs text-zinc-600 dark:text-zinc-300">{message}</div>}
    </form>
  );
}
