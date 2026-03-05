import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { ModalLayout } from "@/layouts/ModalLayout";
import {
  UserPlus,
  Shield,
  Eye,
  Trash2,
  Mail,
  ShieldCheck,
  Search,
  Users,
  TriangleAlert,
  ChevronRight,
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Utility for tailwind class merging */
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const AdminManagement = () => {
  const [email, setEmail] = useState("");
  const [accessLevel, setAccessLevel] = useState<"full_access" | "view_only">(
    "view_only",
  );
  const [authorizedList, setAuthorizedList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<any>(null);

  // 🛠️ FETCH: Always pull fresh data
  const fetchAuthorizedAdmins = async () => {
    const { data, error } = await supabase
      .from("authorized_admins")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error) setAuthorizedList(data || []);
  };

  useEffect(() => {
    fetchAuthorizedAdmins();
  }, []);

  // 🛠️ INLINE UPDATE: Direct role change with icon usage
  const handleInlineUpdate = async (targetEmail: string, newLevel: string) => {
    setLoading(true);

    const { error } = await supabase
      .from("authorized_admins")
      .update({ access_level: newLevel })
      .eq("email", targetEmail);

    if (error) {
      alert("Failed to update access level.");
    } else {
      fetchAuthorizedAdmins();
    }
    setLoading(false);
  };

  const handleAuthorize = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase
      .from("authorized_admins")
      .insert([{ email, access_level: accessLevel }]);

    if (error) alert("Error: User already exists.");
    else {
      setEmail("");
      fetchAuthorizedAdmins();
    }
    setLoading(false);
  };

  const removeAuthorization = async () => {
    if (!selectedAdmin) return;
    setLoading(true);

    const { error } = await supabase
      .from("authorized_admins")
      .delete()
      .eq("email", selectedAdmin.email);

    if (error) {
      alert("Failed to revoke permissions.");
    } else {
      setAuthorizedList((prev) =>
        prev.filter((a) => a.email !== selectedAdmin.email),
      );
      setIsDeleteModalOpen(false);
    }
    setLoading(false);
  };

  const filteredAdmins = authorizedList.filter((admin) =>
    admin.email.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-white dark:bg-[#09090b] p-6 md:p-12 transition-colors">
      {/* DELETE MODAL */}
      <ModalLayout
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Revoke Permissions"
        size="max-w-md"
      >
        <div className="space-y-6">
          <div className="p-4 bg-red-50 dark:bg-red-500/5 rounded-xl border border-red-100 dark:border-red-500/20 flex items-start gap-3">
            <TriangleAlert className="text-red-600 mt-0.5" size={18} />
            <p className="text-sm text-zinc-800 dark:text-zinc-300 leading-relaxed">
              Are you sure you want to remove{" "}
              <span className="font-bold text-black dark:text-white">
                {selectedAdmin?.email}
              </span>
              ? This user will lose all dashboard access immediately.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className="flex-1 h-11 rounded-lg font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white text-sm transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={removeAuthorization}
              disabled={loading}
              className="flex-1 h-11 rounded-lg font-semibold bg-red-600 text-white hover:bg-red-700 text-sm transition-all shadow-sm"
            >
              {loading ? "Revoking..." : "Confirm Revocation"}
            </button>
          </div>
        </div>
      </ModalLayout>

      <div className="max-w-6xl mx-auto space-y-10">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-cyan-600 dark:text-cyan-500 font-bold text-xs uppercase tracking-[0.2em] mb-2">
              <ShieldCheck size={14} /> System Security
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              Admin Access Management
            </h1>
          </div>

          <div className="flex items-center gap-4 bg-zinc-50 dark:bg-zinc-900 px-5 py-4 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <div className="text-right">
              <p className="text-[10px] uppercase font-bold text-zinc-400 tracking-widest">
                Active Accounts
              </p>
              <p className="text-2xl font-bold text-zinc-900 dark:text-white">
                {authorizedList.length}
              </p>
            </div>
            <div className="h-8 w-[1px] bg-zinc-200 dark:bg-zinc-800" />
            <Users className="text-zinc-400" size={20} />
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* ENROLLMENT FORM */}
          <section className="lg:col-span-4">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-2xl shadow-sm space-y-6">
              <div className="flex items-center gap-2 font-bold text-zinc-900 dark:text-zinc-100 text-sm uppercase tracking-tight">
                <UserPlus size={18} className="text-cyan-600" /> Enroll New
                Administrator
              </div>

              <form onSubmit={handleAuthorize} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-500 tracking-wide">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                    <input
                      type="email"
                      placeholder="admin@supplychain.ai"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full h-11 pl-10 pr-4 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:border-cyan-500 transition-all text-sm font-medium outline-none"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-500 tracking-wide">
                    Permission Level
                  </label>
                  <select
                    value={accessLevel}
                    onChange={(e) => setAccessLevel(e.target.value as any)}
                    className="w-full h-11 px-3 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-sm font-medium outline-none focus:border-cyan-500"
                  >
                    <option value="view_only">Read-Only Observer</option>
                    <option value="full_access">Full System Admin</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={loading || !email}
                  className="w-full h-11 bg-zinc-950 dark:bg-zinc-50 text-white dark:text-zinc-900 font-bold rounded-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2 text-xs uppercase tracking-widest shadow-sm"
                >
                  {loading ? "Registering..." : "Authorize Identity"}
                  {!loading && <ChevronRight size={14} />}
                </button>
              </form>
            </div>
          </section>

          {/* LIST SECTION */}
          <section className="lg:col-span-8 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-400">
                Authorized Personnel
              </h3>
              <div className="relative flex-1 max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Filter by email..."
                  className="w-full h-9 pl-9 pr-4 rounded-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-medium outline-none focus:border-cyan-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="grid gap-2.5">
              {filteredAdmins.map((admin) => (
                <div
                  key={admin.email}
                  className="group flex items-center justify-between p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl hover:border-zinc-400 transition-all duration-200"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 flex items-center justify-center group-hover:bg-cyan-500/10 transition-colors">
                      <Mail
                        size={18}
                        className="text-zinc-400 group-hover:text-cyan-600 transition-colors"
                      />
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 leading-none">
                        {admin.email}
                      </p>

                      <div className="flex items-center gap-2 mt-2">
                        {/* 🛡️ USING SHIELD/EYE ICONS TO RESOLVE TS ERRORS */}
                        <div className="flex items-center gap-1.5">
                          {admin.access_level === "full_access" ? (
                            <Shield
                              size={10}
                              className="text-orange-600 dark:text-orange-400"
                            />
                          ) : (
                            <Eye
                              size={10}
                              className="text-blue-600 dark:text-blue-400"
                            />
                          )}
                          <select
                            value={admin.access_level}
                            onChange={(e) =>
                              handleInlineUpdate(admin.email, e.target.value)
                            }
                            disabled={loading}
                            className={cn(
                              "px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider border outline-none cursor-pointer transition-all",
                              admin.access_level === "full_access"
                                ? "bg-orange-50 dark:bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-100 dark:border-orange-500/20"
                                : "bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-100 dark:border-blue-500/20",
                            )}
                          >
                            <option value="full_access">Full Admin</option>
                            <option value="view_only">Read Only</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setSelectedAdmin(admin);
                        setIsDeleteModalOpen(true);
                      }}
                      className="p-2.5 rounded-lg text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
