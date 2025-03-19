import React, { Fragment } from "react";

import AuthModal from "@/components/modal/auth-modal";
import useAuth from "@/hooks/use-auth";
import useModal from "@/hooks/use-modal";

export default function Navbar(): React.JSX.Element {
  const { user } = useAuth();
  const { isOpen, closeModal, openModal } = useModal();

  return (
    <div>
      {user === null ? (
        <Fragment>
          <button className="absolute right-0 m-3 px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg shadow-md transition duration-300 ease-in-out hover:bg-blue-600" onClick={openModal}>Se connecter</button>
          <AuthModal isVisible={isOpen} onClose={closeModal} />
        </Fragment>
      ) : null}
    </div>
  );
}
