import { type RoomResponse } from "@saboteur/api/src/domain/adapters/roomResponse";

import { baseApi } from "@/services/base";

export const roomApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createRoom: builder.mutation<RoomResponse, void>({
      query: () => ({
        url: "/room",
        method: "POST",
      }),
    }),
  }),
});

export const { useCreateRoomMutation } = roomApi;
