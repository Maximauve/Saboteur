// src/components/protected-route.tsx
import React, { Fragment, useContext } from "react";

import AuthModal from "@/components/modal/auth-modal";
import { authContext } from "@/context/auth/auth-provider";
import useModal from "@/hooks/use-modal";

interface ProtectedRouteProperties {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProperties) {
  const { user } = useContext(authContext);
  const { closeModal } = useModal();

  if (user?.loading) {
    return <div>Chargement...</div>;
  }

  return (
    <Fragment>
      <AuthModal isVisible={user === null} onClose={closeModal} notClosable/>
      {children}
    </Fragment>
  );
}
