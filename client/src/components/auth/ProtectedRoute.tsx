import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Navigate, useLocation } from "react-router-dom";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredAccess?: "full_access" | "view_only";
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredAccess,
}) => {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userAccess, setUserAccess] = useState<string | null>(null);
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      /* Check if a session exists */

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      /* Fetch admin profile from database */

      const { data: profile, error } = await supabase
        .from("admin_profiles")
        .select("role, access_level")
        .eq("id", session.user.id)
        .maybeSingle();

      if (!error && profile) {
        /* Check if user has valid admin access */

        const hasAccess =
          profile.access_level === "full_access" ||
          profile.access_level === "view_only";

        setIsAdmin(hasAccess);
        setUserAccess(profile.access_level);
      } else {
        setIsAdmin(false);
      }

      setLoading(false);
    };

    checkAuth();
  }, []);

  /* Loading screen while authentication check runs */

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="h-8 w-8 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" />
      </div>
    );
  }

  /* Redirect unauthenticated users */

  if (!isAdmin) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  /* Restrict pages that require full_access */

  if (requiredAccess === "full_access" && userAccess === "view_only") {
    return (
      <div className="h-screen flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-4xl font-black uppercase italic text-destructive mb-2">
          Access_Denied
        </h1>
        <p className="text-muted-foreground font-bold text-sm uppercase tracking-widest">
          Your account has View-Only privileges.
        </p>
      </div>
    );
  }

  /* Allow access to protected content */

  return <>{children}</>;
};
