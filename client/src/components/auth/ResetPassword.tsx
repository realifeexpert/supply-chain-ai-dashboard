import React, { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";
import { Lock, CheckCircle } from "lucide-react";

export const ResetPassword = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    // This updates the password for the currently "logged in" user
    // (the email link automatically creates a temporary session)
    const { error: resetError } = await supabase.auth.updateUser({
      password: password,
    });

    if (resetError) {
      setError(resetError.message);
    } else {
      setSuccess(true);
      setTimeout(() => navigate("/login"), 3000);
    }
    setLoading(false);
  };

  if (success) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-card border border-border p-10 rounded-[2.5rem] text-center space-y-4">
          <CheckCircle className="text-cyan-600 h-12 w-12 mx-auto" />
          <h2 className="text-2xl font-black uppercase tracking-tighter">
            Password_Updated
          </h2>
          <p className="text-muted-foreground text-sm">
            Redirecting to login...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6">
      <form
        onSubmit={handleReset}
        className="max-w-md w-full bg-card border border-border p-8 rounded-[2.5rem] space-y-6 shadow-xl"
      >
        <h1 className="text-3xl font-black uppercase tracking-tighter italic text-center">
          Set_New_Password
        </h1>
        {error && (
          <p className="text-destructive text-xs font-bold bg-destructive/10 p-3 rounded-xl">
            {error}
          </p>
        )}

        <div className="space-y-4">
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="password"
              placeholder="New Password"
              className="w-full h-14 pl-12 bg-background border border-border rounded-2xl outline-none focus:ring-2 ring-cyan-500/20"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="password"
              placeholder="Confirm New Password"
              className="w-full h-14 pl-12 bg-background border border-border rounded-2xl outline-none focus:ring-2 ring-cyan-500/20"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
        </div>

        <button
          disabled={loading}
          className="w-full h-14 bg-cyan-600 hover:bg-cyan-500 text-white font-black uppercase tracking-widest rounded-2xl transition-all"
        >
          {loading ? "Updating..." : "Update Password"}
        </button>
      </form>
    </div>
  );
};
