import React, { Fragment } from "react";
import AuthModal from "@/components/modal/auth-modal";
import useModal from "@/hooks/use-modal";
import useAuth from "@/hooks/use-auth";

export default function Navbar(): React.JSX.Element {
  const { user } = useAuth();
  const { isOpen, closeModal, openModal } = useModal();

  return (
    <main>
      {user === null ? (
        <Fragment>
          <button onClick={openModal}>Se connecter</button>
          <AuthModal isVisible={isOpen} onClose={closeModal} />
        </Fragment>
      ) : null}
    </main>
  );
}
