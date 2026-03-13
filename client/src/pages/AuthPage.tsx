import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser, signupUser } from "@/services/api";

const AuthPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (isLogin) {
        const payload = new FormData();
        payload.append("username", email);
        payload.append("password", password);

        const res = await loginUser(payload);
        localStorage.setItem("token", res.data.access_token);
        localStorage.setItem("user", JSON.stringify(res.data.user));
        navigate("/");
        return;
      }

      await signupUser({ email, password });
      setIsLogin(true);
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
        <h1 className="text-xl font-bold mb-2">Admin Authentication</h1>
        <p className="text-sm text-slate-400 mb-6">
          {isLogin ? "Sign in to access dashboard" : "Create an admin user"}
        </p>

        <form className="space-y-4" onSubmit={onSubmit}>
          <div>
            <label className="block text-xs mb-1 text-slate-300">Email</label>
            <input
              type="email"
              required
              className="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-2"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs mb-1 text-slate-300">Password</label>
            <input
              type="password"
              required
              className="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-2"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error ? <p className="text-sm text-red-400">{error}</p> : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-emerald-500 text-black font-semibold py-2 disabled:opacity-60"
          >
            {loading ? "Please wait..." : isLogin ? "Login" : "Sign up"}
          </button>
        </form>

        <button
          className="mt-4 text-sm text-slate-300 underline"
          onClick={() => setIsLogin((v) => !v)}
        >
          {isLogin ? "Need an account? Sign up" : "Already have an account? Login"}
        </button>
      </div>
    </div>
  );
};

export default AuthPage;
