import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import useTranslation from '@/hooks/use-translation';
import { useCreateRoomMutation } from '@/services/room';

export default function HomePage(): React.JSX.Element {
  const i18n = useTranslation();
  const navigate = useNavigate();
  const [createRoomApi] = useCreateRoomMutation();
  const [code, setCode] = useState<string>('');
  const [isCodeValid, setIsCodeValid] = useState<boolean>(false);

  const createRoom = () => {
    createRoomApi().then(({ data }) => {
      return navigate(`/room/${data?.code}`);
    }).catch((error: Error) => {
      console.error(error);
    });
  };

  useEffect(() => {
    if (code.length > 0) {
      if (/^\d{6}$/.test(code)) {
        setIsCodeValid(true);
      } else {
        setIsCodeValid(false);
      }
    }
  }, [code]);

  const handleJoinRoom = () => {
    if (!isCodeValid) {
      return;
    }
    navigate(`/room/${code}`);
  };

  return (
    <div className="main place-content-center flex flex-col h-screen px-10">
      <p className="text-3xl w-full h-40 flex justify-center items-center">{i18n.t('home.title')}</p>

      <div className='flex flex-col justify-start items-center mb-10'>
        <p>{i18n.t('home.enterCode')}</p>
        <input className='border border-gray-400 rounded-md py-2 px-1' type="text" onChange={(event) => setCode(event.target.value)} />
        {(!isCodeValid && code.length > 6) && <p className='text-red-500'>{i18n.t('home.invalidCode')}</p>}
        <button className='m-3 px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg shadow-md transition duration-300 ease-in-out hover:bg-blue-600 disabled:bg-gray-500 disabled:hover:bg-gray-500'
          onClick={handleJoinRoom}
          disabled={!isCodeValid}
        >
          {i18n.t('home.joinRoom')}
        </button>

      </div>

      <div className="flex justify-center">
        <button className='m-3 px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg shadow-md transition duration-300 ease-in-out hover:bg-blue-600' onClick={createRoom}>
          {i18n.t('home.createRoom')}
        </button>
      </div>
    </div>
  
  );
}
