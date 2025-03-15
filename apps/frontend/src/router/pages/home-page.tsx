import React from 'react';
import { useNavigate } from 'react-router-dom';

import useTranslation from '@/hooks/use-translation';
import { useCreateRoomMutation } from '@/services/room';

export default function HomePage(): React.JSX.Element {
  const i18n = useTranslation();
  const navigate = useNavigate();
  const [createRoomApi] = useCreateRoomMutation();

  const createRoom = () => {
    createRoomApi().then(({ data }) => {
      return navigate(`/room/${data?.code}`);
    }).catch((error: Error) => {
      console.error(error);
    });
  };

  return (
    <div className="main place-content-center flex flex-col h-screen px-10">
      <p className="text-3xl w-full h-40 flex justify-center items-center">{i18n.t('home.title')}</p>

      <div className="flex justify-center">
        <button className='m-3 px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg shadow-md transition duration-300 ease-in-out hover:bg-blue-600' onClick={createRoom}> Creer une room </button>
      </div>
    </div>
  
  );
}
