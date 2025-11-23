"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";

interface OutingRequest {
  id: string;
  studentId: string;
  studentName: string;
  parentId: string;
  reason: string;
  startDateTime: number;
  destination: string;
  roomNumber?: string;
  status: string;
  outingType?: string;
  transportMode?: string;
  tukNearHostel?: boolean;
  isEmergency?: boolean;
  emergencyReason?: string;
  createdAt: number;
}

export default function StudentDashboard() {
  const { user, logout } = useAuth();
  const [outings, setOutings] = useState<OutingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    destination: "",
    reason: "",
    startDateTime: "",
    outingType: "home", // 'home' or 'day'
    transportMode: "", // bus | car | tuk | other
    tukNearHostel: false,
    isEmergency: false,
    emergencyReason: "",
    roomNumber: "",
  });
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (user?.uid) {
      fetchOutings();
    }
  }, [user]);

  async function fetchOutings() {
    try {
      const res = await fetch(`/api/outings?userId=${user?.uid}&role=student`);
      if (res.ok) {
        const { outings } = await res.json();
        setOutings(outings);
      }
    } catch (error) {
      console.error("Failed to fetch outings:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");
    // Validation: for day outings (non-emergency) enforce submission at least 24 hours before start
    if (formData.outingType === "day" && !formData.isEmergency) {
      if (!formData.startDateTime) {
        setFormError("Please provide outing start date and time for a day outing (or mark as emergency).");
        return;
      }
      const start = new Date(formData.startDateTime).getTime();
      if (isNaN(start)) {
        setFormError("Invalid start date/time.");
        return;
      }
      const diff = start - Date.now();
      if (diff < 24 * 60 * 60 * 1000) {
        setFormError("For non-emergency day outings please submit at least 24 hours before the start time.");
        return;
      }
    }
    // For day outings, require transport mode and reason
    if (formData.outingType === "day" && !formData.isEmergency) {
      if (!formData.transportMode) {
        setFormError("Please select transport mode for day outing.");
        return;
      }
      if (!formData.reason) {
        setFormError("Please provide a reason/requirement for the day outing.");
        return;
      }
      // Note: return time is not required; return-day enforcement removed
    }
    try {
      const res = await fetch("/api/outings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: user?.uid,
          studentName: user?.name,
          parentId: "parent_placeholder", // In real app, link to student's parent
          destination: formData.destination,
          roomNumber: formData.roomNumber,
          reason: formData.reason,
          startDateTime: formData.startDateTime ? new Date(formData.startDateTime).getTime() : null,
          outingType: formData.outingType,
          transportMode: formData.transportMode,
          tukNearHostel: formData.tukNearHostel,
          isEmergency: formData.isEmergency,
          emergencyReason: formData.emergencyReason,
        }),
      });

      if (res.ok) {
        alert("Outing request submitted!");
        setFormData({ destination: "", reason: "", startDateTime: "", outingType: "home", transportMode: "", tukNearHostel: false, isEmergency: false, emergencyReason: "", roomNumber: "" });
        setShowForm(false);
        fetchOutings();
      }
    } catch (error) {
      alert("Failed to submit request");
    }
  }

  if (!user || user.role !== "student") {
    return (
      <div className="p-4">
        <p>Access denied. Please log in as a student.</p>
        <Link href="/" className="text-blue-500 underline">Back to home</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-slate-900">
      <header className="bg-white dark:bg-slate-800 shadow">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold">Student Dashboard</h1>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">Welcome, {user.name}</p>
          </div>
          <button
            onClick={logout}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="mb-6">
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            {showForm ? "Cancel" : "New Outing Request"}
          </button>
        </div>

        {showForm && (
          <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow mb-6">
            <h2 className="text-lg font-medium mb-4">Request an Outing</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Emergency Section */}
              <div className="p-4 rounded border-l-4 border-red-500 bg-red-50 dark:bg-red-900/10">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.isEmergency}
                    onChange={(e) => setFormData({ ...formData, isEmergency: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="font-semibold text-red-700 dark:text-red-300">Emergency / Urgent</span>
                </label>
                {formData.isEmergency && (
                  <div className="mt-3">
                    <label className="block text-sm font-medium mb-1">Emergency Reason</label>
                    <textarea
                      value={formData.emergencyReason}
                      onChange={(e) => setFormData({ ...formData, emergencyReason: e.target.value })}
                      placeholder="Explain the emergency so staff can respond quickly"
                      className="w-full rounded border px-3 py-2 dark:bg-slate-700"
                      rows={3}
                    />
                  </div>
                )}
              </div>

              {/* Outing Type */}
              <div>
                <label className="block text-sm font-medium mb-2">Outing Type</label>
                <div className="flex items-center gap-4">
                  <label className="inline-flex items-center gap-2">
                    <input
                      type="radio"
                      name="outingType"
                      value="home"
                      checked={formData.outingType === "home"}
                      onChange={() => setFormData({ ...formData, outingType: "home" })}
                    />
                    Home
                  </label>
                  <label className="inline-flex items-center gap-2">
                    <input
                      type="radio"
                      name="outingType"
                      value="day"
                      checked={formData.outingType === "day"}
                      onChange={() => setFormData({ ...formData, outingType: "day" })}
                    />
                    Day Outing
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Destination</label>
                <input
                  type="text"
                  value={formData.destination}
                  onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                  required
                  className="w-full rounded border px-3 py-2 dark:bg-slate-700"
                  placeholder="e.g., Home, Library, Mall"
                />
              </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Room Number</label>
                    <input
                      type="text"
                      value={formData.roomNumber}
                      onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                      required
                      className="w-full rounded border px-3 py-2 dark:bg-slate-700"
                      placeholder="e.g., A-101"
                    />
                  </div>

              {/* Day outing specific fields */}
              {formData.outingType === "day" && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-1">Requirement / Reason</label>
                    <textarea
                      value={formData.reason}
                      onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                      className="w-full rounded border px-3 py-2 dark:bg-slate-700"
                      placeholder="What do you need to do during the day outing?"
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Outing Date & Time</label>
                      <input
                        type="datetime-local"
                        value={formData.startDateTime}
                        onChange={(e) => setFormData({ ...formData, startDateTime: e.target.value })}
                        className="w-full rounded border px-3 py-2 dark:bg-slate-700"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Transport Mode</label>
                    <select
                      value={formData.transportMode}
                      onChange={(e) => setFormData({ ...formData, transportMode: e.target.value })}
                      className="w-full rounded border px-3 py-2 dark:bg-slate-700"
                    >
                      <option value="">Select mode</option>
                      <option value="bus">Bus</option>
                      <option value="car">Car</option>
                      <option value="tuk">Tuk</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  {formData.transportMode === "tuk" && (
                    <div className="p-3 rounded bg-yellow-50 dark:bg-yellow-900/10 border-l-4 border-yellow-400">
                      <p className="text-sm">You selected <strong>Tuk</strong>. When the tuk approaches the hostel premises please inform security or the warden so they can assist with a safe pickup/arrival.</p>
                      <label className="inline-flex items-center gap-2 mt-2">
                        <input
                          type="checkbox"
                          checked={formData.tukNearHostel}
                          onChange={(e) => setFormData({ ...formData, tukNearHostel: e.target.checked })}
                        />
                        <span className="text-sm">I will inform when tuk is near hostel</span>
                      </label>
                    </div>
                  )}
                </>
              )}

              {/* For home outing, allow optional times but don't enforce 24h rule */}
              {formData.outingType === "home" && (
                <div>
                  <label className="block text-sm font-medium mb-1">Planned Start (optional)</label>
                  <input
                    type="datetime-local"
                    value={formData.startDateTime}
                    onChange={(e) => setFormData({ ...formData, startDateTime: e.target.value })}
                    className="w-full rounded border px-3 py-2 dark:bg-slate-700"
                  />
                </div>
              )}

              {formError && (
                <div className="p-3 bg-red-100 text-red-700 rounded">{formError}</div>
              )}

              <button
                type="submit"
                className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Submit Request
              </button>
            </form>
          </div>
        )}

        <div className="bg-white dark:bg-slate-800 rounded-lg shadow">
          <h2 className="text-lg font-medium p-6 border-b border-zinc-200 dark:border-slate-700">
            My Outing Requests
          </h2>

          {loading ? (
            <p className="p-6">Loading...</p>
          ) : outings.length === 0 ? (
            <p className="p-6 text-zinc-600 dark:text-zinc-400">No outing requests yet.</p>
          ) : (
            <div className="divide-y divide-zinc-200 dark:divide-slate-700">
              {outings.map((outing) => (
                <div key={outing.id} className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                        <p className="font-medium">{outing.destination}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-sm text-zinc-600 dark:text-zinc-400">{outing.startDateTime ? new Date(outing.startDateTime).toLocaleString() : ""}</p>
                          {outing.isEmergency && (
                            <span className="text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded">Emergency</span>
                          )}
                          {outing.outingType === "day" && outing.transportMode && (
                            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">{outing.transportMode}</span>
                          )}
                        </div>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">Reason: {outing.reason}</p>
                        {outing.roomNumber && (
                          <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">Room: {outing.roomNumber}</p>
                        )}
                    </div>
                    <span
                      className={`px-3 py-1 rounded text-sm font-medium ${
                        outing.status === "warden_approved"
                          ? "bg-green-100 text-green-800"
                          : outing.status === "parent_approved"
                          ? "bg-blue-100 text-blue-800"
                          : outing.status.includes("rejected")
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {outing.status.replace(/_/g, " ")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
