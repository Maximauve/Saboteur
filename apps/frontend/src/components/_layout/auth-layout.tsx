// src/components/protected-route.tsx
import React, { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";

import { authContext } from "@/context/auth/auth-provider";

interface ProtectedRouteProperties {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProperties) {
  const { user } = useContext(authContext);
  const location = useLocation();

  if (user?.loading) {
    return <div>Chargement...</div>;
  }

  if (!user) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
