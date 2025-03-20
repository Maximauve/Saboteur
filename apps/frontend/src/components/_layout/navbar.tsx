import React, { Fragment } from "react";

import AuthModal from "@/components/modal/auth-modal";
import useAuth from "@/hooks/use-auth";
import useModal from "@/hooks/use-modal";
import useTranslation from "@/hooks/use-translation";
import { useLogoutMutation } from "@/services/auth";

export default function Navbar(): React.JSX.Element {
  const { user } = useAuth();
  const { isOpen, closeModal, openModal } = useModal();
  const i18n = useTranslation();
  const [ logout ] = useLogoutMutation();

  return (
    <div>
      {user === null ? (
        <Fragment>
          <button className="absolute right-0 m-3 px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg shadow-md transition duration-300 ease-in-out hover:bg-blue-600"
            onClick={openModal}
          >
            {i18n.t("auth.login.title")}
          </button>
          <AuthModal isVisible={isOpen} onClose={closeModal} />
        </Fragment>
      ) : (
        <Fragment>
          <button className="absolute right-0 m-3 px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg shadow-md transition duration-300 ease-in-out hover:bg-blue-600"
            onClick={logout}
          >
            {i18n.t("auth.logout")}
          </button>
        </Fragment>
      )}
    </div>
  );
}
