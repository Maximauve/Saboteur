import { createBrowserRouter } from "react-router-dom";

import ProtectedRoute from "@/components/_layout/auth-layout";
import MainLayout from "@/components/_layout/main-layout";
import { GameProvider } from "@/context/game/game-provider";
import { SocketProvider } from "@/context/socket/socket-provider";
import HomePage from "@/router/pages/home-page";
import Room from "@/router/pages/room";

const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout/>,
    children: [
      {
        path: "",
        element: <HomePage/>
      },
      {
        path: "/room/:code",
        element: <ProtectedRoute>
          <SocketProvider>
            <GameProvider>
              <Room />
            </GameProvider>
          </SocketProvider>
        </ProtectedRoute>
      }
    ]
  },
]);

export default router;
