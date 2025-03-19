import { type ApiErrorResponse } from "@saboteur/api/src/domain/model/error";
import { type LoginDto, type RegisterDto } from "@saboteur/api/src/infrastructure/controllers/auth/auth-dto";
import React, { Fragment, useCallback, useEffect, useState } from "react";
import { toast, type ToastContent } from 'react-toastify';

import FullModal from "@/components/modal/full-modal";
import useTranslation from "@/hooks/use-translation";
import { type WordingKey } from "@/i18n/i18n-service";
import { useLoginMutation, useRegisterMutation } from '@/services/auth';

interface Properties {
  isVisible: boolean;
  onClose: () => void;
  notClosable?: boolean;
}

const loginTexts: Record<string, WordingKey> = {
  title: "auth.login.title",
  button: "auth.login.noAccount",
  submit: "auth.login.submit",
};

const registerTexts: Record<string, WordingKey> = {
  title: "auth.register.title",
  button: "auth.register.alreadyAccount",
  submit: "auth.register.submit",
};

export default function AuthModal({ isVisible, onClose, notClosable = false }: Properties): React.JSX.Element {
  const [isRegisterMode, setIsRegisterMode] = useState<boolean>(false);
  const [texts, setTexts] = useState<Record<string, WordingKey>>(loginTexts);
  const [invalidMessage, setInvalidMessage] = useState<string>('');

  const [ username, setUsername ] = useState<string>('');
  const [ email, setEmail ] = useState<string>('');
  const [ password, setPassword ] = useState<string>('');
  const [ confirmPassword, setConfirmPassword ] = useState<string>('');


  const i18n = useTranslation();
  const [ register ] = useRegisterMutation();
  const [ login ] = useLoginMutation();

  useEffect(() => {
    if (isRegisterMode) {
      setTexts(registerTexts);
    } else {
      setTexts(loginTexts);
    }
  }, [isRegisterMode]);

  useEffect(() => {
    if (isRegisterMode) {
      if (confirmPassword !== '' && password !== confirmPassword) {
        setInvalidMessage(i18n.t("validation.passwordMissmatch"));
      } else {
        setInvalidMessage('');
      }
    } else {
      setInvalidMessage('');
    }
  }, [isRegisterMode, password, confirmPassword]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (isRegisterMode) {
      const values: RegisterDto = {
        username,
        email,
        password,
      };
      try {
        const formData = new FormData();
        Object.entries(values).forEach(([key, value]) => {
          if (key !== 'image') {
            formData.append(key, String(value));
          }
        });
        await register(values).unwrap();
        closeModal();
        toast.success(i18n.t("notify.register.success") as ToastContent<string>, {
          position: "top-right",
          autoClose: 3000,
        });
      } catch (error) {
        toast.error((error as ApiErrorResponse)?.data?.message as ToastContent<string>, {
          position: "top-right",
          autoClose: 3000,
        });
      };
    } else {
      const values: LoginDto = {
        email,
        password,
      };
      try {
        await login(values).unwrap();
        closeModal();
        toast.success(i18n.t("notify.login.success") as ToastContent<string>, {
          position: "top-right",
          autoClose: 3000,
        });
      } catch (error) {
        console.warn('error', error);
        toast.error((error as ApiErrorResponse)?.data?.message as ToastContent<string>, {
          position: "top-right",
          autoClose: 3000,
        });
      };
    }
  };

  const handleModeChange = () => {
    setUsername('');
    setPassword('');
    setConfirmPassword('');
    setIsRegisterMode((previous) => !previous);
  };

  const closeModal = useCallback(() => {
    setUsername('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    onClose();
  }, [onClose]);

  return (
    <FullModal isVisible={isVisible} onClose={closeModal} notClosable={notClosable} title={texts.title}>
      <div className="w-[25vw] px-3 flex flex-row justify-end">
        <button onClick={handleModeChange} className="text-gray-500 underline text-xs">{i18n.t(texts.button)}</button>
      </div>
      <form onSubmit={handleSubmit} className="px-4 w-3/4 pb-8">
        <div className="flex flex-col gap-4">
          { isRegisterMode ? (
            <Fragment>
              <label className="flex flex-col gap-2" key={"username"}>
                {i18n.t("auth.username")}
                <input className="border border-gray-400 rounded-sm pl-4 py-2" type="text" onChange={(error) => setUsername(error.target.value)} />
              </label>
              <label className="flex flex-col gap-2" key={"email"}>
                {i18n.t("auth.email")}
                <input className="border border-gray-400 rounded-sm pl-4 py-2" type="email" onChange={(error) => setEmail(error.target.value)} />
              </label>
              <label className="flex flex-col gap-2" key={"register.password"}>
                {i18n.t("auth.password")}
                <input className="border border-gray-400 rounded-sm pl-4 py-2" type="password" onChange={(error) => setPassword(error.target.value)}/>
              </label>
              <label className="flex flex-col gap-2" key={"confirmPassword"}>
                {i18n.t("auth.confirmPassword")}
                <input className="border border-gray-400 rounded-sm pl-4 py-2" type="password" onChange={(error) => setConfirmPassword(error.target.value)} />
              </label>
              {invalidMessage && <p className="text-red-500 text-xs">{invalidMessage}</p>}
            </Fragment>
          ) : (
            <Fragment>
              <label className="flex flex-col gap-2" key={"email"}>
                {i18n.t("auth.email")}
                <input className="border border-gray-400 rounded-sm pl-4 py-2" type="email" onChange={(error) => setEmail(error.target.value)}/>
              </label>
              <label className="flex flex-col gap-2" key={"login.password"}>
                {i18n.t("auth.password")}
                <input className="border border-gray-400 rounded-sm pl-4 py-2" type="password" onChange={(error) => setPassword(error.target.value)}/>
              </label>
            </Fragment>
          )}
        </div>
        <div className="w-full flex justify-center items-center mt-4">
          <button className="rounded-md bg-blue-600 py-1 px-3 text-white hover:scale-105 active:scale-100 disabled:bg-gray-500 flex flex-row gap-2"
            disabled={invalidMessage !== ''}
            type="submit"
          >
            {i18n.t(texts.submit)}
          </button>
        </div>
      </form>
    </FullModal>
  );
}
