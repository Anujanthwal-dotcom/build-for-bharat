"use client";

import { useEffect, useState } from "react";
import { Settings, Trash2, AlertTriangle, Check } from "lucide-react";
import { useSession, signOut } from "next-auth/react";

type Depth = "summary" | "standard" | "deep";
type Theme = "dark" | "system";

const DEPTH_OPTIONS: { value: Depth; label: string; desc: string }[] = [
  { value: "summary", label: "Summary", desc: "High-level topics only" },
  { value: "standard", label: "Standard", desc: "Balanced coverage of topics" },
  { value: "deep", label: "Deep Dive", desc: "Maximum detail + sub-topics" },
];

export default function SettingsPage() {
  const { data: session } = useSession();
  const isGuest = Boolean(session?.user?.email?.endsWith("@temp.mindflow.local"));

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmText, setConfirmText] = useState("");

  const [theme, setTheme] = useState<Theme>("dark");
  const [defaultDepth, setDefaultDepth] = useState<Depth>("standard");
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/account/preferences");
        if (!res.ok) return;
        const prefs = await res.json();
        setTheme(prefs.theme === "system" ? "system" : "dark");
        setDefaultDepth(["summary", "deep"].includes(prefs.defaultDepth) ? prefs.defaultDepth : "standard");
      } finally {
        setLoaded(true);
      }
    })();
  }, []);

  useEffect(() => {
    if (!loaded) return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const resolve = () => {
      const useDark = theme === "dark" || (theme === "system" && mq.matches);
      document.documentElement.classList.toggle("dark", useDark);
    };
    resolve();
    if (theme === "system") mq.addEventListener("change", resolve);
    return () => mq.removeEventListener("change", resolve);
  }, [theme, loaded]);

  useEffect(() => {
    if (!loaded) return;
    let cancelled = false;
    const t = setTimeout(async () => {
      setSaving(true);
      try {
        await fetch("/api/account/preferences", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ theme, defaultDepth }),
        });
        if (!cancelled) setSavedAt(Date.now());
      } finally {
        if (!cancelled) setSaving(false);
      }
    }, 400);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [theme, defaultDepth, loaded]);

  const handleDeleteAccount = async () => {
    if (confirmText !== "DELETE") return;
    setIsDeleting(true);
    try {
      const res = await fetch("/api/account/delete", { method: "DELETE" });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Failed to delete account");
      await signOut({ callbackUrl: "/" });
    } catch (error: unknown) {
      console.error(error);
      alert(error instanceof Error ? error.message : "Failed to delete account");
      setIsDeleting(false);
    }
  };

  const handleGuestExit = async () => {
    setIsDeleting(true);
    try {
      await fetch("/api/auth/guest-cleanup", { method: "POST" });
    } catch (error) {
      console.error(error);
    } finally {
      await signOut({ callbackUrl: "/" });
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-8">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
            <Settings className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-white/90 tracking-tight">Settings</h1>
            <p className="text-sm text-muted">
              {isGuest ? "Temporary guest preferences" : "Manage your account preferences"}
            </p>
          </div>
        </div>

        {/* General Settings */}
        <section className="glass p-6 rounded-lg space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-mono uppercase tracking-wider text-muted">General</h2>
            <div className="flex items-center gap-2">
              {saving && <span className="text-xs text-muted">Saving...</span>}
              {!saving && savedAt !== null && (
                <span className="flex items-center gap-1 text-xs text-emerald-400">
                  <Check className="w-3 h-3" /> Saved
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between py-3 border-b border-white/5 gap-4">
            <div>
              <p className="text-sm font-medium text-white/90">Theme</p>
              <p className="text-xs text-muted">Appearance of the app</p>
            </div>
            <div className="flex gap-1 bg-black/40 border border-white/10 rounded-md p-1">
              {(["dark", "system"] as Theme[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setTheme(t)}
                  className={`px-3 py-1 text-xs rounded transition-colors ${
                    theme === t ? "bg-accent text-black font-medium" : "text-muted hover:text-white"
                  }`}
                >
                  {t === "dark" ? "Dark" : "System"}
                </button>
              ))}
            </div>
          </div>

          <div className="py-3">
            <p className="text-sm font-medium text-white/90 mb-1">Default Depth</p>
            <p className="text-xs text-muted mb-3">Default extraction depth used when creating new mindmaps</p>
            <div className="flex flex-col gap-1.5">
              {DEPTH_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setDefaultDepth(option.value)}
                  className={`flex items-center justify-between px-3 py-2 rounded-md border transition-colors text-left ${
                    defaultDepth === option.value
                      ? "border-accent/50 bg-accent/10"
                      : "border-white/10 bg-white/[0.02] hover:bg-white/[0.05]"
                  }`}
                >
                  <div>
                    <p className={`text-sm font-medium ${defaultDepth === option.value ? "text-accent" : "text-white/90"}`}>
                      {option.label}
                    </p>
                    <p className="text-xs text-muted">{option.desc}</p>
                  </div>
                  {defaultDepth === option.value && <Check className="w-4 h-4 text-accent" />}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Danger Zone */}
        <section className={`border rounded-lg overflow-hidden ${
          isGuest ? "border-amber-500/20" : "border-red-500/20"
        }`}>
          <div className={`px-6 py-4 border-b ${
            isGuest ? "bg-amber-500/5 border-amber-500/10" : "bg-red-500/5 border-red-500/10"
          }`}>
            <h2 className={`text-sm font-mono uppercase tracking-wider ${
              isGuest ? "text-amber-400" : "text-red-400"
            }`}>
              {isGuest ? "Guest Session" : "Danger Zone"}
            </h2>
          </div>
          <div className="p-6">
            {isGuest ? (
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-white/90">Exit & Clear Temporary Data</p>
                  <p className="text-xs text-muted mt-1">
                    You are currently using MindFlow in temporary Guest Mode. Purging this session permanently deletes all mindmaps, nodes, and sources created during this visit.
                  </p>
                </div>
                <button
                  onClick={handleGuestExit}
                  disabled={isDeleting}
                  className="shrink-0 flex items-center gap-2 px-4 py-2 text-sm font-medium text-amber-400 border border-amber-500/30 rounded-md hover:bg-amber-500/10 transition-colors disabled:opacity-40"
                >
                  <Trash2 className="w-4 h-4" />
                  {isDeleting ? "Purging..." : "Clear & Exit"}
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-white/90">Delete Account</p>
                    <p className="text-xs text-muted mt-1">
                      Permanently delete your account and all associated data including mindmaps, sources, and settings. This action cannot be undone.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="shrink-0 flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-400 border border-red-500/30 rounded-md hover:bg-red-500/10 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete Account
                  </button>
                </div>

                {showDeleteConfirm && (
                  <div className="mt-6 p-4 bg-red-500/5 border border-red-500/20 rounded-lg space-y-4">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-red-300">Are you absolutely sure?</p>
                        <p className="text-xs text-red-400/70 mt-1">
                          This will permanently delete your account, all your mindmaps, and all associated data. Type <span className="font-mono font-bold text-red-300">DELETE</span> to confirm.
                        </p>
                      </div>
                    </div>
                    <input
                      type="text"
                      value={confirmText}
                      onChange={(e) => setConfirmText(e.target.value)}
                      placeholder='Type "DELETE" to confirm'
                      className="w-full bg-black/40 border border-red-500/30 rounded-md px-3 py-2 text-sm text-white font-mono placeholder:text-muted/50 focus:outline-none focus:border-red-500/60 transition-all"
                    />
                    <div className="flex gap-3">
                      <button
                        onClick={() => {
                          setShowDeleteConfirm(false);
                          setConfirmText("");
                        }}
                        className="px-4 py-2 text-sm text-muted hover:text-white bg-white/5 hover:bg-white/10 rounded-md transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleDeleteAccount}
                        disabled={confirmText !== "DELETE" || isDeleting}
                        className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {isDeleting ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Deleting...
                          </>
                        ) : (
                          "Permanently Delete"
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}